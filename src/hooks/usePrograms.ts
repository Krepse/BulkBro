import { useState } from 'react';
import type { Program } from '../types';
import { supabaseService } from '../services/supabaseService';
import { DEFAULT_PROGRAMS } from '../data/defaultPrograms';

export function usePrograms(userId: string | undefined) {
    const [programs, setPrograms] = useState<Program[]>(() => {
        try {
            const saved = localStorage.getItem('programs');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse programs", e);
            return [];
        }
    });

    const deduplicatePrograms = (allPrograms: Program[]): Program[] => {
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

    const saveProgram = (program: Program) => {
        const exists = programs.find(p => p.id === program.id);
        if (exists) {
            setPrograms(programs.map(p => p.id === program.id ? program : p));
        } else {
            setPrograms([...programs, program]);
        }
        if (userId) {
            supabaseService.saveProgram(program, userId);
        }
    };

    const deleteProgram = (id: number) => {
        setPrograms(programs.filter(p => p.id !== id));
        if (userId) {
            supabaseService.deleteProgram(id, userId);
        }
    };

    const syncPrograms = async (isMounted: () => boolean) => {
        if (!userId) return;

        const pSync = await supabaseService.syncPrograms(programs, userId);
        if (isMounted()) {
            const cleanPrograms = deduplicatePrograms(pSync.programs);
            setPrograms(cleanPrograms);
        }

        // Seeding Check
        try {
            if (!isMounted()) return;
            const cloudDefaults = await supabaseService.fetchDefaultPrograms();
            if (cloudDefaults.length === 0) {
                await supabaseService.seedDefaultPrograms(DEFAULT_PROGRAMS, userId);
                const updatedPSync = await supabaseService.syncPrograms(programs, userId);
                if (isMounted()) {
                    const cleanPrograms = deduplicatePrograms(updatedPSync.programs);
                    setPrograms(cleanPrograms);
                }
            }
        } catch (seedErr) {
            console.error("Failed to auto-seed default programs:", seedErr);
        }
    };

    const persistToLocalStorage = () => {
        localStorage.setItem('programs', JSON.stringify(programs));
    };

    const clearState = () => {
        setPrograms([]);
        localStorage.removeItem('programs');
    };

    return {
        programs,
        setPrograms,
        saveProgram,
        deleteProgram,
        syncPrograms,
        persistToLocalStorage,
        clearState
    };
}
