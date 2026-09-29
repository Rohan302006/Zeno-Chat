import React from 'react';
import { ArrowUp, Square } from 'lucide-react';

/**
 * Dynamic Send / Stop Generation button.
 */
export function SendButton({
  isGenerating,
  canSend,
  onSend,
  onStop,
}) {
  if (isGenerating) {
    return (
      <button
        type="button"
        onClick={onStop}
        title="Stop generation (Esc)"
        aria-label="Stop generation"
        className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20 active:scale-90 transition-all duration-150"
      >
        <Square className="w-3.5 h-3.5 fill-current" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSend}
      disabled={!canSend}
      title="Send message (Enter)"
      aria-label="Send message"
      className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-150 active:scale-95 ${
        canSend
          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
          : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-slate-500 cursor-not-allowed'
      }`}
    >
      <ArrowUp className="w-4 h-4 stroke-[2.5]" />
    </button>
  );
}
