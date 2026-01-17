-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CLEANUP (Drop existing tables if needing a fresh start, optional)
-- DROP TABLE IF EXISTS public.sett CASCADE;
-- DROP TABLE IF EXISTS public.exercises CASCADE;
-- DROP TABLE IF EXISTS public.workouts CASCADE;
-- DROP TABLE IF EXISTS public.programs CASCADE;
-- DROP TABLE IF EXISTS public.custom_exercises CASCADE;

-- 2. CREATE TABLES

-- Workouts Table (Relational)
CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercises Table (Relational, linked to Workout)
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- Added for RLS
    name TEXT NOT NULL,
    type TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sets Table (Relational, linked to Exercise)
CREATE TABLE IF NOT EXISTS public.sett (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- Added for RLS
    kg NUMERIC NOT NULL DEFAULT 0,
    reps INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    order_index INTEGER DEFAULT 0
);

-- Programs Table (JSONB Storage for flexibility)
CREATE TABLE IF NOT EXISTS public.programs (
    id BIGINT PRIMARY KEY, -- Using BigInt because frontend uses Date.now() for IDs
    user_id UUID NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Exercises Library (JSONB Storage)
CREATE TABLE IF NOT EXISTS public.custom_exercises (
    id TEXT PRIMARY KEY, -- Using string ID from frontend
    user_id UUID NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sett ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_exercises ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES

-- Workouts
DROP POLICY IF EXISTS "Users can view their own workouts" ON workouts;
CREATE POLICY "Users can view their own workouts" ON workouts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own workouts" ON workouts;
CREATE POLICY "Users can insert their own workouts" ON workouts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own workouts" ON workouts;
CREATE POLICY "Users can update their own workouts" ON workouts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own workouts" ON workouts;
CREATE POLICY "Users can delete their own workouts" ON workouts FOR DELETE USING (auth.uid() = user_id);

-- Exercises
DROP POLICY IF EXISTS "Users can view their own exercises" ON exercises;
CREATE POLICY "Users can view their own exercises" ON exercises FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own exercises" ON exercises;
CREATE POLICY "Users can insert their own exercises" ON exercises FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own exercises" ON exercises;
CREATE POLICY "Users can update their own exercises" ON exercises FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own exercises" ON exercises;
CREATE POLICY "Users can delete their own exercises" ON exercises FOR DELETE USING (auth.uid() = user_id);

-- Sets
DROP POLICY IF EXISTS "Users can view their own sets" ON sett;
CREATE POLICY "Users can view their own sets" ON sett FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own sets" ON sett;
CREATE POLICY "Users can insert their own sets" ON sett FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own sets" ON sett;
CREATE POLICY "Users can update their own sets" ON sett FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own sets" ON sett;
CREATE POLICY "Users can delete their own sets" ON sett FOR DELETE USING (auth.uid() = user_id);

-- Programs
DROP POLICY IF EXISTS "Users can view their own programs" ON programs;
CREATE POLICY "Users can view their own programs" ON programs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own programs" ON programs;
CREATE POLICY "Users can insert their own programs" ON programs FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own programs" ON programs;
CREATE POLICY "Users can update their own programs" ON programs FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own programs" ON programs;
CREATE POLICY "Users can delete their own programs" ON programs FOR DELETE USING (auth.uid() = user_id);

-- Custom Exercises (Global Read, Owner Write)
DROP POLICY IF EXISTS "Users can view their own custom exercises" ON custom_exercises;
DROP POLICY IF EXISTS "Users can view all custom exercises" ON custom_exercises;

-- ALLOW ALL USERS TO SEE ALL EXERCISES
CREATE POLICY "Users can view all custom exercises" ON custom_exercises FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own custom exercises" ON custom_exercises;
CREATE POLICY "Users can insert their own custom exercises" ON custom_exercises FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own custom exercises" ON custom_exercises;
CREATE POLICY "Users can update their own custom exercises" ON custom_exercises FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own custom exercises" ON custom_exercises;
CREATE POLICY "Users can delete their own custom exercises" ON custom_exercises FOR DELETE USING (auth.uid() = user_id);
