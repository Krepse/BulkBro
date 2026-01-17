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

        // Sync Data on Mount/Login
        const sync = async () => {
            // 1. Workouts (Fetch only for Relational)
            const remoteWorkouts = await supabaseService.fetchWorkouts(user.id);
            // Merge: If we have local workouts not in remote, we should ideally push them.
            // For now, simpler strategy: "Cloud is Master for History".
            // BUT user wants Local-First.
            // If we have local workouts (id=number), and remote (id=uuid).
            // We can just append Remote to Local if unique?
            // BETTER: Just Replace Local History with Cloud History for consistency on load?
            // User Prompt: "Hent workouts... Inkluder exercises og sets".
            // Let's set history to what comes from Supabase + Keep Local unsaved ones?
            // Actually, if we just saved to Supabase, we should have them there. 
            // Let's setWorkoutHistory(remoteWorkouts) to verify data is coming from DB.
            if (remoteWorkouts.length > 0) {
                setWorkoutHistory(remoteWorkouts);
            }

            // 2. Programs (Keep Sync Logic)
            const pSync = await supabaseService.syncPrograms(programs, user.id);
            setPrograms(pSync.programs);

            // 3. Exercises (Keep Sync Logic)
            const eSync = await supabaseService.syncExercises(customExercises, user.id);
            setCustomExercises(eSync.exercises);
        };

        sync();
    }, [user]); // We only want to run this on mount or when user changes (login)


    // --- ACTIONS ---

    const startNewWorkout = (program?: Program) => {
        const nyOkt: Okt = {
            id: Date.now(),
            navn: program ? program.navn : 'Kveldsøkt',
            dato: new Date().toLocaleString('no-NO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            startTime: new Date().toISOString(),
            ovelser: program
                ? program.ovelser.map(navn => {
                    // Look up exercise to find its type
                    const knownEx = customExercises.find(c => c.name === navn);
                    const type: ExerciseType = knownEx ? knownEx.type : 'Stang'; // Default to Stang if unknown

                    return {
                        id: Date.now() + Math.random(),
                        navn: navn,
                        type: type,
                        sett: [{ id: Date.now() + Math.random(), kg: 20, reps: 10, completed: false }]
                    };
                })
                : []
        };
        setActiveWorkout(nyOkt);
    };

    const addExercise = (navn: string, type: ExerciseType) => {
        if (!activeWorkout) return;
        const nyOvelse: Ovelse = {
            id: Date.now(),
            navn: navn,
            type: type,
            sett: [{ id: Date.now() + 1, kg: 20, reps: 10, completed: false }]
        };
        setActiveWorkout({
            ...activeWorkout,
            ovelser: [...activeWorkout.ovelser, nyOvelse]
        });
    };

    const removeExercise = (exId: number | string) => {
        if (!activeWorkout) return;
        setActiveWorkout({
            ...activeWorkout,
            ovelser: activeWorkout.ovelser.filter(e => e.id !== exId)
        });
    };

    const updateSet = (exIdx: number, setIdx: number, field: 'kg' | 'reps', value: string) => {
        if (!activeWorkout) return;
        const updatedOvelser = [...activeWorkout.ovelser];
        const val = value === '' ? 0 : Number(value);
        updatedOvelser[exIdx].sett[setIdx][field] = val;
        setActiveWorkout({ ...activeWorkout, ovelser: updatedOvelser });
    };

    const toggleSetComplete = (exIdx: number, setIdx: number) => {
        if (!activeWorkout) return;
        const updatedOvelser = [...activeWorkout.ovelser];
        const set = updatedOvelser[exIdx].sett[setIdx];
        set.completed = !set.completed;

        if (set.completed) {
            set.completedAt = new Date().toISOString();
        } else {
            delete set.completedAt;
        }

        setActiveWorkout({ ...activeWorkout, ovelser: updatedOvelser });
    };

    const addSetToExercise = (exIdx: number) => {
        if (!activeWorkout) return;
        const updatedOvelser = [...activeWorkout.ovelser];
        const forrigeSett = updatedOvelser[exIdx].sett[updatedOvelser[exIdx].sett.length - 1];
        updatedOvelser[exIdx].sett.push({
            id: Date.now(),
            kg: forrigeSett ? forrigeSett.kg : 20,
            reps: forrigeSett ? forrigeSett.reps : 10,
            completed: false
        });
        setActiveWorkout({ ...activeWorkout, ovelser: updatedOvelser });
    };

    const updateWorkoutName = (name: string) => {
        if (!activeWorkout) return;
        setActiveWorkout({ ...activeWorkout, navn: name });
    };

    const finishWorkout = () => {
        if (activeWorkout) {
            const finishedWorkout = {
                ...activeWorkout,
                endTime: new Date().toISOString()
            };

            const existingIndex = workoutHistory.findIndex(w => w.id === finishedWorkout.id);
            let updatedHistory;
            if (existingIndex >= 0) {
                // Update existing workout
                updatedHistory = [...workoutHistory];
                updatedHistory[existingIndex] = finishedWorkout;
            } else {
                // Add new workout
                updatedHistory = [finishedWorkout, ...workoutHistory];
            }
            setWorkoutHistory(updatedHistory);

            // Sync to Supabase
            if (user) {
                supabaseService.saveWorkout(finishedWorkout, user.id);
            }
        }
        setActiveWorkout(null);
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
        saveProgram,
        deleteProgram,
        saveExercise: saveCustomExercise,
        deleteExercise: deleteCustomExercise,
        startNewWorkout,     // Exposing explicitly
    };
}
