// Alternative migration script using fetch to Supabase REST API
// This attempts to use the service role if available, otherwise provides manual instructions

import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

async function runMigrationViaAPI() {
    console.log('🚀 Attempting to run migration via Supabase API...\n');

    // The SQL we want to execute
    const migrationSQL = 'ALTER TABLE public.sett ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ;';

    console.log('📝 Migration SQL:');
    console.log(migrationSQL);
    console.log('');

    // Try to execute via Supabase's query endpoint
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                query: migrationSQL
            })
        });

        console.log('Response status:', response.status);
        const text = await response.text();
        console.log('Response:', text);

        if (response.ok) {
            console.log('\n✅ Migration might have succeeded!');
        } else {
            throw new Error(`HTTP ${response.status}: ${text}`);
        }
    } catch (error) {
        console.error('\n❌ Automatic migration failed:', error.message);
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 MANUAL MIGRATION REQUIRED');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('Please follow these steps:\n');
        console.log('1. Open Supabase Dashboard:');
        console.log(`   ${supabaseUrl.replace('//', '//app.')}/project/_/sql\n`);
        console.log('2. Click "New query" button\n');
        console.log('3. Copy and paste this SQL:\n');
        console.log('   ' + migrationSQL + '\n');
        console.log('4. Click "Run" or press Ctrl+Enter\n');
        console.log('5. You should see "Success. No rows returned"\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Open the SQL editor in browser
        const sqlEditorUrl = `${supabaseUrl.replace('https://', 'https://app.').replace('.supabase.co', '.supabase.co/project/_/sql')}`;
        console.log('🌐 Opening SQL Editor in browser...\n');

        const { exec } = await import('child_process');
        exec(`start ${sqlEditorUrl}`, (error) => {
            if (error) {
                console.log('Could not open browser automatically.');
                console.log('Please open this URL manually:', sqlEditorUrl);
            }
        });
    }
}

runMigrationViaAPI();
