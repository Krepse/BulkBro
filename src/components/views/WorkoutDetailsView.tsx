import { useEffect, useState } from 'react';
import { Icons } from '../ui/Icons';
import type { Okt } from '../../types';
import { getActivities, getActivityStreams, isStravaConnected, type StravaActivity } from '../../services/strava';

interface WorkoutDetailsViewProps {
    workout: Okt;
    onNavigate: (view: any) => void;
    onEdit: (workout: Okt) => void;
    onDelete: (id: number) => void;
}

export function WorkoutDetailsView({ workout, onNavigate, onEdit, onDelete }: WorkoutDetailsViewProps) {
    const [stravaConnected] = useState(isStravaConnected());
    const [stravaActivity, setStravaActivity] = useState<StravaActivity | null>(null);
    const [hrData, setHrData] = useState<{ time: number, heartrate: number }[] | null>(null);
    const [isFetchingStrava, setIsFetchingStrava] = useState(false);

    useEffect(() => {
        if (stravaConnected && workout.startTime) {
            const fetchStravaData = async () => {
                setIsFetchingStrava(true);
                try {
                    const workoutStart = new Date(workout.startTime!).getTime() / 1000;
                    const after = Math.floor(workoutStart - 14400); // -4 hours
                    const before = Math.floor(workoutStart + 14400); // +4 hours

                    const activities = await getActivities(after, before);

                    if (activities && activities.length > 0) {
                        const closest = activities.sort((a: any, b: any) => {
                            const diffA = Math.abs((new Date(a.start_date).getTime() / 1000) - workoutStart);
                            const diffB = Math.abs((new Date(b.start_date).getTime() / 1000) - workoutStart);
                            return diffA - diffB;
                        })[0];

                        setStravaActivity(closest);

                        const streams = await getActivityStreams(closest.id);
                        if (streams) {
                            const timeStream = streams.find((s: any) => s.type === 'time')?.data;
                            const hrStream = streams.find((s: any) => s.type === 'heartrate')?.data;

                            if (timeStream && hrStream) {
                                const combined = timeStream.map((t: number, i: number) => ({
                                    time: t,
                                    heartrate: hrStream[i]
                                }));
                                setHrData(combined);
                            }
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch Strava data", error);
                } finally {
                    setIsFetchingStrava(false);
                }
            };
            fetchStravaData();
        }
    }, [stravaConnected, workout]);

    const getHRStatsForExercise = (exerciseIndex: number) => {
        if (!workout.startTime || !stravaActivity || !hrData) return null;

        const activityStart = new Date(stravaActivity.start_date).getTime();

        let startTime = workout.startTime;
        if (exerciseIndex > 0) {
            for (let i = exerciseIndex - 1; i >= 0; i--) {
                const sets = workout.ovelser[i].sett;
                const lastCompleted = sets.filter(s => s.completed && s.completedAt).pop();
                if (lastCompleted && lastCompleted.completedAt) {
                    startTime = lastCompleted.completedAt;
                    break;
                }
            }
        }

        const currentSets = workout.ovelser[exerciseIndex].sett;
        const lastSet = currentSets.filter(s => s.completed && s.completedAt).pop();

        if (!lastSet || !lastSet.completedAt) return null;

        const startSeconds = (new Date(startTime).getTime() - activityStart) / 1000;
        const endSeconds = (new Date(lastSet.completedAt).getTime() - activityStart) / 1000;

        const slice = hrData.filter(d => d.time >= startSeconds && d.time <= endSeconds);
        if (slice.length === 0) return null;

        const avg = Math.round(slice.reduce((acc, curr) => acc + curr.heartrate, 0) / slice.length);
        const max = Math.max(...slice.map(d => d.heartrate));

        return { slice, avg, max };
    };

    const renderHeartRateGraph = (data: { time: number, heartrate: number }[]) => {
        if (data.length < 2) return null;
        const width = 100;
        const height = 40;

        const minHR = Math.min(...data.map(d => d.heartrate));
        const maxHR = Math.max(...data.map(d => d.heartrate));
        const hrRange = maxHR - minHR || 1;

        const startTime = data[0].time;
        const timeRange = data[data.length - 1].time - startTime || 1;

        const points = data.map(d => {
            const x = ((d.time - startTime) / timeRange) * width;
            const y = height - ((d.heartrate - minHR) / hrRange) * height;
            return `${x},${y}`;
        }).join(' ');

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12 overflow-visible">
                <polyline
                    fill="none"
                    stroke="#FC4C02"
                    strokeWidth="2"
                    points={points}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-40">
            <header className="bg-white px-6 py-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-50">
                <button
                    onClick={() => onNavigate('history')}
                    className="text-slate-400 p-3 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <Icons.ChevronLeft className="w-8 h-8" />
                </button>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Øktdetaljer</h1>
            </header>

            <main className="max-w-xl mx-auto p-6 space-y-6 mt-2">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 text-center">
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic mb-2">{workout.navn}</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{workout.dato}</p>

                    {stravaConnected && (
                        <div className="mt-4 flex flex-col items-center">
                            {isFetchingStrava ? (
                                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-wider animate-pulse">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                    Ser etter Strava-økt...
                                </div>
                            ) : stravaActivity ? (
                                <a
                                    href={`https://www.strava.com/activities/${stravaActivity.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 text-[#FC4C02] font-black text-xs uppercase tracking-wider bg-[#FC4C02]/10 px-3 py-1 rounded-full hover:bg-[#FC4C02]/20 transition-colors"
                                >
                                    <Icons.Activity className="w-3 h-3" />
                                    Synkronisert med Strava
                                </a>
                            ) : (
                                <div className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase tracking-wider">
                                    <Icons.Activity className="w-3 h-3" />
                                    Ingen Strava-økt funnet
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {workout.ovelser.map((ex, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100/50">
                            <h3 className="font-black text-xl text-slate-800 uppercase tracking-tighter italic mb-4 pl-4 border-l-4 border-indigo-500">{ex.navn}</h3>
                            <div className="space-y-2">
                                {ex.sett.map((set, sIdx) => (
                                    <div key={sIdx} className="flex justify-between items-center px-4 py-2 bg-slate-50 rounded-xl">
                                        <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">Sett {sIdx + 1}</span>
                                        <div className="flex gap-4">
                                            <span className="font-black text-slate-700">{set.kg} <span className="text-[10px] text-slate-400 font-bold">KG</span></span>
                                            <span className="font-black text-slate-700">{set.reps} <span className="text-[10px] text-slate-400 font-bold">REPS</span></span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {(() => {
                                const stats = getHRStatsForExercise(i);
                                if (stats) {
                                    return (
                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 bg-[#FC4C02]/10 rounded-lg flex items-center justify-center text-[#FC4C02]">
                                                    <Icons.Activity className="w-4 h-4" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Puls</span>
                                                <span className="text-xs font-black text-slate-700 ml-auto">{stats.avg} AVG / {stats.max} MAX</span>
                                            </div>
                                            {renderHeartRateGraph(stats.slice)}
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    ))}
                </div>

                <div className="flex gap-4 mt-8">
                    <button
                        onClick={() => onEdit(workout)}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-6 rounded-full shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg uppercase tracking-wider"
                    >
                        <Icons.Pencil className="w-5 h-5" />
                        Rediger Økt
                    </button>

                    <button
                        onClick={() => {
                            if (confirm('Er du sikker på at du vil slette denne økten?')) {
                                onDelete(workout.id);
                            }
                        }}
                        className="w-20 bg-red-50 hover:bg-red-100 text-red-500 font-bold rounded-full transition-all active:scale-95 flex items-center justify-center border border-red-100"
                    >
                        <Icons.Trash2 className="w-6 h-6" />
                    </button>
                </div>
            </main>
        </div>
    );
}
