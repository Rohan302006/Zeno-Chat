import React from 'react';
import { Sparkles, Terminal, Compass, Lightbulb, PenTool, ArrowUpRight } from 'lucide-react';

const SUGGESTIONS = [
  {
    icon: Terminal,
    category: 'Development',
    title: 'React Concurrent & Server State',
    prompt: 'Explain the difference between optimistic updates and streaming server state in React 19.',
  },
  {
    icon: Lightbulb,
    category: 'Architecture',
    title: 'System Design Patterns',
    prompt: 'How would you architect a real-time collaborative workspace with conflict resolution?',
  },
  {
    icon: Compass,
    category: 'Problem Solving',
    title: 'Algorithm Optimization',
    prompt: 'Review common memory leak patterns in asynchronous JavaScript event listeners.',
  },
  {
    icon: PenTool,
    category: 'Creative Writing',
    title: 'Product Launch Pitch',
    prompt: 'Draft a compelling, minimal launch announcement for a high-end AI developer tool.',
  },
];

/**
 * Polished empty state with original glassmorphic emblem and interactive suggestion cards.
 */
export function EmptyState({ onSelectSuggestion }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto px-4 py-8 text-center animate-in fade-in duration-500">
      {/* Luminous Glass Emblem */}
      <div className="relative mb-6">
        <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-2xl opacity-70" />
        <div className="relative w-16 h-16 rounded-2xl glass-card flex items-center justify-center border border-white/20 shadow-xl shadow-indigo-500/10">
          <Sparkles className="w-8 h-8 text-indigo-500 dark:text-indigo-400 animate-pulse" />
        </div>
      </div>

      {/* Hero Heading & Subtitle */}
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-theme-main mb-2">
        Where curiosity meets intelligence.
      </h2>
      <p className="text-sm sm:text-base text-theme-muted max-w-md mb-8">
        Ask complex questions, refine code, analyze designs, or brainstorm your next milestone.
      </p>

      {/* Suggestion Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSuggestion(item.prompt)}
              className="group relative flex flex-col justify-between p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98] transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-indigo-500 dark:text-indigo-400">
                  <Icon className="w-3.5 h-3.5" />
                  {item.category}
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div className="text-sm font-semibold text-theme-main mb-1 group-hover:text-indigo-500 transition-colors">
                {item.title}
              </div>

              <p className="text-xs text-theme-muted line-clamp-2">
                {item.prompt}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
