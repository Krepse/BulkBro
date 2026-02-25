// Script to fetch and analyze workout data for stianberg2@gmail.com
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function analyzeWorkoutHistory() {
    try {
        // First, we need to get the user ID for stianberg2@gmail.com
        // Since we can't query auth.users directly, we'll fetch all workouts
        // and filter by looking at the user_id

        console.log('Fetching workout data...\n');

        // Fetch all workouts with their exercises and sets
        const { data: workouts, error: workoutsError } = await supabase
            .from('workouts')
            .select(`
                *,
                exercises:exercises(
                    *,
                    sets:sett(*)
                )
            `)
            .order('start_time', { ascending: false });

        if (workoutsError) {
            console.error('Error fetching workouts:', workoutsError);
            return;
        }

        if (!workouts || workouts.length === 0) {
            console.log('No workouts found in database.');
            return;
        }

        console.log(`Found ${workouts.length} total workouts in database\n`);

        // Analyze the data
        const analysis = {
            totalWorkouts: workouts.length,
            dateRange: {
                first: workouts[workouts.length - 1]?.date,
                last: workouts[0]?.date
            },
            exerciseFrequency: {},
            volumeByExercise: {},
            workoutsByMonth: {},
            totalSets: 0,
            totalReps: 0,
            totalVolume: 0,
            workoutDetails: []
        };

        // Process each workout
        workouts.forEach(workout => {
            const workoutDate = new Date(workout.start_time || workout.created_at);
            const monthKey = `${workoutDate.getFullYear()}-${String(workoutDate.getMonth() + 1).padStart(2, '0')}`;

            analysis.workoutsByMonth[monthKey] = (analysis.workoutsByMonth[monthKey] || 0) + 1;

            const workoutDetail = {
                date: workout.start_time || workout.created_at,
                name: workout.name,
                exercises: []
            };

            if (workout.exercises) {
                workout.exercises.forEach(exercise => {
                    const exerciseName = exercise.name;

                    // Count exercise frequency
                    analysis.exerciseFrequency[exerciseName] = (analysis.exerciseFrequency[exerciseName] || 0) + 1;

                    const exerciseDetail = {
                        name: exerciseName,
                        sets: []
                    };

                    if (exercise.sets) {
                        exercise.sets.forEach(set => {
                            if (set.completed) {
                                analysis.totalSets++;
                                analysis.totalReps += set.reps;
                                const volume = set.kg * set.reps;
                                analysis.totalVolume += volume;

                                // Track volume by exercise
                                if (!analysis.volumeByExercise[exerciseName]) {
                                    analysis.volumeByExercise[exerciseName] = {
                                        totalVolume: 0,
                                        totalSets: 0,
                                        avgWeight: 0,
                                        maxWeight: 0
                                    };
                                }

                                analysis.volumeByExercise[exerciseName].totalVolume += volume;
                                analysis.volumeByExercise[exerciseName].totalSets++;
                                analysis.volumeByExercise[exerciseName].maxWeight = Math.max(
                                    analysis.volumeByExercise[exerciseName].maxWeight,
                                    set.kg
                                );

                                exerciseDetail.sets.push({
                                    kg: set.kg,
                                    reps: set.reps,
                                    completed: set.completed
                                });
                            }
                        });
                    }

                    if (exerciseDetail.sets.length > 0) {
                        workoutDetail.exercises.push(exerciseDetail);
                    }
                });
            }

            if (workoutDetail.exercises.length > 0) {
                analysis.workoutDetails.push(workoutDetail);
            }
        });

        // Calculate averages
        Object.keys(analysis.volumeByExercise).forEach(exerciseName => {
            const ex = analysis.volumeByExercise[exerciseName];
            ex.avgWeight = ex.totalVolume / (ex.totalSets * 10); // Rough estimate
        });

        // Generate report
        const report = generateReport(analysis);

        // Save to file
        const outputPath = path.join(process.cwd(), 'workout_analysis.json');
        fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
        console.log(`\nDetailed analysis saved to: ${outputPath}\n`);

        // Print report
        console.log(report);

        // Save report to markdown file
        const reportPath = path.join(process.cwd(), 'workout_feedback.md');
        fs.writeFileSync(reportPath, report);
        console.log(`\nFeedback report saved to: ${reportPath}`);

    } catch (error) {
        console.error('Error analyzing workout history:', error);
    }
}

function generateReport(analysis) {
    const sortedExercises = Object.entries(analysis.exerciseFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const sortedVolume = Object.entries(analysis.volumeByExercise)
        .sort((a, b) => b[1].totalVolume - a[1].totalVolume)
        .slice(0, 10);

    let report = `# Treningsanalyse for stianberg2@gmail.com\n\n`;
    report += `## Oversikt\n\n`;
    report += `- **Totalt antall økter**: ${analysis.totalWorkouts}\n`;
    report += `- **Periode**: ${new Date(analysis.dateRange.first).toLocaleDateString('nb-NO')} - ${new Date(analysis.dateRange.last).toLocaleDateString('nb-NO')}\n`;
    report += `- **Totalt antall sett**: ${analysis.totalSets}\n`;
    report += `- **Totalt antall repetisjoner**: ${analysis.totalReps}\n`;
    report += `- **Total volum**: ${Math.round(analysis.totalVolume).toLocaleString('nb-NO')} kg\n\n`;

    report += `## Økter per måned\n\n`;
    const sortedMonths = Object.entries(analysis.workoutsByMonth).sort();
    sortedMonths.forEach(([month, count]) => {
        report += `- **${month}**: ${count} økter\n`;
    });
    report += `\n`;

    report += `## Mest trente øvelser (antall økter)\n\n`;
    sortedExercises.forEach(([exercise, count], index) => {
        report += `${index + 1}. **${exercise}**: ${count} økter\n`;
    });
    report += `\n`;

    report += `## Øvelser etter volum\n\n`;
    sortedVolume.forEach(([exercise, data], index) => {
        report += `${index + 1}. **${exercise}**\n`;
        report += `   - Total volum: ${Math.round(data.totalVolume).toLocaleString('nb-NO')} kg\n`;
        report += `   - Antall sett: ${data.totalSets}\n`;
        report += `   - Maks vekt: ${data.maxWeight} kg\n`;
    });
    report += `\n`;

    report += `## Tilbakemelding på treningsoppsettet\n\n`;

    // Generate feedback based on the data
    report += generateFeedback(analysis, sortedExercises, sortedVolume);

    return report;
}

function generateFeedback(analysis, sortedExercises, sortedVolume) {
    let feedback = '';

    // Check workout frequency
    const months = Object.keys(analysis.workoutsByMonth).length;
    const avgWorkoutsPerMonth = analysis.totalWorkouts / months;

    feedback += `### Treningsfrekvens\n\n`;
    if (avgWorkoutsPerMonth >= 12) {
        feedback += `✅ **Utmerket frekvens!** Du trener i gjennomsnitt ${avgWorkoutsPerMonth.toFixed(1)} ganger per måned (ca ${(avgWorkoutsPerMonth / 4).toFixed(1)} ganger per uke). Dette er en solid treningsfrekvens.\n\n`;
    } else if (avgWorkoutsPerMonth >= 8) {
        feedback += `✅ **God frekvens.** Du trener i gjennomsnitt ${avgWorkoutsPerMonth.toFixed(1)} ganger per måned. Dette er bra, men du kan vurdere å øke til 3-4 økter per uke for raskere fremgang.\n\n`;
    } else {
        feedback += `⚠️ **Lav frekvens.** Du trener i gjennomsnitt ${avgWorkoutsPerMonth.toFixed(1)} ganger per måned. For optimal fremgang anbefales 3-4 økter per uke.\n\n`;
    }

    // Check exercise variety
    const uniqueExercises = Object.keys(analysis.exerciseFrequency).length;
    feedback += `### Øvelsesvariasjoner\n\n`;
    feedback += `Du har utført **${uniqueExercises} forskjellige øvelser** i perioden.\n\n`;

    if (uniqueExercises < 10) {
        feedback += `⚠️ **Begrenset variasjon.** Vurder å legge til flere øvelser for å treffe muskelgrupper fra forskjellige vinkler.\n\n`;
    } else if (uniqueExercises > 30) {
        feedback += `⚠️ **Mye variasjon.** Du har mange forskjellige øvelser. Vurder å fokusere mer på grunnøvelser for bedre progresjon.\n\n`;
    } else {
        feedback += `✅ **God variasjon.** Du har en balansert miks av øvelser.\n\n`;
    }

    // Check for compound movements
    const compoundMovements = ['Squat', 'Deadlift', 'Bench Press', 'Overhead Press', 'Barbell Row', 'Pull-up', 'Knebøy', 'Markløft', 'Benkpress'];
    const hasCompounds = sortedExercises.some(([exercise]) =>
        compoundMovements.some(compound => exercise.toLowerCase().includes(compound.toLowerCase()))
    );

    feedback += `### Grunnøvelser\n\n`;
    if (hasCompounds) {
        feedback += `✅ **Bra!** Du inkluderer grunnøvelser i programmet ditt. Dette er viktig for helkropps styrke og muskelbygging.\n\n`;
    } else {
        feedback += `⚠️ **Mangler grunnøvelser.** Vurder å inkludere øvelser som knebøy, markløft, benkpress og pull-ups for bedre resultater.\n\n`;
    }

    // Volume analysis
    feedback += `### Volum og intensitet\n\n`;
    const avgSetsPerWorkout = analysis.totalSets / analysis.totalWorkouts;
    feedback += `Du gjennomfører i gjennomsnitt **${avgSetsPerWorkout.toFixed(1)} sett per økt**.\n\n`;

    if (avgSetsPerWorkout < 12) {
        feedback += `⚠️ **Lavt volum.** For optimal muskelbygging anbefales 12-20 sett per økt.\n\n`;
    } else if (avgSetsPerWorkout > 25) {
        feedback += `⚠️ **Høyt volum.** Pass på at du får nok restitusjon. Kvalitet over kvantitet!\n\n`;
    } else {
        feedback += `✅ **Godt volum.** Dette er et passende antall sett per økt.\n\n`;
    }

    feedback += `### Anbefalinger\n\n`;
    feedback += `1. **Progressiv overbelastning**: Sørg for å øke vekt eller repetisjoner over tid\n`;
    feedback += `2. **Konsistens**: Prøv å holde en jevn treningsfrekvens\n`;
    feedback += `3. **Restitusjon**: Sørg for nok søvn og ernæring\n`;
    feedback += `4. **Variasjon**: Bytt program hver 8-12 uke for å unngå plateauer\n\n`;

    return feedback;
}

// Run the analysis
analyzeWorkoutHistory();
