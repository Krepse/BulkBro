import { supabase } from '../lib/supabase';
import type { Okt, Program, Exercise } from '../types';pes';

// Types for Supabase tables
type SupabaseWorkout = {
    id: string;
    user_id: string;
    data: Okt;
    updated_at: string;
};

type SupabaseProgram = {
    id: string;
    user_id: string;
    data: Program;
    updated_at: string;
};

type SupabaseCustomExercise = {
    id: string;
    user_id: string;
    data: Exercise;
    updated_at: string;
};

// Helper: Convert Local ID to UUID (deterministic or random)
// For existing numeric IDs, we might fallback to random and store the mapping, 
// OR just use uuid for everything moving forward. 
// For simplicity in this plan: New items get UUIDs. Old items might need migration if we want seamless sync.
// BUT, since we store the whole object in 'data', we can keep the internal ID as is, 
// and use a deterministic UUID for the row based on the ID, OR just generate a new UUID for the row.
// Let's rely on the row having its own ID, and we query by matching data->>id if needed,
// OR more simply: We enforce that `id` in the types becomes a string (UUID) over time.

export const supabaseService = {
    // --- Workouts ---
    async syncWorkouts(localWorkouts: Okt[], userId: string) {
        // 1. Fetch all cloud workouts
        const { data: cloudWorkouts, error } = await supabase
            .from('workout_history')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching workouts:', error);
            return { workouts: localWorkouts, merged: false };
        }

        // 2. Map Cloud Items by Inner ID (data.id)
        const cloudMap = new Map<string, SupabaseWorkout>();
        cloudWorkouts?.forEach(row => {
            cloudMap.set(String(row.data.id), row);
        });

        // 3. Prepare Upserts (Local -> Cloud)
        // We want to ensure all local items exist in cloud. 
        // Optimization: Only push if seemingly different? Without timestamps, hard.
        // Safe approach: Upsert all local items.
        const upserts = localWorkouts.map(localW => {
            const match = cloudMap.get(String(localW.id));
            return {
                id: match?.id, // If match exists, use its UUID to update. If undefined, Supabase generates new UUID.
                user_id: userId,
                data: localW,
                updated_at: new Date().toISOString() // Or keep original updated_at if we tracked it
            };
        });

        if (upserts.length > 0) {
            const { error: upsertError } = await supabase
                .from('workout_history')
                .upsert(upserts, { onConflict: 'id' });

            if (upsertError) console.error("Error pushing workouts:", upsertError);
        }

        // 4. Merge (Cloud -> Local)
        // Add items from Cloud that are NOT in Local
        const mergedWorkouts = [...localWorkouts];
        cloudMap.forEach((row, id) => {
            const existsLocally = localWorkouts.find(l => String(l.id) === id);
            if (!existsLocally) {
                mergedWorkouts.push(row.data);
            }
        });

        return { workouts: mergedWorkouts, merged: true };
    },

    async saveWorkout(workout: Okt, userId: string) {
        // Upsert to Supabase
        // We need a stable UUID for the row. 
        // Strategy: Check if exists to get UUID
        const { data: existing } = await supabase
            .from('workout_history')
            .select('id')
            .eq('user_id', userId)
            .eq('data->>id', String(workout.id))
            .maybeSingle();

        const rowId = existing?.id;

        const payload = {
            user_id: userId,
            data: workout,
            updated_at: new Date().toISOString(),
            ...(rowId ? { id: rowId } : {})
        };

        const { error } = await supabase
            .from('workout_history')
            .upsert(payload, { onConflict: 'id' });

        if (error) console.error('Error saving workout:', error);
    },

    async deleteWorkout(workoutId: number | string, userId: string) {
        await supabase
            .from('workout_history')
            .delete()
            .eq('user_id', userId)
            .eq('data->>id', String(workoutId));
    },

    // --- Programs ---
    async syncPrograms(localPrograms: Program[], userId: string) {
        const { data: cloudPrograms, error } = await supabase
            .from('programs')
            .select('*')
            .eq('user_id', userId);

        if (error) return { programs: localPrograms };

        const cloudMap = new Map<string, SupabaseProgram>();
        cloudPrograms?.forEach(row => cloudMap.set(String(row.data.id), row));

        // Push Local -> Cloud
        const upserts = localPrograms.map(p => {
            const match = cloudMap.get(String(p.id));
            return {
                id: match?.id,
                user_id: userId,
                data: p,
                updated_at: new Date().toISOString()
            };
        });

        if (upserts.length > 0) {
            await supabase.from('programs').upsert(upserts, { onConflict: 'id' });
        }

        // Pull Cloud -> Local
        const mergedPrograms = [...localPrograms];
        cloudMap.forEach((row, id) => {
            if (!localPrograms.find(p => String(p.id) === id)) {
                mergedPrograms.push(row.data);
            }
        });

        return { programs: mergedPrograms };
    },

    async saveProgram(program: Program, userId: string) {
        const { data: existing } = await supabase
            .from('programs')
            .select('id')
            .eq('user_id', userId)
            .eq('data->>id', String(program.id))
            .maybeSingle();

        const payload = {
            user_id: userId,
            data: program,
            updated_at: new Date().toISOString(),
            ...(existing?.id ? { id: existing.id } : {})
        };

        await supabase.from('programs').upsert(payload);
    },

    async deleteProgram(programId: number | string, userId: string) {
        await supabase
            .from('programs')
            .delete()
            .eq('user_id', userId)
            .eq('data->>id', String(programId));
    },

    // --- Custom Exercises ---
    async syncExercises(localExercises: Exercise[], userId: string) {
        const { data: cloudExercises, error } = await supabase
            .from('custom_exercises')
            .select('*')
            .eq('user_id', userId);

        if (error) return { exercises: localExercises };

        const cloudMap = new Map<string, SupabaseCustomExercise>();
        cloudExercises?.forEach(row => cloudMap.set(String(row.data.id), row));

        // Push Local -> Cloud
        const upserts = localExercises.map(e => {
            const match = cloudMap.get(String(e.id));
            return {
                id: match?.id,
                user_id: userId,
                data: e,
                updated_at: new Date().toISOString()
            };
        });

        if (upserts.length > 0) {
            await supabase.from('custom_exercises').upsert(upserts, { onConflict: 'id' });
        }

        // Pull Cloud -> Local
        const mergedExercises = [...localExercises];
        cloudMap.forEach((row, id) => {
            if (!localExercises.find(l => String(l.id) === id)) {
                mergedExercises.push(row.data);
            }
        });

        return { exercises: mergedExercises };
    },

    async saveExercise(exercise: Exercise, userId: string) {
        const { data: existing } = await supabase
            .from('custom_exercises')
            .select('id')
            .eq('user_id', userId)
            .eq('data->>id', exercise.id)
            .maybeSingle();

        const payload = {
            user_id: userId,
            data: exercise,
            updated_at: new Date().toISOString(),
            ...(existing?.id ? { id: existing.id } : {})
        };

        await supabase.from('custom_exercises').upsert(payload);
    },

    async deleteExercise(exerciseId: string, userId: string) {
        await supabase
            .from('custom_exercises')
            .delete()
            .eq('user_id', userId)
            .eq('data->>id', exerciseId);
    }
};
