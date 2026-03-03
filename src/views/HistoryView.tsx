import { useState } from 'react';
import type { Okt } from '../types';
import { Icons } from '../components/ui/Icons';

interface HistoryViewProps {
    onNavigate: (view: any) => void;
    workoutHistory: Okt[];
    onSelectWorkout: (workout: Okt) => void;
}

type HistoryTab = 'trening' | 'yoga';

export function HistoryView({ onNavigate, workoutHistory, onSelectWorkout }: HistoryViewProps) {
    const [activeTab, setActiveTab] = useState<HistoryTab>('trening');

    const isYoga = (w: Okt) => w.navn.toLowerCase().includes('yoga');
    const treningHistory = workoutHistory.filter(w => !isYoga(w));
    const yogaHistory = workoutHistory.filter(w => isYoga(w));
    const displayList = activeTab === 'trening' ? treningHistory : yogaHistory;

    const formatDuration = (w: Okt): string | null => {
        if (!w.startTime || !w.endTime) return null;
        const ms = new Date(w.endTime).getTime() - new Date(w.startTime).getTime();
        const mins = Math.round(ms / 60000);
        return `${mins} min`;
    };

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

            {/* Tabs */}
            <div className="max-w-xl mx-auto px-4 pt-4">
                <div className="flex bg-slate-100 rounded-2xl p-1">
                    <button
                        onClick={() => setActiveTab('trening')}
                        className={`flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${activeTab === 'trening'
                                ? 'bg-white text-slate-800 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        🏋️ Trening ({treningHistory.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('yoga')}
                        className={`flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${activeTab === 'yoga'
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        🧘 Yoga ({yogaHistory.length})
                    </button>
                </div>
            </div>

            <main className="max-w-xl mx-auto p-4 space-y-4 mt-2">
                {displayList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 opacity-50">
                        <div className={`p-8 rounded-full mb-6 ${activeTab === 'yoga' ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                            {activeTab === 'yoga' ? (
                                <span className="text-5xl">🧘</span>
                            ) : (
                                <Icons.History className="w-16 h-16 text-slate-400" />
                            )}
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
                            {activeTab === 'yoga' ? 'Ingen yoga-økter ennå' : 'Ingen økter lagret ennå'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayList.map(w => (
                            <button
                                key={w.id}
                                onClick={() => onSelectWorkout(w)}
                                className={`w-full p-6 rounded-[2.5rem] shadow-sm border flex justify-between items-center group hover:shadow-md transition-all text-left ${activeTab === 'yoga'
                                        ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100 hover:border-emerald-200'
                                        : 'bg-white border-slate-100 hover:border-indigo-100'
                                    }`}
                            >
                                <div>
                                    <h3 className="font-black text-slate-800 text-xl uppercase tracking-tighter italic mb-1">{w.navn}</h3>
                                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                        <span>{w.dato}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    {activeTab === 'yoga' ? (
                                        <>
                                            <span className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                                {formatDuration(w) || '—'}
                                            </span>
                                            {w.stravaAnalysis?.workoutStats?.calories && (
                                                <span className="text-slate-300 text-[10px] font-bold">
                                                    🔥 {w.stravaAnalysis.workoutStats.calories} KCAL
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <span className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                                {w.ovelser?.length || 0} Øvelser
                                            </span>
                                            <span className="text-slate-300 text-[10px] font-bold">
                                                {w.ovelser?.reduce((acc, curr) => acc + (curr.sett?.length || 0), 0) || 0} SETT
                                            </span>
                                        </>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
