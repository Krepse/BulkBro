-- Create a table to store Strava tokens linked to Supabase users
create table if not exists user_integrations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  provider text not null check (provider in ('strava')),
  access_token text not null,
  refresh_token text not null,
  expires_at bigint not null,
  athlete_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table user_integrations enable row level security;

-- Create Policy: Users can only see their own integrations
create policy "Users can view own integrations"
  on user_integrations for select
  using (auth.uid() = user_id);

-- Create Policy: Users can insert their own integrations
create policy "Users can insert own integrations"
  on user_integrations for insert
  with check (auth.uid() = user_id);

-- Create Policy: Users can update their own integrations
create policy "Users can update own integrations"
  on user_integrations for update
  using (auth.uid() = user_id);

-- Create Policy: Users can delete their own integrations
create policy "Users can delete own integrations"
  on user_integrations for delete
  using (auth.uid() = user_id);
