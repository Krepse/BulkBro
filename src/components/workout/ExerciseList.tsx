import type { Exercise } from '../../types';
import { Icons } from '../ui/Icons';
import { Button } from '../ui/Button';

interface ExerciseListProps {
    exercises: Exercise[];
    search: string;
    onSearchChange: (val: string) => void;
    onSelect?: (ex: Exercise) => void;
    onEdit?: (ex: Exercise) => void;
    onDelete?: (id: string) => void;
    onCreate: () => void;
    mode: 'library' | 'select';
}

export function ExerciseList({
    exercises,
    search,
    onSearchChange,
    onSelect,
    onEdit,
    onDelete,
    onCreate,
    mode
}: ExerciseListProps) {

    const filteredExercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Action: Create New */}
            <Button
                onClick={onCreate}
                variant={mode === 'select' ? 'secondary' : 'primary'}
                className="w-full mb-8"
            >
                <Icons.Plus className="w-6 h-6 stroke-[3px]" />
                {mode === 'select' ? 'Opprett Ny Øvelse' : 'Ny Øvelse'}
            </Button>

            {/* Search */}
            <div className="relative">
                <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Søk etter øvelse..."
                    className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] border border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-bold outline-none"
                    autoFocus
                />
            </div>

            {/* Exercise List */}
            {exercises.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-bold italic">
                    Ingen øvelser funnet. Lag en ny!
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {filteredExercises.map(ex => (
                        <div
                            key={ex.id}
                            onClick={() => onSelect && onSelect(ex)}
                            className={`bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-200 transition-all text-left group flex justify-between items-center ${onSelect ? 'cursor-pointer' : ''}`}
                        >
                            <div>
                                <span className="block font-black text-slate-900 uppercase tracking-tighter text-lg">{ex.name}</span>
                                {ex.type && (
                                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{ex.type}</span>
                                )}
                            </div>

                            {mode === 'library' ? (
                                <div className="flex gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); onEdit && onEdit(ex); }} className="text-slate-300 hover:text-indigo-500 transition-colors p-2">
                                        <Icons.Pencil className="w-5 h-5" />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); onDelete && onDelete(ex.id); }} className="text-slate-300 hover:text-red-400 transition-colors p-2">
                                        <Icons.Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                    <Icons.Plus className="w-5 h-5 text-slate-300 group-hover:text-indigo-500" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
