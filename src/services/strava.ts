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

// Configuration - Client ID is safe to expose, secret is now server-side only
export const STRAVA_CONFIG = {
    CLIENT_ID: import.meta.env.VITE_STRAVA_CLIENT_ID,
    // CLIENT_SECRET removed - now handled by Edge Function
    AUTH_URL: 'https://www.strava.com/oauth/authorize',
};

export const getStravaAuthUrl = () => {
    const redirectUri = window.location.origin;
    const params = new URLSearchParams({
        client_id: STRAVA_CONFIG.CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'activity:write,activity:read_all',
    });
    return `${STRAVA_CONFIG.AUTH_URL}?${params.toString()}`;
};

/**
 * Exchange authorization code for tokens via Edge Function
 * The client secret is kept secure on the server side
 */
export const exchangeToken = async (code: string): Promise<boolean> => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            console.error('No active session for token exchange');
            return false;
        }

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const response = await fetch(`${supabaseUrl}/functions/v1/strava-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
                code: code,
                redirect_uri: window.location.origin,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Token exchange failed:', errorData);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Strava token exchange error:', error);
        return false;
    }
};

/**
 * Get access token, refreshing via Edge Function if necessary
 */
export const getAccessToken = async (): Promise<string | null> => {
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

    const { access_token, expires_at } = integration;

    // Check if expired (or expiring in next 5 mins)
    const now = Math.floor(Date.now() / 1000);
    if (now >= parseInt(expires_at) - 300) {
        console.log("Strava token expired, refreshing via Edge Function...");
        const newAccessToken = await refreshAccessToken(session.access_token);
        return newAccessToken;
    }

    return access_token;
};

/**
 * Refresh token via Edge Function (keeps secret server-side)
 */
const refreshAccessToken = async (sessionToken: string): Promise<string | null> => {
    try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const response = await fetch(`${supabaseUrl}/functions/v1/strava-refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`,
            },
        });

        if (!response.ok) {
            console.error('Token refresh failed');
            return null;
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Error refreshing token:", error);
        return null;
    }
};

export const getActivities = async (after: number, before: number) => {
    const token = await getAccessToken();
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
            load = (act.average_heartrate / 150) * durationMins;
        } else {
            load = durationMins * 0.8;
        }
        totalLoad += load;
    }

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

    const after = Math.floor((start - 3600 * 1000) / 1000);
    const before = Math.floor((end + 3600 * 1000) / 1000);

    const activities = await getActivities(after, before);

    return activities.find((act: any) => {
        const actStart = new Date(act.start_date).getTime();
        const actEnd = actStart + (act.elapsed_time * 1000);
        return (start < actEnd && end > actStart);
    });
};

// Export interfaces
export interface ExerciseStats {
    avgHr?: number;
    maxHr?: number;
    intensity?: number;
    calories?: number;
}

export const calculateDetailedStats = (workout: any, activity: any, streams: any) => {
    const exerciseStats: Record<string, any> = {};
    const setStats: Record<string, any> = {};

    let totalCalories = activity.calories || 0;

    if (!totalCalories) {
        if (activity.kilojoules) {
            totalCalories = activity.kilojoules / 4.184;
        } else {
            const durationMins = (activity.moving_time || activity.elapsed_time) / 60;
            if (activity.average_heartrate) {
                totalCalories = (activity.average_heartrate / 150) * 10 * durationMins;
            } else {
                totalCalories = 6 * durationMins;
            }
        }
    }

    let totalIntensity = 0;

    if (activity.average_heartrate) {
        totalIntensity = calculateIntensity(activity.average_heartrate);
    }

    if (streams && streams.time && streams.heartrate) {
        const actStart = new Date(activity.start_date).getTime();
        const timeStream = streams.time.data;
        const hrStream = streams.heartrate.data;

        workout.ovelser.forEach((ex: any) => {
            let exHrSum = 0;
            let exHrCount = 0;
            let exMaxHr = 0;

            ex.sett.forEach((set: any) => {
                if (set.completedAt) {
                    const sEnd = new Date(set.completedAt).getTime();
                    const sStart = set.startTime
                        ? new Date(set.startTime).getTime()
                        : sEnd - 60000;

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
                        if (t > relEnd) break;
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
    if (hr < 100) return 1;
    if (hr < 120) return 2;
    if (hr < 140) return 3;
    if (hr < 160) return 4;
    return 5;
};
