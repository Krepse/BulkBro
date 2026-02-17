import { useState } from 'react';
import type { Program } from '../types';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/ui/Icons';
import { getDefaultPrograms } from '../data/defaultPrograms';

interface ProgramsViewProps {
    programs: Program[];
    onNavigate: (view: any) => void;
    onCreateProgram: () => void;
    onEditProgram: (program: Program) => void;
    onDeleteProgram: (id: number) => void;
    onCopyDefaultProgram?: (program: Program) => void;
}

export function ProgramsView({
    programs,
    onNavigate,
    onCreateProgram,
    onEditProgram,
    onDeleteProgram,
    onCopyDefaultProgram
}: ProgramsViewProps) {
    const [programToDelete, setProgramToDelete] = useState<number | null>(null);
    const defaultPrograms = getDefaultPrograms();
    const userPrograms = programs.filter(p => !p.isDefault);

    // Helper to get exercise names from program (handles both formats: string[] and ProgramExercise[])
    const getExerciseNames = (program: Program): string[] => {
        if (!program || !program.ovelser) return [];
        return program.ovelser.map(ex => {
            if (!ex) return 'Ukjent Øvelse';
            return typeof ex === 'string' ? ex : ex.navn;
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-40">
            <header className="bg-white px-6 py-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-50">
                <button
                    onClick={() => onNavigate('home')}
                    className="text-slate-400 p-3 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <Icons.ChevronLeft className="w-8 h-8" />
                </button>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Programmer</h1>
            </header>

            <main className="max-w-xl mx-auto p-6 space-y-8 mt-6">
                <Button
                    onClick={onCreateProgram}
                    variant="primary"
                    className="w-full mb-8"
                >
                    <Icons.Plus className="w-6 h-6 stroke-[3px]" />
                    Nytt Program
                </Button>

                {/* DEFAULT PROGRAMS SECTION */}
                {defaultPrograms.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <Icons.Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                            <h2 className="text-lg font-black text-slate-700 uppercase tracking-tight">Anbefalte Programmer</h2>
                        </div>
                        {defaultPrograms.map(program => (
                            <div
                                key={program.id}
                                className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 p-8 rounded-[3rem] shadow-xl border-4 border-indigo-200/20 group hover:shadow-2xl hover:scale-[1.01] transition-all relative overflow-hidden"
                            >
                                {/* Decorative Background Icon */}
                                <Icons.Dumbbell className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="flex-1 mr-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-black bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">Eksklusiv Coach</span>
                                        </div>
                                        <h3 className="font-black text-white text-3xl uppercase tracking-tighter italic break-words leading-none">{program.navn}</h3>
                                        <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest mt-2 flex items-center gap-2">
                                            <Icons.Activity className="w-3 h-3" /> {getExerciseNames(program).length} Profesjonelle Øvelser
                                        </p>
                                    </div>
                                    {onCopyDefaultProgram && (
                                        <button
                                            onClick={() => onCopyDefaultProgram(program)}
                                            className="bg-white hover:bg-slate-50 text-indigo-600 px-5 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 shadow-xl shadow-indigo-900/20 flex-shrink-0 active:scale-95"
                                        >
                                            <Icons.Plus className="w-4 h-4" />
                                            Bruk
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2 relative z-10">
                                    {getExerciseNames(program).slice(0, 4).map((ex, i) => (
                                        <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">{ex}</span>
                                    ))}
                                    {getExerciseNames(program).length > 4 && (
                                        <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">+{getExerciseNames(program).length - 4}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* USER PROGRAMS SECTION */}
                <div className="space-y-4">
                    {defaultPrograms.length > 0 && (
                        <div className="flex items-center gap-2 px-2 mt-12">
                            <Icons.User className="w-5 h-5 text-slate-500" />
                            <h2 className="text-lg font-black text-slate-700 uppercase tracking-tight">Mine Samlinger</h2>
                        </div>
                    )}
                    {userPrograms.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-4">
                            <Icons.Plus className="w-12 h-12 text-slate-200" />
                            <p className="text-slate-400 font-bold italic">
                                Ingen egne programmer lagret ennå.
                            </p>
                        </div>
                    ) : (
                        userPrograms.map(program => (
                            <div
                                key={program.id}
                                className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-md hover:border-indigo-200 transition-all relative overflow-hidden cursor-pointer"
                                onClick={() => onEditProgram(program)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1 mr-4">
                                        <h3 className="font-black text-slate-900 text-2xl uppercase tracking-tighter italic break-words">{program.navn}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{getExerciseNames(program).length} Øvelser</p>
                                    </div>
                                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => onEditProgram(program)} className="text-slate-200 hover:text-indigo-500 transition-colors p-2" aria-label="Rediger program">
                                            <Icons.Pencil className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => setProgramToDelete(program.id)} className="text-slate-200 hover:text-red-400 transition-colors p-2" aria-label="Slett program">
                                            <Icons.Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {getExerciseNames(program).slice(0, 3).map((ex, i) => (
                                        <span key={i} className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-100">{ex}</span>
                                    ))}
                                    {getExerciseNames(program).length > 3 && (
                                        <span className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-100">+{getExerciseNames(program).length - 3}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* CONFIRM DELETE MODAL */}
            {programToDelete !== null && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl space-y-6">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icons.Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Slette program?</h3>
                            <p className="text-slate-500 text-sm">Er du sikker på at du vil slette dette programmet? Dette kan ikke angres.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setProgramToDelete(null)}
                                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={() => {
                                    if (programToDelete !== null) {
                                        onDeleteProgram(programToDelete);
                                        setProgramToDelete(null);
                                    }
                                }}
                                className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
                            >
                                Slett
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
