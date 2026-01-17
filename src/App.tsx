import React, { useState, useEffect } from 'react';
import { Dumbbell, Calendar, Settings, LogOut } from 'lucide-react';
import { HomeView } from './components/views/HomeView';
import { ActiveWorkoutView } from './components/views/ActiveWorkoutView';
import { HistoryView } from './components/views/HistoryView';
import { SettingsView } from './components/views/SettingsView';
import { AuthView } from './components/views/AuthView';
import { ProgramSelectView } from './components/views/ProgramSelectView';
import { ProgramFormView } from './components/views/ProgramFormView';
import { ProgramsView } from './components/views/ProgramsView'; // Assuming this exists for managing programs
import { ExerciseLibraryView } from './components/views/ExerciseLibraryView';
import { ExerciseFormView } from './components/views/ExerciseFormView';
import { ExerciseSelectView } from './components/views/ExerciseSelectView';
import { WorkoutDetailsView } from './components/views/WorkoutDetailsView';

import { useWorkout } from './hooks/useWorkout';
import { supabase } from './lib/supabase';
import type { Exercise, Okt, Program } from './types';

// Simple types for legacy function calls/params
type ViewState = 'home' | 'active' | 'history' | 'settings' | 'new_workout' | 'select_program' | 'create_program' | 'edit_program_form' | 'exercise_library' | 'create_exercise' | 'select_exercise' | 'workout_details';

export default function App() {
  const {
    activeWorkout,
    startWorkout,
    finishWorkout,
    cancelWorkout,
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
    editWorkout, // Ensure exposed
    startNewWorkout, // Ensure mapped
    deleteWorkout // Exposed from hook
  } = useWorkout();

  const [view, setView] = useState<ViewState>('home');
  const [returnView, setReturnView] = useState<ViewState>('home');

  // Ephemeral State
  const [selectedWorkout, setSelectedWorkout] = useState<Okt | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [draftProgramName, setDraftProgramName] = useState('');
  const [draftProgramExercises, setDraftProgramExercises] = useState<string[]>([]);


  // Auth Guard
  if (!user) {
    return <AuthView />;
  }

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
            onSelectWorkout={(w) => { setSelectedWorkout(w); setView('workout_details'); }}
          />
        );

      case 'workout_details':
        return selectedWorkout ? (
          <WorkoutDetailsView
            workout={selectedWorkout}
            onNavigate={handleNavigate}
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
            customExercises={customExercises}
            onSaveExercise={saveExercise}
            onDeleteExercise={deleteExercise}
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
            onEditExercise={(ex) => { setEditingExercise(ex); setReturnView('exercise_library'); setView('create_exercise'); }}
            onCreateExercise={() => { setEditingExercise(null); setReturnView('exercise_library'); setView('create_exercise'); }}
          />
        );

      case 'create_exercise':
        return (
          <ExerciseFormView
            onNavigate={handleNavigate}
            editingExercise={editingExercise}
            returnView={returnView}
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
            onCreateExercise={() => { setEditingExercise(null); setReturnView('select_exercise'); setView('create_exercise'); }}
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
          <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
            <button
              onClick={() => setView('home')}
              className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-200 ${view === 'home' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Dumbbell className={`w-6 h-6 mb-1 ${view === 'home' ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-medium">Trening</span>
            </button>

            <button
              onClick={() => setView('history')}
              className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-200 ${view === 'history' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Calendar className={`w-6 h-6 mb-1 ${view === 'history' ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-medium">Historikk</span>
            </button>

            <button
              onClick={() => setView('settings')}
              className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-200 ${view === 'settings' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Settings className={`w-6 h-6 mb-1 ${view === 'settings' ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-medium">Innstillinger</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
