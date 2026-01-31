import { supabase } from '../lib/supabase';

export interface StravaActivity {
    id?: number;
    name: string;
    type: string;
    start_date: string;
    start_date_local: string;
    elapsed_time: number;
    description: string;
}

export const STRAVA_CONFIG = {
    CLIENT_ID: import.meta.env.VITE_STRAVA_CLIENT_ID,
    CLIENT_SECRET: import.meta.env.VITE_STRAVA_CLIENT_SECRET,
    REDIRECT_URI: import.meta.env.VITE_STRAVA_REDIRECT_URI,
    AUTH_URL: 'https://www.strava.com/oauth/authorize',
    TOKEN_URL: 'https://www.strava.com/oauth/token',
};

export const getStravaAuthUrl = () => {
    const params = new URLSearchParams({
        client_id: STRAVA_CONFIG.CLIENT_ID,
        redirect_uri: STRAVA_CONFIG.REDIRECT_URI, // This should match what's set in App.tsx settings usually window.location.origin
        response_type: 'code',
        scope: 'activity:write,activity:read_all',
    });
    // Note: redirect_uri is partially dynamic in App.tsx, but base oauth url is consistent
    return `${STRAVA_CONFIG.AUTH_URL}?${params.toString()}`;
};

interface StravaTokenResponse {
    token_type: string;
    expires_at: number;
    expires_in: number;
    refresh_token: string;
    access_token: string;
    athlete: any;
}

export const exchangeToken = async (code: string, userId: string): Promise<boolean> => {
    try {
        const response = await fetch(STRAVA_CONFIG.TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: STRAVA_CONFIG.CLIENT_ID,
                client_secret: STRAVA_CONFIG.CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: window.location.origin // Must match the URI used in authorization
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to exchange token');
        }

        const data: StravaTokenResponse = await response.json();
        await saveTokens(data, userId);
        return true;
    } catch (error) {
        console.error('Strava token exchange error:', error);
        return false;
    }
};

// Utility to get token, refreshing if necessary
export const getAccessToken = async (): Promise<string | null> => {
    // We need the current user to get their token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    const userId = session.user.id;

    // Fetch from Supabase
    const { data: integration, error } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', userId)
        .eq('provider', 'strava')
        .single();

    if (error || !integration) {
        return null;
    }

    const { access_token, refresh_token, expires_at } = integration;

    // Check if expired (or expiring in next 5 mins)
    const now = Math.floor(Date.now() / 1000);
    if (now >= parseInt(expires_at) - 300) {
        console.log("Strava token expired, refreshing...");
        const newAccessToken = await refreshAccessToken(refresh_token, userId);
        if (newAccessToken) {
            return newAccessToken;
        } else {
            // If refresh fails, log out (delete integration)
            await disconnectStrava();
            return null;
        }
    }

    return access_token;
};

const refreshAccessToken = async (refreshToken: string, userId: string): Promise<string | null> => {
    const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_STRAVA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error("Missing Strava keys");
        return null;
    }

    try {
        const response = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            })
        });

        if (!response.ok) throw new Error('Failed to refresh token');

        const data: StravaTokenResponse = await response.json();
        await saveTokens(data, userId);
        return data.access_token;
    } catch (error) {
        console.error("Error refreshing token:", error);
        return null;
    }
};

export const getActivities = async (after: number, before: number) => {
    const token = await getAccessToken(); // Async fetch
    if (!token) return [];

    try {
        const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${after}&before=${before}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch activities');
        return await response.json();
    } catch (error) {
        console.error('Error fetching activities:', error);
        return [];
    }
};

export const getActivityStreams = async (activityId: number) => {
    const token = await getAccessToken();
    if (!token) return null;

    try {
        const response = await fetch(`https://www.strava.com/api/v3/activities/${activityId}/streams?keys=heartrate,time&key_by_type=true`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch streams');
        return await response.json();
    } catch (error) {
        console.error('Error fetching streams:', error);
        return null;
    }
};

const saveTokens = async (data: StravaTokenResponse, userId: string) => {
    // Upsert into Supabase
    const { error } = await supabase
        .from('user_integrations')
        .upsert({
            user_id: userId,
            provider: 'strava',
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: data.expires_at,
            athlete_data: data.athlete,
            updated_at: new Date().toISOString() // trigger update
        }, { onConflict: 'user_id' });

    if (error) {
        console.error("Failed to save tokens to DB:", error);
    }
};

export const isStravaConnected = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;

    const { data, error } = await supabase
        .from('user_integrations')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('provider', 'strava')
        .single();

    return !!data && !error;
};

export const disconnectStrava = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    await supabase
        .from('user_integrations')
        .delete()
        .eq('user_id', session.user.id)
        .eq('provider', 'strava');
};

export const mapWorkoutToStravaPayload = (workout: any): StravaActivity => {
    const exerciseSummary = workout.ovelser
        ? workout.ovelser.map((ex: any) => {
            const bestSet = ex.sett.reduce((max: number, curr: any) => Math.max(max, curr.kg), 0);
            return `${ex.navn}: ${ex.sett?.length || 0} sets (Best: ${bestSet}kg)`;
        }).join('\n')
        : 'No exercises';

    return {
        name: `BulkBro: ${workout.navn}`,
        type: 'WeightTraining',
        start_date: new Date().toISOString(),
        start_date_local: new Date().toISOString(),
        elapsed_time: 3600, // Default 1 hour if not tracked
        description: `Completed with BulkBro 💪\n\n${exerciseSummary}\n\n#bulkbro`,
    };
};

export const getRecentActivities = async (days: number = 7): Promise<any[]> => {
    const token = await getAccessToken();
    if (!token) return [];

    const after = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000);
    const before = Math.floor(Date.now() / 1000);

    return await getActivities(after, before);
}

export const calculateRecoveryStatus = (activities: any[]): 'JA' | 'OK' | 'NEI' => {
    if (!activities || activities.length === 0) return 'JA';

    let totalLoad = 0;

    for (const act of activities) {
        let load = 0;
        const durationMins = (act.moving_time || act.elapsed_time) / 60;

        if (act.suffer_score) {
            load = act.suffer_score;
        } else if (act.average_heartrate) {
            // Estimate stress: (Avg HR / 150) * duration. 150 is approx zone 2/3 boundary for many.
            load = (act.average_heartrate / 150) * durationMins;
        } else {
            // Fallback: simple duration based loan (assume moderate intensity)
            load = durationMins * 0.8;
        }
        totalLoad += load;
    }

    // Thresholds (Tunable) based on 7-day Load accumulation
    if (totalLoad > 600) return 'NEI';
    if (totalLoad > 300) return 'OK';
    return 'JA';
};

// Find an activity that overlaps with the workout window
export const findOverlappingActivity = async (startTime: string, endTime: string): Promise<any | null> => {
    const token = await getAccessToken();
    if (!token) return null;

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    // Fetch activities from a bit before start to now
    // convert to seconds
    const after = Math.floor((start - 3600 * 1000) / 1000);
    const before = Math.floor((end + 3600 * 1000) / 1000);

    const activities = await getActivities(after, before);

    // Find one that overlaps significantly
    return activities.find((act: any) => {
        const actStart = new Date(act.start_date).getTime();
        const actEnd = actStart + (act.elapsed_time * 1000);

        // Simple overlap check
        return (start < actEnd && end > actStart);
    });
};

// Export interfaces
export interface ExerciseStats {
    avgHr?: number;
    maxHr?: number;
    intensity?: number; // 0-5
    calories?: number;
}


// Re-write to include activityStartDate
export const calculateDetailedStats = (workout: any, activity: any, streams: any) => {
    const exerciseStats: Record<string, any> = {};
    const setStats: Record<string, any> = {};

    // Basic stats from activity
    let totalCalories = activity.calories || 0;

    // Fallback if calories missing (Common in WeightTraining without power meter/user weight)
    if (!totalCalories) {
        if (activity.kilojoules) {
            totalCalories = activity.kilojoules / 4.184;
        } else {
            // Estimate!
            const durationMins = (activity.moving_time || activity.elapsed_time) / 60;
            if (activity.average_heartrate) {
                // Estimate: (AvgHR / 150) * ~600kcal/hr
                totalCalories = (activity.average_heartrate / 150) * 10 * durationMins;
            } else {
                // Generic Weight Lifting: ~350 kcal/hr
                totalCalories = 6 * durationMins;
            }
        }
    }

    let totalIntensity = 0;

    if (activity.average_heartrate) {
        totalIntensity = calculateIntensity(activity.average_heartrate);
    }

    // If streams are available, try to do detailed analysis
    if (streams && streams.time && streams.heartrate) {
        const actStart = new Date(activity.start_date).getTime();
        const timeStream = streams.time.data; // seconds offset
        const hrStream = streams.heartrate.data;

        workout.ovelser.forEach((ex: any) => {
            let exHrSum = 0;
            let exHrCount = 0;
            let exMaxHr = 0;

            // Iterate sets to find time ranges
            ex.sett.forEach((set: any) => {
                if (set.completedAt) {
                    const sEnd = new Date(set.completedAt).getTime();
                    // If no startTime, assume set took 60 seconds (standard lifting set duration estimate)
                    const sStart = set.startTime
                        ? new Date(set.startTime).getTime()
                        : sEnd - 60000;

                    // Convert to activity-relative seconds
                    const relStart = (sStart - actStart) / 1000;
                    const relEnd = (sEnd - actStart) / 1000;

                    let setHrSum = 0;
                    let setHrCount = 0;
                    let setMax = 0;

                    for (let i = 0; i < timeStream.length; i++) {
                        const t = timeStream[i];
                        if (t >= relStart && t <= relEnd) {
                            const hr = hrStream[i];
                            setHrSum += hr;
                            setHrCount++;
                            if (hr > setMax) setMax = hr;
                        }
                        if (t > relEnd) break; // Optimized assumption: sorted
                    }

                    if (setHrCount > 0) {
                        setStats[set.id] = {
                            avgHr: Math.round(setHrSum / setHrCount),
                            maxHr: setMax
                        };

                        exHrSum += setHrSum;
                        exHrCount += setHrCount;
                        if (setMax > exMaxHr) exMaxHr = setMax;
                    }
                }
            });

            if (exHrCount > 0) {
                exerciseStats[ex.id] = {
                    avgHr: Math.round(exHrSum / exHrCount),
                    maxHr: exMaxHr,
                    intensity: calculateIntensity(Math.round(exHrSum / exHrCount))
                };
            }
        });

        // Fallback intensity if activity avg unavailable but we calculated exercise avg?
        if (totalIntensity === 0) {
            const intensities = Object.values(exerciseStats).map((s: any) => s.intensity);
            if (intensities.length > 0) {
                totalIntensity = Math.round(intensities.reduce((a: number, b: number) => a + b, 0) / intensities.length);
            }
        }
    }

    const workoutStats = {
        calories: Math.round(totalCalories),
        intensity: totalIntensity,
        hrSeries: (streams && streams.heartrate) ? streams.heartrate.data : []
    };

    return { exerciseStats, setStats, workoutStats };
};

const calculateIntensity = (hr: number) => {
    // Very rough zones without user max HR
    if (hr < 100) return 1;
    if (hr < 120) return 2;
    if (hr < 140) return 3;
    if (hr < 160) return 4;
    return 5;
};
