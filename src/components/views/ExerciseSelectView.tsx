import { useState } from 'react';
import { Icons } from '../ui/Icons';
import { ExerciseList } from '../workout/ExerciseList';
import type { Exercise } from '../../types';

interface ExerciseSelectViewProps {
    onNavigate: (view: any) => void;
    onSelect: (ex: Exercise) => void;
    customExercises: Exercise[];
    onCreateExercise: () => void;
    returnView: string;
}

export function ExerciseSelectView({
    onNavigate,
    onSelect,
    customExercises,
    onCreateExercise,
    returnView
}: ExerciseSelectViewProps) {
    const [search, setSearch] = useState('');

    return (
        <div className="min-h-screen bg-slate-50 pb-40">
            <header className="bg-white px-6 py-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-50">
                <button
                    onClick={() => onNavigate(returnView)} // Navigate back to where we came from
                    className="text-slate-400 p-3 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <Icons.ChevronLeft className="w-8 h-8" />
                </button>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Velg Øvelse</h1>
            </header>

            <main className="max-w-xl mx-auto p-4 space-y-6 mt-2">
                <ExerciseList
                    exercises={customExercises}
                    search={search}
                    onSearchChange={setSearch}
                    mode="select"
                    onSelect={onSelect}
                    onCreate={onCreateExercise}
                />
            </main>
        </div>
    );
}
