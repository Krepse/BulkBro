import type { Program, ProgramExercise } from '../types';

/**
 * Default workout programs available to all users
 * Based on optimal 2-day per week full-body training
 */

const OKT_A_EXERCISES: ProgramExercise[] = [
    {
        navn: 'Knebøy',
        type: 'Stang',
        sets: 4,
        reps: '6-8',
        rest: '3 min',
        notes: 'Hovedøvelse - gå tungt, fokus på dybde og teknikk'
    },
    {
        navn: 'Brystpress Flat',
        type: 'Stang',
        sets: 3,
        reps: '8-10',
        rest: '2 min',
        notes: 'Horisontalt push - trekk skulderblad sammen'
    },
    {
        navn: 'Roing',
        type: 'Stang',
        sets: 3,
        reps: '8-10',
        rest: '2 min',
        notes: 'Horisontalt pull - squeeze skulderblad på toppen'
    },
    {
        navn: 'Rumensk Markløft',
        type: 'Stang',
        sets: 3,
        reps: '10-12',
        rest: '2 min',
        notes: 'Hamstrings & posterior chain - føl strekken'
    },
    {
        navn: 'Facepulls',
        type: 'Kabel',
        sets: 3,
        reps: '12-15',
        rest: '90 sek',
        notes: 'Bakre skuldre - viktig for skulderbalanse'
    },
    {
        navn: 'Biceps Curl',
        type: 'Manualer',
        sets: 3,
        reps: '10-12',
        rest: '90 sek',
        notes: 'Direkte biceps-arbeid - kontrollert bevegelse'
    },
    {
        navn: 'Planke',
        type: 'Egenvekt',
        sets: 3,
        reps: '30-60s',
        rest: '60 sek',
        notes: 'Core stabilitet - hold rett linje'
    }
];

const OKT_B_EXERCISES: ProgramExercise[] = [
    {
        navn: 'Markløft',
        type: 'Stang',
        sets: 4,
        reps: '5-6',
        rest: '3 min',
        notes: 'Hovedøvelse - gå tungt, hold ryggen flat'
    },
    {
        navn: 'Skulderpress',
        type: 'Stang',
        sets: 3,
        reps: '8-10',
        rest: '2 min',
        notes: 'Vertikalt push - press rett opp'
    },
    {
        navn: 'Nedtrekk',
        type: 'Kabel',
        sets: 3,
        reps: '8-10',
        rest: '2 min',
        notes: 'Vertikalt pull - trekk til øvre bryst'
    },
    {
        navn: 'Beinpress',
        type: 'Maskin',
        sets: 3,
        reps: '10-12',
        rest: '2 min',
        notes: 'Ekstra benvolum - ikke løft rumpa'
    },
    {
        navn: 'Lateral Raise',
        type: 'Manualer',
        sets: 3,
        reps: '12-15',
        rest: '90 sek',
        notes: 'Skulderbredde - lett vekt, streng form'
    },
    {
        navn: 'Triceps Pushdown',
        type: 'Kabel',
        sets: 3,
        reps: '10-12',
        rest: '90 sek',
        notes: 'Direkte triceps-arbeid - hold albuer stille'
    },
    {
        navn: 'Bencurl',
        type: 'Maskin',
        sets: 3,
        reps: '10-12',
        rest: '90 sek',
        notes: 'Ekstra hamstrings - squeeze på toppen'
    }
];

export const DEFAULT_PROGRAMS: Program[] = [
    {
        id: 1001, // High ID to avoid conflicts with user programs
        navn: 'Økt A - Nedre Kropp & Horisontalt',
        ovelser: OKT_A_EXERCISES,
        isDefault: true
    },
    {
        id: 1002,
        navn: 'Økt B - Posterior Chain & Vertikalt',
        ovelser: OKT_B_EXERCISES,
        isDefault: true
    }
];

/**
 * Get all default programs
 */
export function getDefaultPrograms(): Program[] {
    return DEFAULT_PROGRAMS;
}

/**
 * Get a specific default program by ID
 */
export function getDefaultProgram(id: number): Program | undefined {
    return DEFAULT_PROGRAMS.find(p => p.id === id);
}

/**
 * Create a user copy of a default program
 * Removes the isDefault flag and generates a new ID
 */
export function createUserCopyOfProgram(program: Program, newId: number): Program {
    return {
        ...program,
        id: newId,
        isDefault: false,
        templateId: program.id // Track which template this came from
    };
}
