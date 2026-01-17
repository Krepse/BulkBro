-- Create tables for BulkBro

-- 1. Custom Exercises
create table public.custom_exercises (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Programs
create table public.programs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Workout History
create table public.workout_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table public.custom_exercises enable row level security;
alter table public.programs enable row level security;
alter table public.workout_history enable row level security;

-- Policies (Allow users to see/edit ONLY their own data)

-- Custom Exercises Policies
create policy "Users can view their own exercises"
  on public.custom_exercises for select
  using (auth.uid() = user_id);

create policy "Users can insert their own exercises"
  on public.custom_exercises for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own exercises"
  on public.custom_exercises for update
  using (auth.uid() = user_id);

create policy "Users can delete their own exercises"
  on public.custom_exercises for delete
  using (auth.uid() = user_id);

-- Programs Policies
create policy "Users can view their own programs"
  on public.programs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own programs"
  on public.programs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own programs"
  on public.programs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own programs"
  on public.programs for delete
  using (auth.uid() = user_id);

-- Workout History Policies
create policy "Users can view their own history"
  on public.workout_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own history"
  on public.workout_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own history"
  on public.workout_history for update
  using (auth.uid() = user_id);

create policy "Users can delete their own history"
  on public.workout_history for delete
  using (auth.uid() = user_id);
