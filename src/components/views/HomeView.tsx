import { Icons } from '../ui/Icons';
import { Button } from '../ui/Button';
import { useMantra } from '../../hooks/useMantra';
import type { Okt } from '../../types';

interface HomeViewProps {
    onNavigate: (view: any) => void;
    workoutHistory: Okt[];
}

export function HomeView({ onNavigate, workoutHistory }: HomeViewProps) {
    const mantra = useMantra();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 pb-20 text-center relative overflow-hidden font-sans bg-slate-900 text-white">

            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400")' }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-indigo-950/40 z-0 backdrop-blur-[2px]" />

            {/* LOGO AREA */}
            <div className="mb-8 relative z-10 animate-fade-in-up flex flex-col items-center">
                <div className="w-28 h-28 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-lg border-[6px] border-white/20 mx-auto mb-6 transform hover:scale-105 transition-transform duration-300">
                    <span className="text-white font-black italic text-4xl">BB</span>
                </div>
                <h1 className="text-[4rem] leading-none font-black text-white italic tracking-tighter mb-2 drop-shadow-lg">BULKBRO</h1>
                <p className="text-indigo-200 font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs">Din Digitale Treningspartner</p>

                <div className="mt-8 px-4 py-3 bg-black/30 rounded-full backdrop-blur-md border border-white/10">
                    <p className="text-white font-black italic uppercase text-xs tracking-wider animate-pulse">{mantra}</p>
                </div>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-12 relative z-10 animate-fade-in-up delay-100">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-lg flex flex-col items-start gap-3 hover:bg-white/20 transition-all">
                    <Icons.Activity className="w-6 h-6 text-white" />
                    <div className="text-left">
                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-wider mb-0.5">Økter Totalt</p>
                        <p className="text-2xl font-black text-white italic">{workoutHistory.length}</p>
                    </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-lg flex flex-col items-start gap-3 hover:bg-white/20 transition-all">
                    <Icons.Trophy className="w-6 h-6 text-white" />
                    <div className="text-left">
                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-wider mb-0.5">PRs Satt</p>
                        <p className="text-2xl font-black text-white italic">0</p>
                    </div>
                </div>
            </div>

            {/* BUTTONS */}
            <div className="w-full max-w-sm space-y-4 relative z-10 animate-fade-in-up delay-200">
                <Button
                    onClick={() => onNavigate('select_program')}
                    variant="primary"
                    className="w-full"
                >
                    <Icons.Plus className="w-6 h-6 stroke-[3px]" />
                    Start Ny Økt
                </Button>

                <Button
                    onClick={() => onNavigate('create_program')}
                    variant="slate"
                    className="w-full"
                >
                    <Icons.ClipboardList className="w-6 h-6" />
                    Programmer
                </Button>

                <Button
                    onClick={() => onNavigate('exercise_library')}
                    variant="slate"
                    className="w-full"
                >
                    <Icons.Dumbbell className="w-6 h-6" />
                    Øvelsesbibliotek
                </Button>

                <Button
                    onClick={() => onNavigate('history')}
                    variant="glass"
                    className="group w-full"
                >
                    <Icons.History className="w-6 h-6 text-white group-hover:rotate-[-20deg] transition-transform" />
                    Historikk
                </Button>

                <Button
                    onClick={() => onNavigate('settings')}
                    variant="glass"
                    size="icon"
                    className="mx-auto mt-8 w-12 h-12 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border-white/5"
                >
                    <Icons.Settings className="w-6 h-6" />
                </Button>
            </div>

        </div>
    );
}
