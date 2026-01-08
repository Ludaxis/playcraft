-- Add missing columns and policies to playcraft_project_assets in an idempotent way

-- Columns
alter table public.playcraft_project_assets
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists display_name text,
  add column if not exists storage_path text,
  add column if not exists public_path text,
  add column if not exists asset_type text,
  add column if not exists category text,
  add column if not exists format text,
  add column if not exists mime_type text,
  add column if not exists file_size integer,
  add column if not exists width integer,
  add column if not exists height integer,
  add column if not exists is_sprite_sheet boolean default false,
  add column if not exists frame_count integer,
  add column if not exists frame_width integer,
  add column if not exists frame_height integer,
  add column if not exists poly_count integer,
  add column if not exists animations jsonb,
  add column if not exists description text,
  add column if not exists tags text[] default '{}',
  add column if not exists updated_at timestamptz default now();

-- Light constraints where possible
do $$
begin
  begin
    alter table public.playcraft_project_assets
      add constraint chk_assets_type_valid
        check (asset_type is null or asset_type in ('2d', '3d', 'audio'));
  exception when duplicate_object then null; end;

  begin
    alter table public.playcraft_project_assets
      add constraint chk_assets_category_valid
        check (category is null or category in ('character','background','ui','item','tile','effect','model','texture','skybox','audio'));
  exception when duplicate_object then null; end;

  begin
    alter table public.playcraft_project_assets
      add constraint chk_assets_sprite_sheet_valid
        check (not is_sprite_sheet or (frame_count is not null and frame_width is not null and frame_height is not null));
  exception when duplicate_object then null; end;
end$$;

-- Indexes
create index if not exists idx_project_assets_project_id on public.playcraft_project_assets(project_id);
create index if not exists idx_project_assets_user_id on public.playcraft_project_assets(user_id);
create index if not exists idx_project_assets_category on public.playcraft_project_assets(category);
create index if not exists idx_project_assets_type on public.playcraft_project_assets(asset_type);
create index if not exists idx_project_assets_tags on public.playcraft_project_assets using gin(tags);

-- Enable RLS
alter table public.playcraft_project_assets enable row level security;

-- RLS policies using workspace-aware helpers
drop policy if exists "Assets select" on public.playcraft_project_assets;
drop policy if exists "Assets modify" on public.playcraft_project_assets;
drop policy if exists "Users can view own project assets" on public.playcraft_project_assets;
drop policy if exists "Users can insert own project assets" on public.playcraft_project_assets;
drop policy if exists "Users can update own project assets" on public.playcraft_project_assets;
drop policy if exists "Users can delete own project assets" on public.playcraft_project_assets;

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

-- Trigger to update updated_at
create or replace function public.update_project_assets_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_project_assets_updated_at on public.playcraft_project_assets;
create trigger update_project_assets_updated_at
  before update on public.playcraft_project_assets
  for each row execute function public.update_project_assets_updated_at();
