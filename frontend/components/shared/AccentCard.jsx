import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const accentConfigs = {
  none: {
    border: 'border-[#3e4850]/40',
    glow: '',
    hoverGlow: 'hover:border-sky-500/40 hover:shadow-[0_0_15px_rgba(14,165,233,0.15)]'
  },
  amber: {
    border: 'border-[#E8A33D]/40',
    glow: 'shadow-[0_0_12px_rgba(232,163,61,0.12)]',
    hoverGlow: 'hover:border-[#E8A33D]/70 hover:shadow-[0_0_18px_rgba(232,163,61,0.22)]'
  },
  teal: {
    border: 'border-[#3FA796]/40',
    glow: 'shadow-[0_0_12px_rgba(63,167,150,0.12)]',
    hoverGlow: 'hover:border-[#3FA796]/70 hover:shadow-[0_0_18px_rgba(63,167,150,0.22)]'
  },
  coral: {
    border: 'border-[#E2725B]/40',
    glow: 'shadow-[0_0_12px_rgba(226,114,91,0.12)]',
    hoverGlow: 'hover:border-[#E2725B]/70 hover:shadow-[0_0_18px_rgba(226,114,91,0.22)]'
  },
  violet: {
    border: 'border-[#8B7FD1]/40',
    glow: 'shadow-[0_0_12px_rgba(139,127,209,0.12)]',
    hoverGlow: 'hover:border-[#8B7FD1]/70 hover:shadow-[0_0_18px_rgba(139,127,209,0.22)]'
  },
  success: {
    border: 'border-[#5DCAA5]/40',
    glow: 'shadow-[0_0_12px_rgba(93,202,165,0.12)]',
    hoverGlow: 'hover:border-[#5DCAA5]/70 hover:shadow-[0_0_18px_rgba(93,202,165,0.22)]'
  },
  warning: {
    border: 'border-[#EF9F27]/40',
    glow: 'shadow-[0_0_12px_rgba(239,159,39,0.12)]',
    hoverGlow: 'hover:border-[#EF9F27]/70 hover:shadow-[0_0_18px_rgba(239,159,39,0.22)]'
  },
  error: {
    border: 'border-[#E24B4A]/40',
    glow: 'shadow-[0_0_12px_rgba(226,75,74,0.12)]',
    hoverGlow: 'hover:border-[#E24B4A]/70 hover:shadow-[0_0_18px_rgba(226,75,74,0.22)]'
  }
};

export default function AccentCard({ 
  children, 
  accent = 'none', 
  hover = true, 
  active = false,
  onClick, 
  className = '' 
}) {
  const config = accentConfigs[accent] || accentConfigs.none;
  const isClickable = typeof onClick === 'function';

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-6 bg-[#1C1B22] border rounded-none transition-all duration-300 relative",
        // Base Specular highlight styles (top/left bright, bottom/right dark)
        "border-t-white/10 border-l-white/10 border-b-black/30 border-r-black/20",
        config.border,
        active && config.glow,
        active && "border-opacity-100",
        isClickable && "cursor-pointer select-none",
        isClickable && hover && config.hoverGlow,
        className
      )}
    >
      {children}
    </div>
  );
}
