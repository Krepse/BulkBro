-- Insert Default Programs for User: 481f8723-d5c2-44d3-8582-fd352631679
-- Copy and paste this entire script into Supabase SQL Editor and run it

INSERT INTO public.programs (id, user_id, data, is_default, updated_at)
VALUES 
(
  1001,
  '481f8723-d5c2-44d3-8582-fd352631679',
  '{"id": 1001, "navn": "Økt A - Nedre Kropp & Horisontalt", "ovelser": [{"navn": "Knebøy", "type": "Stang", "sets": 4, "reps": "6-8", "rest": "3 min", "notes": "Hovedøvelse - gå tungt, fokus på dybde og teknikk"}, {"navn": "Brystpress Flat", "type": "Stang", "sets": 3, "reps": "8-10", "rest": "2 min", "notes": "Horisontalt push - trekk skulderblad sammen"}, {"navn": "Roing", "type": "Stang", "sets": 3, "reps": "8-10", "rest": "2 min", "notes": "Horisontalt pull - squeeze skulderblad på toppen"}, {"navn": "Rumensk Markløft", "type": "Stang", "sets": 3, "reps": "10-12", "rest": "2 min", "notes": "Hamstrings & posterior chain - føl strekken"}, {"navn": "Facepulls", "type": "Kabel", "sets": 3, "reps": "12-15", "rest": "90 sek", "notes": "Bakre skuldre - viktig for skulderbalanse"}, {"navn": "Biceps Curl", "type": "Manualer", "sets": 3, "reps": "10-12", "rest": "90 sek", "notes": "Direkte biceps-arbeid - kontrollert bevegelse"}, {"navn": "Planke", "type": "Egenvekt", "sets": 3, "reps": "30-60s", "rest": "60 sek", "notes": "Core stabilitet - hold rett linje"}], "isDefault": true}'::jsonb,
  true,
  NOW()
),
(
  1002,
  '481f8723-d5c2-44d3-8582-fd352631679',
  '{"id": 1002, "navn": "Økt B - Posterior Chain & Vertikalt", "ovelser": [{"navn": "Markløft", "type": "Stang", "sets": 4, "reps": "5-6", "rest": "3 min", "notes": "Hovedøvelse - gå tungt, hold ryggen flat"}, {"navn": "Skulderpress", "type": "Stang", "sets": 3, "reps": "8-10", "rest": "2 min", "notes": "Vertikalt push - press rett opp"}, {"navn": "Nedtrekk", "type": "Kabel", "sets": 3, "reps": "8-10", "rest": "2 min", "notes": "Vertikalt pull - trekk til øvre bryst"}, {"navn": "Beinpress", "type": "Maskin", "sets": 3, "reps": "10-12", "rest": "2 min", "notes": "Ekstra benvolum - ikke løft rumpa"}, {"navn": "Lateral Raise", "type": "Manualer", "sets": 3, "reps": "12-15", "rest": "90 sek", "notes": "Skulderbredde - lett vekt, streng form"}, {"navn": "Triceps Pushdown", "type": "Kabel", "sets": 3, "reps": "10-12", "rest": "90 sek", "notes": "Direkte triceps-arbeid - hold albuer stille"}, {"navn": "Bencurl", "type": "Maskin", "sets": 3, "reps": "10-12", "rest": "90 sek", "notes": "Ekstra hamstrings - squeeze på toppen"}], "isDefault": true}'::jsonb,
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET 
  data = EXCLUDED.data,
  is_default = EXCLUDED.is_default,
  updated_at = EXCLUDED.updated_at;
