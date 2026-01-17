import { supabase } from '../lib/supabase';
import type { Okt, Program, Exercise } from '../types';

// Types for Supabase tables
// Types for Supabase tables
// (Removed unused internal types)

// Helper: Convert Local ID to UUID (deterministic or random)
// For existing numeric IDs, we might fallback to random and store the mapping, 
// OR just use uuid for everything moving forward. 
// For simplicity in this plan: New items get UUIDs. Old items might need migration if we want seamless sync.
// BUT, since we store the whole object in 'data', we can keep the internal ID as is, 
// and use a deterministic UUID for the row based on the ID, OR just generate a new UUID for the row.
// Let's rely on the row having its own ID, and we query by matching data->>id if needed,
// OR more simply: We enforce that `id` in the types becomes a string (UUID) over time.

export const supabaseService = {
    // --- Workouts (Relational) ---
    async fetchWorkouts(userId: string): Promise<Okt[]> {
        // Fetch Workouts -> Exercises -> Sets
        const { data, error } = await supabase
            .from('workouts')
            .select(`
                *,
                exercises (
                    *,
                    sets (*)
                )
            `)
            .eq('user_id', userId)
            .order('start_time', { ascending: false });

        if (error) {
            console.error('Error fetching workouts:', error);
            return [];
        }

        // Map back to Okt type
        return data.map((w: any) => ({
            id: w.id, // now UUID
            navn: w.name,
            dato: new Date(w.start_time).toLocaleString('no-NO'), // approximation
            startTime: w.start_time,
            endTime: w.end_time,
            ovelser: w.exercises.map((e: any) => ({
                id: e.id,
                navn: e.name,
                type: e.type,
                sett: e.sets.map((s: any) => ({
                    id: s.id,
                    kg: s.kg,
                    reps: s.reps,
                    completed: s.completed,
                    completedAt: s.completed_at
                })).sort((a: any, b: any) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()) // Sort sets if time available or just by insertion order logic? Array order from Supabase usually strict if not sorted.
            }))
        }));
    },

    async saveWorkout(workout: Okt, userId: string) {
        // 1. Save Workout
        // Check if ID is UUID. If number (from local dummy), omit it to let DB generate UUID.
        // Or if we want to "sync upsert", we need a UUID map.
        // User requested "Save to Supabase" -> Assuming "Finish Workout".
        // Let's Insert a new Workout for every Finish, or Upsert if we track UUID.
        // The current app generates `Date.now()` IDs. We should treat these as NEW rows in DB.

        let workoutId = typeof workout.id === 'string' && (workout.id as string).length > 20 ? workout.id : undefined;

        // Insert Workout
        const { data: wData, error: wError } = await supabase
            .from('workouts')
            .upsert({
                ...(workoutId ? { id: workoutId } : {}),
                user_id: userId,
                name: workout.navn,
                start_time: workout.startTime,
                end_time: workout.endTime
            })
            .select()
            .single();

        if (wError || !wData) {
            console.error("Error saving workout:", wError);
            return;
        }

        const newWorkoutId = wData.id;

        // 2. Save Exercises
        for (const ex of workout.ovelser) {
            // Upsert/Insert Exercise
            // Since we moved to relational, if we re-save a workout, we might duplicate exercises if we don't track their UUIDs.
            // For now, assuming "Finish" = Save Once. 
            // If editing, we need UUIDs. 
            // Let's assume Insert for simplicity as per prompt "Insert a row...".

            const { data: eData, error: eError } = await supabase
                .from('exercises')
                .insert({
                    workout_id: newWorkoutId,
                    user_id: userId,
                    name: ex.navn,
                    type: ex.type
                })
                .select()
                .single();

            if (eError || !eData) continue;

            const newExId = eData.id;

            // 3. Save Sets
            const setsPayload = ex.sett.map(s => ({
                exercise_id: newExId,
                user_id: userId,
                kg: s.kg,
                reps: s.reps,
                completed: s.completed,
                completed_at: s.completedAt
            }));

            const { error: sError } = await supabase
                .from('sets')
                .insert(setsPayload);

            if (sError) console.error("Error saving sets:", sError);
        }

        console.log("Workout saved to Supabase Relational DB:", newWorkoutId);
    },

    async deleteWorkout(workoutId: string, userId: string) {
        // Cascade delete handles children
        const { error } = await supabase
            .from('workouts')
            .delete()
            .eq('id', workoutId)
            .eq('user_id', userId);

        if (error) console.error("Error deleting workout:", error);
    },

    // --- Programs (Keeping JSONB for now as requested or implicit) ---
    async syncPrograms(localPrograms: Program[], userId: string) {
        // Same as before...
        const { data, error } = await supabase.from('programs').select('*').eq('user_id', userId);
        if (error) return { programs: localPrograms };

        const cloudMap = new Map<string, any>();
        data?.forEach((row: any) => cloudMap.set(String(row.data.id), row));

        // Push Local
        const upserts = localPrograms.map(p => {
            const match = cloudMap.get(String(p.id));
            return {
                ...(match ? { id: match.id } : {}),
                user_id: userId,
                data: p,
                updated_at: new Date().toISOString()
            };
        });
        if (upserts.length) await supabase.from('programs').upsert(upserts);

        // Merge
        const merged = [...localPrograms];
        cloudMap.forEach((row, id) => {
            if (!localPrograms.find(p => String(p.id) === id)) merged.push(row.data);
        });
        return { programs: merged };
    },

    async saveProgram(program: Program, userId: string) {
        /* simplified upsert */
        const { data: existing } = await supabase
            .from('programs')
            .select('id')
            .eq('user_id', userId)
            .eq('data->>id', String(program.id))
            .maybeSingle();

        await supabase.from('programs').upsert({
            ...(existing ? { id: existing.id } : {}),
            user_id: userId,
            data: program,
            updated_at: new Date().toISOString()
        });
    },

    async deleteProgram(programId: number | string, userId: string) {
        await supabase.from('programs').delete().eq('user_id', userId).eq('data->>id', String(programId));
    },

    // --- Custom Exercises (JSONB) ---
    async syncExercises(localExercises: Exercise[], userId: string) {
        // Fetch ALL global exercises (not just user specific)
        const { data, error } = await supabase.from('custom_exercises').select('*');
        if (error) return { exercises: localExercises };

        const cloudMap = new Map<string, any>();
        data?.forEach((row: any) => cloudMap.set(String(row.data.id), row));

        // Push Local (Only push ones that originated from THIS user or represent new ones?)
        // If we want a shared library, users should push their new definitions.
        // We probably shouldn't overwrite existing ones if we don't own them, but for this app's simplicity:
        // We try to upsert local definitions. RLS should handle permission errors if we try to overwrite others.
        // But for "Add to global", we just ensure they exist.

        const upserts = localExercises.map(e => {
            const match = cloudMap.get(String(e.id));

            // If it exists in cloud and created by someone else (match.user_id !== userId), we skip upserting to avoid RLS error
            // unless we want to allow editing others' exercises (requires RLS update).
            // Let's safe guard: Only upsert if it's NEW or if match.user_id === userId
            if (match && match.user_id !== userId) return null;

            return {
                ...(match ? { id: match.id } : {}),
                user_id: userId,
                data: e,
                updated_at: new Date().toISOString()
            };
        }).filter(Boolean); // Remove nulls

        if (upserts.length) await supabase.from('custom_exercises').upsert(upserts as any);

        // Merge: Cloud Wins for existence? 
        // We want all from cloud + our local ones (if any not synced yet).
        const merged = [...localExercises];
        // Add anything from cloud that we don't have locally
        cloudMap.forEach((row, id) => {
            if (!localExercises.find(e => String(e.id) === id)) merged.push(row.data);
        });

        return { exercises: merged };
    },

    async saveExercise(exercise: Exercise, userId: string) {
        const { data: existing } = await supabase
            .from('custom_exercises')
            .select('id')
            .eq('user_id', userId)
            .eq('data->>id', exercise.id)
            .maybeSingle();

        await supabase.from('custom_exercises').upsert({
            ...(existing ? { id: existing.id } : {}),
            user_id: userId,
            data: exercise,
            updated_at: new Date().toISOString()
        });
    },

    async deleteExercise(exerciseId: string, userId: string) {
        await supabase.from('custom_exercises').delete().eq('user_id', userId).eq('data->>id', exerciseId);
    }
};
