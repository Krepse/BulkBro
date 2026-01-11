export interface StravaActivity {
    name: string;
    type: string;
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
        redirect_uri: STRAVA_CONFIG.REDIRECT_URI,
        response_type: 'code',
        scope: 'activity:write,activity:read_all',
    });
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

export const exchangeToken = async (code: string): Promise<boolean> => {
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
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to exchange token');
        }

        const data: StravaTokenResponse = await response.json();
        saveTokens(data);
        return true;
    } catch (error) {
        console.error('Strava token exchange error:', error);
        return false;
    }
};

const getAccessToken = () => {
    return localStorage.getItem('strava_access_token');
};

export const getActivities = async (after: number, before: number) => {
    const token = getAccessToken();
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
    const token = getAccessToken();
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

const saveTokens = (data: StravaTokenResponse) => {
    localStorage.setItem('strava_access_token', data.access_token);
    localStorage.setItem('strava_refresh_token', data.refresh_token);
    localStorage.setItem('strava_expires_at', data.expires_at.toString());
    localStorage.setItem('strava_athlete', JSON.stringify(data.athlete));
};

export const isStravaConnected = () => {
    return !!localStorage.getItem('strava_access_token');
};

export const disconnectStrava = () => {
    localStorage.removeItem('strava_access_token');
    localStorage.removeItem('strava_refresh_token');
    localStorage.removeItem('strava_expires_at');
    localStorage.removeItem('strava_athlete');
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
        start_date_local: new Date().toISOString(),
        elapsed_time: 3600, // Default 1 hour if not tracked
        description: `Completed with BulkBro 💪\n\n${exerciseSummary}\n\n#bulkbro`,
    };
};
