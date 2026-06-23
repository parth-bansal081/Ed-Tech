'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function OnboardingForm() {
  const [fullName, setFullName] = useState('');
  const [dyslexiaFriendly, setDyslexiaFriendly] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [signLanguagePreference, setSignLanguagePreference] = useState(false);
  
  const [submitStatus, setSubmitStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('loading');
    setErrorMessage('');

    try {
      // Step 1: Capture the currently logged-in user's active session ID
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error(authError?.message || 'Authentication session not found. Please log in first.');
      }

      // Step 2: Issue an upsert to save user preferences cleanly to the public 'profiles' table
      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          dyslexia_friendly: dyslexiaFriendly,
          high_contrast: highContrast,
          sign_language_preference: signLanguagePreference,
          updated_at: new Date().toISOString()
        });

      if (dbError) {
        throw dbError;
      }

      setSubmitStatus('success');
    } catch (err) {
      console.error('Error during onboarding save:', err);
      setSubmitStatus('error');
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl transition-all duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
          Personalize Your Learning Journey
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Please fill out your details and choose your accommodations. These preferences can be toggled on-the-fly at any time to optimize your cognitive comfort and reading flow.
        </p>
      </div>

      {/* WCAG Accessible Live Region / Alert Banner */}
      {submitStatus === 'success' && (
        <div 
          role="alert" 
          className="mb-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-medium flex items-center gap-3 transition-all duration-300"
        >
          <span className="text-lg">✓</span>
          <span>Your accessibility profile has been successfully saved! Enjoy your tailored learning experience.</span>
        </div>
      )}

      {submitStatus === 'error' && (
        <div 
          role="alert" 
          className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm font-medium flex items-center gap-3 transition-all duration-300"
        >
          <span className="text-lg">⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleOnboardingSubmit} className="space-y-6">
        {/* Full Name Input block with strict labeling */}
        <div>
          <label 
            htmlFor="full-name-input" 
            className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
          >
            Full Name
          </label>
          <input
            type="text"
            id="full-name-input"
            required
            disabled={submitStatus === 'loading'}
            placeholder="e.g. Alex Morgan"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-all duration-200"
          />
        </div>

        {/* Accessibility Switches wrapped in an accessible semantic fieldset */}
        <fieldset className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <legend className="px-3 text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide">
            Accessibility Accommodations
          </legend>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Toggling these controls configures our dynamic interface layers to match your visual or cognitive processing style.
          </p>

          <div className="space-y-3">
            {/* Toggle Card 1: Dyslexia Friendly */}
            <label 
              htmlFor="dyslexia-switch"
              className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer select-none transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-900 focus-within:outline-none ${
                dyslexiaFriendly 
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-500' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center h-5">
                <input
                  id="dyslexia-switch"
                  type="checkbox"
                  checked={dyslexiaFriendly}
                  disabled={submitStatus === 'loading'}
                  onChange={(e) => setDyslexiaFriendly(e.target.checked)}
                  aria-label="Enable Dyslexia Friendly Typeface"
                  className="w-5 h-5 rounded text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
              <div className="flex-1 text-sm">
                <span className="block font-semibold text-slate-900 dark:text-white">
                  Dyslexia-Friendly Typeface
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Adjusts letter spacing, weight, and font-family (OpenDyslexic) to enhance readability and reduce cognitive strain.
                </span>
              </div>
            </label>

            {/* Toggle Card 2: High Contrast */}
            <label 
              htmlFor="contrast-switch"
              className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer select-none transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-900 focus-within:outline-none ${
                highContrast 
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-500' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center h-5">
                <input
                  id="contrast-switch"
                  type="checkbox"
                  checked={highContrast}
                  disabled={submitStatus === 'loading'}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  aria-label="Enable High Contrast Interface Mode"
                  className="w-5 h-5 rounded text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
              <div className="flex-1 text-sm">
                <span className="block font-semibold text-slate-900 dark:text-white">
                  High-Contrast Interface
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Maximizes color luminosity and text contrast ratios to improve readability for users with low vision or photophobia.
                </span>
              </div>
            </label>

            {/* Toggle Card 3: Sign Language Preference */}
            <label 
              htmlFor="sign-lang-switch"
              className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer select-none transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-900 focus-within:outline-none ${
                signLanguagePreference 
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-500' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center h-5">
                <input
                  id="sign-lang-switch"
                  type="checkbox"
                  checked={signLanguagePreference}
                  disabled={submitStatus === 'loading'}
                  onChange={(e) => setSignLanguagePreference(e.target.checked)}
                  aria-label="Prefer Sign Language Video Accommodations"
                  className="w-5 h-5 rounded text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
              <div className="flex-1 text-sm">
                <span className="block font-semibold text-slate-900 dark:text-white">
                  Sign Language Videos (ASL)
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enables virtual AI-generated sign language avatars alongside textbook readings and video content for deaf or hard-of-hearing learners.
                </span>
              </div>
            </label>
          </div>
        </fieldset>

        {/* Submit Button with high-contrast active and loading states */}
        <button
          type="submit"
          disabled={submitStatus === 'loading'}
          className="w-full relative py-4 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-base font-bold shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none transition-all duration-200"
        >
          {submitStatus === 'loading' ? (
            <span className="flex items-center justify-center gap-3">
              {/* Accessible Spinner */}
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving Accessibility Profile...
            </span>
          ) : (
            'Complete Setup & Begin Learning'
          )}
        </button>
      </form>
    </div>
  );
}
