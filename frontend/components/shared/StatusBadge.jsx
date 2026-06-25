import React from 'react';

export default function StatusBadge({ status, className = '' }) {
  // Normalize status value
  const s = (status || '').toLowerCase();

  let icon = null;
  let text = '';
  let colorClass = '';

  if (s === 'ready' || s === 'completed') {
    icon = (
      <svg className="size-3.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
    text = 'Ready';
    colorClass = 'text-[#5DCAA5] border-[#5DCAA5]/20 bg-[#5DCAA5]/5';
  } else if (s === 'failed' || s === 'error') {
    icon = (
      <svg className="size-3.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
    text = 'Failed';
    colorClass = 'text-[#E24B4A] border-[#E24B4A]/20 bg-[#E24B4A]/5';
  } else if (s === 'needs_review' || s === 'warning' || s === 'needs review') {
    icon = (
      <svg className="size-3.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
      </svg>
    );
    text = 'Needs Review';
    colorClass = 'text-[#EF9F27] border-[#EF9F27]/20 bg-[#EF9F27]/5';
  } else {
    // default/processing state: 'pending' | 'extracting' | 'translating' | 'auditing'
    icon = (
      <span className="relative flex h-2 w-2 mr-2 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A8A39C] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A8A39C]"></span>
      </span>
    );
    text = s === 'extracting' ? 'Extracting Text...' :
           s === 'translating' ? 'Translating...' :
           s === 'auditing' ? 'Auditing...' :
           s === 'pending' ? 'Pending...' : 'Processing...';
    colorClass = 'text-[#A8A39C] border-white/10 bg-white/[0.02]';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-mono font-bold uppercase border rounded-none tracking-wider ${colorClass} ${className}`}>
      {icon}
      {text}
    </span>
  );
}
