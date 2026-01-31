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

// Validation constants
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 50;

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
    const [error, setError] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);

    // Initialize draft if editing
    useEffect(() => {
        if (editingProgram && draftName === '' && newProgramExercises.length === 0) {
            setDraftName(editingProgram.navn);
            setDraftExercises(editingProgram.ovelser);
        }
        setError(null);
        setTouched(false);
    }, [editingProgram, setDraftName, setDraftExercises]);

    const validateName = (value: string): string | null => {
        const trimmed = value.trim();
        if (trimmed.length < MIN_NAME_LENGTH) {
            return `Navnet må være minst ${MIN_NAME_LENGTH} tegn`;
        }
        if (trimmed.length > MAX_NAME_LENGTH) {
            return `Navnet kan ikke være mer enn ${MAX_NAME_LENGTH} tegn`;
        }
        return null;
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setDraftName(value);
        if (touched) {
            setError(validateName(value));
        }
    };

    const handleNameBlur = () => {
        setTouched(true);
        setError(validateName(draftName));
    };

    const handleSave = () => {
        const trimmedName = draftName.trim();
        const validationError = validateName(trimmedName);
        if (validationError) {
            setError(validationError);
            setTouched(true);
            return;
        }

        const program: Program = {
            id: editingProgram ? editingProgram.id : Date.now(),
            navn: trimmedName,
            ovelser: newProgramExercises
        };
        onSave(program);
    };

    const isValid = !validateName(draftName.trim()) && newProgramExercises.length > 0;

    return (
        <div className="min-h-screen bg-slate-50 pb-40">
            <header className="bg-white px-6 py-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-50">
                <button
                    onClick={() => onNavigate('create_program')}
                    className="text-slate-400 p-3 hover:bg-slate-100 rounded-full transition-colors"
                    aria-label="Gå tilbake"
                >
                    <Icons.ChevronLeft className="w-8 h-8" />
                </button>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">{editingProgram ? 'Rediger Program' : 'Nytt Program'}</h1>
                <button
                    onClick={() => setIsReordering(!isReordering)}
                    className={`ml-auto p-3 rounded-full transition-colors ${isReordering ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
                    aria-label={isReordering ? "Ferdig med omorganisering" : "Endre rekkefølge på øvelser"}
                    aria-pressed={isReordering}
                >
                    {isReordering ? <Icons.Check className="w-6 h-6" /> : <Icons.Menu className="w-6 h-6" />}
                </button>
            </header>

            <main className="max-w-xl mx-auto p-6 space-y-8 mt-6">
                <div className="space-y-4">
                    <label htmlFor="program-name" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                        Program Navn
                    </label>
                    <input
                        id="program-name"
                        type="text"
                        value={draftName}
                        onChange={handleNameChange}
                        onBlur={handleNameBlur}
                        maxLength={MAX_NAME_LENGTH + 5}
                        className={`w-full bg-white p-5 rounded-[2rem] border text-slate-800 font-bold text-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder-slate-300 ${error && touched ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200'
                            }`}
                        placeholder="F.eks. Helkropp A"
                        aria-invalid={!!error}
                        aria-describedby={error ? "name-error" : undefined}
                    />
                    {error && touched && (
                        <p id="name-error" className="text-sm text-red-500 font-medium ml-4 flex items-center gap-2" role="alert">
                            <Icons.AlertCircle className="w-4 h-4" />
                            {error}
                        </p>
                    )}
                    <p className="text-xs text-slate-400 ml-4">
                        {draftName.trim().length}/{MAX_NAME_LENGTH} tegn
                    </p>
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
                                    aria-label={`Fjern ${exName}`}
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
                    disabled={!isValid}
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
