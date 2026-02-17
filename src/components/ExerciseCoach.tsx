import { useState } from 'react';
import { getExerciseTips } from '../data/exerciseTips';
import { Icons } from './ui/Icons';

interface ExerciseCoachProps {
    exerciseName: string;
    isOpen: boolean;
    onClose: () => void;
}

export function ExerciseCoach({ exerciseName, isOpen, onClose }: ExerciseCoachProps) {
    const [activeTab, setActiveTab] = useState<'form' | 'mistakes' | 'progression' | 'safety'>('form');
    const tips = getExerciseTips(exerciseName);

    if (!isOpen || !tips) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div
                className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl border-4 border-indigo-100 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-8 text-white relative">
                    <Icons.Dumbbell className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />

                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <span className="text-[10px] font-black bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full uppercase tracking-widest border border-white/20 mb-2 inline-block">Proffveiledning</span>
                            <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">{tips.exercise}</h2>
                            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-2 opacity-80 italic">Interaktiv Treningscoach</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-white/10 hover:bg-white/20 text-white transition-all p-3 rounded-2xl border border-white/10 shadow-lg"
                        >
                            <Icons.X className="w-6 h-6 stroke-[3px]" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-8 relative z-10 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('form')}
                            className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap shadow-lg ${activeTab === 'form'
                                ? 'bg-white text-indigo-700 shadow-indigo-900/40 scale-105'
                                : 'bg-indigo-500/30 text-white hover:bg-indigo-500/50 border border-white/10'
                                }`}
                        >
                            <Icons.CheckCircle2 className="w-4 h-4" /> Teknikk
                        </button>
                        <button
                            onClick={() => setActiveTab('mistakes')}
                            className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap shadow-lg ${activeTab === 'mistakes'
                                ? 'bg-white text-red-600 shadow-red-900/40 scale-105'
                                : 'bg-red-500/20 text-white hover:bg-red-500/30 border border-white/10'
                                }`}
                        >
                            <Icons.AlertCircle className="w-4 h-4" /> Feil
                        </button>
                        <button
                            onClick={() => setActiveTab('progression')}
                            className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap shadow-lg ${activeTab === 'progression'
                                ? 'bg-white text-amber-600 shadow-amber-900/40 scale-105'
                                : 'bg-amber-500/20 text-white hover:bg-amber-500/30 border border-white/10'
                                }`}
                        >
                            <Icons.Activity className="w-4 h-4" /> Progresjon
                        </button>
                        <button
                            onClick={() => setActiveTab('safety')}
                            className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap shadow-lg ${activeTab === 'safety'
                                ? 'bg-white text-emerald-600 shadow-emerald-900/40 scale-105'
                                : 'bg-emerald-500/20 text-white hover:bg-emerald-500/30 border border-white/10'
                                }`}
                        >
                            <Icons.Shield className="w-4 h-4" /> Sikkerhet
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto max-h-[50vh] bg-slate-50">
                    {activeTab === 'form' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h3 className="font-black text-xl text-slate-800 uppercase tracking-tighter italic mb-6">
                                Steg-for-Steg Teknikk
                            </h3>
                            {tips.formCues.map((cue, index) => (
                                <div key={index} className="flex gap-4 items-start bg-white p-5 rounded-3xl shadow-sm border border-slate-100 group hover:border-indigo-200 transition-all">
                                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-lg italic shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                                        {index + 1}
                                    </div>
                                    <p className="text-slate-700 font-bold leading-relaxed pt-1">{cue}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'mistakes' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h3 className="font-black text-xl text-slate-800 uppercase tracking-tighter italic mb-6">
                                Vanlige Feil å Unngå
                            </h3>
                            {tips.commonMistakes.map((mistake, index) => (
                                <div key={index} className="flex gap-4 items-start bg-red-50/50 p-5 rounded-3xl border border-red-100 group hover:bg-red-50 transition-all">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                        <Icons.X className="w-4 h-4 text-red-600 stroke-[4px]" />
                                    </div>
                                    <p className="text-slate-700 font-bold leading-relaxed pt-0.5">{mistake}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'progression' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h3 className="font-black text-xl text-slate-800 uppercase tracking-tighter italic mb-6">
                                Progresjonstips
                            </h3>
                            {tips.progressionTips.map((tip, index) => (
                                <div key={index} className="flex gap-4 items-start bg-amber-50/50 p-5 rounded-3xl border border-amber-100 group hover:bg-amber-50 transition-all">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                        <Icons.Plus className="w-5 h-5 text-amber-600 stroke-[4px]" />
                                    </div>
                                    <p className="text-slate-700 font-bold leading-relaxed pt-0.5">{tip}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'safety' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h3 className="font-black text-xl text-slate-800 uppercase tracking-tighter italic mb-6">
                                Sikkerhetsnotater
                            </h3>
                            {tips.safetyNotes.map((note, index) => (
                                <div key={index} className="flex gap-4 items-start bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100 group hover:bg-emerald-50 transition-all">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <Icons.Shield className="w-4 h-4 text-emerald-600 stroke-[2px]" />
                                    </div>
                                    <p className="text-slate-700 font-bold leading-relaxed pt-0.5">{note}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-white p-6 border-t border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                    <button
                        onClick={onClose}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 px-6 rounded-[2rem] transition-all uppercase tracking-widest text-sm shadow-xl shadow-slate-200 active:scale-[0.98]"
                    >
                        Ferdig med Coach
                    </button>
                </div>
            </div>
        </div>
    );
}
