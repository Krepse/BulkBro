import { useState, useEffect } from 'react';
import { Icons } from '../components/ui/Icons';
import { isStravaConnected, disconnectStrava } from '../services/strava';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';

interface SettingsViewProps {
    onNavigate: (view: any) => void;
    userEmail: string | undefined;
    onSignOut: () => void;
}

interface Feedback {
    id: number;
    created_at: string;
    user_email: string;
    message: string;
}

export function SettingsView({ onNavigate, userEmail, onSignOut }: SettingsViewProps) {
    const [stravaConnected, setStravaConnected] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Admin State
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminFeedbackList, setAdminFeedbackList] = useState<Feedback[]>([]);
    const isAdmin = userEmail?.toLowerCase() === 'stianberg2@gmail.com';

    useEffect(() => {
        isStravaConnected().then(setStravaConnected);
    }, []);

    const handleConnectStrava = () => {
        const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
        // Dynamic redirect URI based on current origin (works for localhost and Netlify)
        const redirectUri = window.location.origin;
        const scope = "activity:read_all,activity:write";
        window.location.href = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=${scope}`;
    };

    const handleDisconnectStrava = async () => {
        await disconnectStrava();
        setStravaConnected(false);
    };

    const handleSubmitFeedback = async () => {
        if (!feedbackText.trim()) return;
        setIsSubmitting(true);
        setFeedbackMessage(null);

        try {
            const { error } = await supabase
                .from('feedback')
                .insert([{ user_email: userEmail, message: feedbackText }]);

            if (error) throw error;

            setFeedbackMessage({ type: 'success', text: 'Takk! Din tilbakemelding er sendt.' });
            setFeedbackText('');
            setTimeout(() => setShowFeedbackModal(false), 2000);
        } catch (error: any) {
            console.error('Feedback error:', error);
            setFeedbackMessage({ type: 'error', text: 'Kunne ikke sende tilbakemelding. Prøv igjen senere.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchAdminFeedback = async () => {
        if (!isAdmin) return;
        try {
            const { data, error } = await supabase
                .from('feedback')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAdminFeedbackList(data || []);
        } catch (err) {
            console.error('Failed to fetch feedback:', err);
        }
    };

    useEffect(() => {
        if (showAdminModal && isAdmin) {
            fetchAdminFeedback();
        }
    }, [showAdminModal, isAdmin]);

    return (
        <div className="min-h-screen bg-slate-50 pb-40">
            <header className="bg-white px-6 py-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-50">
                <button
                    onClick={() => onNavigate('home')}
                    className="text-slate-400 p-3 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <Icons.ChevronLeft className="w-8 h-8" />
                </button>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Innstillinger</h1>
            </header>

            <main className="max-w-xl mx-auto p-6 space-y-8 mt-6">
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-6">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Konto</h2>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl uppercase">
                            {userEmail?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-slate-900 truncate">{userEmail}</p>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Logget inn</p>
                        </div>
                    </div>

                    <button
                        onClick={onSignOut}
                        className="w-full py-4 bg-red-50 text-red-500 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors uppercase tracking-wider text-sm"
                    >
                        <Icons.LogOut className="w-5 h-5" />
                        Logg ut
                    </button>
                </div>

                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-6">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Support</h2>

                    <button
                        onClick={() => setShowFeedbackModal(true)}
                        className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors uppercase tracking-wider text-sm border border-slate-100"
                    >
                        <Icons.MessageSquare className="w-5 h-5" />
                        Gi Tilbakemelding
                    </button>

                    {isAdmin && (
                        <button
                            onClick={() => setShowAdminModal(true)}
                            className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors uppercase tracking-wider text-sm shadow-lg shadow-slate-200"
                        >
                            <Icons.Shield className="w-5 h-5" />
                            Admin: Se Meldinger
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-6">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Integrasjoner</h2>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-[#FC4C02]/10 rounded-xl flex items-center justify-center text-[#FC4C02]">
                                <Icons.Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 text-lg italic">STRAVA</h3>
                                <p className="text-xs text-slate-400 font-medium">Synkroniser økter automatisk</p>
                            </div>
                        </div>

                        {stravaConnected ? (
                            <button
                                onClick={handleDisconnectStrava}
                                className="w-full py-3 bg-slate-200 text-slate-500 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-300 transition-colors uppercase tracking-wider text-xs"
                            >
                                <Icons.Unlink className="w-4 h-4" />
                                Koble fra Strava
                            </button>
                        ) : (
                            <button
                                onClick={handleConnectStrava}
                                className="w-full py-3 bg-[#FC4C02] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#E34402] transition-colors uppercase tracking-wider text-xs shadow-lg shadow-[#FC4C02]/20"
                            >
                                <Icons.Activity className="w-4 h-4" />
                                Koble til Strava
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-6">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Om Appen</h2>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                            <Icons.Info className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">BulkBro v1.0</p>
                            <p className="text-xs text-slate-400 font-medium">Utviklet av Stian Berg</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* FEEDBACK MODAL */}
            {showFeedbackModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative">
                        <button
                            onClick={() => setShowFeedbackModal(false)}
                            className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 p-2"
                        >
                            <Icons.X className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-500">
                                <Icons.MessageSquare className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Gi Tilbakemelding</h3>
                            <p className="text-slate-500 text-sm mt-2">
                                Har du forslag til forbedringer eller oppdaget en feil? Vi vil gjerne høre fra deg!
                            </p>
                        </div>

                        <div className="space-y-4">
                            <textarea
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-32 placeholder:text-slate-400"
                                placeholder="Skriv din melding her..."
                            />

                            {feedbackMessage && (
                                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${feedbackMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                                    }`}>
                                    <Icons.Info className="w-4 h-4" />
                                    {feedbackMessage.text}
                                </div>
                            )}

                            <Button
                                onClick={handleSubmitFeedback}
                                disabled={!feedbackText.trim() || isSubmitting}
                                variant="primary"
                                className="w-full"
                            >
                                {isSubmitting ? 'Sender...' : 'Send Melding'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADMIN DASHBOARD MODAL */}
            {showAdminModal && isAdmin && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl h-[80vh] shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-[2rem]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-white">
                                    <Icons.Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Admin Dashboard</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Innkomne meldinger</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAdminModal(false)}
                                className="text-slate-300 hover:text-slate-500 p-2 bg-white rounded-full shadow-sm border border-slate-100"
                            >
                                <Icons.X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                            {adminFeedbackList.length === 0 ? (
                                <div className="text-center py-20 text-slate-400">
                                    <Icons.MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p className="font-bold italic">Ingen meldinger funnet.</p>
                                </div>
                            ) : (
                                adminFeedbackList.map((item) => (
                                    <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                                                    {item.user_email.charAt(0)}
                                                </div>
                                                <span className="font-bold text-slate-700 text-sm">{item.user_email}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 text-sm whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100/50">
                                            {item.message}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
