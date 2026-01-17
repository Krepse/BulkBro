import { useState } from 'react';

import { Icons } from '../ui/Icons';
import { getStravaAuthUrl, isStravaConnected, disconnectStrava } from '../../services/strava';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

interface SettingsViewProps {
    onNavigate: (view: any) => void;
}

export function SettingsView({ onNavigate }: SettingsViewProps) {
    const [stravaConnected, setStravaConnected] = useState(isStravaConnected());
    const { user } = useAuth();

    // Auth Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'login' | 'signup'>('login');

    const handleDisconnectStrava = () => {
        disconnectStrava();
        setStravaConnected(false);
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                // Auto login might happen or email confirm needed
                alert('Sjekk e-posten din for bekreftelse!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || 'Noe gikk galt');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white px-6 py-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-10">
                <button
                    onClick={() => onNavigate('home')}
                    className="text-slate-400 p-3 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <Icons.ChevronLeft className="w-8 h-8" />
                </button>
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Innstillinger</h1>
            </header>

            <main className="max-w-xl mx-auto p-6 space-y-6 mt-4">

                {/* Cloud Sync Section */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic mb-6 flex items-center gap-3">
                        <span className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                            <Icons.Activity className="w-6 h-6" /> {/* Reuse Activity icon or change if we have Cloud icon */}
                        </span>
                        Konto & Synkronisering
                    </h2>

                    {user ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-3xl border border-blue-100">
                                <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center font-black">
                                    {user.email?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Logget inn som</h3>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold uppercase tracking-wider rounded-2xl transition-colors"
                            >
                                Logg ut
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleAuth} className="space-y-4">
                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">E-post</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl p-4 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="navn@example.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Passord</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl p-4 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-black uppercase tracking-widest italic rounded-2xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Laster...' : (mode === 'login' ? 'Logg inn' : 'Registrer')}
                            </button>

                            <div className="flex justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                                <button type="button" onClick={() => setMode('login')} className={mode === 'login' ? 'text-blue-500' : 'hover:text-slate-600'}>Logg inn</button>
                                <span>|</span>
                                <button type="button" onClick={() => setMode('signup')} className={mode === 'signup' ? 'text-blue-500' : 'hover:text-slate-600'}>Registrer</button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic mb-6 flex items-center gap-3">
                        <span className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                            <Icons.Activity className="w-6 h-6" />
                        </span>
                        Integrasjoner
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 ${stravaConnected ? 'bg-[#FC4C02]' : 'bg-slate-300'} text-white rounded-2xl flex items-center justify-center font-black italic text-xs tracking-tighter`}>
                                    STRAVA
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 uppercase tracking-tight">Strava</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {stravaConnected ? 'Konto tilkoblet' : 'Koble til konto'}
                                    </p>
                                </div>
                            </div>
                            {stravaConnected ? (
                                <button
                                    onClick={handleDisconnectStrava}
                                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                                >
                                    Koble fra
                                </button>
                            ) : (
                                <a
                                    href={getStravaAuthUrl()}
                                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                                >
                                    Koble til
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-center py-8">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">BulkBro v1.0.1</p>
                </div>

            </main>
        </div>
    );
}
