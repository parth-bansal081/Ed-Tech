import React from 'react';
import { Globe, Accessibility } from 'lucide-react';

const langNames = {
  en: 'English (en)',
  es: 'Spanish (es)',
  fr: 'French (fr)',
  de: 'German (de)',
  ja: 'Japanese (ja)',
  zh: 'Chinese (zh)',
  hi: 'Hindi (hi)'
};

export function LanguageChip({ 
  code, 
  active = false, 
  onClick, 
  onRemove, 
  className = '' 
}) {
  const name = langNames[code.toLowerCase()] || code.toUpperCase();
  const isClickable = typeof onClick === 'function';
  const isRemovable = typeof onRemove === 'function';

  return (
    <span 
      onClick={isClickable ? onClick : undefined}
      className={`inline-flex items-center px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all duration-200 rounded-none border ${
        active 
          ? 'bg-[#8B7FD1]/10 border-[#8B7FD1]/40 text-[#8B7FD1]' 
          : 'bg-[#242329] border-white/5 text-[#A8A39C] hover:border-white/10 hover:text-[#F5F1EA]'
      } ${isClickable ? 'cursor-pointer select-none' : ''} ${className}`}
    >
      <Globe className="size-3.5 mr-1.5 flex-shrink-0" />
      {name}
      {isRemovable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-2 text-[#A8A39C] hover:text-white font-bold"
        >
          ✕
        </button>
      )}
    </span>
  );
}

const disabilityNames = {
  blind: 'Blind / Low Vision 👁️',
  deaf: 'Deaf / Hard of Hearing 🤟',
  dyslexia: 'Dyslexia 📖',
  adhd: 'ADHD ⚡',
  autism: 'Autism (Sensory) 🍃',
  none: 'Standard Mode 🚀'
};

export function ModeChip({ 
  mode, 
  active = false, 
  onClick, 
  onRemove, 
  className = '' 
}) {
  const name = disabilityNames[mode.toLowerCase()] || mode.toUpperCase();
  const isClickable = typeof onClick === 'function';
  const isRemovable = typeof onRemove === 'function';

  return (
    <span 
      onClick={isClickable ? onClick : undefined}
      className={`inline-flex items-center px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all duration-200 rounded-none border ${
        active 
          ? 'bg-[#3FA796]/10 border-[#3FA796]/40 text-[#3FA796]' 
          : 'bg-[#242329] border-white/5 text-[#A8A39C] hover:border-white/10 hover:text-[#F5F1EA]'
      } ${isClickable ? 'cursor-pointer select-none' : ''} ${className}`}
    >
      <Accessibility className="size-3.5 mr-1.5 flex-shrink-0" />
      {name}
      {isRemovable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-2 text-[#A8A39C] hover:text-white font-bold"
        >
          ✕
        </button>
      )}
    </span>
  );
}
