import { useState, useEffect, useRef } from 'react';
import type { Okt, Program, Ovelse, ExerciseType } from '../types';
import { useAuth } from './useAuth';
import { usePrograms } from './usePrograms';
import { useExercises } from './useExercises';
import { useWorkoutHistory } from './useWorkoutHistory';
import { supabaseService } from '../services/supabaseService';

export function useWorkout() {
    const { user } = useAuth();

    // --- COMPOSED HOOKS ---
    const {
        programs, saveProgram, deleteProgram,
        syncPrograms, persistToLocalStorage: persistPrograms, clearState: clearPrograms
    } = usePrograms(user?.id);

    const {
        customExercises, saveExercise, deleteExercise,
        syncExercises, persistToLocalStorage: persistExercises, clearState: clearExercises
    } = useExercises(user?.id);

    const {
        workoutHistory, setWorkoutHistory,
        deleteWorkout, updateHistoryItem,
        syncWorkouts, persistToLocalStorage: persistHistory, clearState: clearHistory
    } = useWorkoutHistory(user?.id);

    // --- ACTIVE WORKOUT STATE ---
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
    useEffect(() => { persistHistory(); }, [workoutHistory]);
    useEffect(() => { persistPrograms(); }, [programs]);
    useEffect(() => { persistExercises(); }, [customExercises]);

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

        if (isSyncingRef.current) {
            console.log('⏸️ Sync already in progress, skipping');
            return;
        }

        let isMounted = true;
        isSyncingRef.current = true;

        const sync = async () => {
            // 1. Workouts
            await syncWorkouts(() => isMounted);

            // 2. Programs
            if (!isMounted) return;
            await syncPrograms(() => isMounted);

            // 3. Exercises
            if (!isMounted) return;
            await syncExercises(() => isMounted);
        };

        sync().finally(() => {
            isSyncingRef.current = false;
        });

        return () => {
            isMounted = false;
        };
    }, [user?.id]);


    // --- EFFECTS: CLEAR STATE ON LOGOUT ---
    useEffect(() => {
        console.log('👤 User effect triggered. User:', user ? 'EXISTS' : 'NULL');
        if (!user) {
            console.log('🗑️ CLEARING ALL STATE - user is null');
            clearHistory();
            clearPrograms();
            clearExercises();
            setActiveWorkout(null);
        }
    }, [user?.id]);

    // --- EFFECT: AUTO-CHECKPOINT ON APP BACKGROUND (iPhone fix) ---
    const activeWorkoutRef = useRef(activeWorkout);
    activeWorkoutRef.current = activeWorkout;

    const userRef = useRef(user);
    userRef.current = user;

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                const currentWorkout = activeWorkoutRef.current;
                const currentUser = userRef.current;
                if (currentWorkout && currentUser) {
                    // Persist to localStorage immediately (synchronous)
                    localStorage.setItem('activeWorkout', JSON.stringify(currentWorkout));
                    // Also try to push to cloud (best-effort, may be killed by OS)
                    supabaseService.saveWorkout(currentWorkout, currentUser.id)
                        .catch(err => console.error('Background checkpoint failed:', err));
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // --- HELPERS ---

    const getLastUsedSets = (exerciseName: string, exerciseType?: ExerciseType) => {
        // Sort by date descending to get the most recent workout first
        const sorted = [...workoutHistory].sort((a, b) => {
            const timeA = a.startTime ? new Date(a.startTime).getTime() : 0;
            const timeB = b.startTime ? new Date(b.startTime).getTime() : 0;
            return timeB - timeA;
        });

        for (const workout of sorted) {
            // Match by both name AND type if type is provided
            const exercise = workout.ovelser.find(e =>
                e.navn === exerciseName && (!exerciseType || e.type === exerciseType)
            );
            if (exercise && exercise.sett && exercise.sett.length > 0) {
                // Only return sets that were actually completed with valid data
                const validSets = exercise.sett.filter(s => s.completed && (s.kg > 0 || s.reps > 0));
                if (validSets.length > 0) {
                    return validSets.map(s => ({
                        id: crypto.randomUUID(),
                        kg: s.kg,
                        reps: s.reps,
                        completed: false
                    }));
                }
            }
        }
        return [{ id: crypto.randomUUID(), kg: 20, reps: 10, completed: false }];
    };

    // --- WORKOUT ACTIONS ---

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
                    sett: getLastUsedSets(navn, type)
                };
            });

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
                sett: getLastUsedSets(navn, type)
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
            updatedOvelser[exIdx] = { ...updatedOvelser[exIdx] };
            updatedOvelser[exIdx].sett = [...updatedOvelser[exIdx].sett];

            const set = updatedOvelser[exIdx].sett[setIdx];

            if (field === 'stopTimer') {
                const { completedAt, durationSeconds } = value as { completedAt: string, durationSeconds: number };
                updatedOvelser[exIdx].sett[setIdx] = { ...set, completedAt, reps: durationSeconds, completed: true };
            } else if (field === 'completedAt') {
                updatedOvelser[exIdx].sett[setIdx] = { ...set, completedAt: value, completed: true };
            } else if (field === 'startTime') {
                updatedOvelser[exIdx].sett[setIdx] = { ...set, startTime: value, completed: false, completedAt: undefined };
            } else {
                // Support decimal input: replace comma with dot for Norwegian locale
                const strVal = String(value).replace(',', '.');
                const val = strVal === '' ? 0 : parseFloat(strVal);
                updatedOvelser[exIdx].sett[setIdx] = { ...set, [field]: isNaN(val) ? 0 : val };
            }

            const nextState = { ...prev, ovelser: updatedOvelser };

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

    const toggleSetComplete = (exIdx: number, setIdx: number) => {
        setActiveWorkout(prev => {
            if (!prev) return null;
            const updatedOvelser = [...prev.ovelser];
            updatedOvelser[exIdx] = { ...updatedOvelser[exIdx] };
            updatedOvelser[exIdx].sett = [...updatedOvelser[exIdx].sett];

            const set = updatedOvelser[exIdx].sett[setIdx];
            const newCompleted = !set.completed;

            if (newCompleted) {
                const now = new Date();
                const nowISO = now.toISOString();
                updatedOvelser[exIdx].sett[setIdx] = { ...set, completed: true, completedAt: nowISO };

                if (!prev.endTime) {
                    setRestTimer({ isActive: true, endTime: now.getTime() + 120000 });
                }
            } else {
                const { completedAt, ...rest } = set;
                updatedOvelser[exIdx].sett[setIdx] = { ...rest, completed: false };
            }

            const nextState = { ...prev, ovelser: updatedOvelser };

            // Auto-checkpoint to cloud on every set toggle (prevents data loss on app switch)
            saveActiveWorkoutToCloud(nextState);

            return nextState;
        });
    };

    const endRest = () => {
        setRestTimer({ isActive: false, endTime: null });

        setActiveWorkout(prev => {
            if (!prev) return null;

            let foundNext = false;
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

            return { ...prev, ovelser: updatedOvelser };
        });
    };

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
            const now = new Date();
            const autoStoppedExercises = activeWorkout.ovelser.map(ex => {
                if (ex.type === 'Oppvarming') {
                    return {
                        ...ex,
                        sett: ex.sett.map(s => {
                            if (s.startTime && !s.completed) {
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

            const filteredExercises = autoStoppedExercises.map(ex => ({
                ...ex,
                sett: ex.sett.filter(s => s.completed)
            })).filter(ex => ex.sett.length > 0);

            const finishedWorkout: Okt = {
                ...activeWorkout,
                ovelser: filteredExercises,
                endTime: activeWorkout.endTime || new Date().toISOString()
            };

            // Optimistic Update
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

            // Sync to Supabase
            if (user) {
                try {
                    const newId = await supabaseService.saveWorkout(finishedWorkout, user.id);
                    if (newId) {
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

    const editWorkout = (workout: Okt) => {
        setActiveWorkout(JSON.parse(JSON.stringify(workout)));
    };

    const reorderExercises = (newOrderIds: (string | number)[]) => {
        setActiveWorkout(prev => {
            if (!prev) return null;

            const currentExercises = new Map(prev.ovelser.map(e => [String(e.id), e]));

            const reorderedExercises = newOrderIds
                .map(id => currentExercises.get(String(id)))
                .filter((e): e is Ovelse => e !== undefined);

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
        reorderExercises,
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
        saveExercise,
        deleteExercise,
        startNewWorkout,
        restTimer,
        endRest,
        addRestTime
    };
}
