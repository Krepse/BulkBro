import { useState } from 'react';
import type { Okt } from '../types';
import { Icons } from '../components/ui/Icons';
import { Button } from '../components/ui/Button';
import { SortableList } from '../components/ui/SortableList';
import { RestTimerOverlay } from '../components/workout/RestTimerOverlay';
import { Stopwatch } from '../components/ui/Stopwatch';

interface ActiveWorkoutViewProps {
    workout: Okt;
    onUpdateWorkoutName: (name: string) => void;
    onFinish: () => void;
    onNavigate: (view: any) => void;
    onRemoveExercise: (id: string | number) => void;
    onUpdateSet: (exIdx: number, setIdx: number, field: any, value: any, shouldSync?: boolean) => void;
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
    onAddExercise,
    restTimer,
    onEndRest,
    onAddTime,
    onReorder
}: ActiveWorkoutViewProps & {
    restTimer: { isActive: boolean, endTime: number | null },
    onEndRest: () => void,
    onAddTime: (s: number) => void,
    onReorder: (newOrderIds: (string | number)[]) => void
}) {
    const [isReordering, setIsReordering] = useState(false);
    const [showFinishConfirm, setShowFinishConfirm] = useState(false);

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
                    <div className="flex items-center gap-2">
                        {workout.endTime && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-200">
                                Redigerer
                            </span>
                        )}
                        <input
                            type="text"
                            value={workout.navn}
                            onChange={(e) => onUpdateWorkoutName(e.target.value)}
                            className="w-full text-2xl font-black bg-transparent border-none focus:ring-0 text-slate-800 uppercase tracking-tighter italic placeholder-slate-300 min-w-0 p-0"
                            placeholder="Navn på økt"
                        />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{workout.dato}</p>
                </div>
                <button
                    onClick={() => setIsReordering(!isReordering)}
                    className={`p-3 rounded-full transition-colors ${isReordering ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
                    title="Endre rekkefølge"
                >
                    {isReordering ? <Icons.Check className="w-6 h-6" /> : <Icons.Menu className="w-6 h-6" />}
                </button>
                {!isReordering && (
                    <button
                        onClick={() => setShowFinishConfirm(true)}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-green-200 transition-all active:scale-95"
                    >
                        <Icons.CheckCircle2 className="w-5 h-5" />
                        <span className="hidden sm:inline">Lagre</span>
                    </button>
                )}
            </header>

            <main className="max-w-xl mx-auto p-4 space-y-8 mt-6">
                {isReordering ? (
                    <SortableList
                        items={workout.ovelser.map(ex => String(ex.id))}
                        onReorder={onReorder}
                        renderItem={(id) => {
                            // Normalized lookup
                            const ex = workout.ovelser.find(e => String(e.id) === String(id));
                            if (!ex) return null;
                            return (
                                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200">
                                    <h3 className="font-black text-xl text-slate-800 uppercase tracking-tighter italic">{ex.navn}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ex.type}</p>
                                </div>
                            );
                        }}
                    />
                ) : (
                    <div className="space-y-8">
                        {workout.ovelser.map((ex, exIdx) => (
                            <div key={ex.id} className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-100/50 border border-slate-100/50">
                                <div className="flex justify-between items-start mb-8 pl-4 border-l-4 border-indigo-600">
                                    <div>
                                        <h3 className="font-black text-2xl text-slate-800 uppercase tracking-tighter italic leading-none">{ex.navn}</h3>
                                        {ex.type && ex.type !== 'Oppvarming' && (
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{ex.type}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => onRemoveExercise(ex.id)}
                                        className="text-slate-300 hover:text-red-400 transition-colors p-2 -mr-2 -mt-2"
                                    >
                                        <Icons.Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {ex.type !== 'Oppvarming' && (
                                        <div className="grid grid-cols-12 gap-3 px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                                            <div className="col-span-2 flex justify-center">#</div>
                                            {ex.type !== 'Egenvekt' && <div className="col-span-4 text-center">KG</div>}
                                            <div className={`${ex.type === 'Egenvekt' ? 'col-span-8' : 'col-span-4'} text-center`}>REPS</div>
                                            <div className="col-span-2 text-center">OK</div>
                                        </div>
                                    )}

                                    {ex.sett.map((set, sIdx) => (
                                        <div
                                            key={set.id}
                                            className={`grid grid-cols-12 gap-3 items-center transition-all duration-300 ${set.completed ? 'opacity-50 grayscale-[0.5]' : ''}`}
                                        >
                                            {ex.type !== 'Oppvarming' && (
                                                <div className="col-span-2 flex justify-center">
                                                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 font-bold text-sm">
                                                        {sIdx + 1}
                                                    </div>
                                                </div>
                                            )}

                                            {ex.type === 'Oppvarming' ? (
                                                <div className="col-span-12 flex items-center justify-center py-4">
                                                    {/* Hide Stopwatch if workout is already finished (Edit Mode) */}
                                                    {workout.endTime ? (
                                                        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
                                                            <Icons.Activity className="w-5 h-5 text-slate-400" />
                                                            <span className="font-black text-slate-700 text-lg">
                                                                {(() => {
                                                                    const totalSeconds = set.reps || 0; // Duration is stored in reps
                                                                    const mins = Math.floor(totalSeconds / 60);
                                                                    const secs = Math.floor(totalSeconds % 60);
                                                                    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                                                                })()}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Tid</span>
                                                        </div>
                                                    ) : (
                                                        <Stopwatch
                                                            initialSeconds={set.reps || 0}
                                                            startTime={set.startTime}
                                                            completedAt={set.completedAt}
                                                            isRunning={!!set.startTime && !set.completed}
                                                            onStart={() => onUpdateSet(exIdx, sIdx, 'startTime', new Date().toISOString())}
                                                            onStop={() => {
                                                                const now = new Date();
                                                                const start = new Date(set.startTime!);
                                                                const durationSeconds = Math.round((now.getTime() - start.getTime()) / 1000);
                                                                onUpdateSet(exIdx, sIdx, 'completedAt', now.toISOString());
                                                                // Save duration and TRIGGER SYNC
                                                                onUpdateSet(exIdx, sIdx, 'reps', durationSeconds, true);
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            ) : (
                                                <>
                                                    {ex.type !== 'Egenvekt' && (
                                                        <div className="col-span-4 relative">
                                                            <input
                                                                type="number"
                                                                value={set.kg}
                                                                onFocus={(e) => e.target.select()}
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
                                                            onFocus={(e) => e.target.select()}
                                                            onChange={(e) => onUpdateSet(exIdx, sIdx, 'reps', e.target.value)}
                                                            className="w-full bg-slate-50 border-none rounded-2xl py-3 px-2 text-center font-bold text-slate-700 text-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                                                        />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 pointer-events-none">REPS</span>
                                                    </div>
                                                </>
                                            )}

                                            <div className="col-span-2 flex justify-center">
                                                {ex.type !== 'Oppvarming' && (
                                                    <button
                                                        onClick={() => onToggleSet(exIdx, sIdx)}
                                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${set.completed
                                                            ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                                                            : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                                                            }`}
                                                    >
                                                        <Icons.Check className="w-6 h-6" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {
                                    ex.type !== 'Oppvarming' && (
                                        <Button
                                            onClick={() => onAddSet(exIdx)}
                                            variant="secondary"
                                            className="mt-8 w-full border-dashed border-slate-200 text-slate-400 font-bold text-xs hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/50"
                                            size="md"
                                        >
                                            <Icons.Plus className="w-4 h-4" /> Legg til sett
                                        </Button>
                                    )
                                }
                            </div>
                        ))}
                    </div>
                )}

                {!isReordering && (
                    <div className="pt-8 pb-12">
                        <Button
                            onClick={onAddExercise}
                            variant="primary"
                            className="w-full"
                        >
                            <Icons.Plus className="w-6 h-6" />
                            Legg til ny øvelse
                        </Button>
                    </div>
                )}

                {!isReordering && (
                    <div className="pb-8">
                        <button
                            onClick={() => setShowFinishConfirm(true)}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-6 rounded-[2rem] shadow-xl shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-3 text-xl uppercase tracking-wider"
                        >
                            <Icons.CheckCircle2 className="w-8 h-8" />
                            Lagre og Avslutt
                        </button>
                    </div>
                )}
            </main >

            {/* REST TIMER OVERLAY */}
            {
                restTimer.isActive && restTimer.endTime && (
                    <RestTimerOverlay
                        endTime={restTimer.endTime}
                        onEndRest={onEndRest}
                        onAddTime={onAddTime}
                    />
                )
            }

            {/* CONFIRM FINISH MODAL */}
            {showFinishConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-2">
                                <Icons.Trophy className="w-8 h-8 text-indigo-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Er du sikker?</h3>
                            <p className="text-slate-500 font-medium">Er du ferdig med økten for i dag?</p>

                            <div className="grid grid-cols-2 gap-3 w-full mt-4">
                                <button
                                    onClick={() => setShowFinishConfirm(false)}
                                    className="py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors uppercase tracking-wider text-sm"
                                >
                                    Avbryt
                                </button>
                                <button
                                    onClick={onFinish}
                                    className="py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-200 transition-all active:scale-95 uppercase tracking-wider text-sm flex items-center justify-center gap-2"
                                >
                                    <Icons.CheckCircle2 className="w-5 h-5" />
                                    Fullfør
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
