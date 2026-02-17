import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });
dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const adminEmail = process.env.VITE_ADMIN_EMAIL;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase credentials not found in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function fetchPrograms() {
    try {
        console.log('🔐 For å hente programmene dine, må jeg logge inn på Supabase.\n');
        console.log(`Admin email fra .env: ${adminEmail}\n`);

        const email = await question('Email (trykk Enter for å bruke admin email): ') || adminEmail;
        const password = await question('Passord: ');

        console.log('\n🔄 Logger inn...');

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim()
        });

        if (authError) {
            console.error('❌ Login feilet:', authError.message);
            rl.close();
            return;
        }

        console.log('✅ Innlogget som:', authData.user.email);
        console.log('\n🔍 Henter programmer...\n');

        const { data, error } = await supabase
            .from('programs')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching programs:', error);
            rl.close();
            return;
        }

        if (!data || data.length === 0) {
            console.log('📭 Ingen programmer funnet i databasen');
            console.log('\n💡 Tips: Sjekk at programmene er synkronisert fra appen til Supabase.');
            rl.close();
            return;
        }

        console.log(`✅ Fant ${data.length} program(mer)\n`);
        console.log('='.repeat(80));

        data.forEach((row, index) => {
            const program = row.data;
            console.log(`\n📋 PROGRAM ${index + 1}: ${program.navn}`);
            console.log('-'.repeat(80));
            console.log(`ID: ${program.id}`);
            console.log(`Antall øvelser: ${program.ovelser?.length || 0}`);
            console.log(`\nØvelser:`);

            program.ovelser?.forEach((ex, i) => {
                console.log(`  ${i + 1}. ${ex.navn} (${ex.type || 'Ukjent type'})`);
                console.log(`     Sett: ${ex.sett?.length || 0} sett`);
                if (ex.sett && ex.sett.length > 0) {
                    ex.sett.forEach((set, j) => {
                        console.log(`       Set ${j + 1}: ${set.kg}kg x ${set.reps} reps`);
                    });
                }
            });
            console.log('='.repeat(80));
        });

        // Output as JSON for easy parsing
        console.log('\n\n📄 JSON OUTPUT (kopier dette):\n');
        console.log(JSON.stringify(data.map(row => row.data), null, 2));

        rl.close();

    } catch (err) {
        console.error('❌ Uventet feil:', err);
        rl.close();
    }
}

fetchPrograms();
