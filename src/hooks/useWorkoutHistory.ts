import { useState } from 'react';
import type { Okt } from '../types';
import { supabaseService } from '../services/supabaseService';

export function useWorkoutHistory(userId: string | undefined) {
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

    const deleteWorkout = (id: number | string) => {
        const updatedHistory = workoutHistory.filter(w => w.id !== id);
        setWorkoutHistory(updatedHistory);
        if (userId) {
            supabaseService.deleteWorkout(String(id), userId);
        }
    };

    const updateHistoryItem = async (workout: Okt) => {
        setWorkoutHistory(prev => prev.map(w => w.id === workout.id ? workout : w));
        if (userId) {
            await supabaseService.saveWorkout(workout, userId);
        }
    };

    const syncWorkouts = async (isMounted: () => boolean) => {
        if (!userId) return;
        try {
            // 1. Push local-only workouts to cloud first
            const localOnlyWorkouts = workoutHistory.filter(w => typeof w.id === 'number');
            if (localOnlyWorkouts.length > 0) {
                for (const workout of localOnlyWorkouts) {
                    if (!isMounted()) break;
                    await supabaseService.saveWorkout(workout, userId);
                }
            }
            if (!isMounted()) return;

            // 2. Fetch remote workouts
            const remoteWorkouts = await supabaseService.fetchWorkouts(userId);
            if (!isMounted()) return;

            // 3. Merge: Keep any local workouts that aren't in remote yet
            // (e.g., just-finished workout that hasn't appeared in remote)
            const remoteIds = new Set(remoteWorkouts.map(w => String(w.id)));
            const localNotInRemote = workoutHistory.filter(w => {
                const id = String(w.id);
                // Keep local workouts with numeric IDs (not yet synced)
                // Also keep workouts with endTime that aren't in remote (just finished)
                return !remoteIds.has(id) && (typeof w.id === 'number' || w.endTime);
            });

            const merged = [...localNotInRemote, ...remoteWorkouts];
            if (isMounted()) setWorkoutHistory(merged);
        } catch (err) {
            console.error("Sync error:", err);
        }
    };

    const persistToLocalStorage = () => {
        localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
    };

    const clearState = () => {
        setWorkoutHistory([]);
    };

    return {
        workoutHistory,
        setWorkoutHistory,
        deleteWorkout,
        updateHistoryItem,
        syncWorkouts,
        persistToLocalStorage,
        clearState
    };
}
