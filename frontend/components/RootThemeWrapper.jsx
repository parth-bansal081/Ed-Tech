'use client';
import { useAccessibility } from '@/context/AccessibilityContext';
import { useEffect } from 'react';

export default function RootThemeWrapper({ children }) {
    const { profile, loading } = useAccessibility();
    console.log('[RootThemeWrapper] Rendering wrapper. loading =', loading, 'profile =', profile);

    useEffect(() => {
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            document.documentElement.style.fontSize = `${(profile?.text_size_scale || 1.0) * 16}px`;
        }
    }, [profile?.text_size_scale]);

    // Show a clean, centered loading state while Supabase checks auth tokens on boot
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-sans gap-3">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm tracking-wide">Syncing accessibility preferences...</p>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-all duration-300
      ${profile.high_contrast ? 'bg-black text-yellow-400 selection:bg-yellow-400 selection:text-black' : 'bg-[#121212] text-[#F5F1EA]'}
      ${profile.dyslexia_friendly ? 'font-dyslexic tracking-wide' : 'font-sans'}
    `}>
            {children}
        </div>
    );
}