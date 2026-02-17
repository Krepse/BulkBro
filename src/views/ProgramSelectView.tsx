import type { Program, ProgramExercise } from '../types';
import { Icons } from '../components/ui/Icons';
import { getDefaultPrograms } from '../data/defaultPrograms';

interface ProgramSelectViewProps {
    programs: Program[];
    onNavigate: (view: any) => void;
    onStartEmpty: () => void;
    onStartProgram: (program: Program) => void;
    onDeleteProgram: (id: number) => void;
}

export function ProgramSelectView({
    programs,
    onNavigate,
    onStartEmpty,
    onStartProgram,
    onDeleteProgram
}: ProgramSelectViewProps) {
    const defaultPrograms = getDefaultPrograms();
    const userPrograms = programs.filter(p => !p.isDefault);

    // Helper to get exercise name safely
    const getExName = (ex: string | ProgramExercise): string => {
        if (!ex) return 'Ukjent Øvelse';
        return typeof ex === 'string' ? ex : ex.navn;
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
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Velg Økt</h1>
            </header>

            <main className="max-w-xl mx-auto p-6 space-y-8 mt-6">
                {/* Empty Workout Option */}
                <button
                    onClick={onStartEmpty}
                    className="w-full bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md hover:border-indigo-200 transition-all group text-left"
                >
                    <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                        <Icons.Plus className="w-8 h-8 text-slate-300 group-hover:text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 text-xl uppercase tracking-tighter italic">Tom Økt</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Start uten program</p>
                    </div>
                </button>

                <div className="h-px bg-slate-100 my-2"></div>

                {/* RECOMMENDED PROGRAMS SECTION */}
                {defaultPrograms.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <Icons.Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                            <h2 className="text-lg font-black text-slate-700 uppercase tracking-tight">Anbefalte Programmer</h2>
                        </div>
                        {defaultPrograms.map(program => (
                            <div
                                key={program.id}
                                className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-[2.5rem] shadow-sm border-2 border-indigo-200 group hover:shadow-md hover:border-indigo-300 transition-all relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1 mr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Eksklusiv</span>
                                        </div>
                                        <h3 className="font-black text-slate-900 text-2xl uppercase tracking-tighter italic break-words">{program.navn}</h3>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{program.ovelser?.length || 0} Øvelser</p>
                                    </div>
                                    <Icons.Dumbbell className="w-8 h-8 text-indigo-200" />
                                </div>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {program.ovelser?.slice(0, 3).map((ex, i) => (
                                        <span key={i} className="px-3 py-1 bg-white/70 rounded-lg text-[10px] font-bold text-indigo-700 uppercase tracking-wider border border-indigo-200">
                                            {getExName(ex)}
                                        </span>
                                    ))}
                                    {program.ovelser?.length > 3 && (
                                        <span className="px-3 py-1 bg-white/70 rounded-lg text-[10px] font-bold text-indigo-700 uppercase tracking-wider border border-indigo-200">
                                            +{program.ovelser.length - 3}
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={() => onStartProgram(program)}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
                                >
                                    Start Anbefalt Økt <Icons.CheckCircle2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* USER PROGRAMS SECTION */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2 mt-4">
                        <Icons.User className="w-5 h-5 text-slate-500" />
                        <h2 className="text-lg font-black text-slate-700 uppercase tracking-tight">Mine Samlinger</h2>
                    </div>

                    {userPrograms.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold italic mb-4">Ingen egne programmer ennå</p>
                            <button onClick={() => onNavigate('create_program')} className="text-indigo-500 font-bold underline uppercase tracking-wider text-sm">Lag ditt første program</button>
                        </div>
                    ) : (
                        userPrograms.map(program => (
                            <div key={program.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-md hover:border-indigo-200 transition-all relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1 mr-4">
                                        <h3 className="font-black text-slate-900 text-2xl uppercase tracking-tighter italic break-words">{program.navn}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{program.ovelser?.length || 0} Øvelser</p>
                                    </div>
                                    <button onClick={() => onDeleteProgram(program.id)} className="text-slate-200 hover:text-red-400 transition-colors p-2" aria-label="Slett program">
                                        <Icons.Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {program.ovelser?.slice(0, 3).map((ex, i) => (
                                        <span key={i} className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-100">
                                            {getExName(ex)}
                                        </span>
                                    ))}
                                    {program.ovelser?.length > 3 && (
                                        <span className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-100">
                                            +{program.ovelser.length - 3}
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={() => onStartProgram(program)}
                                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
                                >
                                    Start Økt <Icons.Dumbbell className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
