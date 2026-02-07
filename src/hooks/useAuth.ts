import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const lastUpdateRef = useRef<number>(0);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }: any) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            lastUpdateRef.current = Date.now();
        });

        // Listen for changes with throttling
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event: any, session: Session | null) => {
            const now = Date.now();
            // Only update if more than 1 second has passed since last update
            // This prevents rapid-fire updates during token refresh
            if (now - lastUpdateRef.current > 1000) {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
                lastUpdateRef.current = now;
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return { user, session, loading };
}
