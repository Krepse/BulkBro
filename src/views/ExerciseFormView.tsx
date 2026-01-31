import { useState, useEffect } from 'react';
import type { Exercise, ExerciseType } from '../types';
import { Icons } from '../components/ui/Icons';
import { Button } from '../components/ui/Button';

interface ExerciseFormViewProps {
    onNavigate: (view: any) => void;
    onSave: (name: string, type: string) => void;
    editingExercise?: Exercise | null;
    returnView: string;
}

const EXERCISE_TYPES: ExerciseType[] = ['Stang', 'Manualer', 'Kabel', 'Egenvekt', 'Maskin'];

// Validation constants
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 50;

export function ExerciseFormView({
    onNavigate,
    onSave,
    editingExercise,
    returnView
}: ExerciseFormViewProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState<ExerciseType>('Stang');
    const [error, setError] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (editingExercise) {
            setName(editingExercise.name);
            // Fallback to 'Stang' if existing data is weird, though useWorkout handles migration mostly.
            // If editingExercise doesn't have a type property yet (runtime issue), try to deduce or default.
            setType(editingExercise.type || 'Stang');
        } else {
            setName('');
            setType('Stang');
        }
        setError(null);
        setTouched(false);
    }, [editingExercise]);

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
        setName(value);
        if (touched) {
            setError(validateName(value));
        }
    };

    const handleNameBlur = () => {
        setTouched(true);
        setError(validateName(name));
    };

    const handleSave = () => {
        const trimmedName = name.trim();
        const validationError = validateName(trimmedName);
        if (validationError) {
            setError(validationError);
            setTouched(true);
            return;
        }
        onSave(trimmedName, type);
    };

    const isValid = !validateName(name.trim());

    return (
        <div className="min-h-screen bg-slate-50 pb-40">
            <header className="bg-white px-6 py-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-50">
                <button
                    onClick={() => onNavigate(returnView)}
                    className="text-slate-400 p-3 hover:bg-slate-100 rounded-full transition-colors"
                    aria-label="Gå tilbake"
                >
                    <Icons.ChevronLeft className="w-8 h-8" />
                </button>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">
                    {editingExercise ? 'Rediger Øvelse' : 'Ny Øvelse'}
                </h1>
            </header>

            <main className="max-w-xl mx-auto p-6 space-y-8 mt-6">
                <div className="space-y-4">
                    <label htmlFor="exercise-name" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                        Navn
                    </label>
                    <input
                        id="exercise-name"
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        onBlur={handleNameBlur}
                        maxLength={MAX_NAME_LENGTH + 5}
                        className={`w-full bg-white p-5 rounded-[2rem] border text-slate-800 font-bold text-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder-slate-300 ${error && touched ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200'
                            }`}
                        placeholder="F.eks. Benkpress"
                        autoFocus
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
                        {name.trim().length}/{MAX_NAME_LENGTH} tegn
                    </p>
                </div>

                <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Øvelsestype</label>
                    <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Velg øvelsestype">
                        {EXERCISE_TYPES.map((t) => (
                            <button
                                key={t}
                                onClick={() => setType(t)}
                                role="radio"
                                aria-checked={type === t}
                                className={`p-4 rounded-[1.5rem] border-2 font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${type === t
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:text-indigo-500'
                                    }`}
                            >
                                {type === t && <Icons.CheckCircle2 className="w-4 h-4" />}
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <Button
                    onClick={handleSave}
                    disabled={!isValid}
                    variant="slate"
                    className="mt-12 w-full"
                >
                    <Icons.CheckCircle2 className="w-6 h-6" />
                    {editingExercise ? 'Oppdater Øvelse' : 'Lagre Øvelse'}
                </Button>
            </main>
        </div>
    );
}
