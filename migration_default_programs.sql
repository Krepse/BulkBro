-- Migration: Add default program support
-- Date: 2026-02-10
-- Description: Adds is_default and template_id fields to programs table

-- Add is_default column to mark default/template programs
ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;

-- Add template_id to track which default program a user program was copied from
ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS template_id BIGINT;

-- Create index for faster queries on default programs
CREATE INDEX IF NOT EXISTS idx_programs_is_default ON public.programs(is_default) WHERE is_default = TRUE;

-- Update RLS policies to allow reading default programs
DROP POLICY IF EXISTS "Users can view default programs" ON programs;
CREATE POLICY "Users can view default programs" 
ON programs FOR SELECT 
USING (auth.uid() = user_id OR is_default = TRUE);

-- Comment on columns
COMMENT ON COLUMN public.programs.is_default IS 'Marks if this is a default/template program available to all users';
COMMENT ON COLUMN public.programs.template_id IS 'References the default program ID this was copied from (if applicable)';
