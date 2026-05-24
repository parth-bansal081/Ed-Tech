'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
    const [profile, setProfile] = useState({
        full_name: '',
        dyslexia_friendly: false,
        high_contrast: false,
        sign_language_preference: false,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Fetch current user session on mount
        async function getUserProfile() {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data, error } = await supabase.from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) setProfile(data);
            }
            setLoading(false);
        }

        getUserProfile();

        // 2. Listen for auth changes live (login/logout events)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                if (data) setProfile(data);
            } else {
                // Clear state on sign out
                setProfile({ full_name: '', dyslexia_friendly: false, high_contrast: false, sign_language_preference: false });
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AccessibilityContext.Provider value={{ profile, setProfile, loading }}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export const useAccessibility = () => useContext(AccessibilityContext);