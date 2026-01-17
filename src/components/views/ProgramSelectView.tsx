import { Icons } from '../ui/Icons';
import type { Program } from '../../types';

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

            <main className="max-w-xl mx-auto p-6 space-y-4 mt-6">
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

                <div className="h-px bg-slate-100 my-6"></div>

                <p className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4 mb-2">Dine Programmer</p>

                {programs.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-400 font-bold italic mb-4">Ingen programmer funnet</p>
                        <button onClick={() => onNavigate('create_program')} className="text-indigo-500 font-bold underline uppercase tracking-wider text-sm">Lag ditt første program</button>
                    </div>
                ) : (
                    programs.map(program => (
                        <div key={program.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-md hover:border-indigo-200 transition-all relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-black text-slate-900 text-2xl uppercase tracking-tighter italic">{program.navn}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{program.ovelser.length} Øvelser</p>
                                </div>
                                <button onClick={() => onDeleteProgram(program.id)} className="text-slate-200 hover:text-red-400 transition-colors">
                                    <Icons.Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {program.ovelser.slice(0, 3).map((ex, i) => (
                                    <span key={i} className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-100">{ex}</span>
                                ))}
                                {program.ovelser.length > 3 && (
                                    <span className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-100">+{program.ovelser.length - 3}</span>
                                )}
                            </div>

                            <button
                                onClick={() => onStartProgram(program)}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                            >
                                Start Økt <Icons.Dumbbell className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
}
