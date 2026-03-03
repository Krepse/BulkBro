import { useState, useEffect } from 'react';
import type { Okt } from '../types';

interface YogaTimerViewProps {
    workout: Okt;
    onFinish: () => void;
    onNavigate: (view: any) => void;
}

export function YogaTimerView({ workout, onFinish, onNavigate }: YogaTimerViewProps) {
    const [elapsed, setElapsed] = useState(0);
    const [showConfirm, setShowConfirm] = useState(false);

    // Calculate elapsed time from workout start
    useEffect(() => {
        if (!workout.startTime) return;

        const startMs = new Date(workout.startTime).getTime();

        const tick = () => {
            const now = Date.now();
            setElapsed(Math.floor((now - startMs) / 1000));
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [workout.startTime]);

    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // SVG circle progress (completes a full rotation every 60 seconds)
    const circumference = 2 * Math.PI * 130;
    const secondsFraction = (seconds / 60);
    const dashOffset = circumference * (1 - secondsFraction);

    return (
        <div className="min-h-screen flex flex-col items-center justify-between"
            style={{ background: 'linear-gradient(180deg, #022c22 0%, #064e3b 50%, #065f46 100%)' }}>

            {/* Header */}
            <div className="text-center pt-16 pb-4">
                <button
                    onClick={() => onNavigate('home')}
                    className="absolute left-4 top-6 text-emerald-400/50 p-3 hover:bg-white/5 rounded-full transition-colors"
                >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <p className="text-[11px] tracking-[4px] uppercase font-bold text-emerald-400">
                    Aktiv Økt
                </p>
                <h1 className="text-[28px] font-black uppercase tracking-tighter italic text-white mt-1">
                    🧘 Yoga
                </h1>
            </div>

            {/* Circle Timer */}
            <div className="relative" style={{ width: 260, height: 260 }}>
                {/* Pulse rings */}
                <div className="absolute -inset-4 rounded-full border-2 animate-pulse"
                    style={{ borderColor: 'rgba(52, 211, 153, 0.15)', animationDuration: '3s' }} />
                <div className="absolute -inset-4 rounded-full border-2 animate-pulse"
                    style={{ borderColor: 'rgba(52, 211, 153, 0.15)', animationDuration: '3s', animationDelay: '1.5s' }} />

                {/* Background circle */}
                <div className="absolute inset-0 rounded-full"
                    style={{
                        background: 'rgba(52, 211, 153, 0.06)',
                        border: '3px solid rgba(52, 211, 153, 0.15)'
                    }} />

                {/* Progress circle */}
                <svg className="absolute -inset-0.5 w-[264px] h-[264px]" viewBox="0 0 264 264"
                    style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                        cx="132" cy="132" r="130"
                        fill="none"
                        stroke="#34d399"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        style={{
                            filter: 'drop-shadow(0 0 12px rgba(52, 211, 153, 0.5))',
                            transition: 'stroke-dashoffset 1s linear'
                        }}
                    />
                </svg>

                {/* Timer display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[52px] font-black text-white tracking-[-2px] tabular-nums">
                        {timeStr}
                    </span>
                    <span className="text-[10px] tracking-[3px] uppercase font-bold text-emerald-300 mt-1">
                        Varighet
                    </span>
                </div>
            </div>

            {/* Stats + Stop Button */}
            <div className="w-full px-8 pb-10 space-y-4">
                {/* Stats Row */}
                <div className="flex gap-3">
                    <div className="flex-1 text-center py-3 px-2 rounded-2xl"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(52,211,153,0.1)' }}>
                        <p className="text-[22px] font-black text-white">
                            {Math.round(elapsed * 0.065)}
                        </p>
                        <p className="text-[9px] tracking-[2px] uppercase font-semibold text-emerald-300 mt-1">
                            Kalorier
                        </p>
                    </div>
                    <div className="flex-1 text-center py-3 px-2 rounded-2xl"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(52,211,153,0.1)' }}>
                        <p className="text-[22px] font-black text-red-400">♥ --</p>
                        <p className="text-[9px] tracking-[2px] uppercase font-semibold text-emerald-300 mt-1">
                            Snitt Puls
                        </p>
                    </div>
                    <div className="flex-1 text-center py-3 px-2 rounded-2xl"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(52,211,153,0.1)' }}>
                        <p className="text-[22px] font-black text-white">Lav</p>
                        <p className="text-[9px] tracking-[2px] uppercase font-semibold text-emerald-300 mt-1">
                            Intensitet
                        </p>
                    </div>
                </div>

                {/* Stop Button */}
                <button
                    onClick={() => setShowConfirm(true)}
                    className="w-full py-5 rounded-[20px] font-black text-white text-base uppercase tracking-[2px] transition-all active:scale-[0.98]"
                    style={{
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        boxShadow: '0 8px 30px rgba(239, 68, 68, 0.3)'
                    }}
                >
                    ⏹ Avslutt Økt
                </button>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-2">
                                <span className="text-3xl">🧘</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">
                                Avslutt Yoga?
                            </h3>
                            <p className="text-slate-500 font-medium">
                                Økten varer <span className="text-slate-800 font-bold">{timeStr}</span>.
                                <br />Lagre og avslutt?
                            </p>
                            <div className="flex gap-3 w-full mt-4">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 py-4 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors uppercase tracking-wider text-sm"
                                >
                                    Fortsett
                                </button>
                                <button
                                    onClick={() => { setShowConfirm(false); onFinish(); }}
                                    className="flex-1 py-4 font-bold text-white rounded-xl transition-colors uppercase tracking-wider text-sm"
                                    style={{
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                                    }}
                                >
                                    Lagre ✓
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
