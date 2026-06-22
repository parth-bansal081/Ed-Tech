'use client';
import { useAccessibility } from '@/context/AccessibilityContext';

export default function RootThemeWrapper({ children }) {
    const { profile, loading } = useAccessibility();

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
      ${profile.high_contrast ? 'bg-black text-yellow-400 selection:bg-yellow-400 selection:text-black' : 'bg-slate-950 text-slate-100'}
      ${profile.dyslexia_friendly ? 'font-dyslexic tracking-wide' : 'font-sans'}
    `}>
            {children}
        </div>
    );
}