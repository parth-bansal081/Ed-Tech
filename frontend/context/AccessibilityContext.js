'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AccessibilityContext = createContext();

/**
 * THEME DEFINITIONS — Light Educational Theme System
 * ─────────────────────────────────────────────────────
 * Four themes, all built on a light cream base.
 *
 * 'edu-light'    → Standard Light Educational Primary (default)
 *                  Warm cream backgrounds, sky-blue/indigo accents,
 *                  white card tiles, friendly shadows.
 *
 * 'high-contrast'→ Sharp High-Contrast (WCAG AAA)
 *                  Pure white background, near-black text (#0f172a),
 *                  vivid yellow-400 focus rings & active indicators,
 *                  thick 3px borders. Animations disabled.
 *
 * 'low-sensory'  → Muted Pastel (ADHD / Autism friendly)
 *                  Very pale sky-50 base, soft charcoal text,
 *                  no glows, no gradients, no animations.
 *
 * 'eco-saver'    → Eco-Saver / Low-Bandwidth Mobile
 *                  Plain white base, system-ui web-safe fonts only,
 *                  no external assets, no animations, minimal shadows.
 *
 * NOTE: 'high-contrast' is the only theme that also writes
 *       `high_contrast: true` to the Supabase profiles table.
 *       All other theme choices are persisted in localStorage only
 *       to respect the Zero-Backend-Changes constraint.
 */
export function AccessibilityProvider({ children }) {
    const [profile, setProfile] = useState({
        full_name: '',
        dyslexia_friendly: false,
        high_contrast: false,
        sign_language_preference: false,
        // 'edu-light' | 'high-contrast' | 'low-sensory' | 'eco-saver'
        theme: 'edu-light',
    });
    const [loading, setLoading] = useState(true);

    /**
     * updateTheme — client-side theme switcher.
     * Persists to localStorage. Syncs high_contrast flag to Supabase
     * only when switching to/from 'high-contrast'.
     */
    const updateTheme = async (newTheme) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('aerolearn_theme', newTheme);
        }

        const isHighContrast = newTheme === 'high-contrast';

        // 1. Optimistic local state update
        setProfile(prev => ({
            ...prev,
            theme: newTheme,
            high_contrast: isHighContrast,
        }));

        // 2. Sync high_contrast column to Supabase (no schema change needed)
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        high_contrast: isHighContrast,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', user.id);
                if (error) throw error;
                console.log(`[AeroLearn Theme] Synced theme '${newTheme}' → high_contrast=${isHighContrast}`);
            }
        } catch (err) {
            console.error('[AeroLearn Theme Sync Error]:', err);
        }
    };

    useEffect(() => {
        async function getUserProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                let dbProfile = null;
                if (user) {
                    const { data } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();
                    if (data) dbProfile = data;
                }

                // Resolve the theme: Supabase high_contrast takes precedence,
                // otherwise fall back to localStorage (never re-apply 'high-contrast'
                // if the DB flag is false — prevents stuck state).
                const localTheme = typeof window !== 'undefined'
                    ? (localStorage.getItem('aerolearn_theme') || 'edu-light')
                    : 'edu-light';

                setProfile(prev => {
                    const merged = dbProfile ? { ...dbProfile } : { ...prev };
                    if (merged.high_contrast) {
                        merged.theme = 'high-contrast';
                    } else {
                        merged.theme = localTheme === 'high-contrast' ? 'edu-light' : localTheme;
                    }
                    return merged;
                });
            } catch (err) {
                console.error('[AccessibilityContext boot error]:', err);
            } finally {
                setLoading(false);
            }
        }

        getUserProfile();

        // Live auth-state listener (login / logout events)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    try {
                        const { data } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', session.user.id)
                            .single();

                        const localTheme = typeof window !== 'undefined'
                            ? (localStorage.getItem('aerolearn_theme') || 'edu-light')
                            : 'edu-light';

                        if (data) {
                            setProfile({
                                ...data,
                                theme: data.high_contrast
                                    ? 'high-contrast'
                                    : (localTheme === 'high-contrast' ? 'edu-light' : localTheme),
                            });
                        }
                    } catch (err) {
                        console.error('[AccessibilityContext auth change error]:', err);
                    }
                } else {
                    // Sign-out: clear profile, retain local theme preference
                    const localTheme = typeof window !== 'undefined'
                        ? (localStorage.getItem('aerolearn_theme') || 'edu-light')
                        : 'edu-light';

                    setProfile({
                        full_name: '',
                        dyslexia_friendly: false,
                        high_contrast: false,
                        sign_language_preference: false,
                        theme: localTheme === 'high-contrast' ? 'edu-light' : localTheme,
                    });
                }
            }
        );

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
    // Safe fallback when the provider is bypassed in layouts or tests
    if (context === undefined) {
        return {
            profile: {
                full_name: 'Learner',
                dyslexia_friendly: false,
                high_contrast: false,
                sign_language_preference: false,
                theme: 'edu-light',
            },
            setProfile: () => {},
            updateTheme: () => {},
            loading: false,
        };
    }
    return context;
};