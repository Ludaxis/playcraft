-- Fix recursive RLS on workspace_members by avoiding self-referential policies

-- Drop existing policies
drop policy if exists "Workspace members select" on public.workspace_members;
drop policy if exists "Workspace members modify" on public.workspace_members;

-- Recreate with non-recursive checks (owner sees all, members see themselves)
create policy "Workspace members select"
  on public.workspace_members for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.workspaces w
      where w.id = workspace_members.workspace_id
        and w.owner_id = auth.uid()
    )
  );

create policy "Workspace members modify"
  on public.workspace_members for all
  using (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_members.workspace_id
        and w.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_members.workspace_id
        and w.owner_id = auth.uid()
    )
  );

-- Optional: ensure owner membership stays active/owner role for integrity
update public.workspace_members wm
set role = 'owner', status = 'active'
from public.workspaces w
where wm.workspace_id = w.id and wm.user_id = w.owner_id;
