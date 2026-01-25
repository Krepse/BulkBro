import { useState, useEffect } from 'react';

export function Stopwatch({ startTime, completedAt, isRunning, onStart, onStop, initialSeconds = 0 }: {
    startTime?: string,
    completedAt?: string,
    isRunning: boolean,
    onStart: () => void,
    onStop: () => void,
    initialSeconds?: number
}) {
    const [elapsed, setElapsed] = useState(initialSeconds * 1000);

    useEffect(() => {
        let interval: any;
        if (isRunning && startTime) {
            // Update immediately
            const start = new Date(startTime).getTime();
            setElapsed(Date.now() - start);

            interval = setInterval(() => {
                setElapsed(Date.now() - start);
            }, 1000);
        } else if (completedAt && startTime) {
            // Finished state
            const start = new Date(startTime).getTime();
            const end = new Date(completedAt).getTime();
            setElapsed(end - start);
        } else if (initialSeconds > 0) {
            setElapsed(initialSeconds * 1000);
        } else {
            setElapsed(0);
        }
        return () => clearInterval(interval);
    }, [isRunning, startTime, completedAt, initialSeconds]);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="text-4xl font-black text-slate-700 italic tabular-nums tracking-widest w-32 text-center">
                {formatTime(elapsed)}
            </div>
            <div className="flex gap-2">
                {!isRunning && !completedAt && (
                    <button onClick={onStart} className="px-6 py-2 bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-200 active:scale-95 transition-all">
                        START
                    </button>
                )}
                {isRunning && (
                    <button onClick={onStop} className="px-6 py-2 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-200 active:scale-95 transition-all">
                        STOPP
                    </button>
                )}
                {completedAt && (
                    <button onClick={onStart} className="px-6 py-2 bg-slate-200 text-slate-500 font-bold rounded-xl active:scale-95 transition-all">
                        RESTART
                    </button>
                )}
            </div>
        </div>
    );
}
