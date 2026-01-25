import { useState, useEffect } from 'react';
import type { Program } from '../types';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/ui/Icons';
import { SortableList } from '../components/ui/SortableList';

interface ProgramFormViewProps {
    onNavigate: (view: any) => void;
    onSave: (program: Program) => void;
    editingProgram: Program | null;
    onAddExercise: () => void;
    newProgramExercises: string[];
    draftName: string;
    setDraftName: (name: string) => void;
    setDraftExercises: (exercises: string[]) => void;
}

export function ProgramFormView({
    onNavigate,
    onSave,
    editingProgram,
    onAddExercise,
    newProgramExercises,
    draftName,
    setDraftName,
    setDraftExercises
}: ProgramFormViewProps) {
    const [isReordering, setIsReordering] = useState(false);

    // Initialize draft if editing
    useEffect(() => {
        if (editingProgram && draftName === '' && newProgramExercises.length === 0) {
            setDraftName(editingProgram.navn);
            setDraftExercises(editingProgram.ovelser);
        }
    }, [editingProgram, setDraftName, setDraftExercises]);

    const handleSave = () => {
        const program: Program = {
            id: editingProgram ? editingProgram.id : Date.now(),
            navn: draftName,
            ovelser: newProgramExercises
        };
        onSave(program);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-40">
            <header className="bg-white px-6 py-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-50">
                <button
                    onClick={() => onNavigate('create_program')}
                    className="text-slate-400 p-3 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <Icons.ChevronLeft className="w-8 h-8" />
                </button>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">{editingProgram ? 'Rediger Program' : 'Nytt Program'}</h1>
                <button
                    onClick={() => setIsReordering(!isReordering)}
                    className={`ml-auto p-3 rounded-full transition-colors ${isReordering ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
                    title="Endre rekkefølge"
                >
                    {isReordering ? <Icons.Check className="w-6 h-6" /> : <Icons.Menu className="w-6 h-6" />}
                </button>
            </header>

            <main className="max-w-xl mx-auto p-6 space-y-8 mt-6">
                <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Program Navn</label>
                    <input
                        type="text"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        className="w-full bg-white p-5 rounded-[2rem] border border-slate-200 text-slate-800 font-bold text-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder-slate-300"
                        placeholder="F.eks. Helkropp A"
                    />
                </div>

                <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Øvelser ({newProgramExercises.length})</label>
                    {isReordering ? (
                        <SortableList
                            // Better approach for SortableList with primitive strings:
                            // We need unique IDs. Let's assume unique names.
                            items={newProgramExercises}
                            renderItem={(id) => (
                                <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 flex justify-between items-center shadow-sm">
                                    <span className="font-bold text-slate-700 uppercase tracking-tight">{id}</span>
                                </div>
                            )}
                            onReorder={(newOrder) => setDraftExercises(newOrder as string[])}
                        />
                    ) : (
                        newProgramExercises.map((exName, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-[1.5rem] border border-slate-100 flex justify-between items-center shadow-sm">
                                <span className="font-bold text-slate-700 uppercase tracking-tight">{exName}</span>
                                <button
                                    onClick={() => setDraftExercises(newProgramExercises.filter((_, i) => i !== idx))}
                                    className="text-slate-300 hover:text-red-400 p-2"
                                >
                                    <Icons.Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        )))}

                    <div className="relative group mt-4">
                        <button
                            onClick={onAddExercise}
                            className="w-full p-4 rounded-[2rem] bg-indigo-50 text-indigo-600 font-bold text-sm border-2 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-100 transition-all text-center uppercase tracking-wider flex items-center justify-center gap-2"
                        >
                            <Icons.Search className="w-5 h-5" />
                            + Legg til øvelse
                        </button>
                    </div>
                </div>

                <Button
                    onClick={handleSave}
                    disabled={!draftName || newProgramExercises.length === 0}
                    variant="slate"
                    className="mt-12 w-full"
                >
                    <Icons.CheckCircle2 className="w-6 h-6" />
                    Lagre Program
                </Button>
            </main>
        </div >
    );
}
