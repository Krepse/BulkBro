/**
 * Seed Default Programs Script
 * Run this once to populate the database with default workout programs
 * 
 * Usage: node seed_default_programs.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Import default programs
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

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Interactive login
async function promptLogin() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (query) => new Promise((resolve) => rl.question(query, resolve));

    console.log('\n🔐 Admin Login Required');
    const email = await question('Email: ');
    const password = await question('Password: ');
    rl.close();

    return { email, password };
}

async function seedPrograms() {
    try {
        // Login
        const { email, password } = await promptLogin();
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError) {
            console.error('❌ Authentication failed:', authError.message);
            process.exit(1);
        }

        console.log('✅ Authenticated as:', authData.user.email);
        const userId = authData.user.id;

        // Seed programs
        console.log(`\n📦 Seeding ${DEFAULT_PROGRAMS.length} default programs...`);

        const programsToInsert = DEFAULT_PROGRAMS.map(p => ({
            id: p.id,
            user_id: userId,
            data: p,
            is_default: true,
            updated_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase
            .from('programs')
            .upsert(programsToInsert);

        if (insertError) {
            console.error('❌ Error seeding programs:', insertError);
            process.exit(1);
        }

        console.log('✅ Successfully seeded default programs!');
        console.log('\nPrograms:');
        DEFAULT_PROGRAMS.forEach(p => {
            console.log(`  - ${p.navn} (${p.ovelser.length} exercises)`);
        });

        // Sign out
        await supabase.auth.signOut();
        console.log('\n✅ Done!');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    }
}

seedPrograms();
