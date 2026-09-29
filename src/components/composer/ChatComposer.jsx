import React, { useRef, useEffect, useState } from 'react';
import { Plus, Image as ImageIcon } from 'lucide-react';
import { VoiceButton } from './VoiceButton';
import { SendButton } from './SendButton';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

/**
 * ChatComposer renders the bottom glassmorphic input area with auto-resizing,
 * speech recognition, keyboard shortcuts, and future-proof attachment slot.
 */
export function ChatComposer({
  onSendMessage,
  onStopGeneration,
  isGenerating,
  enterToSend = true,
}) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const {
    isSupported: isSpeechSupported,
    isListening,
    transcript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Sync speech transcript into input
  useEffect(() => {
    if (transcript) {
      setInput((prev) => {
        // If user already typed, append speech with a space
        const trimmed = prev.trim();
        return trimmed ? `${trimmed} ${transcript}` : transcript;
      });
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  // Auto-resize textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 180);
    textarea.style.height = `${Math.max(newHeight, 44)}px`;
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isGenerating) return;
    if (isListening) stopListening();

    onSendMessage(input.trim());
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && isGenerating) {
      e.preventDefault();
      onStopGeneration();
      return;
    }

    if (enterToSend && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleToggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const canSend = Boolean(input.trim()) && !isGenerating;

  return (
    <div className="relative w-full max-w-4xl mx-auto px-3 sm:px-6 pb-4">
      {/* Listening Toast Alert if active */}
      {isListening && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/90 text-white text-xs font-medium shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>Listening to your voice... Speak now</span>
          <button
            type="button"
            onClick={stopListening}
            className="ml-1 text-[11px] underline hover:text-white/80"
          >
            Done
          </button>
        </div>
      )}

      {/* Speech error toast */}
      {speechError && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-amber-500/90 text-slate-950 text-xs font-medium shadow-lg backdrop-blur-md">
          {speechError}
        </div>
      )}

      {/* Glassmorphism Composer Box */}
      <div className="relative flex flex-col rounded-2xl glass-panel p-2 shadow-2xl transition-all duration-200 border border-slate-200/80 dark:border-white/[0.1] focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20">
        {/* Text Input Area */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Zeno anything... (Shift + Enter for newline)"
          rows={1}
          className="w-full px-3 py-2 bg-transparent text-[14.5px] leading-relaxed text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none min-h-[44px] max-h-[180px]"
        />

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between pt-1 px-1">
          {/* Left Actions: Attachment placeholder & Voice */}
          <div className="flex items-center gap-1">
            {/* Future Image Attachment Slot (Reserved for Phase 2) */}
            <button
              type="button"
              disabled
              title="Image upload coming in Phase 2"
              aria-label="Add image attachment (Phase 2)"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 opacity-60 cursor-not-allowed transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Voice Input Button */}
            <VoiceButton
              isListening={isListening}
              isSupported={isSpeechSupported}
              onToggle={handleToggleVoice}
              disabled={isGenerating}
            />
          </div>

          {/* Right Action: Send / Stop Button */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[11px] text-slate-400 dark:text-slate-500">
              {isGenerating ? 'Press Esc to stop' : 'Return to send'}
            </span>
            <SendButton
              isGenerating={isGenerating}
              canSend={canSend}
              onSend={handleSend}
              onStop={onStopGeneration}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
