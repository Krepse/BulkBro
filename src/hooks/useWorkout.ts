import { useState, useEffect, useRef } from 'react';
import type { Okt, Program, Exercise, Ovelse, ExerciseType } from '../types';
import { useAuth } from './useAuth';
import { supabaseService } from '../services/supabaseService';
import { DEFAULT_PROGRAMS } from '../data/defaultPrograms';

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
    const isSyncingRef = useRef(false);

    useEffect(() => {
        console.log('🔄 Sync effect triggered. User:', user?.email || 'null');
        if (!user) return;

        // Prevent concurrent syncs
        if (isSyncingRef.current) {
            console.log('⏸️ Sync already in progress, skipping');
            return;
        }

        let isMounted = true;
        isSyncingRef.current = true;

        const deduplicatePrograms = (allPrograms: Program[]): Program[] => {
            // Priority:
            // 1. Programs that are NOT defaults (user copies/modifications)
            // 2. Programs with more exercises (more data)
            // 3. Most recent ID (if everything else is equal)
            const sorted = [...allPrograms].sort((a, b) => {
                if (a.isDefault !== b.isDefault) return a.isDefault ? 1 : -1;
                if ((a.ovelser?.length || 0) !== (b.ovelser?.length || 0)) {
                    return (b.ovelser?.length || 0) - (a.ovelser?.length || 0);
                }
                return b.id - a.id;
            });

            const seen = new Set<string>();
            const unique: Program[] = [];

            sorted.forEach(p => {
                const key = `${p.navn.trim().toLowerCase()}`;

                // CRITICAL: If this program is marked as default, AND its name matches a static default,
                // we skip it from the USER'S list entirely. The UI will show the static one in the "Recommended" section.
                if (p.isDefault && DEFAULT_PROGRAMS.find(d => d.navn.trim().toLowerCase() === key)) {
                    return;
                }

                if (!seen.has(key)) {
                    seen.add(key);
                    unique.push(p);
                }
            });
            return unique;
        };

        const sync = async () => {
            // ... (Workout sync kept as is) ...
            try {
                const localOnlyWorkouts = workoutHistory.filter(w => typeof w.id === 'number');
                if (localOnlyWorkouts.length > 0) {
                    for (const workout of localOnlyWorkouts) {
                        if (!isMounted) break;
                        await supabaseService.saveWorkout(workout, user.id);
                    }
                }
                if (!isMounted) return;
                const remoteWorkouts = await supabaseService.fetchWorkouts(user.id);
                if (isMounted) setWorkoutHistory(remoteWorkouts);
            } catch (err) {
                console.error("Sync error:", err);
            }

            // 2. Programs - Deduplicate and Sync
            if (!isMounted) return;
            const pSync = await supabaseService.syncPrograms(programs, user.id);
            if (isMounted) {
                const cleanPrograms = deduplicatePrograms(pSync.programs);
                setPrograms(cleanPrograms);
            }

            // 3. Exercises
            if (!isMounted) return;
            const eSync = await supabaseService.syncExercises(customExercises, user.id);
            if (isMounted) setCustomExercises(eSync.exercises);

            // 4. Seeding Check
            try {
                if (!isMounted) return;
                const cloudDefaults = await supabaseService.fetchDefaultPrograms();
                if (cloudDefaults.length === 0) {
                    await supabaseService.seedDefaultPrograms(DEFAULT_PROGRAMS, user.id);
                    const updatedPSync = await supabaseService.syncPrograms(programs, user.id);
                    if (isMounted) {
                        const cleanPrograms = deduplicatePrograms(updatedPSync.programs);
                        setPrograms(cleanPrograms);
                    }
                }
            } catch (seedErr) {
                console.error("Failed to auto-seed default programs:", seedErr);
            }
        };

        sync().finally(() => {
            isSyncingRef.current = false;
        });

        return () => {
            isMounted = false;
        };
    }, [user?.id]); // Run when user ID changes (login/logout)


    // --- EFFECTS: CLEAR STATE ON LOGOUT ---
    useEffect(() => {
        console.log('👤 User effect triggered. User:', user ? 'EXISTS' : 'NULL');
        if (!user) {
            console.log('🗑️ CLEARING ALL STATE - user is null');
            setWorkoutHistory([]);
            setPrograms([]);
            // We don't necessarily clear customExercises immediately to avoid flash,
            // but for security/correctness across users, we should.
            setCustomExercises([]);
            setActiveWorkout(null);
        }
    }, [user?.id]); // Only trigger when user ID changes

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
                { id: crypto.randomUUID(), kg: 0, reps: 0, completed: false }
            ]
        };

        if (program) {
            const exercises: Ovelse[] = program.ovelser.map(ex => {
                const navn = typeof ex === 'string' ? ex : ex.navn;
                // Priority: 1. Type from program (if object) 2. Type from custom library 3. Default to Stang
                let type: ExerciseType = 'Stang';
                if (typeof ex !== 'string') {
                    type = ex.type;
                } else {
                    const knownEx = customExercises.find(c => c.name === ex);
                    if (knownEx) type = knownEx.type;
                }

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
                id: crypto.randomUUID(),
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

    const removeExercise = (exId: string) => {
        setActiveWorkout(prev => {
            if (!prev) return null;
            return {
                ...prev,
                ovelser: prev.ovelser.filter(e => e.id !== exId)
            };
        });
    };

    // --- CLOUD SYNC HELPER ---
    const saveActiveWorkoutToCloud = async (workoutToSave: Okt) => {
        if (!user) return;
        try {
            console.log("Checkpointing active workout to cloud...");
            const newId = await supabaseService.saveWorkout(workoutToSave, user.id);
            if (newId && newId !== workoutToSave.id) {
                console.log(`Updated active workout ID from ${workoutToSave.id} to ${newId}`);
                setActiveWorkout(prev => prev ? { ...prev, id: newId } : null);
            }
        } catch (err) {
            console.error("Failed to checkpoint workout:", err);
        }
    };

    const updateSet = (exIdx: number, setIdx: number, field: string, value: any, shouldSync: boolean = false) => {
        setActiveWorkout(prev => {
            if (!prev) return null;
            const updatedOvelser = [...prev.ovelser];
            // Cloning the specific exercise
            updatedOvelser[exIdx] = { ...updatedOvelser[exIdx] };
            // Cloning the specific set array
            updatedOvelser[exIdx].sett = [...updatedOvelser[exIdx].sett];

            const set = updatedOvelser[exIdx].sett[setIdx];

            if (field === 'stopTimer') {
                // ATOMIC timer stop: set completedAt, reps (duration), and completed in ONE update
                const { completedAt, durationSeconds } = value as { completedAt: string, durationSeconds: number };
                updatedOvelser[exIdx].sett[setIdx] = { ...set, completedAt, reps: durationSeconds, completed: true };
            } else if (field === 'completedAt') {
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

            const nextState = { ...prev, ovelser: updatedOvelser };

            // Trigger sync if requested (e.g. stopping a timer)
            if (shouldSync) {
                saveActiveWorkoutToCloud(nextState);
            }

            return nextState;
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

                // Side effect: Start timer ONLY if workout is active (not finished)
                if (!prev.endTime) {
                    setRestTimer({ isActive: true, endTime: now.getTime() + 120000 });
                }
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
                id: crypto.randomUUID(),
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
            // Auto-stop any running timers before filtering
            // This handles the case where user finishes without stopping the warmup stopwatch
            const now = new Date();
            const autoStoppedExercises = activeWorkout.ovelser.map(ex => {
                if (ex.type === 'Oppvarming') {
                    return {
                        ...ex,
                        sett: ex.sett.map(s => {
                            if (s.startTime && !s.completed) {
                                // Auto-stop: calculate duration and mark completed
                                const start = new Date(s.startTime);
                                const durationSeconds = Math.round((now.getTime() - start.getTime()) / 1000);
                                return { ...s, completed: true, completedAt: now.toISOString(), reps: durationSeconds };
                            }
                            return s;
                        })
                    };
                }
                return ex;
            });

            // Filter: Keep ONLY sets that are marked as COMPLETED (checked off)
            // Uncompleted sets will NOT be saved to history
            const filteredExercises = autoStoppedExercises.map(ex => ({
                ...ex,
                sett: ex.sett.filter(s => s.completed)
            })).filter(ex => ex.sett.length > 0); // Remove exercises that end up with 0 completed sets

            const finishedWorkout: Okt = {
                ...activeWorkout,
                ovelser: filteredExercises,
                endTime: activeWorkout.endTime || new Date().toISOString() // Preserve original endTime when editing
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

    const reorderExercises = (newOrderIds: (string | number)[]) => {
        setActiveWorkout(prev => {
            if (!prev) return null;

            // Normalize IDs to string for Map lookup to handle mixed types (number vs string IDs)
            const currentExercises = new Map(prev.ovelser.map(e => [String(e.id), e]));

            const reorderedExercises = newOrderIds
                .map(id => currentExercises.get(String(id)))
                .filter((e): e is Ovelse => e !== undefined);

            // Safety check: If we lost exercises, abort reorder to prevent data loss
            if (reorderedExercises.length !== prev.ovelser.length) {
                console.warn("Reorder aborted: Mismatch in exercise count", {
                    prev: prev.ovelser.length,
                    new: reorderedExercises.length
                });
                return prev;
            }

            return {
                ...prev,
                ovelser: reorderedExercises
            };
        });
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
        reorderExercises, // New exposed function
        updateSet,
        toggleSetComplete,
        addSetToExercise,
        updateWorkoutName,
        finishWorkout,
        deleteWorkout,
        editWorkout,
        updateHistoryItem,
        saveProgram,
        deleteProgram,
        saveExercise: saveCustomExercise,
        deleteExercise: deleteCustomExercise,
        startNewWorkout,
        restTimer,
        endRest,
        addRestTime
    };
}
