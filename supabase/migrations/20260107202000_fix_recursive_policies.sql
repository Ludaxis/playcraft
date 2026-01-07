-- Break recursive RLS between workspaces and workspace_members

-- Workspace members: no references to workspaces
drop policy if exists "Workspace members select" on public.workspace_members;
drop policy if exists "Workspace members modify" on public.workspace_members;

create policy "Workspace members select"
  on public.workspace_members for select
  using (user_id = auth.uid() or auth.role() = 'service_role');

create policy "Workspace members modify"
  on public.workspace_members for all
  using (user_id = auth.uid() or auth.role() = 'service_role')
  with check (user_id = auth.uid() or auth.role() = 'service_role');

-- Workspaces: allow owners and active members (membership check but membership table now independent)
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
      where wm.workspace_id = public.workspaces.id
        and wm.user_id = auth.uid()
        and wm.status = 'active'
    )
    or auth.role() = 'service_role'
  );

create policy "Workspaces insert"
  on public.workspaces for insert
  with check (owner_id = auth.uid() or auth.role() = 'service_role');

create policy "Workspaces update"
  on public.workspaces for update
  using (owner_id = auth.uid() or auth.role() = 'service_role')
  with check (owner_id = auth.uid() or auth.role() = 'service_role');

create policy "Workspaces delete"
  on public.workspaces for delete
  using (owner_id = auth.uid() or auth.role() = 'service_role');
