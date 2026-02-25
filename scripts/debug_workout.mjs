import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.VITE_ADMIN_EMAIL || 'stianberg2@gmail.com',
    password: process.argv[2] || 'test'
});

if (authError) {
    console.error('Auth error:', authError.message);
    process.exit(1);
}

const userId = authData.user.id;

// Check the sets table column type
console.log('=== SETS TABLE STRUCTURE ===');
// Try inserting a set with a numeric ID to see what error we get
const { error: testErr } = await supabase
    .from('sets')
    .insert({ id: '12345', exercise_id: '00000000-0000-0000-0000-000000000000', user_id: userId, kg: 0, reps: 0, completed: false });
console.log('Insert numeric-like ID into sets.id:', testErr ? testErr.message : 'OK (unexpected)');

const { error: testErr2 } = await supabase
    .from('sets')
    .insert({ id: 1740000000000, exercise_id: '00000000-0000-0000-0000-000000000000', user_id: userId, kg: 0, reps: 0, completed: false });
console.log('Insert Date.now() number into sets.id:', testErr2 ? testErr2.message : 'OK (unexpected)');

// Check a working workout's set IDs
console.log('\n=== WORKING WORKOUT (Jan 20 "Helkropp A") ===');
const { data: workouts } = await supabase
    .from('workouts')
    .select('id, name, start_time')
    .eq('user_id', userId)
    .order('start_time', { ascending: true });

for (const w of workouts) {
    const { data: exData } = await supabase
        .from('exercises')
        .select('id, name')
        .eq('workout_id', w.id);

    let totalSets = 0;
    let sampleIds = [];
    for (const ex of (exData || [])) {
        const { data: sData } = await supabase.from('sets').select('id').eq('exercise_id', ex.id);
        totalSets += (sData?.length || 0);
        if (sData?.length > 0) {
            sampleIds.push({ exercise: ex.name, setIds: sData.map(s => s.id) });
        }
    }

    const date = new Date(w.start_time).toLocaleDateString('no-NO');
    console.log(`\n${date} - "${w.name}" | ${totalSets} sets`);
    if (sampleIds.length > 0) {
        for (const s of sampleIds.slice(0, 2)) {
            console.log(`  ${s.exercise}: IDs = ${s.setIds.slice(0, 3).join(', ')}`);
        }
    }
}

process.exit(0);
