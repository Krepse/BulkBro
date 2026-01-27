
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
  ovelser: string[]; // List of exercise names
}

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  description?: string; // Keeping for backward compatibility or extra info if needed, but UI will prioritize type
}
