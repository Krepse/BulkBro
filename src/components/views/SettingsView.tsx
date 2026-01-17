import React from 'react';
import { LogOut, Link2, ExternalLink, Activity, Info, AlertCircle, Dumbbell, Trash2, Plus, Pencil, X, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Exercise, ExerciseType } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface SettingsViewProps {
    customExercises: Exercise[];
    onSaveExercise: (exercise: Exercise) => void;
    onDeleteExercise: (id: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ customExercises, onSaveExercise, onDeleteExercise }) => {
    const { user } = useAuth();
    const [newExerciseName, setNewExerciseName] = React.useState('');
    const [newExerciseType, setNewExerciseType] = React.useState<ExerciseType>('Stang');
    const [stravaConnected, setStravaConnected] = React.useState(false);

    // New UX State
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
    const [editName, setEditName] = React.useState('');
    const [editType, setEditType] = React.useState<ExerciseType>('Stang');

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

    const handleAddExercise = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newExerciseName) return;

        const newEx: Exercise = {
            id: crypto.randomUUID(),
            name: newExerciseName,
            type: newExerciseType,
            description: newExerciseType
        };
        onSaveExercise(newEx);
        setNewExerciseName('');
    };

    const startEditing = (ex: Exercise) => {
        setEditingId(ex.id);
        setEditName(ex.name);
        setEditType(ex.type || 'Stang');
    };

    const saveEditing = (originalEx: Exercise) => {
        onSaveExercise({
            ...originalEx,
            name: editName,
            type: editType
        });
        setEditingId(null);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditName('');
    };

    const handleConnectStrava = () => {
        const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
        const redirectUri = import.meta.env.VITE_STRAVA_REDIRECT_URI;
        const scope = "activity:read_all,activity:write";
        window.location.href = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=${scope}`;
    };

    const handleDeleteClick = (id: string) => {
        setConfirmDeleteId(id);
    };

    const confirmDelete = () => {
        if (confirmDeleteId) {
            onDeleteExercise(confirmDeleteId);
            setConfirmDeleteId(null);
            setEditingId(null);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 space-y-6 pb-24 relative">
            {/* Confirmation Modal Overlay */}
            {confirmDeleteId && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-2">Er du sikker?</h3>
                        <p className="text-slate-400 mb-6 text-sm">Vil du slette denne øvelsen permanent for alle brukere?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700"
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-500 shadow-lg shadow-red-900/20"
                            >
                                Slett
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

            {/* Custom Exercises Section */}
            <section className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-purple-500" />
                    Mine Øvelser
                </h2>

                <form onSubmit={handleAddExercise} className="flex gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Navn på øvelse..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        value={newExerciseName}
                        onChange={e => setNewExerciseName(e.target.value)}
                    />
                    <select
                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white max-w-[100px] focus:outline-none focus:border-blue-500"
                        value={newExerciseType}
                        onChange={e => setNewExerciseType(e.target.value as ExerciseType)}
                    >
                        <option value="Stang">Stang</option>
                        <option value="Manualer">Manualer</option>
                        <option value="Kabel">Kabel</option>
                        <option value="Maskin">Maskin</option>
                        <option value="Egenvekt">Egenvekt</option>
                    </select>
                    <button type="submit" className="bg-purple-600 hover:bg-purple-500 p-2 rounded-lg text-white transition-colors">
                        <Plus className="w-4 h-4" />
                    </button>
                </form>

                <div className="space-y-2">
                    {customExercises.map(ex => {
                        const isEditing = editingId === ex.id;
                        return (
                            <div key={ex.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isEditing ? 'bg-slate-800 border-purple-500 shadow-md' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                                <div className="flex-1 mr-4">
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-500"
                                                autoFocus
                                            />
                                            <select
                                                value={editType}
                                                onChange={e => setEditType(e.target.value as ExerciseType)}
                                                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                                            >
                                                <option value="Stang">Stang</option>
                                                <option value="Manualer">Manualer</option>
                                                <option value="Kabel">Kabel</option>
                                                <option value="Maskin">Maskin</option>
                                                <option value="Egenvekt">Egenvekt</option>
                                            </select>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="font-medium text-white text-sm">{ex.name}</p>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wide">{ex.type}</p>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={() => saveEditing(ex)}
                                                className="w-8 h-8 flex items-center justify-center bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-colors"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(ex.id)}
                                                className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                                title="Slett"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={cancelEditing}
                                                className="w-8 h-8 flex items-center justify-center bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
                                                title="Avbryt"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => startEditing(ex)}
                                            className="text-slate-600 hover:text-blue-400 transition-colors p-2"
                                            title="Rediger"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {customExercises.length === 0 && <p className="text-slate-500 text-sm text-center py-4 italic">Ingen egne øvelser enda.</p>}
                </div>
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
                            onClick={() => setStravaConnected(false)}
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
