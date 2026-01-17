import { Icons } from '../ui/Icons';
import { Button } from '../ui/Button';
import type { Okt } from '../../types';

interface ActiveWorkoutViewProps {
    workout: Okt;
    onUpdateWorkoutName: (name: string) => void;
    onFinish: () => void;
    onNavigate: (view: any) => void;
    onRemoveExercise: (id: string | number) => void;
    onUpdateSet: (exIdx: number, setIdx: number, field: 'kg' | 'reps', value: string) => void;
    onToggleSet: (exIdx: number, setIdx: number) => void;
    onAddSet: (exIdx: number) => void;
    onAddExercise: () => void;
}

export function ActiveWorkoutView({
    workout,
    onUpdateWorkoutName,
    onFinish,
    onNavigate,
    onRemoveExercise,
    onUpdateSet,
    onToggleSet,
    onAddSet,
    onAddExercise
}: ActiveWorkoutViewProps) {

    return (
        <div className="min-h-screen bg-slate-50 pb-40">
            <header className="bg-white/90 backdrop-blur-xl px-6 py-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-50">
                <button
                    onClick={() => onNavigate('home')}
                    className="text-slate-400 p-3 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <Icons.ChevronLeft className="w-8 h-8" />
                </button>
                <div className="flex-1 min-w-0">
                    <input
                        type="text"
                        value={workout.navn}
                        onChange={(e) => onUpdateWorkoutName(e.target.value)}
                        className="w-full text-2xl font-black bg-transparent border-none focus:ring-0 text-slate-800 uppercase tracking-tighter italic placeholder-slate-300 min-w-0 p-0"
                        placeholder="Navn på økt"
                    />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{workout.dato}</p>
                </div>
                <button
                    onClick={onFinish}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-green-200 transition-all active:scale-95"
                >
                    <Icons.CheckCircle2 className="w-5 h-5" />
                    <span className="hidden sm:inline">Ferdig</span>
                </button>
            </header>

            <main className="max-w-xl mx-auto p-4 space-y-8 mt-6">
                {workout.ovelser.map((ex, exIdx) => (
                    <div key={ex.id} className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-100/50 border border-slate-100/50">
                        <div className="flex justify-between items-start mb-8 pl-4 border-l-4 border-indigo-600">
                            <h3 className="font-black text-2xl text-slate-800 uppercase tracking-tighter italic leading-none">{ex.navn}</h3>
                            <button
                                onClick={() => onRemoveExercise(ex.id)}
                                className="text-slate-300 hover:text-red-400 transition-colors p-2 -mr-2 -mt-2"
                            >
                                <Icons.Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-12 gap-3 px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                                <div className="col-span-2 flex justify-center">#</div>
                                {ex.type !== 'Egenvekt' && <div className="col-span-4 text-center">KG</div>}
                                <div className={`${ex.type === 'Egenvekt' ? 'col-span-8' : 'col-span-4'} text-center`}>REPS</div>
                                <div className="col-span-2 text-center">OK</div>
                            </div>

                            {ex.sett.map((set, sIdx) => (
                                <div
                                    key={set.id}
                                    className={`grid grid-cols-12 gap-3 items-center transition-all duration-300 ${set.completed ? 'opacity-50 grayscale-[0.5]' : ''}`}
                                >
                                    <div className="col-span-2 flex justify-center">
                                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 font-bold text-sm">
                                            {sIdx + 1}
                                        </div>
                                    </div>

                                    {ex.type !== 'Egenvekt' && (
                                        <div className="col-span-4 relative">
                                            <input
                                                type="number"
                                                value={set.kg}
                                                onChange={(e) => onUpdateSet(exIdx, sIdx, 'kg', e.target.value)}
                                                className="w-full bg-slate-50 border-none rounded-2xl py-3 px-2 text-center font-bold text-slate-700 text-lg focus:ring-2 focus:ring-indigo-500 transition-all placeholder-transparent"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 pointer-events-none">KG</span>
                                        </div>
                                    )}

                                    <div className={`${ex.type === 'Egenvekt' ? 'col-span-8' : 'col-span-4'} relative`}>
                                        <input
                                            type="number"
                                            value={set.reps}
                                            onChange={(e) => onUpdateSet(exIdx, sIdx, 'reps', e.target.value)}
                                            className="w-full bg-slate-50 border-none rounded-2xl py-3 px-2 text-center font-bold text-slate-700 text-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 pointer-events-none">REPS</span>
                                    </div>

                                    <div className="col-span-2 flex justify-center">
                                        <button
                                            onClick={() => onToggleSet(exIdx, sIdx)}
                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${set.completed
                                                ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                                                : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                                                }`}
                                        >
                                            <Icons.Check className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button
                            onClick={() => onAddSet(exIdx)}
                            variant="secondary"
                            className="mt-8 w-full border-dashed border-slate-200 text-slate-400 font-bold text-xs hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/50"
                            size="md"
                        >
                            <Icons.Plus className="w-4 h-4" /> Legg til sett
                        </Button>
                    </div>
                ))}

                <div className="pt-8 pb-12">
                    <Button
                        onClick={onAddExercise}
                        variant="primary"
                        className="w-full"
                    >
                        <Icons.Plus className="w-6 h-6" />
                        + Legg til ny øvelse
                    </Button>
                </div>
            </main>
        </div>
    );
}
