import type { ExerciseTip } from '../types';

/**
 * Comprehensive exercise coaching database
 * Contains form cues, common mistakes, progression tips, and safety notes
 */
export const EXERCISE_TIPS: Record<string, ExerciseTip> = {
    // ==================== LOWER BODY ====================

    'KNEBØY': {
        exercise: 'Knebøy',
        formCues: [
            '1. Stå med føttene skulderbredde fra hverandre, tær peker litt utover',
            '2. Hold stangen høyt på trapezius (high bar) eller lavere (low bar)',
            '3. Ta et dypt pust, stram magen og hold ryggen nøytral',
            '4. Bøy i hofter og knær samtidig, hold brystet oppe',
            '5. Gå ned til lårene er minst parallelle med gulvet',
            '6. Press gjennom hælene for å komme opp, hold knærne stabile'
        ],
        commonMistakes: [
            'Knærne kollapser innover - press dem aktivt utover',
            'Hælene løfter fra gulvet - mobilitet eller for tung vekt',
            'Ryggen runder - reduser vekt, stram core bedre',
            'For smal stance - eksperimenter med bredden',
            'Ser ned - hold blikket rett frem eller litt opp'
        ],
        progressionTips: [
            'Start med goblet squats for å lære bevegelsen',
            'Øk vekt når du klarer 3x8 med god form',
            'Bruk pause squats for å bygge styrke i bunnen',
            'Film deg selv for å sjekke teknikk',
            'Varmer opp med 2-3 lette sett før arbeidssett'
        ],
        safetyNotes: [
            'Bruk alltid safety bars eller spotter ved tunge sett',
            'Ikke bounce i bunnen - kontrollert bevegelse',
            'Ved knesmerter: sjekk teknikk eller reduser dybde',
            'Pust riktig: inn før ned, hold, ut på vei opp'
        ]
    },

    'MARKLØFT': {
        exercise: 'Markløft',
        formCues: [
            '1. Stå med føttene hoftebredde, stangen over midtfoten',
            '2. Bøy deg ned og grip stangen skulderbredde fra hverandre',
            '3. Senk hoftene, løft brystet, stram ryggen flat',
            '4. Ta et dypt pust, stram hele kroppen',
            '5. Press gjennom gulvet med bena, hold stangen tett til kroppen',
            '6. Strekk hoftene helt ut på toppen, trekk skuldrene bakover'
        ],
        commonMistakes: [
            'Ryggen runder - dette er farlig! Reduser vekt',
            'Stangen drar fra kroppen - hold den tett',
            'Hoftene stiger for fort - bena og rygg skal jobbe sammen',
            'Hyperextension på toppen - står rett, ikke len bakover',
            'Rykker i starten - jevn, kontrollert løft'
        ],
        progressionTips: [
            'Start med rumensk markløft for å lære hoftehenge',
            'Bruk straps hvis grep er begrensende faktor',
            'Deficit deadlifts for å bygge styrke fra gulvet',
            'Pause deadlifts (pause ved knærne) for teknikk',
            'Øk vekt konservativt - 2.5-5kg per økning'
        ],
        safetyNotes: [
            'ALDRI rund ryggen - dette kan gi skade',
            'Bruk belte ved tunge sett (80%+ av 1RM)',
            'Varm opp grundig - markløft krever mye',
            'Ved ryggsmerter: stopp og sjekk teknikk'
        ]
    },

    'BEINPRESS': {
        exercise: 'Beinpress',
        formCues: [
            '1. Sett føttene skulderbredde på plattformen, midt/høyt',
            '2. Press ryggen og hodet mot puten',
            '3. Løs bremsen og senk vekten kontrollert',
            '4. Gå ned til 90 grader i knærne (eller dypere hvis komfortabelt)',
            '5. Press gjennom hælene for å skyve vekten opp',
            '6. Ikke lås knærne helt ut på toppen'
        ],
        commonMistakes: [
            'Rumpa løfter fra setet - gå ikke for dypt',
            'Knærne kollapser innover - press dem utover',
            'Låser knærne hardt - hold lett bøy på toppen',
            'For smal fotplassering - eksperimenter',
            'Holder pusten - pust jevnt'
        ],
        progressionTips: [
            'Trygg øvelse for å bygge benvolum',
            'Variere fotplassering for ulike vinklinger',
            'Bruk 1.5 reps (ned-halvveis opp-helt ned-opp) for intensitet',
            'Slow eccentrics (4 sek ned) for muskelvekst',
            'Kan gå tyngre enn knebøy siden det er mer stabilt'
        ],
        safetyNotes: [
            'Ikke gå så dypt at rumpa løfter - kan skade ryggen',
            'Bruk sikkerhetssperre alltid',
            'Ved knesmerter: juster fotplassering eller dybde'
        ]
    },

    'RUMENSK MARKLØFT': {
        exercise: 'Rumensk Markløft',
        formCues: [
            '1. Stå med føttene hoftebredde, stangen foran lårene',
            '2. Lett bøy i knærne (15-20 grader)',
            '3. Heng i hoftene, skyv rumpa bakover',
            '4. Senk stangen langs bena, føl strekk i hamstrings',
            '5. Gå ned til mid-legg eller når du føler god strekk',
            '6. Stram hamstrings og glutes for å komme opp'
        ],
        commonMistakes: [
            'Bøyer for mye i knærne - dette blir en squat',
            'Runder ryggen - hold den nøytral/lett buet',
            'Går for dypt - stopp når strekken er god',
            'Stangen drar fra bena - hold den tett',
            'Bruker for mye rygg - fokus på hamstrings/glutes'
        ],
        progressionTips: [
            'Perfekt for hamstring-utvikling',
            'Bruk lettere vekt enn vanlig markløft',
            'Fokuser på mind-muscle connection',
            'Single-leg RDL for balanse og stabilitet',
            'Pause i bunnen for ekstra strekk'
        ],
        safetyNotes: [
            'Ikke rund ryggen - hold nøytral',
            'Kontrollert tempo - ikke bounce',
            'Ved hamstring-kramper: strekk og varm opp bedre'
        ]
    },

    'BENCURL': {
        exercise: 'Bencurl',
        formCues: [
            '1. Juster maskinen så knærne er på linje med rotasjonspunktet',
            '2. Legg anklene under puten',
            '3. Hold deg fast, stram core',
            '4. Curl hælene mot rumpa, squeeze hamstrings på toppen',
            '5. Senk kontrollert tilbake',
            '6. Ikke løft hoftene - hold kroppen stabil'
        ],
        commonMistakes: [
            'Svinger med kroppen - bruk kontrollert vekt',
            'Delvis range of motion - gå helt opp og ned',
            'For rask bevegelse - slow down for bedre aktivering',
            'Hoftene løfter - press dem ned i benken'
        ],
        progressionTips: [
            'Utmerket isolasjonsøvelse for hamstrings',
            'Prøv single-leg for å jevne ut ubalanser',
            'Pause på toppen for ekstra squeeze',
            'Drop sets for pump'
        ],
        safetyNotes: [
            'Ved kramper: strekk hamstrings mellom sett',
            'Ikke bruk momentum - kontrollert bevegelse'
        ]
    },

    // ==================== UPPER BODY PUSH ====================

    'BRYSTPRESS FLAT': {
        exercise: 'Brystpress Flat',
        formCues: [
            'Ligg flatt på benken med øynene rett under stangen',
            'Trekk skulderbladene sammen og ned i benken',
            'Grip stangen lidt bredere enn skulderbredde',
            'Senk stangen kontrollert til midten av brystet',
            'Press stangen opp i en bue tilbake til startposisjon'
        ],
        commonMistakes: [
            'Flate skuldre - trekk dem sammen og ned',
            'Albuer for vide (90 grader) - hold 45 grader',
            'Bouncer på brystet - kontrollert bevegelse',
            'Rumpa løfter - hold den i benken',
            'Håndledd bøyer bakover - hold dem rette'
        ],
        progressionTips: [
            'Bruk spotter ved tunge sett',
            'Pause bench (2 sek på brystet) for styrke',
            'Tempo training: 3 sek ned, 1 sek pause, eksplodere opp',
            'Øk vekt når du klarer 3x10 med god form',
            'Varmer opp med push-ups eller lette sett'
        ],
        safetyNotes: [
            'Bruk ALLTID safety bars eller spotter ved tunge sett',
            'Ved skuldersmerter: sjekk grep-bredde og albuevinkel',
            'Ikke lås albuer hardt - lett bøy på toppen',
            'Pust inn på vei ned, ut på vei opp'
        ]
    },

    'BENKPRESS': {
        exercise: 'Benkpress',
        formCues: [
            '1. Ligg på benken, føttene plant i gulvet',
            '2. Grip stangen litt bredere enn skulderbredde',
            '3. Trekk skulderblad sammen og ned, lag en bue i ryggen',
            '4. Senk stangen til midt på brystet, albuer 45 grader',
            '5. Press opp i en lett bue mot øynene',
            '6. Hold stangen over skuldrene på toppen'
        ],
        commonMistakes: [
            'Flate skuldre - trekk dem sammen og ned',
            'Albuer for vide (90 grader) - hold 45 grader',
            'Bouncer på brystet - kontrollert bevegelse',
            'Rumpa løfter - hold den i benken',
            'Håndledd bøyer bakover - hold dem rette'
        ],
        progressionTips: [
            'Bruk spotter ved tunge sett',
            'Pause bench (2 sek på brystet) for styrke',
            'Tempo training: 3 sek ned, 1 sek pause, eksplodere opp',
            'Øk vekt når du klarer 3x10 med god form'
        ],
        safetyNotes: [
            'Bruk ALLTID safety bars eller spotter ved tunge sett',
            'Ved skuldersmerter: sjekk grep-bredde og albuevinkel',
            'Ikke lås albuer hardt - lett bøy på toppen'
        ]
    },

    'SKRÅBENK BRYST': {
        exercise: 'Skråbenk Bryst',
        formCues: [
            '1. Sett benken til 30-45 grader vinkel',
            '2. Samme setup som flat bench - skuldre sammen og ned',
            '3. Grip litt bredere enn skulderbredde',
            '4. Senk til øvre bryst, albuer 45 grader',
            '5. Press rett opp (ikke mot ansiktet)',
            '6. Squeeze brystet på toppen'
        ],
        commonMistakes: [
            'For bratt vinkel (over 45°) - blir for mye skuldre',
            'Presser mot ansiktet - press rett opp',
            'Mister skulderblad-posisjon - hold dem sammen',
            'For tung vekt - bruk 10-20% mindre enn flat bench'
        ],
        progressionTips: [
            'Perfekt for øvre bryst-utvikling',
            'Kan bruke manualer for mer range of motion',
            'Variere vinkelen (30°, 45°) for variasjon',
            'Superset med flat bench for pump'
        ],
        safetyNotes: [
            'Bruk spotter - vanskeligere å få stangen i posisjon',
            'Ved skuldersmerter: reduser vinkel eller bruk manualer',
            'Ikke gå for tungt - teknikk er viktigere'
        ]
    },

    'SKULDERPRESS': {
        exercise: 'Skulderpress',
        formCues: [
            'Stå stødig eller sitt med ryggen inntil setet',
            'Press stangen/manualene rett opp over hodet',
            'Ikke svai for mye i ryggen',
            'Senk kontrollert ned til øvre bryst/skulderhøyde',
            'Hold albuene lett foran kroppen'
        ],
        commonMistakes: [
            'Lener seg bakover - hold ryggen støttet',
            'Presser foran hodet - press rett opp',
            'For vid grep - skulderbredde er best',
            'Delvis range of motion - gå helt ned',
            'Bruker momentum - kontrollert bevegelse'
        ],
        progressionTips: [
            'Stående skulderpress for mer core-aktivering',
            'Manualer gir mer range of motion',
            'Arnold press for variasjon',
            'Push press for å bygge eksplosivitet',
            'Øk vekt når du klarer 3x12 med god form'
        ],
        safetyNotes: [
            'Ved skuldersmerter: bruk manualer med nøytral grep',
            'Ikke press bak nakken - kan skade skuldre',
            'Varm opp skuldrene godt før tunge sett',
            'Bruk belte ved tunge sett for ryggstøtte'
        ]
    },

    // ==================== UPPER BODY PULL ====================

    'ROING': {
        exercise: 'Roing',
        formCues: [
            'Tipp i hoften med rett rygg',
            'Trekk stangen mot navlen',
            'Squeeze skulderbladene i toppen',
            'Senk kontrollert tilbake',
            'Hold albuene tett inntil kroppen'
        ],
        commonMistakes: [
            'Runder ryggen - hold den nøytral',
            'Bruker for mye biceps - fokus på rygg',
            'Reiser kroppen opp - hold vinkelen stabil',
            'For vid grep - skulderbredde er best for tykkelse',
            'Rykker i vekten - kontrollert bevegelse'
        ],
        progressionTips: [
            'Barbell rows for tyngre vekt',
            'Dumbbell rows for mer range of motion',
            'Pendlay rows for eksplosivitet',
            'Seal rows for å eliminere momentum',
            'Fokuser på squeeze på toppen'
        ],
        safetyNotes: [
            'Hold ryggen nøytral - ikke rund',
            'Ved ryggsmerter: bruk støttet variant (chest-supported)',
            'Ikke bruk for tung vekt som ødelegger teknikk',
            'Varm opp nedre rygg godt'
        ]
    },

    'NEDTREKK': {
        exercise: 'Nedtrekk',
        formCues: [
            'Grip bredt og len deg litt bakover',
            'Trekk stangen ned til øvre bryst',
            'Fokus på å dra med albuene',
            'Slipp kontrollert opp igjen',
            'Hold skuldrene nede'
        ],
        commonMistakes: [
            'Trekker bak nakken - kan skade skuldre',
            'Lener seg for langt bakover - lett vinkel er nok',
            'Bruker momentum - kontrollert bevegelse',
            'Delvis range of motion - strekk armene helt',
            'Skuldrene løfter på toppen - hold dem nede'
        ],
        progressionTips: [
            'Perfekt for å bygge ryggbredde',
            'Variere grep (vid, smal, nøytral) for variasjon',
            'Straight-arm pulldowns for lat-aktivering',
            'Pause på toppen for ekstra squeeze',
            'Progression mot pull-ups'
        ],
        safetyNotes: [
            'ALDRI trekk bak nakken - kan skade skuldre',
            'Ved skuldersmerter: bruk smalere grep eller nøytral',
            'Ikke bruk for tung vekt - teknikk først'
        ]
    },

    // ==================== SHOULDERS & ARMS ====================

    'LATERAL RAISE': {
        exercise: 'Lateral Raise',
        formCues: [
            '1. Stå med manualer ved siden, lett bøy i albuer',
            '2. Len deg litt frem (10 grader)',
            '3. Løft armene ut til siden til skulder-høyde',
            '4. Led med albuen, ikke håndleddet',
            '5. Topp-posisjon: armene i T-form',
            '6. Senk kontrollert tilbake'
        ],
        commonMistakes: [
            'For tung vekt - bruk lettere for bedre form',
            'Svinger med kroppen - streng form',
            'Løfter for høyt - stopp ved skulder-høyde',
            'Rette armer - hold lett bøy i albuer',
            'Shrugging - hold skuldrene nede'
        ],
        progressionTips: [
            'Perfekt for skulderbredde (lateral delt)',
            'Bruk lett vekt og høye reps (12-20)',
            'Cable lateral raises for konstant spenning',
            'Pause på toppen for ekstra burn',
            'Drop sets for pump'
        ],
        safetyNotes: [
            'Ikke bruk for tung vekt - kan skade skuldre',
            'Ved smerter: reduser vekt eller range of motion',
            'Varm opp skuldrene godt'
        ]
    },

    'FACEPULLS': {
        exercise: 'Facepulls',
        formCues: [
            '1. Sett kabelen til øye-høyde',
            '2. Grip tauet med tommelen opp',
            '3. Gå bakover til armene er strake',
            '4. Trekk tauet mot ansiktet, albuer høye',
            '5. Separer hendene og trekk forbi ørene',
            '6. Squeeze bakre skuldre og senk kontrollert'
        ],
        commonMistakes: [
            'For tung vekt - bruk lettere',
            'Albuer for lave - hold dem høye',
            'Trekker til brystet - trekk til ansiktet',
            'Ikke separerer hendene - trekk dem fra hverandre',
            'Bruker rygg - isoler skuldrene'
        ],
        progressionTips: [
            'Kritisk for skulderbalanse og helse',
            'Gjør disse HVER økt for best resultat',
            'Høye reps (15-20) fungerer best',
            'Fokus på squeeze, ikke vekt',
            'Band facepulls som oppvarming'
        ],
        safetyNotes: [
            'Viktig for å balansere alt push-arbeid',
            'Forebygger skulderskader',
            'Aldri hopp over denne øvelsen!'
        ]
    },

    'BICEPS CURL': {
        exercise: 'Biceps Curl',
        formCues: [
            '1. Stå med manualer ved siden, albuer ved kroppen',
            '2. Stram core, hold kroppen stabil',
            '3. Curl vekten opp, hold albuer stille',
            '4. Squeeze biceps på toppen',
            '5. Senk kontrollert tilbake',
            '6. Ikke sving med kroppen'
        ],
        commonMistakes: [
            'Svinger med kroppen - bruk lettere vekt',
            'Albuer beveger seg frem/tilbake - hold dem stille',
            'Delvis range of motion - strekk helt',
            'For rask bevegelse - slow down',
            'Dropping vekten - kontrollert nedsenking'
        ],
        progressionTips: [
            'Variere grep (supinert, hammer, pronert)',
            'Preacher curls for isolasjon',
            'Concentration curls for peak contraction',
            '21s (7+7+7) for pump',
            'Slow eccentrics (4 sek ned)'
        ],
        safetyNotes: [
            'Ved albuesmerter: reduser vekt eller bruk hammer grip',
            'Ikke sving - kan skade nedre rygg',
            'Varm opp albuer godt'
        ]
    },

    'TRICEPS PUSHDOWN': {
        exercise: 'Triceps Pushdown',
        formCues: [
            '1. Stå foran kabel-maskin, grip håndtaket',
            '2. Albuer ved siden av kroppen',
            '3. Press ned til armene er strake',
            '4. Squeeze triceps på bunnen',
            '5. Senk kontrollert tilbake til 90 grader',
            '6. Hold albuer stille'
        ],
        commonMistakes: [
            'Albuer beveger seg - hold dem ved kroppen',
            'Lener seg over vekten - stå oppreist',
            'Delvis range of motion - strekk helt',
            'For tung vekt - bruk kontrollbar vekt',
            'Svinger med kroppen - stabil posisjon'
        ],
        progressionTips: [
            'Variere attachment (tau, v-bar, straight bar)',
            'Overhead extensions for long head',
            'Close-grip bench for masse',
            'Dips for overall triceps-utvikling',
            'Høye reps (12-15) fungerer godt'
        ],
        safetyNotes: [
            'Ved albuesmerter: bruk tau-attachment',
            'Ikke lås albuer hardt - lett bøy på toppen',
            'Varm opp albuer godt'
        ]
    },

    // ==================== CORE ====================

    'PLANKE': {
        exercise: 'Planke',
        formCues: [
            '1. Legg deg på magen, albuer under skuldrene',
            '2. Løft kroppen opp på tær og underarmer',
            '3. Kroppen skal være i rett linje fra hode til hæl',
            '4. Stram magen, squeeze glutes',
            '5. Hold hodet nøytralt, se ned',
            '6. Pust jevnt, ikke hold pusten'
        ],
        commonMistakes: [
            'Henger i hoftene - stram core og glutes',
            'Rumpa for høyt - rett linje',
            'Hodet henger - hold nøytralt',
            'Holder pusten - pust jevnt',
            'Skuldre faller frem - press fra gulvet'
        ],
        progressionTips: [
            'Start med 20-30 sek, bygg opp til 60 sek',
            'Side planks for obliques',
            'Plank with leg lift for ekstra utfordring',
            'RKC plank (max tension) for styrke',
            'Weighted planks når du klarer 60+ sek lett'
        ],
        safetyNotes: [
            'Ved ryggsmerter: reduser tid eller sjekk form',
            'Ikke hold for lenge - kvalitet over kvantitet',
            'Varm opp core før tunge planks'
        ]
    }
};

/**
 * Get tips for a specific exercise
 */
export function getExerciseTips(exerciseName: string): ExerciseTip | undefined {
    const normalized = exerciseName.toUpperCase().trim();
    return EXERCISE_TIPS[normalized];
}

/**
 * Check if tips exist for an exercise
 */
export function hasTips(exerciseName: string): boolean {
    return getExerciseTips(exerciseName) !== undefined;
}
