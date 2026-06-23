'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibility } from '@/context/AccessibilityContext';
import { 
  Sparkles, 
  CheckCircle, 
  Lock, 
  Play, 
  HelpCircle, 
  Award,
  BookOpen,
  ArrowRight,
  Volume2,
  VolumeX,
  BatteryCharging
} from 'lucide-react';

/**
 * Responsive Constellation Star Coordinates (in SVG % viewBox coordinates: 0-100)
 */
const CONSTELLATION_LAYOUTS = [
  { cx: 15, cy: 50 },  // 1. Start Node
  { cx: 40, cy: 25 },  // 2. Branch Top
  { cx: 45, cy: 75 },  // 3. Branch Bottom
  { cx: 70, cy: 50 },  // 4. Consolidation Center
  { cx: 88, cy: 25 },  // 5. Final Top Branch
  { cx: 90, cy: 70 },  // 6. Final Bottom Branch
];

// Predefined connection links between indices
const CONSTELLATION_LINKS = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 1, to: 3 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
  { from: 3, to: 5 }
];

export default function NeuralConstellationMap({ modules = [], onNodeClick = () => {} }) {
  const { profile } = useAccessibility();
  const theme = profile?.theme || 'cosmic-dark';
  const highContrast = profile?.high_contrast || false;
  const dyslexiaFriendly = profile?.dyslexia_friendly || false;

  const [activeNode, setActiveNode] = useState(null);
  const [audioFeedback, setAudioFeedback] = useState(true);
  const synthRef = useRef(null);

  // Initialize Web Audio API synth oscillator client-side for accessibility sound cues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        synthRef.current = new AudioCtx();
      }
    }
    return () => {
      if (synthRef.current && synthRef.current.state !== 'closed') {
        synthRef.current.close();
      }
    };
  }, []);

  // Soft synthesised cosmic sound on node focus/hover
  const playBeep = (freq = 440, duration = 0.1) => {
    if (!audioFeedback || !synthRef.current || theme === 'low-sensory' || theme === 'eco-saver') return;
    try {
      const ctx = synthRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio Context block:', e);
    }
  };

  // Safe fallback data mapping for database profiles/modules props
  const getMappedModules = () => {
    const defaultModules = [
      {
        id: 'mod-1',
        title: 'Newtonian Kinematics',
        topic: 'Physics',
        progress: 100,
        description: 'Analyzing simple vector forces and linear Newtonian momentum.',
        nextModule: 'F = ma Linear Equations'
      },
      {
        id: 'mod-2',
        title: 'Cognitive Load Models',
        topic: 'Linguistics',
        progress: 80,
        description: 'Structuring clear visual text layouts and memory scaffolds.',
        nextModule: 'Reading Speed Thresholds'
      },
      {
        id: 'mod-3',
        title: 'Interactive Frame Rates',
        topic: 'Media Ingestion',
        progress: 30,
        description: 'Dividing audio tracks and compiling clean caption marks.',
        nextModule: 'Real-time Caption Arrays'
      },
      {
        id: 'mod-4',
        title: 'Quantum Synapse Maps',
        topic: 'Advanced STEM',
        progress: 0,
        description: 'Introduction to qubits, sensory maps, and linear transforms.',
        nextModule: 'Quantum State Matrices'
      },
      {
        id: 'mod-5',
        title: 'Offline Local Caches',
        topic: 'System Sync',
        progress: 0,
        description: 'Persisting offline textbooks and caching battery status checks.',
        nextModule: 'IndexedDB Data Buffers'
      },
      {
        id: 'mod-6',
        title: 'Linguistic Roots Hub',
        topic: 'Translation',
        progress: 0,
        description: 'Auditing multi-lingual transcripts and local dictionaries.',
        nextModule: 'Auto-localization Loops'
      }
    ];

    // If modules are provided, map their database property naming variations safely
    if (modules && modules.length > 0) {
      return modules.map((m, index) => ({
        id: m.id || m.module_id || m._id || `mod-${index + 1}`,
        title: m.title || m.name || m.label || `Course Element ${index + 1}`,
        topic: m.topic || m.subject || m.category || 'General Space Study',
        progress: typeof m.progress === 'number' ? m.progress : (m.completed_percentage || m.completion || 0),
        description: m.description || m.summary || m.details || 'No syllabus notes provided.',
        nextModule: m.nextModule || m.next_module_title || m.next || 'Continuing flight calibration...'
      }));
    }

    return defaultModules;
  };

  const mappedModules = getMappedModules();

  // Helper status calculation based on progress metric
  const getNodeStatus = (progress) => {
    if (progress >= 100) return 'completed';
    if (progress > 0) return 'active';
    return 'locked';
  };

  /**
   * RENDERING SCHEME 4: ECO-SAVER TABULAR LIST
   * Prevents loading heavy vector coordinates, filters, or library animations.
   * Promotes low battery drain and runs flawlessly on extremely slow internet links.
   */
  if (theme === 'eco-saver') {
    return (
      <div className={`w-full p-4 border border-gray-300 bg-white text-black font-mono ${dyslexiaFriendly ? 'font-dyslexic' : ''}`}>
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-300">
          <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
            🔋 System Pathway Deck (Eco-Saver mode)
          </h3>
          <span className="text-[10px] bg-gray-100 px-2 py-0.5 border border-gray-300 rounded font-bold flex items-center gap-1">
            <BatteryCharging className="size-3 text-green-600" /> Battery Saving Active
          </span>
        </div>

        <ul className="space-y-3" role="list">
          {mappedModules.map((node, index) => {
            const status = getNodeStatus(node.progress);
            return (
              <li 
                key={node.id} 
                className="p-3 border border-gray-200 hover:border-black transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-gray-500">[{index + 1}]</span>
                    <span className="font-extrabold text-sm hover:underline cursor-pointer" onClick={() => onNodeClick(node)}>
                      {node.title}
                    </span>
                    <span className="text-[9px] border border-gray-300 bg-gray-50 px-1 rounded uppercase font-bold text-gray-600">
                      {node.topic}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-1">{node.description}</p>
                  <p className="text-[10px] text-gray-500 mt-1 italic">Next Target: {node.nextModule}</p>
                </div>

                <div className="flex items-center gap-3 justify-between sm:justify-end">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold">
                      {status === 'completed' ? '✓ COMPLETE' : status === 'active' ? `● IN PROGRESS (${node.progress}%)` : '🔒 LOCKED'}
                    </span>
                    <progress className="w-24 h-2 mt-1 accent-black" value={node.progress} max="100" />
                  </div>
                  
                  {status !== 'locked' && (
                    <button 
                      onClick={() => onNodeClick(node)}
                      className="px-3 py-1 bg-black text-white hover:bg-gray-800 text-[10px] font-bold uppercase transition-all"
                    >
                      Enter
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className={`w-full flex flex-col gap-6 relative ${dyslexiaFriendly ? 'font-dyslexic' : ''}`}>
      
      {/* Deck Controls (Accessibility Sound Toggle) */}
      {theme !== 'low-sensory' && (
        <div className="absolute top-0 right-0 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAudioFeedback(prev => !prev)}
            className={`p-1.5 rounded-lg border transition-all text-[10px] font-mono font-bold flex items-center gap-1 ${
              highContrast
                ? 'border-yellow-400 text-yellow-400 bg-black'
                : 'border-purple-500/20 hover:border-purple-400/50 bg-[#12163b]/40 text-slate-400 hover:text-white'
            }`}
            aria-label={audioFeedback ? "Mute Navigation Sound Cues" : "Unmute Navigation Sound Cues"}
          >
            {audioFeedback ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
            {audioFeedback ? "SOUND: ON" : "SOUND: OFF"}
          </button>
        </div>
      )}

      {/* Main Graph Grid Canvas */}
      <div 
        className={`w-full aspect-[16/9] min-h-[300px] md:min-h-[400px] rounded-2xl border transition-all relative overflow-hidden flex items-center justify-center ${
          highContrast
            ? 'bg-black border-4 border-yellow-400 text-yellow-400'
            : theme === 'low-sensory'
            ? 'bg-slate-50 border border-slate-200 text-slate-700'
            : 'bg-[#0f112a] border border-purple-500/10 text-white'
        }`}
      >
        
        {/* Dynamic Background Grid Lines (Cosmic Dark only) */}
        {theme === 'cosmic-dark' && (
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <div className="w-full h-full bg-[linear-gradient(to_right,#581c87_1px,transparent_1px),linear-gradient(to_bottom,#581c87_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1)_0%,transparent_80%)]" />
          </div>
        )}

        {/* SVG Node Connections Layer */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none" 
          viewBox="0 0 100 56.25" // Keeps standard 16:9 responsive aspect ratio
          preserveAspectRatio="none"
        >
          {/* SVG Glow Filter (Cosmic Dark only) */}
          {theme === 'cosmic-dark' && (
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          )}

          {/* Connection Bonds */}
          {CONSTELLATION_LINKS.map((link, idx) => {
            const startNode = CONSTELLATION_LAYOUTS[link.from];
            const endNode = CONSTELLATION_LAYOUTS[link.to];

            // Safely evaluate locked states
            const startMod = mappedModules[link.from];
            const endMod = mappedModules[link.to];
            const isCompletedBond = startMod?.progress >= 100 && endMod?.progress > 0;

            let strokeColor = '#334155'; // Muted Slate (locked)
            let strokeWidth = '0.5';
            let isDashed = true;

            if (highContrast) {
              strokeColor = isCompletedBond ? '#fef08a' : '#52525b'; // Yellow (active) vs Gray (locked)
              strokeWidth = '1.2';
              isDashed = !isCompletedBond;
            } else if (theme === 'low-sensory') {
              strokeColor = isCompletedBond ? '#38bdf8' : '#cbd5e1'; // Sky-blue vs Slate
              strokeWidth = '0.8';
              isDashed = false; // No complex dash structures
            } else {
              // Cosmic Dark
              strokeColor = isCompletedBond ? '#a855f7' : '#1e1b4b'; // Purple vs Deep Indigo
              strokeWidth = isCompletedBond ? '0.75' : '0.4';
              isDashed = !isCompletedBond;
            }

            return (
              <line
                key={`link-${idx}`}
                x1={startNode.cx}
                y1={(startNode.cy / 100) * 56.25} // Rescale Y to 16:9 coordinate system
                x2={endNode.cx}
                y2={(endNode.cy / 100) * 56.25}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={isDashed ? "2, 2" : "none"}
                className={theme === 'cosmic-dark' && isCompletedBond ? 'animate-pulse' : ''}
                style={
                  theme === 'cosmic-dark' && isCompletedBond
                    ? { filter: 'url(#glow)' }
                    : {}
                }
              />
            );
          })}
        </svg>

        {/* Dynamic Nodes Loop */}
        {mappedModules.map((node, index) => {
          const coord = CONSTELLATION_LAYOUTS[index] || { cx: 50, cy: 50 };
          const status = getNodeStatus(node.progress);

          // Accessibility Keyboard Focus Action
          const handleKeyDown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              playBeep(523.25, 0.15); // Play high C tone
              onNodeClick(node);
            }
          };

          return (
            <div
              key={node.id}
              className="absolute"
              style={{
                left: `${coord.cx}%`,
                top: `${coord.cy}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Theme 1: Cosmic Dark (High Animations, Pulsing Filters) */}
              {theme === 'cosmic-dark' && (
                <div className="relative group select-none">
                  {/* Outer Pulsing Aura for active nodes */}
                  {status === 'active' && (
                    <div className="absolute inset-0 rounded-full scale-150 bg-sky-500/10 border border-sky-400/30 animate-ping pointer-events-none" />
                  )}
                  {status === 'completed' && (
                    <div className="absolute inset-0 rounded-full scale-150 bg-purple-500/10 border border-purple-400/30 animate-pulse pointer-events-none" />
                  )}

                  {/* Core Interactive Node */}
                  <motion.button
                    whileHover={{ scale: 1.25 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      playBeep(587.33, 0.12); // Play D tone
                      onNodeClick(node);
                    }}
                    onFocus={() => {
                      playBeep(440, 0.08); // A tone
                      setActiveNode(node);
                    }}
                    onMouseEnter={() => {
                      playBeep(440, 0.08); // A tone
                      setActiveNode(node);
                    }}
                    onMouseLeave={() => setActiveNode(null)}
                    onKeyDown={handleKeyDown}
                    className={`size-10 rounded-full flex items-center justify-center border-2 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 relative z-10 cursor-pointer ${
                      status === 'completed'
                        ? 'bg-purple-600 border-purple-400 text-white shadow-purple-500/25'
                        : status === 'active'
                        ? 'bg-sky-900 border-sky-400 text-sky-200 shadow-sky-500/25'
                        : 'bg-[#1a1c3d] border-indigo-950 text-slate-600 cursor-not-allowed'
                    }`}
                    aria-label={`Syllabus Node ${index + 1}: ${node.title}. Status: ${status}. Progress: ${node.progress} percent.`}
                  >
                    {status === 'completed' ? (
                      <CheckCircle className="size-5 text-white" />
                    ) : status === 'active' ? (
                      <Play className="size-4 text-sky-200 fill-sky-200/20 translate-x-[1px]" />
                    ) : (
                      <Lock className="size-4 text-slate-600" />
                    )}
                  </motion.button>

                  {/* Quick Small Index Number */}
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase text-slate-500 font-bold group-hover:text-purple-300 transition-colors">
                    STAR_{index + 1}
                  </div>
                </div>
              )}

              {/* Theme 2: High Contrast (Static, Yellow/Black, Outlined, AAA compliant) */}
              {theme === 'high-contrast' && (
                <div className="relative">
                  <button
                    onClick={() => {
                      playBeep(400, 0.1);
                      onNodeClick(node);
                    }}
                    onFocus={() => setActiveNode(node)}
                    onMouseEnter={() => setActiveNode(node)}
                    onMouseLeave={() => setActiveNode(null)}
                    onKeyDown={handleKeyDown}
                    className={`size-12 rounded-full flex flex-col items-center justify-center border-4 font-bold text-base focus:outline-none focus:ring-4 focus:ring-yellow-400 cursor-pointer z-10 ${
                      status === 'completed'
                        ? 'bg-black border-yellow-400 text-yellow-400'
                        : status === 'active'
                        ? 'bg-black border-yellow-400 text-yellow-400'
                        : 'bg-black border-gray-600 text-gray-600 cursor-not-allowed'
                    }`}
                    aria-label={`Syllabus Node ${index + 1}: ${node.title}. Progress ${node.progress}%.`}
                  >
                    <span>{index + 1}</span>
                  </button>
                  
                  {/* Status Indicator text underneath */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-black uppercase text-yellow-400 whitespace-nowrap bg-black px-1">
                    {status === 'completed' ? 'DONE' : status === 'active' ? 'PLAY' : 'LOCK'}
                  </div>
                </div>
              )}

              {/* Theme 3: Low Sensory (Pastel, Soft Edges, Flat, Static) */}
              {theme === 'low-sensory' && (
                <div className="relative group">
                  <button
                    onClick={() => onNodeClick(node)}
                    onFocus={() => setActiveNode(node)}
                    onMouseEnter={() => setActiveNode(node)}
                    onMouseLeave={() => setActiveNode(null)}
                    onKeyDown={handleKeyDown}
                    className={`size-10 rounded-full flex items-center justify-center border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer z-10 ${
                      status === 'completed'
                        ? 'bg-sky-500 border-sky-600 text-white'
                        : status === 'active'
                        ? 'bg-sky-100 border-sky-400 text-sky-800'
                        : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                    aria-label={`Module ${index + 1}: ${node.title}`}
                  >
                    {status === 'completed' ? (
                      <CheckCircle className="size-5" />
                    ) : status === 'active' ? (
                      <Play className="size-4 fill-sky-800/10 translate-x-[1px]" />
                    ) : (
                      <Lock className="size-4" />
                    )}
                  </button>

                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-sans text-slate-500 font-medium whitespace-nowrap">
                    {node.title.split(' ')[0]}
                  </div>
                </div>
              )}

            </div>
          );
        })}

        {/* Central Space Constellation HUD Label (Only in Cosmic Theme) */}
        {theme === 'cosmic-dark' && (
          <div className="absolute bottom-6 left-6 font-mono text-[10px] text-slate-600 flex flex-col gap-0.5 border-l border-purple-500/10 pl-3 uppercase">
            <span className="font-bold text-slate-400">Pathfinder Constellation Map</span>
            <span>Scale: Astro_1.0x</span>
            <span>Grid state: Synchronized</span>
          </div>
        )}
      </div>

      {/* Dynamic HUD Tooltip Card Drawer */}
      <div className="min-h-[140px] w-full">
        <AnimatePresence mode="wait">
          {activeNode ? (
            <motion.div
              key={activeNode.id}
              initial={theme !== 'low-sensory' ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={theme !== 'low-sensory' ? { opacity: 0, y: -10 } : { opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`p-5 rounded-xl border flex flex-col md:flex-row justify-between gap-4 transition-all duration-300 ${
                highContrast
                  ? 'bg-black border-4 border-yellow-400 text-yellow-400'
                  : theme === 'low-sensory'
                  ? 'bg-slate-50 border border-slate-200 text-slate-700 shadow-sm'
                  : 'bg-[#12163b]/70 border border-purple-500/10 text-white backdrop-blur-md shadow-lg'
              }`}
            >
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-black border ${
                    highContrast
                      ? 'border-yellow-400 text-yellow-400'
                      : theme === 'low-sensory'
                      ? 'border-sky-300 bg-sky-100 text-sky-800'
                      : 'border-purple-500/30 bg-purple-500/10 text-purple-300'
                  }`}>
                    {activeNode.topic}
                  </span>
                  <h4 className="text-lg font-extrabold tracking-tight">{activeNode.title}</h4>
                </div>
                
                <p className="text-xs opacity-80 leading-relaxed max-w-xl">{activeNode.description}</p>
                <p className="text-[11px] opacity-60 font-mono">
                  🚀 NEXT STAR TARGET: {activeNode.nextModule}
                </p>
              </div>

              <div className="flex flex-col justify-between items-end gap-3 min-w-[140px] border-t md:border-t-0 md:border-l border-slate-800/40 md:pl-4 pt-3 md:pt-0">
                <div className="w-full flex items-center justify-between md:justify-end gap-2 text-right">
                  <span className="text-[10px] font-mono uppercase opacity-60">Status Check</span>
                  <span className="font-extrabold text-xs">
                    {getNodeStatus(activeNode.progress) === 'completed' 
                      ? '✓ SYNAPSE READY' 
                      : getNodeStatus(activeNode.progress) === 'active' 
                      ? `● CHARGING (${activeNode.progress}%)` 
                      : '🔒 SECURED'}
                  </span>
                </div>

                {getNodeStatus(activeNode.progress) !== 'locked' ? (
                  <button
                    onClick={() => {
                      playBeep(659.25, 0.15); // Play E tone
                      onNodeClick(activeNode);
                    }}
                    className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      highContrast
                        ? 'bg-yellow-400 text-black hover:bg-yellow-300 border-2 border-yellow-500'
                        : theme === 'low-sensory'
                        ? 'bg-sky-500 hover:bg-sky-600 text-white'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/15'
                    }`}
                  >
                    Enter Module <ArrowRight className="size-4" />
                  </button>
                ) : (
                  <div className="w-full py-2.5 px-4 rounded-lg bg-slate-800/40 border border-slate-800 text-[10px] font-mono text-center opacity-50 flex items-center justify-center gap-1">
                    <Lock className="size-3.5" /> MODULE SECURED
                  </div>
                )}
              </div>

            </motion.div>
          ) : (
            <div 
              className={`p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center gap-2 ${
                highContrast
                  ? 'border-yellow-400 text-yellow-400 bg-black'
                  : theme === 'low-sensory'
                  ? 'border-slate-200 text-slate-400 bg-slate-50'
                  : 'border-purple-500/10 text-slate-500 bg-[#12163b]/10'
              }`}
            >
              <Award className="size-7 opacity-40 animate-pulse text-purple-400" />
              <div>
                <p className="text-xs font-bold">Select a Star System Above</p>
                <p className="text-[10px] opacity-60">Hover or focus a node to display cognitive roadmap summaries.</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
