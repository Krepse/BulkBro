
export type ExerciseType = 'Stang' | 'Manualer' | 'Kabel' | 'Egenvekt' | 'Maskin' | 'Oppvarming';

export interface Sett {
  id: number | string;
  kg: number;
  reps: number;
  completed: boolean;
  startTime?: string; // ISO timestamp (when set started/timer started)
  completedAt?: string; // ISO timestamp (when set finished)
}

export interface Ovelse {
  id: number | string;
  navn: string;
  type: ExerciseType;
  sett: Sett[];
}

export interface Okt {
  id: number | string;
  navn: string;
  dato: string;
  startTime?: string; // ISO timestamp
  endTime?: string; // ISO timestamp
  ovelser: Ovelse[];
  stravaAnalysis?: StravaAnalysis;
}

export interface ExerciseStats {
  maxHr: number;
  avgHr: number;
}

export interface StravaAnalysis {
  activityId: number;
  exerciseStats: Record<string, ExerciseStats>; // detailed stats
  setStats: Record<string, any>; // set specific stats
  workoutStats: { calories: number, intensity: number, hrSeries?: number[] };
  exerciseOrder?: string[]; // List of Exercise IDs in correct order
}

export interface Program {
  id: number;
  navn: string;
  ovelser: (string | ProgramExercise)[]; // Transition state: allows both formats
  isDefault?: boolean; // Flag for default/template programs
  templateId?: number; // Reference to original template if copied
}

export interface ProgramExercise {
  navn: string;
  type: ExerciseType;
  sets: number;
  reps: string; // e.g., "6-8", "10-12"
  rest: string; // e.g., "3 min", "90 sek"
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  description?: string; // Keeping for backward compatibility or extra info if needed, but UI will prioritize type
}

export interface ExerciseTip {
  exercise: string; // Exercise name
  formCues: string[]; // Step-by-step technique points
  commonMistakes: string[]; // What to avoid
  progressionTips: string[]; // How to progress
  safetyNotes: string[]; // Important safety information
  videoUrl?: string; // Optional video demonstration
}
