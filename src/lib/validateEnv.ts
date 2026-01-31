/**
 * Validate required environment variables at startup
 * Fails fast with clear error messages if misconfigured
 */
export function validateEnv(): void {
    const required = [
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY',
        'VITE_STRAVA_CLIENT_ID',
    ];

    const missing: string[] = [];

    for (const key of required) {
        const value = import.meta.env[key];
        if (!value || value.includes('YOUR_') || value.includes('_HERE')) {
            missing.push(key);
        }
    }

    if (missing.length > 0) {
        const message = `Missing or invalid environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}\n\nPlease check your .env file.`;
        console.error(message);

        // In development, show alert. In production, just log.
        if (import.meta.env.DEV) {
            alert(message);
        }
    }
}
