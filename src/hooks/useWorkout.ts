import { useState, useEffect } from 'react';
import type { Okt, Program, Exercise, Ovelse, ExerciseType } from '../types';
import { useAuth } from './useAuth';
import { supabaseService } from '../services/supabaseService';

export function useWorkout() {
    const { user } = useAuth();

    // --- STATE ---
    const [workoutHistory, setWorkoutHistory] = useState<Okt[]>(() => {
        try {
            const saved = localStorage.getItem('workoutHistory');
            const parsed = saved ? JSON.parse(saved) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("Failed to parse workout history", e);
            return [];
        }
    });

    const [programs, setPrograms] = useState<Program[]>(() => {
        try {
            const saved = localStorage.getItem('programs');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse programs", e);
            return [];
        }
    });

    const [customExercises, setCustomExercises] = useState<Exercise[]>(() => {
        // Hydrate from localStorage
        try {
            const saved = localStorage.getItem('customExercises');
            let parsed = saved ? JSON.parse(saved) : [];

            // Filter out invalid/empty exercises (Ghost rows fix)
            parsed = parsed.filter((e: any) => e.name && e.name.trim().length > 0);

            // Migration: Ensure existing exercises have a type
            parsed = parsed.map((e: any) => ({
                ...e,
                type: e.type || (e.description && ['Stang', 'Manualer', 'Kabel', 'Egenvekt', 'Maskin'].includes(e.description) ? e.description : 'Stang')
            }));
            return parsed;
        } catch (e) {
            console.error("Failed to parse custom exercises", e);
            return [];
        }
    });

    const [activeWorkout, setActiveWorkout] = useState<Okt | null>(() => {
        try {
            const saved = localStorage.getItem('activeWorkout');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error("Failed to parse activeWorkout", e);
            return null;
        }
    });

    // --- EFFECTS: SAVE TO LOCALSTORAGE ---
    useEffect(() => {
        localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
    }, [workoutHistory]);

    useEffect(() => {
        localStorage.setItem('programs', JSON.stringify(programs));
    }, [programs]);

    useEffect(() => {
        localStorage.setItem('customExercises', JSON.stringify(customExercises));
    }, [customExercises]);

    useEffect(() => {
        if (activeWorkout) {
            localStorage.setItem('activeWorkout', JSON.stringify(activeWorkout));
        } else {
            localStorage.removeItem('activeWorkout');
        }
    }, [activeWorkout]);

    // --- EFFECTS: SYNC WITH SUPABASE ---
    useEffect(() => {
        if (!user) return;

        const sync = async () => {
            // 1. Sync Workouts (Cloud-First + Migration)
            try {
                // A. Upload Local-Only Workouts (Migration)
                // We identify local-only workouts by checking if they have numeric IDs (legacy/local) 
                // or if they are missing from a quick check (but numeric ID is the safest indicator of "never synced")
                const localOnlyWorkouts = workoutHistory.filter(w => typeof w.id === 'number');

                if (localOnlyWorkouts.length > 0) {
                    console.log(`Syncing ${localOnlyWorkouts.length} local workouts to cloud...`);
                    for (const workout of localOnlyWorkouts) {
                        await supabaseService.saveWorkout(workout, user.id);
                    }
                    console.log("Migration complete.");
                }

                // B. Fetch Truth from Verified Cloud
                const remoteWorkouts = await supabaseService.fetchWorkouts(user.id);
                // Always update local state to match Cloud (Cloud is Master)
                // This replaces the numeric-ID workouts with their new UUID versions
                setWorkoutHistory(remoteWorkouts);

            } catch (err) {
                console.error("Sync error:", err);
            }

            // 2. Programs (Keep Sync Logic)
            const pSync = await supabaseService.syncPrograms(programs, user.id);
            setPrograms(pSync.programs);

            // 3. Exercises (Keep Sync Logic)
            const eSync = await supabaseService.syncExercises(customExercises, user.id);
            setCustomExercises(eSync.exercises);
        };

        sync();
    }, [user]); // Run on mount/login


    // --- EFFECTS: CLEAR STATE ON LOGOUT ---
    useEffect(() => {
        if (!user) {
            setWorkoutHistory([]);
            setPrograms([]);
            // We don't necessarily clear customExercises immediately to avoid flash, 
            // but for security/correctness across users, we should.
            setCustomExercises([]);
            setActiveWorkout(null);
        }
    }, [user]);

    // --- ACTIONS ---

    // --- HELPERS ---

    const getLastUsedSets = (exerciseName: string) => {
        // Iterate through history (newest first) to find last occurrence
        for (const workout of workoutHistory) {
            const exercise = workout.ovelser.find(e => e.navn === exerciseName);
            if (exercise && exercise.sett && exercise.sett.length > 0) {
                // Map to new sets, preserving kg/reps but resetting status
                return exercise.sett.map(s => ({
                    id: crypto.randomUUID(), // New unique ID
                    kg: s.kg,
                    reps: s.reps,
                    completed: false
                }));
            }
        }
        // Default fallback if no history found
        return [{ id: crypto.randomUUID(), kg: 20, reps: 10, completed: false }];
    };

    const startNewWorkout = (program?: Program) => {
        const warmUpExercise: Ovelse = {
            id: crypto.randomUUID(),
            navn: "Oppvarming",
            type: "Oppvarming",
            sett: [
                { id: 1, kg: 0, reps: 0, completed: false }
            ]
        };

        if (program) {
            const exercises: Ovelse[] = program.ovelser.map(navn => {
                // Look up exercise to find its type
                const knownEx = customExercises.find(c => c.name === navn);
                const type: ExerciseType = knownEx ? knownEx.type : 'Stang'; // Default to Stang if unknown

                return {
                    id: crypto.randomUUID(),
                    navn: navn,
                    type: type,
                    sett: getLastUsedSets(navn) // Use history or default
                };
            });

            // Prepend Warm-up
            exercises.unshift(warmUpExercise);

            const nyOkt: Okt = {
                id: Date.now(),
                navn: program.navn,
                dato: new Date().toLocaleString('no-NO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                startTime: new Date().toISOString(),
                ovelser: exercises
            };
            setActiveWorkout(nyOkt);
        } else {
            const nyOkt: Okt = {
                id: Date.now(),
                navn: 'Ny Økt',
                dato: new Date().toLocaleString('no-NO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                startTime: new Date().toISOString(),
                ovelser: [warmUpExercise]
            };
            setActiveWorkout(nyOkt);
        }
    };

    const addExercise = (navn: string, type: ExerciseType) => {
        setActiveWorkout(prev => {
            if (!prev) return null;
            const nyOvelse: Ovelse = {
                id: Date.now(),
                navn: navn,
                type: type,
                sett: getLastUsedSets(navn) // Use history or default
            };
            return {
                ...prev,
                ovelser: [...prev.ovelser, nyOvelse]
            };
        });
    };

    const removeExercise = (exId: number | string) => {
        setActiveWorkout(prev => {
            if (!prev) return null;
            return {
                ...prev,
                ovelser: prev.ovelser.filter(e => e.id !== exId)
            };
        });
    };

    const updateSet = (exIdx: number, setIdx: number, field: string, value: any) => {
        setActiveWorkout(prev => {
            if (!prev) return null;
            const updatedOvelser = [...prev.ovelser];
            // Cloning the specific exercise
            updatedOvelser[exIdx] = { ...updatedOvelser[exIdx] };
            // Cloning the specific set array
            updatedOvelser[exIdx].sett = [...updatedOvelser[exIdx].sett];

            const set = updatedOvelser[exIdx].sett[setIdx];

            if (field === 'completedAt') {
                // If setting completedAt, we also mark completed = true
                updatedOvelser[exIdx].sett[setIdx] = { ...set, completedAt: value, completed: true };
            } else if (field === 'startTime') {
                // If setting startTime, ensure completed is false (restart)
                updatedOvelser[exIdx].sett[setIdx] = { ...set, startTime: value, completed: false, completedAt: undefined };
            } else {
                // Standard update (kg/reps)
                const val = value === '' ? 0 : Number(value);
                updatedOvelser[exIdx].sett[setIdx] = { ...set, [field]: val };
            }

            return { ...prev, ovelser: updatedOvelser };
        });
    };

    // --- REST TIMER STATE ---
    const [restTimer, setRestTimer] = useState<{ isActive: boolean, endTime: number | null }>({
        isActive: false,
        endTime: null
    });

    // ... (Updates in toggleSetComplete)
    const toggleSetComplete = (exIdx: number, setIdx: number) => {
        setActiveWorkout(prev => {
            if (!prev) return null;
            const updatedOvelser = [...prev.ovelser];
            updatedOvelser[exIdx] = { ...updatedOvelser[exIdx] };
            updatedOvelser[exIdx].sett = [...updatedOvelser[exIdx].sett];

            const set = updatedOvelser[exIdx].sett[setIdx];
            // Toggle completion
            const newCompleted = !set.completed;

            if (newCompleted) {
                // Determine completion time
                const now = new Date();
                const nowISO = now.toISOString();
                updatedOvelser[exIdx].sett[setIdx] = { ...set, completed: true, completedAt: nowISO };

                // Side effect: Start timer (we can't put this in the reducer cleanly but it works since setRestTimer is separate)
                // Note: In React strict mode or concurrent features, side effects in set state functions are risky.
                // ideally we use useEffect triggered by state change, but here it's "OK" for valid user interaction.
                // HOWEVER, better to just call setRestTimer outside? No, we need to know if we actually toggled it ON.
                // We'll keep it here but acknowledge it's not "pure".
                setRestTimer({ isActive: true, endTime: now.getTime() + 120000 });
            } else {
                const { completedAt, ...rest } = set;
                updatedOvelser[exIdx].sett[setIdx] = { ...rest, completed: false };
                // We don't force cancel timer on uncheck usually, per logic
            }

            return { ...prev, ovelser: updatedOvelser };
        });
    };

    const endRest = () => {
        setRestTimer({ isActive: false, endTime: null });

        // Find next uncompleted set to mark as started
        setActiveWorkout(prev => {
            if (!prev) return null;

            let foundNext = false;
            // Deep clone to be safe
            const updatedOvelser = prev.ovelser.map(ex => {
                const updatedSets = ex.sett.map(set => {
                    if (!foundNext && !set.completed && !set.startTime) {
                        foundNext = true;
                        return { ...set, startTime: new Date().toISOString() };
                    }
                    return set;
                });
                return { ...ex, sett: updatedSets };
            });

            // Only update if we actually changed something? 
            // Ideally yes, but "foundNext" is local.
            // If we didn't find next, updatedOvelser is effectively same data but new references. 
            // That's fine.
            return { ...prev, ovelser: updatedOvelser };
        });
    };

    // Helper to add time
    const addRestTime = (seconds: number) => {
        if (restTimer.endTime) {
            setRestTimer({ ...restTimer, endTime: restTimer.endTime + (seconds * 1000) });
        }
    };

    const addSetToExercise = (exIdx: number) => {
        setActiveWorkout(prev => {
            if (!prev) return null;
            const updatedOvelser = [...prev.ovelser];
            updatedOvelser[exIdx] = { ...updatedOvelser[exIdx] };
            updatedOvelser[exIdx].sett = [...updatedOvelser[exIdx].sett];

            const forrigeSett = updatedOvelser[exIdx].sett[updatedOvelser[exIdx].sett.length - 1];
            updatedOvelser[exIdx].sett.push({
                id: Date.now(),
                kg: forrigeSett ? forrigeSett.kg : 20,
                reps: forrigeSett ? forrigeSett.reps : 10,
                completed: false
            });
            return { ...prev, ovelser: updatedOvelser };
        });
    };

    const updateWorkoutName = (name: string) => {
        setActiveWorkout(prev => prev ? { ...prev, navn: name } : null);
    };

    const finishWorkout = async () => {
        if (activeWorkout) {
            // Filter out uncompleted sets and exercises with no completed sets
            const filteredExercises = activeWorkout.ovelser.map(ex => ({
                ...ex,
                sett: ex.sett.filter(s => s.completed)
            })).filter(ex => ex.sett.length > 0);

            const finishedWorkout: Okt = {
                ...activeWorkout,
                ovelser: filteredExercises,
                endTime: new Date().toISOString()
            };

            // 1. Optimistic Update (Local ID)
            const existingIndex = workoutHistory.findIndex(w => w.id === finishedWorkout.id);
            let updatedHistory;
            if (existingIndex >= 0) {
                updatedHistory = [...workoutHistory];
                updatedHistory[existingIndex] = finishedWorkout;
            } else {
                updatedHistory = [finishedWorkout, ...workoutHistory];
            }
            setWorkoutHistory(updatedHistory);
            setActiveWorkout(null);

            // 2. Sync to Supabase & Update ID
            if (user) {
                try {
                    const newId = await supabaseService.saveWorkout(finishedWorkout, user.id);
                    if (newId) {
                        // Update the local workout with the real UUID to prevent duplicate syncs
                        setWorkoutHistory(prev => prev.map(w =>
                            w.id === finishedWorkout.id ? { ...w, id: newId } : w
                        ));
                    }
                } catch (err) {
                    console.error("Failed to save workout to cloud:", err);
                }
            }
        } else {
            setActiveWorkout(null);
        }
    };

    const deleteWorkout = (id: number | string) => {
        const updatedHistory = workoutHistory.filter(w => w.id !== id);
        setWorkoutHistory(updatedHistory);
        // Sync delete
        if (user) {
            supabaseService.deleteWorkout(String(id), user.id);
        }
    };

    const editWorkout = (workout: Okt) => {
        setActiveWorkout(JSON.parse(JSON.stringify(workout)));
    };

    // --- PROGRAM ACTIONS ---
    const saveProgram = (program: Program) => {
        // Logic to add or update
        const exists = programs.find(p => p.id === program.id);
        if (exists) {
            setPrograms(programs.map(p => p.id === program.id ? program : p));
        } else {
            setPrograms([...programs, program]);
        }

        // Sync
        if (user) {
            supabaseService.saveProgram(program, user.id);
        }
    };

    const deleteProgram = (id: number) => {
        setPrograms(programs.filter(p => p.id !== id));
        // Sync
        if (user) {
            supabaseService.deleteProgram(id, user.id);
        }
    };


    // --- EXERCISE ACTIONS ---
    const saveCustomExercise = (exercise: Exercise) => {
        const exists = customExercises.find(e => e.id === exercise.id);
        if (exists) {
            setCustomExercises(customExercises.map(e => e.id === exercise.id ? exercise : e));
        } else {
            setCustomExercises([...customExercises, exercise]);
        }

        // Sync
        if (user) {
            supabaseService.saveExercise(exercise, user.id);
        }
    };

    const deleteCustomExercise = (id: string) => {
        setCustomExercises(customExercises.filter(ex => ex.id !== id));
        // Sync
        if (user) {
            supabaseService.deleteExercise(id, user.id);
        }
    };

    const updateHistoryItem = async (workout: Okt) => {
        setWorkoutHistory(prev => prev.map(w => w.id === workout.id ? workout : w));
        if (user) {
            await supabaseService.saveWorkout(workout, user.id);
        }
    };

    return {
        user,
        workoutHistory,
        programs,
        customExercises,
        activeWorkout,
        startWorkout: startNewWorkout,
        cancelWorkout: () => setActiveWorkout(null),
        addExercise,
        removeExercise,
        updateSet,
        toggleSetComplete,
        addSetToExercise,
        updateWorkoutName,
        finishWorkout,
        deleteWorkout,
        editWorkout,
        updateHistoryItem, // New exposed function
        saveProgram,
        deleteProgram,
        saveExercise: saveCustomExercise,
        deleteExercise: deleteCustomExercise,
        startNewWorkout,     // Exposing explicitly
        restTimer,
        endRest,
        addRestTime
    };
}
