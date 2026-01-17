import React from 'react';
import { LogOut, Activity, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { isStravaConnected, disconnectStrava } from '../../services/strava';

interface SettingsViewProps {
    // Props might be needed later
}

export const SettingsView: React.FC<SettingsViewProps> = () => {
    const { user } = useAuth();
    const [stravaConnected, setStravaConnected] = React.useState(isStravaConnected());

    const handleLogout = async () => {
        // Clear sensitive local data to prevent leakage to next user
        localStorage.removeItem('workoutHistory');
        localStorage.removeItem('programs');
        localStorage.removeItem('activeWorkout');
        localStorage.removeItem('customExercises');
        localStorage.removeItem('bb_admin_bypass');

        await supabase.auth.signOut();
        window.location.reload();
    };

    const handleConnectStrava = () => {
        const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
        const redirectUri = import.meta.env.VITE_STRAVA_REDIRECT_URI;
        const scope = "activity:read_all,activity:write";
        window.location.href = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=${scope}`;
    };

    const handleDisconnectStrava = () => {
        disconnectStrava();
        setStravaConnected(false);
    }

    return (
        <div className="max-w-md mx-auto p-4 space-y-6 pb-24 relative">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Innstillinger</h1>
                    <p className="text-slate-400 text-sm">Administrer din konto og app</p>
                </div>
            </header>

            {/* Account Section */}
            <section className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        Konto
                    </h2>
                    {user?.email && (
                        <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                            {user.email}
                        </span>
                    )}
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Logg Ut
                </button>
            </section>

            {/* Strava Section */}
            <section className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-orange-500" />
                    Strava Integrasjon
                </h2>
                {stravaConnected ? (
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-green-400 font-medium flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            Tilkoblet
                        </span>
                        <button
                            onClick={handleDisconnectStrava}
                            className="text-xs text-slate-500 hover:text-white underline"
                        >
                            Koble fra
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleConnectStrava}
                        className="w-full flex items-center justify-center gap-2 bg-[#FC4C02] hover:bg-[#E34402] text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-orange-900/20 text-sm"
                    >
                        Koble til Strava
                    </button>
                )}
                <p className="mt-3 text-xs text-slate-500 text-center flex items-center justify-center gap-1">
                    <Info className="w-3 h-3" />
                    Synkroniser øktene dine automatisk
                </p>
            </section>

            <div className="text-center pt-8 pb-4">
                <p className="text-slate-600 text-[10px] uppercase tracking-widest">BulkBro v0.2.1 • Relational</p>
            </div>
        </div>
    );
};
