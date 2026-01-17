-- BulkBro Relational Schema

-- 1. Workouts Table
create table public.workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Exercises Table (Instances of exercises within a workout)
create table public.exercises (
  id uuid default gen_random_uuid() primary key,
  workout_id uuid references public.workouts(id) on delete cascade not null,
  name text not null,
  type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Sets Table
create table public.sets (
  id uuid default gen_random_uuid() primary key,
  exercise_id uuid references public.exercises(id) on delete cascade not null,
  kg numeric,
  reps integer,
  completed boolean default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Programs (Keeping existing, simplified or can match relational if desired later)
create table if not exists public.programs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Custom Exercises Library (Definitions)
create table if not exists public.custom_exercises (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- Enable RLS
alter table public.workouts enable row level security;
alter table public.exercises enable row level security;
alter table public.sets enable row level security;
alter table public.programs enable row level security;
alter table public.custom_exercises enable row level security;

-- Policies

-- Workouts
create policy "Users can view their own workouts" on public.workouts for select using (auth.uid() = user_id);
create policy "Users can insert their own workouts" on public.workouts for insert with check (auth.uid() = user_id);
create policy "Users can update their own workouts" on public.workouts for update using (auth.uid() = user_id);
create policy "Users can delete their own workouts" on public.workouts for delete using (auth.uid() = user_id);

-- Exercises (Cascading access via workout ownership is complex in pure RLS without joins, 
-- simplest is to assume if they can insert/select they own it, but better to check workout ownership if possible.
-- For simplicity: we don't store user_id on child tables, so we must check parent. OR we just store user_id on everything for easier RLS.)
-- DECISION: It is often easier to denormalize `user_id` to child tables for RLS performance and simplicity.
-- I will add `user_id` to exercises and sets for robustness.

alter table public.exercises add column user_id uuid references auth.users;
alter table public.sets add column user_id uuid references auth.users;

-- Exercises Policies
create policy "Users can view their own exercises" on public.exercises for select using (auth.uid() = user_id);
create policy "Users can insert their own exercises" on public.exercises for insert with check (auth.uid() = user_id);
create policy "Users can delete their own exercises" on public.exercises for delete using (auth.uid() = user_id);

-- Sets Policies
create policy "Users can view their own sets" on public.sets for select using (auth.uid() = user_id);
create policy "Users can insert their own sets" on public.sets for insert with check (auth.uid() = user_id);
create policy "Users can delete their own sets" on public.sets for delete using (auth.uid() = user_id);
