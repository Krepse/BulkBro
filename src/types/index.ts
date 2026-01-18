
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
