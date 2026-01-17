import { useState, useEffect } from 'react';
import { exchangeToken } from './services/strava';
import { useWorkout } from './hooks/useWorkout';
import { HomeView } from './components/views/HomeView';
import { ActiveWorkoutView } from './components/views/ActiveWorkoutView';
import { HistoryView } from './components/views/HistoryView';
import { WorkoutDetailsView } from './components/views/WorkoutDetailsView';
import { ProgramsView } from './components/views/ProgramsView';
import { ProgramFormView } from './components/views/ProgramFormView';
import { ProgramSelectView } from './components/views/ProgramSelectView';
import { ExerciseLibraryView } from './components/views/ExerciseLibraryView';
import { ExerciseFormView } from './components/views/ExerciseFormView';
import { ExerciseSelectView } from './components/views/ExerciseSelectView';
import { SettingsView } from './components/views/SettingsView';
import type { Exercise, Okt, Program } from './types';

export default function App() {
  // --- STATE ---
  const [view, setView] = useState<'home' | 'new_workout' | 'history' | 'create_program' | 'select_program' | 'workout_details' | 'edit_program_form' | 'settings' | 'select_exercise' | 'create_exercise' | 'exercise_library'>('home');
  const [returnView, setReturnView] = useState<'edit_program_form' | 'new_workout' | 'exercise_library'>('edit_program_form');

  // Ephemeral State for Views
  const [selectedWorkout, setSelectedWorkout] = useState<Okt | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  // Program Draft State
  const [draftProgramName, setDraftProgramName] = useState('');
  const [draftProgramExercises, setDraftProgramExercises] = useState<string[]>([]);

  // --- HOOKS ---
  const {
    workoutHistory,
    programs,
    customExercises,
    activeWorkout,
    startNewWorkout,
    addExercise,
    removeExercise,
    updateSet,
    toggleSetComplete,
    addSetToExercise,
    updateWorkoutName,
    finishWorkout,
    deleteWorkout,
    editWorkout,
    saveProgram,
    deleteProgram,
    saveCustomExercise,
    deleteCustomExercise
  } = useWorkout();

  // --- STRAVA AUTH EFFECT ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);
      exchangeToken(code).then((success) => {
        if (success) {
          setView('settings');
        }
      });
    }
  }, []);

  // --- NAVIGATION HANDLERS ---
  const handleNavigate = (target: any) => setView(target);

  // --- EXERCISE HANDLERS ---
  const handleCreateExercise = () => {
    setEditingExercise(null);
    setReturnView(view as any);
    setView('create_exercise');
  };

  const handleEditExercise = (ex: Exercise) => {
    setEditingExercise(ex);
    setReturnView('exercise_library');
    setView('create_exercise');
  };

  const handleSaveExercise = (name: string, type: string) => {
    const newEx: Exercise = {
      id: editingExercise ? editingExercise.id : crypto.randomUUID(),
      name,
      type: type as any
    };
    saveCustomExercise(newEx);
    setView(returnView === 'exercise_library' ? 'exercise_library' : 'select_exercise');
  };

  const handleSelectExercise = (exercise: Exercise) => {
    if (returnView === 'edit_program_form') {
      const nameToStore = exercise.name;
      // Note: Programs just store names, so type info is looked up in startNewWorkout
      setDraftProgramExercises([...draftProgramExercises, nameToStore]);
      setView('edit_program_form');
    } else if (returnView === 'new_workout') {
      addExercise(exercise.name, exercise.type);
      setView('new_workout');
    }
  };

  const handleDeleteExercise = (id: string) => {
    if (confirm('Er du sikker på at du vil slette denne øvelsen permanent?')) {
      deleteCustomExercise(id);
    }
  };

  // --- PROGRAM HANDLERS ---
  const handleCreateProgram = () => {
    setEditingProgram(null);
    setDraftProgramName('');
    setDraftProgramExercises([]);
    setView('edit_program_form');
  };

  const handleEditProgram = (program: Program) => {
    setEditingProgram(program);
    setDraftProgramName(program.navn);
    setDraftProgramExercises([...program.ovelser]);
    setView('edit_program_form');
  };

  const handleSaveProgram = (program: Program) => {
    saveProgram(program);
    setView('create_program');
  };

  const handleAddExerciseToDraftProgram = () => {
    setReturnView('edit_program_form');
    setView('select_exercise');
  };

  // --- WORKOUT HANDLERS ---
  const handleStartNewWorkout = (program?: Program) => {
    startNewWorkout(program);
    setView('new_workout');
  };

  const handleEditWorkout = (workout: Okt) => {
    editWorkout(workout);
    setView('new_workout');
  };

  const handleFinishWorkout = () => {
    finishWorkout();
    setView('home');
  };

  const handleSelectWorkoutDetails = (workout: Okt) => {
    setSelectedWorkout(workout);
    setView('workout_details');
  };

  const handleAddExerciseToWorkout = () => {
    setReturnView('new_workout');
    setView('select_exercise');
  };


  // --- VIEW ROUTING ---
  if (view === 'home') {
    return <HomeView onNavigate={handleNavigate} workoutHistory={workoutHistory} />;
  }

  if (view === 'new_workout' && activeWorkout) {
    return (
      <ActiveWorkoutView
        workout={activeWorkout}
        onUpdateWorkoutName={updateWorkoutName}
        onFinish={handleFinishWorkout}
        onNavigate={handleNavigate}
        onRemoveExercise={removeExercise}
        onUpdateSet={updateSet}
        onToggleSet={toggleSetComplete}
        onAddSet={addSetToExercise}
        onAddExercise={handleAddExerciseToWorkout}
      />
    );
  }

  if (view === 'history') {
    return (
      <HistoryView
        onNavigate={handleNavigate}
        workoutHistory={workoutHistory}
        onSelectWorkout={handleSelectWorkoutDetails}
      />
    );
  }

  if (view === 'workout_details' && selectedWorkout) {
    return (
      <WorkoutDetailsView
        workout={selectedWorkout}
        onNavigate={handleNavigate}
        onEdit={handleEditWorkout}
        onDelete={(id) => {
          deleteWorkout(id);
          setView('history');
        }}
      />
    );
  }

  if (view === 'create_program') { // Actually ProgramsView
    return (
      <ProgramsView
        programs={programs}
        onNavigate={handleNavigate}
        onCreateProgram={handleCreateProgram}
        onEditProgram={handleEditProgram}
        onDeleteProgram={deleteProgram}
      />
    );
  }

  if (view === 'edit_program_form') {
    return (
      <ProgramFormView
        onNavigate={handleNavigate}
        onSave={handleSaveProgram}
        editingProgram={editingProgram}
        onAddExercise={handleAddExerciseToDraftProgram}
        newProgramExercises={draftProgramExercises}
        draftName={draftProgramName}
        setDraftName={setDraftProgramName}
        setDraftExercises={setDraftProgramExercises}
      />
    );
  }

  if (view === 'select_program') {
    return (
      <ProgramSelectView
        programs={programs}
        onNavigate={handleNavigate}
        onStartEmpty={() => handleStartNewWorkout()}
        onStartProgram={handleStartNewWorkout}
        onDeleteProgram={deleteProgram}
      />
    );
  }

  if (view === 'exercise_library') {
    return (
      <ExerciseLibraryView
        onNavigate={handleNavigate}
        customExercises={customExercises}
        onDeleteExercise={handleDeleteExercise}
        onEditExercise={handleEditExercise}
        onCreateExercise={handleCreateExercise}
      />
    );
  }

  if (view === 'create_exercise') {
    return (
      <ExerciseFormView
        onNavigate={handleNavigate}
        onSave={handleSaveExercise}
        editingExercise={editingExercise}
        returnView={returnView}
      />
    );
  }

  if (view === 'select_exercise') {
    return (
      <ExerciseSelectView
        onNavigate={handleNavigate}
        onSelect={handleSelectExercise}
        customExercises={customExercises}
        onCreateExercise={handleCreateExercise}
        returnView={returnView}
      />
    );
  }

  if (view === 'settings') {
    return <SettingsView onNavigate={handleNavigate} />;
  }

  // Fallback (e.g. if activeWorkout is null but view is new_workout)
  return <HomeView onNavigate={handleNavigate} workoutHistory={workoutHistory} />;
}