import { useState } from 'react';
import type { Exercise, ExerciseType } from '../../types';
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
    const [editingId, setEditingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editType, setEditType] = useState<ExerciseType>('Stang');

    const filteredExercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(search.toLowerCase())
    );

    const startEditing = (e: React.MouseEvent, ex: Exercise) => {
        e.stopPropagation();
        setEditingId(ex.id);
        setEditName(ex.name);
        setEditType(ex.type || 'Stang');
    };

    const cancelEditing = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(null);
        setEditName('');
    };

    const saveEditing = (e: React.MouseEvent, originalEx: Exercise) => {
        e.stopPropagation();
        if (onEdit) {
            onEdit({
                ...originalEx,
                name: editName,
                type: editType
            });
        }
        setEditingId(null);
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setConfirmDeleteId(id);
    };

    const confirmDelete = () => {
        if (confirmDeleteId && onDelete) {
            onDelete(confirmDeleteId);
            setConfirmDeleteId(null);
            setEditingId(null);
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* Confirmation Modal Overlay */}
            {confirmDeleteId && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-2">Er du sikker?</h3>
                        <p className="text-slate-400 mb-6 text-sm">Vil du slette denne øvelsen permanent for alle brukere?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                                className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700"
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); confirmDelete(); }}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-500 shadow-lg shadow-red-900/20"
                            >
                                Slett
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                    {filteredExercises.map(ex => {
                        const isEditing = editingId === ex.id;
                        return (
                            <div
                                key={ex.id}
                                onClick={() => !isEditing && onSelect && onSelect(ex)} // Disable select when editing
                                className={`bg-white p-5 rounded-[2rem] shadow-sm border transition-all text-left group flex justify-between items-center 
                                    ${onSelect && !isEditing ? 'cursor-pointer' : ''} 
                                    ${isEditing ? 'border-purple-500 shadow-md ring-1 ring-purple-500 bg-purple-50/10' : 'border-slate-100 hover:shadow-md hover:border-indigo-200'}`}
                            >
                                <div className="flex-1 mr-4">
                                    {isEditing ? (
                                        <div className="space-y-2" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                className="w-full font-black text-slate-900 uppercase tracking-tighter text-lg bg-transparent border-b border-purple-300 focus:border-purple-600 outline-none"
                                                autoFocus
                                            />
                                            <select
                                                value={editType}
                                                onChange={e => setEditType(e.target.value as ExerciseType)}
                                                className="block w-full text-xs font-bold text-slate-500 uppercase tracking-wider mt-1 bg-transparent border-none outline-none"
                                            >
                                                <option value="Stang">Stang</option>
                                                <option value="Manualer">Manualer</option>
                                                <option value="Kabel">Kabel</option>
                                                <option value="Maskin">Maskin</option>
                                                <option value="Egenvekt">Egenvekt</option>
                                            </select>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="block font-black text-slate-900 uppercase tracking-tighter text-lg">{ex.name}</span>
                                            {ex.type && (
                                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{ex.type}</span>
                                            )}
                                        </>
                                    )}
                                </div>

                                {mode === 'library' ? (
                                    <div className="flex gap-2 relative z-10 items-center">
                                        {isEditing ? (
                                            <>
                                                <button onClick={(e) => saveEditing(e, ex)} className="w-10 h-10 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-500 hover:text-white transition-colors">
                                                    <Icons.Check className="w-5 h-5" />
                                                </button>
                                                <button onClick={(e) => handleDeleteClick(e, ex.id)} className="w-10 h-10 flex items-center justify-center bg-red-100/50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors">
                                                    <Icons.Trash2 className="w-5 h-5" />
                                                </button>
                                                <button onClick={cancelEditing} className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200 hover:text-slate-600 transition-colors">
                                                    <Icons.X className="w-5 h-5" />
                                                </button>
                                            </>
                                        ) : (
                                            <button onClick={(e) => startEditing(e, ex)} className="text-slate-300 hover:text-indigo-500 transition-colors p-2">
                                                <Icons.Pencil className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                        <Icons.Plus className="w-5 h-5 text-slate-300 group-hover:text-indigo-500" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
