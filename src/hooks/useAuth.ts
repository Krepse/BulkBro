import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for Admin Bypass
        const adminBypass = localStorage.getItem('bb_admin_bypass');
        if (adminBypass) {
            // Use a VALID UUID for the admin mock user to satisfy Postgres constraints
            const mockAdminId = '00000000-0000-0000-0000-000000000000';
            setUser({ id: mockAdminId, email: 'admin@bulkbro.local', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: new Date().toISOString() });
            setSession({ user: { id: mockAdminId }, access_token: 'mock', token_type: 'bearer', expires_in: 3600, refresh_token: 'mock' } as any);
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }: any) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event: any, session: Session | null) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return { user, session, loading };
}
