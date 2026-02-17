/**
 * Automated Default Programs Seeder
 * This script automatically inserts default programs using Supabase Service Role Key
 * No user interaction required!
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const DEFAULT_PROGRAMS = [
    {
        id: 1001,
        navn: 'Økt A - Nedre Kropp & Horisontalt',
        ovelser: [
            { navn: 'Knebøy', type: 'Stang', sets: 4, reps: '6-8', rest: '3 min', notes: 'Hovedøvelse - gå tungt, fokus på dybde og teknikk' },
            { navn: 'Brystpress Flat', type: 'Stang', sets: 3, reps: '8-10', rest: '2 min', notes: 'Horisontalt push - trekk skulderblad sammen' },
            { navn: 'Roing', type: 'Stang', sets: 3, reps: '8-10', rest: '2 min', notes: 'Horisontalt pull - squeeze skulderblad på toppen' },
            { navn: 'Rumensk Markløft', type: 'Stang', sets: 3, reps: '10-12', rest: '2 min', notes: 'Hamstrings & posterior chain - føl strekken' },
            { navn: 'Facepulls', type: 'Kabel', sets: 3, reps: '12-15', rest: '90 sek', notes: 'Bakre skuldre - viktig for skulderbalanse' },
            { navn: 'Biceps Curl', type: 'Manualer', sets: 3, reps: '10-12', rest: '90 sek', notes: 'Direkte biceps-arbeid - kontrollert bevegelse' },
            { navn: 'Planke', type: 'Egenvekt', sets: 3, reps: '30-60s', rest: '60 sek', notes: 'Core stabilitet - hold rett linje' }
        ],
        isDefault: true
    },
    {
        id: 1002,
        navn: 'Økt B - Posterior Chain & Vertikalt',
        ovelser: [
            { navn: 'Markløft', type: 'Stang', sets: 4, reps: '5-6', rest: '3 min', notes: 'Hovedøvelse - gå tungt, hold ryggen flat' },
            { navn: 'Skulderpress', type: 'Stang', sets: 3, reps: '8-10', rest: '2 min', notes: 'Vertikalt push - press rett opp' },
            { navn: 'Nedtrekk', type: 'Kabel', sets: 3, reps: '8-10', rest: '2 min', notes: 'Vertikalt pull - trekk til øvre bryst' },
            { navn: 'Beinpress', type: 'Maskin', sets: 3, reps: '10-12', rest: '2 min', notes: 'Ekstra benvolum - ikke løft rumpa' },
            { navn: 'Lateral Raise', type: 'Manualer', sets: 3, reps: '12-15', rest: '90 sek', notes: 'Skulderbredde - lett vekt, streng form' },
            { navn: 'Triceps Pushdown', type: 'Kabel', sets: 3, reps: '10-12', rest: '90 sek', notes: 'Direkte triceps-arbeid - hold albuer stille' },
            { navn: 'Bencurl', type: 'Maskin', sets: 3, reps: '10-12', rest: '90 sek', notes: 'Ekstra hamstrings - squeeze på toppen' }
        ],
        isDefault: true
    }
];

async function seedDefaultPrograms() {
    try {
        console.log('🚀 Starting automated seed...\n');

        // Fixed fallback user ID since auth.users query often fails for anon keys
        const fallbackUserId = '481f8723-d5c2-44d3-8582-fd352631679';
        console.log(`📝 Using user ID: ${fallbackUserId}`);

        await insertPrograms(fallbackUserId);

    } catch (error) {
        console.error('❌ Unexpected script error:', error);
        process.exit(1);
    }
}

async function insertPrograms(userId) {
    const programsToInsert = DEFAULT_PROGRAMS.map(p => ({
        id: p.id,
        user_id: userId,
        data: p,
        is_default: true,
        updated_at: new Date().toISOString()
    }));

    console.log(`\n📦 Attempting to upsert ${DEFAULT_PROGRAMS.length} default programs to "programs" table...`);

    const { data, error, status, statusText } = await supabase
        .from('programs')
        .upsert(programsToInsert, { onConflict: 'id' });

    if (error) {
        console.error('❌ Supabase Error:', JSON.stringify(error, null, 2));
        console.error(`Status: ${status} (${statusText})`);
        process.exit(1);
    }

    console.log('✅ Successfully seeded default programs!\n');
    console.log('Programs:');
    DEFAULT_PROGRAMS.forEach(p => {
        console.log(`  ✓ ${p.navn} (${p.ovelser.length} exercises)`);
    });
    console.log('\n🎉 Done! All users can now see these programs in the app!');
}

seedDefaultPrograms();
