'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Mail,
  Key,
  LogIn,
  UserCircle,
  Settings,
  LayoutDashboard,
  FileText,
  Upload,
  BookOpen,
  Layers,
  Accessibility,
  Globe,
  Cpu,
  Wifi,
  UploadCloud,
  CheckCircle2,
  Radar,
  Database,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Zap,
  Star,
  Filter,
  ChevronDown,
  Monitor,
  Smartphone,
  Info
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '@/lib/supabaseClient';
import { useAccessibility } from '@/context/AccessibilityContext';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const GlassCard = ({ children, className, active, onClick }) => (
  <div
    onClick={onClick}
    className={cn(
      "p-6 rounded-2xl border-2 transition-all duration-300",
      active
        ? "border-amber-400 bg-amber-50/70 shadow-[0_4px_12px_rgba(251,191,36,0.15)] text-slate-900"
        : "border-orange-100 bg-white hover:border-orange-200 hover:shadow-sm text-slate-700",
      className
    )}
  >
    {children}
  </div>
);

const CyberButton = ({
  children,
  variant = 'primary',
  className,
  onClick,
  icon: Icon,
  type = 'button',
  disabled = false
}) => {
  const variants = {
    primary: "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/10 font-bold border-b-4 border-orange-700 active:border-b-0 active:mt-1",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 border-2 border-slate-200 font-bold",
    ghost: "bg-transparent text-slate-600 hover:bg-orange-50/60 font-semibold",
    outline: "border-2 border-orange-400 text-orange-600 hover:bg-orange-50/50 font-bold"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-6 py-2.5 uppercase tracking-wider text-xs rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed h-10",
        variants[variant],
        className
      )}
    >
      {children}
      {Icon && <Icon className="size-4" />}
    </button>
  );
};

const ProgressIndicator = ({ phase, label, progress }) => (
  <section className="flex flex-col gap-3">
    <div className="flex justify-between items-end">
      <div>
        <p className="font-mono text-orange-500 uppercase tracking-widest mb-0.5 text-xs font-bold">{phase}</p>
        <h2 className="text-2xl font-black text-slate-800">{label}</h2>
      </div>
      <span className="font-mono text-slate-500 font-bold text-sm">{progress}%</span>
    </div>
    <div className="flex h-3 w-full bg-orange-100/50 rounded-full border border-orange-200/40 p-0.5">
      <div
        className="bg-gradient-to-r from-orange-400 to-amber-400 h-full transition-all duration-500 rounded-full"
        style={{ width: `${progress}%` }}
      />
    </div>
  </section>
);

// --- Screens ---

const LoginScreen = ({ onNext }) => {
  const { setProfile } = useAccessibility();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          throw new Error('Please enter your name to proceed.');
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName.trim() } }
        });

        if (signUpError) throw signUpError;

        if (!data?.user) {
          throw new Error('Registration completed, but session is not established yet.');
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileData) setProfile(profileData);

        setSuccessMsg("Account created! Let's choose your setup...");
        setTimeout(() => onNext(), 1200);
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) throw loginError;
        if (!data?.user) throw new Error('Failed to retrieve active user session.');

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileData) setProfile(profileData);

        setSuccessMsg('Successfully logged in! Opening classroom...');
        setTimeout(() => onNext(), 1200);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-[#fcf9f2] text-slate-800 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.06)_0%,transparent_70%)] pointer-events-none" />

      <GlassCard className="w-full max-w-[460px] p-8 md:p-10 flex flex-col gap-6 border-orange-200/60 bg-white shadow-xl shadow-orange-950/5">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 text-orange-500">
            <Zap className="size-9 fill-orange-500/10" />
            <h1 className="text-3xl font-black tracking-tight text-slate-900">AeroLearn</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">Ready to explore something new? ✨</p>
        </div>

        {errorMsg && (
          <div role="alert" className="p-3.5 rounded-xl border-2 border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div role="alert" className="p-3.5 rounded-xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold">
            ✓ {successMsg}
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name-input" className="text-xs font-extrabold text-slate-700 flex items-center gap-2">
                Your Name
              </label>
              <input
                id="name-input"
                type="text"
                required
                disabled={loading}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Write your name here"
                className="w-full bg-slate-50 border-2 border-orange-100 p-3 rounded-xl focus:outline-none focus:border-orange-400 text-sm text-slate-900 transition-all"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email-input" className="text-xs font-extrabold text-slate-700 flex items-center gap-2">
              Your Email Address ✉️
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                id="email-input"
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="w-full bg-slate-50 border-2 border-orange-100 p-3 pl-11 rounded-xl focus:outline-none focus:border-orange-400 text-sm text-slate-900 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="pass-input" className="text-xs font-extrabold text-slate-700 flex items-center gap-2">
              Your Password 🔑
            </label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                id="pass-input"
                type="password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border-2 border-orange-100 p-3 pl-11 rounded-xl focus:outline-none focus:border-orange-400 text-sm text-slate-900 transition-all"
              />
            </div>
          </div>

          <CyberButton type="submit" disabled={loading} className="w-full mt-3">
            {loading ? 'Entering Classroom... ✨' : isSignUp ? 'Create Account & Start' : 'Login & Open System'}
          </CyberButton>
        </form>

        <div className="flex items-center gap-4 py-1">
          <div className="flex-1 h-0.5 bg-slate-100" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Join Us</span>
          <div className="flex-1 h-0.5 bg-slate-100" />
        </div>

        <p className="text-center text-sm text-slate-600 font-medium">
          {isSignUp ? 'Already have an account?' : 'New to AeroLearn?'}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="text-orange-500 hover:text-orange-600 font-extrabold ml-1.5 underline underline-offset-2"
          >
            {isSignUp ? 'Login Here' : 'Sign Up Free'}
          </button>
        </p>
      </GlassCard>
    </div>
  );
};

const Registration0 = ({ onNext }) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-[#fcf9f2] text-slate-800">
    <div className="w-full max-w-[600px] flex flex-col gap-10">
      <ProgressIndicator phase="Step 1" label="Account Configuration" progress={25} />

      <GlassCard className="p-8 flex flex-col gap-6 bg-white border-orange-100 shadow-xl shadow-orange-950/4">
        <p className="text-slate-600 text-base leading-relaxed font-medium">
          Welcome on board! Your active profile has been built. Let's calibrate your screen layout interfaces to ensure parsing scientific and text documentation flows flawlessly.
        </p>

        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <CyberButton variant="ghost">Go Back</CyberButton>
          <CyberButton onClick={onNext} icon={ArrowRight}>Let's Set It Up</CyberButton>
        </div>
      </GlassCard>
    </div>
  </div>
);

const Registration1 = ({ onNext }) => (
  <div className="max-w-[800px] mx-auto py-16 px-4 flex flex-col gap-8 text-slate-800">
    <ProgressIndicator phase="Step 2" label="Choose Learning Language" progress={50} />
    <p className="text-lg text-slate-600 -mt-2 font-medium">Set up translation baselines to optimize structured document transformations.</p>

    <div className="flex flex-col gap-3">
      <label className="text-sm font-extrabold text-slate-700">Search for your dialect or sign format:</label>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search languages..."
          className="w-full bg-white border-2 border-orange-100 rounded-2xl p-3.5 pl-12 focus:outline-none focus:border-orange-400 text-slate-900 shadow-xs"
        />
      </div>
    </div>

    <div className="flex flex-col gap-4 mt-2">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h2 className="text-lg font-bold text-slate-800">Popular Context Paths:</h2>
        <span className="text-[10px] bg-orange-50 text-orange-700 border-2 border-orange-100 px-2.5 py-0.5 font-mono rounded-lg font-black uppercase">Required</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {['English (en)', 'Spanish (es)', 'French (fr)', 'German (de)', 'Japanese (ja)', 'Chinese (zh)'].map((lang, i) => (
          <button
            key={lang}
            className={cn(
              "p-4 text-left rounded-xl border-2 transition-all font-extrabold text-sm",
              i === 0
                ? "border-orange-400 bg-orange-50/50 text-orange-700"
                : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
            )}
          >
            {lang}
          </button>
        ))}
      </div>
    </div>

    <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-4">
      <p className="text-xs text-slate-400 font-medium">Linguistic settings control core data pipeline overrides automatically.</p>
      <CyberButton onClick={onNext} icon={ArrowRight}>Save Layout</CyberButton>
    </div>
  </div>
);

const Registration2 = ({ onNext, profile, togglePreference }) => {
  return (
    <div className="max-w-[640px] mx-auto py-16 px-4 flex flex-col gap-8 text-slate-800">
      <ProgressIndicator phase="Step 3" label="Adaptive Workspace Controls" progress={75} />
      <p className="text-slate-600 text-lg -mt-2 font-medium">Activate real-time interface transformations tailored to individual learning preferences.</p>

      <div className="flex flex-col gap-4">
        <GlassCard
          active={profile?.dyslexia_friendly}
          onClick={() => togglePreference('dyslexia_friendly', profile?.dyslexia_friendly)}
          className="p-5 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn("size-10 rounded-full flex items-center justify-center border-2", profile?.dyslexia_friendly ? "bg-orange-50 border-orange-300 text-orange-600" : "bg-slate-50 border-slate-100 text-slate-500")}>
                <Zap className="size-5" />
              </div>
              <div>
                <span className="text-base font-extrabold block text-slate-800">Dyslexia Layout Adjustments 📖</span>
                <span className="text-xs text-slate-500 mt-0.5 block">Alters character letter-spacing metrics to aid layout readability.</span>
              </div>
            </div>
            <div className={cn("w-10 h-5 rounded-full relative transition-colors", profile?.dyslexia_friendly ? "bg-orange-500" : "bg-slate-200")}>
              <div className={cn("absolute top-1 size-3 bg-white rounded-full transition-all", profile?.dyslexia_friendly ? "right-1" : "left-1")} />
            </div>
          </div>
        </GlassCard>

        <GlassCard
          active={profile?.high_contrast}
          onClick={() => togglePreference('high_contrast', profile?.high_contrast)}
          className="p-5 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn("size-10 rounded-full flex items-center justify-center border-2", profile?.high_contrast ? "bg-orange-50 border-orange-300 text-orange-600" : "bg-slate-50 border-slate-100 text-slate-500")}>
                <Accessibility className="size-5" />
              </div>
              <div>
                <span className="text-base font-extrabold block text-slate-800">High Contrast Contrast Override 🎨</span>
                <span className="text-xs text-slate-500 mt-0.5 block">Forces severe textual split parameters to limit parsing fatigue.</span>
              </div>
            </div>
            <div className={cn("w-10 h-5 rounded-full relative transition-colors", profile?.high_contrast ? "bg-orange-500" : "bg-slate-200")}>
              <div className={cn("absolute top-1 size-3 bg-white rounded-full transition-all", profile?.high_contrast ? "right-1" : "left-1")} />
            </div>
          </div>
        </GlassCard>

        <GlassCard
          active={profile?.sign_language_preference}
          onClick={() => togglePreference('sign_language_preference', profile?.sign_language_preference)}
          className="p-5 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn("size-10 rounded-full flex items-center justify-center border-2", profile?.sign_language_preference ? "bg-orange-50 border-orange-300 text-orange-600" : "bg-slate-50 border-slate-100 text-slate-500")}>
                <Globe className="size-5" />
              </div>
              <div>
                <span className="text-base font-extrabold block text-slate-800">Sign Helper Integrations 🤟</span>
                <span className="text-xs text-slate-500 mt-0.5 block">Mounts supplementary sign translation widgets adjacent to video media channels.</span>
              </div>
            </div>
            <div className={cn("w-10 h-5 rounded-full relative transition-colors", profile?.sign_language_preference ? "bg-orange-500" : "bg-slate-200")}>
              <div className={cn("absolute top-1 size-3 bg-white rounded-full transition-all", profile?.sign_language_preference ? "right-1" : "left-1")} />
            </div>
          </div>

          {profile?.sign_language_preference && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-slate-700 text-xs font-bold">Select Active Format:</p>
              <div className="flex gap-2">
                {['ASL (American)', 'BSL (British)', 'ISL (Irish)'].map((l, i) => (
                  <button
                    key={l}
                    className={cn("px-3 py-1.5 text-xs border rounded-lg font-bold", i === 0 ? "border-orange-300 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-600 bg-white")}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </GlassCard>
      </div>

      <CyberButton className="w-full mt-2" onClick={onNext}>
        Proceed to Control Deck
      </CyberButton>
    </div>
  );
};

const Registration3 = ({ onNext, onPrev, profile, togglePreference }) => (
  <div className="max-w-[800px] mx-auto py-16 px-4 flex flex-col gap-8 text-slate-800">
    <ProgressIndicator phase="Step 4" label="Device Framework Analytics" progress={100} />
    <p className="text-lg text-slate-600 -mt-2 font-medium">Calibrate telemetry endpoints to match operational processing parameters.</p>

    <form className="flex flex-col gap-8" onSubmit={(e) => { e.preventDefault(); onNext(); }}>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-extrabold text-slate-700">Hardware Profile Type:</label>
        <div className="relative">
          <select className="w-full bg-white border border-slate-200 text-slate-800 p-3.5 rounded-xl appearance-none focus:outline-none focus:border-orange-400 font-bold shadow-xs text-sm">
            <option>Computer or Laptop 💻</option>
            <option>Mobile Phone or Tablet 📱</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 size-4" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-extrabold text-slate-700">Bandwidth Profiler:</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard active className="p-5 cursor-pointer flex gap-4 border-orange-200 bg-orange-50/20">
            <div className="size-5 rounded-full border-2 border-orange-500 flex items-center justify-center"><div className="size-2.5 bg-orange-500 rounded-full" /></div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">Standard High-Speed Profile ⚡</h4>
              <p className="text-xs text-slate-600 mt-0.5">Executes multi-threaded streaming matrix assets seamlessly.</p>
            </div>
          </GlassCard>
          <GlassCard className="p-5 cursor-pointer flex gap-4">
            <div className="size-5 rounded-full border-2 border-slate-200" />
            <div>
              <h4 className="font-extrabold text-slate-700 text-sm">Eco-Saver Sync Mode 💾</h4>
              <p className="text-xs text-slate-500 mt-0.5">Truncates visual layout elements to minimize network transmission limits.</p>
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-extrabold text-slate-700">Contrast Boosting Adjustments:</label>
        <GlassCard className="p-5 flex items-center justify-between bg-white border-slate-200" onClick={() => togglePreference('high_contrast', profile?.high_contrast)}>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">Maximize Layout Backlight 🌟</h4>
            <p className="text-xs text-slate-500 mt-0.5">Expands text edge parameters to ensure effortless data visualization.</p>
          </div>
          <div className={cn("w-10 h-5 rounded-full relative transition-colors", profile?.high_contrast ? "bg-orange-500" : "bg-slate-200")}>
            <div className={cn("absolute top-1 size-3 bg-white rounded-full transition-all", profile?.high_contrast ? "right-1" : "left-1")} />
          </div>
        </GlassCard>
      </div>

      <div className="flex justify-between items-center mt-4 pt-6 border-t border-slate-200">
        <CyberButton variant="secondary" onClick={onPrev}>Back</CyberButton>
        <CyberButton type="submit">Launch Dashboard</CyberButton>
      </div>
    </form>
  </div>
);

const Dashboard = ({ onNavigate, profile }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-[#fcf9f2] text-slate-800 overflow-hidden">
      {/* Sidebar navigation deck component wrapper */}
      <aside className="w-[270px] bg-white border-r-2 border-orange-100/60 p-6 flex flex-col gap-8 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="size-9 bg-orange-50 rounded-xl border-2 border-orange-100 flex items-center justify-center shadow-xs">
            <Zap className="size-5 text-orange-500 fill-orange-500/10" />
          </div>
          <div>
            <h2 className="font-black text-slate-900 text-lg leading-tight">AeroLearn</h2>
            <p className="text-[10px] text-slate-400 font-mono font-bold tracking-wider uppercase">Adaptive Ingestion Suite</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {[
            { icon: LayoutDashboard, label: 'Control Deck', active: true },
            { icon: FileText, label: 'Document Lab', onClick: () => onNavigate('uploads') },
            { icon: PlayCircle, label: 'YouTube Ingest', onClick: () => onNavigate('media') },
            { icon: BookOpen, label: 'Speech Transcript', onClick: () => onNavigate('player') },
            { icon: Globe, label: 'Social Notes Hive', onClick: () => onNavigate('hive') },
            { icon: Settings, label: 'System Config', onClick: () => onNavigate('settings') }
          ].map(item => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={cn(
                "flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all font-extrabold text-sm text-left border-2 border-transparent",
                item.active
                  ? "bg-orange-500/10 text-orange-700 border-orange-200/50"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="size-4.5 text-slate-500" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-2 border-slate-200 hover:border-rose-200 text-xs font-bold uppercase rounded-xl transition-all shadow-xs"
          >
            Log Out Session
          </button>
        </div>
      </aside>

      {/* Main Panel Operations Hub */}
      <main className="flex-1 overflow-y-auto p-8 md:p-10 flex flex-col gap-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.03)_0%,transparent_70%)] pointer-events-none" />

        <header className="flex justify-between items-center relative z-10">
          <h1 className="text-2xl font-black flex items-center gap-3 text-slate-900">
            <Layers className="text-orange-500 size-6" />
            Classroom Operations Deck
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Find study modules..."
                className="w-full bg-white border-2 border-orange-100 rounded-xl p-1.5 pl-9 text-xs text-slate-800 focus:outline-none focus:border-orange-400 transition-all shadow-xs"
              />
            </div>
            <div className="size-9 bg-white rounded-full overflow-hidden border-2 border-orange-100 shadow-xs">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=AeroLearn" alt="Avatar" />
            </div>
          </div>
        </header>

        <section className="flex items-center gap-6 bg-white border-2 border-orange-100/70 p-6 rounded-2xl relative z-10 shadow-sm">
          <div className="size-20 rounded-full overflow-hidden border-4 border-orange-50/50 flex-shrink-0 shadow-xs">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=AeroLearn" alt="Profile" className="bg-slate-50" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Welcome back, Space Explorer! 💫</h2>
            <p className="text-slate-500 text-sm mt-0.5 font-medium">Inclusive Adaptive Processing System Stack Active</p>
          </div>
        </section>

        <section className="flex flex-col gap-3 relative z-10">
          <h3 className="font-black text-base text-slate-800 uppercase tracking-wider">Core Learning Spaces</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: 'Document Processing Lab',
                desc: 'Ingest handwritten engineering lecture scans, textbook chapters, or technical papers to run instant structural text simplification and key terms mapping.',
                icon: UploadCloud,
                onClick: () => onNavigate('uploads')
              },
              {
                label: 'YouTube Video Ingestion Lab',
                desc: 'Paste any recorded classroom lecture video link to segment raw audio profiles, map semantic timestamps, and compile clean scannable notes blocks.',
                icon: PlayCircle,
                onClick: () => onNavigate('media')
              },
              {
                label: 'Live Speech Transcription Hub',
                desc: 'Stream real-time microphone arrays directly into local processing units to capture lecture speech and render immediate accessible transcript text overlays.',
                icon: Accessibility,
                onClick: () => onNavigate('player')
              }
            ].map(item => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex flex-col p-6 rounded-2xl border-2 border-orange-100/80 bg-white text-left hover:border-orange-400 hover:shadow-md transition-all duration-300 group shadow-xs"
              >
                <div className="size-11 rounded-xl bg-orange-50 border-2 border-orange-100/50 flex items-center justify-center mb-4 group-hover:scale-105 transition-all">
                  <item.icon className="size-5 text-orange-500" />
                </div>
                <span className="font-black text-lg text-slate-900 block mb-1.5">{item.label}</span>
                <span className="text-xs text-slate-500 leading-relaxed block font-medium">{item.desc}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
          <div className="flex flex-col gap-3 lg:col-span-2">
            <h3 className="font-black text-base text-slate-800 uppercase tracking-wider">Active Synapse Pathways</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-5 bg-white border-2 border-orange-100/60 rounded-2xl shadow-xs">
              {[
                { id: 'mod-1', label: 'Document Lab 📄', destination: 'uploads' },
                { id: 'mod-2', label: 'Notes Vault 💾', destination: 'notes' },
                { id: 'mod-3', label: 'YouTube Ingest 🎥', destination: 'media' },
                { id: 'mod-4', label: 'Speech Space 🤟', destination: 'player' },
                { id: 'mod-5', label: 'System Config ⚙️', destination: 'settings' },
                { id: 'mod-6', label: 'Knowledge Hive 🌐', destination: 'hive' },
              ].map((node) => (
                <button
                  key={node.id}
                  onClick={() => onNavigate(node.destination)}
                  className="p-3.5 bg-slate-50 border-2 border-slate-100 hover:border-orange-300 hover:bg-white rounded-xl text-center font-mono text-xs font-bold text-slate-600 transition-all hover:scale-105"
                >
                  <div className="size-2 bg-orange-400 rounded-full mx-auto mb-2 animate-pulse" />
                  {node.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:col-span-2">
            <h3 className="font-black text-base text-slate-800 uppercase tracking-wider">System Feed Stream</h3>
            <div className="flex flex-col gap-5 border-l-2 border-orange-100/80 ml-2 pl-5 mt-1">
              {[
                { time: '10 Mins Ago', icon: Cpu, content: 'Module <span class="text-orange-600 font-extrabold">F = ma Momentum</span> structurally simplified and layout adapted.' },
                { time: '3 Hours Ago', icon: FileText, content: 'Document <span class="text-orange-600 font-extrabold">Inertial_Frames.pdf</span> synced using VLM OCR parser rules.' },
                { time: '1 Day Ago', icon: Settings, content: 'Typographical interface layouts saved across active session parameters.' }
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className={cn("absolute -left-[27px] top-1.5 size-2 rounded-full", i === 0 ? "bg-orange-500" : "bg-slate-300")} />
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-slate-400 mb-0.5 font-bold">
                    <item.icon className="size-3.5 text-slate-400" />
                    {item.time}
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: item.content }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const HiveScreen = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [activeFilters, setActiveFilters] = useState({
    'Dyslexia-Optimized': false,
    'Deaf-Friendly Captioning': true,
    'Mobility Grids': false,
    'Low-Sensory Tiers': false,
  });

  const initialSummaries = [
    { 
      title: 'Classical Inertial Frames Physics Pathways', 
      rating: '4.8', 
      tags: ['STEM', 'English'], 
      category: 'Dyslexia-Optimized',
      desc: 'Simplifications for linear transformations and vector sums.',
      translations: {
        English: { title: 'Classical Inertial Frames Physics Pathways', desc: 'Simplifications for linear transformations and vector sums.' },
        Spanish: { title: 'Rutas de Física de Marcos Inerciales Clásicos', desc: 'Simplificaciones para transformaciones lineales y sumas vectoriales.' },
        ASL: { title: '🤟 Classical Physics Frames (Visual Sign Map)', desc: '🤟 High-sign spatial breakdown for physics vector mappings.' }
      }
    },
    { 
      title: 'Quantum Computing Sensory Tiers', 
      rating: '4.5', 
      tags: ['Low-Sensory', 'Spanish'], 
      category: 'Low-Sensory Tiers',
      active: true, 
      desc: 'Step-by-step mathematical procedures containing no visual clutter.',
      translations: {
        English: { title: 'Quantum Computing Sensory Tiers', desc: 'Step-by-step mathematical procedures containing no visual clutter.' },
        Spanish: { title: 'Niveles Sensoriales de Computación Cuántica', desc: 'Procedimientos matemáticos paso a paso sin desorden visual.' },
        ASL: { title: '🤟 Quantum Computing Steps (Minimalist Signs)', desc: '🤟 Clear, un-cluttered visual sign representations for math tiers.' }
      }
    },
    { 
      title: 'Neural Systems Audio Maps', 
      rating: '4.9', 
      tags: ['Deaf-Friendly', 'English'], 
      category: 'Deaf-Friendly Captioning',
      desc: 'Interactive transcripts mapped directly to key visual frames.',
      translations: {
        English: { title: 'Neural Systems Audio Maps', desc: 'Interactive transcripts mapped directly to key visual frames.' },
        Spanish: { title: 'Mapas de Audio de Sistemas Neurales', desc: 'Transcripciones interactivas mapeadas directamente a fotogramas clave.' },
        ASL: { title: '🤟 Neural Systems Visual Transcripts', desc: '🤟 Sign-caption sequences linked directly to active stream timelines.' }
      }
    }
  ];

  const handleFilterToggle = (filterName) => {
    setActiveFilters(prev => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  const filteredSummaries = initialSummaries.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      note.desc.toLowerCase().includes(searchQuery.toLowerCase());

    const activeFilterKeys = Object.keys(activeFilters).filter(k => activeFilters[k]);
    const matchesFilter = activeFilterKeys.length === 0 || activeFilterKeys.includes(note.category);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-slate-800">
      <header className="border-b-2 border-orange-100/60 p-6 flex justify-between items-center bg-white shadow-xs">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer">
            <ArrowLeft className="size-6 text-slate-500 hover:text-orange-500 transition-colors" />
          </button>
          <h1 className="text-2xl font-black flex items-center gap-3 text-slate-900">
            <Zap className="text-orange-500" />
            Social Knowledge Hive
          </h1>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto p-8 md:p-10 grid grid-cols-12 gap-8 md:gap-10">
        <aside className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">Search Library</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-orange-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Keywords, headings..." 
                className="w-full bg-white border-2 border-orange-100 rounded-xl p-2 pl-9 text-sm text-slate-800 focus:outline-none focus:border-orange-400 shadow-xs" 
              />
            </div>
          </div>

          <div className="flex flex-col gap-5 p-5 rounded-2xl border-2 border-orange-100/60 bg-white shadow-xs">
            <h3 className="text-base font-black flex items-center gap-2 text-orange-600 uppercase tracking-wider">
              <Filter className="size-4" />
              Adaptive Toggles
            </h3>
            <div className="flex flex-col gap-3">
              {Object.keys(activeFilters).map((filterName) => (
                <label key={filterName} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={activeFilters[filterName]} 
                    onChange={() => handleFilterToggle(filterName)}
                    className="size-4 bg-white border-slate-300 text-orange-500 focus:ring-orange-500 rounded cursor-pointer" 
                  />
                  <span className={cn("text-sm transition-colors font-semibold", activeFilters[filterName] ? "text-orange-600" : "text-slate-500 group-hover:text-slate-900")}>
                    {filterName}
                  </span>
                </label>
              ))}
            </div>
            <div className="h-0.5 bg-slate-100 w-full" />
            
            <h3 className="text-base font-black flex items-center gap-2 text-orange-600 uppercase tracking-wider">
              <Globe className="size-4" />
              Linguistic Roots
            </h3>
            <div className="flex flex-wrap gap-2">
              {['English', 'Spanish', 'ASL'].map((lang) => (
                <button 
                  key={lang} 
                  type="button"
                  onClick={() => setSelectedLanguage(lang)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs border-2 font-extrabold transition-all", 
                    selectedLanguage === lang 
                      ? "border-orange-400 bg-orange-50 text-orange-700 shadow-xs" 
                      : "border-slate-100 text-slate-500 bg-white hover:border-slate-200 hover:text-slate-800"
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="col-span-12 lg:col-span-9 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <p className="text-slate-500 font-medium">
              Showing <span className="text-slate-900 font-extrabold">{filteredSummaries.length}</span> community notes
            </p>
            <button className="flex items-center gap-1 text-orange-600 font-bold text-sm">Sort: Recent <ChevronDown className="size-4" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSummaries.map((note, i) => {
              const currentText = note.translations[selectedLanguage] || note.translations['English'];

              return (
                <GlassCard key={i} className={cn("group cursor-pointer flex flex-col p-0 overflow-hidden bg-white border-2 border-orange-100/60 shadow-xs", note.active && "border-orange-400 bg-orange-50/10")}>
                  <div className="aspect-video bg-slate-100 relative overflow-hidden border-b-2 border-orange-100/40">
                    <img src={`https://picsum.photos/seed/${i + 22}/400/225`} alt="" className="w-full h-full object-cover opacity-95 group-hover:scale-101 transition-all duration-300" />
                    <div className="absolute top-2 right-2 bg-white px-2 py-0.5 text-[10px] font-black rounded border-2 border-orange-100 flex items-center gap-1 text-slate-700 shadow-xs">
                      <Star className="size-3 text-amber-500 fill-amber-500" /> {note.rating}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col gap-2.5 flex-1 bg-white">
                    <h4 className="font-black text-slate-900 group-hover:text-orange-600 transition-colors duration-200 leading-snug">{currentText.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2">{currentText.desc}</p>
                    <div className="flex gap-2 mt-auto pt-2 items-center">
                      {note.tags.map(t => <span key={t} className="text-[9px] uppercase font-mono border-l-2 border-orange-400 pl-2 text-slate-400 font-bold">{t}</span>)}
                      <span className="text-[10px] font-mono text-orange-700 bg-orange-50 border border-orange-100 px-1.5 rounded ml-auto font-bold">{note.category.split('-')[0]}</span>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
            {filteredSummaries.length === 0 && (
              <div className="col-span-12 text-center py-12 border-2 border-dashed border-orange-200 rounded-2xl text-slate-400 text-sm bg-white shadow-xs font-semibold">
                No classroom summaries matched your filtering rules. 🪐
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const UploadCockpit = ({ onBack }) => {
  const { profile } = useAccessibility();
  const [files] = useState([
    { name: 'Inertial_Frames_Draft.pdf', size: '2.4 MB', status: 'Synthesized', progress: 100 },
    { name: 'Classical_Mechanics_Formulas.docx', size: '1.8 MB', status: 'Ingesting', progress: 65 },
    { name: 'AeroLearn_Quantum_Study.txt', size: '45 KB', status: 'Queued', progress: 0 }
  ]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [documentNotes, setDocumentNotes] = useState('');
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState('');
  const [docSuccess, setDocSuccess] = useState(false);

  const handleDocumentUpload = async (fileToUpload) => {
    if (!fileToUpload) return;
    setUploadedFile(fileToUpload);
    setDocLoading(true);
    setDocError('');
    setDocSuccess(false);
    setDocumentNotes('');

    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('userId', profile?.id || 'explorer_child_123');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/process-document', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Failed with status: ${response.status}`);
      }
      const result = await response.json();
      if (result.status === 'success') {
        setDocSuccess(true);
        setDocumentNotes(result.data.adapted_markdown);
      } else {
        throw new Error(result.message || 'Verification failed');
      }
    } catch (err) {
      console.error(err);
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        setDocError('Connection refused: Could not connect to the AeroLearn Core Engine. Verify backend local logs on port 8000.');
      } else {
        setDocError(err.message || 'An error occurred during document ingestion processing');
      }
    } finally {
      setDocLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-slate-800 flex flex-col">
      <header className="border-b-2 border-orange-100/60 p-6 flex justify-between items-center bg-white shadow-xs">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer"><ArrowLeft className="size-6 text-slate-500 hover:text-orange-500 transition-colors" /></button>
          <h1 className="text-2xl font-black flex items-center gap-3 text-slate-900">
            <UploadCloud className="text-orange-500" />
            Document Processing Lab
          </h1>
        </div>
      </header>

      <div className="max-w-[1000px] mx-auto w-full p-8 md:p-10 flex flex-col gap-8 md:gap-10">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">Ingest Inbound Courseware</h2>
          <label htmlFor="file-selector" className="border-2 border-dashed border-orange-300 p-16 flex flex-col items-center justify-center gap-5 rounded-2xl bg-white hover:border-orange-400 transition-all cursor-pointer shadow-xs relative">
            <input
              type="file"
              id="file-selector"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleDocumentUpload(e.target.files[0]);
                }
              }}
            />
            <div className="size-16 rounded-full bg-orange-50 border-2 border-orange-100 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
              <UploadCloud className="size-8 text-orange-400" />
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-slate-800">Upload Text PDF or Scanned Resource Asset</p>
              <p className="text-slate-400 text-xs mt-0.5 font-medium">Select target file to apply automated simplified summary models</p>
            </div>
            <div className="py-2 px-5 rounded-xl bg-orange-50 text-orange-600 border-2 border-orange-100/60 text-xs font-bold uppercase transition-all shadow-xs">
              Browse Desktop Files
            </div>
          </label>
        </div>

        {docLoading && (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-orange-100 rounded-2xl bg-white shadow-xs">
            <div className="size-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-3" />
            <p className="text-orange-600 font-bold text-xs uppercase tracking-wide">Executing character layout translation algorithms... 🚀</p>
          </div>
        )}

        {docError && (
          <div className="p-4 border-2 border-rose-200 rounded-xl bg-rose-50 text-rose-700 font-bold text-sm shadow-xs">
            ⚠️ {docError}
          </div>
        )}

        {docSuccess && (
          <div className="p-6 border-2 border-orange-100 rounded-2xl bg-white shadow-md">
            <div className="flex items-center gap-2 text-slate-900 font-black text-lg mb-2">
              <CheckCircle2 className="size-5 text-emerald-500" />
              Document Simplification Complete! 🎉
            </div>
            <p className="text-xs text-slate-400 font-mono mb-4 font-bold">Processed item: <span className="text-slate-700">{uploadedFile?.name}</span></p>
            <div className="bg-slate-50 border-2 border-slate-100 rounded-xl p-6 text-slate-700 text-sm leading-relaxed prose shadow-inner font-medium">
              <ReactMarkdown>{documentNotes}</ReactMarkdown>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 flex flex-col gap-5">
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider flex justify-between items-center">
              Active Dashboard Files
              <span className="text-xs font-mono text-slate-400 font-bold">{files.length} BUNDLES</span>
            </h3>
            <div className="flex flex-col gap-4">
              {files.map((file, i) => (
                <GlassCard key={i} className="p-5 bg-white border-2 border-orange-100/60 shadow-xs">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3.5">
                      <div className="size-11 bg-slate-50 border-2 border-slate-100 rounded-xl flex items-center justify-center">
                        <FileText className={cn("size-5.5", file.progress === 100 ? "text-orange-500" : "text-slate-400")} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{file.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">{file.size} • {file.status.toUpperCase()}</p>
                      </div>
                    </div>
                    {file.progress === 100 ? (
                      <CheckCircle2 className="size-5 text-orange-500" />
                    ) : (
                      <div className="size-4.5 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                    )}
                  </div>
                  <div className="h-1.5 bg-slate-100 w-full rounded-full overflow-hidden p-0.5 border border-slate-200/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${file.progress}%` }}
                      className="h-full bg-orange-400 rounded-full transition-all"
                    />
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="flex flex-col gap-5 p-5 rounded-2xl border-2 border-orange-100/60 bg-white shadow-sm">
              <h3 className="font-black text-orange-600 text-sm uppercase tracking-wider flex items-center gap-2">
                <Settings className="size-4" />
                Pipeline Strategy
              </h3>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Target Output</span>
                  <select className="bg-slate-50 border-2 border-slate-100 rounded-lg p-2 text-xs text-slate-800 font-bold focus:outline-none">
                    <option>Auto-Detect Dialect</option>
                    <option>English (Simplified)</option>
                    <option>Spanish Translation</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Network Privacy Tiers</span>
                  <div className="flex gap-2">
                    <button className="flex-1 py-1.5 text-[10px] font-black border-2 border-orange-300 bg-orange-50 text-orange-700 rounded-lg uppercase">LOCAL</button>
                    <button className="flex-1 py-1.5 text-[10px] font-black border-2 border-slate-100 text-slate-400 bg-white hover:text-slate-700 rounded-lg uppercase">SHARED</button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-slate-600 pt-1 border-t border-slate-50">
                  <span>OCR Ingestion Fallback</span>
                  <div className="w-10 h-5 bg-orange-500 rounded-full relative"><div className="absolute right-1 top-1 size-3 bg-white rounded-full" /></div>
                </div>
              </div>

              <CyberButton className="w-full">Re-Compile Layout</CyberButton>
            </div>

            <div className="p-5 rounded-2xl border-2 border-orange-100 bg-orange-50/20 flex flex-col gap-2 shadow-xs">
              <div className="flex items-center gap-2 text-orange-600">
                <Info className="size-4.5" />
                <span className="font-black text-xs uppercase tracking-wide">Workspace Analytics</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono leading-relaxed font-bold">PROCESSING ENDPOINTS RESPONDING OPERATIONAL STATE. CORE STACK METRICS NORMAL.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const PlayerScreen = ({ onBack }) => (
  <div className="h-screen bg-[#fcf9f2] text-slate-800 flex flex-col">
    <header className="border-b-2 border-orange-100/60 p-4 flex justify-between items-center bg-white shadow-xs">
      <div className="flex items-center gap-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer"><ArrowLeft className="size-6 text-slate-500 hover:text-orange-500 transition-colors" /></button>
        <h1 className="text-xl font-black flex items-center gap-3 text-slate-900">
          <BookOpen className="text-orange-500 size-5" />
          Live Speech Transcription Space
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><Settings className="size-5" /></button>
        <button className="p-2 border-2 border-orange-200 rounded-xl text-orange-600 bg-orange-50 shadow-xs"><Accessibility className="size-5" /></button>
      </div>
    </header>

    <div className="flex-1 flex overflow-hidden p-6 gap-6">
      <div className="w-[440px] flex flex-col gap-4">
        <div className="flex-1 rounded-2xl border-2 border-orange-100/60 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="flex-1 bg-slate-50 relative">
            <img src="https://images.unsplash.com/photo-1614728263952-84ea206f99b6?w=600&auto=format&fit=crop" alt="ASL Signer" className="w-full h-full object-cover opacity-95" />
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase border-2 border-orange-100 text-slate-700 shadow-sm">
              <div className="size-2 bg-rose-500 rounded-full animate-pulse" /> Live Sign Interpreter Mounted
            </div>
          </div>
          <div className="h-16 bg-slate-50 flex items-center justify-between px-4 border-t-2 border-orange-100/40">
            <div className="flex gap-2">
              <button className="size-9 border-2 border-slate-200 bg-white flex items-center justify-center hover:bg-slate-100 rounded-xl transition-all shadow-xs"><RotateCcw className="size-4.5 text-slate-500" /></button>
              <button className="size-9 flex items-center justify-center bg-orange-500 text-white rounded-xl shadow-xs hover:bg-orange-600 border-b-2 border-orange-700 active:border-b-0 transition-all"><PauseCircle className="size-4.5" /></button>
              <button className="size-9 border-2 border-slate-200 bg-white flex items-center justify-center hover:bg-slate-100 rounded-xl transition-all shadow-xs"><PlayCircle className="size-4.5 text-slate-500" /></button>
            </div>
            <button className="text-xs font-mono border-2 border-slate-200 px-3 py-1 rounded-lg text-slate-500 bg-white font-bold shadow-xs">Playback: 1.0x</button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col rounded-2xl border-2 border-orange-100/60 bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-black flex items-center gap-2.5 text-slate-900"><div className="w-1.5 h-5 bg-orange-400 rounded" /> Section 3: Classical Field Vector Ratios</h2>
          <span className="text-xs font-mono border-2 border-slate-200 px-2 py-0.5 rounded text-slate-500 bg-white font-bold">English (en)</span>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-6 leading-relaxed text-slate-700 font-medium">
          <p className="text-lg text-slate-600">Welcome to the Live Speech Space. Today, we are reviewing classical mechanical systems and Newtonian vector spaces.</p>
          <div className="text-xl text-slate-900 relative pl-4 border-l-4 border-orange-300">
            In classical Newtonian mechanics, force is directly proportional to mass times acceleration:{" "}
            <span className="bg-orange-50 text-orange-700 font-black px-1.5 py-0.5 rounded border border-orange-200">
              {"$\\sum F = ma$"}
            </span>
            . However, when the mass vector changes, the change in momentum over time is expressed as{" "}
            <span className="text-orange-600 border-b-2 border-dashed border-orange-400/60 pb-0.5 cursor-help font-extrabold">
              {"$F = \\frac{dp}{dt} = m \\frac{dv}{dt}$"}
            </span>
            .
          </div>
          <p className="text-lg text-slate-600">This differential form simplifies coordinate transformations across diverse inertial frames.</p>
        </div>
      </div>
    </div>
  </div>
);

const MediaIntegration = ({ onBack }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoNotes, setVideoNotes] = useState('');
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState('');

  const handleYoutubeSubmit = async (e) => {
    e.preventDefault();
    if (!videoUrl) return;
    setVideoLoading(true);
    setVideoError('');
    setVideoNotes('');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/process-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_url: videoUrl }),
      });
      if (!response.ok) throw new Error(`Failed with status: ${response.status}`);
      const result = await response.json();
      if (result.status === 'success') {
        setVideoNotes(result.data.adapted_markdown);
      } else {
        throw new Error(result.message || 'Verification failed');
      }
    } catch (err) {
      console.error(err);
      setVideoError(err.message || 'An error occurred during video processing');
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-white">
      <header className="h-[72px] border-b-2 border-orange-100/60 flex items-center px-8 md:px-10 gap-6 bg-white sticky top-0 z-50 shadow-xs">
        <button onClick={onBack} className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer"><ArrowLeft className="size-6 hover:text-orange-500 transition-colors" /></button>
        <h1 className="text-xl font-black flex items-center gap-3 text-slate-900">
          <PlayCircle className="text-orange-500" />
          YouTube Video Ingestion Lab
        </h1>
      </header>

      <main className="max-w-[800px] mx-auto py-12 px-4 flex flex-col gap-12">
        <div className="text-center flex flex-col gap-4">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">YouTube Audio Chapter Segmentation Hub</h2>
          <p className="text-slate-600 text-base leading-relaxed font-medium">Extract high-sign chapter segments, subtitle alignments, and textual synopsis files client-side instantly from classroom lecture feeds.</p>

          <form onSubmit={handleYoutubeSubmit} className="flex flex-col items-start gap-1.5 mt-4 relative w-full text-left">
            <label htmlFor="url-input" className="font-mono text-xs text-orange-500 uppercase ml-1 font-bold">Input Streaming URL</label>
            <div className="relative w-full flex items-center">
              <Search className="absolute left-4 size-5 text-slate-400" />
              <input
                id="url-input"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full h-12 pl-12 pr-32 bg-white border-2 border-orange-100 rounded-xl focus:outline-none focus:border-orange-400 text-slate-900 text-sm shadow-xs transition-all font-medium"
              />
              <button
                type="submit"
                disabled={videoLoading}
                className="absolute right-2 h-9 px-4 bg-orange-500 text-white font-bold rounded-lg flex items-center gap-1.5 hover:bg-orange-600 border-b-2 border-orange-700 active:border-b-0 text-xs uppercase disabled:opacity-50 transition-all shadow-xs"
              >
                {videoLoading ? 'Parsing...' : 'Process'} <Zap className="size-3.5" />
              </button>
            </div>
          </form>

          {videoLoading && (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-orange-100 rounded-2xl bg-white mt-6 shadow-xs">
              <div className="size-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-3" />
              <p className="text-orange-600 font-bold text-xs uppercase tracking-wide">Compiling semantic media chapters... 🚀</p>
            </div>
          )}

          {videoError && (
            <div className="p-4 border-2 border-rose-200 rounded-xl bg-rose-50 text-rose-700 text-sm font-bold mt-6 text-left shadow-xs">
              ⚠️ {videoError}
            </div>
          )}

          {videoNotes && (
            <GlassCard className="p-8 flex flex-col gap-6 mt-6 border-2 border-orange-100 bg-white text-left shadow-md">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <Zap className="text-orange-500 size-6" />
                <h3 className="text-xl font-black text-slate-900">Structured Lecture Analysis 📖✨</h3>
              </div>
              <div className="text-slate-700 mt-2 prose max-w-none font-medium">
                <ReactMarkdown>{videoNotes}</ReactMarkdown>
              </div>
            </GlassCard>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <GlassCard className="p-6 flex flex-col gap-4 bg-white border-2 border-orange-100/60 shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <Radar className="text-orange-500 size-6" />
              <h3 className="text-lg font-black text-slate-900">Extracted Domain Tags</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {['Classical Mechanics', 'Newtonian Vectors', 'Differential Momentum', 'Inertial Coordinate Frames', 'Academic Ingestion'].map((topic, i) => (
                <div key={topic} className={cn("px-3.5 py-1.5 border-l-4 font-mono text-xs bg-slate-50 border-slate-200 rounded-r-lg font-bold shadow-xs", i < 2 ? "border-orange-500 text-slate-800" : i === 2 ? "border-indigo-400 text-indigo-700" : "border-slate-400 text-slate-500")}>
                  {topic}
                </div>
              ))}
            </div>
          </GlassCard>

          <section className="rounded-2xl border-2 border-orange-100/60 bg-white p-6 md:p-8 flex flex-col gap-5 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <LayoutDashboard className="text-orange-500 size-6" />
              <h3 className="text-lg font-black text-slate-900">Lesson Timeline Steps</h3>
            </div>
            <div className="flex flex-col gap-6 border-l-2 border-orange-100 ml-3 pl-5 relative">
              {[
                { time: '00:00', title: 'Vector Momentum Framework', desc: 'Analyzing basic spatial calculations inside simple coordinate equations.' },
                { time: '12:45', title: 'Differential Derivatives Breakdown', desc: 'Processing mathematical rates over localized constraints.' },
                { time: '28:30', title: 'Coordinate System Adjustments', desc: 'Integrating algorithmic transformations to simplify interface physics targets.' }
              ].map((chapter, i) => (
                <div key={i} className="relative">
                  <div className={cn("absolute -left-[28px] top-1 size-2.5 rounded-full", i === 0 ? "bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]" : "bg-slate-300")} />
                  <div className="flex items-center gap-4">
                    <span className={cn("font-mono text-xs min-w-[50px] font-bold", i === 0 ? "text-orange-600" : "text-slate-400")}>{chapter.time}</span>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{chapter.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">{chapter.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border-2 border-orange-100/60 bg-white p-6 md:p-8 flex flex-col gap-5 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <PlayCircle className="text-orange-500 size-6" />
              <h3 className="text-lg font-black text-slate-900">Synchronized Video Keyframes</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="aspect-video relative overflow-hidden bg-slate-50 border-2 border-slate-100 rounded-xl shadow-xs">
                    <img src={`https://picsum.photos/seed/${i + 50}/400/225`} alt="" className="w-full h-full object-cover opacity-95 hover:scale-101 transition-all" />
                    <div className="absolute bottom-1.5 right-1.5 bg-white px-2 py-0.5 text-[9px] font-mono text-orange-600 border border-slate-100 font-bold shadow-xs rounded">0{i}:12</div>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">Visual summary mark {i}. Category: Momentum Sums.</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const NotesScreen = ({ onBack }) => (
  <div className="min-h-screen bg-[#fcf9f2] text-slate-800">
    <header className="h-[72px] border-b-2 border-orange-100/60 flex items-center px-8 md:px-10 gap-6 bg-white sticky top-0 z-50 shadow-xs">
      <button onClick={onBack} className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer"><ArrowLeft className="size-6 hover:text-orange-500 transition-colors" /></button>
      <h1 className="text-xl font-bold text-slate-900">Academic Synapse Notes</h1>
    </header>

    <main className="max-w-[1000px] mx-auto py-12 px-4 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black flex items-center gap-2.5 text-slate-900"><div className="w-1.5 h-6 bg-orange-400 rounded" /> Cached Summaries Registry</h2>
        <CyberButton icon={Zap}>Process New</CyberButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: 'Newtonian Forces & Inertia', date: 'Synced 2h ago', category: 'Physics', content: 'Evaluation of force equations inside dynamic coordinate systems...' },
          { title: 'Causal Cosegmentation Model Logs', date: 'Synced 1d ago', category: 'Linguistics', content: 'Applying translation safeguards to preserve scientific statements...' },
          { title: 'LaTeX Formula Rendering Rules', date: 'Synced 3d ago', category: 'Math', content: 'Formatting complex fractions using proper mathematical markup...' },
          { title: 'Cognitive Accommodations Profiles', date: 'Synced 1w ago', category: 'Accessibility', content: 'Toggling open-dyslexic spacing layouts to enhance reading flow...' }
        ].map((note, i) => (
          <GlassCard key={i} className="p-5 bg-white border-2 border-orange-100/60 shadow-xs border-l-4 border-l-orange-400">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] font-black font-mono text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-100/60 uppercase tracking-wide">{note.category}</span>
              <span className="text-[10px] font-mono text-slate-400 font-bold">{note.date}</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1 hover:text-orange-600 transition-colors leading-tight">{note.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-medium">{note.content}</p>
            <div className="mt-4 flex justify-between items-center text-[10px] font-bold pt-2 border-t border-slate-50 text-slate-400">
              <span>EST. 4 MIN READ</span>
              <div className="flex items-center gap-1.5">
                <div className="size-2 bg-emerald-500 rounded-full" />
                <span className="text-emerald-600 font-mono">LOCAL BACKUP READY</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </main>
  </div>
);

const SettingsScreen = ({ onBack, profile, togglePreference }) => (
  <div className="min-h-screen bg-[#fcf9f2] text-slate-800">
    <header className="h-[72px] border-b-2 border-orange-100/60 flex items-center px-8 md:px-10 gap-6 bg-white sticky top-0 z-50 shadow-xs">
      <button onClick={onBack} className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer"><ArrowLeft className="size-6 hover:text-orange-500 transition-colors" /></button>
      <h1 className="text-xl font-bold text-slate-900">System Configurations</h1>
    </header>

    <main className="max-w-[800px] mx-auto py-12 px-4 flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-black border-b border-slate-100 pb-2 text-slate-900">Theme & Typography Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard active={profile?.high_contrast} onClick={() => togglePreference('high_contrast', profile?.high_contrast)} className="p-5 flex flex-col gap-3 cursor-pointer bg-white border-2 border-orange-100/60 shadow-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-slate-800 text-sm">High Contrast Boost</h3>
              {profile?.high_contrast && <CheckCircle2 className="text-orange-500 size-5" />}
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">Adjusts system background layers to sharp black-and-slate lines to prevent text-bleeding effects.</p>
          </GlassCard>

          <GlassCard active={profile?.dyslexia_friendly} onClick={() => togglePreference('dyslexia_friendly', profile?.dyslexia_friendly)} className="p-5 flex flex-col gap-3 cursor-pointer bg-white border-2 border-orange-100/60 shadow-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-slate-800 text-sm">Dyslexia-Friendly Layout</h3>
              {profile?.dyslexia_friendly && <CheckCircle2 className="text-orange-500 size-5" />}
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">Injects character spatial adjustments across reading boxes to guarantee frictionless cognitive visual focus tracking.</p>
          </GlassCard>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-black border-b border-slate-100 pb-2 text-slate-900">Linguistic Framework Toggles</h2>
        <div className="flex flex-col gap-3">
          {[
            { key: 'dyslexia_friendly', label: 'Dyslexia-Friendly Layout Configurations', desc: ' Locks text tracking variables to heightened compliance spaces locally.' },
            { key: 'high_contrast', label: 'Maximum Contrast Backlight Override', desc: 'Forces sharp high-visibility layouts for visibility comfort triggers.' },
            { key: 'sign_language_preference', label: 'Mount Video Sign Language Avatar Helper', desc: 'Automatically overlays supplementary sign interpreter widgets adjacent to media pipelines.' }
          ].map((s) => (
            <div
              key={s.key}
              onClick={() => togglePreference(s.key, profile?.[s.key])}
              className="flex items-center justify-between p-5 rounded-xl border-2 border-orange-100/60 bg-white cursor-pointer hover:border-orange-300 transition-all shadow-xs"
            >
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{s.label}</h4>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">{s.desc}</p>
              </div>
              <div className={cn("w-11 h-5.5 rounded-full relative transition-colors p-0.5", profile?.[s.key] ? "bg-orange-500" : "bg-slate-200")}>
                <div className={cn("size-4.5 bg-white rounded-full transition-all shadow-xs", profile?.[s.key] ? "ml-5" : "ml-0")} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-slate-200">
        <CyberButton variant="secondary" onClick={onBack}>Confirm Classroom Profile Settings</CyberButton>
      </div>
    </main>
  </div>
);

export default function App() {
  const [screen, setScreen] = useState('login');
  const { profile, setProfile } = useAccessibility();

  const togglePreference = async (key, currentValue) => {
    const newValue = !currentValue;

    setProfile(prev => ({
      ...prev,
      [key]: newValue
    }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            [key]: newValue,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) throw error;
        console.log(`[Supabase Schema Persistence] Sync completed for preference key '${key}':`, newValue);
      }
    } catch (err) {
      console.error(`[Supabase SCHEMA ERR] Failure to commit property update for target '${key}':`, err);
    }
  };

  useEffect(() => {
    async function checkActiveSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setScreen('dashboard');
      }
    }
    checkActiveSession();
  }, []);

  return (
    <div className="min-h-screen bg-[#fcf9f2]">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {screen === 'login' && <LoginScreen onNext={() => setScreen('reg0')} />}
          {screen === 'reg0' && <Registration0 onNext={() => setScreen('reg1')} />}
          {screen === 'reg1' && <Registration1 onNext={() => setScreen('reg2')} />}
          {screen === 'reg2' && <Registration2 onNext={() => setScreen('reg3')} profile={profile} togglePreference={togglePreference} />}
          {screen === 'reg3' && <Registration3 onNext={() => setScreen('dashboard')} onPrev={() => setScreen('reg2')} profile={profile} togglePreference={togglePreference} />}
          {screen === 'dashboard' && <Dashboard onNavigate={(s) => setScreen(s)} profile={profile} />}
          {screen === 'hive' && <HiveScreen onBack={() => setScreen('dashboard')} />}
          {screen === 'uploads' && <UploadCockpit onBack={() => setScreen('dashboard')} />}
          {screen === 'player' && <PlayerScreen onBack={() => setScreen('dashboard')} />}
          {screen === 'media' && <MediaIntegration onBack={() => setScreen('dashboard')} />}
          {screen === 'notes' && <NotesScreen onBack={() => setScreen('dashboard')} />}
          {screen === 'settings' && <SettingsScreen onBack={() => setScreen('dashboard')} profile={profile} togglePreference={togglePreference} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}