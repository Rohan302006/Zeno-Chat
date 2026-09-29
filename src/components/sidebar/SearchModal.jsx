import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, MessageSquare, ArrowRight, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

/**
 * SearchModal provides a command-palette style search across conversation titles and message texts.
 */
export function SearchModal({
  isOpen,
  onClose,
  conversations = [],
  onSelectConversation,
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    return conversations
      .map((conv) => {
        const titleMatch = (conv.title || '').toLowerCase().includes(q);
        // Find first matching message
        const matchedMessage = (conv.messages || []).find((m) =>
          (m.content || '').toLowerCase().includes(q)
        );

        if (titleMatch || matchedMessage) {
          return {
            conversation: conv,
            titleMatch,
            snippet: matchedMessage ? matchedMessage.content.slice(0, 120) : null,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [conversations, query]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        results.length > 0 ? (prev - 1 + results.length) % results.length : 0
      );
    } else if (e.key === 'Enter' && results.length > 0 && results[selectedIndex]) {
      e.preventDefault();
      onSelectConversation(results[selectedIndex].conversation.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl glass-panel border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-white/10">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search conversations and messages..."
            className="flex-1 bg-transparent text-sm text-theme-main placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 font-mono">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="px-4 py-8 text-center text-xs text-slate-400">
              Type keywords to search across titles and chat history...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-slate-400">
              No conversations matched &quot;{query}&quot;
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const conv = item.conversation;
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-start justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-600/10 dark:bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300'
                      : 'hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 pr-2">
                    <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {conv.title || 'Untitled Conversation'}
                      </div>
                      {item.snippet && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          &quot;{item.snippet}...&quot;
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(conv.updatedAt || conv.createdAt)}
                        </span>
                        <span>•</span>
                        <span>{conv.messages?.length || 0} messages</span>
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 opacity-60 self-center" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
