
import { useState, useEffect, useMemo } from 'react';
import { supabase } from './lib/supabase';
import { useWorkout } from './hooks/useWorkout';
import { useMantra } from './hooks/useMantra';
import {
  isStravaConnected,
  disconnectStrava,
  getActivityStreams,
  exchangeToken,
  getRecentActivities,
  calculateRecoveryStatus,
  findOverlappingActivity,
  calculateDetailedStats,
  type ExerciseStats
} from './services/strava';
import type { Exercise, Okt, Program, ExerciseType } from './types';
import { Button } from './components/ui/Button';
import { Icons } from './components/ui/Icons';
import { ExerciseList } from './components/workout/ExerciseList';

// --- VIEW COMPONENTS START ---

interface HomeViewProps {
  onNavigate: (view: any) => void;
  workoutHistory: Okt[];
}

function HomeView({ onNavigate, workoutHistory }: HomeViewProps) {
  const mantra = useMantra();
  const [recoveryStatus, setRecoveryStatus] = useState<'JA' | 'OK' | 'NEI' | 'LOADING' | 'OFFLINE'>('LOADING');
  const [showRecoveryInfo, setShowRecoveryInfo] = useState(false);

  useEffect(() => {
    async function checkRecovery() {
      const connected = await isStravaConnected();
      if (!connected) {
        setRecoveryStatus('OFFLINE');
        return;
      }
      try {
        const activities = await getRecentActivities();
        const status = calculateRecoveryStatus(activities);
        setRecoveryStatus(status);
      } catch (e) {
        console.error(e);
        setRecoveryStatus('OFFLINE');
      }
    }
    checkRecovery();
  }, []);

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
            <p className="text-2xl font-black text-white italic">0</p>
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

interface ActiveWorkoutViewProps {
  workout: Okt;
  onUpdateWorkoutName: (name: string) => void;
  onFinish: () => void;
  onNavigate: (view: any) => void;
  onRemoveExercise: (id: string | number) => void;
  onUpdateSet: (exIdx: number, setIdx: number, field: any, value: any, shouldSync?: boolean) => void;
  onToggleSet: (exIdx: number, setIdx: number) => void;
  onAddSet: (exIdx: number) => void;
  onAddExercise: () => void;
}

// --- REST TIMER COMPONENT ---
function RestTimerOverlay({ endTime, onEndRest, onAddTime }: { endTime: number, onEndRest: () => void, onAddTime: (sec: number) => void }) {
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

function ActiveWorkoutView({
  workout,
  onUpdateWorkoutName,
  onFinish,
  onNavigate,
  onRemoveExercise,
  onUpdateSet,
  onToggleSet,
  onAddSet,
  onAddExercise,
  restTimer,
  onEndRest,
  onAddTime
}: ActiveWorkoutViewProps & {
  restTimer: { isActive: boolean, endTime: number | null },
  onEndRest: () => void,
  onAddTime: (s: number) => void
}) {

  return (
    <div className="min-h-screen bg-slate-50 pb-40">
      <header className="bg-white/90 backdrop-blur-xl px-6 py-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-50">
        <button
          onClick={() => onNavigate('home')}
          className="text-slate-400 p-3 hover:bg-slate-100 rounded-full transition-colors"
        >
          <Icons.ChevronLeft className="w-8 h-8" />
        </button>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={workout.navn}
            onChange={(e) => onUpdateWorkoutName(e.target.value)}
            className="w-full text-2xl font-black bg-transparent border-none focus:ring-0 text-slate-800 uppercase tracking-tighter italic placeholder-slate-300 min-w-0 p-0"
            placeholder="Navn på økt"
          />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{workout.dato}</p>
        </div>
        <button
          onClick={onFinish}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-green-200 transition-all active:scale-95"
        >
          <Icons.CheckCircle2 className="w-5 h-5" />
          <span className="hidden sm:inline">Ferdig</span>
        </button>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-8 mt-6">
        {workout.ovelser.map((ex, exIdx) => (
          <div key={ex.id} className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-100/50 border border-slate-100/50">
            <div className="flex justify-between items-start mb-8 pl-4 border-l-4 border-indigo-600">
              <div>
                <h3 className="font-black text-2xl text-slate-800 uppercase tracking-tighter italic leading-none">{ex.navn}</h3>
                {ex.type && ex.type !== 'Oppvarming' && (
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{ex.type}</p>
                )}
              </div>
              <button
                onClick={() => onRemoveExercise(ex.id)}
                className="text-slate-300 hover:text-red-400 transition-colors p-2 -mr-2 -mt-2"
              >
                <Icons.Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {ex.type !== 'Oppvarming' && (
                <div className="grid grid-cols-12 gap-3 px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                  <div className="col-span-2 flex justify-center">#</div>
                  {ex.type !== 'Egenvekt' && <div className="col-span-4 text-center">KG</div>}
                  <div className={`${ex.type === 'Egenvekt' ? 'col-span-8' : 'col-span-4'} text-center`}>REPS</div>
                  <div className="col-span-2 text-center">OK</div>
                </div>
              )}

              {ex.sett.map((set, sIdx) => (
                <div
                  key={set.id}
                  className={`grid grid-cols-12 gap-3 items-center transition-all duration-300 ${set.completed ? 'opacity-50 grayscale-[0.5]' : ''}`}
                >
                  {ex.type !== 'Oppvarming' && (
                    <div className="col-span-2 flex justify-center">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 font-bold text-sm">
                        {sIdx + 1}
                      </div>
                    </div>
                  )}

                  {ex.type === 'Oppvarming' ? (
                    <div className="col-span-12 flex items-center justify-center py-4">
                      <Stopwatch
                        // Use stored duration (reps) if available, otherwise calculate from start/end
                        initialSeconds={set.reps || 0}
                        startTime={set.startTime}
                        completedAt={set.completedAt}
                        isRunning={!!set.startTime && !set.completed}
                        onStart={() => onUpdateSet(exIdx, sIdx, 'startTime', new Date().toISOString())}
                        onStop={() => {
                          const now = new Date();
                          const start = new Date(set.startTime!);
                          const durationSeconds = Math.round((now.getTime() - start.getTime()) / 1000);
                          onUpdateSet(exIdx, sIdx, 'completedAt', now.toISOString());
                          // Save duration and TRIGGER SYNC
                          onUpdateSet(exIdx, sIdx, 'reps', durationSeconds, true);
                        }}
                      />
                    </div>
                  ) : (
                    <>
                      {ex.type !== 'Egenvekt' && (
                        <div className="col-span-4 relative">
                          <input
                            type="number"
                            value={set.kg}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => onUpdateSet(exIdx, sIdx, 'kg', e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-2xl py-3 px-2 text-center font-bold text-slate-700 text-lg focus:ring-2 focus:ring-indigo-500 transition-all placeholder-transparent"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 pointer-events-none">KG</span>
                        </div>
                      )}

                      <div className={`${ex.type === 'Egenvekt' ? 'col-span-8' : 'col-span-4'} relative`}>
                        <input
                          type="number"
                          value={set.reps}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => onUpdateSet(exIdx, sIdx, 'reps', e.target.value)}
                          className="w-full bg-slate-50 border-none rounded-2xl py-3 px-2 text-center font-bold text-slate-700 text-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 pointer-events-none">REPS</span>
                      </div>
                    </>
                  )}

                  <div className="col-span-2 flex justify-center">
                    {ex.type !== 'Oppvarming' && (
                      <button
                        onClick={() => onToggleSet(exIdx, sIdx)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${set.completed
                          ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                          : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                          }`}
                      >
                        <Icons.Check className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {ex.type !== 'Oppvarming' && (
              <Button
                onClick={() => onAddSet(exIdx)}
                variant="secondary"
                className="mt-8 w-full border-dashed border-slate-200 text-slate-400 font-bold text-xs hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/50"
                size="md"
              >
                <Icons.Plus className="w-4 h-4" /> Legg til sett
              </Button>
            )}
          </div>
        ))}

        <div className="pt-8 pb-12">
          <Button
            onClick={onAddExercise}
            variant="primary"
            className="w-full"
          >
            <Icons.Plus className="w-6 h-6" />
            + Legg til ny øvelse
          </Button>
        </div>

        <div className="pb-8">
          <button
            onClick={onFinish}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-6 rounded-[2rem] shadow-xl shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-3 text-xl uppercase tracking-wider"
          >
            <Icons.CheckCircle2 className="w-8 h-8" />
            Lagre og Avslutt
          </button>
        </div>
      </main>

      {/* REST TIMER OVERLAY */}
      {restTimer.isActive && restTimer.endTime && (
        <RestTimerOverlay
          endTime={restTimer.endTime}
          onEndRest={onEndRest}
          onAddTime={onAddTime}
        />
      )}
    </div>
  );
}

interface HistoryViewProps {
  onNavigate: (view: any) => void;
  workoutHistory: Okt[];
  onSelectWorkout: (workout: Okt) => void;
}

function HistoryView({ onNavigate, workoutHistory, onSelectWorkout }: HistoryViewProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white px-6 py-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-10">
        <button
          onClick={() => onNavigate('home')}
          className="text-slate-400 p-3 hover:bg-slate-100 rounded-full transition-colors"
        >
          <Icons.ChevronLeft className="w-8 h-8" />
        </button>
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Historikk</h1>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-4 mt-4">
        {workoutHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-50">
            <div className="bg-slate-200 p-8 rounded-full mb-6">
              <Icons.History className="w-16 h-16 text-slate-400" />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Ingen økter lagret ennå</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workoutHistory.map(w => (
              <button
                key={w.id}
                onClick={() => onSelectWorkout(w)}
                className="w-full bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex justify-between items-center group hover:shadow-md hover:border-indigo-100 transition-all text-left"
              >
                <div>
                  <h3 className="font-black text-slate-800 text-xl uppercase tracking-tighter italic mb-1">{w.navn}</h3>
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                    <span>{w.dato}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                    {w.ovelser?.length || 0} Øvelser
                  </span>
                  <span className="text-slate-300 text-[10px] font-bold">
                    {w.ovelser?.reduce((acc, curr) => acc + (curr.sett?.length || 0), 0) || 0} SETT
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const AuthView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // ADMIN BYPASS
    if ((email === 'Admin' && password === 'Admin') || (email === 'admin@admin.no' && password === '123456')) {
      localStorage.setItem('bb_admin_bypass', 'true');
      window.location.reload();
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Sjekk e-posten din for å bekrefte kontoen!' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-blue-500 mb-2">BulkBro</h1>
          <p className="text-slate-400">Logg inn for å synkronisere treningen din</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex space-x-2 mb-6 bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => { setIsLogin(true); setMessage(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
            >
              Logg Inn
            </button>
            <button
              onClick={() => { setIsLogin(false); setMessage(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
            >
              Registrer
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">E-post</label>
              <div className="relative">
                <Icons.Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                  placeholder="navn@eksempel.no"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Passord</label>
              <div className="relative">
                <Icons.Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                <Icons.AlertCircle className="w-4 h-4 shrink-0" />
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Icons.Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                <>
                  <Icons.LogIn className="w-5 h-5" />
                  Logg Inn
                </>
              ) : (
                <>
                  <Icons.UserPlus className="w-5 h-5" />
                  Opprett Konto
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

interface ProgramSelectViewProps {
  programs: Program[];
  onNavigate: (view: any) => void;
  onStartEmpty: () => void;
  onStartProgram: (program: Program) => void;
  onDeleteProgram: (id: number) => void;
}

function ProgramSelectView({
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

interface ProgramFormViewProps {
  onNavigate: (view: any) => void;
  onSave: (program: Program) => void;
  editingProgram: Program | null;
  onAddExercise: () => void;
  newProgramExercises: string[];
  draftName: string;
  setDraftName: (name: string) => void;
  setDraftExercises: (exercises: string[]) => void;
}

function ProgramFormView({
  onNavigate,
  onSave,
  editingProgram,
  onAddExercise,
  newProgramExercises,
  draftName,
  setDraftName,
  setDraftExercises
}: ProgramFormViewProps) {

  // Initialize draft if editing
  useEffect(() => {
    if (editingProgram && draftName === '' && newProgramExercises.length === 0) {
      setDraftName(editingProgram.navn);
      setDraftExercises(editingProgram.ovelser);
    }
  }, [editingProgram, setDraftName, setDraftExercises]);

  const handleSave = () => {
    const program: Program = {
      id: editingProgram ? editingProgram.id : Date.now(),
      navn: draftName,
      ovelser: newProgramExercises
    };
    onSave(program);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-40">
      <header className="bg-white px-6 py-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-50">
        <button
          onClick={() => onNavigate('create_program')}
          className="text-slate-400 p-3 hover:bg-slate-100 rounded-full transition-colors"
        >
          <Icons.ChevronLeft className="w-8 h-8" />
        </button>
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">{editingProgram ? 'Rediger Program' : 'Nytt Program'}</h1>
      </header>

      <main className="max-w-xl mx-auto p-6 space-y-8 mt-6">
        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Program Navn</label>
          <input
            type="text"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            className="w-full bg-white p-5 rounded-[2rem] border border-slate-200 text-slate-800 font-bold text-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder-slate-300"
            placeholder="F.eks. Helkropp A"
          />
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Øvelser ({newProgramExercises.length})</label>
          {newProgramExercises.map((exName, idx) => (
            <div key={idx} className="bg-white p-4 rounded-[1.5rem] border border-slate-100 flex justify-between items-center shadow-sm">
              <span className="font-bold text-slate-700 uppercase tracking-tight">{exName}</span>
              <button
                onClick={() => setDraftExercises(newProgramExercises.filter((_, i) => i !== idx))}
                className="text-slate-300 hover:text-red-400 p-2"
              >
                <Icons.Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}

          <div className="relative group mt-4">
            <button
              onClick={onAddExercise}
              className="w-full p-4 rounded-[2rem] bg-indigo-50 text-indigo-600 font-bold text-sm border-2 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-100 transition-all text-center uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Icons.Search className="w-5 h-5" />
              + Legg til øvelse
            </button>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={!draftName || newProgramExercises.length === 0}
          variant="slate"
          className="mt-12 w-full"
        >
          <Icons.CheckCircle2 className="w-6 h-6" />
          Lagre Program
        </Button>
      </main>
    </div>
  );
}

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

function ExerciseStatsView({
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
              data={stats.map(s => ({ label: s.date, value: s.estimated1RM }))}
              color="#6366f1"
            />
          </div>
        </div>

        {/* Volume Chart */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="font-black text-lg text-slate-800 uppercase tracking-tighter italic mb-6">Volum (Total Kg)</h3>
          <div className="h-48 w-full">
            <BarChart
              data={stats.map(s => ({ label: s.date, value: s.totalVolume }))}
              color="#10b981"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

interface ProgramsViewProps {
  programs: Program[];
  onNavigate: (view: any) => void;
  onCreateProgram: () => void;
  onEditProgram: (program: Program) => void;
  onDeleteProgram: (id: number) => void;
}

function ProgramsView({
  programs,
  onNavigate,
  onCreateProgram,
  onEditProgram,
  onDeleteProgram
}: ProgramsViewProps) {
  const [programToDelete, setProgramToDelete] = useState<number | null>(null);

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
                  <button onClick={() => setProgramToDelete(program.id)} className="text-slate-200 hover:text-red-400 transition-colors p-2">
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

      {/* CONFIRM DELETE MODAL */}
      {programToDelete !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Slette program?</h3>
              <p className="text-slate-500">Er du sikker på at du vil slette dette programmet? Dette kan ikke angres.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setProgramToDelete(null)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={() => {
                  if (programToDelete !== null) {
                    onDeleteProgram(programToDelete);
                    setProgramToDelete(null);
                  }
                }}
                className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
              >
                Slett
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ExerciseLibraryViewProps {
  onNavigate: (view: any) => void;
  customExercises: Exercise[];
  onDeleteExercise: (id: string) => void;
  onEditExercise: (ex: Exercise) => void;
  onCreateExercise: () => void;
  onViewStats?: (exerciseName: string) => void;
}

function ExerciseLibraryView({
  onNavigate,
  customExercises,
  onDeleteExercise,
  onEditExercise,
  onCreateExercise,
  onViewStats
}: ExerciseLibraryViewProps) {
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 pb-40">
      <header className="bg-white px-6 py-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-50">
        <button
          onClick={() => onNavigate('home')}
          className="text-slate-400 p-3 hover:bg-slate-100 rounded-full transition-colors"
        >
          <Icons.ChevronLeft className="w-8 h-8" />
        </button>
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Øvelsesbibliotek</h1>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-6 mt-2">
        <ExerciseList
          exercises={customExercises}
          search={search}
          onSearchChange={setSearch}
          mode="library"
          onDelete={onDeleteExercise}
          onEdit={onEditExercise}
          onCreate={onCreateExercise}
          onViewStats={onViewStats}
        />
      </main>
    </div>
  );
}

interface ExerciseFormViewProps {
  onNavigate: (view: any) => void;
  onSave: (name: string, type: string) => void;
  editingExercise?: Exercise | null;
  returnView: string;
}

const EXERCISE_TYPES: ExerciseType[] = ['Stang', 'Manualer', 'Kabel', 'Egenvekt', 'Maskin'];

function ExerciseFormView({
  onNavigate,
  onSave,
  editingExercise,
  returnView
}: ExerciseFormViewProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<ExerciseType>('Stang');

  useEffect(() => {
    if (editingExercise) {
      setName(editingExercise.name);
      // Fallback to 'Stang' if existing data is weird, though useWorkout handles migration mostly.
      // If editingExercise doesn't have a type property yet (runtime issue), try to deduce or default.
      setType(editingExercise.type || 'Stang');
    } else {
      setName('');
      setType('Stang');
    }
  }, [editingExercise]);

  return (
    <div className="min-h-screen bg-slate-50 pb-40">
      <header className="bg-white px-6 py-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-50">
        <button
          onClick={() => onNavigate(returnView)}
          className="text-slate-400 p-3 hover:bg-slate-100 rounded-full transition-colors"
        >
          <Icons.ChevronLeft className="w-8 h-8" />
        </button>
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">
          {editingExercise ? 'Rediger Øvelse' : 'Ny Øvelse'}
        </h1>
      </header>

      <main className="max-w-xl mx-auto p-6 space-y-8 mt-6">
        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Navn</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white p-5 rounded-[2rem] border border-slate-200 text-slate-800 font-bold text-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder-slate-300"
            placeholder="F.eks. Benkpress"
            autoFocus
          />
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Øvelsestype</label>
          <div className="grid grid-cols-2 gap-3">
            {EXERCISE_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`p-4 rounded-[1.5rem] border-2 font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${type === t
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:text-indigo-500'
                  }`}
              >
                {type === t && <Icons.CheckCircle2 className="w-4 h-4" />}
                {t}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={() => onSave(name, type)}
          disabled={!name}
          variant="slate"
          className="mt-12 w-full"
        >
          <Icons.CheckCircle2 className="w-6 h-6" />
          {editingExercise ? 'Oppdater Øvelse' : 'Lagre Øvelse'}
        </Button>
      </main>
    </div>
  );
}

interface ExerciseSelectViewProps {
  onNavigate: (view: any) => void;
  onSelect: (ex: Exercise) => void;
  customExercises: Exercise[];
  onCreateExercise: () => void;
  returnView: string;
}

function ExerciseSelectView({
  onNavigate,
  onSelect,
  customExercises,
  onCreateExercise,
  returnView
}: ExerciseSelectViewProps) {
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 pb-40">
      <header className="bg-white px-6 py-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-50">
        <button
          onClick={() => onNavigate(returnView)} // Navigate back to where we came from
          className="text-slate-400 p-3 hover:bg-slate-100 rounded-full transition-colors"
        >
          <Icons.ChevronLeft className="w-8 h-8" />
        </button>
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Velg Øvelse</h1>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-6 mt-2">
        <ExerciseList
          exercises={customExercises}
          search={search}
          onSearchChange={setSearch}
          mode="select"
          onSelect={onSelect}
          onCreate={onCreateExercise}
        />
      </main>
    </div>
  );
}

interface WorkoutDetailsViewProps {
  workout: Okt;
  onNavigate: (view: any) => void;
  onEdit: (workout: Okt) => void;
  onDelete: (id: string | number) => void;
  onUpdate: (workout: Okt) => void;

  allWorkouts: Okt[];
  onViewStats: (name: string) => void;
}

function WorkoutDetailsView({ workout, onNavigate, onEdit, onDelete, onUpdate, allWorkouts, onViewStats }: WorkoutDetailsViewProps) {
  const [stravaConnected, setStravaConnected] = useState(false);
  const [stravaActivity, setStravaActivity] = useState<any | null>(null);
  const [exerciseStats, setExerciseStats] = useState<Record<string, ExerciseStats> | null>(null);
  const [setStats, setSetStats] = useState<Record<string, { avgHr: number, maxHr: number }> | null>(null);
  const [workoutStats, setWorkoutStats] = useState<{ calories: number, intensity: number, hrSeries?: number[] } | null>(null);
  const [isFetchingStrava, setIsFetchingStrava] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    isStravaConnected().then(setStravaConnected);
  }, []);

  useEffect(() => {
    // 1. Check for Cached Analysis AND Validity
    if (workout.stravaAnalysis) {
      // Validate that the cached keys actually match the current set IDs
      // (Fixes issue where IDs were regenerated by DB, breaking the map)
      const currentSetIds = new Set(workout.ovelser.flatMap(e => e.sett.map(s => String(s.id))));
      const cachedSetIds = Object.keys(workout.stravaAnalysis.setStats || {});

      const idsMatch = cachedSetIds.length === 0 || cachedSetIds.some(id => currentSetIds.has(id));
      const hasCalories = (workout.stravaAnalysis.workoutStats?.calories || 0) > 0;

      // INVALIDATE if IDs don't match OR if calories are 0 (to trigger new fallback calculation)
      const isCacheValid = idsMatch && hasCalories;

      if (isCacheValid) {
        console.log("Using cached Strava analysis");
        setExerciseStats(workout.stravaAnalysis.exerciseStats);
        setSetStats(workout.stravaAnalysis.setStats);
        setWorkoutStats(workout.stravaAnalysis.workoutStats);
        setStravaActivity({ id: workout.stravaAnalysis.activityId }); // Mock subset for UI link
        return;
      } else {
        console.warn("Cached Strava analysis has stale IDs. Re-fetching...");
      }
    }

    // 2. Fetch if connected and no cache
    // Only fetch if we have a valid start time and end time (or infer end time)
    // For now, if we don't have explicit end time, we can't find overlap accurately, 
    // but findOverlappingActivity handles fuzzy matching if needed or we assume workout length.
    // Ideally Okt should have endTime. If not, we use startTime + 2 hours window?
    // Let's assume valid start time.
    if (stravaConnected && workout.startTime) {
      const fetchStravaData = async () => {
        setIsFetchingStrava(true);
        try {
          // If workout has no endTime, assume 90 mins for search window
          const endTime = workout.endTime || new Date(new Date(workout.startTime!).getTime() + 90 * 60000).toISOString();

          const activity = await findOverlappingActivity(workout.startTime!, endTime);

          if (activity) {
            setStravaActivity(activity);
            const streams = await getActivityStreams(activity.id);
            if (streams) {
              // streams is already an object due to key_by_type=true
              const stats = calculateDetailedStats(workout, activity, streams);
              if (stats) {
                setExerciseStats(stats.exerciseStats);
                setSetStats(stats.setStats);
                setWorkoutStats(stats.workoutStats);

                // PERSIST CACHE
                const updatedWorkout = {
                  ...workout,
                  stravaAnalysis: {
                    activityId: activity.id,
                    exerciseStats: stats.exerciseStats,
                    setStats: stats.setStats,
                    workoutStats: stats.workoutStats
                  }
                };
                onUpdate(updatedWorkout);
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

  // --- STATS CALCULATIONS ---
  const stats = useMemo(() => {
    // 1. DURATION
    let duration = "0m";
    if (workout.startTime && workout.endTime) {
      const diff = new Date(workout.endTime).getTime() - new Date(workout.startTime).getTime();
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      duration = hrs > 0 ? `${hrs}t ${mins}m` : `${mins}m`;
    } else if (workout.ovelser.length > 0) {
      // Fallback: Estimates based on sets if no end time
      const sets = workout.ovelser.flatMap(e => e.sett).filter(s => s.completedAt);
      if (sets.length > 1) {
        sets.sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime());
        const start = workout.startTime ? new Date(workout.startTime).getTime() : new Date(sets[0].completedAt!).getTime() - 60000;
        const end = new Date(sets[sets.length - 1].completedAt!).getTime();
        const diff = end - start;
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        duration = hrs > 0 ? `${hrs}t ${mins}m` : `${mins}m`;
      }
    }

    // 2. TOTAL VOLUME
    let volume = 0;
    workout.ovelser.forEach(ex => {
      ex.sett.forEach(s => {
        if (s.completed) volume += (s.kg * s.reps);
      });
    });

    // 3. PRs
    const prExerciseIds = new Set<string | number>();
    const previousWorkouts = allWorkouts.filter(w => new Date(w.dato).getTime() < new Date(workout.dato).getTime());

    workout.ovelser.forEach(ex => {
      if (ex.type === 'Oppvarming' || ex.type === 'Egenvekt') return;

      // Max weight in THIS workout for this exercise
      const currentMax = Math.max(...ex.sett.map(s => s.kg));
      if (currentMax <= 0) return;

      // Find max weight in ALL previous workouts for same exercise name
      let historyMax = 0;
      previousWorkouts.forEach(pw => {
        const sameEx = pw.ovelser.find(pe => pe.navn === ex.navn); // Match by name!
        if (sameEx && sameEx.sett) {
          const m = Math.max(...sameEx.sett.map(s => s.kg));
          if (m > historyMax) historyMax = m;
        }
      });

      // If we beat history, it's a PR! (And history must exist, otherwise first workout is all PRs? Maybe fun, let's say historyMax > 0 for "beat previous", or just default is PR? Let's strictly require beating a non-zero previous record to avoid "PR" on first ever try unless user wants that. Let's start with strict: must beat previous best > 0. Actually, beating 0 is technically a PR if it's the first time. Let's allow it if historyMax is 0 it means "New Record" too).
      // Update: User usually wants "New PR" badge even on first try if it sets the baseline.
      if (currentMax > historyMax) {
        prExerciseIds.add(ex.id);
      }
    });

    return { duration, volume, prCount: prExerciseIds.size, prExerciseIds };
  }, [workout, allWorkouts]);



  return (
    <div className="min-h-screen bg-slate-50 pb-40 relative">
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

        {/* STATS GRID */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Totalt Løft</p>
            <p className="text-lg font-black text-slate-800 break-all">{stats.volume.toLocaleString()} KG</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tid</p>
            <p className="text-lg font-black text-slate-800 whitespace-nowrap">{stats.duration}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Nye PRs</p>
            <p className="text-lg font-black text-indigo-500">{stats.prCount} 🏆</p>
          </div>
        </div>

        <div className="space-y-4">
          {[...workout.ovelser].sort((a, b) => {
            const getStartTime = (ex: any) => {
              const times = ex.sett
                .filter((s: any) => s.startTime || s.completedAt)
                .map((s: any) => new Date(s.startTime || s.completedAt!).getTime());
              return times.length > 0 ? Math.min(...times) : Infinity;
            };
            return getStartTime(a) - getStartTime(b);
          }).map((ex, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100/50">
              <div className="mb-4 pl-4 border-l-4 border-indigo-500">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <h3 className="font-black text-xl text-slate-800 uppercase tracking-tighter italic leading-none">{ex.navn}</h3>
                    <button
                      onClick={() => onViewStats(ex.navn)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors active:scale-95"
                      title="Se statistikk"
                    >
                      <Icons.BarChart2 className="w-4 h-4" />
                    </button>
                  </div>
                  {stats.prExerciseIds.has(ex.id) && (
                    <span className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-2 py-1 rounded-full border border-yellow-200 uppercase tracking-wide flex items-center gap-1">
                      🏆 Ny PR
                    </span>
                  )}
                </div>
                {ex.type && ex.type !== 'Oppvarming' && (
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{ex.type}</p>
                )}
              </div>
              <div className="space-y-2">
                {ex.sett.map((set, sIdx) => (
                  <div key={sIdx} className="flex justify-between items-center px-4 py-2 bg-slate-50 rounded-xl">
                    <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">Sett {sIdx + 1}</span>

                    {/* HR Stats Column if Strava connected (Placed LEFT of data now) */}


                    {ex.type === 'Oppvarming' ? (
                      <div className="flex gap-4 items-center flex-1 justify-end">
                        <span className="font-black text-slate-700">
                          {(() => {
                            if (set.reps && set.reps > 0) {
                              const mins = Math.floor(set.reps / 60);
                              const secs = Math.floor(set.reps % 60);
                              return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                            }
                            if (!set.startTime || !set.completedAt) return "00:00";
                            const diff = new Date(set.completedAt).getTime() - new Date(set.startTime).getTime();
                            if (diff < 0) return "00:00";
                            const mins = Math.floor(diff / 60000);
                            const secs = Math.floor((diff % 60000) / 1000);
                            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                          })()}
                          <span className="text-[10px] text-slate-400 font-bold ml-1">TID</span>
                        </span>
                      </div>
                    ) : (
                      <div className="flex gap-4 items-center flex-1 justify-end">
                        <span className="font-black text-slate-700">{set.kg} <span className="text-[10px] text-slate-400 font-bold">KG</span></span>
                        <span className="font-black text-slate-700">{set.reps} <span className="text-[10px] text-slate-400 font-bold">REPS</span></span>
                      </div>
                    )}

                    {/* HR Stats Column if Strava connected (Placed RIGHT of data now) */}
                    <div className="w-16 text-center ml-2">
                      {setStats && setStats[set.id] ? (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md whitespace-nowrap">
                          ♥ {setStats[set.id].maxHr}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300">-</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-3">

                <span className="text-[10px] font-bold bg-red-50 text-red-500 px-2 py-1 rounded-md border border-red-100 uppercase tracking-wider flex items-center gap-1">
                  <Icons.Activity className="w-3 h-3" /> Snitt: {(exerciseStats && exerciseStats[ex.id]) ? `${exerciseStats[ex.id].avgHr} bpm` : '-'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Workout Summary Stats */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center text-center divide-x divide-slate-100">
            <div className="flex-1 px-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Kalorier</p>
              <p className="text-2xl font-black text-slate-800 italic">
                {workoutStats ? `${workoutStats.calories} kcal` : '-'}
              </p>
            </div>
            <div className="flex-1 px-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Intensitet</p>
              <div className="flex items-center justify-center gap-1">
                {workoutStats ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className={`w-3 h-8 rounded-full ${i < workoutStats.intensity ? 'bg-indigo-500' : 'bg-slate-100'}`} />
                  ))
                ) : (
                  <span className="text-2xl font-black text-slate-200 italic">-</span>
                )}
              </div>
              {workoutStats && <p className="text-xs font-bold text-slate-400 mt-1">{workoutStats.intensity}/5</p>}
            </div>
          </div>
        </div>

        {/* Heart Rate Chart */}
        {workoutStats?.hrSeries && workoutStats.hrSeries.length > 0 && (
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mt-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Pulsutvikling</p>
            <div className="h-32 w-full">
              <HeartRateChart data={workoutStats.hrSeries} color="#ef4444" />
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => onEdit(workout)}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-6 rounded-full shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg uppercase tracking-wider"
          >
            <Icons.Pencil className="w-5 h-5" />
            Rediger Økt
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-20 bg-red-50 hover:bg-red-100 text-red-500 font-bold rounded-full transition-all active:scale-95 flex items-center justify-center border border-red-100"
          >
            <Icons.Trash2 className="w-6 h-6" />
          </button>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-2">
                <Icons.Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Slette treningsøkt?</h3>
              <p className="text-slate-500 font-medium">
                Er du sikker på at du vil slette <span className="text-slate-800 font-bold">{workout.navn}</span>?
                <br />Denne handlingen kan ikke angres.
              </p>

              <div className="flex gap-3 w-full mt-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-4 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors uppercase tracking-wider text-sm"
                >
                  Avbryt
                </button>
                <button
                  onClick={() => {
                    onDelete(workout.id);
                    setShowDeleteConfirm(false);
                  }}
                  className="flex-1 py-4 font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors uppercase tracking-wider text-sm shadow-lg shadow-red-200"
                >
                  Slett
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SettingsViewProps {
  onNavigate: (view: any) => void;
  userEmail: string | undefined;
  onSignOut: () => void;
}

function SettingsView({ onNavigate, userEmail, onSignOut }: SettingsViewProps) {
  const [stravaConnected, setStravaConnected] = useState(false);

  useEffect(() => {
    isStravaConnected().then(setStravaConnected);
  }, []);

  const handleConnectStrava = () => {
    const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
    // Dynamic redirect URI based on current origin (works for localhost and Netlify)
    const redirectUri = window.location.origin;
    const scope = "activity:read_all,activity:write";
    window.location.href = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=${scope}`;
  };

  const handleDisconnectStrava = async () => {
    await disconnectStrava();
    setStravaConnected(false);
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
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Innstillinger</h1>
      </header>

      <main className="max-w-xl mx-auto p-6 space-y-8 mt-6">
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-6">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Konto</h2>
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl uppercase">
              {userEmail?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-slate-900 truncate">{userEmail}</p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Logget inn</p>
            </div>
          </div>

          <button
            onClick={onSignOut}
            className="w-full py-4 bg-red-50 text-red-500 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors uppercase tracking-wider text-sm"
          >
            <Icons.LogOut className="w-5 h-5" />
            Logg ut
          </button>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-6">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Integrasjoner</h2>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#FC4C02]/10 rounded-xl flex items-center justify-center text-[#FC4C02]">
                <Icons.Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg italic">STRAVA</h3>
                <p className="text-xs text-slate-400 font-medium">Synkroniser økter automatisk</p>
              </div>
            </div>

            {stravaConnected ? (
              <button
                onClick={handleDisconnectStrava}
                className="w-full py-3 bg-slate-200 text-slate-500 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-300 transition-colors uppercase tracking-wider text-xs"
              >
                <Icons.Unlink className="w-4 h-4" />
                Koble fra Strava
              </button>
            ) : (
              <button
                onClick={handleConnectStrava}
                className="w-full py-3 bg-[#FC4C02] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#E34402] transition-colors uppercase tracking-wider text-xs shadow-lg shadow-[#FC4C02]/20"
              >
                <Icons.Activity className="w-4 h-4" />
                Koble til Strava
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-6">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Om Appen</h2>
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
              <Icons.Info className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900">BulkBro v1.0</p>
              <p className="text-xs text-slate-400 font-medium">Utviklet av Stian Berg</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
// --- HELPER COMPONENTS ---
function Stopwatch({ startTime, completedAt, isRunning, onStart, onStop, initialSeconds = 0 }: {
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

// --- VIEW COMPONENTS END ---

// Simple types for legacy function calls/params
type ViewState = 'home' | 'active' | 'history' | 'settings' | 'new_workout' | 'select_program' | 'create_program' | 'edit_program_form' | 'exercise_library' | 'create_exercise' | 'select_exercise' | 'workout_details' | 'programs' | 'exercise_stats';



// ... (existing imports)

interface HeartRateChartProps {
  data: number[];
  color?: string;
}

function HeartRateChart({ data, color = "#6366f1" }: HeartRateChartProps) {
  if (!data || data.length === 0) return null;

  // Sampling to reduce DOM nodes if too many points (e.g. > 200)
  const MAX_POINTS = 200;
  const step = Math.ceil(data.length / MAX_POINTS);
  const sampledData = data.filter((_, i) => i % step === 0);

  const maxVal = Math.max(...sampledData);
  const minVal = Math.min(...sampledData);
  const range = maxVal - minVal || 1;

  // SVG scaling
  const points = sampledData.map((val, i) => {
    const x = (i / (sampledData.length - 1)) * 100;
    const y = 100 - ((val - minVal) / range) * 80 - 10; // keep padding
    return `${x},${y}`;
  }).join(' ');

  const fillPolygon = `0,100 ${points} 100,100`;

  return (
    <div className="w-full h-full relative">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={fillPolygon} fill="url(#hrGradient)" />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="absolute top-0 right-0 text-[10px] font-bold text-slate-300">Max: {maxVal}</div>
      <div className="absolute bottom-0 right-0 text-[10px] font-bold text-slate-300">Min: {minVal}</div>
    </div>
  );
}

interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

function LineChart({ data, color = "#6366f1" }: { data: ChartDataPoint[], color?: string }) {
  if (!data || data.length === 0) return <div className="text-slate-400 text-xs text-center p-4">Ingen data</div>;

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const range = (maxVal - minVal) || 1;
  const paddedMax = maxVal + range * 0.1;
  const paddedMin = Math.max(0, minVal - range * 0.1);
  const finalRange = paddedMax - paddedMin || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - paddedMin) / finalRange) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-full relative group">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <line x1="0" y1="25" x2="100" y2="25" stroke="#f1f5f9" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#f1f5f9" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="#f1f5f9" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />

        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-sm"
        />
      </svg>
      <div className="absolute top-0 right-0 text-[10px] font-bold text-slate-400 bg-white/80 px-1 rounded">Max: {maxVal}</div>
      <div className="absolute inset-x-0 bottom-0 h-8 flex items-end justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="text-[10px] text-slate-400">{data[0].label}</span>
        <span className="text-[10px] text-slate-400">{data[data.length - 1].label}</span>
      </div>
    </div>
  );
}

function BarChart({ data, color = "#6366f1" }: { data: ChartDataPoint[], color?: string }) {
  if (!data || data.length === 0) return <div className="text-slate-400 text-xs text-center p-4">Ingen data</div>;

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values);

  return (
    <div className="w-full h-full flex items-end justify-between gap-1 pt-4">
      {data.map((d, i) => {
        const height = (d.value / maxVal) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
            <div
              style={{ height: `${height}%`, backgroundColor: color }}
              className="w-full rounded-t-sm opacity-80 hover:opacity-100 transition-all"
            ></div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 w-max">
              <div className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg z-50">
                {d.value}
                <div className="text-[8px] font-normal opacity-70">{d.label}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );
}




export default function App() {
  const {
    activeWorkout,
    startWorkout,
    finishWorkout,
    updateSet,
    addExercise,
    removeExercise,
    workoutHistory,
    programs,
    saveProgram,
    deleteProgram,
    customExercises,
    saveExercise,
    deleteExercise,
    user,
    toggleSetComplete,
    addSetToExercise,
    updateWorkoutName,
    editWorkout,
    deleteWorkout,
    updateHistoryItem,
    restTimer,
    endRest,
    addRestTime
  } = useWorkout();

  const [view, setView] = useState<ViewState>('home');
  const [returnView, setReturnView] = useState<ViewState>('home');

  // Ephemeral State
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | number | null>(null);
  const [exerciseName, setExerciseName] = useState<string>('');
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [draftProgramName, setDraftProgramName] = useState('');
  const [draftProgramExercises, setDraftProgramExercises] = useState<string[]>([]);

  // --- STRAVA CALLBACK HANDLER ---
  useEffect(() => {
    const handleStravaCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code && user) {
        console.log("Strava code detected, exchanging...");
        const success = await exchangeToken(code, user.id);

        if (success) {
          console.log("Strava connected successfully!");
          // Remove code from URL
          window.history.replaceState({}, document.title, window.location.pathname);
          // Navigate to settings to show connected state
          setView('settings');
        } else {
          console.error("Failed to exchange Strava token");
        }
      }
    };

    handleStravaCallback();
  }, [user]);

  // Auth Guard
  if (!user) {
    return <AuthView />;
  }

  // Calculate statistics for a specific exercise across all history
  const getExerciseStats = (exerciseName: string) => {
    const stats: { date: string; maxWeight: number; estimated1RM: number; totalVolume: number }[] = [];

    // Sort history by date ascending
    const sortedHistory = [...workoutHistory].sort((a, b) => new Date(a.dato).getTime() - new Date(b.dato).getTime());

    sortedHistory.forEach(workout => {
      const ex = workout.ovelser.find(e => e.navn === exerciseName);
      if (ex && ex.sett) {
        let maxWeight = 0;
        let best1RM = 0;
        let volume = 0;

        ex.sett.forEach(s => {
          if (s.kg > 0 && s.reps > 0) {
            // Max Weight
            if (s.kg > maxWeight) maxWeight = s.kg;

            // Estimated 1RM (Epley formula)
            const e1rm = s.kg * (1 + s.reps / 30);
            if (e1rm > best1RM) best1RM = e1rm;

            // Volume
            volume += s.kg * s.reps;
          }
        });

        if (maxWeight > 0) {
          stats.push({
            date: workout.dato, // Using the formatted string for now, could parse real date for chart x-axis
            maxWeight,
            estimated1RM: Math.round(best1RM),
            totalVolume: volume
          });
        }
      }
    });

    return stats;
  };

  const handleNavigate = (target: any) => setView(target);

  // Wrappers to match View expectations
  const handleStartWorkoutWrapper = (program?: Program) => {
    startWorkout(program);
    setView('active'); // FORCE NAVIGATION
  };

  // --- RENDER LOGIC ---

  // 1. Priority: Active Workout overrides everything unless we are in specific sub-views?
  if (activeWorkout && (view === 'home' || view === 'active' || view === 'new_workout' || view === 'select_program')) {
    // Also include 'select_program' in the auto-redirect list if we want implicit behavior,
    // but the setView('active') above is the primary fix.
    // Let's keep it clean: if activeWorkout exists, we generally want to be in 'active' view
    // UNLESS the user explicitly navigated away (e.g. to settings, history).
    // The current logic is a bit brittle. 
    // Let's rely on setView('active') and include it here just in case.
  }

  const renderContent = () => {
    if (activeWorkout && (view === 'home' || view === 'active' || view === 'new_workout')) {
      return (
        <ActiveWorkoutView
          workout={activeWorkout}
          onFinish={() => { finishWorkout(); setView('home'); }}
          onUpdateWorkoutName={updateWorkoutName}
          onNavigate={handleNavigate}
          onRemoveExercise={removeExercise}
          onUpdateSet={updateSet}
          onToggleSet={toggleSetComplete}
          onAddSet={addSetToExercise}
          onAddExercise={() => {
            setReturnView('active'); // active workout view
            setView('select_exercise');
          }}
          restTimer={restTimer}
          onEndRest={endRest}
          onAddTime={addRestTime}
        />
      );
    }

    switch (view) {
      case 'home':
        return <HomeView onNavigate={handleNavigate} workoutHistory={workoutHistory} />;

      case 'history':
        return (
          <HistoryView
            onNavigate={handleNavigate}
            workoutHistory={workoutHistory}
            onSelectWorkout={(w) => { setSelectedWorkoutId(w.id); setView('workout_details'); }}
          />
        );

      case 'workout_details':
        const workoutDetails = workoutHistory.find(w => w.id === selectedWorkoutId);
        return workoutDetails ? (
          <WorkoutDetailsView
            workout={workoutDetails}
            onUpdate={updateHistoryItem}
            allWorkouts={workoutHistory}
            onNavigate={handleNavigate}
            onViewStats={(name) => {
              setExerciseName(name);
              setReturnView('workout_details');
              setView('exercise_stats');
            }}
            onEdit={(w) => { editWorkout(w); setView('active'); }}
            onDelete={(id) => {
              deleteWorkout(id);
              setView('history');
            }}
          />
        ) : <HomeView onNavigate={handleNavigate} workoutHistory={workoutHistory} />;


      case 'settings':
        return (
          <SettingsView
            onNavigate={handleNavigate}
            userEmail={user?.email}
            onSignOut={() => supabase.auth.signOut()}
          />
        );

      case 'select_program':
        return (
          <ProgramSelectView
            programs={programs}
            onNavigate={handleNavigate}
            onStartEmpty={() => handleStartWorkoutWrapper()}
            onStartProgram={handleStartWorkoutWrapper}
            onDeleteProgram={deleteProgram}
          />
        );

      case 'programs':
        return (
          <ProgramsView
            programs={programs}
            onNavigate={handleNavigate}
            onCreateProgram={() => {
              setEditingProgram(null);
              setDraftProgramName('');
              setDraftProgramExercises([]);
              setView('edit_program_form');
            }}
            onEditProgram={(p) => {
              setEditingProgram(p);
              setDraftProgramName(p.navn);
              setDraftProgramExercises(p.ovelser);
              setView('edit_program_form');
            }}
            onDeleteProgram={deleteProgram}
          />
        );

      case 'create_program': // View list of programs to edit/create
        return (
          <ProgramsView
            programs={programs}
            onNavigate={handleNavigate}
            onCreateProgram={() => {
              setEditingProgram(null);
              setDraftProgramName('');
              setDraftProgramExercises([]);
              setView('edit_program_form');
            }}
            onEditProgram={(p) => {
              setEditingProgram(p);
              setDraftProgramName(p.navn);
              setDraftProgramExercises(p.ovelser);
              setView('edit_program_form');
            }}
            onDeleteProgram={deleteProgram}
          />
        );

      case 'edit_program_form':
        return (
          <ProgramFormView
            onNavigate={handleNavigate}
            editingProgram={editingProgram}
            draftName={draftProgramName}
            setDraftName={setDraftProgramName}
            newProgramExercises={draftProgramExercises}
            setDraftExercises={setDraftProgramExercises}
            onAddExercise={() => {
              setReturnView('edit_program_form');
              setView('select_exercise');
            }}
            onSave={(p) => { saveProgram(p); setView('create_program'); }}
          />
        );

      case 'exercise_library':
        return (
          <ExerciseLibraryView
            onNavigate={handleNavigate}
            customExercises={customExercises}
            onDeleteExercise={deleteExercise}
            onEditExercise={(ex) => saveExercise(ex)}
            onCreateExercise={() => { setEditingExercise(null); setReturnView('exercise_library'); setView('create_exercise'); }}
            onViewStats={(name) => {
              setExerciseName(name); // Ensure state exists or use context
              setView('exercise_stats');
            }}
          />
        );

      case 'exercise_stats':
        // We need to pass the name. Assuming render uses 'exerciseName' state.
        return (
          <ExerciseStatsView
            onNavigate={() => setView(returnView || 'exercise_library')}
            stats={getExerciseStats(exerciseName)}
            exerciseName={exerciseName}
          />
        );

      case 'create_exercise':
        return (
          <ExerciseFormView
            onNavigate={handleNavigate}
            editingExercise={editingExercise}
            returnView={returnView === 'exercise_library' ? 'exercise_library' : 'select_exercise'}
            onSave={(name, type) => {
              const newEx: Exercise = {
                id: editingExercise?.id || crypto.randomUUID(),
                name,
                type: type as any
              };
              saveExercise(newEx);
              // Navigate back
              setView(returnView === 'exercise_library' ? 'exercise_library' : 'select_exercise');
            }}
          />
        );

      case 'select_exercise':
        return (
          <ExerciseSelectView
            onNavigate={handleNavigate}
            customExercises={customExercises}
            onCreateExercise={() => { setEditingExercise(null); setView('create_exercise'); }}
            returnView={returnView}
            onSelect={(ex) => {
              if (returnView === 'edit_program_form') {
                setDraftProgramExercises([...draftProgramExercises, ex.name]);
                setView('edit_program_form');
              } else if (returnView === 'active' || returnView === 'new_workout') {
                addExercise(ex.name, ex.type); // active workout add
                setView('active');
              }
            }}
          />
        );

      default:
        return <HomeView onNavigate={handleNavigate} workoutHistory={workoutHistory} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500/30">
      <main className="flex-1 overflow-y-auto pb-24">
        {renderContent()}
      </main>

      {/* Bottom Navigation Bar */}
      {!activeWorkout && (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800 pb-safe z-50">
          <div className="flex justify-around items-center h-20 max-w-md mx-auto px-4">
            <button
              onClick={() => setView('home')}
              className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-200 ${view === 'home' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Icons.Home className={`w-6 h-6 mb-1 ${view === 'home' ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-medium">Hjem</span>
            </button>

            <button
              onClick={() => setView('programs')}
              className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-200 ${view === 'programs' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Icons.ClipboardList className={`w-6 h-6 mb-1 ${view === 'programs' ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-medium">Programmer</span>
            </button>

            <button
              onClick={() => setView('exercise_library')}
              className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-200 ${view === 'exercise_library' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Icons.Dumbbell className={`w-6 h-6 mb-1 ${view === 'exercise_library' ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-medium">Øvelser</span>
            </button>

            <button
              onClick={() => setView('history')}
              className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-200 ${view === 'history' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Icons.History className={`w-6 h-6 mb-1 ${view === 'history' ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-medium">Historikk</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
