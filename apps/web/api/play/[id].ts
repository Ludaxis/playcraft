import { createClient } from '@supabase/supabase-js';

// Declare process.env for Edge Runtime (env vars are available but not typed)
declare const process: { env: Record<string, string | undefined> };

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const id = url.pathname.split('/').filter(Boolean).pop();

  if (!id) {
    return new Response('Missing project id', { status: 400 });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response('Server configuration error', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

  const { data, error } = await supabase
    .from('playcraft_projects')
    .select('slug, subdomain_url, status')
    .eq('id', id)
    .maybeSingle();

  if (error || !data || data.status !== 'published') {
    return new Response('Not found', { status: 404 });
  }

  const target = data.subdomain_url || (data.slug ? `https://${data.slug}.play.playcraft.games` : null);
  if (!target) {
    return new Response('Not found', { status: 404 });
  }

  return Response.redirect(target, 307);
}
