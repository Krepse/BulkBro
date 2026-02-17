-- Seed Default Programs (Automatic Version)
-- This version automatically uses the first user in your database
-- Run this entire script in Supabase SQL Editor

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the first user ID from auth.users
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found in database';
  END IF;
  
  -- Insert default programs
  INSERT INTO public.programs (id, user_id, data, is_default, updated_at)
  VALUES 
  (
    1001,
    v_user_id,
    '{
      "id": 1001,
      "navn": "Økt A - Nedre Kropp & Horisontalt",
      "ovelser": [
        {"navn": "Knebøy", "type": "Stang", "sets": 4, "reps": "6-8", "rest": "3 min", "notes": "Hovedøvelse - gå tungt, fokus på dybde og teknikk"},
        {"navn": "Brystpress Flat", "type": "Stang", "sets": 3, "reps": "8-10", "rest": "2 min", "notes": "Horisontalt push - trekk skulderblad sammen"},
        {"navn": "Roing", "type": "Stang", "sets": 3, "reps": "8-10", "rest": "2 min", "notes": "Horisontalt pull - squeeze skulderblad på toppen"},
        {"navn": "Rumensk Markløft", "type": "Stang", "sets": 3, "reps": "10-12", "rest": "2 min", "notes": "Hamstrings & posterior chain - føl strekken"},
        {"navn": "Facepulls", "type": "Kabel", "sets": 3, "reps": "12-15", "rest": "90 sek", "notes": "Bakre skuldre - viktig for skulderbalanse"},
        {"navn": "Biceps Curl", "type": "Manualer", "sets": 3, "reps": "10-12", "rest": "90 sek", "notes": "Direkte biceps-arbeid - kontrollert bevegelse"},
        {"navn": "Planke", "type": "Egenvekt", "sets": 3, "reps": "30-60s", "rest": "60 sek", "notes": "Core stabilitet - hold rett linje"}
      ],
      "isDefault": true
    }'::jsonb,
    true,
    NOW()
  ),
  (
    1002,
    v_user_id,
    '{
      "id": 1002,
      "navn": "Økt B - Posterior Chain & Vertikalt",
      "ovelser": [
        {"navn": "Markløft", "type": "Stang", "sets": 4, "reps": "5-6", "rest": "3 min", "notes": "Hovedøvelse - gå tungt, hold ryggen flat"},
        {"navn": "Skulderpress", "type": "Stang", "sets": 3, "reps": "8-10", "rest": "2 min", "notes": "Vertikalt push - press rett opp"},
        {"navn": "Nedtrekk", "type": "Kabel", "sets": 3, "reps": "8-10", "rest": "2 min", "notes": "Vertikalt pull - trekk til øvre bryst"},
        {"navn": "Beinpress", "type": "Maskin", "sets": 3, "reps": "10-12", "rest": "2 min", "notes": "Ekstra benvolum - ikke løft rumpa"},
        {"navn": "Lateral Raise", "type": "Manualer", "sets": 3, "reps": "12-15", "rest": "90 sek", "notes": "Skulderbredde - lett vekt, streng form"},
        {"navn": "Triceps Pushdown", "type": "Kabel", "sets": 3, "reps": "10-12", "rest": "90 sek", "notes": "Direkte triceps-arbeid - hold albuer stille"},
        {"navn": "Bencurl", "type": "Maskin", "sets": 3, "reps": "10-12", "rest": "90 sek", "notes": "Ekstra hamstrings - squeeze på toppen"}
      ],
      "isDefault": true
    }'::jsonb,
    true,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    data = EXCLUDED.data,
    is_default = EXCLUDED.is_default,
    updated_at = EXCLUDED.updated_at;
    
  RAISE NOTICE 'Successfully seeded % default programs for user %', 2, v_user_id;
END $$;
