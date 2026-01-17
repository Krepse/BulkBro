import { Icons } from '../ui/Icons';
import { Button } from '../ui/Button';
import type { Program } from '../../types';

interface ProgramsViewProps {
    programs: Program[];
    onNavigate: (view: any) => void;
    onCreateProgram: () => void;
    onEditProgram: (program: Program) => void;
    onDeleteProgram: (id: number) => void;
}

export function ProgramsView({
    programs,
    onNavigate,
    onCreateProgram,
    onEditProgram,
    onDeleteProgram
}: ProgramsViewProps) {
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

            <main className="max-w-xl mx-auto p-6 space-y-4 mt-6">
                <Button
                    onClick={onCreateProgram}
                    variant="primary"
                    className="w-full mb-8"
                >
                    <Icons.Plus className="w-6 h-6 stroke-[3px]" />
                    Nytt Program
                </Button>

                {programs.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-bold italic">
                        Ingen programmer lagret ennå.
                    </div>
                ) : (
                    programs.map(program => (
                        <div
                            key={program.id}
                            className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-md hover:border-indigo-200 transition-all relative overflow-hidden cursor-pointer"
                            onClick={() => onEditProgram(program)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-black text-slate-900 text-2xl uppercase tracking-tighter italic">{program.navn}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{program.ovelser.length} Øvelser</p>
                                </div>
                                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => onEditProgram(program)} className="text-slate-200 hover:text-indigo-500 transition-colors p-2">
                                        <Icons.Pencil className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => onDeleteProgram(program.id)} className="text-slate-200 hover:text-red-400 transition-colors p-2">
                                        <Icons.Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {program.ovelser.slice(0, 3).map((ex, i) => (
                                    <span key={i} className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-100">{ex}</span>
                                ))}
                                {program.ovelser.length > 3 && (
                                    <span className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-100">+{program.ovelser.length - 3}</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
}
