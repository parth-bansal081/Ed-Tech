import React from 'react';

export default function ProgressSteps({ steps = [], currentStepIndex = 0 }) {
  return (
    <div className="w-full font-mono text-xs text-[#bec8d2]">
      {/* Visual Step Bar */}
      <div className="flex items-center gap-4 mb-3 select-none">
        {steps.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const isCompleted = idx < currentStepIndex;
          
          return (
            <React.Fragment key={idx}>
              {/* Step Chip */}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center justify-center size-5 border font-bold ${
                  isActive ? 'border-sky-500 bg-sky-500/10 text-sky-400' :
                  isCompleted ? 'border-[#5DCAA5] bg-[#5DCAA5]/10 text-[#5DCAA5]' :
                  'border-[#3e4850] text-[#A8A39C]'
                }`}>
                  {idx + 1}
                </span>
                <span className={`${isActive ? 'text-white font-bold' : isCompleted ? 'text-[#bec8d2]/70' : 'text-[#A8A39C]'}`}>
                  {step.label}
                </span>
              </div>
              
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-[2px] ${
                  isCompleted ? 'bg-[#5DCAA5]/40' : 'bg-[#3e4850]/40'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      {/* Description of active step */}
      {steps[currentStepIndex]?.description && (
        <p className="text-[11px] text-[#A8A39C]/80 mt-1 uppercase tracking-wider">
          {steps[currentStepIndex].description}
        </p>
      )}
    </div>
  );
}
