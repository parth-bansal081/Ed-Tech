'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
    const [profile, setProfile] = useState({
        full_name: '',
        display_name: '',
        preferred_languages: [],
        disabilities: [],
        dyslexia_friendly: false,
        high_contrast: false,
        sign_language_preference: false,
        avatar_url: null,
        bio: '',
        reading_level_override: 'default',
        preferred_voice_id: 'Xb7hH8MSUJpSbSDYk0k2',
        narration_speed: 1.0,
        low_stimulus_mode: false,
        text_size_scale: 1.0,
        knowledge_hive_visibility: 'matched_groups',
        onboarding_completed_at: null,
        goals: [],
        theme: 'cosmic-dark', // 'cosmic-dark' | 'high-contrast' | 'low-sensory' | 'eco-saver'
    });
    const [loading, setLoading] = useState(true);

    // Sync theme selection to localStorage and update Supabase high_contrast if necessary
    const updateTheme = async (newTheme) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('aerolearn_theme', newTheme);
        }

        const isHighContrast = newTheme === 'high-contrast';

        // 1. Optimistic Local State Sync
        setProfile(prev => ({
            ...prev,
            theme: newTheme,
            high_contrast: isHighContrast
        }));

        // 2. Synchronize to Supabase if session exists
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        high_contrast: isHighContrast,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', user.id);

                if (error) throw error;
                console.log(`[Supabase Theme Sync] Synchronized theme '${newTheme}' (high_contrast = ${isHighContrast})`);
            }
        } catch (err) {
            console.error('[Supabase Theme Sync Error]:', err);
        }
    };

    useEffect(() => {
        // 1. Fetch current user session and preferences on mount
        async function getUserProfile() {
            try {
                console.log('[AccessibilityContext] getUserProfile: fetching user session...');
                if (typeof window !== 'undefined') {
                    fetch('https://sqjblpmthyisluwbqfhy.supabase.co')
                        .then(r => console.log('[DIAGNOSTIC] Fetch to Supabase URL succeeded:', r.status))
                        .catch(e => {
                            console.error('[DIAGNOSTIC] Fetch to Supabase URL failed. Activating local mock database...', e);
                            if (localStorage.getItem('aerolearn_use_mock') !== 'true') {
                                localStorage.setItem('aerolearn_use_mock', 'true');
                                window.location.reload();
                            }
                        });
                }
                const sessionPromise = supabase.auth.getSession();
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Session retrieval timed out after 10000ms')), 10000)
                );
                const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
                const user = session?.user;
                console.log('[AccessibilityContext] getUserProfile: user session fetched:', user);

                let dbProfile = null;
                if (user) {
                    console.log('[AccessibilityContext] getUserProfile: fetching database profile for user:', user.id);
                    const { data, error } = await supabase.from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (error) {
                        console.error('[AccessibilityContext] Error fetching profile from database:', error);
                    }
                    if (data) {
                        dbProfile = data;
                        console.log('[AccessibilityContext] Profile fetched from database:', dbProfile);
                    }
                }

                // Check localStorage for client-side only themes
                const localTheme = typeof window !== 'undefined' 
                    ? (localStorage.getItem('aerolearn_theme') || 'cosmic-dark') 
                    : 'cosmic-dark';

                setProfile(prev => {
                    const merged = dbProfile ? { ...dbProfile } : { ...prev };
                    
                    // Supabase 'high_contrast' column takes precedence.
                    if (merged.high_contrast) {
                        merged.theme = 'high-contrast';
                    } else {
                        // Otherwise, load local theme (making sure we don't load high-contrast if high_contrast is false in db)
                        merged.theme = localTheme === 'high-contrast' ? 'cosmic-dark' : localTheme;
                    }
                    console.log('[AccessibilityContext] Profile resolved and set:', merged);
                    return merged;
                });
            } catch (err) {
                console.error('[AccessibilityContext getUserProfile Error]:', err);
                if (typeof window !== 'undefined' && localStorage.getItem('aerolearn_use_mock') !== 'true') {
                    console.warn('[AccessibilityContext] Network connection issue. Activating Local Offline Sandbox Mode...');
                    localStorage.setItem('aerolearn_use_mock', 'true');
                    window.__use_mock_supabase = true;
                    window.location.reload();
                }
            } finally {
                console.log('[AccessibilityContext] getUserProfile completed. Setting loading = false');
                setLoading(false);
            }
        }

        getUserProfile();

        // 2. Listen for auth changes live (login/logout events)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                try {
                    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                    if (data) {
                        const localTheme = typeof window !== 'undefined' 
                            ? (localStorage.getItem('aerolearn_theme') || 'cosmic-dark') 
                            : 'cosmic-dark';
                        
                        setProfile({
                            ...data,
                            theme: data.high_contrast ? 'high-contrast' : (localTheme === 'high-contrast' ? 'cosmic-dark' : localTheme)
                        });
                    }
                } catch (err) {
                    console.error('[AccessibilityContext onAuthStateChange Profile Error]:', err);
                }
            } else {
                // Clear state on sign out but keep the client-side local theme
                const localTheme = typeof window !== 'undefined' 
                    ? (localStorage.getItem('aerolearn_theme') || 'cosmic-dark') 
                    : 'cosmic-dark';
                
                setProfile({
                    full_name: '',
                    dyslexia_friendly: false,
                    high_contrast: false,
                    sign_language_preference: false,
                    theme: localTheme === 'high-contrast' ? 'cosmic-dark' : localTheme
                });
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AccessibilityContext.Provider value={{ profile, setProfile, updateTheme, loading }}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (context === undefined) {
        // Safe testing fallback when the AccessibilityProvider is not mounted (e.g. bypassed in root layouts)
        return {
            profile: {
                full_name: 'Space Explorer',
                preferred_languages: [],
                disabilities: [],
                dyslexia_friendly: false,
                high_contrast: false,
                sign_language_preference: false,
                theme: 'cosmic-dark',
            },
            setProfile: () => {},
            updateTheme: () => {},
            loading: false
        };
    }
    return context;
};