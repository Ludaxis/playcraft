-- =============================================================================
-- Workspace foundation: tables, RLS, helpers, and project scoping
-- =============================================================================

-- WORKSPACES TABLE
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- WORKSPACE MEMBERS
create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'editor', 'viewer')),
  status text not null default 'active' check (status in ('invited', 'active')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (workspace_id, user_id)
);

create index if not exists idx_workspace_members_user on public.workspace_members(user_id);
create index if not exists idx_workspace_members_workspace on public.workspace_members(workspace_id);

-- WORKSPACE INVITES
create table if not exists public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  role text not null default 'editor' check (role in ('owner', 'admin', 'editor', 'viewer')),
  token text not null unique default gen_random_uuid()::text,
  invited_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz default now()
);

create index if not exists idx_workspace_invites_workspace on public.workspace_invites(workspace_id);
create index if not exists idx_workspace_invites_email on public.workspace_invites(email);

-- TRIGGERS: updated_at on workspaces
create or replace function public.touch_workspaces_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_workspaces_updated_at on public.workspaces;
create trigger trg_workspaces_updated_at
  before update on public.workspaces
  for each row
  execute function public.touch_workspaces_updated_at();

-- TRIGGERS: auto-add owner membership
create or replace function public.handle_new_workspace()
returns trigger as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role, status)
  values (new.id, new.owner_id, 'owner', 'active')
  on conflict (workspace_id, user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_workspace_owner on public.workspaces;
create trigger trg_workspace_owner
  after insert on public.workspaces
  for each row execute function public.handle_new_workspace();

-- Enable RLS
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invites enable row level security;

-- Workspaces policies
drop policy if exists "Workspaces select" on public.workspaces;
drop policy if exists "Workspaces insert" on public.workspaces;
drop policy if exists "Workspaces update" on public.workspaces;
drop policy if exists "Workspaces delete" on public.workspaces;

create policy "Workspaces select"
  on public.workspaces for select
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspaces.id
        and wm.user_id = auth.uid()
        and wm.status = 'active'
    )
  );

create policy "Workspaces insert"
  on public.workspaces for insert
  with check (owner_id = auth.uid());

create policy "Workspaces update"
  on public.workspaces for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Workspaces delete"
  on public.workspaces for delete
  using (owner_id = auth.uid());

-- Workspace members policies
drop policy if exists "Workspace members select" on public.workspace_members;
drop policy if exists "Workspace members modify" on public.workspace_members;

create policy "Workspace members select"
  on public.workspace_members for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id
        and wm.user_id = auth.uid()
        and wm.status = 'active'
        and wm.role in ('owner', 'admin')
    )
  );

create policy "Workspace members modify"
  on public.workspace_members for all
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id
        and wm.user_id = auth.uid()
        and wm.status = 'active'
        and wm.role in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id
        and wm.user_id = auth.uid()
        and wm.status = 'active'
        and wm.role in ('owner', 'admin')
    )
  );

-- Workspace invites policies
drop policy if exists "Workspace invites select" on public.workspace_invites;
drop policy if exists "Workspace invites modify" on public.workspace_invites;

create policy "Workspace invites select"
  on public.workspace_invites for select
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_invites.workspace_id
        and wm.user_id = auth.uid()
        and wm.status = 'active'
        and wm.role in ('owner', 'admin')
    )
  );

create policy "Workspace invites modify"
  on public.workspace_invites for all
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_invites.workspace_id
        and wm.user_id = auth.uid()
        and wm.status = 'active'
        and wm.role in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_invites.workspace_id
        and wm.user_id = auth.uid()
        and wm.status = 'active'
        and wm.role in ('owner', 'admin')
    )
  );

-- =============================================================================
-- Project schema updates
-- =============================================================================

alter table public.playcraft_projects
  add column if not exists workspace_id uuid references public.workspaces(id) on delete set null;

alter table public.playcraft_projects
  add column if not exists is_starred boolean default false;

create index if not exists idx_projects_workspace_id on public.playcraft_projects(workspace_id);

update public.playcraft_projects set is_starred = false where is_starred is null;

-- =============================================================================
-- Helper functions for project access (after workspace_id exists)
-- =============================================================================

create or replace function public.user_can_access_project(p_project_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.playcraft_projects p
    where p.id = p_project_id
      and (
        p.user_id = auth.uid()
        or (
          p.workspace_id is not null and exists (
            select 1 from public.workspace_members wm
            where wm.workspace_id = p.workspace_id
              and wm.user_id = auth.uid()
              and wm.status = 'active'
          )
        )
      )
  );
$$ language sql stable security definer;

create or replace function public.user_can_edit_project(p_project_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.playcraft_projects p
    where p.id = p_project_id
      and (
        p.user_id = auth.uid()
        or (
          p.workspace_id is not null and exists (
            select 1 from public.workspace_members wm
            where wm.workspace_id = p.workspace_id
              and wm.user_id = auth.uid()
              and wm.status = 'active'
              and wm.role in ('owner', 'admin', 'editor')
          )
        )
      )
  );
$$ language sql stable security definer;

-- Update RLS for playcraft_projects
drop policy if exists "Users can view accessible projects" on public.playcraft_projects;
drop policy if exists "Users can insert own projects" on public.playcraft_projects;
drop policy if exists "Users can update own projects" on public.playcraft_projects;
drop policy if exists "Users can delete own projects" on public.playcraft_projects;

create policy "Users can view accessible projects"
  on public.playcraft_projects for select
  using (
    user_id = auth.uid()
    or (workspace_id is not null and exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = playcraft_projects.workspace_id
        and wm.user_id = auth.uid()
        and wm.status = 'active'
    ))
    or (status = 'published' and is_public = true)
  );

create policy "Users can insert accessible projects"
  on public.playcraft_projects for insert
  with check (
    user_id = auth.uid()
    or (
      workspace_id is not null and exists (
        select 1 from public.workspace_members wm
        where wm.workspace_id = playcraft_projects.workspace_id
          and wm.user_id = auth.uid()
          and wm.status = 'active'
          and wm.role in ('owner', 'admin', 'editor')
      )
    )
  );

create policy "Users can update accessible projects"
  on public.playcraft_projects for update
  using (
    user_id = auth.uid()
    or (
      workspace_id is not null and exists (
        select 1 from public.workspace_members wm
        where wm.workspace_id = playcraft_projects.workspace_id
          and wm.user_id = auth.uid()
          and wm.status = 'active'
          and wm.role in ('owner', 'admin', 'editor')
      )
    )
  )
  with check (
    user_id = auth.uid()
    or (
      workspace_id is not null and exists (
        select 1 from public.workspace_members wm
        where wm.workspace_id = playcraft_projects.workspace_id
          and wm.user_id = auth.uid()
          and wm.status = 'active'
          and wm.role in ('owner', 'admin', 'editor')
      )
    )
  );

create policy "Users can delete accessible projects"
  on public.playcraft_projects for delete
  using (
    user_id = auth.uid()
    or (
      workspace_id is not null and exists (
        select 1 from public.workspace_members wm
        where wm.workspace_id = playcraft_projects.workspace_id
          and wm.user_id = auth.uid()
          and wm.status = 'active'
          and wm.role in ('owner', 'admin')
      )
    )
  );

-- =============================================================================
-- Recreate dependent policies with workspace-aware helpers
-- =============================================================================

-- playcraft_project_files
drop policy if exists "Users can view own project files" on public.playcraft_project_files;
drop policy if exists "Users can insert own project files" on public.playcraft_project_files;
drop policy if exists "Users can update own project files" on public.playcraft_project_files;
drop policy if exists "Users can delete own project files" on public.playcraft_project_files;

create policy "Users can view project files"
  on public.playcraft_project_files for select
  using (public.user_can_access_project(project_id));

create policy "Users can insert project files"
  on public.playcraft_project_files for insert
  with check (public.user_can_edit_project(project_id));

create policy "Users can update project files"
  on public.playcraft_project_files for update
  using (public.user_can_edit_project(project_id))
  with check (public.user_can_edit_project(project_id));

create policy "Users can delete project files"
  on public.playcraft_project_files for delete
  using (public.user_can_edit_project(project_id));

-- playcraft_project_file_history
drop policy if exists "Users can view own file history" on public.playcraft_project_file_history;
drop policy if exists "Users can insert file history" on public.playcraft_project_file_history;

create policy "Users can view file history"
  on public.playcraft_project_file_history for select
  using (
    public.user_can_access_project(
      (select pf.project_id from public.playcraft_project_files pf where pf.id = file_id)
    )
  );

create policy "Users can insert file history"
  on public.playcraft_project_file_history for insert
  with check (
    public.user_can_edit_project(
      (select pf.project_id from public.playcraft_project_files pf where pf.id = file_id)
    )
  );

-- playcraft_project_memory
drop policy if exists "Users can view own project memory" on public.playcraft_project_memory;
drop policy if exists "Users can insert own project memory" on public.playcraft_project_memory;
drop policy if exists "Users can update own project memory" on public.playcraft_project_memory;
drop policy if exists "Users can delete own project memory" on public.playcraft_project_memory;

create policy "Users can view project memory"
  on public.playcraft_project_memory for select
  using (public.user_can_access_project(project_id));

create policy "Users can insert project memory"
  on public.playcraft_project_memory for insert
  with check (public.user_can_edit_project(project_id));

create policy "Users can update project memory"
  on public.playcraft_project_memory for update
  using (public.user_can_edit_project(project_id))
  with check (public.user_can_edit_project(project_id));

create policy "Users can delete project memory"
  on public.playcraft_project_memory for delete
  using (public.user_can_edit_project(project_id));

-- playcraft_file_hashes
drop policy if exists "Users can view own file hashes" on public.playcraft_file_hashes;
drop policy if exists "Users can insert own file hashes" on public.playcraft_file_hashes;
drop policy if exists "Users can update own file hashes" on public.playcraft_file_hashes;
drop policy if exists "Users can delete own file hashes" on public.playcraft_file_hashes;

create policy "Users can view file hashes"
  on public.playcraft_file_hashes for select
  using (public.user_can_access_project(project_id));

create policy "Users can insert file hashes"
  on public.playcraft_file_hashes for insert
  with check (public.user_can_edit_project(project_id));

create policy "Users can update file hashes"
  on public.playcraft_file_hashes for update
  using (public.user_can_edit_project(project_id))
  with check (public.user_can_edit_project(project_id));

create policy "Users can delete file hashes"
  on public.playcraft_file_hashes for delete
  using (public.user_can_edit_project(project_id));

-- playcraft_conversation_summaries
drop policy if exists "Users can view own conversation summaries" on public.playcraft_conversation_summaries;
drop policy if exists "Users can insert own conversation summaries" on public.playcraft_conversation_summaries;
drop policy if exists "Users can update own conversation summaries" on public.playcraft_conversation_summaries;
drop policy if exists "Users can delete own conversation summaries" on public.playcraft_conversation_summaries;

create policy "Users can view conversation summaries"
  on public.playcraft_conversation_summaries for select
  using (public.user_can_access_project(project_id));

create policy "Users can insert conversation summaries"
  on public.playcraft_conversation_summaries for insert
  with check (public.user_can_edit_project(project_id));

create policy "Users can update conversation summaries"
  on public.playcraft_conversation_summaries for update
  using (public.user_can_edit_project(project_id))
  with check (public.user_can_edit_project(project_id));

create policy "Users can delete conversation summaries"
  on public.playcraft_conversation_summaries for delete
  using (public.user_can_edit_project(project_id));

-- playcraft_code_chunks
drop policy if exists "Users can view chunks for their projects" on public.playcraft_code_chunks;
drop policy if exists "Users can insert chunks for their projects" on public.playcraft_code_chunks;
drop policy if exists "Users can update chunks for their projects" on public.playcraft_code_chunks;
drop policy if exists "Users can delete chunks for their projects" on public.playcraft_code_chunks;

create policy "Users can view code chunks"
  on public.playcraft_code_chunks for select
  using (public.user_can_access_project(project_id));

create policy "Users can insert code chunks"
  on public.playcraft_code_chunks for insert
  with check (public.user_can_edit_project(project_id));

create policy "Users can update code chunks"
  on public.playcraft_code_chunks for update
  using (public.user_can_edit_project(project_id))
  with check (public.user_can_edit_project(project_id));

create policy "Users can delete code chunks"
  on public.playcraft_code_chunks for delete
  using (public.user_can_edit_project(project_id));

-- playcraft_file_index
drop policy if exists "Users can view file index for their projects" on public.playcraft_file_index;
drop policy if exists "Users can manage file index for their projects" on public.playcraft_file_index;

create policy "Users can view file index"
  on public.playcraft_file_index for select
  using (public.user_can_access_project(project_id));

create policy "Users can manage file index"
  on public.playcraft_file_index for all
  using (public.user_can_edit_project(project_id));

-- playcraft_file_dependencies
drop policy if exists "Users can view dependencies for their projects" on public.playcraft_file_dependencies;
drop policy if exists "Users can manage dependencies for their projects" on public.playcraft_file_dependencies;

create policy "Users can view file dependencies"
  on public.playcraft_file_dependencies for select
  using (public.user_can_access_project(project_id));

create policy "Users can manage file dependencies"
  on public.playcraft_file_dependencies for all
  using (public.user_can_edit_project(project_id));

-- playcraft_task_deltas
drop policy if exists "Users can view their project deltas" on public.playcraft_task_deltas;
drop policy if exists "Users can insert their project deltas" on public.playcraft_task_deltas;
drop policy if exists "Users can update their project deltas" on public.playcraft_task_deltas;
drop policy if exists "Users can delete their project deltas" on public.playcraft_task_deltas;

create policy "Users can view task deltas"
  on public.playcraft_task_deltas for select
  using (public.user_can_access_project(project_id));

create policy "Users can insert task deltas"
  on public.playcraft_task_deltas for insert
  with check (public.user_can_edit_project(project_id));

create policy "Users can update task deltas"
  on public.playcraft_task_deltas for update
  using (public.user_can_edit_project(project_id))
  with check (public.user_can_edit_project(project_id));

create policy "Users can delete task deltas"
  on public.playcraft_task_deltas for delete
  using (public.user_can_edit_project(project_id));

-- =============================================================================
-- End of workspace foundation
-- =============================================================================
