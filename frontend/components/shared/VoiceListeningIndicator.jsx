import React from 'react';

export default function VoiceListeningIndicator({ 
  isListening = false, 
  noiseFloor = '0.05', 
  className = '' 
}) {
  const bars = Array.from({ length: 8 });

  return (
    <div className={`p-4 bg-black/40 border border-[#E8A33D]/30 flex flex-col gap-3 font-mono text-xs text-[#bec8d2] rounded-none ${className}`}>
      <div className="flex justify-between items-center select-none">
        <span className="flex items-center gap-2">
          {isListening ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8A33D] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E8A33D]"></span>
              </span>
              <span className="text-[#E8A33D] font-bold uppercase tracking-wider">Voice Control Stream Active</span>
            </>
          ) : (
            <>
              <span className="size-2.5 rounded-full bg-[#A8A39C]/40"></span>
              <span className="text-[#A8A39C]/60 uppercase tracking-wider">Voice Loop Standby</span>
            </>
          )}
        </span>
        <span className="text-[10px] text-[#A8A39C] uppercase font-bold tracking-wider">
          Noise Floor: {parseFloat(noiseFloor).toFixed(4)} RMS
        </span>
      </div>

      {/* Bouncing Equalizer visualizer */}
      <div className="h-10 flex items-end justify-center gap-1.5 bg-black/50 p-2 border border-white/5 relative overflow-hidden">
        {bars.map((_, idx) => {
          // Define different heights and animation speeds for bar variety
          const animDuration = `${0.5 + idx * 0.1}s`;
          const baseHeight = isListening ? 'h-full' : 'h-1.5';
          
          return (
            <div 
              key={idx}
              className={`w-2.5 bg-[#E8A33D]/80 transition-all duration-300 ${baseHeight}`}
              style={{
                animation: isListening ? `bounceEqualizer ${animDuration} ease-in-out infinite alternate` : 'none',
                // Offset start times slightly
                animationDelay: `${idx * 0.05}s`
              }}
            />
          );
        })}

        {/* CSS Keyframe definition inline to avoid global stylesheet dependencies */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes bounceEqualizer {
            0% { height: 10%; }
            100% { height: 95%; }
          }
        `}} />
      </div>
    </div>
  );
}
