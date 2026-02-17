-- Run this SQL in Supabase SQL Editor to add start_time column
-- This is required for the warmup timer fix

ALTER TABLE public.sett ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ;

-- Verify the column was added (optional)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sett' 
ORDER BY ordinal_position;
