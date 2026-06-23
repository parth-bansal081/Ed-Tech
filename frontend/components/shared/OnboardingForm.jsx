'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAccessibility } from '@/context/AccessibilityContext';
import {
  User,
  Palette,
  Eye,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Globe,
  HelpCircle,
  Cpu,
  Bookmark
} from 'lucide-react';

export default function OnboardingForm() {
  const { profile, updateTheme } = useAccessibility();

  // Step state: 1 = Callsign, 2 = Theme Calibration, 3 = Guidance Systems, 4 = Pre-Flight Summary
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [dyslexiaFriendly, setDyslexiaFriendly] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [signLanguagePreference, setSignLanguagePreference] = useState(false);

  // Client-side local theme choice
  const [selectedTheme, setSelectedTheme] = useState('cosmic-dark');

  // Submit and loading states
  const [submitStatus, setSubmitStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // Voice Assistant Option (Client-side SpeechSynthesis)
  const [voiceAssistant, setVoiceAssistant] = useState(false);

  // Handle Speech Synthesis
  const speakText = (text) => {
    if (!voiceAssistant || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Trigger speech on step changes
  useEffect(() => {
    if (!voiceAssistant) return;
    let textToSpeak = '';
    if (step === 1) {
      textToSpeak = "Step 1: Pilot Identification. Please write your name or callsign to begin your space learning journey.";
    } else if (step === 2) {
      textToSpeak = "Step 2: Theme Calibration. Select your cockpit style. Choose Cosmic Dark, High Contrast, Low Sensory, or Eco Saver mode.";
    } else if (step === 3) {
      textToSpeak = "Step 3: Guidance Systems. Turn on dyslexia font support or virtual sign language video guides.";
    } else if (step === 4) {
      textToSpeak = "Step 4: Flight Clearance. Review your configuration and click complete setup when ready to launch.";
    }
    speakText(textToSpeak);
  }, [step, voiceAssistant]);

  // Initial Sync from Global Accessibility Context if available
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setDyslexiaFriendly(profile.dyslexia_friendly || false);
      setHighContrast(profile.high_contrast || false);
      setSignLanguagePreference(profile.sign_language_preference || false);
      setSelectedTheme(profile.theme || 'cosmic-dark');
    }
  }, [profile]);

  // Handle Theme Switch locally and update context
  const handleThemeChange = (themeName) => {
    setSelectedTheme(themeName);
    const isHighContrast = themeName === 'high-contrast';
    setHighContrast(isHighContrast);
    updateTheme(themeName);
  };

  const handleOnboardingSubmit = async (e) => {
    if (e) e.preventDefault();
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
      speakText("Launch configuration synced successfully! Welcome aboard, pilot.");
      
      // Delay to let user enjoy the green success state animation
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard';
        }
      }, 1500);

    } catch (err) {
      console.error('Error during onboarding save:', err);
      setSubmitStatus('error');
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
      speakText("Warning. Error synchronizing pilot profile. Please review the notification panel.");
    }
  };

  // Wizard Navigation
  const nextStep = () => {
    if (step === 1 && !fullName.trim()) {
      setErrorMessage("Please enter your name to proceed.");
      speakText("Please enter your name to proceed.");
      return;
    }
    setErrorMessage('');
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setErrorMessage('');
    setStep(prev => prev - 1);
  };

  // Determine container style class based on selected theme
  const getContainerStyle = () => {
    switch (selectedTheme) {
      case 'high-contrast':
        return 'bg-black border-4 border-yellow-400 text-yellow-400 font-sans';
      case 'low-sensory':
        return 'bg-sky-50/90 border border-sky-200 text-slate-800 font-sans shadow-lg';
      case 'eco-saver':
        return 'bg-white border border-gray-300 text-black font-mono shadow-sm';
      case 'cosmic-dark':
      default:
        return 'bg-[#0f122c]/85 border border-purple-500/20 text-slate-100 backdrop-blur-xl shadow-2xl';
    }
  };

  return (
    <div className={`w-full max-w-xl mx-auto p-6 md:p-8 rounded-2xl transition-all duration-300 ${getContainerStyle()} ${dyslexiaFriendly ? 'font-dyslexic' : ''}`}>
      
      {/* Wizard Cockpit Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-purple-500/10">
        <div>
          <span className="text-xs uppercase tracking-widest opacity-60 font-mono flex items-center gap-1">
            <Cpu className="size-3.5" /> Cockpit Config Step {step} of 4
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1 flex items-center gap-2">
            <Sparkles className="size-6 text-purple-400" />
            Pre-Flight Calibration
          </h1>
        </div>

        {/* Voice Assistant Toggle */}
        <button
          type="button"
          onClick={() => {
            const nextVoice = !voiceAssistant;
            setVoiceAssistant(nextVoice);
            if (nextVoice) {
              // Wait briefly for state change before speaking
              setTimeout(() => speakText("Voice guidance activated! Ready to navigate."), 100);
            }
          }}
          className={`p-2.5 rounded-xl border transition-all flex items-center gap-1 text-xs font-mono font-bold ${
            voiceAssistant 
              ? 'border-green-400 bg-green-500/10 text-green-400' 
              : 'border-slate-500/30 hover:border-slate-400 text-slate-400'
          }`}
          aria-label={voiceAssistant ? "Deactivate Voice Assistant" : "Activate Voice Assistant"}
        >
          {voiceAssistant ? <Volume2 className="size-4 animate-bounce" /> : <VolumeX className="size-4" />}
          {voiceAssistant ? "VOICE: ON" : "VOICE: OFF"}
        </button>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1 bg-slate-800 rounded-full mb-8 overflow-hidden flex">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500 rounded-full" 
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* WCAG Live Status / Notifications */}
      {errorMessage && (
        <div role="alert" className="mb-6 p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-mono flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {submitStatus === 'success' && (
        <div role="alert" className="mb-6 p-4 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 text-xs font-mono flex items-center gap-2">
          <span>✓</span>
          <span>Launch profile calibrated successfully! Initializing classroom portal...</span>
        </div>
      )}

      {/* Animated Step Wizard Container */}
      <div className="min-h-[260px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25 }}
            className="flex-1"
          >
            
            {/* STEP 1: Callsign Setup */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <User className="size-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Pilot Callsign</h2>
                    <p className="text-xs opacity-75">Every space explorer needs a name to register in the classroom databases.</p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <label htmlFor="full-name-input" className="block text-xs font-bold font-mono opacity-80 mb-2 uppercase">
                    Explorer Callsign (Name)
                  </label>
                  <input
                    type="text"
                    id="full-name-input"
                    required
                    placeholder="Enter your name here..."
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#080a1c] border-2 border-purple-500/15 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 p-3.5 rounded-xl text-sm focus:outline-none transition-all duration-200 text-white placeholder-slate-500"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Theme Calibration */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Palette className="size-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Cockpit Visual Theme</h2>
                    <p className="text-xs opacity-75">Choose a theme calibrated for your visual comfort and device performance.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {/* Theme 1: Cosmic Dark */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange('cosmic-dark')}
                    className={`p-4 text-left rounded-xl border-2 transition-all flex flex-col justify-between h-28 ${
                      selectedTheme === 'cosmic-dark'
                        ? 'border-purple-500 bg-[#12163b] text-white shadow-lg'
                        : 'border-slate-800 bg-[#0c0e25]/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-extrabold text-sm block">🌌 Cosmic Dark</span>
                    <span className="text-[10px] leading-tight block mt-1 opacity-70">Deep space UI with floating glowing panels.</span>
                  </button>

                  {/* Theme 2: High Contrast */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange('high-contrast')}
                    className={`p-4 text-left rounded-xl border-2 transition-all flex flex-col justify-between h-28 ${
                      selectedTheme === 'high-contrast'
                        ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400 shadow-lg'
                        : 'border-slate-800 bg-[#0c0e25]/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-extrabold text-sm block">👁️ High Contrast</span>
                    <span className="text-[10px] leading-tight block mt-1 opacity-70">Bold outlines and high-luminosity readability.</span>
                  </button>

                  {/* Theme 3: Low Sensory */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange('low-sensory')}
                    className={`p-4 text-left rounded-xl border-2 transition-all flex flex-col justify-between h-28 ${
                      selectedTheme === 'low-sensory'
                        ? 'border-sky-400 bg-sky-100/30 text-sky-800 shadow-lg'
                        : 'border-slate-800 bg-[#0c0e25]/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-extrabold text-sm block">🍃 Low Sensory</span>
                    <span className="text-[10px] leading-tight block mt-1 opacity-70">Calming layout, muted colors, static shapes.</span>
                  </button>

                  {/* Theme 4: Eco Saver */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange('eco-saver')}
                    className={`p-4 text-left rounded-xl border-2 transition-all flex flex-col justify-between h-28 ${
                      selectedTheme === 'eco-saver'
                        ? 'border-gray-500 bg-gray-100 text-slate-900 shadow-lg'
                        : 'border-slate-800 bg-[#0c0e25]/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-extrabold text-sm block">🔋 Eco Saver</span>
                    <span className="text-[10px] leading-tight block mt-1 opacity-70">Ultra fast load. Optimized to conserve bandwidth.</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Guidance Systems */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Eye className="size-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Guidance & Accessibility</h2>
                    <p className="text-xs opacity-75">Enable specialized helpers for reading, hearing, and cognitive processing.</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  {/* Dyslexia Toggle Card */}
                  <div
                    onClick={() => setDyslexiaFriendly(prev => !prev)}
                    className={`p-4 rounded-xl border-2 cursor-pointer flex justify-between items-center transition-all ${
                      dyslexiaFriendly
                        ? 'border-purple-500 bg-purple-500/5'
                        : 'border-slate-800 bg-[#0a0c20]/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex-1 pr-4">
                      <span className="font-bold text-sm block">📖 Dyslexia-Friendly Textures</span>
                      <span className="text-[10px] opacity-70 mt-1 block">Adjusts characters and line weight to prevent letters from jumping on-screen.</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${dyslexiaFriendly ? 'bg-purple-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-1 size-3 bg-white rounded-full transition-all ${dyslexiaFriendly ? 'right-1' : 'left-1'}`} />
                    </div>
                  </div>

                  {/* Sign Language Toggle Card */}
                  <div
                    onClick={() => setSignLanguagePreference(prev => !prev)}
                    className={`p-4 rounded-xl border-2 cursor-pointer flex justify-between items-center transition-all ${
                      signLanguagePreference
                        ? 'border-purple-500 bg-purple-500/5'
                        : 'border-slate-800 bg-[#0a0c20]/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex-1 pr-4">
                      <span className="font-bold text-sm block">🤟 Sign Language Avatars</span>
                      <span className="text-[10px] opacity-70 mt-1 block">Renders a virtual sign-language assistant overlay side-by-side with reading pages.</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${signLanguagePreference ? 'bg-purple-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-1 size-3 bg-white rounded-full transition-all ${signLanguagePreference ? 'right-1' : 'left-1'}`} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Flight Summary Checklist */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <CheckCircle className="size-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Pre-Flight Review</h2>
                    <p className="text-xs opacity-75">All navigation points calibrated. Confirm launch metrics below.</p>
                  </div>
                </div>

                <div className="bg-[#080a1c]/60 border border-purple-500/10 rounded-xl p-4 space-y-3 font-mono text-xs text-slate-300">
                  <div className="flex justify-between border-b border-purple-500/5 pb-1.5">
                    <span>PILOT CALLSIGN:</span>
                    <span className="text-purple-400 font-bold">{fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-purple-500/5 pb-1.5">
                    <span>COCKPIT THEME:</span>
                    <span className="text-sky-400 font-bold uppercase">{selectedTheme}</span>
                  </div>
                  <div className="flex justify-between border-b border-purple-500/5 pb-1.5">
                    <span>DYSLEXIA FONT:</span>
                    <span className={dyslexiaFriendly ? 'text-green-400 font-bold' : 'text-slate-500'}>
                      {dyslexiaFriendly ? 'ENGAGED' : 'DEACTIVATED'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>SIGN LANG. AVATAR:</span>
                    <span className={signLanguagePreference ? 'text-green-400 font-bold' : 'text-slate-500'}>
                      {signLanguagePreference ? 'ENGAGED' : 'DEACTIVATED'}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Wizard Controls */}
        <div className="flex justify-between items-center pt-6 mt-6 border-t border-purple-500/10">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2.5 rounded-xl border border-slate-500/20 text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-all flex items-center gap-1.5 cursor-pointer text-slate-300"
              >
                <ArrowLeft className="size-4" /> Back
              </button>
            )}
          </div>

          <div>
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-purple-600/15 cursor-pointer"
              >
                Continue <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitStatus === 'loading'}
                onClick={handleOnboardingSubmit}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitStatus === 'loading' ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Calibrating...
                  </>
                ) : (
                  <>
                    Commence Launch <CheckCircle className="size-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
