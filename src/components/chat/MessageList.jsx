import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, AlertCircle, RefreshCw } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { EmptyState } from './EmptyState';
import { AIProcessingStatus } from './AIProcessingStatus';

/**
 * MessageList renders the chronological conversation stream with auto-scroll management,
 * generation indicators, and error banners with retry triggers.
 */
export function MessageList({
  messages = [],
  isGenerating = false,
  error = null,
  onRetry,
  onRegenerate,
  onEditSave,
  onSelectSuggestion,
  onSpeak,
  speakingMessageId,
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const isAutoScrollActiveRef = useRef(true);

  // Auto-scroll handler
  const scrollToBottom = (behavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
  };

  // Monitor user scrolling to toggle "scroll to bottom" button
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    const isNearBottom = distanceFromBottom < 100;
    isAutoScrollActiveRef.current = isNearBottom;
    setShowScrollBottom(!isNearBottom && scrollHeight > clientHeight + 150);
  };

  // Auto-scroll when messages update or stream in
  useEffect(() => {
    if (isAutoScrollActiveRef.current) {
      scrollToBottom(isGenerating ? 'auto' : 'smooth');
    }
  }, [messages, isGenerating]);

  // Initial scroll when switching conversations
  useEffect(() => {
    isAutoScrollActiveRef.current = true;
    scrollToBottom('auto');
  }, [messages.length > 0 ? messages[0]?.id : null]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <EmptyState onSelectSuggestion={onSelectSuggestion} />
      </div>
    );
  }

  const lastMessage = messages[messages.length - 1];
  const isStreamingLast = isGenerating && lastMessage?.role === 'assistant';

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Scrollable Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-2"
      >
        <div className="max-w-4xl mx-auto space-y-4 pb-28">
          {messages.map((message, index) => {
            const isThisStreaming = isStreamingLast && index === messages.length - 1;
            return (
              <MessageBubble
                key={message.id || index}
                message={message}
                isStreaming={isThisStreaming}
                onRegenerate={onRegenerate}
                onEditSave={onEditSave}
                onSpeak={onSpeak}
                isSpeakingThis={speakingMessageId === message.id}
              />
            );
          })}

          {/* Dynamic rotating AI Processing Status indicator */}
          {isGenerating &&
            (lastMessage?.role === 'user' ||
              (lastMessage?.role === 'assistant' && !lastMessage?.content?.trim())) && (
              <AIProcessingStatus />
            )}

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-rose-950/20">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span className="font-medium text-rose-200">{error}</span>
              </div>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-medium text-xs border border-rose-500/30 active:scale-95 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try again</span>
                </button>
              )}
            </div>
          )}

          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={() => {
            isAutoScrollActiveRef.current = true;
            scrollToBottom('smooth');
          }}
          aria-label="Scroll to latest messages"
          className="absolute bottom-6 right-6 p-2.5 rounded-full glass-card border border-white/20 shadow-xl shadow-black/20 text-slate-300 hover:text-white hover:border-indigo-500/50 active:scale-90 transition-all z-10"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
