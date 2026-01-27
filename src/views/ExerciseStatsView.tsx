import { Icons } from '../components/ui/Icons';
import { LineChart, BarChart } from '../components/ui/Charts';

interface ExerciseStatsViewProps {
    onNavigate: (view: any) => void;
    exerciseName: string;
    stats: {
        date: string;
        estimated1RM: number;
        maxWeight: number;
        totalVolume: number;
    }[];
}

export function ExerciseStatsView({
    onNavigate,
    exerciseName,
    stats
}: ExerciseStatsViewProps) {
    return (
        <div className="min-h-screen bg-slate-50 pb-40">
            <header className="bg-white px-6 py-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-50">
                <button
                    onClick={() => onNavigate('exercise_library')}
                    className="text-slate-400 p-3 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <Icons.ChevronLeft className="w-8 h-8" />
                </button>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Statistikk</h1>
            </header>

            <main className="max-w-xl mx-auto p-6 space-y-8 mt-2">
                <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic">{exerciseName}</h2>
                </div>

                {/* Highlight Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Beste 1RM (Est)</p>
                        <p className="text-3xl font-black text-indigo-600 italic">
                            {Math.max(...stats.map(s => s.estimated1RM), 0)} <span className="text-sm text-slate-400 not-italic">kg</span>
                        </p>
                    </div>
                    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tyngste Løft</p>
                        <p className="text-3xl font-black text-emerald-600 italic">
                            {Math.max(...stats.map(s => s.maxWeight), 0)} <span className="text-sm text-slate-400 not-italic">kg</span>
                        </p>
                    </div>
                </div>

                {/* Strength Chart */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black text-lg text-slate-800 uppercase tracking-tighter italic">Styrkeutvikling</h3>
                        <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-1 text-indigo-500"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> 1RM</span>
                        </div>
                    </div>
                    <div className="h-48 w-full">
                        <LineChart
                            data={stats.map(s => ({
                                label: new Date(s.date).toLocaleDateString('no-NO', { day: '2-digit', month: '2-digit' }),
                                value: s.estimated1RM
                            }))}
                            color="#6366f1"
                        />
                    </div>
                </div>

                {/* Volume Chart */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    <h3 className="font-black text-lg text-slate-800 uppercase tracking-tighter italic mb-6">Volum (Total Kg)</h3>
                    <div className="h-48 w-full">
                        <BarChart
                            data={stats.map(s => ({
                                label: new Date(s.date).toLocaleDateString('no-NO', { day: '2-digit', month: '2-digit' }),
                                value: s.totalVolume
                            }))}
                            color="#10b981"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
