import React, { useState, useRef, useEffect } from 'react';

export default function GlossaryTerm({ 
  term, 
  translation, 
  definition, 
  onSuggestCorrection 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [correctionVal, setCorrectionVal] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!correctionVal.trim()) return;
    if (typeof onSuggestCorrection === 'function') {
      onSuggestCorrection(correctionVal.trim());
    }
    setSubmitted(true);
    setCorrectionVal('');
    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
    }, 2000);
  };

  return (
    <span className="relative inline-block" ref={containerRef}>
      {/* Trigger term button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="font-bold border-b border-dashed border-[#8B7FD1] text-white hover:text-[#8B7FD1] transition-colors focus:outline-none focus:ring-1 focus:ring-[#8B7FD1] cursor-pointer"
        aria-expanded={isOpen}
      >
        {translation || term}
      </button>

      {/* Popover overlay */}
      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-[#1C1B22] border border-[#8B7FD1]/40 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] text-[#e5e2e1] font-mono rounded-none">
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-t-[6px] border-t-[#1C1B22] border-x-[6px] border-x-transparent" />
          
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-start border-b border-white/10 pb-1.5">
              <span className="text-[10px] text-[#8B7FD1] uppercase font-bold tracking-widest">Bilingual STEM Glossary</span>
              <button 
                type="button" 
                onClick={() => setIsOpen(false)}
                className="text-[#A8A39C] hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <div className="text-[11px] text-[#A8A39C] uppercase font-bold tracking-wider mb-0.5">Original Term</div>
              <div className="text-white text-sm font-bold uppercase">{term}</div>
            </div>

            <div>
              <div className="text-[11px] text-[#A8A39C] uppercase font-bold tracking-wider mb-0.5">Translation</div>
              <div className="text-[#8B7FD1] text-sm font-bold uppercase">{translation || 'Not translated'}</div>
            </div>

            <div>
              <div className="text-[11px] text-[#A8A39C] uppercase font-bold tracking-wider mb-0.5">Concept Definition</div>
              <p className="text-xs text-[#bec8d2] leading-relaxed">{definition || 'No definition available.'}</p>
            </div>

            {onSuggestCorrection && (
              <div className="border-t border-white/10 pt-2.5 mt-1.5">
                {submitted ? (
                  <div className="text-[#5DCAA5] text-[10px] font-bold uppercase">
                    ✓ Suggestion shared with community
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-[#A8A39C] uppercase font-bold tracking-wider">
                      Suggest Correction:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        className="flex-1 bg-[#242329] border border-[#3e4850] text-[#e5e2e1] px-2 py-1 text-xs rounded-none focus:outline-none focus:border-[#8B7FD1]"
                        placeholder="Correct term..."
                        value={correctionVal}
                        onChange={(e) => setCorrectionVal(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="px-3 py-1 bg-[#8B7FD1] text-black text-xs font-bold uppercase hover:bg-[#a095e0] transition-colors"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </span>
  );
}
