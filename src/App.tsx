import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { useWorkout } from './hooks/useWorkout';
import { exchangeToken } from './services/strava';
import type { Exercise, Program } from './types';

// VIEW IMPORTS
import { HomeView } from './views/HomeView';
import { ActiveWorkoutView } from './views/ActiveWorkoutView';
import { HistoryView } from './views/HistoryView';
import { AuthView } from './views/AuthView';
import { ProgramSelectView } from './views/ProgramSelectView';
import { ProgramFormView } from './views/ProgramFormView';
import { ProgramsView } from './views/ProgramsView';
import { ExerciseLibraryView } from './views/ExerciseLibraryView';
import { ExerciseFormView } from './views/ExerciseFormView';
import { ExerciseSelectView } from './views/ExerciseSelectView';
import { ExerciseStatsView } from './views/ExerciseStatsView';
import { WorkoutDetailsView } from './views/WorkoutDetailsView';
import { SettingsView } from './views/SettingsView';

// Simple types for legacy function calls/params
type ViewState = 'home' | 'active' | 'history' | 'settings' | 'new_workout' | 'select_program' | 'create_program' | 'edit_program_form' | 'exercise_library' | 'create_exercise' | 'select_exercise' | 'workout_details' | 'programs' | 'exercise_stats';

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
    addRestTime,
    reorderExercises
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
  const processingCode = useRef<string | null>(null);

  useEffect(() => {
    const handleStravaCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      // Prevent processing the same code multiple times (Strict Mode or re-renders)
      if (code && user && processingCode.current !== code) {
        processingCode.current = code; // Mark as processing
        console.log("Strava code detected, exchanging...");

        try {
          const success = await exchangeToken(code);

          if (success) {
            console.log("Strava connected successfully!");
            // Remove code from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            // Navigate to settings to show connected state
            setView('settings');
          } else {
            console.error("Failed to exchange Strava token");
            alert("Feil ved kobling til Strava. Sjekk at kontoen din er gyldig og prøv igjen.");
            // Reset so user can try again if they reload with same code (unlikely but safe)
            processingCode.current = null;
          }
        } catch (e) {
          console.error("Error during exchange", e);
          processingCode.current = null;
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
    const sortedHistory = [...workoutHistory].sort((a, b) => {
      const timeA = a.startTime ? new Date(a.startTime).getTime() : 0;
      const timeB = b.startTime ? new Date(b.startTime).getTime() : 0;
      return timeA - timeB;
    });

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
            date: workout.startTime || new Date().toISOString(), // Use ISO startTime
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
          onReorder={reorderExercises}
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
      {renderContent()}
    </div>
  );
}
