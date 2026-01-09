import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://playcraft.app',
  'https://playcraft.games',
  'https://www.playcraft.games',
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

interface PromoteRequest {
  projectId: string;
  versionId: string;
}

interface PromoteResponse {
  success: boolean;
  error?: string;
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

    const body: PromoteRequest = await req.json();
    const { projectId, versionId } = body;

    if (!projectId || !versionId) {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch version and ensure it belongs to the project/user
    const { data: version, error: versionError } = await supabase
      .from('publish_versions')
      .select('id, project_id, user_id, storage_prefix, entrypoint')
      .eq('id', versionId)
      .maybeSingle();

    if (versionError || !version || version.project_id !== projectId || version.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Version not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Promote: update project pointer and latest.json
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const admin = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);

    const latestPayload = { versionTag: versionId, path: `${version.storage_prefix}/${version.entrypoint}` };
    await admin.storage
      .from('published-games')
      .upload(
        `${version.user_id}/${version.project_id}/latest.json`,
        new Blob([JSON.stringify(latestPayload)], { type: 'application/json' }),
        { upsert: true, contentType: 'application/json' }
      );

    const { error: projectUpdateError } = await admin
      .from('playcraft_projects')
      .update({
        primary_version_id: versionId,
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (projectUpdateError) {
      return new Response(JSON.stringify({ error: 'Failed to promote version' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response: PromoteResponse = { success: true };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('publish-promote error:', error);
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
