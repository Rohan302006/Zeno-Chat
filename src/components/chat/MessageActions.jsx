import React, { useState } from 'react';
import { Copy, Check, RotateCcw, Volume2, Square, Edit3 } from 'lucide-react';
import { copyToClipboard } from '../../utils/chatHelpers';

/**
 * Action toolbar shown on hover for user and assistant messages.
 */
export function MessageActions({
  message,
  onRegenerate,
  onEdit,
  onSpeak,
  isSpeakingThis,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isAssistant = message.role === 'assistant';

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 mt-1.5 px-1">
      {/* Copy Button */}
      <button
        type="button"
        onClick={handleCopy}
        title={copied ? 'Copied' : 'Copy message'}
        aria-label="Copy message"
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 active:scale-95 transition-all"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Assistant Only Actions */}
      {isAssistant && (
        <>
          {/* Read Aloud Button */}
          {onSpeak && (
            <button
              type="button"
              onClick={() => onSpeak(message.content, message.id)}
              title={isSpeakingThis ? 'Stop speaking' : 'Read aloud'}
              aria-label={isSpeakingThis ? 'Stop speaking' : 'Read aloud'}
              className={`p-1.5 rounded-lg transition-all active:scale-95 ${
                isSpeakingThis
                  ? 'text-indigo-400 bg-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10'
              }`}
            >
              {isSpeakingThis ? (
                <div className="flex items-center gap-0.5 px-0.5">
                  <span className="w-1 bg-indigo-400 rounded-full soundwave-bar" />
                  <span className="w-1 bg-indigo-400 rounded-full soundwave-bar" />
                  <span className="w-1 bg-indigo-400 rounded-full soundwave-bar" />
                </div>
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {/* Regenerate Button */}
          {onRegenerate && (
            <button
              type="button"
              onClick={() => onRegenerate(message.id)}
              title="Regenerate response"
              aria-label="Regenerate response"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 active:scale-95 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </>
      )}

      {/* User Only Actions */}
      {!isAssistant && onEdit && (
        <button
          type="button"
          onClick={() => onEdit(message)}
          title="Edit message"
          aria-label="Edit message"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 active:scale-95 transition-all"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
