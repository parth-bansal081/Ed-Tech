import React from 'react';

const barrierConfig = {
  language: {
    color: 'text-[#8B7FD1]', // var(--accent-violet)
    label: 'removes: language barrier'
  },
  disability: {
    color: 'text-[#3FA796]', // var(--accent-teal)
    label: 'removes: disability barrier'
  },
  geography: {
    color: 'text-[#E8A33D]', // var(--accent-amber)
    label: 'removes: geography barrier'
  },
  cost: {
    color: 'text-[#E2725B]', // var(--accent-coral)
    label: 'removes: cost/economic barrier'
  }
};

export default function BarrierTag({ barrier }) {
  const config = barrierConfig[barrier.toLowerCase()];
  if (!config) return null;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-[#242329] ${config.color} font-mono lowercase`}>
      {config.label}
    </span>
  );
}
