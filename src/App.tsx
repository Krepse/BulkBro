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

  ClipboardList: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" />
    </svg>
  ),
  Pencil: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
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

interface Program {
  id: number;
  navn: string;
  ovelser: string[]; // List of exercise names
}

// --- COMPONENTS ---


// --- CONSTANTS ---
const MANTRAS = [
  "LET'S BULKING GO, BRO!",
  "PAIN IS WEAKNESS LEAVING THE BULK, BRO!",
  "SHUT UP AND BULK, BRO!",
  "NO BULK, NO GLORY, BRO!",
  "SQUAT TILL YOU BARF, BRO!",
  "BULK UNTIL THE CASKET DROPS, BRO!",
  "REAL BROS NEVER MISS BULK DAY!",
  "BULK OR DIE, BRO!",
  "YOUR GIRLFRIEND CALLED, SHE WANTS HER BULK BACK, BRO!",
  "EAT BIG TO GET BIG, BULKBRO STYLE!",
  "SECOND PLACE IS FOR BROS WHO DON'T BULK!",
  "IF THE BAR AIN'T BENDING, YOU AIN'T BULKING, BRO!",
  "BULK THE PAIN AWAY, BRO!",
  "GO HARD OR GO HOME TO YOUR MAMA, BULKBRO!",
  "THE ONLY THING SMALLER THAN YOUR BULK IS YOUR HEART, BRO!",
  "EMBRACE THE BULK OR EMBRACE DEFEAT, BRO!",
  "BULK TILL THE BUTTONS POP, BRO!",
  "A BRO WITHOUT A BULK IS JUST A DUDE!",
  "LIFT HEAVY, BULK HARD, REPEAT BRO!",
  "WELCOME TO THE HOUSE OF BULK, BRO!",
];

export default function App() {
  const [view, setView] = useState<'home' | 'new_workout' | 'history' | 'create_program' | 'select_program' | 'workout_details' | 'edit_program_form'>('home');
  const [workoutHistory, setWorkoutHistory] = useState<Okt[]>(() => {
    try {
      const saved = localStorage.getItem('workoutHistory');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to parse workout history", e);
      return [];
    }
  });
  const [programs, setPrograms] = useState<Program[]>(() => {
    const saved = localStorage.getItem('programs');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeWorkout, setActiveWorkout] = useState<Okt | null>(() => {
    const saved = localStorage.getItem('activeWorkout');
    return saved ? JSON.parse(saved) : null;
  });
  // Temporary state for creating a new program
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramExercises, setNewProgramExercises] = useState<string[]>([]);

  const [mantra, setMantra] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState<Okt | null>(null);

  // --- PROGRAM MANAGEMENT STATE ---
  const [editingProgramId, setEditingProgramId] = useState<number | null>(null);

  // --- EFFECT: SET RANDOM MANTRA ---
  useEffect(() => {
    setMantra(MANTRAS[Math.floor(Math.random() * MANTRAS.length)]);
  }, []);

  // --- EFFECT: SAVE TO LOCALSTORAGE ---
  useEffect(() => {
    localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  useEffect(() => {
    localStorage.setItem('programs', JSON.stringify(programs));
  }, [programs]);

  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem('activeWorkout', JSON.stringify(activeWorkout));
    } else {
      localStorage.removeItem('activeWorkout');
    }
  }, [activeWorkout]);

  // --- ACTIONS ---

  const startNewWorkout = (program?: Program) => {
    const nyOkt: Okt = {
      id: Date.now(),
      navn: program ? program.navn : 'Kveldsøkt',
      dato: new Date().toLocaleString('no-NO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      ovelser: program
        ? program.ovelser.map(navn => ({
          id: Date.now() + Math.random(),
          navn: navn,
          sett: [{ id: Date.now() + Math.random(), kg: 20, reps: 10, completed: false }]
        }))
        : []
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
      const existingIndex = workoutHistory.findIndex(w => w.id === activeWorkout.id);
      if (existingIndex >= 0) {
        // Update existing workout
        const updatedHistory = [...workoutHistory];
        updatedHistory[existingIndex] = activeWorkout;
        setWorkoutHistory(updatedHistory);
      } else {
        // Add new workout
        setWorkoutHistory([activeWorkout, ...workoutHistory]);
      }
    }
    setActiveWorkout(null);
    setView('home');
    // Refresh mantra when returning to home
    setMantra(MANTRAS[Math.floor(Math.random() * MANTRAS.length)]);
  };

  const editWorkout = (workout: Okt) => {
    // Create a deep copy to avoid mutating history directly while editing
    setActiveWorkout(JSON.parse(JSON.stringify(workout)));
    setView('new_workout');
  };

  const startCreateProgram = () => {
    setEditingProgramId(null);
    setNewProgramName('');
    setNewProgramExercises([]);
    setView('edit_program_form');
  };

  const openEditProgram = (program: Program) => {
    setEditingProgramId(program.id);
    setNewProgramName(program.navn);
    setNewProgramExercises([...program.ovelser]);
    setView('edit_program_form');
  };

  const saveProgram = () => {
    if (!newProgramName || newProgramExercises.length === 0) return;

    if (editingProgramId) {
      setPrograms(programs.map(p => p.id === editingProgramId ? { ...p, navn: newProgramName, ovelser: newProgramExercises } : p));
    } else {
      const newProgram: Program = {
        id: Date.now(),
        navn: newProgramName,
        ovelser: newProgramExercises
      };
      setPrograms([...programs, newProgram]);
    }

    setEditingProgramId(null);
    setNewProgramName('');
    setNewProgramExercises([]);
    setView('create_program');
  };



  const deleteProgram = (id: number) => {
    setPrograms(programs.filter(p => p.id !== id));
  };

  const openWorkoutDetails = (workout: Okt) => {
    setSelectedWorkout(workout);
    setView('workout_details');
  };


  // --- VIEWS ---

  if (view === 'home') {
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
          <button
            onClick={() => setView('select_program')}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-6 rounded-full shadow-xl shadow-indigo-900/50 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg uppercase tracking-wider border border-white/10"
          >
            <Icons.Plus className="w-6 h-6 stroke-[3px]" />
            Start Ny Økt
          </button>

          <button
            onClick={() => setView('create_program')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-6 rounded-full shadow-xl shadow-slate-900/50 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg uppercase tracking-wider border border-white/10"
          >
            <Icons.ClipboardList className="w-6 h-6" />
            Programmer
          </button>

          <button
            onClick={() => setView('history')}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-6 rounded-full shadow-sm border border-white/10 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg uppercase tracking-wider group backdrop-blur-md"
          >
            <Icons.History className="w-6 h-6 text-white group-hover:rotate-[-20deg] transition-transform" />
            Historikk
          </button>
        </div>

      </div>
    );
  }



  if (view === 'create_program') {
    return (
      <div className="min-h-screen bg-slate-50 pb-40">
        <header className="bg-white px-6 py-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-50">
          <button
            onClick={() => setView('home')}
            className="text-slate-400 p-3 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Icons.ChevronLeft className="w-8 h-8" />
          </button>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Programmer</h1>
        </header>

        <main className="max-w-xl mx-auto p-6 space-y-4 mt-6">
          <button
            onClick={startCreateProgram}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-[2rem] shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg uppercase tracking-wider mb-8"
          >
            <Icons.Plus className="w-6 h-6 stroke-[3px]" />
            Nytt Program
          </button>

          {programs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-bold italic">
              Ingen programmer lagret ennå.
            </div>
          ) : (
            programs.map(program => (
              <div
                key={program.id}
                className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-md hover:border-indigo-200 transition-all relative overflow-hidden cursor-pointer"
                onClick={() => openEditProgram(program)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-slate-900 text-2xl uppercase tracking-tighter italic">{program.navn}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{program.ovelser.length} Øvelser</p>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openEditProgram(program)} className="text-slate-200 hover:text-indigo-500 transition-colors p-2">
                      <Icons.Pencil className="w-5 h-5" />
                    </button>
                    <button onClick={() => deleteProgram(program.id)} className="text-slate-200 hover:text-red-400 transition-colors p-2">
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

  if (view === 'edit_program_form') {
    return (
      <div className="min-h-screen bg-slate-50 pb-40">
        <header className="bg-white px-6 py-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-50">
          <button
            onClick={() => setView('create_program')}
            className="text-slate-400 p-3 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Icons.ChevronLeft className="w-8 h-8" />
          </button>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">{editingProgramId ? 'Rediger Program' : 'Nytt Program'}</h1>
        </header>

        <main className="max-w-xl mx-auto p-6 space-y-8 mt-6">
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Program Navn</label>
            <input
              type="text"
              value={newProgramName}
              onChange={(e) => setNewProgramName(e.target.value)}
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
                  onClick={() => setNewProgramExercises(newProgramExercises.filter((_, i) => i !== idx))}
                  className="text-slate-300 hover:text-red-400 p-2"
                >
                  <Icons.Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}

            <div className="relative group mt-4">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    setNewProgramExercises([...newProgramExercises, e.target.value]);
                    e.target.value = "";
                  }
                }}
                className="w-full appearance-none p-4 rounded-[2rem] bg-indigo-50 text-indigo-600 font-bold text-sm border-2 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-100 focus:outline-none transition-all text-center cursor-pointer uppercase tracking-wider"
              >
                <option value="">+ Legg til øvelse i program</option>
                <option value="Knebøy">Knebøy</option>
                <option value="Benkpress">Benkpress</option>
                <option value="Markløft">Markløft</option>
                <option value="Militærpress">Militærpress</option>
                <option value="Nedtrekk">Nedtrekk</option>
                <option value="Roing">Roing</option>
                <option value="Biceps Curl">Biceps Curl</option>
                <option value="Franskpress">Franskpress</option>
              </select>
            </div>
          </div>

          <button
            onClick={saveProgram}
            disabled={!newProgramName || newProgramExercises.length === 0}
            className="w-full bg-slate-900 disabled:bg-slate-300 hover:bg-slate-800 text-white font-bold py-6 rounded-full shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg uppercase tracking-wider mt-12"
          >
            <Icons.CheckCircle2 className="w-6 h-6" />
            Lagre Program
          </button>
        </main>
      </div>
    );
  }

  if (view === 'select_program') {
    return (
      <div className="min-h-screen bg-slate-50 pb-40">
        <header className="bg-white px-6 py-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-50">
          <button
            onClick={() => setView('home')}
            className="text-slate-400 p-3 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Icons.ChevronLeft className="w-8 h-8" />
          </button>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Velg Økt</h1>
        </header>

        <main className="max-w-xl mx-auto p-6 space-y-4 mt-6">
          {/* Empty Workout Option */}
          <button
            onClick={() => startNewWorkout()}
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
              <button onClick={() => setView('create_program')} className="text-indigo-500 font-bold underline uppercase tracking-wider text-sm">Lag ditt første program</button>
            </div>
          ) : (
            programs.map(program => (
              <div key={program.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-md hover:border-indigo-200 transition-all relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-slate-900 text-2xl uppercase tracking-tighter italic">{program.navn}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{program.ovelser.length} Øvelser</p>
                  </div>
                  <button onClick={() => deleteProgram(program.id)} className="text-slate-200 hover:text-red-400 transition-colors">
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
                  onClick={() => startNewWorkout(program)}
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
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={activeWorkout.navn}
              onChange={(e) => setActiveWorkout({ ...activeWorkout, navn: e.target.value })}
              className="w-full text-2xl font-black bg-transparent border-none focus:ring-0 text-slate-800 uppercase tracking-tighter italic placeholder-slate-300 min-w-0 p-0"
              placeholder="Navn på økt"
            />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{activeWorkout.dato}</p>
          </div>
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
                <button
                  key={w.id}
                  onClick={() => openWorkoutDetails(w)}
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

  if (view === 'workout_details' && selectedWorkout) {
    return (
      <div className="min-h-screen bg-slate-50 pb-40">
        <header className="bg-white px-6 py-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-50">
          <button
            onClick={() => setView('history')}
            className="text-slate-400 p-3 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Icons.ChevronLeft className="w-8 h-8" />
          </button>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Øktdetaljer</h1>
        </header>

        <main className="max-w-xl mx-auto p-6 space-y-6 mt-2">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 text-center">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic mb-2">{selectedWorkout.navn}</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{selectedWorkout.dato}</p>
          </div>

          <div className="space-y-4">
            {selectedWorkout.ovelser.map((ex, i) => (
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
              </div>
            ))}
          </div>

          <button
            onClick={() => editWorkout(selectedWorkout)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-6 rounded-full shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg uppercase tracking-wider mt-8"
          >
            <Icons.Pencil className="w-5 h-5" />
            Rediger Økt
          </button>
        </main>
      </div>
    );
  }

  return null;
}