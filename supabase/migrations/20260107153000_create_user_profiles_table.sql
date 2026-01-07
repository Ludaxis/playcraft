-- Create the user_profiles table (idempotent)
create table if not exists public.user_profiles (
  id uuid not null references auth.users on delete cascade,
  updated_at timestamptz,
  full_name text,
  avatar_url text,
  company text,
  website text,
  github_username text,
  linkedin_profile text,
  twitter_handle text,
  bio text,
  address text,
  passport_nationality text,
  allergies text[],
  diet_preference text[],

  primary key (id)
);

-- Set up Row Level Security (RLS)
alter table public.user_profiles
  enable row level security;

drop policy if exists "Public profiles are viewable by everyone." on public.user_profiles;
drop policy if exists "Users can insert their own profile." on public.user_profiles;
drop policy if exists "Users can update their own profile." on public.user_profiles;

create policy "Public profiles are viewable by everyone." on public.user_profiles
  for select using (true);

create policy "Users can insert their own profile." on public.user_profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile." on public.user_profiles
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile for new users.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Set up Storage!
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

drop policy if exists "Avatar images are publicly accessible." on storage.objects;
drop policy if exists "Anyone can upload an avatar." on storage.objects;
drop policy if exists "Anyone can update their own avatar." on storage.objects;

create policy "Avatar images are publicly accessible." on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Anyone can upload an avatar." on storage.objects
  for insert with check (bucket_id = 'avatars');

create policy "Anyone can update their own avatar." on storage.objects
  for update using (auth.uid() = owner) with check (bucket_id = 'avatars');
