import React, { useState, useEffect } from 'react';

// --- ICONS (Inline Lucid-style SVGs) ---
const Icons = {
  Dumbbell: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6.5 6.5h11" /><path d="M6.5 17.5h11" /><path d="M6 20v-3.5a2.5 2.5 0 0 1 5 0V20" /><path d="M18 20v-3.5a2.5 2.5 0 0 0-5 0V20" /><path d="M6 4v3.5a2.5 2.5 0 0 0 5 0V4" /><path d="M18 4v3.5a2.5 2.5 0 0 1-5 0V4" />
    </svg>
  ),
  Plus: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  ),
  History: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" />
    </svg>
  ),
  ChevronLeft: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  CheckCircle2: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
    </svg>
  ),
  Trash2: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  ),
  Check: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Activity: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  Trophy: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
};

// --- TYPES ---
interface Sett {
  id: number;
  kg: number;
  reps: number;
  completed: boolean;
}

interface Ovelse {
  id: number;
  navn: string;
  sett: Sett[];
}

interface Okt {
  id: number;
  navn: string;
  dato: string;
  ovelser: Ovelse[];
}

// --- COMPONENTS ---

export default function App() {
  const [view, setView] = useState<'home' | 'new_workout' | 'history'>('home');
  const [workoutHistory, setWorkoutHistory] = useState<Okt[]>(() => {
    const saved = localStorage.getItem('workoutHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeWorkout, setActiveWorkout] = useState<Okt | null>(() => {
    const saved = localStorage.getItem('activeWorkout');
    return saved ? JSON.parse(saved) : null;
  });

  // --- EFFECT: SAVE TO LOCALSTORAGE ---
  useEffect(() => {
    localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem('activeWorkout', JSON.stringify(activeWorkout));
    } else {
      localStorage.removeItem('activeWorkout');
    }
  }, [activeWorkout]);

  // --- ACTIONS ---

  const startNewWorkout = () => {
    const nyOkt: Okt = {
      id: Date.now(),
      navn: 'Kveldsøkt',
      dato: new Date().toLocaleDateString('no-NO', { day: 'numeric', month: 'long', year: 'numeric' }),
      ovelser: []
    };
    setActiveWorkout(nyOkt);
    setView('new_workout');
  };

  const addExercise = (navn: string) => {
    if (!navn || !activeWorkout) return;
    const nyOvelse: Ovelse = {
      id: Date.now(),
      navn: navn,
      sett: [{ id: Date.now() + 1, kg: 20, reps: 10, completed: false }]
    };
    setActiveWorkout({
      ...activeWorkout,
      ovelser: [...activeWorkout.ovelser, nyOvelse]
    });
  };

  const removeExercise = (exId: number) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      ovelser: activeWorkout.ovelser.filter(e => e.id !== exId)
    });
  };

  const updateSet = (exIdx: number, setIdx: number, field: 'kg' | 'reps', value: string) => {
    if (!activeWorkout) return;
    const updatedOvelser = [...activeWorkout.ovelser];
    const val = value === '' ? 0 : Number(value);
    updatedOvelser[exIdx].sett[setIdx][field] = val;
    setActiveWorkout({ ...activeWorkout, ovelser: updatedOvelser });
  };

  const toggleSetComplete = (exIdx: number, setIdx: number) => {
    if (!activeWorkout) return;
    const updatedOvelser = [...activeWorkout.ovelser];
    updatedOvelser[exIdx].sett[setIdx].completed = !updatedOvelser[exIdx].sett[setIdx].completed;
    setActiveWorkout({ ...activeWorkout, ovelser: updatedOvelser });
  };

  const addSetToExercise = (exIdx: number) => {
    if (!activeWorkout) return;
    const updatedOvelser = [...activeWorkout.ovelser];
    const forrigeSett = updatedOvelser[exIdx].sett[updatedOvelser[exIdx].sett.length - 1];
    updatedOvelser[exIdx].sett.push({
      id: Date.now(),
      kg: forrigeSett ? forrigeSett.kg : 20,
      reps: forrigeSett ? forrigeSett.reps : 10,
      completed: false
    });
    setActiveWorkout({ ...activeWorkout, ovelser: updatedOvelser });
  };

  const finishWorkout = () => {
    if (activeWorkout) {
      setWorkoutHistory([activeWorkout, ...workoutHistory]);
    }
    setActiveWorkout(null);
    setView('home');
  };

  // --- VIEWS ---

  if (view === 'home') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 pb-20 text-center relative overflow-hidden font-sans bg-slate-50">

        {/* LOGO AREA */}
        <div className="mb-8 relative z-10 animate-fade-in-up">
          <div className="w-28 h-28 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-lg border-[6px] border-white mx-auto mb-6 transform hover:scale-105 transition-transform duration-300">
            <Icons.Dumbbell className="text-white w-12 h-12 transform -rotate-45" />
          </div>
          <h1 className="text-[3.5rem] leading-none font-black text-slate-900 italic tracking-tighter mb-2">BULKBRO</h1>
          <p className="text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs">Din Digitale Treningspartner</p>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-12 relative z-10 animate-fade-in-up delay-100">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm flex flex-col items-start gap-3 hover:shadow-md transition-shadow">
            <Icons.Activity className="w-6 h-6 text-slate-900" />
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-0.5">Økter Totalt</p>
              <p className="text-2xl font-black text-slate-900 italic">{workoutHistory.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm flex flex-col items-start gap-3 hover:shadow-md transition-shadow">
            <Icons.Trophy className="w-6 h-6 text-slate-900" />
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-0.5">PRs Satt</p>
              <p className="text-2xl font-black text-slate-900 italic">0</p>
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="w-full max-w-sm space-y-4 relative z-10 animate-fade-in-up delay-200">
          <button
            onClick={startNewWorkout}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-6 rounded-full shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg uppercase tracking-wider"
          >
            <Icons.Plus className="w-6 h-6 stroke-[3px]" />
            Start Ny Økt
          </button>

          <button
            onClick={() => setView('history')}
            className="w-full bg-white hover:bg-slate-50 text-slate-900 font-black py-6 rounded-full shadow-sm border border-slate-100 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg uppercase tracking-wider group"
          >
            <Icons.History className="w-6 h-6 text-indigo-600 group-hover:rotate-[-20deg] transition-transform" />
            Historikk
          </button>
        </div>

        {/* Decorative Blur */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-3xl -z-10"></div>
        </div>

      </div>
    );
  }

  if (view === 'new_workout' && activeWorkout) {
    return (
      <div className="min-h-screen bg-slate-50 pb-40">
        <header className="bg-white/90 backdrop-blur-xl px-6 py-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-50">
          <button
            onClick={() => setView('home')}
            className="text-slate-400 p-3 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Icons.ChevronLeft className="w-8 h-8" />
          </button>
          <input
            type="text"
            value={activeWorkout.navn}
            onChange={(e) => setActiveWorkout({ ...activeWorkout, navn: e.target.value })}
            className="flex-1 text-2xl font-black bg-transparent border-none focus:ring-0 text-slate-800 uppercase tracking-tighter italic placeholder-slate-300 min-w-0"
            placeholder="Navn på økt"
          />
          <button
            onClick={finishWorkout}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-green-200 transition-all active:scale-95"
          >
            <Icons.CheckCircle2 className="w-5 h-5" />
            <span className="hidden sm:inline">Ferdig</span>
          </button>
        </header>

        <main className="max-w-xl mx-auto p-4 space-y-8 mt-6">
          {activeWorkout.ovelser.map((ex, exIdx) => (
            <div key={ex.id} className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-100/50 border border-slate-100/50">
              <div className="flex justify-between items-start mb-8 pl-4 border-l-4 border-indigo-600">
                <h3 className="font-black text-2xl text-slate-800 uppercase tracking-tighter italic leading-none">{ex.navn}</h3>
                <button
                  onClick={() => removeExercise(ex.id)}
                  className="text-slate-300 hover:text-red-400 transition-colors p-2 -mr-2 -mt-2"
                >
                  <Icons.Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-3 px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                  <div className="col-span-2 flex justify-center">#</div>
                  <div className="col-span-4 text-center">KG</div>
                  <div className="col-span-4 text-center">REPS</div>
                  <div className="col-span-2 text-center">OK</div>
                </div>

                {ex.sett.map((set, sIdx) => (
                  <div
                    key={set.id}
                    className={`grid grid-cols-12 gap-3 items-center transition-all duration-300 ${set.completed ? 'opacity-50 grayscale-[0.5]' : ''}`}
                  >
                    <div className="col-span-2 flex justify-center">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 font-bold text-sm">
                        {sIdx + 1}
                      </div>
                    </div>

                    <div className="col-span-4 relative">
                      <input
                        type="number"
                        value={set.kg}
                        onChange={(e) => updateSet(exIdx, sIdx, 'kg', e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 px-2 text-center font-bold text-slate-700 text-lg focus:ring-2 focus:ring-indigo-500 transition-all placeholder-transparent"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 pointer-events-none">KG</span>
                    </div>

                    <div className="col-span-4 relative">
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => updateSet(exIdx, sIdx, 'reps', e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 px-2 text-center font-bold text-slate-700 text-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 pointer-events-none">REPS</span>
                    </div>

                    <div className="col-span-2 flex justify-center">
                      <button
                        onClick={() => toggleSetComplete(exIdx, sIdx)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${set.completed
                            ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                            : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                          }`}
                      >
                        <Icons.Check className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => addSetToExercise(exIdx)}
                className="mt-8 w-full py-4 border-2 border-dashed border-slate-200 rounded-[1.5rem] text-slate-400 font-bold text-xs hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Icons.Plus className="w-4 h-4" /> Legg til sett
              </button>
            </div>
          ))}

          <div className="pt-8 pb-12">
            <div className="relative group">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addExercise(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="w-full appearance-none p-5 rounded-[2.5rem] bg-indigo-600 text-white font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all text-center cursor-pointer uppercase tracking-wider"
              >
                <option value="">+ Legg til ny øvelse</option>
                <option value="Knebøy">Knebøy</option>
                <option value="Benkpress">Benkpress</option>
                <option value="Markløft">Markløft</option>
                <option value="Militærpress">Militærpress</option>
                <option value="Nedtrekk">Nedtrekk</option>
                <option value="Roing">Roing</option>
                <option value="Biceps Curl">Biceps Curl</option>
                <option value="Franskpress">Franskpress</option>
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                <Icons.Plus className="w-6 h-6" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (view === 'history') {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white px-6 py-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-10">
          <button
            onClick={() => setView('home')}
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
                <div key={w.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex justify-between items-center group hover:shadow-md hover:border-indigo-100 transition-all">
                  <div>
                    <h3 className="font-black text-slate-800 text-xl uppercase tracking-tighter italic mb-1">{w.navn}</h3>
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                      <span>{w.dato}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                      {w.ovelser.length} Øvelser
                    </span>
                    <span className="text-slate-300 text-[10px] font-bold">
                      {w.ovelser.reduce((acc, curr) => acc + curr.sett.length, 0)} DOM
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  return null;
}