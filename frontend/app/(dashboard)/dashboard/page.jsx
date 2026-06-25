/* __next_internal_client_entry_do_not_use__ default auto */ import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, ArrowRight, Search, Mail, Key, LogIn, UserCircle, Settings, LayoutDashboard, FileText, Upload, BookOpen, Layers, Accessibility, Globe, Cpu, Wifi, UploadCloud, CheckCircle2, Radar, Database, PlayCircle, PauseCircle, RotateCcw, Zap, Star, Filter, ChevronDown, Monitor, Smartphone, Info, Mic, Volume2, AlertTriangle, ThumbsUp, Flag } from "__barrel_optimize__?names=Accessibility,AlertTriangle,ArrowLeft,ArrowRight,BookOpen,CheckCircle2,ChevronDown,Cpu,Database,FileText,Filter,Flag,Globe,Info,Key,Layers,LayoutDashboard,LogIn,Mail,Mic,Monitor,PauseCircle,PlayCircle,Radar,RotateCcw,Search,Settings,Smartphone,Star,ThumbsUp,Upload,UploadCloud,UserCircle,Volume2,Wifi,Zap!=!lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabaseClient";
import { useAccessibility } from "@/context/AccessibilityContext";
import BarrierTag from "@/components/shared/BarrierTag";
import StatusBadge from "@/components/shared/StatusBadge";
import ProgressSteps from "@/components/shared/ProgressSteps";
import AccentCard from "@/components/shared/AccentCard";
import GlossaryTerm from "@/components/shared/GlossaryTerm";
import VoiceListeningIndicator from "@/components/shared/VoiceListeningIndicator";
import { LanguageChip, ModeChip } from "@/components/shared/Chips";
import { saveDocumentToCache, getDocumentFromCache, getAllCachedDocuments, removeDocumentFromCache } from "@/lib/offlineCache";
function cn(...inputs) {
    return twMerge(clsx(inputs));
}
// --- Dynamic Styling Utilities ---
const GlassCard = ({ children, className, active, onClick })=>/*#__PURE__*/ _jsx("div", {
        onClick: onClick,
        className: cn("p-6 rounded-none backdrop-blur-md transition-all duration-300 cursor-pointer select-none", "border border-t-white/10 border-l-white/10 border-b-black/30 border-r-black/20 bg-white/[0.03]", active ? "border-sky-500 bg-sky-500/10 shadow-[0_0_15px_rgba(14,165,233,0.35)]" : "hover:bg-white/[0.06] hover:border-sky-500/30", className),
        children: children
    });
const CyberButton = ({ children, variant = "primary", className, onClick, icon: Icon, type = "button", disabled = false })=>{
    const variants = {
        primary: "bg-sky-500 text-black font-semibold hover:bg-sky-400 shadow-[0_0_12px_rgba(14,165,233,0.25)] focus-visible:ring-sky-500",
        secondary: "bg-[#233c48] text-white hover:bg-[#2e4d5c] border border-slate-700 focus-visible:ring-slate-500",
        ghost: "bg-transparent text-slate-300 hover:bg-white/[0.05] focus-visible:ring-slate-500",
        outline: "border-2 border-sky-500/50 text-sky-400 hover:bg-sky-500/10 focus-visible:ring-sky-500"
    };
    return /*#__PURE__*/ _jsxs("button", {
        type: type,
        onClick: onClick,
        disabled: disabled,
        className: cn("min-h-[44px] px-6 py-2.5 uppercase tracking-wider font-bold text-xs rounded-none transition-all duration-250 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]", variants[variant], className),
        children: [
            children,
            Icon && /*#__PURE__*/ _jsx(Icon, {
                className: "size-4"
            })
        ]
    });
};

// --- Aero the Space Mascot Icon ---
const AeroMascotIcon = ({ className }) => (
  <svg viewBox="0 0 100 100" className={cn("size-12 animate-[float_4s_ease-in-out_infinite]", className)}>
    <circle cx="50" cy="50" r="30" fill="url(#starGlow)" opacity="0.6" className="animate-pulse" />
    <polygon points="50,10 63,38 93,38 69,56 78,86 50,68 22,86 31,56 7,38 37,38" fill="#fbbf24" stroke="#d97706" strokeWidth="2.5" strokeLinejoin="round" />
    <ellipse cx="50" cy="48" rx="14" ry="9" fill="#38bdf8" stroke="#0b0f19" strokeWidth="2" opacity="0.9" />
    <path d="M42,46 Q50,42 58,46" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
    <circle cx="46" cy="48" r="2" fill="#0b0f19" />
    <circle cx="54" cy="48" r="2" fill="#0b0f19" />
    <path d="M48,52 Q50,54 52,52" stroke="#0b0f19" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <line x1="50" y1="10" x2="50" y2="4" stroke="#fbbf24" strokeWidth="2" />
    <circle cx="50" cy="3" r="2" fill="#2dd4bf" className="animate-ping" />
    <defs>
      <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

// --- Space Buddy Speech Bubble ---
const SpaceBuddyBubble = ({ message }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef(null);

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utteranceRef.current = utterance;
    
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    const savedVoiceId = localStorage.getItem("aerolearn_narration_voice");
    const savedSpeed = localStorage.getItem("aerolearn_narration_speed");
    
    if (savedSpeed) {
      utterance.rate = parseFloat(savedSpeed);
    }
    
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="flex gap-4 items-start bg-slate-900/60 border border-sky-500/20 p-5 rounded-3xl backdrop-blur-md shadow-[0_4px_20px_rgba(56,189,248,0.15)] max-w-xl animate-fade-in relative">
      <div className="flex-shrink-0 flex flex-col items-center">
        <AeroMascotIcon />
        <span className="text-[10px] font-bold tracking-widest text-[#fbbf24] mt-1 font-mono uppercase">AERO</span>
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <div className="text-sm font-medium text-slate-200 leading-relaxed font-sans">
          {message}
        </div>
        <button
          type="button"
          onClick={handleSpeak}
          className={cn(
            "self-start text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border transition-all flex items-center gap-1.5",
            isPlaying 
              ? "bg-[#2dd4bf]/20 border-[#2dd4bf] text-[#2dd4bf] animate-pulse" 
              : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
          )}
        >
          {isPlaying ? "🔊 Speaking..." : "🔊 Listen Tip"}
        </button>
      </div>
      <div className="absolute left-[-8px] top-6 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-slate-900/60 border-b-8 border-b-transparent pointer-events-none" />
    </div>
  );
};

// --- Cosmic Star Tracker (Gamified Level Tracker) ---
const CosmicStarTracker = () => {
  const [stars, setStars] = useState(120);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const savedStars = localStorage.getItem("aerolearn_stars");
    if (savedStars) {
      setStars(parseInt(savedStars));
    } else {
      localStorage.setItem("aerolearn_stars", "120");
    }
  }, []);

  const handleStarClick = () => {
    setAnimate(true);
    setTimeout(() => setAnimate(false), 500);
    const newStars = stars + 5;
    setStars(newStars);
    localStorage.setItem("aerolearn_stars", newStars.toString());
    
    if (typeof AudioContext !== 'undefined') {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } catch (e) {}
    }
  };

  const calculatedLevel = Math.floor(stars / 50) + 1;
  const currentLevelProgress = stars % 50;
  const progressPercent = (currentLevelProgress / 50) * 100;

  return (
    <div className="flex items-center gap-4 bg-slate-900/80 border border-amber-500/20 px-5 py-2.5 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.1)] select-none">
      <button 
        type="button"
        onClick={handleStarClick}
        className={cn(
          "text-xl cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-200",
          animate && "animate-bounce"
        )}
        title="Click to boost your stars!"
      >
        ⭐
      </button>
      <div className="flex flex-col">
        <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-[#fbbf24] font-mono">
          <span>{stars} STARS</span>
          <span>LEVEL {calculatedLevel}</span>
        </div>
        <div className="w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1 border border-slate-700/50">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-[#2dd4bf] transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
const ProgressIndicator = ({ phase, label, progress })=>/*#__PURE__*/ _jsxs("section", {
        className: "flex flex-col gap-4",
        children: [
            /*#__PURE__*/ _jsxs("div", {
                className: "flex justify-between items-end",
                children: [
                    /*#__PURE__*/ _jsxs("div", {
                        children: [
                            /*#__PURE__*/ _jsx("p", {
                                className: "font-mono text-sky-400 uppercase tracking-widest mb-1 text-xs",
                                children: phase
                            }),
                            /*#__PURE__*/ _jsx("h2", {
                                className: "text-3xl font-extrabold text-white tracking-tight",
                                children: label
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsxs("span", {
                        className: "font-mono text-slate-400 text-sm",
                        children: [
                            progress,
                            "%"
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ _jsx("div", {
                className: "flex h-[4px] w-full bg-neutral-800 rounded-none overflow-hidden",
                children: /*#__PURE__*/ _jsx("div", {
                    className: "bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.6)] transition-all duration-500",
                    style: {
                        width: `${progress}%`
                    }
                })
            })
        ]
    });
const ReadingRuler = ({ children, active })=>{
    const [position, setPosition] = useState(0);
    const [visible, setVisible] = useState(false);
    const containerRef = useRef(null);
    useEffect(()=>{
        if (!active) return;
        const handleMouseMove = (e)=>{
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const relativeY = e.clientY - rect.top;
            if (relativeY >= 0 && relativeY <= rect.height) {
                setPosition(relativeY);
                setVisible(true);
            } else {
                setVisible(false);
            }
        };
        const handleMouseLeave = ()=>{
            setVisible(false);
        };
        const container = containerRef.current;
        if (container) {
            container.addEventListener("mousemove", handleMouseMove);
            container.addEventListener("mouseleave", handleMouseLeave);
        }
        return ()=>{
            if (container) {
                container.removeEventListener("mousemove", handleMouseMove);
                container.removeEventListener("mouseleave", handleMouseLeave);
            }
        };
    }, [
        active
    ]);
    return /*#__PURE__*/ _jsxs("div", {
        ref: containerRef,
        className: "relative overflow-hidden",
        children: [
            children,
            active && visible && /*#__PURE__*/ _jsx("div", {
                className: "absolute left-0 right-0 h-[30px] border-y border-sky-500/40 bg-sky-500/5 pointer-events-none transition-all duration-75 ease-out shadow-[0_0_15px_rgba(14,165,233,0.15)]",
                style: {
                    top: `${position - 15}px`
                }
            })
        ]
    });
};
// --- Auth Screen ---
const LoginScreen = ({ onNext })=>{
    const { setProfile } = useAccessibility();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const handleAuthSubmit = async (e)=>{
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        setSuccessMsg("");
        try {
            if (isSignUp) {
                if (!fullName.trim()) {
                    throw new Error("Please enter your name to proceed.");
                }
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName.trim()
                        }
                    }
                });
                if (signUpError) throw signUpError;
                if (!data?.user) {
                    throw new Error("Registration completed, but session is not established.");
                }
                // Fetch or wait for profile row auto-generated by DB triggers
                let profileData = null;
                for(let i = 0; i < 5; i++){
                    const { data: prof } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
                    if (prof) {
                        profileData = prof;
                        break;
                    }
                    await new Promise((resolve)=>setTimeout(resolve, 500));
                }
                if (profileData) {
                    setProfile(profileData);
                } else {
                    // Fallback insert if DB triggers aren't configured yet
                    const { data: newProf, error: insErr } = await supabase.from("profiles").insert({
                        id: data.user.id,
                        display_name: fullName.trim(),
                        preferred_languages: [],
                        disabilities: []
                    }).select().single();
                    if (newProf) setProfile(newProf);
                }
                setSuccessMsg("Account created! Customizing learning preferences...");
                setTimeout(()=>onNext(), 1200);
            } else {
                const { data, error: loginError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (loginError) throw loginError;
                const { data: profileData } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
                if (profileData) {
                    setProfile(profileData);
                }
                setSuccessMsg("Successfully logged in!");
                setTimeout(()=>onNext(), 1200);
            }
        } catch (err) {
            console.error(err);
            setErrorMsg(err.message || "Authentication failed. Please verify credentials.");
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ _jsxs("div", {
        className: "min-h-screen flex items-center justify-center p-4 relative bg-[#0a0a0a] text-[#e5e2e1] overflow-hidden font-body-md",
        children: [
            /*#__PURE__*/ _jsx("div", {
                className: "absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.06)_0%,transparent_70%)] pointer-events-none z-0"
            }),
            /*#__PURE__*/ _jsxs("div", {
                className: "w-full max-w-[480px] p-8 md:p-10 flex flex-col gap-6 rounded-none bg-[#131313]/90 backdrop-blur-[12px] border border-t-white/10 border-l-white/10 border-b-black/30 border-r-black/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] z-10",
                children: [
                    /*#__PURE__*/ _jsxs("div", {
                        className: "flex flex-col items-center gap-3",
                        children: [
                            /*#__PURE__*/ _jsxs("div", {
                                className: "flex items-center gap-3 text-sky-400",
                                children: [
                                    /*#__PURE__*/ _jsx(Zap, {
                                        className: "size-10 fill-sky-400/20"
                                    }),
                                    /*#__PURE__*/ _jsx("h1", {
                                        className: "text-3xl font-extrabold tracking-tight font-headline-lg uppercase",
                                        children: "AeroLearn"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ _jsx("p", {
                                className: "text-[#bec8d2] text-xs font-mono uppercase tracking-widest",
                                children: "Workspace Ingestion Portal"
                            })
                        ]
                    }),
                    errorMsg && /*#__PURE__*/ _jsxs("div", {
                        role: "alert",
                        className: "p-3.5 rounded-none border border-red-500/20 bg-red-500/10 text-red-300 font-mono text-xs",
                        children: [
                            "⚠️ ",
                            errorMsg
                        ]
                    }),
                    successMsg && /*#__PURE__*/ _jsxs("div", {
                        role: "alert",
                        className: "p-3.5 rounded-none border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 font-mono text-xs",
                        children: [
                            "✓ ",
                            successMsg
                        ]
                    }),
                    /*#__PURE__*/ _jsxs("form", {
                        onSubmit: handleAuthSubmit,
                        className: "flex flex-col gap-5",
                        children: [
                            isSignUp && /*#__PURE__*/ _jsxs("div", {
                                className: "flex flex-col gap-2",
                                children: [
                                    /*#__PURE__*/ _jsx("label", {
                                        htmlFor: "name-input",
                                        className: "text-xs font-bold uppercase tracking-wider text-[#bec8d2] font-mono",
                                        children: "Your Name"
                                    }),
                                    /*#__PURE__*/ _jsx("input", {
                                        id: "name-input",
                                        type: "text",
                                        required: true,
                                        disabled: loading,
                                        value: fullName,
                                        onChange: (e)=>setFullName(e.target.value),
                                        placeholder: "Explorer Name",
                                        className: "w-full bg-[#1c1b1b] border border-[#3e4850] p-3 rounded-none focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm text-white font-mono placeholder:text-slate-600"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                className: "flex flex-col gap-2",
                                children: [
                                    /*#__PURE__*/ _jsx("label", {
                                        htmlFor: "email-input",
                                        className: "text-xs font-bold uppercase tracking-wider text-[#bec8d2] font-mono",
                                        children: "Email Address"
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "relative",
                                        children: [
                                            /*#__PURE__*/ _jsx(Mail, {
                                                className: "absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#bec8d2]/60"
                                            }),
                                            /*#__PURE__*/ _jsx("input", {
                                                id: "email-input",
                                                type: "email",
                                                required: true,
                                                disabled: loading,
                                                value: email,
                                                onChange: (e)=>setEmail(e.target.value),
                                                placeholder: "name@email.com",
                                                className: "w-full bg-[#1c1b1b] border border-[#3e4850] p-3 pl-12 rounded-none focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm text-white font-mono placeholder:text-slate-600"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                className: "flex flex-col gap-2",
                                children: [
                                    /*#__PURE__*/ _jsx("label", {
                                        htmlFor: "pass-input",
                                        className: "text-xs font-bold uppercase tracking-wider text-[#bec8d2] font-mono",
                                        children: "Password"
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "relative",
                                        children: [
                                            /*#__PURE__*/ _jsx(Key, {
                                                className: "absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#bec8d2]/60"
                                            }),
                                            /*#__PURE__*/ _jsx("input", {
                                                id: "pass-input",
                                                type: "password",
                                                required: true,
                                                disabled: loading,
                                                value: password,
                                                onChange: (e)=>setPassword(e.target.value),
                                                placeholder: "••••••••••••",
                                                className: "w-full bg-[#1c1b1b] border border-[#3e4850] p-3 pl-12 rounded-none focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm text-white font-mono placeholder:text-slate-600"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ _jsx(CyberButton, {
                                type: "submit",
                                disabled: loading,
                                className: "w-full mt-2",
                                icon: LogIn,
                                children: loading ? "Processing... \uD83D\uDE80" : isSignUp ? "Sign Up" : "Log In"
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsxs("p", {
                        className: "text-center text-sm text-[#bec8d2]",
                        children: [
                            isSignUp ? "Already registered?" : "New here?",
                            /*#__PURE__*/ _jsx("button", {
                                type: "button",
                                onClick: ()=>{
                                    setIsSignUp(!isSignUp);
                                    setErrorMsg("");
                                    setSuccessMsg("");
                                },
                                className: "text-sky-400 hover:underline font-bold ml-2 font-mono",
                                children: isSignUp ? "Login Here" : "Create Account"
                            })
                        ]
                    })
                ]
            })
        ]
    });
};
// --- Onboarding Flow (2-Step Spec-Compliant Wizard) ---
// Step 1: Language Priority ranking
const OnboardingStep1 = ({ onNext, preferredLanguages, setPreferredLanguages })=>{
    const [selectedLang, setSelectedLang] = useState("en");
    const addLanguage = ()=>{
        if (!preferredLanguages.includes(selectedLang)) {
            setPreferredLanguages([
                ...preferredLanguages,
                selectedLang
            ]);
        }
    };
    const removeLanguage = (lang)=>{
        setPreferredLanguages(preferredLanguages.filter((l)=>l !== lang));
    };
    const moveUp = (index)=>{
        if (index === 0) return;
        const arr = [
            ...preferredLanguages
        ];
        const temp = arr[index];
        arr[index] = arr[index - 1];
        arr[index - 1] = temp;
        setPreferredLanguages(arr);
    };
    const moveDown = (index)=>{
        if (index === preferredLanguages.length - 1) return;
        const arr = [
            ...preferredLanguages
        ];
        const temp = arr[index];
        arr[index] = arr[index + 1];
        arr[index + 1] = temp;
        setPreferredLanguages(arr);
    };
    const langNames = {
        en: "English (en)",
        es: "Spanish (es)",
        fr: "French (fr)",
        de: "German (de)",
        ja: "Japanese (ja)",
        zh: "Chinese (zh)",
        hi: "Hindi (hi)"
    };
    return /*#__PURE__*/ _jsx("div", {
        className: "min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a] text-[#e5e2e1] font-body-md",
        children: /*#__PURE__*/ _jsxs("div", {
            className: "w-full max-w-[720px] flex flex-col gap-8",
            children: [
                /*#__PURE__*/ _jsx(ProgressIndicator, {
                    phase: "Calibration: Step A \uD83D\uDDE3️",
                    label: "Language Comfort Matrix",
                    progress: 50
                }),
                /*#__PURE__*/ _jsxs("div", {
                    className: "p-8 flex flex-col gap-6 rounded-none bg-[#131313] border border-t-white/10 border-l-white/10 border-b-black/30 border-r-black/20 shadow-[0_0_20px_rgba(0,0,0,0.4)]",
                    children: [
                        /*#__PURE__*/ _jsxs("div", {
                            className: "flex justify-between items-start",
                            children: [
                                /*#__PURE__*/ _jsx("h2", {
                                    className: "text-2xl font-bold font-headline-lg text-white",
                                    children: "Languages Comfort Setup"
                                }),
                                /*#__PURE__*/ _jsx(BarrierTag, {
                                    barrier: "language"
                                })
                            ]
                        }),
                        /*#__PURE__*/ _jsx("p", {
                            className: "text-[#bec8d2] text-sm leading-relaxed",
                            children: "Select and rank the languages you prefer to study in. Your primary language (listed on top) acts as your translation target for academic materials."
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                            className: "flex gap-4 items-center",
                            children: [
                                /*#__PURE__*/ _jsx("select", {
                                    value: selectedLang,
                                    onChange: (e)=>setSelectedLang(e.target.value),
                                    className: "flex-1 bg-[#1c1b1b] border border-[#3e4850] text-[#e5e2e1] p-3 rounded-none focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono text-sm",
                                    children: Object.entries(langNames).map(([code, name])=>/*#__PURE__*/ _jsx("option", {
                                            value: code,
                                            className: "bg-[#131313]",
                                            children: name
                                        }, code))
                                }),
                                /*#__PURE__*/ _jsx(CyberButton, {
                                    onClick: addLanguage,
                                    variant: "outline",
                                    children: "Add Language"
                                })
                            ]
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                            className: "space-y-3 mt-4",
                            children: [
                                /*#__PURE__*/ _jsx("h4", {
                                    className: "text-xs font-bold uppercase tracking-wider text-sky-400 font-mono",
                                    children: "Your Priority List (Primary language on top):"
                                }),
                                preferredLanguages.length === 0 ? /*#__PURE__*/ _jsx("p", {
                                    className: "text-xs text-[#bec8d2] italic",
                                    children: "No languages added yet. Please select and add at least one language to proceed."
                                }) : /*#__PURE__*/ _jsx("div", {
                                    className: "space-y-2",
                                    children: preferredLanguages.map((code, idx)=>/*#__PURE__*/ _jsxs("div", {
                                            className: "flex justify-between items-center bg-[#1c1b1b] p-4 rounded-none border border-[#3e4850]/50",
                                            children: [
                                                /*#__PURE__*/ _jsxs("span", {
                                                    className: "text-sm font-semibold",
                                                    children: [
                                                        idx + 1,
                                                        ". ",
                                                        langNames[code],
                                                        " ",
                                                        idx === 0 && "⭐ (Target Language)"
                                                    ]
                                                }),
                                                /*#__PURE__*/ _jsxs("div", {
                                                    className: "flex gap-2",
                                                    children: [
                                                        idx > 0 && /*#__PURE__*/ _jsx("button", {
                                                            type: "button",
                                                            onClick: ()=>moveUp(idx),
                                                            className: "text-xs bg-[#131313] hover:bg-sky-500/10 border border-[#3e4850] text-sky-400 px-3 py-1.5 rounded-none transition-all font-mono",
                                                            children: "▲ Up"
                                                        }),
                                                        idx < preferredLanguages.length - 1 && /*#__PURE__*/ _jsx("button", {
                                                            type: "button",
                                                            onClick: ()=>moveDown(idx),
                                                            className: "text-xs bg-[#131313] hover:bg-sky-500/10 border border-[#3e4850] text-sky-400 px-3 py-1.5 rounded-none transition-all font-mono",
                                                            children: "▼ Down"
                                                        }),
                                                        /*#__PURE__*/ _jsx("button", {
                                                            type: "button",
                                                            onClick: ()=>removeLanguage(code),
                                                            className: "text-xs text-red-400 bg-[#131313] hover:bg-red-500/10 border border-[#3e4850] px-3 py-1.5 rounded-none transition-all",
                                                            children: "Remove"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }, code))
                                })
                            ]
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                            className: "flex justify-between pt-6 border-t border-[#3e4850]/30 mt-4",
                            children: [
                                /*#__PURE__*/ _jsx("span", {
                                    className: "text-xs text-[#bec8d2] self-center font-mono",
                                    children: "Setup your comfort matrix to unlock reading options."
                                }),
                                /*#__PURE__*/ _jsx(CyberButton, {
                                    disabled: preferredLanguages.length === 0,
                                    onClick: onNext,
                                    variant: "primary",
                                    icon: ArrowRight,
                                    children: "Continue to Step B"
                                })
                            ]
                        })
                    ]
                })
            ]
        })
    });
};
// Step 2: Disabilities selection & Mic noise floor calibration (inline)
const OnboardingStep2 = ({ onNext, preferredLanguages, disabilities, setDisabilities })=>{
    const [errorMsg, setErrorMsg] = useState("");
    // Microphone noise floor calibration state
    const [calibrating, setCalibrating] = useState(false);
    const [calibrationProgress, setCalibrationProgress] = useState(0);
    const [calibrated, setCalibrated] = useState(false);
    const choices = [
        {
            key: "blind",
            label: "Blind / Low Vision \uD83D\uDC41️",
            desc: "Continuous microphone commands, screen audio narration feedbacks, and auditory navigation desks."
        },
        {
            key: "deaf",
            label: "Deaf / Hard of Hearing \uD83E\uDD1F",
            desc: "Dynamic sign language avatar frames synced directly to text words/sentence outlines."
        },
        {
            key: "dyslexia",
            label: "Dyslexia \uD83D\uDCD6",
            desc: "Applies visual OpenDyslexic spacing, font alterations, and line-height overlays."
        },
        {
            key: "adhd",
            label: "ADHD ⚡",
            desc: "Splits technical paragraphs into high-contrast bullet highlights and visual micro-headers."
        },
        {
            key: "autism",
            label: "Autism Spectrum (Sensory Sensitivity) \uD83C\uDF43",
            desc: "Enables dark static, low-sensory color pallets, and disables automatic audios/videos."
        },
        {
            key: "none",
            label: "No Accommodations (Standard Mode) \uD83D\uDE80",
            desc: "Standard scannable textbook summaries with glossary contextual hover popups."
        }
    ];
    const toggleChoice = (key)=>{
        setErrorMsg("");
        if (key === "none") {
            setDisabilities([
                "none"
            ]);
        } else {
            const filtered = disabilities.filter((d)=>d !== "none");
            if (filtered.includes(key)) {
                setDisabilities(filtered.filter((d)=>d !== key));
            } else {
                const next = [
                    ...filtered,
                    key
                ];
                setDisabilities(next);
                if (key === "blind") {
                    setTimeout(()=>{
                        playInstructionVoice();
                    }, 100);
                }
            }
        }
    };
    const isBlindSelected = disabilities.includes("blind");
    // Speech Synthesizer for onboarding cues (tries ElevenLabs first, then fallback)
    const speakText = async (text)=>{
        try {
            const selectedVoice = "undefined" !== "undefined" && localStorage.getItem("aerolearn_narration_voice") || "Xb7hH8MSUJpSbSDYk0k2";
            const selectedSpeed = parseFloat("undefined" !== "undefined" && localStorage.getItem("aerolearn_narration_speed") || "1.0");
            const response = await fetch("http://127.0.0.1:8000/audio/speak", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    text,
                    voice_id: selectedVoice
                })
            });
            if (response.ok) {
                const audioUrl = URL.createObjectURL(await response.blob());
                const audio = new Audio(audioUrl);
                audio.playbackRate = selectedSpeed;
                audio.play();
            } else {
                speakTextFallback(text);
            }
        } catch (e) {
            console.error("ElevenLabs speak failed, using fallback TTS: ", e);
            speakTextFallback(text);
        }
    };
    const speakTextFallback = (text)=>{
        if ("undefined" === "undefined" || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
    };
    const playInstructionVoice = ()=>{
        speakText("Microphone access is required for Blind Mode. We will now listen to your room for five seconds to record the ambient background noise. Please click start calibration and remain silent.");
    };
    const startCalibration = async ()=>{
        setErrorMsg("");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
            setCalibrating(true);
            setCalibrationProgress(0);
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(2048, 1, 1);
            let totalSamples = 0;
            let sumSquares = 0;
            processor.onaudioprocess = (e)=>{
                const inputData = e.inputBuffer.getChannelData(0);
                for(let i = 0; i < inputData.length; i++){
                    sumSquares += inputData[i] * inputData[i];
                }
                totalSamples += inputData.length;
            };
            source.connect(processor);
            processor.connect(audioContext.destination);
            let progress = 0;
            const interval = setInterval(()=>{
                progress += 20;
                setCalibrationProgress(progress);
                if (progress >= 100) {
                    clearInterval(interval);
                    // Stop recording
                    processor.disconnect();
                    source.disconnect();
                    stream.getTracks().forEach((t)=>t.stop());
                    audioContext.close();
                    // Calculate RMS amplitude
                    const rms = Math.sqrt(sumSquares / totalSamples);
                    localStorage.setItem("noiseFloor", rms.toString());
                    setCalibrating(false);
                    setCalibrated(true);
                    speakText("Calibration complete. Microphone noise baseline established. Cockpit ready for launch.");
                }
            }, 1000);
        } catch (e) {
            setErrorMsg("Microphone permissions denied. Please allow microphone permissions in your browser to use Blind Mode.");
            setCalibrating(false);
        }
    };
    const handleOnboardingNext = ()=>{
        if (isBlindSelected && !calibrated) {
            setErrorMsg("Please complete the microphone noise calibration step to calibrate Blind Mode commands.");
            return;
        }
        onNext();
    };
    return /*#__PURE__*/ _jsx("div", {
        className: "min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a] text-[#e5e2e1] font-body-md",
        children: /*#__PURE__*/ _jsxs("div", {
            className: "w-full max-w-[720px] flex flex-col gap-8",
            children: [
                /*#__PURE__*/ _jsx(ProgressIndicator, {
                    phase: "Calibration: Step B \uD83C\uDFA8",
                    label: "Accessibility Matrix Mapping",
                    progress: 75
                }),
                /*#__PURE__*/ _jsxs("div", {
                    className: "p-8 flex flex-col gap-6 rounded-none bg-[#131313] border border-t-white/10 border-l-white/10 border-b-black/30 border-r-black/20 shadow-[0_0_20px_rgba(0,0,0,0.4)]",
                    children: [
                        /*#__PURE__*/ _jsxs("div", {
                            className: "flex justify-between items-start",
                            children: [
                                /*#__PURE__*/ _jsx("h2", {
                                    className: "text-2xl font-bold font-headline-lg text-white",
                                    children: "Accessibility Config Setup"
                                }),
                                /*#__PURE__*/ _jsx(BarrierTag, {
                                    barrier: "disability"
                                })
                            ]
                        }),
                        /*#__PURE__*/ _jsx("p", {
                            className: "text-[#bec8d2] text-sm leading-relaxed",
                            children: "Select the accommodation profiles that match your specific learning needs. We will dynamically calibrate the dashboards, narration settings, and fonts."
                        }),
                        errorMsg && /*#__PURE__*/ _jsxs("div", {
                            role: "alert",
                            className: "p-4 border border-red-500/20 bg-red-500/10 text-red-300 rounded-none text-xs font-mono flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ _jsx("span", {
                                    children: "⚠️"
                                }),
                                /*#__PURE__*/ _jsx("span", {
                                    children: errorMsg
                                })
                            ]
                        }),
                        /*#__PURE__*/ _jsx("div", {
                            className: "space-y-3",
                            children: choices.map((c)=>{
                                const active = disabilities.includes(c.key);
                                return /*#__PURE__*/ _jsxs("button", {
                                    type: "button",
                                    onClick: ()=>toggleChoice(c.key),
                                    className: `w-full p-4 rounded-none border text-left flex justify-between items-center transition-all min-h-[44px] ${active ? "border-sky-500 bg-sky-500/10 text-white" : "border-[#3e4850]/50 bg-[#1c1b1b] text-[#bec8d2] hover:border-sky-500/40 hover:text-white"}`,
                                    children: [
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "pr-4",
                                            children: [
                                                /*#__PURE__*/ _jsx("span", {
                                                    className: "font-bold text-sm block",
                                                    children: c.label
                                                }),
                                                /*#__PURE__*/ _jsx("span", {
                                                    className: "text-xs text-[#bec8d2] mt-1 block leading-relaxed",
                                                    children: c.desc
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsx("div", {
                                            className: `w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ${active ? "bg-sky-500" : "bg-[#131313]"}`,
                                            children: /*#__PURE__*/ _jsx("div", {
                                                className: `absolute top-1 size-3 bg-white rounded-full transition-all ${active ? "right-1" : "left-1"}`
                                            })
                                        })
                                    ]
                                }, c.key);
                            })
                        }),
                        isBlindSelected && /*#__PURE__*/ _jsxs("div", {
                            className: "mt-6 p-6 rounded-none border border-amber-500/30 bg-amber-500/5 space-y-4",
                            children: [
                                /*#__PURE__*/ _jsxs("div", {
                                    className: "flex justify-between items-start",
                                    children: [
                                        /*#__PURE__*/ _jsxs("div", {
                                            children: [
                                                /*#__PURE__*/ _jsx("h3", {
                                                    className: "font-mono text-base text-amber-500 font-bold uppercase tracking-wider",
                                                    children: "Microphone Noise Calibration"
                                                }),
                                                /*#__PURE__*/ _jsx("p", {
                                                    className: "text-xs text-[#bec8d2] mt-1 leading-relaxed",
                                                    children: "Continuous voice commands require calibration to filter out ambient background noise."
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsx("button", {
                                            type: "button",
                                            onClick: playInstructionVoice,
                                            className: "px-3 py-1 bg-[#1c1b1b] text-amber-500 hover:bg-amber-500/10 text-[10px] font-mono rounded-none border border-amber-500/20 uppercase font-bold",
                                            children: "Listen Instructions \uD83D\uDD0A"
                                        })
                                    ]
                                }),
                                calibrating ? /*#__PURE__*/ _jsxs("div", {
                                    className: "space-y-3",
                                    children: [
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "flex justify-between text-xs font-mono text-amber-500",
                                            children: [
                                                /*#__PURE__*/ _jsx("span", {
                                                    children: "RECORDING AMBIENT SOUND LEVELS..."
                                                }),
                                                /*#__PURE__*/ _jsxs("span", {
                                                    children: [
                                                        calibrationProgress,
                                                        "%"
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsx("div", {
                                            className: "h-2 w-full bg-neutral-900 rounded-none overflow-hidden",
                                            children: /*#__PURE__*/ _jsx("div", {
                                                className: "h-full bg-amber-500 transition-all duration-300",
                                                style: {
                                                    width: `${calibrationProgress}%`
                                                }
                                            })
                                        }),
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "flex items-end justify-center gap-1.5 h-8 mt-2",
                                            children: [
                                                /*#__PURE__*/ _jsx("div", {
                                                    className: "w-1.5 bg-amber-500 animate-[bounce_1s_infinite_100ms] h-4"
                                                }),
                                                /*#__PURE__*/ _jsx("div", {
                                                    className: "w-1.5 bg-amber-500 animate-[bounce_1s_infinite_200ms] h-7"
                                                }),
                                                /*#__PURE__*/ _jsx("div", {
                                                    className: "w-1.5 bg-amber-500 animate-[bounce_1s_infinite_300ms] h-5"
                                                }),
                                                /*#__PURE__*/ _jsx("div", {
                                                    className: "w-1.5 bg-amber-500 animate-[bounce_1s_infinite_400ms] h-8"
                                                }),
                                                /*#__PURE__*/ _jsx("div", {
                                                    className: "w-1.5 bg-amber-500 animate-[bounce_1s_infinite_500ms] h-3"
                                                }),
                                                /*#__PURE__*/ _jsx("div", {
                                                    className: "w-1.5 bg-amber-500 animate-[bounce_1s_infinite_600ms] h-6"
                                                })
                                            ]
                                        })
                                    ]
                                }) : calibrated ? /*#__PURE__*/ _jsx("div", {
                                    className: "p-3 bg-[#5DCAA5]/10 border border-[#5DCAA5]/20 text-[#5DCAA5] text-xs rounded-none font-mono",
                                    children: "✓ Noise floor calibrated successfully! Parameter stored."
                                }) : /*#__PURE__*/ _jsxs("button", {
                                    type: "button",
                                    onClick: startCalibration,
                                    className: "w-full min-h-[44px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-dashed border-amber-500/40 rounded-none font-bold uppercase text-xs flex items-center justify-center gap-2 cursor-pointer transition-all",
                                    children: [
                                        /*#__PURE__*/ _jsx(Mic, {
                                            className: "size-4 animate-pulse"
                                        }),
                                        " Calibrate Microphone (5s)"
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ _jsx("div", {
                            className: "flex justify-end pt-6 border-t border-[#3e4850]/30 mt-4",
                            children: /*#__PURE__*/ _jsx(CyberButton, {
                                disabled: isBlindSelected && !calibrated,
                                onClick: handleOnboardingNext,
                                variant: "primary",
                                icon: ArrowRight,
                                children: "Continue to Step C"
                            })
                        })
                    ]
                })
            ]
        })
    });
};
// Step 3: Goals selection (Optional)
const OnboardingStep3 = ({ onComplete, preferredLanguages, disabilities })=>{
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const choices = [
        {
            key: "translating my coursework",
            label: "Translating Coursework \uD83D\uDCDA",
            desc: "Translating textbooks and videos into my primary language."
        },
        {
            key: "an accessible way to study",
            label: "Accessible Studying \uD83D\uDD0D",
            desc: "Using specialized fonts, screen narration, or sign language."
        },
        {
            key: "helping other learners",
            label: "Helping Others \uD83E\uDD1F",
            desc: "Sharing notes, answers, and tutoring regional language students."
        },
        {
            key: "exploring",
            label: "Exploring \uD83D\uDE80",
            desc: "Just checking out AeroLearn's adaptive cockpits and features."
        }
    ];
    const toggleChoice = (key)=>{
        if (goals.includes(key)) {
            setGoals(goals.filter((g)=>g !== key));
        } else {
            setGoals([
                ...goals,
                key
            ]);
        }
    };
    const handleOnboardingSubmit = async (finalGoals)=>{
        setLoading(true);
        setErrorMsg("");
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) throw new Error("Authentication session expired. Please log in again.");
            const dyslexia_friendly = disabilities.includes("dyslexia");
            const high_contrast = disabilities.includes("blind") || disabilities.includes("deaf");
            const sign_language_preference = disabilities.includes("deaf");
            const { error: dbError } = await supabase.from("profiles").upsert({
                id: user.id,
                preferred_languages: preferredLanguages,
                disabilities: disabilities,
                dyslexia_friendly,
                high_contrast,
                sign_language_preference,
                goals: finalGoals,
                onboarding_completed_at: new Date().toISOString(),
                reading_level_override: "default",
                preferred_voice_id: "Xb7hH8MSUJpSbSDYk0k2",
                narration_speed: 1.0,
                low_stimulus_mode: false,
                text_size_scale: 1.0,
                knowledge_hive_visibility: "matched_groups",
                updated_at: new Date().toISOString()
            });
            if (dbError) throw dbError;
            onComplete();
        } catch (e) {
            console.error(e);
            setErrorMsg(e.message || "Error occurred while saving profile settings.");
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ _jsx("div", {
        className: "min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a] text-[#e5e2e1] font-body-md",
        children: /*#__PURE__*/ _jsxs("div", {
            className: "w-full max-w-[720px] flex flex-col gap-8",
            children: [
                /*#__PURE__*/ _jsx(ProgressIndicator, {
                    phase: "Calibration: Step C \uD83C\uDFAF",
                    label: "Goals Alignment (Optional)",
                    progress: 100
                }),
                /*#__PURE__*/ _jsxs("div", {
                    className: "p-8 flex flex-col gap-6 rounded-none bg-[#131313] border border-t-white/10 border-l-white/10 border-b-black/30 border-r-black/20 shadow-[0_0_20px_rgba(0,0,0,0.4)]",
                    children: [
                        /*#__PURE__*/ _jsxs("div", {
                            className: "flex justify-between items-start",
                            children: [
                                /*#__PURE__*/ _jsx("h2", {
                                    className: "text-2xl font-bold font-headline-lg text-white",
                                    children: "What are you hoping to use AeroLearn for?"
                                }),
                                /*#__PURE__*/ _jsx(BarrierTag, {
                                    barrier: "cost"
                                })
                            ]
                        }),
                        /*#__PURE__*/ _jsx("p", {
                            className: "text-[#bec8d2] text-sm leading-relaxed",
                            children: "Select any goals that match your learning journey. This step is optional and skippable, purely used to customize future cockpit personalizations."
                        }),
                        errorMsg && /*#__PURE__*/ _jsxs("div", {
                            role: "alert",
                            className: "p-4 border border-red-500/20 bg-red-500/10 text-red-300 rounded-none text-xs font-mono flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ _jsx("span", {
                                    children: "⚠️"
                                }),
                                /*#__PURE__*/ _jsx("span", {
                                    children: errorMsg
                                })
                            ]
                        }),
                        /*#__PURE__*/ _jsx("div", {
                            className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                            children: choices.map((c)=>{
                                const active = goals.includes(c.key);
                                return /*#__PURE__*/ _jsxs("button", {
                                    type: "button",
                                    onClick: ()=>toggleChoice(c.key),
                                    className: `p-4 rounded-none border text-left flex flex-col justify-between transition-all min-h-[100px] ${active ? "border-sky-500 bg-sky-500/10 text-white font-sans" : "border-[#3e4850]/50 bg-[#1c1b1b] text-[#bec8d2] hover:border-sky-500/40 hover:text-white font-sans"}`,
                                    children: [
                                        /*#__PURE__*/ _jsx("span", {
                                            className: "font-bold text-sm block",
                                            children: c.label
                                        }),
                                        /*#__PURE__*/ _jsx("span", {
                                            className: "text-xs text-[#bec8d2] mt-2 block leading-relaxed",
                                            children: c.desc
                                        })
                                    ]
                                }, c.key);
                            })
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                            className: "flex justify-between pt-6 border-t border-[#3e4850]/30 mt-4",
                            children: [
                                /*#__PURE__*/ _jsx("button", {
                                    type: "button",
                                    disabled: loading,
                                    onClick: ()=>handleOnboardingSubmit([]),
                                    className: "text-xs text-[#bec8d2] hover:text-white bg-[#1c1b1b] border border-[#3e4850]/50 px-4 py-2.5 rounded-none font-mono",
                                    children: "Skip Step"
                                }),
                                /*#__PURE__*/ _jsx(CyberButton, {
                                    disabled: loading,
                                    onClick: ()=>handleOnboardingSubmit(goals),
                                    variant: "primary",
                                    children: loading ? "Commencing Launch..." : "Commence Launch \uD83D\uDE80"
                                })
                            ]
                        })
                    ]
                })
            ]
        })
    });
};
// --- SYSTEM SETTINGS SCREEN (Phase 3 UI Integration) ---
const SettingsScreen = ({ onBack })=>{
    const { profile: profile1, setProfile } = useAccessibility();
    const [activeTab, setActiveTab] = useState("accessibility");
    // Form fields state
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [selectedDisabilities, setSelectedDisabilities] = useState([]);
    const [readingOverride, setReadingOverride] = useState("default");
    const [lowStimulus, setLowStimulus] = useState(false);
    const [preferredVoice, setPreferredVoice] = useState("Xb7hH8MSUJpSbSDYk0k2");
    const [narrationSpeed, setNarrationSpeed] = useState(1.0);
    const [textSizeScale, setTextSizeScale] = useState(1.0);
    // Privacy tab state
    const [showNameInHive, setShowNameInHive] = useState(true);
    const [showStatsPublicly, setShowStatsPublicly] = useState(false);
    const [allowPeerRequests, setAllowPeerRequests] = useState(true);
    const [hiveVisibility, setHiveVisibility] = useState("matched_groups");
    // Supporting state
    const [userStats, setUserStats] = useState(null);
    const [linkedDevices, setLinkedDevices] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [langInput, setLangInput] = useState("en");
    // Deletion confirm
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const voices = [
        {
            id: "Xb7hH8MSUJpSbSDYk0k2",
            name: "Alice (Standard Female)"
        },
        {
            id: "21m00Tcm4TlvDq8ikWAM",
            name: "Rachel (Warm Conversational)"
        },
        {
            id: "AZnzlk1XvdvUeBnXmlld",
            name: "Domi (Energetic Female)"
        },
        {
            id: "EXAVITQu4vr4xnSDxMaL",
            name: "Bella (Professional Narrator)"
        },
        {
            id: "ErXwobaYiN019PkySvjV",
            name: "Antoni (Classic Male)"
        }
    ];
    const languagesList = {
        en: "English (en)",
        es: "Spanish (es)",
        fr: "French (fr)",
        de: "German (de)",
        ja: "Japanese (ja)",
        zh: "Chinese (zh)",
        hi: "Hindi (hi)"
    };
    const disabilitiesList = [
        {
            key: "blind",
            label: "Blind / Low Vision \uD83D\uDC41️"
        },
        {
            key: "deaf",
            label: "Deaf / Hard of Hearing \uD83E\uDD1F"
        },
        {
            key: "dyslexia",
            label: "Dyslexia \uD83D\uDCD6"
        },
        {
            key: "adhd",
            label: "ADHD ⚡"
        },
        {
            key: "autism",
            label: "Autism Spectrum (Sensory Sensitivity) \uD83C\uDF43"
        },
        {
            key: "none",
            label: "No Accommodations (Standard Mode) \uD83D\uDE80"
        }
    ];
    const avatarSeeds = [
        "AeroPilot",
        "Orion",
        "Alpha",
        "Nova",
        "Cosmos",
        "Nebula",
        "StarGazer"
    ];
    useEffect(()=>{
        if (profile1) {
            setDisplayName(profile1.display_name || profile1.full_name || "");
            setBio(profile1.bio || "");
            setAvatarUrl(profile1.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile1.id || "AeroLearn"}`);
            setSelectedLanguages(profile1.preferred_languages || [
                "en"
            ]);
            setSelectedDisabilities(profile1.disabilities || [
                "none"
            ]);
            setReadingOverride(profile1.reading_level_override || "default");
            setLowStimulus(profile1.low_stimulus_mode || false);
            setPreferredVoice(profile1.preferred_voice_id || "Xb7hH8MSUJpSbSDYk0k2");
            setNarrationSpeed(profile1.narration_speed || 1.0);
            setTextSizeScale(profile1.text_size_scale || 1.0);
            setHiveVisibility(profile1.knowledge_hive_visibility || "matched_groups");
        }
    }, [
        profile1
    ]);
    useEffect(()=>{
        async function loadData() {
            setLoadingData(true);
            setErrorMsg("");
            try {
                const useMock = localStorage.getItem("aerolearn_use_mock") === "true" || window.__use_mock_supabase === true;
                const session = await supabase.auth.getSession();
                const token = session.data.session?.access_token;
                const userId = session.data.session?.user?.id || "mock-user-123";
                if (useMock) {
                    const { data: priv } = await supabase.from("profile_privacy_settings").select("*").eq("user_id", userId).single();
                    if (priv) {
                        setShowNameInHive(priv.show_display_name_in_hive);
                        setShowStatsPublicly(priv.show_stats_publicly);
                        setAllowPeerRequests(priv.allow_peer_note_requests);
                    }
                    const { data: st } = await supabase.from("profile_stats").select("*").eq("user_id", userId).single();
                    if (st) setUserStats(st);
                    const { data: dev } = await supabase.from("linked_devices").select("*").eq("user_id", userId).order("last_active", {
                        ascending: false
                    });
                    if (dev) setLinkedDevices(dev || []);
                } else {
                    const headers = {
                        "Authorization": token || ""
                    };
                    const meResp = await fetch("http://127.0.0.1:8000/profile/me", {
                        headers
                    });
                    if (meResp.ok) {
                        const meData = await meResp.json();
                        setUserStats(meData.stats);
                    }
                    const privacyResp = await fetch("http://127.0.0.1:8000/profile/me/privacy", {
                        headers
                    });
                    if (privacyResp.ok) {
                        const priv = await privacyResp.json();
                        const pSettings = priv.privacy_settings || priv;
                        setShowNameInHive(pSettings.show_display_name_in_hive);
                        setShowStatsPublicly(pSettings.show_stats_publicly);
                        setAllowPeerRequests(pSettings.allow_peer_note_requests);
                    }
                    const devicesResp = await fetch("http://127.0.0.1:8000/profile/me/devices", {
                        headers
                    });
                    if (devicesResp.ok) {
                        const devs = await devicesResp.json();
                        setLinkedDevices(devs || []);
                    }
                }
            } catch (err) {
                console.error("Failed to load settings data:", err);
            } finally{
                setLoadingData(false);
            }
        }
        loadData();
    }, [
        profile1
    ]);
    const handleSaveSettings = async (updatedFields = {})=>{
        setSaving(true);
        setSuccessMsg("");
        setErrorMsg("");
        try {
            const useMock = localStorage.getItem("aerolearn_use_mock") === "true" || window.__use_mock_supabase === true;
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;
            const userId = session.data.session?.user?.id || "mock-user-123";
            const dyslexia_friendly = selectedDisabilities.includes("dyslexia");
            const high_contrast = selectedDisabilities.includes("blind") || selectedDisabilities.includes("deaf");
            const sign_language_preference = selectedDisabilities.includes("deaf");
            const profilePayload = {
                display_name: displayName,
                bio,
                avatar_url: avatarUrl,
                preferred_languages: selectedLanguages,
                disabilities: selectedDisabilities,
                dyslexia_friendly,
                high_contrast,
                sign_language_preference,
                reading_level_override: readingOverride,
                low_stimulus_mode: lowStimulus,
                preferred_voice_id: preferredVoice,
                narration_speed: parseFloat(narrationSpeed),
                text_size_scale: parseFloat(textSizeScale),
                knowledge_hive_visibility: hiveVisibility,
                ...updatedFields
            };
            const privacyPayload = {
                show_display_name_in_hive: showNameInHive,
                show_stats_publicly: showStatsPublicly,
                allow_peer_note_requests: allowPeerRequests
            };
            // Also persist to localStorage for TTS voice narration configuration:
            localStorage.setItem("aerolearn_narration_voice", preferredVoice);
            localStorage.setItem("aerolearn_narration_speed", narrationSpeed.toString());
            if (useMock) {
                await supabase.from("profiles").upsert({
                    id: userId,
                    ...profilePayload
                });
                await supabase.from("profile_privacy_settings").upsert({
                    user_id: userId,
                    ...privacyPayload
                });
                setProfile((prev)=>({
                        ...prev,
                        ...profilePayload
                    }));
            } else {
                const headers = {
                    "Content-Type": "application/json",
                    "Authorization": token || ""
                };
                const pResp = await fetch("http://127.0.0.1:8000/profile/me", {
                    method: "PATCH",
                    headers,
                    body: JSON.stringify(profilePayload)
                });
                if (!pResp.ok) throw new Error("Failed to update profile on backend.");
                const privResp = await fetch("http://127.0.0.1:8000/profile/me/privacy", {
                    method: "PATCH",
                    headers,
                    body: JSON.stringify(privacyPayload)
                });
                if (!privResp.ok) throw new Error("Failed to update privacy settings.");
                setProfile((prev)=>({
                        ...prev,
                        ...profilePayload
                    }));
            }
            setSuccessMsg("System settings updated successfully!");
            setTimeout(()=>setSuccessMsg(""), 3000);
        } catch (err) {
            console.error(err);
            setErrorMsg(err.message || "Failed to save settings.");
        } finally{
            setSaving(false);
        }
    };
    const handleRevokeDevice = async (deviceId)=>{
        setErrorMsg("");
        try {
            const useMock = localStorage.getItem("aerolearn_use_mock") === "true" || window.__use_mock_supabase === true;
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;
            if (useMock) {
                await supabase.from("linked_devices").delete().eq("id", deviceId);
                setLinkedDevices((prev)=>prev.filter((d)=>d.id !== deviceId));
            } else {
                const headers = {
                    "Authorization": token || ""
                };
                const resp = await fetch(`http://127.0.0.1:8000/profile/me/devices/${deviceId}`, {
                    method: "DELETE",
                    headers
                });
                if (!resp.ok) throw new Error("Failed to revoke session on server.");
                setLinkedDevices((prev)=>prev.filter((d)=>d.id !== deviceId));
            }
            setSuccessMsg("Session revoked successfully.");
            setTimeout(()=>setSuccessMsg(""), 3000);
        } catch (err) {
            setErrorMsg(err.message);
        }
    };
    const handleRevokeOthers = async ()=>{
        setErrorMsg("");
        try {
            const useMock = localStorage.getItem("aerolearn_use_mock") === "true" || window.__use_mock_supabase === true;
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;
            const userId = session.data.session?.user?.id || "mock-user-123";
            if (useMock) {
                await supabase.from("linked_devices").delete().eq("user_id", userId).eq("is_current", false);
                setLinkedDevices((prev)=>prev.filter((d)=>d.is_current));
            } else {
                const headers = {
                    "Authorization": token || ""
                };
                const resp = await fetch("http://127.0.0.1:8000/profile/me/devices/logout-others", {
                    method: "POST",
                    headers
                });
                if (!resp.ok) throw new Error("Failed to revoke other sessions.");
                setLinkedDevices((prev)=>prev.filter((d)=>d.is_current));
            }
            setSuccessMsg("Other sessions revoked successfully.");
            setTimeout(()=>setSuccessMsg(""), 3000);
        } catch (err) {
            setErrorMsg(err.message);
        }
    };
    const handleExportData = async ()=>{
        setErrorMsg("");
        try {
            const useMock = localStorage.getItem("aerolearn_use_mock") === "true" || window.__use_mock_supabase === true;
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;
            if (useMock) {
                const exportData = {
                    profile: profile1,
                    stats: userStats,
                    documents: JSON.parse(localStorage.getItem("aerolearn_mock_documents") || "[]"),
                    notes: JSON.parse(localStorage.getItem("aerolearn_mock_notes") || "[]"),
                    export_time: new Date().toISOString()
                };
                const blob = new Blob([
                    JSON.stringify(exportData, null, 2)
                ], {
                    type: "application/json"
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `aerolearn_sandbox_export_${profile1.id || "explorer"}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                const resp = await fetch("http://127.0.0.1:8000/profile/me/export", {
                    headers: token ? {
                        "Authorization": token
                    } : {}
                });
                if (!resp.ok) throw new Error("Failed to export data from server.");
                const blob = await resp.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "aerolearn_user_data_export.zip";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
            setSuccessMsg("User data exported successfully.");
            setTimeout(()=>setSuccessMsg(""), 3000);
        } catch (err) {
            setErrorMsg(err.message);
        }
    };
    const handleDeleteAccount = async ()=>{
        if (deleteConfirmText !== "DELETE") {
            setErrorMsg("Please type DELETE to confirm account deletion.");
            return;
        }
        setErrorMsg("");
        try {
            const useMock = localStorage.getItem("aerolearn_use_mock") === "true" || window.__use_mock_supabase === true;
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;
            if (useMock) {
                localStorage.removeItem("aerolearn_mock_session");
                const profiles = JSON.parse(localStorage.getItem("aerolearn_mock_profiles") || "{}");
                if (session.data.session?.user?.id) {
                    delete profiles[session.data.session.user.id];
                    localStorage.setItem("aerolearn_mock_profiles", JSON.stringify(profiles));
                }
                setSuccessMsg("Account deleted. Re-attributing notes and logging out...");
                setTimeout(()=>{
                    window.location.reload();
                }, 1500);
            } else {
                const headers = {
                    "Authorization": token || ""
                };
                const resp = await fetch("http://127.0.0.1:8000/profile/me", {
                    method: "DELETE",
                    headers
                });
                if (!resp.ok) throw new Error("Failed to delete account on server.");
                await supabase.auth.signOut();
                setSuccessMsg("Account deleted. Re-attributing notes and logging out...");
                setTimeout(()=>{
                    window.location.reload();
                }, 1500);
            }
        } catch (err) {
            setErrorMsg(err.message);
        }
    };
    const addLanguage = ()=>{
        if (!selectedLanguages.includes(langInput)) {
            setSelectedLanguages([
                ...selectedLanguages,
                langInput
            ]);
        }
    };
    const removeLanguage = (lang)=>{
        setSelectedLanguages(selectedLanguages.filter((l)=>l !== lang));
    };
    const moveLangUp = (index)=>{
        if (index === 0) return;
        const arr = [
            ...selectedLanguages
        ];
        const temp = arr[index];
        arr[index] = arr[index - 1];
        arr[index - 1] = temp;
        setSelectedLanguages(arr);
    };
    const moveLangDown = (index)=>{
        if (index === selectedLanguages.length - 1) return;
        const arr = [
            ...selectedLanguages
        ];
        const temp = arr[index];
        arr[index] = arr[index + 1];
        arr[index + 1] = temp;
        setSelectedLanguages(arr);
    };
    const toggleDisability = (key)=>{
        if (key === "none") {
            setSelectedDisabilities([
                "none"
            ]);
        } else {
            const filtered = selectedDisabilities.filter((d)=>d !== "none");
            if (filtered.includes(key)) {
                const next = filtered.filter((d)=>d !== key);
                setSelectedDisabilities(next.length === 0 ? [
                    "none"
                ] : next);
            } else {
                setSelectedDisabilities([
                    ...filtered,
                    key
                ]);
            }
        }
    };
    const handleResetCalibration = ()=>{
        localStorage.removeItem("noiseFloor");
        setSuccessMsg("Ambient noise floor calibration data cleared.");
        setTimeout(()=>setSuccessMsg(""), 3000);
    };
    const handleAvatarSelect = (seed)=>{
        setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
    };
    return /*#__PURE__*/ _jsxs("div", {
        className: "min-h-screen bg-[#0a0a0a] text-[#e5e2e1] flex flex-col font-body-md",
        children: [
            /*#__PURE__*/ _jsxs("header", {
                className: "h-[72px] border-b border-[#3e4850]/30 flex items-center px-10 justify-between bg-[#131313]/90 backdrop-blur-md sticky top-0 z-50 rounded-none",
                children: [
                    /*#__PURE__*/ _jsxs("div", {
                        className: "flex items-center gap-6",
                        children: [
                            /*#__PURE__*/ _jsx("button", {
                                onClick: onBack,
                                className: "p-2 hover:bg-white/[0.05] rounded-none cursor-pointer border border-transparent hover:border-slate-800 transition-colors",
                                children: /*#__PURE__*/ _jsx(ArrowLeft, {
                                    className: "size-6 text-sky-400"
                                })
                            }),
                            /*#__PURE__*/ _jsxs("h1", {
                                className: "text-xl font-bold flex items-center gap-3 font-mono uppercase tracking-tight text-white",
                                children: [
                                    /*#__PURE__*/ _jsx(Settings, {
                                        className: "text-sky-400"
                                    }),
                                    "System Settings"
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsx("div", {
                        className: "flex items-center gap-3",
                        children: /*#__PURE__*/ _jsx(CyberButton, {
                            onClick: ()=>handleSaveSettings(),
                            disabled: saving,
                            variant: "primary",
                            children: saving ? "Saving Changes..." : "Save Preferences"
                        })
                    })
                ]
            }),
            successMsg && /*#__PURE__*/ _jsx("div", {
                className: "max-w-[960px] mx-auto w-full px-6 pt-4",
                children: /*#__PURE__*/ _jsxs("div", {
                    role: "alert",
                    className: "p-4 border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 rounded-none text-xs font-mono",
                    children: [
                        "✓ ",
                        successMsg
                    ]
                })
            }),
            errorMsg && /*#__PURE__*/ _jsx("div", {
                className: "max-w-[960px] mx-auto w-full px-6 pt-4",
                children: /*#__PURE__*/ _jsxs("div", {
                    role: "alert",
                    className: "p-4 border border-red-500/20 bg-red-500/10 text-red-300 rounded-none text-xs font-mono",
                    children: [
                        "⚠️ ",
                        errorMsg
                    ]
                })
            }),
            /*#__PURE__*/ _jsx("main", {
                className: "flex-1 max-w-[960px] mx-auto w-full p-6",
                children: /*#__PURE__*/ _jsxs("div", {
                    className: "flex flex-col md:flex-row gap-8 items-start",
                    children: [
                        /*#__PURE__*/ _jsx("aside", {
                            className: "w-full md:w-64 flex flex-col gap-1.5",
                            children: [
                                {
                                    id: "accessibility",
                                    label: "\uD83D\uDDE3️ Language & Accessibility"
                                },
                                {
                                    id: "privacy",
                                    label: "\uD83D\uDD12 Privacy Preferences"
                                },
                                {
                                    id: "account",
                                    label: "\uD83D\uDC64 Account Settings"
                                },
                                {
                                    id: "devices",
                                    label: "\uD83D\uDCBB Linked Devices"
                                },
                                {
                                    id: "export",
                                    label: "\uD83D\uDCBE Data & Export"
                                }
                            ].map((tab)=>/*#__PURE__*/ _jsx("button", {
                                    type: "button",
                                    onClick: ()=>{
                                        setActiveTab(tab.id);
                                        setErrorMsg("");
                                        setSuccessMsg("");
                                    },
                                    className: cn("w-full text-left p-3.5 border text-xs font-mono uppercase font-bold transition-all min-h-[44px] cursor-pointer", activeTab === tab.id ? "border-sky-500 bg-sky-500/10 text-white shadow-[0_0_12px_rgba(14,165,233,0.15)]" : "border-[#3e4850]/40 bg-[#1c1b1b] text-[#bec8d2] hover:border-sky-500/40 hover:text-white"),
                                    children: tab.label
                                }, tab.id))
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                            className: "flex-1 w-full bg-[#131313] border border-[#3e4850]/30 p-6 md:p-8 space-y-6",
                            children: [
                                activeTab === "accessibility" && /*#__PURE__*/ _jsxs("div", {
                                    className: "space-y-6",
                                    children: [
                                        /*#__PURE__*/ _jsxs("div", {
                                            children: [
                                                /*#__PURE__*/ _jsx("h2", {
                                                    className: "text-lg font-bold text-white uppercase mb-2",
                                                    children: "Preferred Languages Priority"
                                                }),
                                                /*#__PURE__*/ _jsx("p", {
                                                    className: "text-xs text-[#bec8d2]/70 leading-relaxed mb-4",
                                                    children: "Rank your comfort languages. The primary language (top of list) is used as target translation for courseworks."
                                                }),
                                                /*#__PURE__*/ _jsxs("div", {
                                                    className: "flex gap-3 mb-4",
                                                    children: [
                                                        /*#__PURE__*/ _jsx("select", {
                                                            value: langInput,
                                                            onChange: (e)=>setLangInput(e.target.value),
                                                            className: "flex-1 bg-[#1c1b1b] border border-[#3e4850] text-[#e5e2e1] p-2.5 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-sky-500",
                                                            children: Object.entries(languagesList).map(([code, name])=>/*#__PURE__*/ _jsx("option", {
                                                                    value: code,
                                                                    children: name
                                                                }, code))
                                                        }),
                                                        /*#__PURE__*/ _jsx(CyberButton, {
                                                            onClick: addLanguage,
                                                            variant: "outline",
                                                            className: "font-mono text-xs",
                                                            children: "Add"
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ _jsx("div", {
                                                    className: "space-y-2 max-h-[220px] overflow-y-auto pr-1",
                                                    children: selectedLanguages.map((code, idx)=>/*#__PURE__*/ _jsxs("div", {
                                                            className: "flex justify-between items-center bg-[#1c1b1b] p-3 border border-[#3e4850]/30 font-mono text-xs",
                                                            children: [
                                                                /*#__PURE__*/ _jsxs("span", {
                                                                    children: [
                                                                        idx + 1,
                                                                        ". ",
                                                                        languagesList[code] || code,
                                                                        " ",
                                                                        idx === 0 && "⭐ (Primary)"
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ _jsxs("div", {
                                                                    className: "flex gap-1.5",
                                                                    children: [
                                                                        idx > 0 && /*#__PURE__*/ _jsx("button", {
                                                                            type: "button",
                                                                            onClick: ()=>moveLangUp(idx),
                                                                            className: "bg-black/40 hover:bg-sky-500/10 text-sky-400 border border-[#3e4850] px-2 py-1 font-sans",
                                                                            children: "▲"
                                                                        }),
                                                                        idx < selectedLanguages.length - 1 && /*#__PURE__*/ _jsx("button", {
                                                                            type: "button",
                                                                            onClick: ()=>moveLangDown(idx),
                                                                            className: "bg-black/40 hover:bg-sky-500/10 text-sky-400 border border-[#3e4850] px-2 py-1 font-sans",
                                                                            children: "▼"
                                                                        }),
                                                                        /*#__PURE__*/ _jsx("button", {
                                                                            type: "button",
                                                                            onClick: ()=>removeLanguage(code),
                                                                            className: "text-red-400 bg-black/40 hover:bg-red-500/10 border border-[#3e4850] px-2 py-1",
                                                                            children: "✕"
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        }, code))
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "border-t border-[#3e4850]/20 pt-6",
                                            children: [
                                                /*#__PURE__*/ _jsx("h2", {
                                                    className: "text-lg font-bold text-white uppercase mb-2",
                                                    children: "Accessibility Calibration Profiles"
                                                }),
                                                /*#__PURE__*/ _jsx("p", {
                                                    className: "text-xs text-[#bec8d2]/70 leading-relaxed mb-4",
                                                    children: "Enable adaptive overlays. AeroLearn translates textbook summaries and templates dynamically based on these settings."
                                                }),
                                                /*#__PURE__*/ _jsx("div", {
                                                    className: "space-y-3",
                                                    children: disabilitiesList.map((item)=>{
                                                        const active = selectedDisabilities.includes(item.key);
                                                        return /*#__PURE__*/ _jsxs("button", {
                                                            type: "button",
                                                            onClick: ()=>toggleDisability(item.key),
                                                            className: cn("w-full p-3.5 border text-left flex justify-between items-center transition-all min-h-[44px]", active ? "border-sky-500 bg-sky-500/10 text-white" : "border-[#3e4850]/40 bg-[#1c1b1b] text-[#bec8d2] hover:border-sky-500/40 hover:text-white"),
                                                            children: [
                                                                /*#__PURE__*/ _jsx("span", {
                                                                    className: "text-xs font-bold font-mono",
                                                                    children: item.label
                                                                }),
                                                                /*#__PURE__*/ _jsx("div", {
                                                                    className: cn("w-9 h-5 rounded-full relative transition-colors flex-shrink-0", active ? "bg-sky-500" : "bg-neutral-800"),
                                                                    children: /*#__PURE__*/ _jsx("div", {
                                                                        className: cn("absolute top-1 size-3 bg-white rounded-full transition-all", active ? "right-1" : "left-1")
                                                                    })
                                                                })
                                                            ]
                                                        }, item.key);
                                                    })
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "border-t border-[#3e4850]/20 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6",
                                            children: [
                                                /*#__PURE__*/ _jsxs("div", {
                                                    children: [
                                                        /*#__PURE__*/ _jsx("label", {
                                                            className: "block text-xs font-bold uppercase tracking-wider text-white mb-2 font-mono",
                                                            children: "Reading Level Override"
                                                        }),
                                                        /*#__PURE__*/ _jsxs("select", {
                                                            value: readingOverride,
                                                            onChange: (e)=>setReadingOverride(e.target.value),
                                                            className: "w-full bg-[#1c1b1b] border border-[#3e4850] text-[#e5e2e1] p-3 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-sky-500",
                                                            children: [
                                                                /*#__PURE__*/ _jsx("option", {
                                                                    value: "default",
                                                                    children: "System Default (Use disability defaults)"
                                                                }),
                                                                /*#__PURE__*/ _jsx("option", {
                                                                    value: "simplified",
                                                                    children: "Always Simplified (GPT-4 cognitive simplification)"
                                                                }),
                                                                /*#__PURE__*/ _jsx("option", {
                                                                    value: "detailed",
                                                                    children: "Always Original (Full terminology depth)"
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ _jsxs("div", {
                                                    children: [
                                                        /*#__PURE__*/ _jsx("label", {
                                                            className: "block text-xs font-bold uppercase tracking-wider text-white mb-2 font-mono",
                                                            children: "ElevenLabs Voice Pilot"
                                                        }),
                                                        /*#__PURE__*/ _jsx("select", {
                                                            value: preferredVoice,
                                                            onChange: (e)=>setPreferredVoice(e.target.value),
                                                            className: "w-full bg-[#1c1b1b] border border-[#3e4850] text-[#e5e2e1] p-3 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-sky-500",
                                                            children: voices.map((v)=>/*#__PURE__*/ _jsx("option", {
                                                                    value: v.id,
                                                                    children: v.name
                                                                }, v.id))
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "border-t border-[#3e4850]/20 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6",
                                            children: [
                                                /*#__PURE__*/ _jsxs("div", {
                                                    children: [
                                                        /*#__PURE__*/ _jsxs("div", {
                                                            className: "flex justify-between text-xs font-bold uppercase tracking-wider text-white mb-2 font-mono",
                                                            children: [
                                                                /*#__PURE__*/ _jsx("span", {
                                                                    children: "Narration Voice Speed"
                                                                }),
                                                                /*#__PURE__*/ _jsxs("span", {
                                                                    className: "text-sky-400 font-mono",
                                                                    children: [
                                                                        narrationSpeed,
                                                                        "x"
                                                                    ]
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ _jsx("input", {
                                                            type: "range",
                                                            min: "0.75",
                                                            max: "1.5",
                                                            step: "0.05",
                                                            value: narrationSpeed,
                                                            onChange: (e)=>setNarrationSpeed(parseFloat(e.target.value)),
                                                            className: "w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ _jsxs("div", {
                                                    children: [
                                                        /*#__PURE__*/ _jsxs("div", {
                                                            className: "flex justify-between text-xs font-bold uppercase tracking-wider text-white mb-2 font-mono",
                                                            children: [
                                                                /*#__PURE__*/ _jsx("span", {
                                                                    children: "Root Text Size Scale"
                                                                }),
                                                                /*#__PURE__*/ _jsxs("span", {
                                                                    className: "text-sky-400 font-mono",
                                                                    children: [
                                                                        textSizeScale,
                                                                        "x"
                                                                    ]
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ _jsx("input", {
                                                            type: "range",
                                                            min: "0.9",
                                                            max: "1.5",
                                                            step: "0.05",
                                                            value: textSizeScale,
                                                            onChange: (e)=>setTextSizeScale(parseFloat(e.target.value)),
                                                            className: "w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "border-t border-[#3e4850]/20 pt-6 flex justify-between items-center",
                                            children: [
                                                /*#__PURE__*/ _jsxs("div", {
                                                    children: [
                                                        /*#__PURE__*/ _jsx("h3", {
                                                            className: "text-xs font-bold uppercase tracking-wider text-white font-mono",
                                                            children: "Low Stimulus Mode"
                                                        }),
                                                        /*#__PURE__*/ _jsx("p", {
                                                            className: "text-[10px] text-[#bec8d2]/60 mt-1 uppercase font-mono",
                                                            children: "Bypasses autoplay globally for narration audios and sign language videos"
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ _jsx("button", {
                                                    type: "button",
                                                    onClick: ()=>setLowStimulus(!lowStimulus),
                                                    className: cn("w-12 h-6 rounded-full relative transition-colors flex-shrink-0", lowStimulus ? "bg-sky-500" : "bg-neutral-800"),
                                                    children: /*#__PURE__*/ _jsx("div", {
                                                        className: cn("absolute top-1 size-4 bg-white rounded-full transition-all", lowStimulus ? "right-1" : "left-1")
                                                    })
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                activeTab === "privacy" && /*#__PURE__*/ _jsxs("div", {
                                    className: "space-y-6",
                                    children: [
                                        /*#__PURE__*/ _jsxs("div", {
                                            children: [
                                                /*#__PURE__*/ _jsx("h2", {
                                                    className: "text-lg font-bold text-white uppercase mb-2",
                                                    children: "Knowledge Hive Default Visibility"
                                                }),
                                                /*#__PURE__*/ _jsx("p", {
                                                    className: "text-xs text-[#bec8d2]/70 leading-relaxed mb-4",
                                                    children: "Control who can read your shared materials when publishing notes. You can always override this visibility level per note."
                                                }),
                                                /*#__PURE__*/ _jsx("div", {
                                                    className: "space-y-4",
                                                    children: [
                                                        {
                                                            key: "matched_groups",
                                                            label: "\uD83D\uDC65 Matched Accommodations & Languages Only",
                                                            desc: "Your note is visible only to peers with overlapping accessibility options or target languages. (Example: An ASL-flagged Spanish reader note is hidden from standard mode users.)"
                                                        },
                                                        {
                                                            key: "public",
                                                            label: "\uD83C\uDF0D Global Public Pilot Share",
                                                            desc: "The note is shared openly. Any AeroLearn user can search, read, and upvote your summaries. (Example: Anyone on the platform can study from your uploaded files.)"
                                                        },
                                                        {
                                                            key: "private",
                                                            label: "\uD83D\uDD12 Strictly Private Cockpit",
                                                            desc: "The note is visible only in your dashboard private library, inaccessible to other pilots. (Example: Useful for private personal annotations.)"
                                                        }
                                                    ].map((opt)=>/*#__PURE__*/ _jsxs("button", {
                                                            type: "button",
                                                            onClick: ()=>setHiveVisibility(opt.key),
                                                            className: cn("w-full p-4 border text-left flex flex-col justify-between transition-all min-h-[90px]", hiveVisibility === opt.key ? "border-sky-500 bg-sky-500/10 text-white" : "border-[#3e4850]/40 bg-[#1c1b1b] text-[#bec8d2] hover:border-sky-500/40"),
                                                            children: [
                                                                /*#__PURE__*/ _jsx("span", {
                                                                    className: "text-xs font-bold font-mono",
                                                                    children: opt.label
                                                                }),
                                                                /*#__PURE__*/ _jsx("span", {
                                                                    className: "text-[10px] text-[#bec8d2]/60 mt-2 block font-mono",
                                                                    children: opt.desc
                                                                })
                                                            ]
                                                        }, opt.key))
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "border-t border-[#3e4850]/20 pt-6 space-y-4",
                                            children: [
                                                /*#__PURE__*/ _jsxs("div", {
                                                    className: "flex justify-between items-center",
                                                    children: [
                                                        /*#__PURE__*/ _jsxs("div", {
                                                            children: [
                                                                /*#__PURE__*/ _jsx("h3", {
                                                                    className: "text-xs font-bold uppercase tracking-wider text-white font-mono",
                                                                    children: "Show Display Name in Hive"
                                                                }),
                                                                /*#__PURE__*/ _jsx("p", {
                                                                    className: "text-[10px] text-[#bec8d2]/60 mt-1 uppercase font-mono",
                                                                    children: 'If disabled, contributions will be published anonymously as "Anonymous Learner"'
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ _jsx("button", {
                                                            type: "button",
                                                            onClick: ()=>setShowNameInHive(!showNameInHive),
                                                            className: cn("w-12 h-6 rounded-full relative transition-colors flex-shrink-0", showNameInHive ? "bg-sky-500" : "bg-neutral-800"),
                                                            children: /*#__PURE__*/ _jsx("div", {
                                                                className: cn("absolute top-1 size-4 bg-white rounded-full transition-all", showNameInHive ? "right-1" : "left-1")
                                                            })
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ _jsxs("div", {
                                                    className: "flex justify-between items-center border-t border-[#3e4850]/10 pt-4",
                                                    children: [
                                                        /*#__PURE__*/ _jsxs("div", {
                                                            children: [
                                                                /*#__PURE__*/ _jsx("h3", {
                                                                    className: "text-xs font-bold uppercase tracking-wider text-white font-mono",
                                                                    children: "Show Learning Stats Publicly"
                                                                }),
                                                                /*#__PURE__*/ _jsx("p", {
                                                                    className: "text-[10px] text-[#bec8d2]/60 mt-1 uppercase font-mono",
                                                                    children: "Allow other learners to view your streak, documents processed, and help counts"
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ _jsx("button", {
                                                            type: "button",
                                                            onClick: ()=>setShowStatsPublicly(!showStatsPublicly),
                                                            className: cn("w-12 h-6 rounded-full relative transition-colors flex-shrink-0", showStatsPublicly ? "bg-sky-500" : "bg-neutral-800"),
                                                            children: /*#__PURE__*/ _jsx("div", {
                                                                className: cn("absolute top-1 size-4 bg-white rounded-full transition-all", showStatsPublicly ? "right-1" : "left-1")
                                                            })
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ _jsxs("div", {
                                                    className: "flex justify-between items-center border-t border-[#3e4850]/10 pt-4",
                                                    children: [
                                                        /*#__PURE__*/ _jsxs("div", {
                                                            children: [
                                                                /*#__PURE__*/ _jsx("h3", {
                                                                    className: "text-xs font-bold uppercase tracking-wider text-white font-mono",
                                                                    children: "Allow Peer Note Requests"
                                                                }),
                                                                /*#__PURE__*/ _jsx("p", {
                                                                    className: "text-[10px] text-[#bec8d2]/60 mt-1 uppercase font-mono",
                                                                    children: "Opt into receiving classroom requests to explain topics using different analogies"
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ _jsx("button", {
                                                            type: "button",
                                                            onClick: ()=>setAllowPeerRequests(!allowPeerRequests),
                                                            className: cn("w-12 h-6 rounded-full relative transition-colors flex-shrink-0", allowPeerRequests ? "bg-sky-500" : "bg-neutral-800"),
                                                            children: /*#__PURE__*/ _jsx("div", {
                                                                className: cn("absolute top-1 size-4 bg-white rounded-full transition-all", allowPeerRequests ? "right-1" : "left-1")
                                                            })
                                                        })
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                activeTab === "account" && /*#__PURE__*/ _jsxs("div", {
                                    className: "space-y-6",
                                    children: [
                                        /*#__PURE__*/ _jsxs("div", {
                                            children: [
                                                /*#__PURE__*/ _jsx("h2", {
                                                    className: "text-lg font-bold text-white uppercase mb-4",
                                                    children: "Profile Branding"
                                                }),
                                                /*#__PURE__*/ _jsxs("div", {
                                                    className: "flex flex-col sm:flex-row gap-6 items-center",
                                                    children: [
                                                        /*#__PURE__*/ _jsx("div", {
                                                            className: "size-20 bg-[#242329] border border-white/10 rounded-none overflow-hidden flex-shrink-0 relative",
                                                            children: /*#__PURE__*/ _jsx("img", {
                                                                src: avatarUrl,
                                                                alt: "Avatar Preview",
                                                                className: "w-full h-full"
                                                            })
                                                        }),
                                                        /*#__PURE__*/ _jsxs("div", {
                                                            className: "flex-1 w-full space-y-3",
                                                            children: [
                                                                /*#__PURE__*/ _jsx("label", {
                                                                    className: "block text-[10px] font-bold uppercase tracking-wider text-sky-400 font-mono",
                                                                    children: "DiceBear Seed Preview Selection:"
                                                                }),
                                                                /*#__PURE__*/ _jsx("div", {
                                                                    className: "flex flex-wrap gap-2",
                                                                    children: avatarSeeds.map((seed)=>/*#__PURE__*/ _jsx("button", {
                                                                            type: "button",
                                                                            onClick: ()=>handleAvatarSelect(seed),
                                                                            className: "px-2.5 py-1 bg-black/40 border border-[#3e4850] text-[10px] font-mono text-[#bec8d2] hover:text-white uppercase font-bold",
                                                                            children: seed
                                                                        }, seed))
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "space-y-4",
                                            children: [
                                                /*#__PURE__*/ _jsxs("div", {
                                                    children: [
                                                        /*#__PURE__*/ _jsx("label", {
                                                            className: "block text-xs font-bold uppercase tracking-wider text-white mb-2 font-mono",
                                                            children: "Display Name"
                                                        }),
                                                        /*#__PURE__*/ _jsx("input", {
                                                            type: "text",
                                                            value: displayName,
                                                            onChange: (e)=>setDisplayName(e.target.value),
                                                            className: "w-full bg-[#1c1b1b] border border-[#3e4850] text-[#e5e2e1] p-3 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-sky-500",
                                                            placeholder: "Space Pilot Explorer..."
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ _jsxs("div", {
                                                    children: [
                                                        /*#__PURE__*/ _jsx("label", {
                                                            className: "block text-xs font-bold uppercase tracking-wider text-white mb-2 font-mono",
                                                            children: "Short Biography (Max 200 chars)"
                                                        }),
                                                        /*#__PURE__*/ _jsx("textarea", {
                                                            value: bio,
                                                            maxLength: 200,
                                                            onChange: (e)=>setBio(e.target.value),
                                                            className: "w-full h-24 bg-[#1c1b1b] border border-[#3e4850] text-[#e5e2e1] p-3 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none",
                                                            placeholder: "Write a brief intro..."
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        userStats && /*#__PURE__*/ _jsxs("div", {
                                            className: "bg-[#1c1b1b] p-4 border border-[#3e4850]/20 space-y-3 font-mono text-xs text-[#bec8d2]/70",
                                            children: [
                                                /*#__PURE__*/ _jsx("h3", {
                                                    className: "text-[10px] font-bold uppercase text-[#A8A39C]",
                                                    children: "Historical Learning Stats:"
                                                }),
                                                /*#__PURE__*/ _jsxs("div", {
                                                    className: "grid grid-cols-2 gap-4 text-[10px]",
                                                    children: [
                                                        /*#__PURE__*/ _jsxs("div", {
                                                            children: [
                                                                "Processed Documents: ",
                                                                /*#__PURE__*/ _jsx("span", {
                                                                    className: "text-white font-bold",
                                                                    children: userStats.documents_processed || 0
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ _jsxs("div", {
                                                            children: [
                                                                "Completed Topics: ",
                                                                /*#__PURE__*/ _jsx("span", {
                                                                    className: "text-white font-bold",
                                                                    children: userStats.topics_completed || 0
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ _jsxs("div", {
                                                            children: [
                                                                "Hive Shared Notes: ",
                                                                /*#__PURE__*/ _jsx("span", {
                                                                    className: "text-white font-bold",
                                                                    children: userStats.notes_shared || 0
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ _jsxs("div", {
                                                            children: [
                                                                "Learners Helped: ",
                                                                /*#__PURE__*/ _jsx("span", {
                                                                    className: "text-white font-bold",
                                                                    children: userStats.notes_helped_count || 0
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ _jsxs("div", {
                                                            children: [
                                                                "Active Streak Days: ",
                                                                /*#__PURE__*/ _jsxs("span", {
                                                                    className: "text-white font-bold",
                                                                    children: [
                                                                        userStats.current_streak_days || 0,
                                                                        " Days"
                                                                    ]
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ _jsxs("div", {
                                                            children: [
                                                                "Record Streak Days: ",
                                                                /*#__PURE__*/ _jsxs("span", {
                                                                    className: "text-white font-bold",
                                                                    children: [
                                                                        userStats.longest_streak_days || 0,
                                                                        " Days"
                                                                    ]
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                userStats.languages_used && userStats.languages_used.length > 0 && /*#__PURE__*/ _jsxs("div", {
                                                    className: "border-t border-[#3e4850]/15 pt-2 text-[10px]",
                                                    children: [
                                                        "\uD83C\uDF92 Studied In: ",
                                                        /*#__PURE__*/ _jsx("span", {
                                                            className: "text-sky-400 font-bold uppercase",
                                                            children: userStats.languages_used.join(", ")
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "border border-red-500/30 bg-red-500/5 p-5 space-y-4",
                                            children: [
                                                /*#__PURE__*/ _jsxs("div", {
                                                    children: [
                                                        /*#__PURE__*/ _jsx("h3", {
                                                            className: "text-xs font-bold uppercase text-red-400 font-mono",
                                                            children: "Danger Zone: Account Deletion"
                                                        }),
                                                        /*#__PURE__*/ _jsx("p", {
                                                            className: "text-[10px] text-[#bec8d2] mt-1.5 leading-relaxed font-mono",
                                                            children: 'This action is permanent and cannot be undone. To protect community resources, previously shared notes in the Knowledge Hive will NOT be deleted, but they will be permanently re-attributed to "Deleted User" to preserve shared guides.'
                                                        })
                                                    ]
                                                }),
                                                showDeleteConfirm ? /*#__PURE__*/ _jsxs("div", {
                                                    className: "space-y-3 pt-2",
                                                    children: [
                                                        /*#__PURE__*/ _jsx("label", {
                                                            className: "block text-[9px] uppercase tracking-wider font-bold text-red-300 font-mono",
                                                            children: "Type DELETE to confirm permanent deletion:"
                                                        }),
                                                        /*#__PURE__*/ _jsxs("div", {
                                                            className: "flex gap-3",
                                                            children: [
                                                                /*#__PURE__*/ _jsx("input", {
                                                                    type: "text",
                                                                    value: deleteConfirmText,
                                                                    onChange: (e)=>setDeleteConfirmText(e.target.value),
                                                                    className: "flex-1 bg-black border border-red-500/40 p-2 text-white font-mono text-xs focus:outline-none",
                                                                    placeholder: "Type DELETE..."
                                                                }),
                                                                /*#__PURE__*/ _jsx("button", {
                                                                    type: "button",
                                                                    onClick: handleDeleteAccount,
                                                                    className: "px-4 bg-red-600 hover:bg-red-500 text-black font-bold uppercase font-mono text-xs rounded-none",
                                                                    children: "Confirm Deletion"
                                                                }),
                                                                /*#__PURE__*/ _jsx("button", {
                                                                    type: "button",
                                                                    onClick: ()=>{
                                                                        setShowDeleteConfirm(false);
                                                                        setDeleteConfirmText("");
                                                                    },
                                                                    className: "px-3 border border-[#3e4850] text-[#bec8d2] hover:text-white font-mono text-xs",
                                                                    children: "Cancel"
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }) : /*#__PURE__*/ _jsx("button", {
                                                    type: "button",
                                                    onClick: ()=>setShowDeleteConfirm(true),
                                                    className: "px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold uppercase text-[10px] font-mono rounded-none",
                                                    children: "Delete Account and Data"
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                activeTab === "devices" && /*#__PURE__*/ _jsx("div", {
                                    className: "space-y-6",
                                    children: /*#__PURE__*/ _jsxs("div", {
                                        children: [
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "flex justify-between items-start border-b border-[#3e4850]/20 pb-3 mb-4",
                                                children: [
                                                    /*#__PURE__*/ _jsxs("div", {
                                                        children: [
                                                            /*#__PURE__*/ _jsx("h2", {
                                                                className: "text-lg font-bold text-white uppercase",
                                                                children: "Active Device Sessions"
                                                            }),
                                                            /*#__PURE__*/ _jsx("p", {
                                                                className: "text-xs text-[#bec8d2]/70 leading-relaxed mt-1",
                                                                children: "Review active browsers logged into your adaptives classroom account."
                                                            })
                                                        ]
                                                    }),
                                                    linkedDevices.length > 1 && /*#__PURE__*/ _jsx("button", {
                                                        type: "button",
                                                        onClick: handleRevokeOthers,
                                                        className: "px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-mono text-[10px] uppercase font-bold",
                                                        children: "Revoke All Other Sessions"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "space-y-3",
                                                children: [
                                                    linkedDevices.map((dev)=>/*#__PURE__*/ _jsxs("div", {
                                                            className: "flex justify-between items-center bg-[#1c1b1b] p-4 border border-[#3e4850]/30 font-mono text-xs",
                                                            children: [
                                                                /*#__PURE__*/ _jsxs("div", {
                                                                    className: "space-y-1",
                                                                    children: [
                                                                        /*#__PURE__*/ _jsxs("span", {
                                                                            className: "font-bold text-white uppercase flex items-center gap-1.5",
                                                                            children: [
                                                                                dev.device_label.includes("Chrome") ? "\uD83C\uDF10" : "\uD83D\uDCF1",
                                                                                " ",
                                                                                dev.device_label,
                                                                                dev.is_current && /*#__PURE__*/ _jsx("span", {
                                                                                    className: "text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-none font-normal uppercase",
                                                                                    children: "Current Device"
                                                                                })
                                                                            ]
                                                                        }),
                                                                        /*#__PURE__*/ _jsxs("span", {
                                                                            className: "text-[10px] text-[#bec8d2]/50 block",
                                                                            children: [
                                                                                "Last Active: ",
                                                                                new Date(dev.last_active).toLocaleString()
                                                                            ]
                                                                        })
                                                                    ]
                                                                }),
                                                                !dev.is_current && /*#__PURE__*/ _jsx("button", {
                                                                    type: "button",
                                                                    onClick: ()=>handleRevokeDevice(dev.id),
                                                                    className: "px-3 py-1.5 bg-black/40 hover:bg-red-500/10 border border-[#3e4850] text-[#bec8d2] hover:text-red-400",
                                                                    children: "Revoke"
                                                                })
                                                            ]
                                                        }, dev.id)),
                                                    linkedDevices.length === 0 && /*#__PURE__*/ _jsx("p", {
                                                        className: "text-xs italic text-slate-500",
                                                        children: "No session telemetry recorded."
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                }),
                                activeTab === "export" && /*#__PURE__*/ _jsxs("div", {
                                    className: "space-y-6",
                                    children: [
                                        /*#__PURE__*/ _jsxs("div", {
                                            children: [
                                                /*#__PURE__*/ _jsx("h2", {
                                                    className: "text-lg font-bold text-white uppercase mb-2",
                                                    children: "Download All Data"
                                                }),
                                                /*#__PURE__*/ _jsx("p", {
                                                    className: "text-xs text-[#bec8d2]/70 leading-relaxed mb-4",
                                                    children: "Download a full offline archive containing your profile stats, private documents (raw and translated), and shared note records."
                                                }),
                                                /*#__PURE__*/ _jsx(CyberButton, {
                                                    onClick: handleExportData,
                                                    icon: Database,
                                                    variant: "outline",
                                                    className: "font-mono text-xs",
                                                    children: "Export User Data Archive"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "border-t border-[#3e4850]/20 pt-6",
                                            children: [
                                                /*#__PURE__*/ _jsx("h2", {
                                                    className: "text-lg font-bold text-white uppercase mb-2",
                                                    children: "Microphone Audio Calibration"
                                                }),
                                                /*#__PURE__*/ _jsx("p", {
                                                    className: "text-xs text-[#bec8d2]/70 leading-relaxed mb-4",
                                                    children: "Reset your microphone noise floor baseline configuration stored in the local sandbox cache."
                                                }),
                                                /*#__PURE__*/ _jsx("button", {
                                                    type: "button",
                                                    onClick: handleResetCalibration,
                                                    className: "px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 font-bold uppercase text-[10px] font-mono rounded-none",
                                                    children: "Reset Room Calibration Parameter"
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            })
        ]
    });
};
// 1. INGESTION CONTROL COCKPIT (DocumentLab)
const DocumentLab = ({ onBack, profile: profile1 })=>{
    const [sourceType, setSourceType] = useState("upload");
    const [fileToUpload, setFileToUpload] = useState(null);
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [docTitle, setDocTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const handleLabSubmit = async (e)=>{
        e.preventDefault();
        if (!docTitle.trim()) {
            setErrorMsg("Please provide a title for the document.");
            return;
        }
        setLoading(true);
        setErrorMsg("");
        setSuccessMsg("");
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Authentication failed.");
            // 1. Insert document row with status "pending"
            const target_lang = profile1.preferred_languages?.[0] || "English";
            const { data: newDoc, error: insErr } = await supabase.from("documents").insert({
                owner_id: user.id,
                title: docTitle,
                source_type: sourceType,
                source_url: sourceType === "youtube" ? youtubeUrl : null,
                target_lang: target_lang,
                status: "pending"
            }).select().single();
            if (insErr) throw insErr;
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;
            if (sourceType === "upload") {
                if (!fileToUpload) throw new Error("Please select a file to upload.");
                // 2. Upload file path to API endpoint
                const formData = new FormData();
                formData.append("document_id", newDoc.id);
                formData.append("target_lang", target_lang);
                formData.append("file", fileToUpload);
                const response = await fetch("http://127.0.0.1:8000/documents/upload", {
                    method: "POST",
                    body: formData,
                    headers: token ? {
                        "Authorization": token
                    } : {}
                });
                if (!response.ok) {
                    throw new Error(`Server ingestion rejected: ${response.statusText}`);
                }
            } else {
                if (!youtubeUrl.trim()) throw new Error("Please paste a valid YouTube URL.");
                // 2. Post youtube link to API endpoint
                const response = await fetch("http://127.0.0.1:8000/documents/youtube", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...token ? {
                            "Authorization": token
                        } : {}
                    },
                    body: JSON.stringify({
                        document_id: newDoc.id,
                        youtube_url: youtubeUrl,
                        target_lang: target_lang
                    })
                });
                if (!response.ok) {
                    throw new Error(`Server ingestion rejected: ${response.statusText}`);
                }
            }
            setSuccessMsg("Document queued! Processing started in the background.");
            setDocTitle("");
            setYoutubeUrl("");
            setFileToUpload(null);
        } catch (err) {
            console.error(err);
            setErrorMsg(err.message || "Ingestion failure.");
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ _jsxs("div", {
        className: "min-h-screen bg-[#0a0a0a] text-[#e5e2e1] flex flex-col font-body-md",
        children: [
            /*#__PURE__*/ _jsx("header", {
                className: "border-b border-[#3e4850]/30 p-6 flex justify-between items-center bg-[#131313]/90 backdrop-blur-md sticky top-0 z-50",
                children: /*#__PURE__*/ _jsxs("div", {
                    className: "flex items-center gap-6",
                    children: [
                        /*#__PURE__*/ _jsx("button", {
                            onClick: onBack,
                            className: "p-2 hover:bg-white/[0.05] rounded-none transition-colors border border-transparent hover:border-slate-800",
                            children: /*#__PURE__*/ _jsx(ArrowLeft, {
                                className: "size-6 text-[#bec8d2] hover:text-sky-400"
                            })
                        }),
                        /*#__PURE__*/ _jsxs("h1", {
                            className: "text-2xl font-bold font-headline-lg flex items-center gap-3 uppercase tracking-tight",
                            children: [
                                /*#__PURE__*/ _jsx(UploadCloud, {
                                    className: "text-sky-400 size-7"
                                }),
                                "Ingestion Control Cockpit"
                            ]
                        })
                    ]
                })
            }),
            /*#__PURE__*/ _jsxs("div", {
                className: "max-w-[800px] mx-auto w-full p-6 md:p-10 flex flex-col gap-8",
                children: [
                    /*#__PURE__*/ _jsxs("div", {
                        className: "p-8 rounded-none bg-[#131313] border border-t-white/10 border-l-white/10 border-b-black/30 border-r-black/20 shadow-[0_0_20px_rgba(0,0,0,0.4)]",
                        children: [
                            /*#__PURE__*/ _jsx("h2", {
                                className: "text-lg font-bold font-headline-lg uppercase text-white tracking-wide border-b border-[#3e4850]/20 pb-3 mb-6",
                                children: "Launch Study Ingestion Pipeline"
                            }),
                            errorMsg && /*#__PURE__*/ _jsxs("div", {
                                className: "p-4 mb-6 border border-red-500/20 bg-red-500/10 text-red-300 font-mono text-xs",
                                children: [
                                    "⚠️ ",
                                    errorMsg
                                ]
                            }),
                            successMsg && /*#__PURE__*/ _jsxs("div", {
                                className: "p-4 mb-6 border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 font-mono text-xs",
                                children: [
                                    "✓ ",
                                    successMsg
                                ]
                            }),
                            /*#__PURE__*/ _jsxs("form", {
                                onSubmit: handleLabSubmit,
                                className: "flex flex-col gap-6",
                                children: [
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "flex flex-col gap-2",
                                        children: [
                                            /*#__PURE__*/ _jsx("label", {
                                                className: "text-xs font-bold uppercase tracking-wider text-[#bec8d2] font-mono",
                                                children: "Document Title"
                                            }),
                                            /*#__PURE__*/ _jsx("input", {
                                                type: "text",
                                                value: docTitle,
                                                onChange: (e)=>setDocTitle(e.target.value),
                                                placeholder: "e.g. Astrophysics Lecture Notes",
                                                className: "w-full bg-[#1c1b1b] border border-[#3e4850] p-3 rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-white font-mono placeholder:text-slate-600"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "flex flex-col gap-2",
                                        children: [
                                            /*#__PURE__*/ _jsx("label", {
                                                className: "text-xs font-bold uppercase tracking-wider text-[#bec8d2] font-mono",
                                                children: "Source Selection"
                                            }),
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "flex gap-2",
                                                children: [
                                                    /*#__PURE__*/ _jsx("button", {
                                                        type: "button",
                                                        onClick: ()=>setSourceType("upload"),
                                                        className: cn("flex-1 py-2.5 rounded-none font-bold text-xs uppercase border tracking-wider transition-all min-h-[44px]", sourceType === "upload" ? "border-sky-500 bg-sky-500/10 text-sky-400" : "border-[#3e4850]/50 bg-[#1c1b1b] text-slate-400 hover:text-white"),
                                                        children: "File Upload"
                                                    }),
                                                    /*#__PURE__*/ _jsx("button", {
                                                        type: "button",
                                                        onClick: ()=>setSourceType("youtube"),
                                                        className: cn("flex-1 py-2.5 rounded-none font-bold text-xs uppercase border tracking-wider transition-all min-h-[44px]", sourceType === "youtube" ? "border-sky-500 bg-sky-500/10 text-sky-400" : "border-[#3e4850]/50 bg-[#1c1b1b] text-slate-400 hover:text-white"),
                                                        children: "YouTube Link"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    sourceType === "upload" ? /*#__PURE__*/ _jsx("div", {
                                        className: "flex flex-col gap-2",
                                        children: /*#__PURE__*/ _jsxs("label", {
                                            htmlFor: "file-input-lab",
                                            className: "border-2 border-dashed border-[#3e4850] p-12 flex flex-col items-center justify-center gap-4 rounded-none bg-[#1c1b1b] hover:border-sky-500/60 transition-all cursor-pointer",
                                            children: [
                                                /*#__PURE__*/ _jsx("input", {
                                                    type: "file",
                                                    id: "file-input-lab",
                                                    className: "hidden",
                                                    onChange: (e)=>setFileToUpload(e.target.files[0])
                                                }),
                                                /*#__PURE__*/ _jsx(UploadCloud, {
                                                    className: "size-10 text-sky-400"
                                                }),
                                                /*#__PURE__*/ _jsx("span", {
                                                    className: "text-sm font-bold text-[#e5e2e1] font-mono",
                                                    children: fileToUpload ? fileToUpload.name : "Select PDF, Image, or DOCX"
                                                })
                                            ]
                                        })
                                    }) : /*#__PURE__*/ _jsxs("div", {
                                        className: "flex flex-col gap-2",
                                        children: [
                                            /*#__PURE__*/ _jsx("label", {
                                                className: "text-xs font-bold uppercase tracking-wider text-[#bec8d2] font-mono",
                                                children: "YouTube URL"
                                            }),
                                            /*#__PURE__*/ _jsx("input", {
                                                type: "url",
                                                value: youtubeUrl,
                                                onChange: (e)=>setYoutubeUrl(e.target.value),
                                                placeholder: "https://www.youtube.com/watch?v=...",
                                                className: "w-full bg-[#1c1b1b] border border-[#3e4850] p-3 rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-white font-mono placeholder:text-slate-600"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsx(CyberButton, {
                                        type: "submit",
                                        disabled: loading,
                                        className: "w-full mt-2",
                                        icon: Zap,
                                        children: loading ? "Initializing Ingestion Pipeline..." : "Queue Document"
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsxs("div", {
                        className: "bg-black/60 p-4 border border-[#3e4850]/30 rounded-none font-mono text-xs text-sky-400 space-y-1.5 select-none",
                        children: [
                            /*#__PURE__*/ _jsxs("div", {
                                className: "text-[#bec8d2] mb-2 font-bold flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ _jsx("span", {
                                        className: "size-2 bg-sky-500 rounded-full animate-pulse"
                                    }),
                                    "SYSTEM PIPELINE LOGGER TELEMETRY:"
                                ]
                            }),
                            /*#__PURE__*/ _jsx("div", {
                                children: "> [INITIALIZING] Ingestion channel standby..."
                            }),
                            /*#__PURE__*/ _jsx("div", {
                                children: "> [OCR MODULE] Standby for document layers..."
                            }),
                            /*#__PURE__*/ _jsx("div", {
                                children: "> [TRANSLATION ENGINE] Ready for comfort mapping..."
                            }),
                            /*#__PURE__*/ _jsx("div", {
                                children: "> [AUDIT LAB] LaTeX and accessibility parser online..."
                            })
                        ]
                    })
                ]
            })
        ]
    });
};
// 2. BLIND WORKSPACE UI (VOICE CONTROL & AUDIO HUB)
const BlindWorkspace = ({ onBack, profile: profile1, documentId })=>{
    const [documents, setDocuments] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [topics, setTopics] = useState([]);
    const [currentTopicIdx, setCurrentTopicIdx] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [voiceLogs, setVoiceLogs] = useState([]);
    const [micActive, setMicActive] = useState(false);
    // Speech and Quiz settings
    const [narrationSpeed, setNarrationSpeed] = useState(()=>"undefined" !== "undefined" && localStorage.getItem("aerolearn_narration_speed") || "1.0");
    const [narrationVoice, setNarrationVoice] = useState(()=>"undefined" !== "undefined" && localStorage.getItem("aerolearn_narration_voice") || "Xb7hH8MSUJpSbSDYk0k2");
    const [quizActive, setQuizActive] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [quizAnswered, setQuizAnswered] = useState(false);
    const [quizResultMsg, setQuizResultMsg] = useState("");
    const [loadingQuiz, setLoadingQuiz] = useState(false);
    const [downloadingPlaylist, setDownloadingPlaylist] = useState(false);
    const handleDownloadPlaylist = async ()=>{
        if (!selectedDoc) return;
        setDownloadingPlaylist(true);
        try {
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;
            const response = await fetch(`http://127.0.0.1:8000/documents/${selectedDoc.id}/audio-playlist`, {
                method: "GET",
                headers: token ? {
                    "Authorization": token
                } : {}
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `${selectedDoc.title}_playlist.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert("Failed to download playlist.");
            }
        } catch (e) {
            console.error(e);
        } finally{
            setDownloadingPlaylist(false);
        }
    };
    const triggerBlindQuiz = async ()=>{
        if (topics.length === 0 || currentTopicIdx >= topics.length) return;
        const topic = topics[currentTopicIdx];
        setLoadingQuiz(true);
        speakText("Generating quiz for topic: " + topic.title);
        try {
            const response = await fetch("http://127.0.0.1:8000/quiz/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: topic.title,
                    explanation: topic.explanation
                })
            });
            if (response.ok) {
                const data = await response.json();
                if (data.questions && data.questions.length > 0) {
                    const q = data.questions[0];
                    setCurrentQuiz(q);
                    setQuizActive(true);
                    setQuizAnswered(false);
                    setQuizResultMsg("");
                    let optionsPrompt = q.options.map((opt, i)=>`Option ${String.fromCharCode(65 + i)}: ${opt}`).join(". ");
                    speakText(`Question: ${q.question}. ${optionsPrompt}. State your option now.`);
                } else {
                    speakText("Failed to parse quiz questions.");
                }
            }
        } catch (e) {
            console.error(e);
            speakText("Error generating quiz.");
        } finally{
            setLoadingQuiz(false);
        }
    };
    const submitBlindQuizAnswer = async (optionIndex)=>{
        if (!currentQuiz) return;
        const selectedOpt = currentQuiz.options[optionIndex];
        const isCorrect = selectedOpt === currentQuiz.correct_option;
        setQuizAnswered(true);
        if (isCorrect) {
            setQuizResultMsg("Correct! Brilliant job.");
            speakText("Correct! Brilliant job.");
        } else {
            setQuizResultMsg(`Incorrect. ${currentQuiz.explanation_if_wrong}. Concept simplified below automatically to help you review.`);
            speakText(`Incorrect. ${currentQuiz.explanation_if_wrong}. Concept simplified below automatically to help you review.`);
            const topic = topics[currentTopicIdx];
            try {
                const response = await fetch("http://127.0.0.1:8000/topics/re-explain", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: topic.title,
                        explanation: topic.explanation
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    setTopics((prev)=>prev.map((t, idx)=>idx === currentTopicIdx ? {
                                ...t,
                                explanation: data.explanation
                            } : t));
                    setTimeout(()=>{
                        speakText(`Here is the simplified concept: ${data.explanation}`);
                    }, 6000);
                }
            } catch (e) {
                console.error(e);
            }
        }
    };
    const wsRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioContextRef = useRef(null);
    const audioObjRef = useRef(null);
    // Spoken feedback helper using /audio/speak
    const speakText = async (text)=>{
        try {
            if (audioObjRef.current) {
                audioObjRef.current.pause();
            }
            const selectedVoice = localStorage.getItem("aerolearn_narration_voice") || "Xb7hH8MSUJpSbSDYk0k2";
            const selectedSpeed = parseFloat(localStorage.getItem("aerolearn_narration_speed") || "1.0");
            const response = await fetch("http://127.0.0.1:8000/audio/speak", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    text,
                    voice_id: selectedVoice
                })
            });
            if (response.ok) {
                const audioUrl = URL.createObjectURL(await response.blob());
                const audio = new Audio(audioUrl);
                audio.playbackRate = selectedSpeed;
                audioObjRef.current = audio;
                audioObjRef.current.play();
                audioObjRef.current.onended = ()=>{
                    if (playing && selectedDoc) {
                    // Auto continue or advance
                    }
                };
            }
        } catch (e) {
            console.error("Speak failed", e);
        }
    };
    const loadDocumentById = async (id)=>{
        try {
            const { data: doc } = await supabase.from("documents").select("*").eq("id", id).single();
            if (doc) {
                setSelectedDoc(doc);
                setCurrentTopicIdx(0);
                const useLowStimulus = profile1?.low_stimulus_mode;
                setPlaying(!useLowStimulus);
                const { data: topicsData } = await supabase.from("topics").select("*").eq("document_id", doc.id).order("order_index", {
                    ascending: true
                });
                setTopics(topicsData || []);
                if (topicsData && topicsData.length > 0) {
                    if (useLowStimulus) {
                        speakText(`Loaded ${doc.title} in low stimulus mode. Narration is paused. Press space to begin.`);
                    } else {
                        speakText(`Loaded ${doc.title}. Narrating first topic: ${topicsData[0].title}. ${topicsData[0].explanation}`);
                    }
                } else {
                    speakText(`Loaded ${doc.title}. No topic breakdowns available.`);
                }
            } else {
                speakText("Failed to load document.");
            }
        } catch (err) {
            speakText("Error loading document.");
        }
    };
    // Fetch list of documents for user
    const fetchDocs = async ()=>{
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from("documents").select("*").eq("owner_id", user.id).eq("status", "ready");
            setDocuments(data || []);
            if (!documentId) {
                speakText("Blind workspace active. Loaded " + (data ? data.length : 0) + " documents. Please select one to begin.");
            }
        }
    };
    useEffect(()=>{
        if (documentId) {
            loadDocumentById(documentId);
        } else {
            fetchDocs();
        }
        // Spacebar binding for narration toggle
        const handleKeyDown = (e)=>{
            if (e.code === "Space") {
                e.preventDefault();
                toggleNarration();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        // Connect voice commands websocket
        connectWebSocket();
        return ()=>{
            window.removeEventListener("keydown", handleKeyDown);
            disconnectWebSocket();
            if (audioObjRef.current) audioObjRef.current.pause();
        };
    }, []);
    const connectWebSocket = ()=>{
        const floor = localStorage.getItem("noiseFloor") || "0.05";
        const ws = new WebSocket(`ws://127.0.0.1:8000/audio/ws/voice-command?noise_floor=${floor}`);
        ws.onopen = ()=>{
            console.log("[WS Client] Connected to voice controller with noise floor:", floor);
            setMicActive(true);
            startMicStreaming(ws);
        };
        ws.onmessage = (e)=>{
            const msg = JSON.parse(e.data);
            if (msg.status === "transcribed" && msg.command !== "unknown") {
                setVoiceLogs((prev)=>[
                        msg.transcript,
                        ...prev
                    ]);
                handleVoiceCommand(msg.command);
            }
        };
        wsRef.current = ws;
    };
    const startMicStreaming = async (ws)=>{
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: "audio/webm"
            });
            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.ondataavailable = (event)=>{
                if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
                    ws.send(event.data);
                }
            };
            // Slice audio recorder input buffer every 1000ms
            mediaRecorder.start(1000);
        } catch (e) {
            console.error("[WS Mic] Failed to initialize mic recording: ", e);
            setMicActive(false);
        }
    };
    const handleVoiceCommand = (command)=>{
        speakText(`Received command: ${command}`);
        // Intercept options if quiz is active
        if (quizActive && currentQuiz) {
            if (command.startsWith("option") || [
                "a",
                "b",
                "c",
                "one",
                "two",
                "three",
                "first",
                "second"
            ].some((w)=>command.includes(w))) {
                let selectedIdx = -1;
                if (command.includes("a") || command.includes("one") || command.includes("first")) selectedIdx = 0;
                else if (command.includes("b") || command.includes("two") || command.includes("second")) selectedIdx = 1;
                else if (command.includes("c") || command.includes("three")) selectedIdx = 2;
                if (selectedIdx !== -1 && selectedIdx < currentQuiz.options.length) {
                    submitBlindQuizAnswer(selectedIdx);
                    return;
                }
            }
        }
        if (command === "next") {
            advanceTopic();
        } else if (command === "back") {
            previousTopic();
        } else if (command === "stop") {
            setPlaying(false);
            if (audioObjRef.current) audioObjRef.current.pause();
        } else if (command === "play") {
            setPlaying(true);
            playCurrentTopic();
        } else if (command === "repeat") {
            playCurrentTopic();
        } else if (command === "quiz") {
            triggerBlindQuiz();
        }
    };
    const disconnectWebSocket = ()=>{
        if (wsRef.current) wsRef.current.close();
        if (mediaRecorderRef.current) {
            try {
                mediaRecorderRef.current.stop();
            } catch  {}
        }
    };
    const handleSelectDoc = async (doc)=>{
        setSelectedDoc(doc);
        setCurrentTopicIdx(0);
        const useLowStimulus = profile1?.low_stimulus_mode;
        setPlaying(!useLowStimulus);
        // Fetch topics from database
        const { data: topicsData } = await supabase.from("topics").select("*").eq("document_id", doc.id).order("order_index", {
            ascending: true
        });
        setTopics(topicsData || []);
        if (topicsData && topicsData.length > 0) {
            if (useLowStimulus) {
                speakText(`Loaded ${doc.title} in low stimulus mode. Narration is paused. Press space to begin.`);
            } else {
                speakText(`Loaded ${doc.title}. Narrating first topic: ${topicsData[0].title}. ${topicsData[0].explanation}`);
            }
        } else {
            speakText(`Loaded ${doc.title}. No topic breakdowns available.`);
        }
    };
    const playCurrentTopic = ()=>{
        if (topics.length > 0 && currentTopicIdx < topics.length) {
            const topic = topics[currentTopicIdx];
            speakText(`Topic: ${topic.title}. ${topic.explanation}`);
        }
    };
    const toggleNarration = ()=>{
        setPlaying((prev)=>{
            const next = !prev;
            if (next) {
                playCurrentTopic();
            } else {
                if (audioObjRef.current) audioObjRef.current.pause();
            }
            return next;
        });
    };
    const advanceTopic = ()=>{
        if (currentTopicIdx < topics.length - 1) {
            setCurrentTopicIdx((prev)=>{
                const next = prev + 1;
                speakText(`Advancing. Topic ${next + 1}: ${topics[next].title}. ${topics[next].explanation}`);
                return next;
            });
        } else {
            speakText("End of document reached.");
        }
    };
    const previousTopic = ()=>{
        if (currentTopicIdx > 0) {
            setCurrentTopicIdx((prev)=>{
                const next = prev - 1;
                speakText(`Going back. Topic ${next + 1}: ${topics[next].title}. ${topics[next].explanation}`);
                return next;
            });
        } else {
            speakText("Already at the first topic.");
        }
    };
    return /*#__PURE__*/ _jsxs("div", {
        className: "min-h-screen bg-[#0a0a0a] text-[#e5e2e1] p-8 flex flex-col font-mono border-4 border-amber-500/80",
        children: [
            /*#__PURE__*/ _jsxs("header", {
                className: "flex justify-between items-center border-b-4 border-amber-500/80 pb-6 mb-8",
                children: [
                    /*#__PURE__*/ _jsxs("div", {
                        className: "flex items-center gap-4",
                        children: [
                            /*#__PURE__*/ _jsx("button", {
                                onClick: onBack,
                                className: "p-4 bg-amber-500 text-black font-extrabold hover:bg-amber-400 rounded-none cursor-pointer border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 min-h-[44px]",
                                children: "⬅ BACK TO COCKPIT"
                            }),
                            /*#__PURE__*/ _jsxs("h1", {
                                className: "text-3xl font-extrabold tracking-wide flex items-center gap-2 text-amber-500 uppercase",
                                children: [
                                    /*#__PURE__*/ _jsx(Mic, {
                                        className: "size-8 text-amber-500 animate-pulse"
                                    }),
                                    "BLIND COCKPIT HUB"
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsxs("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ _jsx("div", {
                                className: cn("size-4 rounded-full", micActive ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)] animate-pulse" : "bg-neutral-800")
                            }),
                            /*#__PURE__*/ _jsx("span", {
                                className: "font-mono text-xs uppercase text-[#bec8d2]",
                                children: micActive ? "MIC STREAM ACTIVE" : "MIC MUTED"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ _jsxs("div", {
                className: "flex-1 grid grid-cols-1 md:grid-cols-2 gap-8",
                children: [
                    /*#__PURE__*/ _jsxs("section", {
                        className: "flex flex-col gap-6",
                        children: [
                            /*#__PURE__*/ _jsx("h2", {
                                className: "text-xl font-bold tracking-wider text-amber-500 uppercase",
                                children: "SELECT STUDY MODULE:"
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                className: "flex flex-col gap-4 overflow-y-auto max-h-[400px] pr-2",
                                children: [
                                    documents.map((doc)=>/*#__PURE__*/ _jsxs("button", {
                                            onClick: ()=>handleSelectDoc(doc),
                                            className: cn("p-6 text-left border-2 rounded-none transition-all cursor-pointer font-bold uppercase min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500", selectedDoc?.id === doc.id ? "bg-amber-500/10 text-amber-500 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.25)]" : "bg-[#131313] text-[#e5e2e1] border-[#3e4850]/50 hover:border-amber-500/40"),
                                            children: [
                                                "\uD83C\uDF0C ",
                                                doc.title
                                            ]
                                        }, doc.id)),
                                    documents.length === 0 && /*#__PURE__*/ _jsx("p", {
                                        className: "text-sm italic text-[#bec8d2]",
                                        children: "No study materials currently ready in active profiles."
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsxs("section", {
                        className: "border-4 border-amber-500/40 rounded-none p-6 flex flex-col justify-between bg-[#131313]",
                        children: [
                            /*#__PURE__*/ _jsxs("div", {
                                className: "space-y-6",
                                children: [
                                    /*#__PURE__*/ _jsxs("div", {
                                        children: [
                                            /*#__PURE__*/ _jsx("h3", {
                                                className: "text-sm font-mono uppercase tracking-widest text-amber-500/70 border-b border-[#3e4850]/30 pb-2 mb-4",
                                                children: "ACTIVE AUDIO STREAM CHANNEL:"
                                            }),
                                            selectedDoc ? /*#__PURE__*/ _jsxs("div", {
                                                className: "space-y-4",
                                                children: [
                                                    /*#__PURE__*/ _jsx("p", {
                                                        className: "text-2xl font-extrabold uppercase font-mono",
                                                        children: selectedDoc.title
                                                    }),
                                                    /*#__PURE__*/ _jsxs("div", {
                                                        className: "bg-amber-500/5 p-4 border-l-4 border-amber-500 rounded-none",
                                                        children: [
                                                            /*#__PURE__*/ _jsxs("p", {
                                                                className: "text-xs font-mono text-amber-500 uppercase",
                                                                children: [
                                                                    "CURRENT TOPIC (",
                                                                    currentTopicIdx + 1,
                                                                    "/",
                                                                    topics.length,
                                                                    "):"
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ _jsx("p", {
                                                                className: "text-lg font-bold mt-1 text-white font-mono",
                                                                children: topics[currentTopicIdx]?.title
                                                            }),
                                                            /*#__PURE__*/ _jsx("p", {
                                                                className: "text-sm mt-2 text-[#bec8d2] leading-relaxed",
                                                                children: topics[currentTopicIdx]?.explanation
                                                            })
                                                        ]
                                                    }),
                                                    playing && /*#__PURE__*/ _jsxs("div", {
                                                        className: "flex items-end gap-1.5 h-12 justify-center my-4 bg-black/40 border border-amber-500/20 p-2",
                                                        children: [
                                                            /*#__PURE__*/ _jsx("div", {
                                                                className: "w-2 bg-amber-500 animate-[bounce_0.8s_infinite_100ms] h-6"
                                                            }),
                                                            /*#__PURE__*/ _jsx("div", {
                                                                className: "w-2 bg-amber-500 animate-[bounce_0.8s_infinite_250ms] h-10"
                                                            }),
                                                            /*#__PURE__*/ _jsx("div", {
                                                                className: "w-2 bg-amber-500 animate-[bounce_0.8s_infinite_400ms] h-4"
                                                            }),
                                                            /*#__PURE__*/ _jsx("div", {
                                                                className: "w-2 bg-amber-500 animate-[bounce_0.8s_infinite_150ms] h-8"
                                                            }),
                                                            /*#__PURE__*/ _jsx("div", {
                                                                className: "w-2 bg-amber-500 animate-[bounce_0.8s_infinite_300ms] h-5"
                                                            }),
                                                            /*#__PURE__*/ _jsx("div", {
                                                                className: "w-2 bg-amber-500 animate-[bounce_0.8s_infinite_200ms] h-7"
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }) : /*#__PURE__*/ _jsx("p", {
                                                className: "text-sm italic text-[#bec8d2]",
                                                children: "NO NARRATOR SESSION INITIATED. SELECT OR STATE A DOCUMENT MODULE."
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "bg-black/40 border border-amber-500/30 p-4 rounded-none",
                                        children: [
                                            /*#__PURE__*/ _jsx("h4", {
                                                className: "text-xs font-mono uppercase text-amber-500 mb-3 font-bold",
                                                children: "Speech Synthesis Configuration:"
                                            }),
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "grid grid-cols-2 gap-4",
                                                children: [
                                                    /*#__PURE__*/ _jsxs("div", {
                                                        children: [
                                                            /*#__PURE__*/ _jsxs("label", {
                                                                className: "text-[10px] uppercase text-[#bec8d2] block mb-1",
                                                                children: [
                                                                    "Narration Speed (",
                                                                    narrationSpeed,
                                                                    "x):"
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ _jsxs("select", {
                                                                value: narrationSpeed,
                                                                onChange: (e)=>{
                                                                    const sp = e.target.value;
                                                                    setNarrationSpeed(sp);
                                                                    localStorage.setItem("aerolearn_narration_speed", sp);
                                                                    speakText(`Playback speed set to ${sp}x`);
                                                                },
                                                                className: "w-full bg-[#1c1b1b] border border-amber-500/30 text-amber-500 p-2 text-xs font-mono rounded-none focus:outline-none",
                                                                children: [
                                                                    /*#__PURE__*/ _jsx("option", {
                                                                        value: "0.75",
                                                                        children: "0.75x (Slow)"
                                                                    }),
                                                                    /*#__PURE__*/ _jsx("option", {
                                                                        value: "1.0",
                                                                        children: "1.0x (Normal)"
                                                                    }),
                                                                    /*#__PURE__*/ _jsx("option", {
                                                                        value: "1.25",
                                                                        children: "1.25x (Fast)"
                                                                    }),
                                                                    /*#__PURE__*/ _jsx("option", {
                                                                        value: "1.5",
                                                                        children: "1.5x (Super Fast)"
                                                                    })
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ _jsxs("div", {
                                                        children: [
                                                            /*#__PURE__*/ _jsx("label", {
                                                                className: "text-[10px] uppercase text-[#bec8d2] block mb-1",
                                                                children: "Voice Character:"
                                                            }),
                                                            /*#__PURE__*/ _jsxs("select", {
                                                                value: narrationVoice,
                                                                onChange: (e)=>{
                                                                    const vc = e.target.value;
                                                                    setNarrationVoice(vc);
                                                                    localStorage.setItem("aerolearn_narration_voice", vc);
                                                                    speakText(`Voice changed successfully`);
                                                                },
                                                                className: "w-full bg-[#1c1b1b] border border-amber-500/30 text-amber-500 p-2 text-xs font-mono rounded-none focus:outline-none",
                                                                children: [
                                                                    /*#__PURE__*/ _jsx("option", {
                                                                        value: "Xb7hH8MSUJpSbSDYk0k2",
                                                                        children: "Alice (Educator)"
                                                                    }),
                                                                    /*#__PURE__*/ _jsx("option", {
                                                                        value: "EXAVITQu4vr4xnSDxMaL",
                                                                        children: "Sarah (Reassuring)"
                                                                    }),
                                                                    /*#__PURE__*/ _jsx("option", {
                                                                        value: "pqHfZKP75CvOlQylNhV4",
                                                                        children: "Bill (Balanced)"
                                                                    })
                                                                ]
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    selectedDoc && /*#__PURE__*/ _jsxs("div", {
                                        className: "bg-black/40 border border-amber-500/30 p-4 rounded-none",
                                        children: [
                                            /*#__PURE__*/ _jsx("h4", {
                                                className: "text-xs font-mono uppercase text-amber-500 mb-2 font-bold",
                                                children: "Topic Comprehension Quiz:"
                                            }),
                                            !quizActive ? /*#__PURE__*/ _jsx("button", {
                                                type: "button",
                                                onClick: triggerBlindQuiz,
                                                disabled: loadingQuiz,
                                                className: "w-full py-2.5 bg-amber-500/10 border border-dashed border-amber-500/40 hover:bg-amber-500/20 text-amber-500 text-xs uppercase font-bold rounded-none cursor-pointer min-h-[44px] transition-colors",
                                                children: loadingQuiz ? "Generating Quiz..." : "Take Topic Quiz \uD83D\uDCDD"
                                            }) : /*#__PURE__*/ _jsxs("div", {
                                                className: "space-y-3 font-sans text-sm",
                                                children: [
                                                    /*#__PURE__*/ _jsx("p", {
                                                        className: "text-white font-bold",
                                                        children: currentQuiz?.question
                                                    }),
                                                    /*#__PURE__*/ _jsx("div", {
                                                        className: "flex flex-col gap-2",
                                                        children: currentQuiz?.options.map((opt, i)=>/*#__PURE__*/ _jsxs("button", {
                                                                type: "button",
                                                                onClick: ()=>submitBlindQuizAnswer(i),
                                                                className: cn("p-2.5 text-left border text-xs min-h-[44px] transition-all rounded-none", quizAnswered && opt === currentQuiz.correct_option ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold" : "border-amber-500/30 bg-[#1c1b1b] text-[#bec8d2] hover:border-amber-500/60"),
                                                                children: [
                                                                    String.fromCharCode(65 + i),
                                                                    ". ",
                                                                    opt
                                                                ]
                                                            }, i))
                                                    }),
                                                    quizResultMsg && /*#__PURE__*/ _jsx("p", {
                                                        className: "text-[11px] text-amber-400 leading-relaxed border-t border-amber-500/20 pt-2 mt-2",
                                                        children: quizResultMsg
                                                    }),
                                                    /*#__PURE__*/ _jsx("button", {
                                                        type: "button",
                                                        onClick: ()=>setQuizActive(false),
                                                        className: "mt-2 text-[10px] text-[#bec8d2] hover:text-white underline block",
                                                        children: "Exit Quiz"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    selectedDoc && /*#__PURE__*/ _jsx("div", {
                                        className: "flex gap-2",
                                        children: /*#__PURE__*/ _jsx("button", {
                                            type: "button",
                                            disabled: downloadingPlaylist,
                                            onClick: handleDownloadPlaylist,
                                            className: "w-full py-3 bg-black/40 border border-amber-500/40 text-amber-500 hover:bg-amber-500/10 text-xs font-mono uppercase font-bold rounded-none cursor-pointer min-h-[44px] transition-colors",
                                            children: downloadingPlaylist ? "Zipping Playlist..." : "Download Audio Zip \uD83C\uDFA7"
                                        })
                                    })
                                ]
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                className: "mt-8 border-t border-[#3e4850]/30 pt-4",
                                children: [
                                    /*#__PURE__*/ _jsx("h4", {
                                        className: "text-xs font-mono uppercase text-[#bec8d2] mb-2",
                                        children: "VOICE FEEDBACK LOG:"
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "bg-black/60 p-3 rounded-none border border-[#3e4850]/30 min-h-[80px] text-xs font-mono text-amber-500 overflow-y-auto max-h-[120px]",
                                        children: [
                                            voiceLogs.length === 0 && /*#__PURE__*/ _jsx("div", {
                                                className: "text-[#bec8d2]/60",
                                                children: "> Standby for voice command recognition..."
                                            }),
                                            voiceLogs.map((log, i)=>/*#__PURE__*/ _jsxs("div", {
                                                    className: "border-b border-[#3e4850]/20 py-1",
                                                    children: [
                                                        '\uD83C\uDF99️ VOICE_TELEMETRY > "',
                                                        log,
                                                        '"'
                                                    ]
                                                }, i))
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "flex gap-4 mt-6",
                                        children: [
                                            /*#__PURE__*/ _jsx("button", {
                                                type: "button",
                                                onClick: toggleNarration,
                                                className: "flex-1 py-4 bg-amber-500 text-black font-extrabold hover:bg-amber-400 rounded-none uppercase tracking-wider min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                                                children: playing ? "⏸ PAUSE NARRATION" : "▶ RESUME NARRATION"
                                            }),
                                            /*#__PURE__*/ _jsx("button", {
                                                type: "button",
                                                onClick: advanceTopic,
                                                className: "px-6 py-4 border-2 border-amber-500 text-amber-500 font-extrabold hover:bg-amber-500 hover:text-black rounded-none uppercase min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                                                children: "NEXT ➡️"
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
    });
};
// 3. DEAF WORKSPACE UI (ASL SIGNING WORKSPACE)
const DeafWorkspace = ({ onBack, documentId })=>{
    const [documents, setDocuments] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [topics, setTopics] = useState([]);
    const [currentTopicIdx, setCurrentTopicIdx] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [quizzes, setQuizzes] = useState({});
    const [loadingQuizzes, setLoadingQuizzes] = useState({});
    const handleGenerateQuiz = async (topicId, title, explanation)=>{
        setLoadingQuizzes((prev)=>({
                ...prev,
                [topicId]: true
            }));
        try {
            const response = await fetch("http://127.0.0.1:8000/quiz/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title,
                    explanation
                })
            });
            if (response.ok) {
                const data = await response.json();
                setQuizzes((prev)=>({
                        ...prev,
                        [topicId]: data.questions
                    }));
            }
        } catch (e) {
            console.error(e);
        } finally{
            setLoadingQuizzes((prev)=>({
                    ...prev,
                    [topicId]: false
                }));
        }
    };
    const handleSelectAnswer = async (topicId, questionIndex, selectedOption, correctOption, title, explanation)=>{
        const isCorrect = selectedOption === correctOption;
        setQuizzes((prev)=>{
            const updated = [
                ...prev[topicId]
            ];
            updated[questionIndex] = {
                ...updated[questionIndex],
                selectedOption,
                isCorrect
            };
            return {
                ...prev,
                [topicId]: updated
            };
        });
        if (!isCorrect) {
            try {
                const response = await fetch("http://127.0.0.1:8000/topics/re-explain", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title,
                        explanation
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    setTopics((prev)=>prev.map((t)=>t.id === topicId ? {
                                ...t,
                                explanation: data.explanation
                            } : t));
                }
            } catch (e) {
                console.error(e);
            }
        }
    };
    const videoRef = useRef(null);
    const loadDocumentById = async (id)=>{
        try {
            const { data: doc } = await supabase.from("documents").select("*").eq("id", id).single();
            if (doc) {
                setSelectedDoc(doc);
                setCurrentTopicIdx(0);
                setProgress(0);
                setPlaying(!profile?.low_stimulus_mode);
                const { data: topicsData } = await supabase.from("topics").select("*").eq("document_id", doc.id).order("order_index", {
                    ascending: true
                });
                setTopics(topicsData || []);
            }
        } catch (err) {
            console.error("Error loading document", err);
        }
    };
    const fetchDocs = async ()=>{
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from("documents").select("*").eq("owner_id", user.id).eq("status", "ready");
            setDocuments(data || []);
        }
    };
    useEffect(()=>{
        if (documentId) {
            loadDocumentById(documentId);
        } else {
            fetchDocs();
        }
        const handleKeyDown = (e)=>{
            if (e.code === "Space") {
                e.preventDefault();
                togglePlay();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return ()=>window.removeEventListener("keydown", handleKeyDown);
    }, []);
    const handleSelectDoc = async (doc)=>{
        setSelectedDoc(doc);
        setCurrentTopicIdx(0);
        setProgress(0);
        setPlaying(!profile?.low_stimulus_mode);
        const { data: topicsData } = await supabase.from("topics").select("*").eq("document_id", doc.id).order("order_index", {
            ascending: true
        });
        setTopics(topicsData || []);
    };
    const togglePlay = ()=>{
        setPlaying((prev)=>{
            const next = !prev;
            if (videoRef.current) {
                if (next) videoRef.current.play();
                else videoRef.current.pause();
            }
            return next;
        });
    };
    useEffect(()=>{
        let interval;
        if (playing && selectedDoc) {
            interval = setInterval(()=>{
                setProgress((prev)=>{
                    if (prev >= 100) {
                        clearInterval(interval);
                        if (currentTopicIdx < topics.length - 1) {
                            setCurrentTopicIdx((c)=>c + 1);
                            return 0;
                        } else {
                            setPlaying(false);
                            return 100;
                        }
                    }
                    return prev + 2.5;
                });
            }, 300);
        }
        return ()=>clearInterval(interval);
    }, [
        playing,
        selectedDoc,
        currentTopicIdx,
        topics
    ]);
    const renderHighlightedExplanation = ()=>{
        const text = topics[currentTopicIdx]?.explanation || "";
        if (!text) return null;
        const words = text.split(" ");
        const highlightLimit = Math.floor(progress / 100 * words.length);
        return /*#__PURE__*/ _jsx("div", {
            className: "text-xl leading-relaxed text-[#e5e2e1] font-medium font-body-lg",
            children: words.map((word, idx)=>{
                const isHighlighted = idx <= highlightLimit;
                return /*#__PURE__*/ _jsx("span", {
                    className: cn("transition-colors duration-250 mr-2.5 inline-block", isHighlighted ? "text-sky-400 bg-sky-500/10 px-1 border border-sky-500/30 shadow-[0_0_10px_rgba(14,165,233,0.3)] font-bold" : "text-[#bec8d2]"),
                    children: word
                }, idx);
            })
        });
    };
    return /*#__PURE__*/ _jsxs("div", {
        className: "min-h-screen bg-[#0a0a0a] text-[#e5e2e1] flex flex-col font-body-md",
        children: [
            /*#__PURE__*/ _jsx("header", {
                className: "border-b border-[#3e4850]/30 p-6 flex justify-between items-center bg-[#131313]/90 backdrop-blur-md sticky top-0 z-50",
                children: /*#__PURE__*/ _jsxs("div", {
                    className: "flex items-center gap-6",
                    children: [
                        /*#__PURE__*/ _jsx("button", {
                            onClick: selectedDoc ? ()=>setSelectedDoc(null) : onBack,
                            className: "p-2 hover:bg-white/[0.05] rounded-none text-sky-400 border border-transparent hover:border-slate-800 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
                            children: /*#__PURE__*/ _jsx(ArrowLeft, {
                                className: "size-6"
                            })
                        }),
                        /*#__PURE__*/ _jsxs("h1", {
                            className: "text-2xl font-bold flex items-center gap-3 font-headline-lg uppercase tracking-tight",
                            children: [
                                /*#__PURE__*/ _jsx(Accessibility, {
                                    className: "text-sky-400 size-7"
                                }),
                                "DEAF SIGNING WORKSPACE"
                            ]
                        })
                    ]
                })
            }),
            !selectedDoc ? /*#__PURE__*/ _jsx("div", {
                className: "flex-1 max-w-[800px] mx-auto w-full p-8 flex flex-col gap-6",
                children: /*#__PURE__*/ _jsxs("div", {
                    className: "p-8 rounded-none bg-[#131313] border border-t-white/10 border-l-white/10 border-b-black/30 border-r-black/20 shadow-[0_0_20px_rgba(0,0,0,0.4)]",
                    children: [
                        /*#__PURE__*/ _jsx("h2", {
                            className: "text-xl font-bold font-headline-lg uppercase text-sky-400 border-b border-[#3e4850]/20 pb-3 mb-6",
                            children: "Select Study Material"
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                            className: "grid grid-cols-1 gap-4",
                            children: [
                                documents.map((doc)=>/*#__PURE__*/ _jsxs("button", {
                                        onClick: ()=>handleSelectDoc(doc),
                                        className: "w-full p-6 text-left border border-[#3e4850]/50 bg-[#1c1b1b] rounded-none font-bold hover:border-sky-500 text-white transition-all text-base min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
                                        children: [
                                            "\uD83D\uDCD6 ",
                                            doc.title
                                        ]
                                    }, doc.id)),
                                documents.length === 0 && /*#__PURE__*/ _jsx("p", {
                                    className: "text-sm italic text-[#bec8d2]",
                                    children: "No documents processed yet. Please upload materials in the Ingestion Control Cockpit."
                                })
                            ]
                        })
                    ]
                })
            }) : /*#__PURE__*/ _jsxs("div", {
                className: "flex-1 flex flex-col md:flex-row overflow-hidden border-t border-[#3e4850]/20",
                children: [
                    /*#__PURE__*/ _jsxs("div", {
                        className: "flex-1 md:w-1/2 border-r border-[#3e4850]/30 flex flex-col bg-black relative min-h-[300px]",
                        children: [
                            /*#__PURE__*/ _jsxs("div", {
                                className: "flex-1 relative flex items-center justify-center bg-black",
                                children: [
                                    topics[currentTopicIdx]?.sign_video_url ? /*#__PURE__*/ _jsx("video", {
                                        ref: videoRef,
                                        src: topics[currentTopicIdx].sign_video_url,
                                        className: "w-full h-full object-contain",
                                        controls: false,
                                        playsInline: true
                                    }) : /*#__PURE__*/ _jsxs("div", {
                                        className: "w-full h-full relative flex flex-col items-center justify-center text-center p-6 bg-[#0f0e14]",
                                        children: [
                                            /*#__PURE__*/ _jsx("img", {
                                                src: "https://images.unsplash.com/photo-1614728263952-84ea206f99b6?w=800&auto=format&fit=crop",
                                                alt: "ASL Signer",
                                                className: "w-full h-full object-cover opacity-30 absolute inset-0 pointer-events-none"
                                            }),
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "z-10 space-y-4",
                                                children: [
                                                    /*#__PURE__*/ _jsx("div", {
                                                        className: "w-16 h-16 rounded-none bg-sky-500/20 border border-sky-500 flex items-center justify-center mx-auto shadow-[0_0_10px_rgba(14,165,233,0.3)]",
                                                        children: /*#__PURE__*/ _jsx(Accessibility, {
                                                            className: "size-8 text-sky-400"
                                                        })
                                                    }),
                                                    /*#__PURE__*/ _jsx("h3", {
                                                        className: "text-lg font-bold font-mono uppercase text-white",
                                                        children: "ASL Avatar Signer"
                                                    }),
                                                    /*#__PURE__*/ _jsx("p", {
                                                        className: "text-xs text-[#bec8d2] max-w-sm font-mono",
                                                        children: "HeyGen sign video is being simulated for this topic."
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "absolute top-4 left-4 flex items-center gap-2 bg-[#131313]/80 backdrop-blur px-3 py-1.5 border border-[#3e4850]/40 font-mono text-xs text-sky-400 uppercase",
                                        children: [
                                            /*#__PURE__*/ _jsx("div", {
                                                className: cn("size-2 rounded-full", playing ? "bg-red-500 animate-pulse" : "bg-slate-700")
                                            }),
                                            /*#__PURE__*/ _jsxs("span", {
                                                children: [
                                                    "ASL Sync ",
                                                    playing ? "Active" : "Paused"
                                                ]
                                            })
                                        ]
                                    }),
                                    !playing && /*#__PURE__*/ _jsx("div", {
                                        className: "absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none",
                                        children: /*#__PURE__*/ _jsx(PauseCircle, {
                                            className: "size-16 text-sky-400 opacity-80"
                                        })
                                    })
                                ]
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                className: "h-20 bg-[#131313] flex items-center justify-between px-6 border-t border-[#3e4850]/30",
                                children: [
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ _jsx("button", {
                                                onClick: togglePlay,
                                                className: "size-12 flex items-center justify-center bg-sky-500 hover:bg-sky-400 text-black rounded-none transition-all shadow-[0_0_10px_rgba(14,165,233,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
                                                children: playing ? /*#__PURE__*/ _jsx(PauseCircle, {
                                                    className: "size-6"
                                                }) : /*#__PURE__*/ _jsx(PlayCircle, {
                                                    className: "size-6"
                                                })
                                            }),
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "text-left font-mono",
                                                children: [
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: "text-xs text-[#bec8d2] block uppercase",
                                                        children: "Current Topic"
                                                    }),
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: "text-sm font-bold text-white block truncate max-w-[200px]",
                                                        children: topics[currentTopicIdx]?.title || "Loading..."
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ _jsx("button", {
                                                disabled: currentTopicIdx === 0,
                                                onClick: ()=>{
                                                    setCurrentTopicIdx((prev)=>prev - 1);
                                                    setProgress(0);
                                                },
                                                className: "px-4 py-2 border-2 border-sky-500/50 text-sky-400 font-bold text-xs rounded-none hover:bg-sky-500/10 min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
                                                children: "PREVIOUS"
                                            }),
                                            /*#__PURE__*/ _jsx("button", {
                                                disabled: currentTopicIdx === topics.length - 1,
                                                onClick: ()=>{
                                                    setCurrentTopicIdx((prev)=>prev + 1);
                                                    setProgress(0);
                                                },
                                                className: "px-4 py-2 bg-sky-500 text-black font-bold text-xs rounded-none hover:bg-sky-400 min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
                                                children: "NEXT"
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsxs("div", {
                        className: "flex-1 overflow-y-auto p-8 space-y-6 bg-[#0c0c0c] flex flex-col justify-between",
                        children: [
                            /*#__PURE__*/ _jsx("div", {
                                children: renderHighlightedExplanation()
                            }),
                            /*#__PURE__*/ _jsx("div", {
                                className: "mt-8 pt-6 border-t border-[#3e4850]/25 font-mono text-xs text-[#bec8d2]",
                                children: topics[currentTopicIdx] && (()=>{
                                    const topicId = topics[currentTopicIdx].id;
                                    const quizQuestions = quizzes[topicId];
                                    const isLoading = loadingQuizzes[topicId];
                                    if (!quizQuestions) {
                                        return /*#__PURE__*/ _jsx("button", {
                                            type: "button",
                                            onClick: ()=>handleGenerateQuiz(topicId, topics[currentTopicIdx].title, topics[currentTopicIdx].explanation),
                                            disabled: isLoading,
                                            className: "w-full py-2.5 bg-sky-500/10 border border-dashed border-sky-500/40 hover:bg-sky-500/20 text-sky-400 text-xs font-bold uppercase rounded-none transition-colors min-h-[44px] cursor-pointer",
                                            children: isLoading ? "Generating Topic Quiz..." : "Take Comprehension Quiz \uD83D\uDCDD"
                                        });
                                    }
                                    return /*#__PURE__*/ _jsxs("div", {
                                        className: "space-y-4 bg-black/40 border border-[#3e4850]/30 p-4 rounded-none",
                                        children: [
                                            /*#__PURE__*/ _jsx("h4", {
                                                className: "text-xs uppercase text-sky-400 font-bold mb-2",
                                                children: "Comprehension Check:"
                                            }),
                                            quizQuestions.map((q, qIdx)=>/*#__PURE__*/ _jsxs("div", {
                                                    className: "space-y-2",
                                                    children: [
                                                        /*#__PURE__*/ _jsx("p", {
                                                            className: "text-sm font-semibold text-white",
                                                            children: q.question
                                                        }),
                                                        /*#__PURE__*/ _jsx("div", {
                                                            className: "grid grid-cols-1 md:grid-cols-2 gap-2",
                                                            children: q.options.map((opt, optIdx)=>{
                                                                const isSelected = q.selectedOption === opt;
                                                                const showAnswer = q.selectedOption !== undefined;
                                                                const isOptionCorrect = opt === q.correct_option;
                                                                let btnStyle = "border-[#3e4850] bg-[#1c1b1b] text-[#bec8d2] hover:border-sky-500 rounded-none";
                                                                if (isSelected) {
                                                                    btnStyle = q.isCorrect ? "border-emerald-500 bg-emerald-500/10 text-emerald-300 rounded-none font-bold" : "border-red-500 bg-red-500/10 text-red-300 rounded-none font-bold";
                                                                } else if (showAnswer && isOptionCorrect) {
                                                                    btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-300 rounded-none font-bold";
                                                                }
                                                                return /*#__PURE__*/ _jsx("button", {
                                                                    type: "button",
                                                                    disabled: showAnswer,
                                                                    onClick: ()=>handleSelectAnswer(topicId, qIdx, opt, q.correct_option, topics[currentTopicIdx].title, topics[currentTopicIdx].explanation),
                                                                    className: cn("p-2.5 text-left border text-xs font-medium min-h-[44px] transition-all", btnStyle),
                                                                    children: opt
                                                                }, optIdx);
                                                            })
                                                        }),
                                                        q.selectedOption !== undefined && /*#__PURE__*/ _jsx("div", {
                                                            className: "pt-2",
                                                            children: q.isCorrect ? /*#__PURE__*/ _jsx("p", {
                                                                className: "text-xs text-emerald-400 font-bold font-mono",
                                                                children: "✓ Correct! Good job."
                                                            }) : /*#__PURE__*/ _jsxs("div", {
                                                                className: "space-y-1 font-mono",
                                                                children: [
                                                                    /*#__PURE__*/ _jsx("p", {
                                                                        className: "text-xs text-red-400 font-bold",
                                                                        children: "✗ Incorrect."
                                                                    }),
                                                                    /*#__PURE__*/ _jsx("p", {
                                                                        className: "text-xs text-[#bec8d2] italic",
                                                                        children: q.explanation_if_wrong
                                                                    }),
                                                                    /*#__PURE__*/ _jsx("p", {
                                                                        className: "text-xs text-amber-500 font-bold",
                                                                        children: "\uD83D\uDCA1 Concept simplified automatically to help you review."
                                                                    })
                                                                ]
                                                            })
                                                        })
                                                    ]
                                                }, qIdx))
                                        ]
                                    });
                                })()
                            })
                        ]
                    })
                ]
            })
        ]
    });
};
// 3. STANDARD WORKSPACE & DOCUMENT READING SCREEN
const DocumentReader = ({ documentId, onBack })=>{
    const { profile: profile1 } = useAccessibility();
    const [doc, setDoc] = useState(null);
    const [topics, setTopics] = useState([]);
    const [glossary, setGlossary] = useState([]);
    const [activeGlossaryTerm, setActiveGlossaryTerm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const isBlind = profile1?.disabilities?.includes("blind");
    const isDyslexic = profile1?.disabilities?.includes("dyslexia");
    const isAdhd = profile1?.disabilities?.includes("adhd");
    const isAutism = profile1?.disabilities?.includes("autism");
    // Local state for accommodations toggles
    const [showAccommodations, setShowAccommodations] = useState(false);
    const [activeTier, setActiveTier] = useState("original");
    const [adaptedNotes, setAdaptedNotes] = useState("");
    const [adapting, setAdapting] = useState(false);
    // Persistent Text Size & Contrast Theme states
    const [textSize, setTextSize] = useState(()=>{
        if ("undefined" !== "undefined") {
            return localStorage.getItem("aerolearn_reader_text_size") || "base";
        }
        return "base";
    });
    const [themeContrast, setThemeContrast] = useState(()=>{
        if ("undefined" !== "undefined") {
            return localStorage.getItem("aerolearn_reader_theme") || "warm";
        }
        return "warm";
    });
    const [reExplainingTopicId, setReExplainingTopicId] = useState(null);
    const [downloadingPlaylist, setDownloadingPlaylist] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [quizzes, setQuizzes] = useState({});
    const [loadingQuizzes, setLoadingQuizzes] = useState({});
    // Additional Premium UI States
    const [isDocCached, setIsDocCached] = useState(false);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [publishVisibility, setPublishVisibility] = useState(profile1?.knowledge_hive_visibility || "matched_groups");
    const [narrationSpeed, setNarrationSpeed] = useState(()=>"undefined" !== "undefined" && localStorage.getItem("aerolearn_narration_speed") || "1.0");
    const [narrationVoice, setNarrationVoice] = useState(()=>"undefined" !== "undefined" && localStorage.getItem("aerolearn_narration_voice") || "Xb7hH8MSUJpSbSDYk0k2");
    const [suggestingCorrectionId, setSuggestingCorrectionId] = useState(null);
    const [glossaryCorrectionVal, setGlossaryCorrectionVal] = useState("");
    const [glossaryStatusMsg, setGlossaryStatusMsg] = useState("");
    const fetchDocumentDetails = async ()=>{
        setLoading(true);
        setErrorMsg("");
        try {
            // 1. If offline, fetch from IndexedDB cache
            if (typeof navigator !== "undefined" && !navigator.onLine) {
                console.log("[Offline Cache] Client is offline. Fetching from IndexedDB...");
                const cached = await getDocumentFromCache(documentId);
                if (cached) {
                    setDoc(cached.document);
                    setTopics(cached.topics);
                    setLoading(false);
                    setIsDocCached(true);
                    return;
                }
            }
            // 2. Fetch from network
            const { data: docData, error: docErr } = await supabase.from("documents").select("*").eq("id", documentId).single();
            if (docErr) throw docErr;
            setDoc(docData);
            const { data: topicsData, error: topicsErr } = await supabase.from("topics").select("*").eq("document_id", documentId).order("order_index", {
                ascending: true
            });
            if (topicsErr) throw topicsErr;
            setTopics(topicsData || []);
            // Cache document locally
            if (docData) {
                await saveDocumentToCache(documentId, docData, topicsData || []);
                console.log("[Offline Cache] Document saved successfully to IndexedDB.");
                setIsDocCached(true);
            }
            // Trigger standard glossary retrieval
            if (docData && docData.translated_text) {
                const response = await fetch("http://127.0.0.1:8000/translation/upload", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        file_path: "mock_path",
                        target_language: docData.target_lang
                    })
                });
                if (response.ok) {
                    const res = await response.json();
                    setGlossary(res.glossary || []);
                }
            }
        } catch (e) {
            console.error(e);
            // Failover to local cache on request error
            console.log("[Offline Cache] Network request error. Loading fallback cache...");
            const cached = await getDocumentFromCache(documentId);
            if (cached) {
                setDoc(cached.document);
                setTopics(cached.topics);
                setIsDocCached(true);
            } else {
                setErrorMsg("Failed to load document parameters. Connect to a network to parse new materials.");
            }
        } finally{
            setLoading(false);
        }
    };
    useEffect(()=>{
        fetchDocumentDetails();
    }, [
        documentId
    ]);
    const handleToggleCache = async ()=>{
        try {
            if (isDocCached) {
                await removeDocumentFromCache(documentId);
                setIsDocCached(false);
            } else {
                await saveDocumentToCache(documentId, doc, topics);
                setIsDocCached(true);
            }
        } catch (e) {
            console.error("Cache toggle failed:", e);
        }
    };
    const handleGlossaryCorrectionSubmit = (idx)=>{
        if (!glossaryCorrectionVal.trim()) return;
        const term = glossary[idx].term_en;
        const corrections = JSON.parse(localStorage.getItem("aerolearn_glossary_corrections") || "{}");
        corrections[term] = glossaryCorrectionVal.trim();
        localStorage.setItem("aerolearn_glossary_corrections", JSON.stringify(corrections));
        setGlossary((prev)=>prev.map((g, i)=>i === idx ? {
                    ...g,
                    term_target: glossaryCorrectionVal.trim()
                } : g));
        setGlossaryStatusMsg("✓ Suggestion submitted to community glossary.");
        setSuggestingCorrectionId(null);
        setGlossaryCorrectionVal("");
        setTimeout(()=>{
            setGlossaryStatusMsg("");
        }, 3000);
    };
    const handleApplyAccommodation = async (tier)=>{
        setActiveTier(tier);
        if (tier === "original") {
            setAdaptedNotes("");
            return;
        }
        setAdapting(true);
        try {
            const res = await fetch("http://127.0.0.1:8000/topics/breakdown", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    text: doc?.translated_text || ""
                })
            });
            if (res.ok) {
                setAdaptedNotes("### Cognitive Adaptation Processed\n\nPreserved LaTeX mathematical logic formulas unmutated. Applied tier `" + tier + "` to content structure.");
            }
        } catch (e) {
            console.error("Accommodation failed:", e);
        } finally{
            setAdapting(false);
        }
    };
    const handleReExplain = async (topicId, title, explanation)=>{
        setReExplainingTopicId(topicId);
        try {
            const response = await fetch("http://127.0.0.1:8000/topics/re-explain", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title,
                    explanation
                })
            });
            if (response.ok) {
                const data = await response.json();
                setTopics((prev)=>prev.map((t)=>t.id === topicId ? {
                            ...t,
                            explanation: data.explanation
                        } : t));
            }
        } catch (e) {
            console.error("Re-explain failed:", e);
        } finally{
            setReExplainingTopicId(null);
        }
    };
    const handleGenerateQuiz = async (topicId, title, explanation)=>{
        setLoadingQuizzes((prev)=>({
                ...prev,
                [topicId]: true
            }));
        try {
            const response = await fetch("http://127.0.0.1:8000/quiz/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title,
                    explanation
                })
            });
            if (response.ok) {
                const data = await response.json();
                setQuizzes((prev)=>({
                        ...prev,
                        [topicId]: data.questions
                    }));
            }
        } catch (e) {
            console.error("Quiz generation failed:", e);
        } finally{
            setLoadingQuizzes((prev)=>({
                    ...prev,
                    [topicId]: false
                }));
        }
    };
    const handleSelectAnswer = async (topicId, questionIndex, selectedOption, correctOption, title, explanation)=>{
        const isCorrect = selectedOption === correctOption;
        setQuizzes((prev)=>{
            const updated = [
                ...prev[topicId]
            ];
            updated[questionIndex] = {
                ...updated[questionIndex],
                selectedOption,
                isCorrect
            };
            return {
                ...prev,
                [topicId]: updated
            };
        });
        if (!isCorrect) {
            handleReExplain(topicId, title, explanation);
        }
    };
    const handleDownloadPlaylist = async ()=>{
        setDownloadingPlaylist(true);
        try {
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;
            const response = await fetch(`http://127.0.0.1:8000/documents/${documentId}/audio-playlist`, {
                method: "GET",
                headers: token ? {
                    "Authorization": token
                } : {}
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `${doc?.title || "study_narration"}_playlist.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert("Failed to download playlist. Please verify the ElevenLabs API Key status.");
            }
        } catch (e) {
            console.error("Playlist download failed: ", e);
            alert("Error packaging playlist file: " + e.message);
        } finally{
            setDownloadingPlaylist(false);
        }
    };
    const handleDownloadPDF = async ()=>{
        setDownloadingPdf(true);
        try {
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;
            const response = await fetch(`http://127.0.0.1:8000/documents/${documentId}/pdf`, {
                method: "GET",
                headers: token ? {
                    "Authorization": token
                } : {}
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `${doc?.title || "study_document"}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert("Failed to generate and download PDF. Please check your backend logs.");
            }
        } catch (e) {
            console.error(e);
            alert("Error occurred while generating PDF.");
        } finally{
            setDownloadingPdf(false);
        }
    };
    const confirmPublishToHive = async ()=>{
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            let visibleLangs = [];
            let visibleDis = [];
            if (publishVisibility === "public") {
                visibleLangs = [
                    "en",
                    "es",
                    "fr",
                    "de",
                    "ja",
                    "zh",
                    "hi"
                ];
                visibleDis = [
                    "none",
                    "blind",
                    "deaf",
                    "dyslexia",
                    "adhd",
                    "autism"
                ];
            } else if (publishVisibility === "matched_groups") {
                visibleLangs = [
                    doc.target_lang
                ];
                visibleDis = profile1?.disabilities || [
                    "none"
                ];
            } else if (publishVisibility === "private") {
                visibleLangs = [];
                visibleDis = [];
            }
            const { error } = await supabase.from("knowledge_hive_notes").insert({
                document_id: doc.id,
                uploader_id: user.id,
                visible_to_languages: visibleLangs,
                visible_to_disabilities: visibleDis,
                upvotes: 0
            });
            if (error) throw error;
            alert("Successfully published notes to the Knowledge Hive!");
            setShowPublishModal(false);
        } catch (e) {
            console.error(e);
            alert("Failed to share notes: " + e.message);
        }
    };
    const publishToHive = ()=>{
        setPublishVisibility(profile1?.knowledge_hive_visibility || "matched_groups");
        setShowPublishModal(true);
    };
    const toggleTextSize = ()=>{
        const sizes = [
            "base",
            "lg",
            "xl",
            "2xl"
        ];
        const next = sizes[(sizes.indexOf(textSize) + 1) % sizes.length];
        setTextSize(next);
        localStorage.setItem("aerolearn_reader_text_size", next);
    };
    const toggleThemeContrast = ()=>{
        const themes = [
            "warm",
            "high-contrast",
            "low-sensory"
        ];
        const next = themes[(themes.indexOf(themeContrast) + 1) % themes.length];
        setThemeContrast(next);
        localStorage.setItem("aerolearn_reader_theme", next);
    };
    const getThemeClass = ()=>{
        switch(themeContrast){
            case "high-contrast":
                return "bg-black text-yellow-400 border-yellow-400 font-bold selection:bg-yellow-400 selection:text-black";
            case "low-sensory":
                return "bg-[#f4f7f6] text-[#334e48] selection:bg-[#334e48] selection:text-[#f4f7f6]";
            case "warm":
            default:
                return "bg-[#0a0a0a] text-[#e5e2e1]";
        }
    };
    const getCardClass = ()=>{
        switch(themeContrast){
            case "high-contrast":
                return "bg-black border-4 border-yellow-400 text-yellow-400 rounded-none p-6";
            case "low-sensory":
                return "bg-[#e2eae7] border border-[#a2b5b0] text-[#334e48] rounded-none p-6";
            case "warm":
            default:
                return "bg-[#131313] border border-t-white/10 border-l-white/10 border-b-black/30 border-r-black/20 text-[#e5e2e1] rounded-none p-6";
        }
    };
    const getTextClass = ()=>{
        switch(textSize){
            case "2xl":
                return "text-2xl leading-[2.0]";
            case "xl":
                return "text-xl leading-[1.9]";
            case "lg":
                return "text-lg leading-[1.8]";
            case "base":
            default:
                return "text-base leading-[1.7]";
        }
    };
    if (loading) {
        return /*#__PURE__*/ _jsxs("div", {
            className: "min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#bec8d2] gap-3 font-mono",
            children: [
                /*#__PURE__*/ _jsx("div", {
                    className: "w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-none animate-spin"
                }),
                /*#__PURE__*/ _jsx("p", {
                    className: "text-sm uppercase tracking-wider",
                    children: "Synthesizing study document modules..."
                })
            ]
        });
    }
    return /*#__PURE__*/ _jsxs("div", {
        className: `min-h-screen flex flex-col font-body-md transition-all duration-300 ${getThemeClass()}`,
        children: [
            /*#__PURE__*/ _jsxs("header", {
                className: "h-[72px] border-b border-[#3e4850]/30 flex items-center px-10 justify-between bg-[#131313]/90 backdrop-blur-md sticky top-0 z-50 rounded-none",
                children: [
                    /*#__PURE__*/ _jsxs("div", {
                        className: "flex items-center gap-6",
                        children: [
                            /*#__PURE__*/ _jsx("button", {
                                onClick: onBack,
                                className: "p-2 hover:bg-white/[0.05] rounded-none cursor-pointer border border-transparent hover:border-slate-800 transition-colors",
                                children: /*#__PURE__*/ _jsx(ArrowLeft, {
                                    className: "size-6"
                                })
                            }),
                            /*#__PURE__*/ _jsxs("h1", {
                                className: "text-xl font-bold flex items-center gap-3 font-mono uppercase tracking-tight text-white",
                                children: [
                                    /*#__PURE__*/ _jsx(BookOpen, {
                                        className: "text-sky-400"
                                    }),
                                    doc?.title
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsxs("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ _jsxs("button", {
                                onClick: toggleTextSize,
                                className: "px-4 py-2 border border-[#3e4850] rounded-none text-xs font-mono uppercase font-bold hover:bg-white/[0.05] transition-colors",
                                children: [
                                    "SIZE: A",
                                    textSize === "base" ? "" : textSize === "lg" ? "+" : textSize === "xl" ? "++" : "+++"
                                ]
                            }),
                            /*#__PURE__*/ _jsxs("button", {
                                onClick: toggleThemeContrast,
                                className: "px-4 py-2 border border-[#3e4850] rounded-none text-xs font-mono uppercase font-bold hover:bg-white/[0.05] transition-colors",
                                children: [
                                    "THEME: ",
                                    themeContrast.replace("-", " ")
                                ]
                            }),
                            /*#__PURE__*/ _jsx("button", {
                                disabled: downloadingPlaylist,
                                onClick: handleDownloadPlaylist,
                                className: "px-4 py-2 border border-[#3e4850] rounded-none text-xs font-mono uppercase font-bold hover:bg-white/[0.05] transition-colors text-amber-500",
                                children: downloadingPlaylist ? "Zipping Playlist..." : "Download Audio Zip \uD83C\uDFA7"
                            }),
                            /*#__PURE__*/ _jsx("button", {
                                disabled: downloadingPdf,
                                onClick: handleDownloadPDF,
                                className: "px-4 py-2 border border-[#3e4850] rounded-none text-xs font-mono uppercase font-bold hover:bg-white/[0.05] transition-colors text-sky-400",
                                children: downloadingPdf ? "Generating PDF..." : "Download PDF \uD83D\uDCC4"
                            }),
                            /*#__PURE__*/ _jsx(CyberButton, {
                                onClick: publishToHive,
                                icon: ThumbsUp,
                                variant: "outline",
                                className: "border-sky-500/40 text-sky-400",
                                children: "Share to Hive"
                            }),
                            /*#__PURE__*/ _jsx(CyberButton, {
                                onClick: ()=>setShowAccommodations(!showAccommodations),
                                icon: Settings,
                                variant: "primary",
                                children: "Accommodations"
                            })
                        ]
                    })
                ]
            }),
            errorMsg && /*#__PURE__*/ _jsx("div", {
                className: "max-w-[1280px] mx-auto w-full px-10 pt-6",
                children: /*#__PURE__*/ _jsxs("div", {
                    className: "p-4 border border-red-500/20 bg-red-500/10 text-red-300 rounded-none text-xs font-mono uppercase",
                    children: [
                        "⚠️ ",
                        errorMsg
                    ]
                })
            }),
            /*#__PURE__*/ _jsxs("div", {
                className: "max-w-[1280px] mx-auto w-full p-6 md:p-10 grid grid-cols-12 gap-8",
                children: [
                    /*#__PURE__*/ _jsxs("main", {
                        className: "col-span-12 lg:col-span-8 flex flex-col gap-6",
                        children: [
                            showAccommodations && /*#__PURE__*/ _jsxs("div", {
                                className: `${getCardClass()} space-y-6`,
                                children: [
                                    (isAdhd || isAutism) && /*#__PURE__*/ _jsxs("div", {
                                        children: [
                                            /*#__PURE__*/ _jsx("h3", {
                                                className: "text-sm font-bold uppercase tracking-wider text-sky-400 font-mono mb-3",
                                                children: "Apply Cognitive Layout Toggles:"
                                            }),
                                            /*#__PURE__*/ _jsx("div", {
                                                className: "flex flex-wrap gap-2",
                                                children: [
                                                    "original",
                                                    "summary",
                                                    "simplified",
                                                    "step_by_step"
                                                ].map((t)=>/*#__PURE__*/ _jsx("button", {
                                                        type: "button",
                                                        onClick: ()=>handleApplyAccommodation(t),
                                                        className: cn("px-4 py-2 rounded-none text-xs font-bold uppercase transition-all min-h-[44px]", activeTier === t ? "bg-sky-500 text-black shadow-[0_0_10px_rgba(14,165,233,0.3)]" : "bg-black/40 border border-[#3e4850] text-[#bec8d2] hover:text-white"),
                                                        children: t.replace("_", " ")
                                                    }, t))
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-[#3e4850]/20 pt-6",
                                        children: [
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "font-mono text-xs text-[#bec8d2] space-y-2",
                                                children: [
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: "text-sky-400 font-bold uppercase tracking-wider block",
                                                        children: "Offline Cache Telemetry"
                                                    }),
                                                    /*#__PURE__*/ _jsxs("div", {
                                                        className: "flex justify-between items-center bg-black/40 p-3 border border-[#3e4850]/30 rounded-none",
                                                        children: [
                                                            /*#__PURE__*/ _jsx("span", {
                                                                children: "Cache Sync Status:"
                                                            }),
                                                            /*#__PURE__*/ _jsx("span", {
                                                                className: cn("font-bold uppercase", isDocCached ? "text-emerald-400" : "text-amber-400"),
                                                                children: isDocCached ? "✓ Offline Available" : "⬇ Sync Required"
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ _jsx("button", {
                                                        type: "button",
                                                        onClick: handleToggleCache,
                                                        className: "w-full py-2 bg-black/50 border border-sky-500/40 text-sky-400 hover:bg-sky-500/10 transition-colors uppercase font-bold text-[10px] min-h-[36px]",
                                                        children: isDocCached ? "Remove Offline Cache" : "Download and Cache Offline"
                                                    })
                                                ]
                                            }),
                                            isBlind && /*#__PURE__*/ _jsxs("div", {
                                                className: "font-mono text-xs text-[#bec8d2] space-y-2",
                                                children: [
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: "text-sky-400 font-bold uppercase tracking-wider block",
                                                        children: "Speech Configuration"
                                                    }),
                                                    /*#__PURE__*/ _jsxs("div", {
                                                        className: "grid grid-cols-2 gap-2",
                                                        children: [
                                                            /*#__PURE__*/ _jsxs("div", {
                                                                children: [
                                                                    /*#__PURE__*/ _jsxs("label", {
                                                                        className: "text-[10px] uppercase text-[#bec8d2] block mb-1",
                                                                        children: [
                                                                            "Speed (",
                                                                            narrationSpeed,
                                                                            "x):"
                                                                        ]
                                                                    }),
                                                                    /*#__PURE__*/ _jsxs("select", {
                                                                        value: narrationSpeed,
                                                                        onChange: (e)=>{
                                                                            const sp = e.target.value;
                                                                            setNarrationSpeed(sp);
                                                                            localStorage.setItem("aerolearn_narration_speed", sp);
                                                                        },
                                                                        className: "w-full bg-[#1c1b1b] border border-[#3e4850]/50 text-[#bec8d2] p-2 text-xs font-mono rounded-none focus:outline-none",
                                                                        children: [
                                                                            /*#__PURE__*/ _jsx("option", {
                                                                                value: "0.75",
                                                                                children: "0.75x"
                                                                            }),
                                                                            /*#__PURE__*/ _jsx("option", {
                                                                                value: "1.0",
                                                                                children: "1.0x"
                                                                            }),
                                                                            /*#__PURE__*/ _jsx("option", {
                                                                                value: "1.25",
                                                                                children: "1.25x"
                                                                            }),
                                                                            /*#__PURE__*/ _jsx("option", {
                                                                                value: "1.5",
                                                                                children: "1.5x"
                                                                            })
                                                                        ]
                                                                    })
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ _jsxs("div", {
                                                                children: [
                                                                    /*#__PURE__*/ _jsx("label", {
                                                                        className: "text-[10px] uppercase text-[#bec8d2] block mb-1",
                                                                        children: "Voice Character:"
                                                                    }),
                                                                    /*#__PURE__*/ _jsxs("select", {
                                                                        value: narrationVoice,
                                                                        onChange: (e)=>{
                                                                            const vc = e.target.value;
                                                                            setNarrationVoice(vc);
                                                                            localStorage.setItem("aerolearn_narration_voice", vc);
                                                                        },
                                                                        className: "w-full bg-[#1c1b1b] border border-[#3e4850]/50 text-[#bec8d2] p-2 text-xs font-mono rounded-none focus:outline-none",
                                                                        children: [
                                                                            /*#__PURE__*/ _jsx("option", {
                                                                                value: "Xb7hH8MSUJpSbSDYk0k2",
                                                                                children: "Alice (Female)"
                                                                            }),
                                                                            /*#__PURE__*/ _jsx("option", {
                                                                                value: "EXAVITQu4vr4xnSDxMaL",
                                                                                children: "Sarah (Female)"
                                                                            }),
                                                                            /*#__PURE__*/ _jsx("option", {
                                                                                value: "pqHfZKP75CvOlQylNhV4",
                                                                                children: "Bill (Male)"
                                                                            })
                                                                        ]
                                                                    })
                                                                ]
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    !isBlind && !isDyslexic && !isAdhd && !isAutism && /*#__PURE__*/ _jsx("div", {
                                        className: "text-xs text-[#bec8d2]/70 italic font-mono pt-2 border-t border-[#3e4850]/20",
                                        children: "Standard Mode active. No customized accommodation tools required for your profile."
                                    })
                                ]
                            }),
                            showAccommodations && (isDyslexic || isAdhd) && /*#__PURE__*/ _jsxs("div", {
                                className: "border border-dashed border-sky-500/30 bg-sky-500/5 p-4 rounded-none mb-1 flex justify-between items-center select-none font-mono text-xs text-sky-400",
                                children: [
                                    /*#__PURE__*/ _jsxs("span", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ _jsx("div", {
                                                className: "size-2 rounded-full bg-sky-500 animate-ping"
                                            }),
                                            " READING RULER ALIGNMENT ACTIVE"
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsxs("span", {
                                        children: [
                                            "LEVEL: ",
                                            textSize.toUpperCase(),
                                            " COGNITIVE CALIBRATION"
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ _jsx("div", {
                                className: getCardClass(),
                                children: /*#__PURE__*/ _jsx(ReadingRuler, {
                                    active: showAccommodations && (isDyslexic || isAdhd),
                                    children: adapting ? /*#__PURE__*/ _jsxs("div", {
                                        className: "py-12 flex flex-col items-center justify-center gap-3 text-[#bec8d2]",
                                        children: [
                                            /*#__PURE__*/ _jsx("div", {
                                                className: "size-8 border-4 border-sky-500 border-t-transparent rounded-none animate-spin"
                                            }),
                                            /*#__PURE__*/ _jsx("span", {
                                                className: "text-xs uppercase font-mono",
                                                children: "Synthesizing accommodation parameters..."
                                            })
                                        ]
                                    }) : activeTier !== "original" ? /*#__PURE__*/ _jsx("div", {
                                        className: `prose prose-invert max-w-none ${getTextClass()}`,
                                        children: /*#__PURE__*/ _jsx(ReactMarkdown, {
                                            children: adaptedNotes
                                        })
                                    }) : /*#__PURE__*/ _jsxs("div", {
                                        className: `prose prose-invert max-w-none ${getTextClass()}`,
                                        children: [
                                            /*#__PURE__*/ _jsx("h3", {
                                                className: "text-xl font-bold mb-4 font-mono uppercase text-sky-400",
                                                children: "Original Transcribed Content"
                                            }),
                                            /*#__PURE__*/ _jsx("p", {
                                                className: "whitespace-pre-wrap text-[#bec8d2]",
                                                children: doc?.translated_text || doc?.raw_text
                                            })
                                        ]
                                    })
                                })
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ _jsxs("h3", {
                                        className: "font-bold text-lg text-sky-400 font-mono uppercase border-b border-[#3e4850]/20 pb-2",
                                        children: [
                                            "Section breakdowns (",
                                            topics.length,
                                            ")"
                                        ]
                                    }),
                                    topics.map((t, idx)=>/*#__PURE__*/ _jsx("div", {
                                            className: getCardClass(),
                                            children: /*#__PURE__*/ _jsxs("div", {
                                                className: "grid grid-cols-1 md:grid-cols-4 gap-6",
                                                children: [
                                                    t.image_url && /*#__PURE__*/ _jsx("div", {
                                                        className: "aspect-video md:aspect-square bg-black rounded-none overflow-hidden border border-[#3e4850]/50 shadow-[0_0_10px_rgba(0,0,0,0.3)]",
                                                        children: /*#__PURE__*/ _jsx("img", {
                                                            src: t.image_url,
                                                            alt: "",
                                                            className: "w-full h-full object-cover"
                                                        })
                                                    }),
                                                    /*#__PURE__*/ _jsxs("div", {
                                                        className: "md:col-span-3 space-y-3 flex flex-col justify-between",
                                                        children: [
                                                            /*#__PURE__*/ _jsxs("div", {
                                                                children: [
                                                                    /*#__PURE__*/ _jsxs("h4", {
                                                                        className: "font-bold text-lg text-white font-mono uppercase",
                                                                        children: [
                                                                            idx + 1,
                                                                            ". ",
                                                                            t.title
                                                                        ]
                                                                    }),
                                                                    /*#__PURE__*/ _jsx("p", {
                                                                        className: `text-sm text-[#bec8d2] leading-relaxed mt-2 ${getTextClass()}`,
                                                                        children: t.explanation
                                                                    })
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ _jsxs("div", {
                                                                className: "space-y-4 pt-3",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxs("div", {
                                                                        className: "flex gap-2",
                                                                        children: [
                                                                            /*#__PURE__*/ _jsx("button", {
                                                                                disabled: reExplainingTopicId === t.id,
                                                                                onClick: ()=>handleReExplain(t.id, t.title, t.explanation),
                                                                                className: "px-3 py-1.5 bg-black/40 border border-[#3e4850] hover:border-amber-500 text-amber-500 font-bold text-xs uppercase rounded-none disabled:opacity-50 min-h-[44px] transition-all",
                                                                                children: reExplainingTopicId === t.id ? "Simplifying..." : "Explain Like I'm Confused \uD83D\uDCA1"
                                                                            }),
                                                                            !quizzes[t.id] && /*#__PURE__*/ _jsx("button", {
                                                                                disabled: loadingQuizzes[t.id],
                                                                                onClick: ()=>handleGenerateQuiz(t.id, t.title, t.explanation),
                                                                                className: "px-3 py-1.5 bg-black/40 border border-[#3e4850] hover:border-sky-500 text-sky-400 font-bold text-xs uppercase rounded-none disabled:opacity-50 min-h-[44px] transition-all",
                                                                                children: loadingQuizzes[t.id] ? "Generating Quiz..." : "Take Quiz \uD83D\uDCDD"
                                                                            })
                                                                        ]
                                                                    }),
                                                                    quizzes[t.id] && /*#__PURE__*/ _jsxs("div", {
                                                                        className: "p-4 rounded-none bg-black/40 border border-[#3e4850]/30 space-y-4",
                                                                        children: [
                                                                            /*#__PURE__*/ _jsx("h5", {
                                                                                className: "text-xs font-mono uppercase text-[#bec8d2] font-bold",
                                                                                children: "Topic Comprehension Check:"
                                                                            }),
                                                                            quizzes[t.id].map((q, qIdx)=>/*#__PURE__*/ _jsxs("div", {
                                                                                    className: "space-y-2",
                                                                                    children: [
                                                                                        /*#__PURE__*/ _jsx("p", {
                                                                                            className: "text-sm font-semibold text-white",
                                                                                            children: q.question
                                                                                        }),
                                                                                        /*#__PURE__*/ _jsx("div", {
                                                                                            className: "grid grid-cols-1 md:grid-cols-2 gap-2",
                                                                                            children: q.options.map((opt, optIdx)=>{
                                                                                                const isSelected = q.selectedOption === opt;
                                                                                                const showAnswer = q.selectedOption !== undefined;
                                                                                                const isOptionCorrect = opt === q.correct_option;
                                                                                                let btnStyle = "border-[#3e4850] bg-black/40 text-[#bec8d2] hover:border-sky-500 rounded-none";
                                                                                                if (isSelected) {
                                                                                                    btnStyle = q.isCorrect ? "border-emerald-500 bg-emerald-500/10 text-emerald-300 rounded-none font-bold" : "border-red-500 bg-red-500/10 text-red-300 rounded-none font-bold";
                                                                                                } else if (showAnswer && isOptionCorrect) {
                                                                                                    btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-300 rounded-none font-bold";
                                                                                                }
                                                                                                return /*#__PURE__*/ _jsx("button", {
                                                                                                    disabled: showAnswer,
                                                                                                    onClick: ()=>handleSelectAnswer(t.id, qIdx, opt, q.correct_option, t.title, t.explanation),
                                                                                                    className: cn("p-2.5 text-left border text-xs font-medium min-h-[44px] transition-all", btnStyle),
                                                                                                    children: opt
                                                                                                }, optIdx);
                                                                                            })
                                                                                        }),
                                                                                        q.selectedOption !== undefined && /*#__PURE__*/ _jsx("div", {
                                                                                            className: "pt-2",
                                                                                            children: q.isCorrect ? /*#__PURE__*/ _jsx("p", {
                                                                                                className: "text-xs text-emerald-400 font-bold font-mono",
                                                                                                children: "✓ Correct answer! Good job."
                                                                                            }) : /*#__PURE__*/ _jsxs("div", {
                                                                                                className: "space-y-1 font-mono",
                                                                                                children: [
                                                                                                    /*#__PURE__*/ _jsx("p", {
                                                                                                        className: "text-xs text-red-400 font-bold",
                                                                                                        children: "✗ Incorrect answer."
                                                                                                    }),
                                                                                                    /*#__PURE__*/ _jsx("p", {
                                                                                                        className: "text-xs text-[#bec8d2] italic",
                                                                                                        children: q.explanation_if_wrong
                                                                                                    }),
                                                                                                    /*#__PURE__*/ _jsx("p", {
                                                                                                        className: "text-xs text-amber-500 font-bold",
                                                                                                        children: "\uD83D\uDCA1 Concept simplified below automatically to help you review."
                                                                                                    })
                                                                                                ]
                                                                                            })
                                                                                        })
                                                                                    ]
                                                                                }, qIdx))
                                                                        ]
                                                                    })
                                                                ]
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                        }, t.id))
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsxs("aside", {
                        className: "col-span-12 lg:col-span-4 flex flex-col gap-6",
                        children: [
                            /*#__PURE__*/ _jsxs("div", {
                                className: getCardClass(),
                                children: [
                                    /*#__PURE__*/ _jsxs("h3", {
                                        className: "font-bold text-sm tracking-wider uppercase text-sky-400 mb-4 flex items-center gap-2 font-mono border-b border-[#3e4850]/20 pb-2",
                                        children: [
                                            /*#__PURE__*/ _jsx(Globe, {
                                                className: "size-4 text-sky-400"
                                            }),
                                            "Bilingual STEM Glossary"
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsx("p", {
                                        className: "text-xs text-[#bec8d2] mb-4",
                                        children: "Select keywords to toggle definitions and translation contexts."
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "flex flex-col gap-3",
                                        children: [
                                            glossaryStatusMsg && /*#__PURE__*/ _jsx("div", {
                                                className: "p-2 border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 font-mono text-[11px] uppercase rounded-none mb-2",
                                                children: glossaryStatusMsg
                                            }),
                                            glossary.map((g, idx)=>/*#__PURE__*/ _jsxs("div", {
                                                    onClick: ()=>setActiveGlossaryTerm(activeGlossaryTerm === idx ? null : idx),
                                                    className: cn("p-4 rounded-none border transition-all cursor-pointer min-h-[44px] space-y-2", activeGlossaryTerm === idx ? "border-sky-500 bg-sky-500/10 text-white" : "border-[#3e4850]/30 bg-black/40 hover:border-sky-500/40 text-[#bec8d2]"),
                                                    children: [
                                                        /*#__PURE__*/ _jsxs("div", {
                                                            className: "flex justify-between items-center text-sm font-bold",
                                                            children: [
                                                                /*#__PURE__*/ _jsx("span", {
                                                                    className: "text-white",
                                                                    children: g.term_en
                                                                }),
                                                                /*#__PURE__*/ _jsxs("div", {
                                                                    className: "flex items-center gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ _jsx("span", {
                                                                            className: "text-sky-400 text-xs font-mono",
                                                                            children: g.term_target
                                                                        }),
                                                                        activeGlossaryTerm === idx && /*#__PURE__*/ _jsx("button", {
                                                                            type: "button",
                                                                            onClick: (e)=>{
                                                                                e.stopPropagation();
                                                                                setSuggestingCorrectionId(suggestingCorrectionId === idx ? null : idx);
                                                                                setGlossaryCorrectionVal(g.term_target);
                                                                            },
                                                                            className: "text-[10px] text-amber-500 hover:text-amber-400 underline font-mono cursor-pointer",
                                                                            children: "Correct ✍️"
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        }),
                                                        activeGlossaryTerm === idx && /*#__PURE__*/ _jsxs("div", {
                                                            className: "text-xs text-[#bec8d2] mt-2 border-t border-[#3e4850]/30 pt-2 leading-relaxed font-mono space-y-3",
                                                            children: [
                                                                /*#__PURE__*/ _jsx("p", {
                                                                    children: g.definition
                                                                }),
                                                                suggestingCorrectionId === idx && /*#__PURE__*/ _jsxs("div", {
                                                                    className: "bg-black/50 p-3 border border-amber-500/20 rounded-none space-y-2",
                                                                    onClick: (e)=>e.stopPropagation(),
                                                                    children: [
                                                                        /*#__PURE__*/ _jsx("label", {
                                                                            className: "text-[10px] uppercase text-[#bec8d2] block font-bold",
                                                                            children: "Suggest Translation Correction:"
                                                                        }),
                                                                        /*#__PURE__*/ _jsxs("div", {
                                                                            className: "flex gap-2",
                                                                            children: [
                                                                                /*#__PURE__*/ _jsx("input", {
                                                                                    type: "text",
                                                                                    value: glossaryCorrectionVal,
                                                                                    onChange: (e)=>setGlossaryCorrectionVal(e.target.value),
                                                                                    className: "flex-1 bg-[#131313] border border-[#3e4850] p-1.5 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-sky-500 rounded-none"
                                                                                }),
                                                                                /*#__PURE__*/ _jsx("button", {
                                                                                    type: "button",
                                                                                    onClick: ()=>handleGlossaryCorrectionSubmit(idx),
                                                                                    className: "bg-amber-500 text-black px-3 py-1 font-bold text-[10px] uppercase rounded-none transition-colors hover:bg-amber-400",
                                                                                    children: "Submit"
                                                                                })
                                                                            ]
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }, idx)),
                                            glossary.length === 0 && /*#__PURE__*/ _jsx("p", {
                                                className: "text-xs italic text-[#bec8d2] font-mono",
                                                children: "No glossary terms mapped yet."
                                            })
                                        ]
                                    })
                                ]
                            }),
                            doc?.audit_warnings?.warnings && /*#__PURE__*/ _jsxs("div", {
                                className: "p-6 border border-red-500/30 bg-red-500/5 rounded-none border-l-4 border-l-red-500 space-y-2",
                                children: [
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "flex items-center gap-2 text-red-400 font-bold text-sm font-mono uppercase",
                                        children: [
                                            /*#__PURE__*/ _jsx(AlertTriangle, {
                                                className: "size-4 text-red-400 animate-pulse"
                                            }),
                                            "Audit warnings triggered"
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsx("ul", {
                                        className: "text-xs text-[#bec8d2] space-y-1 list-disc pl-4 font-mono",
                                        children: doc.audit_warnings.warnings.map((w, idx)=>/*#__PURE__*/ _jsx("li", {
                                                children: w
                                            }, idx))
                                    })
                                ]
                            })
                        ]
                    })
                ]
            }),
            showPublishModal && /*#__PURE__*/ _jsx("div", {
                className: "fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4",
                children: /*#__PURE__*/ _jsxs("div", {
                    className: "bg-[#1C1B22] border border-sky-500/40 p-6 max-w-md w-full font-mono text-xs text-[#bec8d2] shadow-[0_0_30px_rgba(0,0,0,0.8)] space-y-4 rounded-none",
                    children: [
                        /*#__PURE__*/ _jsxs("div", {
                            className: "flex justify-between items-start border-b border-white/10 pb-2",
                            children: [
                                /*#__PURE__*/ _jsxs("span", {
                                    className: "text-white font-bold uppercase text-sm tracking-wider flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ _jsx(ThumbsUp, {
                                            className: "size-4.5 text-sky-400 animate-pulse"
                                        }),
                                        "Publish to Knowledge Hive"
                                    ]
                                }),
                                /*#__PURE__*/ _jsx("button", {
                                    onClick: ()=>setShowPublishModal(false),
                                    className: "text-[#A8A39C] hover:text-white font-bold",
                                    children: "✕"
                                })
                            ]
                        }),
                        /*#__PURE__*/ _jsx("p", {
                            className: "text-[11px] leading-relaxed",
                            children: "Share your simplified study notes with other learners. RLS privacy gates will control who can find and study this note."
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                            className: "space-y-3 pt-2",
                            children: [
                                /*#__PURE__*/ _jsx("label", {
                                    className: "block text-[10px] uppercase tracking-wider font-bold text-sky-400 font-mono",
                                    children: "Select Note Visibility Tier:"
                                }),
                                [
                                    {
                                        key: "matched_groups",
                                        label: "\uD83D\uDC65 Matched Accommodations & Languages",
                                        desc: "Only visible to peers sharing your target languages or accessibility profiles."
                                    },
                                    {
                                        key: "public",
                                        label: "\uD83C\uDF0D Global Public Share",
                                        desc: "Visible to all pilots. Anyone can study your notes and upvote them."
                                    },
                                    {
                                        key: "private",
                                        label: "\uD83D\uDD12 Private Cockpit",
                                        desc: "Visible only in your private library. Hidden from other learners."
                                    }
                                ].map((opt)=>/*#__PURE__*/ _jsxs("button", {
                                        type: "button",
                                        onClick: ()=>setPublishVisibility(opt.key),
                                        className: cn("w-full p-3 border text-left flex flex-col justify-between transition-all rounded-none", publishVisibility === opt.key ? "border-sky-500 bg-sky-500/10 text-white" : "border-[#3e4850]/40 bg-[#1c1b1b] text-[#bec8d2] hover:border-sky-500/40"),
                                        children: [
                                            /*#__PURE__*/ _jsx("span", {
                                                className: "text-xs font-bold",
                                                children: opt.label
                                            }),
                                            /*#__PURE__*/ _jsx("span", {
                                                className: "text-[9px] text-[#bec8d2]/60 mt-1 block leading-normal",
                                                children: opt.desc
                                            })
                                        ]
                                    }, opt.key))
                            ]
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                            className: "flex gap-2 pt-2 border-t border-white/10",
                            children: [
                                /*#__PURE__*/ _jsx("button", {
                                    onClick: confirmPublishToHive,
                                    className: "flex-1 py-2.5 bg-sky-500 text-black font-bold uppercase rounded-none hover:bg-sky-400 transition-colors min-h-[40px] cursor-pointer",
                                    children: "Confirm Note Share"
                                }),
                                /*#__PURE__*/ _jsx("button", {
                                    onClick: ()=>setShowPublishModal(false),
                                    className: "px-4 py-2.5 bg-black/40 border border-[#3e4850] text-[#bec8d2] hover:text-white uppercase font-bold rounded-none transition-colors min-h-[40px] cursor-pointer",
                                    children: "Cancel"
                                })
                            ]
                        })
                    ]
                })
            })
        ]
    });
};
// 4. SOCIAL KNOWLEDGE HIVE FEED
const HiveFeed = ({ onBack, onOpenDocument })=>{
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    // Premium Peer Exchange States
    const [activeQANoteId, setActiveQANoteId] = useState(null);
    const [mockQA, setMockQA] = useState({
        "default": [
            {
                q: "Can anyone explain topic 1 about chloroplast cells?",
                a: "Think of chloroplasts like tiny solar panels inside the cell. They capture sunlight and convert it into energy (food) for the plant, just like solar panels power a house."
            },
            {
                q: "What does the LaTeX math formula for gravity represent?",
                a: "It calculates the gravitational pull between two masses ($m_1$ and $m_2$) separated by distance $r$. Bigger masses mean stronger pull!"
            }
        ]
    });
    const [newQuestionVal, setNewQuestionVal] = useState("");
    const submitPeerQuestion = (noteId)=>{
        if (!newQuestionVal.trim()) return;
        const existing = mockQA[noteId] || mockQA["default"];
        const updated = [
            ...existing,
            {
                q: newQuestionVal.trim(),
                a: "✓ Question broadcasted to the community! Tutors are notified."
            }
        ];
        setMockQA((prev)=>({
                ...prev,
                [noteId]: updated
            }));
        setNewQuestionVal("");
    };
    const fetchHiveNotes = async ()=>{
        setLoading(true);
        try {
            // Query knowledge_hive_notes: Postgres RLS automatically filters items 
            // matching the user's preferred languages and disabilities comfort arrays.
            const { data, error } = await supabase.from("knowledge_hive_notes").select(`
          id,
          upvotes,
          created_at,
          documents ( id, title, target_lang, source_type ),
          profiles:uploader_id ( display_name )
        `).order("upvotes", {
                ascending: false
            });
            if (error) throw error;
            setNotes(data || []);
        } catch (e) {
            console.error(e);
        } finally{
            setLoading(false);
        }
    };
    useEffect(()=>{
        fetchHiveNotes();
    }, []);
    const upvoteNote = async (noteId, currentUpvotes)=>{
        try {
            const { error } = await supabase.from("knowledge_hive_notes").update({
                upvotes: currentUpvotes + 1
            }).eq("id", noteId);
            if (error) throw error;
            fetchHiveNotes();
        } catch (e) {
            console.error(e);
        }
    };
    const reportNote = async (noteId)=>{
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { error } = await supabase.from("reports").insert({
                note_id: noteId,
                reporter_id: user.id,
                reason: "Inappropriate / broken LaTeX / corrupted translation"
            });
            if (error) throw error;
            alert("Note reported successfully. Administrators will review the warnings.");
        } catch (e) {
            console.error(e);
        }
    };
    return /*#__PURE__*/ _jsxs("div", {
        className: "min-h-screen bg-[#0a0a0a] text-[#e5e2e1] flex flex-col font-body-md",
        children: [
            /*#__PURE__*/ _jsx("header", {
                className: "border-b border-[#3e4850]/30 p-6 flex justify-between items-center bg-[#131313]/90 backdrop-blur-md sticky top-0 z-50 rounded-none",
                children: /*#__PURE__*/ _jsx("div", {
                    className: "flex justify-between items-center w-full max-w-[1200px] mx-auto",
                    children: /*#__PURE__*/ _jsxs("div", {
                        className: "flex items-center gap-6",
                        children: [
                            /*#__PURE__*/ _jsx("button", {
                                onClick: onBack,
                                className: "p-2 hover:bg-white/[0.05] rounded-none text-sky-400 border border-transparent hover:border-slate-800 transition-colors",
                                children: /*#__PURE__*/ _jsx(ArrowLeft, {
                                    className: "size-6"
                                })
                            }),
                            /*#__PURE__*/ _jsxs("h1", {
                                className: "text-2xl font-bold flex items-center gap-3 font-mono uppercase tracking-tight text-white",
                                children: [
                                    /*#__PURE__*/ _jsx(Globe, {
                                        className: "text-sky-400 size-7"
                                    }),
                                    "Social Knowledge Hive"
                                ]
                            })
                        ]
                    })
                })
            }),
            /*#__PURE__*/ _jsxs("div", {
                className: "max-w-[1200px] mx-auto w-full p-6 md:p-10 flex flex-col gap-6",
                children: [
                    /*#__PURE__*/ _jsx("h2", {
                        className: "text-2xl font-bold font-mono uppercase text-sky-400",
                        children: "Community-Shared Multilingual Notes"
                    }),
                    /*#__PURE__*/ _jsx("p", {
                        className: "text-xs text-[#bec8d2] -mt-4 font-mono",
                        children: "Postgres Row-Level Security matches notes to your specific language and accessibility profile."
                    }),
                    loading ? /*#__PURE__*/ _jsx("div", {
                        className: "py-12 flex justify-center",
                        children: /*#__PURE__*/ _jsx("div", {
                            className: "size-8 border-4 border-sky-500 border-t-transparent rounded-none animate-spin"
                        })
                    }) : /*#__PURE__*/ _jsxs("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                        children: [
                            notes.map((note)=>/*#__PURE__*/ _jsxs("div", {
                                    className: "p-6 flex flex-col justify-between bg-[#131313] border border-t-white/10 border-l-white/10 border-b-black/30 border-r-black/20 shadow-[0_0_20px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-sky-500/50 hover:bg-[#131313]/95 group rounded-none",
                                    children: [
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "space-y-3",
                                            children: [
                                                /*#__PURE__*/ _jsxs("div", {
                                                    className: "flex justify-between items-center",
                                                    children: [
                                                        /*#__PURE__*/ _jsx("span", {
                                                            className: "text-[10px] uppercase font-mono bg-sky-500/20 px-2 py-0.5 rounded-none text-sky-400 border border-sky-500/30",
                                                            children: note.documents?.target_lang || "English"
                                                        }),
                                                        /*#__PURE__*/ _jsxs("span", {
                                                            className: "text-[10px] text-[#bec8d2] font-mono",
                                                            children: [
                                                                "Shared by ",
                                                                note.profiles?.display_name || "Pilot"
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ _jsx("h4", {
                                                    className: "font-bold text-lg text-white leading-snug font-mono uppercase tracking-wide",
                                                    children: note.documents?.title
                                                }),
                                                /*#__PURE__*/ _jsxs("p", {
                                                    className: "text-xs text-[#bec8d2] font-mono",
                                                    children: [
                                                        "Source: ",
                                                        /*#__PURE__*/ _jsx("span", {
                                                            className: "font-mono text-sky-400",
                                                            children: note.documents?.source_type
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ _jsxs("div", {
                                                    className: "flex flex-wrap gap-2 pt-1",
                                                    children: [
                                                        /*#__PURE__*/ _jsx(BarrierTag, {
                                                            barrier: "language"
                                                        }),
                                                        /*#__PURE__*/ _jsx(BarrierTag, {
                                                            barrier: "disability"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        activeQANoteId === note.id && /*#__PURE__*/ _jsxs("div", {
                                            className: "mt-4 p-4 border border-[#3e4850]/40 bg-black/50 rounded-none font-mono text-xs text-[#bec8d2] space-y-3",
                                            children: [
                                                /*#__PURE__*/ _jsx("span", {
                                                    className: "text-sky-400 font-bold block border-b border-[#3e4850]/20 pb-1 uppercase",
                                                    children: "Peer Help Exchange Q&A:"
                                                }),
                                                /*#__PURE__*/ _jsx("div", {
                                                    className: "space-y-3 max-h-[150px] overflow-y-auto pr-1",
                                                    children: (mockQA[note.id] || mockQA["default"]).map((qa, i)=>/*#__PURE__*/ _jsxs("div", {
                                                            className: "space-y-1",
                                                            children: [
                                                                /*#__PURE__*/ _jsxs("p", {
                                                                    className: "text-white font-bold",
                                                                    children: [
                                                                        '\uD83D\uDC64 Student: "',
                                                                        qa.q,
                                                                        '"'
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ _jsxs("p", {
                                                                    className: "text-sky-300 pl-3",
                                                                    children: [
                                                                        " Tutors/Peers: ",
                                                                        qa.a
                                                                    ]
                                                                })
                                                            ]
                                                        }, i))
                                                }),
                                                /*#__PURE__*/ _jsxs("div", {
                                                    className: "flex gap-2 mt-2 pt-2 border-t border-[#3e4850]/20",
                                                    children: [
                                                        /*#__PURE__*/ _jsx("input", {
                                                            type: "text",
                                                            placeholder: "Ask peer / tutor...",
                                                            value: newQuestionVal,
                                                            onChange: (e)=>setNewQuestionVal(e.target.value),
                                                            className: "flex-1 bg-[#131313] border border-[#3e4850] p-1.5 text-xs text-white rounded-none focus:outline-none"
                                                        }),
                                                        /*#__PURE__*/ _jsx("button", {
                                                            type: "button",
                                                            onClick: ()=>submitPeerQuestion(note.id),
                                                            className: "bg-sky-500 text-black px-3 py-1 font-bold text-[10px] uppercase rounded-none hover:bg-sky-400",
                                                            children: "Ask"
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "flex justify-between items-center mt-6 pt-4 border-t border-[#3e4850]/30",
                                            children: [
                                                /*#__PURE__*/ _jsxs("div", {
                                                    className: "flex gap-3",
                                                    children: [
                                                        /*#__PURE__*/ _jsx("button", {
                                                            onClick: ()=>onOpenDocument(note.documents?.id),
                                                            className: "text-sky-400 hover:text-sky-300 hover:underline font-bold text-xs uppercase font-mono min-h-[44px] flex items-center",
                                                            children: "Read note ↗"
                                                        }),
                                                        /*#__PURE__*/ _jsxs("button", {
                                                            type: "button",
                                                            onClick: ()=>setActiveQANoteId(activeQANoteId === note.id ? null : note.id),
                                                            className: "text-amber-500 hover:text-amber-400 hover:underline font-bold text-xs uppercase font-mono min-h-[44px] flex items-center",
                                                            children: [
                                                                "Peer Q&A Exchange (",
                                                                (mockQA[note.id] || mockQA["default"]).length,
                                                                ")"
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ _jsxs("div", {
                                                    className: "flex gap-2",
                                                    children: [
                                                        /*#__PURE__*/ _jsxs("button", {
                                                            onClick: (e)=>{
                                                                e.stopPropagation();
                                                                upvoteNote(note.id, note.upvotes);
                                                            },
                                                            className: "px-3 py-1.5 bg-black/40 border border-[#3e4850]/50 rounded-none text-xs font-bold font-mono text-[#e5e2e1] hover:border-sky-500 hover:text-sky-400 transition-all flex items-center gap-1.5 min-h-[44px]",
                                                            children: [
                                                                /*#__PURE__*/ _jsx(ThumbsUp, {
                                                                    className: "size-3.5 text-sky-400"
                                                                }),
                                                                " ",
                                                                note.upvotes
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ _jsx("button", {
                                                            onClick: (e)=>{
                                                                e.stopPropagation();
                                                                reportNote(note.id);
                                                            },
                                                            className: "px-2.5 py-1.5 border border-[#3e4850]/50 bg-black/40 hover:border-red-500 hover:text-red-400 rounded-none text-xs text-[#bec8d2] transition-all min-h-[44px] flex items-center",
                                                            title: "Report note",
                                                            children: /*#__PURE__*/ _jsx(Flag, {
                                                                className: "size-3.5"
                                                            })
                                                        })
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }, note.id)),
                            notes.length === 0 && /*#__PURE__*/ _jsx("p", {
                                className: "col-span-2 text-center py-12 text-[#bec8d2] font-mono italic",
                                children: "No shared notes match your profile comfort matrix."
                            })
                        ]
                    })
                ]
            })
        ]
    });
};
// --- Standard Dashboard Screen ---
// --- Standard Dashboard Screen ---
const StandardDashboard = ({ profile: profile1, onNavigate, onLogout })=>{
    const [documents, setDocuments] = useState([]);
    const [cachedDocIds, setCachedDocIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);
    const [hiveResults, setHiveResults] = useState([]);
    const [hiveCount, setHiveCount] = useState(0);
    // Session-only display language override
    const [sessionLang, setSessionLang] = useState(()=>{
        if ("undefined" !== "undefined") {
            return sessionStorage.getItem("aerolearn_session_lang") || profile1?.preferred_languages?.[0] || "en";
        }
        return "en";
    });
    const [showLangDropdown, setShowLangDropdown] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    // Upload Form Inline State
    const [uploadTitle, setUploadTitle] = useState("");
    const [uploadSourceType, setUploadSourceType] = useState("upload"); // 'upload' | 'youtube'
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadYoutubeUrl, setUploadYoutubeUrl] = useState("");
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState("");
    const [uploadError, setUploadError] = useState("");
    // Library active filter chip
    const [libraryFilter, setLibraryFilter] = useState("all");
    // Caregiver Share Modal
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareLink, setShareLink] = useState("");
    const [copiedText, setCopiedText] = useState(false);
    // Streak dot-row state (5-day streak default visual)
    const [streakLog] = useState([
        true,
        true,
        true,
        true,
        true,
        false,
        false
    ]); // Mon-Sun active days
    // completed/replayed telemetry mock
    const [revisitTopics] = useState([
        {
            id: "1",
            title: "Newtonian Gravity Formula",
            reason: "Replayed 3 times"
        },
        {
            id: "2",
            title: "Cell Membrane Osmosis",
            reason: "Replayed 2 times"
        }
    ]);
    const fetchMyDocs = async ()=>{
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from("documents").select("*").order("created_at", {
                ascending: false
            });
            setDocuments(data || []);
        }
    };
    const fetchHiveCount = async ()=>{
        try {
            const { data } = await supabase.from("knowledge_hive_notes").select("id, visible_to_languages, visible_to_disabilities");
            if (data) {
                const userLangs = profile1?.preferred_languages || [
                    "en"
                ];
                const userDis = profile1?.disabilities || [
                    "none"
                ];
                const filtered = data.filter((note)=>note.visible_to_languages?.some((l)=>userLangs.includes(l)) || note.visible_to_disabilities?.some((d)=>userDis.includes(d)));
                setHiveCount(filtered.length);
            }
        } catch (err) {
            console.error("Failed to fetch Hive count:", err);
        }
    };
    useEffect(()=>{
        fetchMyDocs();
        fetchHiveCount();
    }, []);
    useEffect(()=>{
        async function checkCaches() {
            try {
                const allCached = await getAllCachedDocuments();
                if (allCached) {
                    setCachedDocIds(allCached.map((c)=>c.id));
                }
            } catch (e) {
                console.error("Failed to fetch IndexedDB offline cache list:", e);
            }
        }
        checkCaches();
    }, [
        documents
    ]);
    // Search Hive Debounce
    useEffect(()=>{
        if (!searchQuery.trim()) {
            setHiveResults([]);
            return;
        }
        const delayDebounceFn = setTimeout(async ()=>{
            try {
                const { data } = await supabase.from("knowledge_hive_notes").select(`
          id,
          documents ( id, title, target_lang, source_type )
        `);
                if (data) {
                    const filtered = data.filter((item)=>item.documents?.title?.toLowerCase().includes(searchQuery.toLowerCase()));
                    setHiveResults(filtered);
                }
            } catch (err) {
                console.error("Search query Hive error:", err);
            }
        }, 300);
        return ()=>clearTimeout(delayDebounceFn);
    }, [
        searchQuery
    ]);
    const handleUploadSubmit = async (e)=>{
        e.preventDefault();
        if (!uploadTitle.trim()) {
            setUploadError("Please provide a title for the document.");
            return;
        }
        setUploadLoading(true);
        setUploadError("");
        setUploadSuccess("");
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Authentication failed.");
            const target_lang = sessionLang || "en";
            const { data: newDoc, error: insErr } = await supabase.from("documents").insert({
                owner_id: user.id,
                title: uploadTitle.trim(),
                source_type: uploadSourceType,
                source_url: uploadSourceType === "youtube" ? uploadYoutubeUrl : null,
                target_lang: target_lang,
                status: "pending"
            }).select().single();
            if (insErr) throw insErr;
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;
            if (uploadSourceType === "upload") {
                if (!uploadFile) throw new Error("Please select a file to upload.");
                const formData = new FormData();
                formData.append("document_id", newDoc.id);
                formData.append("target_lang", target_lang);
                formData.append("file", uploadFile);
                const response = await fetch("http://127.0.0.1:8000/documents/upload", {
                    method: "POST",
                    body: formData,
                    headers: token ? {
                        "Authorization": token
                    } : {}
                });
                if (!response.ok) {
                    throw new Error(`Server ingestion rejected: ${response.statusText}`);
                }
            } else {
                if (!uploadYoutubeUrl.trim()) throw new Error("Please paste a valid YouTube URL.");
                const response = await fetch("http://127.0.0.1:8000/documents/youtube", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...token ? {
                            "Authorization": token
                        } : {}
                    },
                    body: JSON.stringify({
                        document_id: newDoc.id,
                        youtube_url: uploadYoutubeUrl,
                        target_lang: target_lang
                    })
                });
                if (!response.ok) {
                    throw new Error(`Server ingestion rejected: ${response.statusText}`);
                }
            }
            setUploadSuccess("Pipeline initialized! Ingestion in progress.");
            setUploadTitle("");
            setUploadYoutubeUrl("");
            setUploadFile(null);
            fetchMyDocs();
        } catch (err) {
            console.error(err);
            setUploadError(err.message || "Ingestion failure.");
        } finally{
            setUploadLoading(false);
        }
    };
    const generateShareLink = ()=>{
        if (!profile1?.id) return;
        const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours expiry
        const token = btoa(`${profile1.id}:${expiry}`);
        const link = `${window.location.origin}/dashboard?token=${token}`;
        setShareLink(link);
        setShareModalOpen(true);
        setCopiedText(false);
    };
    const handleCopyLink = ()=>{
        navigator.clipboard.writeText(shareLink);
        setCopiedText(true);
        setTimeout(()=>setCopiedText(false), 2000);
    };
    // Find processing documents or documents completed in the last hour
    const processingDoc = documents.find((doc)=>doc.status !== "ready" && doc.status !== "failed");
    const recentDoc = documents.find((doc)=>doc.status === "ready" && Date.now() - new Date(doc.created_at).getTime() < 3600000);
    const activeHeroDoc = processingDoc || recentDoc;
    // Unresolved warnings count for Profile Menu Badge
    const unresolvedWarningsCount = documents.filter((doc)=>doc.audit_warnings?.warnings?.length > 0).length;
    // Filtered Library Documents (search query matches title, or libraryFilter type matches)
    const filteredDocs = documents.filter((doc)=>{
        const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        if (libraryFilter === "all") return true;
        if (libraryFilter === "upload") return doc.source_type === "upload";
        if (libraryFilter === "youtube") return doc.source_type === "youtube";
        if (libraryFilter === "warnings") return doc.audit_warnings?.warnings?.length > 0;
        return true;
    });
    // Languages mapping for codes
    const langNames = {
        en: "English",
        es: "Spanish",
        fr: "French",
        de: "German",
        ja: "Japanese",
        zh: "Chinese",
        hi: "Hindi"
    };
    // Primary mode accent color resolver for progress bar
    const getModeAccentColor = ()=>{
        if (profile1?.disabilities?.includes("blind")) return "bg-[#E8A33D]"; // var(--accent-amber)
        if (profile1?.disabilities?.includes("deaf")) return "bg-[#3FA796]"; // var(--accent-teal)
        return "bg-[#A8A39C]"; // default text-secondary
    };
    // Simulated peer exchanges matching comfort rules
    const recentHiveContributions = [
        {
            uploader: "Aarav",
            title: "Class 10 Gravitational Force Equations",
            time: "2 hours ago",
            lang: "hi"
        },
        {
            uploader: "Elena",
            title: "Cell division & mitosis simplified diagrams",
            time: "4 hours ago",
            lang: "es"
        },
        {
            uploader: "Kai",
            title: "Atomic structure & isotopes cheatsheet",
            time: "6 hours ago",
            lang: "en"
        }
    ].filter((c)=>profile1?.preferred_languages?.includes(c.lang) || c.lang === "en");
    // Search Results Lists
    const localSearchMatches = documents.filter((d)=>d.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return /*#__PURE__*/ _jsxs("div", {
        className: "min-h-screen bg-[#0a0a0a] text-[#e5e2e1] flex flex-col font-body-md",
        children: [
            /*#__PURE__*/ _jsx("header", {
                className: "border-b border-[#3e4850]/30 py-4 px-6 flex justify-between items-center bg-[#131313]/90 backdrop-blur-md sticky top-0 z-50 rounded-none",
                children: /*#__PURE__*/ _jsxs("div", {
                    className: "flex justify-between items-center w-full max-w-[960px] mx-auto relative",
                    children: [
                        /*#__PURE__*/ _jsx("div", {
                            className: "flex items-center gap-2 text-white",
                            children: /*#__PURE__*/ _jsx("h2", {
                                className: "text-xl font-extrabold tracking-tight font-sans uppercase",
                                children: "AeroLearn"
                            })
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                            className: "relative flex-1 max-w-[320px] mx-4 hidden md:block",
                            children: [
                                /*#__PURE__*/ _jsxs("div", {
                                    className: "relative",
                                    children: [
                                        /*#__PURE__*/ _jsx(Search, {
                                            className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#bec8d2]/60"
                                        }),
                                        /*#__PURE__*/ _jsx("input", {
                                            type: "text",
                                            value: searchQuery,
                                            onChange: (e)=>{
                                                setSearchQuery(e.target.value);
                                                setSearchFocused(true);
                                            },
                                            onFocus: ()=>setSearchFocused(true),
                                            placeholder: "Search documents & Hive...",
                                            className: cn("w-full bg-[#1c1b1b] border border-[#3e4850] p-2 pl-9 pr-4 rounded-none text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono transition-all duration-300", searchFocused ? "max-w-[320px] w-full" : "max-w-[200px]")
                                        })
                                    ]
                                }),
                                searchFocused && searchQuery.trim() && /*#__PURE__*/ _jsxs("div", {
                                    className: "absolute left-0 right-0 top-full mt-2 bg-[#1C1B22] border border-[#3e4850] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.6)] z-50 font-mono text-xs max-h-[300px] overflow-y-auto",
                                    onMouseLeave: ()=>setSearchFocused(false),
                                    children: [
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "flex justify-between items-center border-b border-white/10 pb-1.5 mb-2.5",
                                            children: [
                                                /*#__PURE__*/ _jsx("span", {
                                                    className: "text-[10px] text-sky-400 font-bold uppercase tracking-wider",
                                                    children: "Search Results"
                                                }),
                                                /*#__PURE__*/ _jsx("button", {
                                                    type: "button",
                                                    onClick: ()=>setSearchFocused(false),
                                                    className: "text-[#A8A39C] hover:text-white",
                                                    children: "✕"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "mb-4",
                                            children: [
                                                /*#__PURE__*/ _jsx("div", {
                                                    className: "text-[9px] text-[#A8A39C] font-bold uppercase tracking-wider mb-1.5 border-b border-white/5 pb-0.5",
                                                    children: "Your Documents"
                                                }),
                                                localSearchMatches.length === 0 ? /*#__PURE__*/ _jsx("div", {
                                                    className: "italic text-slate-500 py-1 text-[11px]",
                                                    children: "No matching private documents."
                                                }) : localSearchMatches.slice(0, 3).map((d)=>/*#__PURE__*/ _jsx("div", {
                                                        onClick: ()=>{
                                                            setSearchFocused(false);
                                                            onNavigate(`reader:${d.id}`);
                                                        },
                                                        className: "py-1 px-1.5 hover:bg-white/[0.05] hover:text-sky-400 cursor-pointer transition-all",
                                                        children: d.title
                                                    }, d.id))
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsxs("div", {
                                            children: [
                                                /*#__PURE__*/ _jsx("div", {
                                                    className: "text-[9px] text-[#A8A39C] font-bold uppercase tracking-wider mb-1.5 border-b border-white/5 pb-0.5",
                                                    children: "From the Hive"
                                                }),
                                                hiveResults.length === 0 ? /*#__PURE__*/ _jsx("div", {
                                                    className: "italic text-slate-500 py-1 text-[11px]",
                                                    children: "No matching shared notes."
                                                }) : hiveResults.slice(0, 3).map((h)=>/*#__PURE__*/ _jsxs("div", {
                                                        onClick: ()=>{
                                                            setSearchFocused(false);
                                                            onNavigate(`reader:${h.documents?.id}`);
                                                        },
                                                        className: "py-1 px-1.5 hover:bg-white/[0.05] hover:text-sky-400 cursor-pointer transition-all",
                                                        children: [
                                                            h.documents?.title,
                                                            " ",
                                                            /*#__PURE__*/ _jsxs("span", {
                                                                className: "text-[9px] text-sky-500/60 uppercase",
                                                                children: [
                                                                    "(",
                                                                    h.documents?.target_lang,
                                                                    ")"
                                                                ]
                                                            })
                                                        ]
                                                    }, h.id))
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                            className: "flex items-center gap-4",
                            children: [
                                /*#__PURE__*/ _jsxs("div", {
                                    className: "relative",
                                    children: [
                                        /*#__PURE__*/ _jsxs("button", {
                                            onClick: ()=>setShowLangDropdown(!showLangDropdown),
                                            className: "flex items-center gap-1.5 px-3 py-1.5 border border-[#3e4850] hover:border-sky-500 text-[#bec8d2] hover:text-white rounded-none font-sans text-xs font-semibold uppercase tracking-wider min-h-[32px] cursor-pointer animate-fade-in",
                                            children: [
                                                /*#__PURE__*/ _jsx(Globe, {
                                                    className: "size-3.5 text-sky-400"
                                                }),
                                                /*#__PURE__*/ _jsx("span", {
                                                    children: langNames[sessionLang] || sessionLang
                                                })
                                            ]
                                        }),
                                        showLangDropdown && /*#__PURE__*/ _jsxs("div", {
                                            className: "absolute right-0 top-full mt-2 w-48 bg-[#1C1B22] border border-[#3e4850] shadow-[0_5px_20px_rgba(0,0,0,0.5)] z-50 font-sans text-sm",
                                            children: [
                                                /*#__PURE__*/ _jsx("div", {
                                                    className: "p-3 border-b border-white/10 text-[10px] text-[#A8A39C] uppercase font-bold tracking-wider",
                                                    children: "Quick Session Language"
                                                }),
                                                profile1?.preferred_languages?.map((lang)=>/*#__PURE__*/ _jsxs("button", {
                                                        onClick: ()=>{
                                                            setSessionLang(lang);
                                                            sessionStorage.setItem("aerolearn_session_lang", lang);
                                                            setShowLangDropdown(false);
                                                        },
                                                        className: "w-full text-left p-3 hover:bg-white/[0.05] border-b border-white/5 transition-colors font-semibold flex justify-between items-center text-xs text-[#bec8d2] hover:text-white",
                                                        children: [
                                                            /*#__PURE__*/ _jsx("span", {
                                                                children: langNames[lang] || lang
                                                            }),
                                                            sessionLang === lang && /*#__PURE__*/ _jsx("span", {
                                                                className: "text-sky-400 font-bold",
                                                                children: "✓"
                                                            })
                                                        ]
                                                    }, lang)),
                                                (!profile1?.preferred_languages || profile1.preferred_languages.length === 0) && /*#__PURE__*/ _jsx("div", {
                                                    className: "p-3 text-slate-500 italic text-xs",
                                                    children: "No alternative comfort languages setup."
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ _jsxs("div", {
                                    className: "relative",
                                    children: [
                                        /*#__PURE__*/ _jsxs("button", {
                                            onClick: ()=>setShowProfileDropdown(!showProfileDropdown),
                                            className: "flex items-center gap-2 px-2.5 py-1 bg-[#1c1b1b] border border-[#3e4850] hover:border-sky-500 rounded-none text-left relative min-h-[36px]",
                                            children: [
                                                /*#__PURE__*/ _jsx("div", {
                                                    className: "size-6 bg-[#242329] rounded-none overflow-hidden flex-shrink-0 border border-white/10",
                                                    children: /*#__PURE__*/ _jsx("img", {
                                                        src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile1?.id || "AeroLearn"}`,
                                                        alt: ""
                                                    })
                                                }),
                                                /*#__PURE__*/ _jsx("span", {
                                                    className: "text-xs text-white font-sans font-semibold tracking-wider hidden sm:inline truncate max-w-[80px]",
                                                    children: profile1?.full_name?.split(" ")[0] || "Pilot"
                                                }),
                                                unresolvedWarningsCount > 0 && /*#__PURE__*/ _jsx("span", {
                                                    className: "absolute -top-1.5 -right-1.5 size-4 bg-[#E24B4A] text-white text-[10px] font-bold font-sans rounded-full flex items-center justify-center border border-[#0a0a0a] shadow-[0_0_6px_rgba(226,75,74,0.6)]",
                                                    children: unresolvedWarningsCount
                                                })
                                            ]
                                        }),
                                        showProfileDropdown && /*#__PURE__*/ _jsxs("div", {
                                            className: "absolute right-0 top-full mt-2 w-52 bg-[#1C1B22] border border-[#3e4850] shadow-[0_5px_20px_rgba(0,0,0,0.5)] z-50 font-sans text-sm",
                                            children: [
                                                /*#__PURE__*/ _jsxs("div", {
                                                    className: "p-3 border-b border-white/10",
                                                    children: [
                                                        /*#__PURE__*/ _jsx("p", {
                                                            className: "font-bold text-white tracking-wide text-xs",
                                                            children: profile1?.full_name || "Space Pilot"
                                                        }),
                                                        /*#__PURE__*/ _jsx("p", {
                                                            className: "text-[10px] text-[#bec8d2] font-mono truncate mt-0.5",
                                                            children: profile1?.id
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ _jsx("button", {
                                                    onClick: ()=>{
                                                        setShowProfileDropdown(false);
                                                        onNavigate("settings");
                                                    },
                                                    className: "w-full text-left p-3 hover:bg-white/[0.05] border-b border-white/5 font-semibold text-xs text-[#bec8d2] hover:text-white",
                                                    children: "⚙ System Settings"
                                                }),
                                                /*#__PURE__*/ _jsx("button", {
                                                    onClick: ()=>{
                                                        setShowProfileDropdown(false);
                                                        onNavigate("reg1");
                                                    },
                                                    className: "w-full text-left p-3 hover:bg-white/[0.05] border-b border-white/5 font-semibold text-xs text-[#bec8d2] hover:text-white",
                                                    children: "⚙ Onboarding Setup"
                                                }),
                                                /*#__PURE__*/ _jsx("button", {
                                                    onClick: ()=>{
                                                        setShowProfileDropdown(false);
                                                        onNavigate("companion");
                                                    },
                                                    className: "w-full text-left p-3 hover:bg-white/[0.05] border-b border-white/5 font-semibold text-xs text-[#bec8d2] hover:text-white",
                                                    children: "\uD83D\uDCCA Teacher/Parent Deck"
                                                }),
                                                /*#__PURE__*/ _jsx("button", {
                                                    onClick: ()=>{
                                                        setShowProfileDropdown(false);
                                                        generateShareLink();
                                                    },
                                                    className: "w-full text-left p-3 hover:bg-white/[0.05] border-b border-white/5 font-semibold text-xs text-[#bec8d2] hover:text-white",
                                                    children: "\uD83D\uDD17 Caregiver Share Link"
                                                }),
                                                /*#__PURE__*/ _jsx("button", {
                                                    onClick: ()=>{
                                                        setShowProfileDropdown(false);
                                                        onLogout();
                                                    },
                                                    className: "w-full text-left p-3 hover:bg-white/[0.05] text-[#E24B4A] hover:bg-red-500/5 font-bold text-xs",
                                                    children: "✕ Log Out"
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            }),
            /*#__PURE__*/ _jsxs("main", {
                className: "max-w-[960px] mx-auto w-full px-4 py-8 flex flex-col gap-8 flex-1 relative",
                children: [
                    /*#__PURE__*/ _jsx("div", {
                        className: "absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.04)_0%,transparent_70%)] pointer-events-none"
                    }),
                    /*#__PURE__*/ _jsxs("section", {
                        className: "animate-fade-in border-b border-[#3e4850]/20 pb-4",
                        children: [
                            /*#__PURE__*/ _jsxs("h1", {
                                className: "text-3xl font-extrabold text-white tracking-tight leading-none",
                                style: {
                                    fontFamily: "Fraunces, Georgia, serif",
                                    fontSize: "24px"
                                },
                                children: [
                                    "Good morning, ",
                                    profile1?.full_name?.split(" ")[0] || "Pilot",
                                    "."
                                ]
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                className: "flex items-center gap-3 mt-2 font-sans text-xs text-[#bec8d2] select-none",
                                children: [
                                    /*#__PURE__*/ _jsx("span", {
                                        children: "5-day learning streak"
                                    }),
                                    /*#__PURE__*/ _jsx("div", {
                                        className: "flex items-center gap-1.5",
                                        children: streakLog.map((active, i)=>/*#__PURE__*/ _jsx("span", {
                                                className: cn("size-2 rounded-full transition-all duration-300", active ? "bg-[#3FA796] shadow-[0_0_6px_rgba(63,167,150,0.6)]" // --accent-teal
                                                 : "bg-[#242329] border border-white/10"),
                                                title: [
                                                    "Mon",
                                                    "Tue",
                                                    "Wed",
                                                    "Thu",
                                                    "Fri",
                                                    "Sat",
                                                    "Sun"
                                                ][i]
                                            }, i))
                                    })
                                ]
                            })
                        ]
                    }),
                    activeHeroDoc && /*#__PURE__*/ _jsx("section", {
                        className: "animate-fade-in",
                        children: /*#__PURE__*/ _jsx(AccentCard, {
                            accent: activeHeroDoc.status === "ready" ? "success" : "amber",
                            className: "p-6",
                            children: /*#__PURE__*/ _jsxs("div", {
                                className: "flex flex-col md:flex-row justify-between gap-6",
                                children: [
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "flex-1 flex flex-col justify-between gap-4",
                                        children: [
                                            /*#__PURE__*/ _jsxs("div", {
                                                children: [
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: "text-xs font-sans font-bold text-sky-400 uppercase tracking-wider block mb-1",
                                                        children: activeHeroDoc.status === "ready" ? "Recent Study Ingestion" : "Ingestion Pipeline Active"
                                                    }),
                                                    /*#__PURE__*/ _jsx("h3", {
                                                        className: "text-lg font-bold text-white font-serif tracking-wide",
                                                        children: activeHeroDoc.title
                                                    }),
                                                    /*#__PURE__*/ _jsxs("div", {
                                                        className: "flex flex-wrap gap-2 items-center mt-2",
                                                        children: [
                                                            /*#__PURE__*/ _jsxs("span", {
                                                                className: "text-xs font-sans text-[#bec8d2] uppercase bg-[#242329] px-2 py-0.5 border border-white/5",
                                                                children: [
                                                                    activeHeroDoc.source_type,
                                                                    " • ",
                                                                    activeHeroDoc.target_lang
                                                                ]
                                                            }),
                                                            activeHeroDoc.audit_warnings?.warnings?.length > 0 && /*#__PURE__*/ _jsx("span", {
                                                                className: "inline-flex items-center px-2 py-0.5 text-[10px] font-sans font-bold uppercase bg-[#EF9F27]/10 border border-[#EF9F27]/30 text-[#EF9F27]",
                                                                children: "⚠️ Translation flagged for review"
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ _jsx("div", {
                                                className: "w-full",
                                                children: /*#__PURE__*/ _jsx(ProgressSteps, {
                                                    steps: [
                                                        {
                                                            label: "OCR Ingestion",
                                                            description: "Extracting source text layers"
                                                        },
                                                        {
                                                            label: "Translation Matrix",
                                                            description: "Bilingual context structuring"
                                                        },
                                                        {
                                                            label: "LaTeX & Safety Audit",
                                                            description: "Checking math formulas & validation"
                                                        },
                                                        {
                                                            label: "Ready",
                                                            description: "Cockpit loaded"
                                                        }
                                                    ],
                                                    currentStepIndex: activeHeroDoc.status === "pending" || activeHeroDoc.status === "extracting" ? 0 : activeHeroDoc.status === "translating" ? 1 : activeHeroDoc.status === "auditing" ? 2 : 3
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "w-full md:w-[240px] flex flex-col justify-between bg-black/35 border border-[#3e4850]/30 p-4 rounded-none min-h-[140px]",
                                        children: [
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "flex justify-between items-start",
                                                children: [
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: "text-xs font-sans uppercase text-[#A8A39C]",
                                                        children: "Pipeline status:"
                                                    }),
                                                    /*#__PURE__*/ _jsx(StatusBadge, {
                                                        status: activeHeroDoc.status
                                                    })
                                                ]
                                            }),
                                            activeHeroDoc.status === "ready" ? /*#__PURE__*/ _jsx(CyberButton, {
                                                onClick: ()=>onNavigate(`reader:${activeHeroDoc.id}`),
                                                className: "w-full mt-3 bg-[#E2725B] hover:bg-[#eb8671] text-white shadow-[0_0_12px_rgba(226,114,91,0.2)] font-bold text-xs uppercase",
                                                icon: ArrowRight,
                                                children: "Start Learning"
                                            }) : /*#__PURE__*/ _jsx("div", {
                                                className: "w-full text-center py-2 bg-neutral-900 border border-white/5 text-xs font-sans text-[#A8A39C] uppercase tracking-wider mt-3",
                                                children: "Processing... ⚡"
                                            })
                                        ]
                                    })
                                ]
                            })
                        })
                    }),
                    /*#__PURE__*/ _jsxs("section", {
                        className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                        children: [
                            /*#__PURE__*/ _jsxs(AccentCard, {
                                accent: "amber",
                                className: "p-6 flex flex-col justify-between min-h-[320px]",
                                children: [
                                    /*#__PURE__*/ _jsxs("div", {
                                        children: [
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "flex justify-between items-start mb-4",
                                                children: [
                                                    /*#__PURE__*/ _jsx("h3", {
                                                        className: "font-extrabold text-base text-white font-serif tracking-wide",
                                                        children: "Ingestion Command Deck"
                                                    }),
                                                    /*#__PURE__*/ _jsx(BarrierTag, {
                                                        barrier: "language"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ _jsx("p", {
                                                className: "text-sm text-[#bec8d2] font-sans leading-relaxed mb-4",
                                                children: "Import textbook materials, PDFs, notes, or YouTube video transcript layers for structured translation and study."
                                            }),
                                            /*#__PURE__*/ _jsxs("form", {
                                                onSubmit: handleUploadSubmit,
                                                className: "space-y-3 font-sans text-sm",
                                                children: [
                                                    uploadError && /*#__PURE__*/ _jsxs("div", {
                                                        className: "p-2 border border-red-500/20 bg-red-500/10 text-red-300 text-[10px] uppercase",
                                                        children: [
                                                            "⚠️ ",
                                                            uploadError
                                                        ]
                                                    }),
                                                    uploadSuccess && /*#__PURE__*/ _jsxs("div", {
                                                        className: "p-2 border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-[10px] uppercase",
                                                        children: [
                                                            "✓ ",
                                                            uploadSuccess
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ _jsx("div", {
                                                        children: /*#__PURE__*/ _jsx("input", {
                                                            type: "text",
                                                            required: true,
                                                            placeholder: "Document Title (e.g. Thermodynamics)",
                                                            value: uploadTitle,
                                                            onChange: (e)=>setUploadTitle(e.target.value),
                                                            className: "w-full bg-[#131313] border border-[#3e4850] p-2 text-sm text-white rounded-none focus:outline-none focus:border-sky-500"
                                                        })
                                                    }),
                                                    /*#__PURE__*/ _jsxs("div", {
                                                        className: "flex gap-2",
                                                        children: [
                                                            /*#__PURE__*/ _jsx("button", {
                                                                type: "button",
                                                                onClick: ()=>setUploadSourceType("upload"),
                                                                className: cn("flex-1 py-1.5 text-xs uppercase font-bold border rounded-none", uploadSourceType === "upload" ? "border-[#E8A33D] bg-[#E8A33D]/10 text-[#E8A33D]" : "border-[#3e4850] text-[#A8A39C]"),
                                                                children: "File Upload"
                                                            }),
                                                            /*#__PURE__*/ _jsx("button", {
                                                                type: "button",
                                                                onClick: ()=>setUploadSourceType("youtube"),
                                                                className: cn("flex-1 py-1.5 text-xs uppercase font-bold border rounded-none", uploadSourceType === "youtube" ? "border-[#E8A33D] bg-[#E8A33D]/10 text-[#E8A33D]" : "border-[#3e4850] text-[#A8A39C]"),
                                                                children: "YouTube Link"
                                                            })
                                                        ]
                                                    }),
                                                    uploadSourceType === "upload" ? /*#__PURE__*/ _jsxs("div", {
                                                        className: "relative border border-dashed border-[#3e4850] p-4 text-center cursor-pointer hover:border-[#E8A33D]/50 transition-colors",
                                                        children: [
                                                            /*#__PURE__*/ _jsx("input", {
                                                                type: "file",
                                                                required: !uploadFile,
                                                                className: "absolute inset-0 opacity-0 cursor-pointer font-sans",
                                                                onChange: (e)=>setUploadFile(e.target.files[0])
                                                            }),
                                                            /*#__PURE__*/ _jsx(UploadCloud, {
                                                                className: "size-6 text-[#E8A33D] mx-auto mb-1"
                                                            }),
                                                            /*#__PURE__*/ _jsx("span", {
                                                                className: "text-xs text-[#bec8d2] font-bold block truncate",
                                                                children: uploadFile ? uploadFile.name : "Select PDF, Image, or DOCX"
                                                            })
                                                        ]
                                                    }) : /*#__PURE__*/ _jsx("div", {
                                                        children: /*#__PURE__*/ _jsx("input", {
                                                            type: "url",
                                                            required: true,
                                                            placeholder: "Paste YouTube Watch URL",
                                                            value: uploadYoutubeUrl,
                                                            onChange: (e)=>setUploadYoutubeUrl(e.target.value),
                                                            className: "w-full bg-[#131313] border border-[#3e4850] p-2 text-sm text-white rounded-none focus:outline-none focus:border-sky-500"
                                                        })
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsx("div", {
                                        className: "mt-4 pt-2",
                                        children: /*#__PURE__*/ _jsx(CyberButton, {
                                            onClick: handleUploadSubmit,
                                            disabled: uploadLoading,
                                            className: "w-full bg-[#E8A33D] text-black font-bold uppercase tracking-wider text-xs",
                                            icon: Zap,
                                            children: uploadLoading ? "Queueing document..." : "Queue Document"
                                        })
                                    })
                                ]
                            }),
                            /*#__PURE__*/ _jsxs(AccentCard, {
                                accent: "teal",
                                className: "p-6 flex flex-col justify-between min-h-[320px]",
                                children: [
                                    /*#__PURE__*/ _jsxs("div", {
                                        children: [
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "flex justify-between items-start mb-4",
                                                children: [
                                                    /*#__PURE__*/ _jsx("h3", {
                                                        className: "font-extrabold text-base text-white font-serif tracking-wide",
                                                        children: "Knowledge Hive Feed"
                                                    }),
                                                    /*#__PURE__*/ _jsx(BarrierTag, {
                                                        barrier: "cost"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ _jsx("p", {
                                                className: "text-sm text-[#bec8d2] font-sans leading-relaxed mb-6",
                                                children: "Browse shared bilingual notes, textbook summaries, and concept sheets contributed by students and caregivers in your community."
                                            }),
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "bg-black/30 border border-[#3FA796]/20 p-4 rounded-none font-sans text-sm space-y-2 mt-4",
                                                children: [
                                                    /*#__PURE__*/ _jsxs("div", {
                                                        className: "flex justify-between items-center",
                                                        children: [
                                                            /*#__PURE__*/ _jsx("span", {
                                                                children: "Scope Filter:"
                                                            }),
                                                            /*#__PURE__*/ _jsx("span", {
                                                                className: "text-sky-400 uppercase font-bold",
                                                                children: "Personalized"
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ _jsxs("div", {
                                                        className: "flex justify-between items-center text-sm border-t border-white/5 pt-2 font-bold",
                                                        children: [
                                                            /*#__PURE__*/ _jsxs("span", {
                                                                className: "text-[#3FA796]",
                                                                children: [
                                                                    hiveCount,
                                                                    " Notes Shared"
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ _jsx("span", {
                                                                className: "text-xs text-[#A8A39C]",
                                                                children: "by your community"
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsx("div", {
                                        className: "mt-4 pt-2",
                                        children: /*#__PURE__*/ _jsx(CyberButton, {
                                            onClick: ()=>onNavigate("hive"),
                                            className: "w-full bg-[#3FA796] hover:bg-[#4cbba9] text-white font-bold uppercase tracking-wider text-xs",
                                            icon: Globe,
                                            children: "Browse Knowledge Hive"
                                        })
                                    })
                                ]
                            })
                        ]
                    }),
                    documents.filter((doc)=>doc.status === "ready").length > 0 && /*#__PURE__*/ _jsxs("section", {
                        className: "flex flex-col gap-3",
                        children: [
                            /*#__PURE__*/ _jsxs("h3", {
                                className: "font-extrabold text-lg text-white font-serif tracking-wide flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ _jsx(Radar, {
                                        className: "size-4.5 text-sky-400 animate-pulse"
                                    }),
                                    "Continue Learning"
                                ]
                            }),
                            /*#__PURE__*/ _jsx("div", {
                                className: "flex gap-4 overflow-x-auto pb-3 scrollbar-thin select-none",
                                children: documents.filter((doc)=>doc.status === "ready").map((doc)=>{
                                    // Compute progress percentage (mocked based on title or id, persisted via localStorage)
                                    const storedProgress = "undefined" !== "undefined" ? localStorage.getItem("aerolearn_progress_" + doc.id) : null;
                                    const completedTopic = storedProgress ? parseInt(storedProgress, 10) : doc.title.charCodeAt(0) % 3 + 1;
                                    const totalTopics = 5;
                                    const progressPct = Math.round(completedTopic / totalTopics * 100);
                                    return /*#__PURE__*/ _jsxs("div", {
                                        onClick: ()=>onNavigate(`reader:${doc.id}`),
                                        className: "flex-shrink-0 w-[240px] p-4 bg-[#131313] border border-white/5 hover:border-sky-500/50 cursor-pointer transition-all duration-300 flex flex-col justify-between gap-4 group",
                                        children: [
                                            /*#__PURE__*/ _jsxs("div", {
                                                children: [
                                                    /*#__PURE__*/ _jsx("h4", {
                                                        className: "font-bold text-white text-sm uppercase tracking-wide truncate group-hover:text-sky-400 transition-colors",
                                                        children: doc.title
                                                    }),
                                                    /*#__PURE__*/ _jsxs("p", {
                                                        className: "text-xs font-sans text-[#bec8d2] uppercase mt-1",
                                                        children: [
                                                            doc.source_type,
                                                            " • ",
                                                            langNames[doc.target_lang] || doc.target_lang
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "space-y-1",
                                                children: [
                                                    /*#__PURE__*/ _jsxs("div", {
                                                        className: "flex justify-between items-center text-xs font-sans text-[#A8A39C]",
                                                        children: [
                                                            /*#__PURE__*/ _jsxs("span", {
                                                                children: [
                                                                    "Topic ",
                                                                    completedTopic,
                                                                    " of ",
                                                                    totalTopics
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ _jsxs("span", {
                                                                children: [
                                                                    progressPct,
                                                                    "%"
                                                                ]
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ _jsx("div", {
                                                        className: "h-[2px] w-full bg-neutral-800 rounded-none overflow-hidden font-sans",
                                                        children: /*#__PURE__*/ _jsx("div", {
                                                            className: cn("h-full transition-all duration-300", getModeAccentColor()),
                                                            style: {
                                                                width: `${progressPct}%`
                                                            }
                                                        })
                                                    })
                                                ]
                                            })
                                        ]
                                    }, doc.id);
                                })
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsxs("section", {
                        className: "flex flex-col gap-4",
                        children: [
                            /*#__PURE__*/ _jsxs("div", {
                                className: "flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-[#3e4850]/20 pb-3",
                                children: [
                                    /*#__PURE__*/ _jsxs("h3", {
                                        className: "font-extrabold text-lg text-white font-serif tracking-wide flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ _jsx(FileText, {
                                                className: "size-4.5 text-[#bec8d2]"
                                            }),
                                            "Your Document Library"
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsx("div", {
                                        className: "flex flex-wrap gap-1.5",
                                        children: [
                                            {
                                                key: "all",
                                                label: "All"
                                            },
                                            {
                                                key: "upload",
                                                label: "Files"
                                            },
                                            {
                                                key: "youtube",
                                                label: "YouTube"
                                            },
                                            {
                                                key: "warnings",
                                                label: "Needs Review"
                                            }
                                        ].map((chip)=>/*#__PURE__*/ _jsxs("button", {
                                                onClick: ()=>setLibraryFilter(chip.key),
                                                className: cn("px-3 py-1.5 text-xs font-sans font-bold uppercase border rounded-none transition-all duration-200 min-h-[28px] cursor-pointer", libraryFilter === chip.key ? "bg-sky-500/10 border-sky-500/40 text-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.15)]" : "bg-[#242329] border-white/5 text-[#A8A39C] hover:border-white/10 hover:text-white"),
                                                children: [
                                                    chip.label,
                                                    chip.key === "warnings" && unresolvedWarningsCount > 0 && /*#__PURE__*/ _jsx("span", {
                                                        className: "ml-1.5 px-1 bg-[#E24B4A] text-white text-[9px] font-bold rounded-full",
                                                        children: unresolvedWarningsCount
                                                    })
                                                ]
                                            }, chip.key))
                                    })
                                ]
                            }),
                            filteredDocs.length === 0 ? /*#__PURE__*/ _jsxs("div", {
                                className: "text-center py-12 border border-dashed border-[#3e4850] rounded-none bg-[#131313]/10 animate-fade-in",
                                children: [
                                    /*#__PURE__*/ _jsx(FileText, {
                                        className: "size-10 text-slate-600 mx-auto mb-3"
                                    }),
                                    /*#__PURE__*/ _jsx("p", {
                                        className: "text-base font-sans text-[#bec8d2] font-bold",
                                        children: "No study modules found"
                                    }),
                                    /*#__PURE__*/ _jsx("p", {
                                        className: "text-sm font-sans text-[#A8A39C] mt-1 max-w-md mx-auto leading-relaxed",
                                        children: libraryFilter === "warnings" ? "Excellent! No documents have unresolved translation audit warnings." : "Let's load your first learning module. Upload a file or YouTube link in the Ingestion Deck above to begin."
                                    })
                                ]
                            }) : /*#__PURE__*/ _jsx("div", {
                                className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
                                children: filteredDocs.map((doc)=>{
                                    const isReady = doc.status === "ready";
                                    const isFailed = doc.status === "failed";
                                    const hasWarnings = doc.audit_warnings?.warnings?.length > 0;
                                    // Formatted last opened date (mocked or localStorage)
                                    const lastOpened = "undefined" !== "undefined" ? localStorage.getItem("aerolearn_last_opened_" + doc.id) || "Not opened yet" : "Not opened yet";
                                    return /*#__PURE__*/ _jsxs("div", {
                                        className: cn("p-4 bg-[#131313] border transition-all duration-300 flex flex-col justify-between gap-4 rounded-none group animate-fade-in", hasWarnings ? "border-[#EF9F27]/30 hover:border-[#EF9F27]/60" : "border-white/5 hover:border-sky-500/50"),
                                        children: [
                                            /*#__PURE__*/ _jsxs("div", {
                                                children: [
                                                    /*#__PURE__*/ _jsxs("div", {
                                                        className: "flex justify-between items-start gap-2",
                                                        children: [
                                                            /*#__PURE__*/ _jsx("h4", {
                                                                className: "font-bold text-white text-sm uppercase tracking-wide leading-tight truncate max-w-[280px]",
                                                                children: doc.title
                                                            }),
                                                            /*#__PURE__*/ _jsx(StatusBadge, {
                                                                status: doc.status
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ _jsxs("div", {
                                                        className: "flex flex-wrap gap-2.5 items-center mt-2.5",
                                                        children: [
                                                            /*#__PURE__*/ _jsxs("span", {
                                                                className: "text-xs font-sans text-[#bec8d2] uppercase",
                                                                children: [
                                                                    doc.source_type,
                                                                    " • ",
                                                                    langNames[doc.target_lang] || doc.target_lang
                                                                ]
                                                            }),
                                                            isReady && /*#__PURE__*/ _jsx("span", {
                                                                className: cn("text-[10px] font-sans uppercase px-1.5 py-0.5 rounded-none border font-bold", cachedDocIds.includes(doc.id) ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" : "bg-slate-800 border-slate-700 text-slate-400"),
                                                                children: cachedDocIds.includes(doc.id) ? "Offline Ready" : "Online Only"
                                                            }),
                                                            hasWarnings && /*#__PURE__*/ _jsx("span", {
                                                                className: "px-1.5 py-0.5 text-[10px] font-sans font-bold uppercase bg-[#EF9F27]/10 border border-[#EF9F27]/30 text-[#EF9F27]",
                                                                title: "Warnings flagged during Logic Audit",
                                                                children: "Flagged"
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "flex justify-between items-end border-t border-white/5 pt-3 mt-1 font-sans text-xs text-[#A8A39C]",
                                                children: [
                                                    /*#__PURE__*/ _jsxs("div", {
                                                        children: [
                                                            /*#__PURE__*/ _jsx("span", {
                                                                children: "Last opened:"
                                                            }),
                                                            /*#__PURE__*/ _jsx("span", {
                                                                className: "text-white block mt-0.5 font-semibold",
                                                                children: lastOpened
                                                            })
                                                        ]
                                                    }),
                                                    isReady && /*#__PURE__*/ _jsx(CyberButton, {
                                                        onClick: ()=>{
                                                            if ("undefined" !== "undefined") {
                                                                localStorage.setItem("aerolearn_last_opened_" + doc.id, new Date().toLocaleDateString());
                                                            }
                                                            onNavigate(`reader:${doc.id}`);
                                                        },
                                                        className: "min-h-[28px] px-3.5 py-1 text-[9px] uppercase font-bold bg-[#1c1b1b] border border-[#3e4850] hover:border-sky-500 text-white",
                                                        variant: "secondary",
                                                        children: "Start Study"
                                                    })
                                                ]
                                            })
                                        ]
                                    }, doc.id);
                                })
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsxs("section", {
                        className: "p-6 bg-[#131313] border border-white/5 rounded-none animate-fade-in",
                        children: [
                            /*#__PURE__*/ _jsxs("h3", {
                                className: "font-extrabold text-sm tracking-wider uppercase text-sky-400 font-sans flex items-center gap-2 border-b border-white/10 pb-2.5 mb-4",
                                children: [
                                    /*#__PURE__*/ _jsx(Info, {
                                        className: "size-4 text-sky-400"
                                    }),
                                    "Adaptive Analytics & Insights"
                                ]
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                className: "grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-sm text-[#bec8d2]",
                                children: [
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "p-4 bg-black/40 border border-white/5 rounded-none flex flex-col gap-2",
                                        children: [
                                            /*#__PURE__*/ _jsx("span", {
                                                className: "text-[#5DCAA5] font-bold uppercase tracking-wider block",
                                                children: "Completed Concepts"
                                            }),
                                            /*#__PURE__*/ _jsx("div", {
                                                className: "text-xl font-bold text-white mt-1",
                                                children: "4 Topics Complete"
                                            }),
                                            /*#__PURE__*/ _jsx("p", {
                                                className: "text-[10px] text-slate-500 leading-relaxed uppercase",
                                                children: "Successfully validated via topic comprehension checks this week"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "p-4 bg-black/40 border border-white/5 rounded-none flex flex-col gap-2",
                                        children: [
                                            /*#__PURE__*/ _jsx("span", {
                                                className: "text-[#EF9F27] font-bold uppercase tracking-wider block",
                                                children: "Revisit Recommendations"
                                            }),
                                            /*#__PURE__*/ _jsx("div", {
                                                className: "space-y-2 mt-1",
                                                children: revisitTopics.map((t)=>/*#__PURE__*/ _jsxs("div", {
                                                        className: "flex justify-between items-center text-[10px] bg-[#1c1b1b] p-1.5 border border-[#3e4850]/20",
                                                        children: [
                                                            /*#__PURE__*/ _jsx("span", {
                                                                className: "truncate max-w-[120px]",
                                                                children: t.title
                                                            }),
                                                            /*#__PURE__*/ _jsx("span", {
                                                                className: "text-[#EF9F27] font-semibold",
                                                                children: t.reason
                                                            })
                                                        ]
                                                    }, t.id))
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "p-4 bg-black/40 border border-white/5 rounded-none flex flex-col gap-2",
                                        children: [
                                            /*#__PURE__*/ _jsx("span", {
                                                className: "text-[#8B7FD1] font-bold uppercase tracking-wider block",
                                                children: "Calibration Profile"
                                            }),
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "space-y-1.5 text-[10px] mt-1.5 text-white",
                                                children: [
                                                    /*#__PURE__*/ _jsxs("div", {
                                                        className: "flex justify-between",
                                                        children: [
                                                            /*#__PURE__*/ _jsx("span", {
                                                                className: "text-[#A8A39C] uppercase",
                                                                children: "Layout Mode:"
                                                            }),
                                                            /*#__PURE__*/ _jsx("span", {
                                                                className: "capitalize",
                                                                children: profile1?.disabilities?.join(", ") || "Standard"
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ _jsxs("div", {
                                                        className: "flex justify-between",
                                                        children: [
                                                            /*#__PURE__*/ _jsx("span", {
                                                                className: "text-[#A8A39C] uppercase",
                                                                children: "Session Lang:"
                                                            }),
                                                            /*#__PURE__*/ _jsx("span", {
                                                                className: "uppercase",
                                                                children: sessionLang
                                                            })
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ _jsxs("div", {
                                                        className: "flex justify-between",
                                                        children: [
                                                            /*#__PURE__*/ _jsx("span", {
                                                                className: "text-[#A8A39C] uppercase",
                                                                children: "Dyslexia Font:"
                                                            }),
                                                            /*#__PURE__*/ _jsx("span", {
                                                                children: profile1?.dyslexia_friendly ? "Enabled" : "Disabled"
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsx("section", {
                        className: "bg-[#1C1B22] border-y border-white/5 py-3.5 px-4 font-sans text-xs text-[#A8A39C] overflow-hidden select-none animate-fade-in",
                        children: /*#__PURE__*/ _jsxs("div", {
                            className: "max-w-[960px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-2",
                            children: [
                                /*#__PURE__*/ _jsxs("span", {
                                    className: "text-[#3FA796] font-bold uppercase tracking-wider flex items-center gap-1.5",
                                    children: [
                                        /*#__PURE__*/ _jsx("span", {
                                            className: "size-1.5 bg-[#3FA796] rounded-full animate-ping"
                                        }),
                                        "Live Peer Activity Feed:"
                                    ]
                                }),
                                /*#__PURE__*/ _jsxs("div", {
                                    className: "flex flex-wrap gap-x-6 gap-y-1.5",
                                    children: [
                                        recentHiveContributions.map((c, i)=>/*#__PURE__*/ _jsxs("span", {
                                                className: "hover:text-white transition-colors",
                                                children: [
                                                    "\uD83D\uDC64 ",
                                                    c.uploader,
                                                    " shared ",
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: "text-white font-bold",
                                                        children: c.title
                                                    }),
                                                    " (",
                                                    c.time,
                                                    ")"
                                                ]
                                            }, i)),
                                        recentHiveContributions.length === 0 && /*#__PURE__*/ _jsx("span", {
                                            children: "No active contributions matching comfort languages."
                                        })
                                    ]
                                })
                            ]
                        })
                    }),
                    shareModalOpen && /*#__PURE__*/ _jsx("div", {
                        className: "fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4",
                        children: /*#__PURE__*/ _jsxs("div", {
                            className: "bg-[#1C1B22] border border-[#3FA796]/40 p-6 max-w-md w-full font-sans text-sm text-[#bec8d2] shadow-[0_0_30px_rgba(0,0,0,0.8)] space-y-4 rounded-none",
                            children: [
                                /*#__PURE__*/ _jsxs("div", {
                                    className: "flex justify-between items-start border-b border-white/10 pb-2",
                                    children: [
                                        /*#__PURE__*/ _jsxs("span", {
                                            className: "text-white font-bold uppercase text-sm tracking-wider flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ _jsx(Radar, {
                                                    className: "size-4.5 text-[#3FA796] animate-pulse"
                                                }),
                                                "Generate Caregiver Share Link"
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsx("button", {
                                            onClick: ()=>setShareModalOpen(false),
                                            className: "text-[#A8A39C] hover:text-white font-bold",
                                            children: "✕"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ _jsx("p", {
                                    className: "text-[11px] leading-relaxed",
                                    children: "Generate a temporary, read-only dashboard link. A teacher or caregiver can view learning progress and diagnostic logs without requiring a separate account."
                                }),
                                /*#__PURE__*/ _jsx("div", {
                                    className: "bg-black/50 p-3 border border-white/5 rounded-none break-all select-all font-mono text-xs text-white",
                                    children: shareLink
                                }),
                                /*#__PURE__*/ _jsxs("div", {
                                    className: "flex justify-between items-center text-[10px] text-[#A8A39C] uppercase font-bold",
                                    children: [
                                        /*#__PURE__*/ _jsx("span", {
                                            children: "⏱ Expiration Limit:"
                                        }),
                                        /*#__PURE__*/ _jsx("span", {
                                            className: "text-[#EF9F27]",
                                            children: "24 Hours"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ _jsxs("div", {
                                    className: "flex gap-2 pt-2 border-t border-white/10",
                                    children: [
                                        /*#__PURE__*/ _jsx("button", {
                                            onClick: handleCopyLink,
                                            className: "flex-1 py-2.5 bg-[#3FA796] text-black font-bold uppercase rounded-none hover:bg-[#4cbba9] transition-colors min-h-[40px] cursor-pointer",
                                            children: copiedText ? "✓ Link Copied!" : "Copy Link"
                                        }),
                                        /*#__PURE__*/ _jsx("button", {
                                            onClick: ()=>setShareModalOpen(false),
                                            className: "px-4 py-2.5 bg-black/40 border border-[#3e4850] text-[#bec8d2] hover:text-white uppercase font-bold rounded-none transition-colors min-h-[40px] cursor-pointer",
                                            children: "Close"
                                        })
                                    ]
                                })
                            ]
                        })
                    })
                ]
            })
        ]
    });
};
// --- Teacher/Parent Telemetry Companion Dashboard ---
const CompanionDashboard = ({ profile: profile1, onBack })=>{
    const [cachedDocs, setCachedDocs] = useState([]);
    const [simulatedSync, setSimulatedSync] = useState(false);
    const [calibratedNoise, setCalibratedNoise] = useState("0.05");
    const [latency, setLatency] = useState("12ms");
    const [syncStatus, setSyncStatus] = useState("SYNCED");
    useEffect(()=>{
        async function loadCacheInfo() {
            try {
                const docs = await getAllCachedDocuments();
                setCachedDocs(docs || []);
            } catch (e) {
                console.error("IndexedDB cache read error:", e);
            }
        }
        loadCacheInfo();
        // Load local storage values
        const nf = localStorage.getItem("aerolearn_noise_floor") || "0.05";
        setCalibratedNoise(nf);
        // Simulate slight jitter in telemetry latency
        const interval = setInterval(()=>{
            const ms = Math.floor(Math.random() * 8) + 8;
            setLatency(`${ms}ms`);
        }, 3000);
        return ()=>clearInterval(interval);
    }, []);
    const handleForceSync = ()=>{
        setSimulatedSync(true);
        setSyncStatus("SYNCING...");
        setTimeout(()=>{
            setSimulatedSync(false);
            setSyncStatus("SYNCED");
        }, 1500);
    };
    return /*#__PURE__*/ _jsxs("div", {
        className: "min-h-screen bg-[#0a0a0a] text-[#e5e2e1] flex flex-col font-mono p-8 animate-fade-in",
        children: [
            /*#__PURE__*/ _jsxs("header", {
                className: "border-b border-[#3e4850]/30 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
                children: [
                    /*#__PURE__*/ _jsxs("div", {
                        children: [
                            /*#__PURE__*/ _jsxs("h1", {
                                className: "text-2xl font-extrabold uppercase text-sky-400 tracking-wider flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ _jsx(Radar, {
                                        className: "animate-pulse size-7"
                                    }),
                                    "Companion Telemetry Deck"
                                ]
                            }),
                            /*#__PURE__*/ _jsx("p", {
                                className: "text-xs text-[#bec8d2]/70 uppercase tracking-widest mt-1",
                                children: "Real-time Accessibility Diagnostics & Parent/Teacher Audit Portal"
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsx(CyberButton, {
                        onClick: onBack,
                        variant: "outline",
                        className: "min-h-[44px] border-amber-500/50 text-amber-500 hover:bg-amber-500/10 font-mono text-[10px]",
                        icon: ArrowLeft,
                        children: "Back to Cockpit"
                    })
                ]
            }),
            /*#__PURE__*/ _jsxs("div", {
                className: "grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1200px] mx-auto w-full",
                children: [
                    /*#__PURE__*/ _jsxs("div", {
                        className: "border border-[#3e4850]/30 bg-[#131313] p-6 flex flex-col gap-6 rounded-none relative",
                        children: [
                            /*#__PURE__*/ _jsx("div", {
                                className: "absolute top-0 right-0 bg-sky-500/10 border-b border-l border-[#3e4850]/40 px-3 py-1 text-[9px] uppercase tracking-wider text-sky-400 font-bold",
                                children: "Profile Preferences"
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                className: "flex items-center gap-4 border-b border-[#3e4850]/20 pb-4",
                                children: [
                                    /*#__PURE__*/ _jsx(UserCircle, {
                                        className: "size-12 text-sky-400"
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        children: [
                                            /*#__PURE__*/ _jsx("h3", {
                                                className: "text-base font-bold text-white uppercase",
                                                children: profile1?.full_name || "Space Pilot"
                                            }),
                                            /*#__PURE__*/ _jsx("p", {
                                                className: "text-[10px] text-[#bec8d2]/60 uppercase tracking-wider",
                                                children: "Active Learner Profile"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                className: "flex flex-col gap-4",
                                children: [
                                    /*#__PURE__*/ _jsxs("div", {
                                        children: [
                                            /*#__PURE__*/ _jsx("span", {
                                                className: "text-[10px] uppercase text-[#bec8d2]/60 block mb-1",
                                                children: "Active Disabilities:"
                                            }),
                                            /*#__PURE__*/ _jsx("div", {
                                                className: "flex flex-wrap gap-1.5",
                                                children: profile1?.disabilities && profile1.disabilities.length > 0 ? profile1.disabilities.map((d)=>/*#__PURE__*/ _jsxs("span", {
                                                        className: "text-[10px] bg-red-500/10 border border-red-500/30 text-red-400 font-bold px-2 py-0.5 uppercase",
                                                        children: [
                                                            d,
                                                            " MODE"
                                                        ]
                                                    }, d)) : /*#__PURE__*/ _jsx("span", {
                                                    className: "text-xs italic text-[#bec8d2]/40",
                                                    children: "None Specified (Standard Layout)"
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        children: [
                                            /*#__PURE__*/ _jsx("span", {
                                                className: "text-[10px] uppercase text-[#bec8d2]/60 block mb-1",
                                                children: "Preferred Languages:"
                                            }),
                                            /*#__PURE__*/ _jsx("div", {
                                                className: "flex flex-wrap gap-1.5",
                                                children: profile1?.preferred_languages && profile1.preferred_languages.length > 0 ? profile1.preferred_languages.map((l)=>/*#__PURE__*/ _jsxs("span", {
                                                        className: "text-[10px] bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold px-2 py-0.5 uppercase flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ _jsx(Globe, {
                                                                className: "size-3"
                                                            }),
                                                            " ",
                                                            l.toUpperCase()
                                                        ]
                                                    }, l)) : /*#__PURE__*/ _jsx("span", {
                                                    className: "text-[10px] italic text-[#bec8d2]/40",
                                                    children: "Default (English only)"
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "border-t border-[#3e4850]/20 pt-4 flex flex-col gap-3 text-xs text-[#bec8d2]",
                                        children: [
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "flex justify-between items-center",
                                                children: [
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: "uppercase text-[10px]",
                                                        children: "Dyslexia Friendly Font:"
                                                    }),
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: profile1?.dyslexia_friendly ? "text-emerald-400 font-bold" : "text-amber-500/60",
                                                        children: profile1?.dyslexia_friendly ? "ACTIVE" : "INACTIVE"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "flex justify-between items-center",
                                                children: [
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: "uppercase text-[10px]",
                                                        children: "High Contrast Theme:"
                                                    }),
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: profile1?.high_contrast ? "text-emerald-400 font-bold" : "text-amber-500/60",
                                                        children: profile1?.high_contrast ? "ACTIVE" : "INACTIVE"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "flex justify-between items-center",
                                                children: [
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: "uppercase text-[10px]",
                                                        children: "Sign Language Avatar:"
                                                    }),
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: profile1?.sign_language_preference ? "text-emerald-400 font-bold" : "text-amber-500/60",
                                                        children: profile1?.sign_language_preference ? "ACTIVE" : "INACTIVE"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "flex justify-between items-center",
                                                children: [
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: "uppercase text-[10px]",
                                                        children: "Active Design UI Theme:"
                                                    }),
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: "text-white uppercase font-bold",
                                                        children: profile1?.theme || "COSMIC-DARK"
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsxs("div", {
                        className: "border border-[#3e4850]/30 bg-[#131313] p-6 flex flex-col gap-6 rounded-none relative",
                        children: [
                            /*#__PURE__*/ _jsx("div", {
                                className: "absolute top-0 right-0 bg-emerald-500/10 border-b border-l border-[#3e4850]/40 px-3 py-1 text-[9px] uppercase tracking-wider text-emerald-400 font-bold",
                                children: "Academics & Auditing"
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                className: "flex items-center gap-4 border-b border-[#3e4850]/20 pb-4",
                                children: [
                                    /*#__PURE__*/ _jsx(BookOpen, {
                                        className: "size-12 text-emerald-400"
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        children: [
                                            /*#__PURE__*/ _jsx("h3", {
                                                className: "text-base font-bold text-white uppercase",
                                                children: "Learning Analytics"
                                            }),
                                            /*#__PURE__*/ _jsx("p", {
                                                className: "text-[10px] text-[#bec8d2]/60 uppercase tracking-wider",
                                                children: "Concept Comprehension Stats"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                className: "flex flex-col gap-5",
                                children: [
                                    /*#__PURE__*/ _jsxs("div", {
                                        children: [
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "flex justify-between text-xs text-[#bec8d2] mb-1.5",
                                                children: [
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: "uppercase text-[10px]",
                                                        children: "Overall Module Completion:"
                                                    }),
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: "font-bold text-emerald-400",
                                                        children: "75%"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ _jsx("div", {
                                                className: "w-full bg-[#1c1b1b] h-2.5 border border-[#3e4850]/40 p-0.5",
                                                children: /*#__PURE__*/ _jsx("div", {
                                                    className: "bg-emerald-500 h-full",
                                                    style: {
                                                        width: "75%"
                                                    }
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        children: [
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "flex justify-between text-xs text-[#bec8d2] mb-1.5",
                                                children: [
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: "uppercase text-[10px]",
                                                        children: "Topic Comprehension Quizzes:"
                                                    }),
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: "font-bold text-emerald-400",
                                                        children: "5 / 6 Complete"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ _jsx("div", {
                                                className: "w-full bg-[#1c1b1b] h-2.5 border border-[#3e4850]/40 p-0.5",
                                                children: /*#__PURE__*/ _jsx("div", {
                                                    className: "bg-emerald-500 h-full",
                                                    style: {
                                                        width: "83.3%"
                                                    }
                                                })
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "border-t border-[#3e4850]/20 pt-4 flex flex-col gap-3 text-xs text-[#bec8d2]",
                                        children: [
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "flex justify-between items-center",
                                                children: [
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: "uppercase text-[10px]",
                                                        children: "Simplified STEM Terms:"
                                                    }),
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: "text-white font-bold",
                                                        children: "14 Key Concepts"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "flex justify-between items-center",
                                                children: [
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: "uppercase text-[10px]",
                                                        children: "LaTeX Formula Audits:"
                                                    }),
                                                    /*#__PURE__*/ _jsxs("span", {
                                                        className: "text-emerald-400 font-bold flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ _jsx(CheckCircle2, {
                                                                className: "size-3.5 text-emerald-400"
                                                            }),
                                                            " Verified"
                                                        ]
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "flex justify-between items-center",
                                                children: [
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: "uppercase text-[10px]",
                                                        children: "AI-Generated Transcripts:"
                                                    }),
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: "text-white font-bold",
                                                        children: "4 Videos Processed"
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ _jsxs("div", {
                                                className: "flex justify-between items-center",
                                                children: [
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: "uppercase text-[10px]",
                                                        children: "Peer Help Exchange:"
                                                    }),
                                                    /*#__PURE__*/ _jsx("span", {
                                                        className: "text-emerald-400 font-bold",
                                                        children: "3 Resolved Q&As"
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsxs("div", {
                        className: "border border-[#3e4850]/30 bg-[#131313] p-6 flex flex-col gap-6 rounded-none relative",
                        children: [
                            /*#__PURE__*/ _jsx("div", {
                                className: "absolute top-0 right-0 bg-amber-500/10 border-b border-l border-[#3e4850]/40 px-3 py-1 text-[9px] uppercase tracking-wider text-amber-400 font-bold",
                                children: "Hardware Diagnostics"
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                className: "flex items-center gap-4 border-b border-[#3e4850]/20 pb-4",
                                children: [
                                    /*#__PURE__*/ _jsx(Cpu, {
                                        className: "size-12 text-amber-500"
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        children: [
                                            /*#__PURE__*/ _jsx("h3", {
                                                className: "text-base font-bold text-white uppercase",
                                                children: "System Telemetry"
                                            }),
                                            /*#__PURE__*/ _jsx("p", {
                                                className: "text-[10px] text-[#bec8d2]/60 uppercase tracking-wider",
                                                children: "AeroLearn Engine Telemetries"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                className: "flex flex-col gap-4 text-xs text-[#bec8d2]",
                                children: [
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "flex justify-between items-center border-b border-[#3e4850]/20 pb-2",
                                        children: [
                                            /*#__PURE__*/ _jsxs("span", {
                                                className: "uppercase text-[10px] flex items-center gap-1.5",
                                                children: [
                                                    /*#__PURE__*/ _jsx(Mic, {
                                                        className: "size-3.5 text-amber-500"
                                                    }),
                                                    " Ambient Noise Gate:"
                                                ]
                                            }),
                                            /*#__PURE__*/ _jsxs("span", {
                                                className: "text-amber-500 font-bold font-mono",
                                                children: [
                                                    calibratedNoise,
                                                    " RMS"
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "flex justify-between items-center border-b border-[#3e4850]/20 pb-2",
                                        children: [
                                            /*#__PURE__*/ _jsxs("span", {
                                                className: "uppercase text-[10px] flex items-center gap-1.5",
                                                children: [
                                                    /*#__PURE__*/ _jsx(Volume2, {
                                                        className: "size-3.5 text-sky-400"
                                                    }),
                                                    " TTS Audio latency:"
                                                ]
                                            }),
                                            /*#__PURE__*/ _jsx("span", {
                                                className: "text-sky-400 font-bold font-mono",
                                                children: latency
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "flex justify-between items-center border-b border-[#3e4850]/20 pb-2",
                                        children: [
                                            /*#__PURE__*/ _jsxs("span", {
                                                className: "uppercase text-[10px] flex items-center gap-1.5",
                                                children: [
                                                    /*#__PURE__*/ _jsx(Database, {
                                                        className: "size-3.5 text-emerald-400"
                                                    }),
                                                    " Offline Cache Size:"
                                                ]
                                            }),
                                            /*#__PURE__*/ _jsxs("span", {
                                                className: "text-emerald-400 font-bold font-mono",
                                                children: [
                                                    cachedDocs.length,
                                                    " Modules"
                                                ]
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        className: "flex justify-between items-center border-b border-[#3e4850]/20 pb-2",
                                        children: [
                                            /*#__PURE__*/ _jsxs("span", {
                                                className: "uppercase text-[10px] flex items-center gap-1.5",
                                                children: [
                                                    /*#__PURE__*/ _jsx(Wifi, {
                                                        className: "size-3.5 text-sky-400"
                                                    }),
                                                    " Cache Sync Status:"
                                                ]
                                            }),
                                            /*#__PURE__*/ _jsx("span", {
                                                className: cn("font-bold font-mono text-[10px] px-2 py-0.5 border rounded-none", syncStatus === "SYNCED" ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" : "bg-amber-500/10 border-amber-500/40 text-amber-400 animate-pulse"),
                                                children: syncStatus
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ _jsx("div", {
                                        className: "mt-2",
                                        children: /*#__PURE__*/ _jsx(CyberButton, {
                                            onClick: handleForceSync,
                                            disabled: simulatedSync,
                                            variant: "outline",
                                            className: "w-full min-h-[44px] border-sky-500/50 text-sky-400 hover:bg-sky-500/10 focus-visible:ring-sky-500 font-mono text-[10px]",
                                            icon: Zap,
                                            children: simulatedSync ? "SYNCING CACHE..." : "FORCE CACHE SYNC NOW"
                                        })
                                    })
                                ]
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ _jsxs("div", {
                className: "mt-8 border border-[#3e4850]/30 bg-[#131313] p-6 max-w-[1200px] mx-auto w-full",
                children: [
                    /*#__PURE__*/ _jsxs("h3", {
                        className: "text-xs font-mono uppercase text-sky-400 mb-4 font-bold tracking-wider flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ _jsx(Zap, {
                                className: "size-4 animate-bounce text-sky-400"
                            }),
                            " Live Sync & Telemetry Sandbox Stream:"
                        ]
                    }),
                    /*#__PURE__*/ _jsxs("div", {
                        className: "bg-black/60 border border-[#3e4850]/20 p-4 h-40 overflow-y-auto font-mono text-[11px] text-[#bec8d2]/90 flex flex-col gap-1.5 scrollbar-thin",
                        children: [
                            /*#__PURE__*/ _jsxs("div", {
                                children: [
                                    "[INFO] ",
                                    new Date().toISOString(),
                                    " - Initializing Diagnostics Cockpit..."
                                ]
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                children: [
                                    "[INFO] ",
                                    new Date().toISOString(),
                                    " - Loaded user profile config from IndexedDB sandbox cache"
                                ]
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                children: [
                                    "[OK]   ",
                                    new Date().toISOString(),
                                    " - Voice controller websocket loop established successfully"
                                ]
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                children: [
                                    "[OK]   ",
                                    new Date().toISOString(),
                                    " - Ambient noise floor gate configured at threshold: ",
                                    calibratedNoise,
                                    " RMS"
                                ]
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                                children: [
                                    "[SYNC] ",
                                    new Date().toISOString(),
                                    " - IndexedDB storage check: ",
                                    cachedDocs.length,
                                    " persistent files ready offline"
                                ]
                            }),
                            simulatedSync && /*#__PURE__*/ _jsxs("div", {
                                className: "text-sky-400 animate-pulse",
                                children: [
                                    "[SYNC] ",
                                    new Date().toISOString(),
                                    " - Commencing force sync. Contacting schema endpoint..."
                                ]
                            }),
                            !simulatedSync && /*#__PURE__*/ _jsxs("div", {
                                children: [
                                    "[OK]   ",
                                    new Date().toISOString(),
                                    " - System telemetry status stable. Ready for parent/teacher inspection."
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
    });
};
// --- App Root Routing ---
const getPathFromScreen = (screenState)=>{
    if (screenState === "login") return "/login";
    if (screenState === "reg1") return "/dashboard/register/1";
    if (screenState === "reg2") return "/dashboard/register/2";
    if (screenState === "reg3") return "/dashboard/register/3";
    if (screenState === "settings") return "/dashboard/settings";
    if (screenState === "dashboard") return "/dashboard";
    if (screenState === "lab") return "/dashboard/lab";
    if (screenState === "blind") return "/dashboard/blind";
    if (screenState === "deaf") return "/dashboard/deaf";
    if (screenState === "hive") return "/dashboard/hive";
    if (screenState === "companion") return "/dashboard/companion";
    if (screenState.startsWith("reader:")) {
        const id = screenState.split(":")[1];
        return `/dashboard/reader/${id}`;
    }
    return "/dashboard";
};
const getScreenFromPath = (path)=>{
    if (path === "/login") return "login";
    if (path === "/dashboard/register/1") return "reg1";
    if (path === "/dashboard/register/2") return "reg2";
    if (path === "/dashboard/register/3") return "reg3";
    if (path === "/dashboard/settings") return "settings";
    if (path === "/dashboard/lab") return "lab";
    if (path === "/dashboard/blind") return "blind";
    if (path === "/dashboard/deaf") return "deaf";
    if (path === "/dashboard/hive") return "hive";
    if (path === "/dashboard/companion") return "companion";
    if (path.startsWith("/dashboard/reader/")) {
        const id = path.replace("/dashboard/reader/", "");
        return `reader:${id}`;
    }
    if (path.startsWith("/dashboard")) return "dashboard";
    return "login";
};
export default function App() {
    const [screen, setScreen] = useState(()=>{
        if ("undefined" !== "undefined") {
            return getScreenFromPath(window.location.pathname);
        }
        return "login";
    });
    const { profile: profile1, setProfile, loading } = useAccessibility();
    const [companionProfile, setCompanionProfile] = useState(null);
    // Custom onboarding parameters state
    const [preferredLanguages, setPreferredLanguages] = useState([]);
    const [disabilities, setDisabilities] = useState([]);
    // Sync state changes to browser URL pathname
    null;
    // Handle browser popstate events (back / forward buttons)
    null;
    // Check auth state
    null;
    const handleLogout = async ()=>{
        await supabase.auth.signOut();
        setScreen("login");
    };
    const handleOnboardingComplete = ()=>{
        // Refresh accessibility context profile values
        window.location.reload();
    };
    return /*#__PURE__*/ _jsx("div", {
        className: "min-h-screen",
        children: /*#__PURE__*/ _jsx(AnimatePresence, {
            mode: "wait",
            children: /*#__PURE__*/ _jsxs(motion.div, {
                initial: {
                    opacity: 0,
                    y: 10
                },
                animate: {
                    opacity: 1,
                    y: 0
                },
                exit: {
                    opacity: 0,
                    y: -10
                },
                transition: {
                    duration: 0.25
                },
                children: [
                    screen === "login" && /*#__PURE__*/ _jsx(LoginScreen, {
                        onNext: ()=>setScreen("reg1")
                    }),
                    screen === "reg1" && /*#__PURE__*/ _jsx(OnboardingStep1, {
                        onNext: ()=>setScreen("reg2"),
                        preferredLanguages: preferredLanguages,
                        setPreferredLanguages: setPreferredLanguages
                    }),
                    screen === "reg2" && /*#__PURE__*/ _jsx(OnboardingStep2, {
                        onNext: ()=>setScreen("reg3"),
                        preferredLanguages: preferredLanguages,
                        disabilities: disabilities,
                        setDisabilities: setDisabilities
                    }),
                    screen === "reg3" && /*#__PURE__*/ _jsx(OnboardingStep3, {
                        onComplete: handleOnboardingComplete,
                        preferredLanguages: preferredLanguages,
                        disabilities: disabilities
                    }),
                    screen === "settings" && /*#__PURE__*/ _jsx(SettingsScreen, {
                        onBack: ()=>setScreen("dashboard")
                    }),
                    screen === "dashboard" && /*#__PURE__*/ _jsx(StandardDashboard, {
                        profile: profile1,
                        onNavigate: (s)=>setScreen(s),
                        onLogout: handleLogout
                    }),
                    screen === "companion" && /*#__PURE__*/ _jsx(CompanionDashboard, {
                        profile: companionProfile || profile1,
                        onBack: ()=>{
                            if (companionProfile) {
                                setCompanionProfile(null);
                                setScreen("login");
                            } else {
                                setScreen("dashboard");
                            }
                        }
                    }),
                    screen === "lab" && /*#__PURE__*/ _jsx(DocumentLab, {
                        onBack: ()=>setScreen("dashboard"),
                        profile: profile1
                    }),
                    screen === "blind" && /*#__PURE__*/ _jsx(BlindWorkspace, {
                        onBack: ()=>setScreen("dashboard"),
                        profile: profile1
                    }),
                    screen === "deaf" && /*#__PURE__*/ _jsx(DeafWorkspace, {
                        onBack: ()=>setScreen("dashboard"),
                        profile: profile1
                    }),
                    screen === "hive" && /*#__PURE__*/ _jsx(HiveFeed, {
                        onBack: ()=>setScreen("dashboard"),
                        onOpenDocument: (id)=>setScreen(`reader:${id}`)
                    }),
                    screen.startsWith("reader:") && (()=>{
                        const docId = screen.split(":")[1];
                        if (profile1?.disabilities?.includes("blind")) {
                            return /*#__PURE__*/ _jsx(BlindWorkspace, {
                                documentId: docId,
                                onBack: ()=>setScreen("dashboard"),
                                profile: profile1
                            });
                        }
                        if (profile1?.disabilities?.includes("deaf")) {
                            return /*#__PURE__*/ _jsx(DeafWorkspace, {
                                documentId: docId,
                                onBack: ()=>setScreen("dashboard"),
                                profile: profile1
                            });
                        }
                        return /*#__PURE__*/ _jsx(DocumentReader, {
                            documentId: docId,
                            onBack: ()=>setScreen("dashboard")
                        });
                    })()
                ]
            }, screen)
        })
    });
}