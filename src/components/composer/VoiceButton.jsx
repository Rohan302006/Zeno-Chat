import React from 'react';
import { Mic, MicOff } from 'lucide-react';

/**
 * Microphone button with visual listening pulse state and graceful fallback.
 */
export function VoiceButton({
  isListening,
  isSupported,
  onToggle,
  disabled,
}) {
  if (!isSupported) {
    return (
      <button
        type="button"
        disabled
        title="Speech recognition is not supported in this browser"
        aria-label="Speech recognition not supported"
        className="p-2 rounded-xl text-slate-400/40 cursor-not-allowed"
      >
        <MicOff className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      title={isListening ? 'Stop listening' : 'Voice input (Dictate)'}
      aria-label={isListening ? 'Stop listening' : 'Voice input'}
      className={`relative p-2 rounded-xl transition-all duration-200 active:scale-95 ${
        isListening
          ? 'bg-rose-500 text-white animate-recording shadow-lg shadow-rose-500/30'
          : 'text-slate-400 hover:text-slate-200 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <Mic className="w-4 h-4" />
      {isListening && (
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-400 animate-ping" />
      )}
    </button>
  );
}
