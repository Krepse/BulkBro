import { useState, useEffect } from 'react';
import { Icons } from '../ui/Icons';

export function RestTimerOverlay({ endTime, onEndRest, onAddTime }: { endTime: number, onEndRest: () => void, onAddTime: (sec: number) => void }) {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const diff = endTime - Date.now();
            if (diff <= 0) {
                clearInterval(interval);
                onEndRest(); // Auto-start next set
            } else {
                setTimeLeft(diff);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [endTime, onEndRest]);

    const m = Math.floor(timeLeft / 60000);
    const s = Math.floor((timeLeft % 60000) / 1000);

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 p-4 pb-safe z-[100] animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Pause</p>
                    <p className="text-4xl font-black text-white italic tabular-nums">
                        {m}:{s.toString().padStart(2, '0')}
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => onAddTime(30)}
                        className="px-4 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-700 transition"
                    >
                        +30s
                    </button>
                    <button
                        onClick={onEndRest}
                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-900/50 hover:bg-indigo-500 transition active:scale-95 flex items-center gap-2"
                    >
                        START NESTE SETT <Icons.ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
