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

// ============================================================
// GLOBAL SAVE MUTEX — serializes all saveWorkout calls.
// Without this, concurrent saves INSERT new exercises then
// DELETE each other's inserts, resulting in 0 exercises.
// ============================================================
let saveMutexChain: Promise<any> = Promise.resolve();

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

        console.log('🔍 Raw Supabase data:', data?.length, 'workouts', data);

        // Map back to Okt type
        const mapped = data.map((w: any) => {
            const workout: Okt = {
                id: w.id, // now UUID
                navn: w.name,
                dato: new Date(w.start_time).toLocaleString('no-NO'), // approximation
                startTime: w.start_time,
                endTime: w.end_time,
                stravaAnalysis: w.strava_analysis, // Map JSONB to object
                ovelser: w.exercises
                    .sort((a: any, b: any) => {
                        // Priority 1: order_index (most reliable)
                        if (a.order_index != null && b.order_index != null) {
                            return a.order_index - b.order_index;
                        }
                        // Priority 2: Explicit Order from Metadata
                        const order: string[] = w.strava_analysis?.exerciseOrder || [];
                        if (order.length > 0) {
                            const idxA = order.indexOf(String(a.id));
                            const idxB = order.indexOf(String(b.id));
                            // If both exist in order, sort by index
                            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                            // If one exists, priority to it
                            if (idxA !== -1) return -1;
                            if (idxB !== -1) return 1;
                        }
                        // Priority 3: Created At (Insertion Order)
                        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
                    })
                    .map((e: any) => ({
                        id: e.id,
                        navn: e.name,
                        type: e.type,
                        sett: (e.sets || [])
                            .sort((a: any, b: any) => {
                                // Priority 1: order_index
                                if (a.order_index != null && b.order_index != null) {
                                    return a.order_index - b.order_index;
                                }
                                // Fallback: created_at
                                return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
                            })
                            .map((s: any) => ({
                                id: s.id,
                                kg: s.kg,
                                reps: s.reps,
                                completed: s.completed,
                                completedAt: s.completed_at,
                                startTime: s.start_time // LOAD TIMER START TIME
                            }))
                    }))
            };
            return workout;
        });

        console.log('🔄 Mapped workouts:', mapped.length, mapped);
        return mapped;
    },

    async saveWorkout(workout: Okt, userId: string) {
        // Serialize through mutex — prevents concurrent saves from
        // deleting each other's exercises
        const result = await new Promise<string | undefined>((resolve) => {
            saveMutexChain = saveMutexChain.then(async () => {
                try {
                    const id = await this._saveWorkoutImpl(workout, userId);
                    resolve(id);
                } catch (err) {
                    console.error('saveWorkout mutex error:', err);
                    resolve(undefined);
                }
            });
        });
        return result;
    },

    async _saveWorkoutImpl(workout: Okt, userId: string) {
        // 1. Save Workout
        let workoutId = typeof workout.id === 'string' && (workout.id as string).length > 20 ? workout.id : undefined;

        console.log(`💪 SAVE: "${workout.navn}" with ${workout.ovelser.length} exercises, mode=${workoutId ? 'UPSERT' : 'INSERT'}`);

        // Capture Order
        const exerciseOrder = workout.ovelser.map(e => String(e.id));

        // Prepare Metadata
        const stravaAnalysis = {
            ...(workout.stravaAnalysis || {}),
            exerciseOrder
        };

        // Insert/Upsert Workout
        const { data: wData, error: wError } = await supabase
            .from('workouts')
            .upsert({
                ...(workoutId ? { id: workoutId } : {}),
                user_id: userId,
                name: workout.navn,
                start_time: workout.startTime,
                end_time: workout.endTime,
                strava_analysis: stravaAnalysis
            })
            .select()
            .single();

        if (!wData) {
            console.error("❌ Error saving workout:", wError);
            return;
        }

        const newWorkoutId = wData.id;
        console.log(`✅ Workout row saved: ${newWorkoutId.slice(0, 8)}...`);

        // 2. Handle exercises
        // CRITICAL: If workout has 0 exercises, skip exercise operations entirely.
        // This prevents metadata-only updates (e.g., Strava analysis) from wiping exercises.
        if (workout.ovelser.length === 0) {
            console.log(`ℹ️ No exercises to save — preserving existing exercises in DB`);
            return newWorkoutId;
        }

        // 3. For existing workouts (UPSERT): delete old exercises FIRST
        // Sets are cascade-deleted via FK constraint on exercises.
        if (workoutId) {
            console.log(`🗑️ Deleting old exercises for ${newWorkoutId.slice(0, 8)}...`);
            const { error: delError } = await supabase
                .from('exercises')
                .delete()
                .eq('workout_id', newWorkoutId);
            if (delError) console.error("❌ Error deleting old exercises:", delError);
        }

        // 4. Insert new exercises and sets
        const newExerciseIds: string[] = [];

        for (let exIndex = 0; exIndex < workout.ovelser.length; exIndex++) {
            const ex = workout.ovelser[exIndex];

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

            if (eError || !eData) {
                console.error(`❌ Error saving exercise "${ex.navn}":`, eError);
                continue;
            }

            const newExId = eData.id;
            newExerciseIds.push(newExId);

            if (ex.sett.length === 0) continue;

            const setsPayload = ex.sett.map((s) => ({
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

            if (sError) console.error(`❌ Error saving sets for "${ex.navn}":`, sError);
        }

        console.log(`📊 Inserted ${newExerciseIds.length}/${workout.ovelser.length} exercises`);

        // 5. Update exerciseOrder with the new IDs
        const newExerciseOrder = newExerciseIds.map(id => String(id));
        await supabase
            .from('workouts')
            .update({
                strava_analysis: {
                    ...(workout.stravaAnalysis || {}),
                    exerciseOrder: newExerciseOrder
                }
            })
            .eq('id', newWorkoutId);

        console.log(`✅ Workout fully saved: "${workout.navn}" → ${newWorkoutId.slice(0, 8)}... (${newExerciseIds.length} exercises)`);
        return newWorkoutId;
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
        // Delete any existing program with this ID (pseudo-upsert via delete-insert)
        // This avoids "duplicate key" issues if IDs are messy or if we want to ensure a clean slate
        await supabase.from('programs').delete().eq('user_id', userId).eq('data->>id', String(program.id));

        await supabase.from('programs').insert({
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

        const upserts = localExercises.map(e => {
            const match = cloudMap.get(String(e.id));

            if (match && match.user_id !== userId) return null;

            return {
                ...(match ? { id: match.id } : {}),
                user_id: userId,
                data: e,
                updated_at: new Date().toISOString()
            };
        }).filter(Boolean);

        if (upserts.length) await supabase.from('custom_exercises').upsert(upserts as any);

        const merged = [...localExercises];
        cloudMap.forEach((row, id) => {
            if (!localExercises.find(e => String(e.id) === id)) merged.push(row.data);
        });

        return { exercises: merged };
    },

    async saveExercise(exercise: Exercise, userId: string) {
        await supabase.from('custom_exercises').delete().eq('user_id', userId).eq('data->>id', String(exercise.id));

        await supabase.from('custom_exercises').insert({
            user_id: userId,
            data: exercise,
            updated_at: new Date().toISOString()
        });
    },

    async deleteExercise(exerciseId: string, userId: string) {
        await supabase.from('custom_exercises').delete().eq('user_id', userId).eq('data->>id', exerciseId);
    },

    // --- Default Programs ---
    async fetchDefaultPrograms(): Promise<Program[]> {
        const { data, error } = await supabase
            .from('programs')
            .select('*')
            .eq('is_default', true);

        if (error) {
            console.error('Error fetching default programs:', error);
            return [];
        }

        return data?.map((row: any) => row.data) || [];
    },

    async copyDefaultProgramToUser(defaultProgram: Program, userId: string): Promise<Program> {
        const newProgram: Program = {
            ...defaultProgram,
            id: Date.now(),
            isDefault: false,
            templateId: defaultProgram.id
        };

        await this.saveProgram(newProgram, userId);
        return newProgram;
    },

    async seedDefaultPrograms(programs: Program[], adminUserId: string) {
        const programsToInsert = programs.map(p => ({
            id: p.id,
            user_id: adminUserId,
            data: p,
            is_default: true,
            updated_at: new Date().toISOString()
        }));

        const { error } = await supabase.from('programs').upsert(programsToInsert);

        if (error) {
            console.error('Error seeding default programs:', error);
            throw error;
        }

        console.log(`✅ Seeded ${programs.length} default programs`);
    }
};
