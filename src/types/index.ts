
export type ExerciseType = 'Stang' | 'Manualer' | 'Kabel' | 'Egenvekt' | 'Maskin';

export interface Sett {
  id: number;
  kg: number;
  reps: number;
  completed: boolean;
  completedAt?: string; // ISO timestamp
}

export interface Ovelse {
  id: number | string;
  navn: string;
  type: ExerciseType;
  sett: Sett[];
}

export interface Okt {
  id: number;
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
