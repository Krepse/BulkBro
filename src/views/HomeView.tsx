import { useState, useEffect } from 'react';
import { useMantra } from '../hooks/useMantra';
import {
    isStravaConnected,
    getRecentActivities,
    calculateRecoveryStatus
} from '../services/strava';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/ui/Icons';
import type { Okt } from '../types';

interface HomeViewProps {
    onNavigate: (view: any) => void;
    workoutHistory: Okt[];
}

export function HomeView({ onNavigate, workoutHistory }: HomeViewProps) {
    const mantra = useMantra();
    const [recoveryStatus, setRecoveryStatus] = useState<'JA' | 'OK' | 'NEI' | 'LOADING' | 'OFFLINE'>('LOADING');
    const [showRecoveryInfo, setShowRecoveryInfo] = useState(false);

    // Calculate PRs in last 7 days
    const recentPRs = (() => {
        // 1. Sort history chronologically
        const sorted = [...workoutHistory].sort((a, b) => {
            const dateA = new Date(a.startTime || a.dato).getTime();
            const dateB = new Date(b.startTime || b.dato).getTime();
            return dateA - dateB;
        });

        // 2. Track Max By Exercise
        const maxByExercise = new Map<string, number>();
        let prCount = 0;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        sorted.forEach(workout => {
            const wDate = new Date(workout.startTime || workout.dato);

            workout.ovelser.forEach(ex => {
                if (ex.type === 'Oppvarming' || ex.type === 'Egenvekt' || !ex.sett || ex.sett.length === 0) return;

                const currentMax = Math.max(...ex.sett.map(s => Number(s.kg) || 0));
                if (currentMax <= 0) return;

                const prevMax = maxByExercise.get(ex.navn) || 0;

                // Update Max
                if (currentMax > prevMax) {
                    maxByExercise.set(ex.navn, currentMax);

                    // Only count if this specific improvement happened in the last 7 days AND it was an improvement over previous history
                    // (Note: The first time we see an exercise, prevMax is 0, so it counts as PR. 
                    // To avoid counting every first time exercise as PR in the window, we might want to check if prevMax > 0 
                    // OR accept that "first time" is a PR. Usually "First time" IS a PR.)
                    // BUT: If the user has history OLDER than 7 days, prevMax will be set. 
                    // If they just started, everything is a PR. That is acceptable.
                    if (wDate >= sevenDaysAgo) {
                        prCount++;
                    }
                }
            });
        });

        return prCount;
    })();

    // Check if trained today
    const hasTrainedToday = workoutHistory.some(w => {
        const d = new Date(w.startTime || w.dato);
        const now = new Date();
        return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    useEffect(() => {
        async function checkRecovery() {
            const connected = await isStravaConnected();
            if (!connected) {
                setRecoveryStatus('OFFLINE');
                return;
            }
            try {
                const activities = await getRecentActivities();
                let status = calculateRecoveryStatus(activities);

                // If user has trained today (locally), we conservatively downgrade the recovery status
                // "JA" (Fresh) -> "OK" (Some fatigue, but playable)
                // "OK" (Moderate) -> "NEI" (High fatigue, consider checking out)
                // "NEI" -> Stay "NEI"
                if (hasTrainedToday) {
                    if (status === 'JA') status = 'OK';
                    else if (status === 'OK') status = 'NEI';
                }

                setRecoveryStatus(status);
            } catch (e) {
                console.error(e);
                setRecoveryStatus('OFFLINE');
            }
        }
        checkRecovery();
    }, [hasTrainedToday]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 pb-20 text-center relative overflow-hidden font-sans bg-slate-900 text-white">

            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400")' }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-indigo-950/40 z-0 backdrop-blur-[2px]" />

            {/* SETTINGS BUTTON */}
            <button
                onClick={() => onNavigate('settings')}
                className="absolute top-4 right-4 z-50 p-2 text-white/50 hover:text-white transition-colors"
            >
                <Icons.Settings className="w-6 h-6" />
            </button>

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
                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-wider mb-0.5">Økter siste 7 dager</p>
                        <p className="text-2xl font-black text-white italic">
                            {workoutHistory.filter(w => {
                                const date = new Date(w.startTime || w.dato); // Use startTime if available, fallback to legacy dato string parser if needed (but UUID migration uses startTime)
                                const sevenDaysAgo = new Date();
                                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                                return date >= sevenDaysAgo;
                            }).length}
                        </p>
                    </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-lg flex flex-col items-start gap-3 hover:bg-white/20 transition-all">
                    <Icons.Trophy className="w-6 h-6 text-white" />
                    <div className="text-left">
                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-wider mb-0.5">PRs siste 7 dager</p>
                        <p className="text-2xl font-black text-white italic">{recentPRs}</p>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-lg flex flex-col items-start gap-3 hover:bg-white/20 transition-all">
                    <Icons.Calendar className="w-6 h-6 text-white" />
                    <div className="text-left">
                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-wider mb-0.5">Økter i år ({new Date().getFullYear()})</p>
                        <p className="text-2xl font-black text-white italic">
                            {workoutHistory.filter(w => {
                                const date = new Date(w.startTime || w.dato);
                                return date.getFullYear() === new Date().getFullYear();
                            }).length}
                        </p>
                    </div>
                </div>

                {/* RESTITUSJON WIDGET */}
                <div className={`backdrop-blur-md p-6 rounded-[2rem] border shadow-lg flex flex-col items-start gap-3 transition-all relative ${recoveryStatus === 'JA' ? 'bg-green-500/20 border-green-500/30' :
                    recoveryStatus === 'OK' ? 'bg-yellow-500/20 border-yellow-500/30' :
                        recoveryStatus === 'NEI' ? 'bg-red-500/20 border-red-500/30' :
                            'bg-white/10 border-white/10'
                    }`}>
                    <div className="flex justify-between w-full">
                        <Icons.Activity className="w-6 h-6 text-white" />
                        <button onClick={() => setShowRecoveryInfo(true)} className="text-white/50 hover:text-white transition-colors">
                            <Icons.Info className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="text-left">
                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-wider mb-0.5">Trene i dag?</p>
                        <p className={`text-2xl font-black italic ${recoveryStatus === 'JA' ? 'text-green-400' :
                            recoveryStatus === 'OK' ? 'text-yellow-400' :
                                recoveryStatus === 'NEI' ? 'text-red-400' :
                                    'text-white'
                            }`}>
                            {recoveryStatus === 'OFFLINE' ? '-' :
                                recoveryStatus === 'LOADING' ? '...' :
                                    recoveryStatus}
                        </p>
                    </div>
                </div>
            </div>

            {/* RECOVERY INFO MODAL */}
            {showRecoveryInfo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative">
                        <button onClick={() => setShowRecoveryInfo(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
                            <Icons.X className="w-6 h-6" />
                        </button>
                        <h3 className="text-xl font-black italic text-white mb-4">Om Restitusjonstatus</h3>
                        <p className="text-sm text-indigo-200 mb-4">
                            Statusen er basert på treningsbelastningen din fra Strava de siste 7 dagene (Heart Rate stress eller varighet).
                        </p>
                        <div className="space-y-3 text-left">
                            <div className="flex items-center gap-3">
                                <span className="text-green-400 font-black text-lg w-8">JA</span>
                                <p className="text-xs text-white">Lav belastning. Du er uthvilt og klar for hardtrening.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-yellow-400 font-black text-lg w-8">OK</span>
                                <p className="text-xs text-white">Moderat belastning. Tren hvis du føler deg bra.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-red-400 font-black text-lg w-8">NEI</span>
                                <p className="text-xs text-white">Høy belastning. Vurder en hviledag for å unngå overtrening.</p>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/10 text-center">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">Powered by Strava Data</p>
                        </div>
                    </div>
                </div>
            )}

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
