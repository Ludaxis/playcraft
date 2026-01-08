import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://playcraft.app',
  'https://www.playcraft.app',
  'https://playcraft.vercel.app',
];

const ALLOWED_PREVIEW_PATTERN = /^https:\/\/playcraft-[a-z0-9-]+\.vercel\.app$/;

function getCorsHeaders(origin: string | null): Record<string, string> {
  let allowedOrigin = ALLOWED_ORIGINS[0];
  if (origin) {
    if (ALLOWED_ORIGINS.includes(origin)) {
      allowedOrigin = origin;
    } else if (ALLOWED_PREVIEW_PATTERN.test(origin)) {
      allowedOrigin = origin;
    }
  }
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, apikey',
    'Access-Control-Max-Age': '86400',
  };
}

interface DeployRequest {
  projectId: string;
  projectName: string;
  files: Record<string, string>;
  customSubdomain?: string;
}

interface DeployResponse {
  success: boolean;
  deploymentId?: string;
  url?: string;
  error?: string;
}

function generateSubdomain(projectName: string, projectId: string): string {
  const cleanName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30);

  const shortId = projectId.slice(0, 8);
  return `${cleanName}-${shortId}`;
}

function generateHtmlBundle(files: Record<string, string>): string {
  // Extract key files
  const indexHtml = files['/index.html'] || files['index.html'] || '';
  const mainTsx = files['/src/main.tsx'] || files['src/main.tsx'] || '';
  const appTsx = files['/src/App.tsx'] || files['src/App.tsx'] || '';
  const indexTsx = files['/src/pages/Index.tsx'] || files['src/pages/Index.tsx'] || '';
  const indexCss = files['/src/index.css'] || files['src/index.css'] || '';

  // For now, return a simple static deployment message
  // In production, this would build with esbuild/vite and return the bundle
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PlayCraft Game</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${indexCss}
  </style>
</head>
<body class="bg-gray-900 text-white min-h-screen flex items-center justify-center">
  <div id="root" class="w-full h-full"></div>
  <script type="module">
    import React from 'https://esm.sh/react@18';
    import ReactDOM from 'https://esm.sh/react-dom@18/client';
    // Game code would be bundled here
    const App = () => {
      return React.createElement('div', {
        className: 'flex flex-col items-center justify-center min-h-screen gap-4'
      }, [
        React.createElement('h1', {
          key: 'title',
          className: 'text-4xl font-bold text-violet-400'
        }, 'PlayCraft Game'),
        React.createElement('p', {
          key: 'desc',
          className: 'text-gray-400'
        }, 'Your game has been deployed!'),
        React.createElement('p', {
          key: 'note',
          className: 'text-sm text-gray-500'
        }, 'Full build coming soon...')
      ]);
    };
    ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
  </script>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request
    const { projectId, projectName, files, customSubdomain }: DeployRequest = await req.json();

    if (!projectId || !projectName || !files) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: projectId, projectName, files' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate subdomain
    const subdomain = customSubdomain || generateSubdomain(projectName, projectId);

    // Generate deployment bundle
    const htmlBundle = generateHtmlBundle(files);

    // Store deployment in Supabase Storage
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const deploymentPath = `${user.id}/${subdomain}/index.html`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('deployments')
      .upload(deploymentPath, htmlBundle, {
        contentType: 'text/html',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to upload deployment' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get public URL
    const { data: publicUrl } = supabaseAdmin.storage
      .from('deployments')
      .getPublicUrl(deploymentPath);

    // Record deployment in database
    const { data: deployment, error: dbError } = await supabaseAdmin
      .from('playcraft_deployments')
      .upsert({
        project_id: projectId,
        user_id: user.id,
        subdomain,
        storage_path: deploymentPath,
        status: 'published',
        published_at: new Date().toISOString(),
      }, {
        onConflict: 'project_id',
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
    }

    // Update project with published URL
    await supabaseAdmin
      .from('playcraft_projects')
      .update({
        status: 'published',
        published_url: publicUrl.publicUrl,
        published_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    const response: DeployResponse = {
      success: true,
      deploymentId: deployment?.id,
      url: publicUrl.publicUrl,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Deploy error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
