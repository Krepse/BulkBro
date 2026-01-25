import type { Okt } from '../types';
import { Icons } from '../components/ui/Icons';

interface HistoryViewProps {
    onNavigate: (view: any) => void;
    workoutHistory: Okt[];
    onSelectWorkout: (workout: Okt) => void;
}

export function HistoryView({ onNavigate, workoutHistory, onSelectWorkout }: HistoryViewProps) {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white px-6 py-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-10">
                <button
                    onClick={() => onNavigate('home')}
                    className="text-slate-400 p-3 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <Icons.ChevronLeft className="w-8 h-8" />
                </button>
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Historikk</h1>
            </header>

            <main className="max-w-xl mx-auto p-4 space-y-4 mt-4">
                {workoutHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 opacity-50">
                        <div className="bg-slate-200 p-8 rounded-full mb-6">
                            <Icons.History className="w-16 h-16 text-slate-400" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Ingen økter lagret ennå</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {workoutHistory.map(w => (
                            <button
                                key={w.id}
                                onClick={() => onSelectWorkout(w)}
                                className="w-full bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex justify-between items-center group hover:shadow-md hover:border-indigo-100 transition-all text-left"
                            >
                                <div>
                                    <h3 className="font-black text-slate-800 text-xl uppercase tracking-tighter italic mb-1">{w.navn}</h3>
                                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                        <span>{w.dato}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                        {w.ovelser?.length || 0} Øvelser
                                    </span>
                                    <span className="text-slate-300 text-[10px] font-bold">
                                        {w.ovelser?.reduce((acc, curr) => acc + (curr.sett?.length || 0), 0) || 0} SETT
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
