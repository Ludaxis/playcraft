-- Create assets table used by the app; avoids 404s when polling assets

create table if not exists public.playcraft_project_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.playcraft_projects(id) on delete cascade,
  category text,
  name text,
  url text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_assets_project on public.playcraft_project_assets(project_id);

-- Enable RLS
alter table public.playcraft_project_assets enable row level security;

-- Policies: viewers can read, editors/owners can write, service_role allowed
drop policy if exists "Assets select" on public.playcraft_project_assets;
drop policy if exists "Assets modify" on public.playcraft_project_assets;

create policy "Assets select"
  on public.playcraft_project_assets for select
  using (
    public.user_can_access_project(project_id)
    or auth.role() = 'service_role'
  );

create policy "Assets modify"
  on public.playcraft_project_assets for all
  using (
    public.user_can_edit_project(project_id)
    or auth.role() = 'service_role'
  )
  with check (
    public.user_can_edit_project(project_id)
    or auth.role() = 'service_role'
  );
