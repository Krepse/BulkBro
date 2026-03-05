import { useState } from 'react';
import type { Exercise } from '../types';
import { supabaseService } from '../services/supabaseService';

export function useExercises(userId: string | undefined) {
    const [customExercises, setCustomExercises] = useState<Exercise[]>(() => {
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

    const saveCustomExercise = (exercise: Exercise) => {
        const exists = customExercises.find(e => e.id === exercise.id);
        if (exists) {
            setCustomExercises(customExercises.map(e => e.id === exercise.id ? exercise : e));
        } else {
            setCustomExercises([...customExercises, exercise]);
        }
        if (userId) {
            supabaseService.saveExercise(exercise, userId);
        }
    };

    const deleteCustomExercise = (id: string) => {
        setCustomExercises(customExercises.filter(ex => ex.id !== id));
        if (userId) {
            supabaseService.deleteExercise(id, userId);
        }
    };

    const syncExercises = async (isMounted: () => boolean) => {
        if (!userId) return;
        const eSync = await supabaseService.syncExercises(customExercises, userId);
        if (isMounted()) setCustomExercises(eSync.exercises);
    };

    const persistToLocalStorage = () => {
        localStorage.setItem('customExercises', JSON.stringify(customExercises));
    };

    const clearState = () => {
        setCustomExercises([]);
        localStorage.removeItem('customExercises');
    };

    return {
        customExercises,
        setCustomExercises,
        saveExercise: saveCustomExercise,
        deleteExercise: deleteCustomExercise,
        syncExercises,
        persistToLocalStorage,
        clearState
    };
}
