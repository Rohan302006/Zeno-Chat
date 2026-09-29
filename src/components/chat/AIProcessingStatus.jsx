import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Cpu, Compass, CheckCircle2 } from 'lucide-react';

const STATUS_STEPS = [
  { text: 'Thinking...', icon: Brain, color: 'text-indigo-400' },
  { text: 'Analyzing...', icon: Cpu, color: 'text-purple-400' },
  { text: 'Gathering information...', icon: Compass, color: 'text-sky-400' },
  { text: 'Formulating response...', icon: Sparkles, color: 'text-violet-400' },
  { text: 'Almost there...', icon: CheckCircle2, color: 'text-emerald-400' },
];

/**
 * AIProcessingStatus displays a dynamic, rotating status indicator
 * during AI inference to keep users informed and engaged.
 */
export function AIProcessingStatus() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % STATUS_STEPS.length);
    }, 1600);

    return () => clearInterval(interval);
  }, []);

  const current = STATUS_STEPS[currentIndex];
  const Icon = current.icon;

  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-2xl glass-card border border-indigo-500/20 bg-indigo-500/[0.04] dark:bg-white/[0.02] shadow-lg shadow-indigo-500/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Animated Glowing Icon Orb */}
      <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 border border-indigo-500/30 shadow-md shadow-indigo-500/20 flex-shrink-0">
        <span className="absolute -inset-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-30 blur-sm animate-pulse" />
        <Icon className={`w-4 h-4 ${current.color} transition-all duration-300 relative z-10 animate-spin-slow`} />
      </div>

      {/* Status Details */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider font-semibold text-indigo-500 dark:text-indigo-400">
          <span>AI Processing Status</span>
          <span className="inline-flex gap-1 items-center">
            <span className="w-1 h-1 rounded-full bg-indigo-400 animate-ping" />
          </span>
        </div>

        {/* Dynamic Rotating Message with Smooth Transition */}
        <div className="h-5 flex items-center">
          <span
            key={currentIndex}
            className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 animate-in fade-in slide-in-from-top-1 duration-300 truncate"
          >
            {current.text}
          </span>
        </div>
      </div>

      {/* Progress Dots Indicator */}
      <div className="ml-auto hidden sm:flex items-center gap-1">
        {STATUS_STEPS.map((_, idx) => (
          <span
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? 'w-4 bg-indigo-500'
                : idx < currentIndex
                ? 'w-1.5 bg-indigo-500/40'
                : 'w-1.5 bg-slate-400/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
