-- Add project assets table for 2D and 3D game assets
-- Supports PNG, JPG, WebP, GIF, SVG (2D) and GLB, GLTF (3D)

create table if not exists public.playcraft_project_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.playcraft_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Asset identification
  name text not null,
  display_name text,
  storage_path text not null,
  public_path text not null,

  -- Classification
  asset_type text not null check (asset_type in ('2d', '3d', 'audio')),
  category text not null check (category in (
    'character', 'background', 'ui', 'item', 'tile', 'effect',
    'model', 'texture', 'skybox', 'audio'
  )),
  format text not null,

  -- Technical metadata
  mime_type text not null,
  file_size integer not null,
  width integer,
  height integer,

  -- Sprite sheet configuration
  is_sprite_sheet boolean default false,
  frame_count integer,
  frame_width integer,
  frame_height integer,

  -- 3D model metadata
  poly_count integer,
  animations jsonb,

  -- AI context
  description text,
  tags text[] default '{}',

  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Constraints
  constraint valid_sprite_sheet check (
    not is_sprite_sheet or (frame_count is not null and frame_width is not null and frame_height is not null)
  ),
  constraint valid_dimensions check (
    asset_type != '2d' or (width is not null and height is not null)
  )
);

-- Indexes for efficient queries
create index if not exists idx_project_assets_project_id
  on public.playcraft_project_assets(project_id);

create index if not exists idx_project_assets_user_id
  on public.playcraft_project_assets(user_id);

create index if not exists idx_project_assets_category
  on public.playcraft_project_assets(category);

create index if not exists idx_project_assets_type
  on public.playcraft_project_assets(asset_type);

create index if not exists idx_project_assets_tags
  on public.playcraft_project_assets using gin(tags);

-- Enable RLS
alter table public.playcraft_project_assets enable row level security;

-- RLS policies
create policy "Users can view own project assets"
  on public.playcraft_project_assets for select
  using (user_id = auth.uid() or auth.role() = 'service_role');

create policy "Users can insert own project assets"
  on public.playcraft_project_assets for insert
  with check (user_id = auth.uid() or auth.role() = 'service_role');

create policy "Users can update own project assets"
  on public.playcraft_project_assets for update
  using (user_id = auth.uid() or auth.role() = 'service_role')
  with check (user_id = auth.uid() or auth.role() = 'service_role');

create policy "Users can delete own project assets"
  on public.playcraft_project_assets for delete
  using (user_id = auth.uid() or auth.role() = 'service_role');

-- Trigger to update updated_at
create or replace function public.update_project_assets_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_project_assets_updated_at
  before update on public.playcraft_project_assets
  for each row execute function public.update_project_assets_updated_at();

-- Function to get asset manifest for a project
create or replace function public.get_project_asset_manifest(p_project_id uuid)
returns jsonb as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'projectId', p_project_id,
    'totalCount', count(*),
    'totalSize', coalesce(sum(file_size), 0),
    'assets', coalesce(jsonb_agg(
      jsonb_build_object(
        'id', id,
        'name', name,
        'displayName', display_name,
        'publicPath', public_path,
        'assetType', asset_type,
        'category', category,
        'format', format,
        'width', width,
        'height', height,
        'isSpriteSheet', is_sprite_sheet,
        'frameCount', frame_count,
        'frameWidth', frame_width,
        'frameHeight', frame_height,
        'animations', animations,
        'description', description,
        'tags', tags
      ) order by category, name
    ), '[]'::jsonb)
  ) into result
  from public.playcraft_project_assets
  where project_id = p_project_id;

  return result;
end;
$$ language plpgsql security definer;

-- Function to get assets by category
create or replace function public.get_project_assets_by_category(
  p_project_id uuid,
  p_category text
)
returns setof public.playcraft_project_assets as $$
begin
  return query
  select *
  from public.playcraft_project_assets
  where project_id = p_project_id
    and category = p_category
  order by name;
end;
$$ language plpgsql security definer;
