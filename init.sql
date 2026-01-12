
-- Enable RLS
alter table if exists public.properties enable row level security;

-- Create properties table if it doesn't exist
create table if not exists public.properties (
  id uuid not null default gen_random_uuid() primary key,
  owner_id uuid references auth.users not null,
  name text,
  status text check (status in ('draft', 'pending_review', 'active')),
  current_step int default 1,
  total_steps int default 7,
  progress float default 0,
  data jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Enable RLS (again to be sure)
-- Enable RLS (again to be sure)
alter table public.properties enable row level security;

-- Policies
drop policy if exists "Users can view their own properties" on properties;
create policy "Users can view their own properties" on properties
  for select using (auth.uid() = owner_id);

drop policy if exists "Users can insert their own properties" on properties;
create policy "Users can insert their own properties" on properties
  for insert with check (auth.uid() = owner_id);

drop policy if exists "Users can update their own properties" on properties;
create policy "Users can update their own properties" on properties
  for update using (auth.uid() = owner_id);

-- Admin Policy
drop policy if exists "Admins can view all properties" on properties;
create policy "Admins can view all properties" on properties
  for select using (
    (auth.jwt() -> 'user_metadata' ->> 'type') = 'admin'
  );
