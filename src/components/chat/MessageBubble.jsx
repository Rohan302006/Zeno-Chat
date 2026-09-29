import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, User, Check, X } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { MessageActions } from './MessageActions';
import { formatTime } from '../../utils/formatters';

/**
 * MessageBubble renders an individual chat message with Markdown styling,
 * code syntax highlighting, hover actions, and inline editing for user messages.
 */
export function MessageBubble({
  message,
  isStreaming = false,
  onRegenerate,
  onEditSave,
  onSpeak,
  isSpeakingThis,
}) {
  const isAssistant = message.role === 'assistant';
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleStartEdit = () => {
    setEditContent(message.content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent.trim() !== message.content) {
      onEditSave(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div
      className={`group relative flex w-full gap-3 sm:gap-4 py-3 sm:py-4 px-2 sm:px-4 rounded-2xl transition-colors duration-150 ${
        isAssistant ? 'hover:bg-slate-500/[0.03]' : 'justify-end'
      }`}
    >
      {/* Assistant Avatar */}
      {isAssistant && (
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1px] shadow-sm shadow-indigo-500/20">
            <div className="w-full h-full rounded-[11px] bg-slate-900 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-300" />
            </div>
          </div>
        </div>
      )}

      {/* Message Body Container */}
      <div className={`flex flex-col max-w-[88%] sm:max-w-[80%] ${!isAssistant ? 'items-end' : 'w-full'}`}>
        {/* Header / Role Info */}
        <div className="flex items-center gap-2 mb-1 px-1 text-xs text-slate-400">
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {isAssistant ? 'Zeno' : 'You'}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {formatTime(message.createdAt)}
          </span>
        </div>

        {/* Content Display or Edit Mode */}
        {isEditing ? (
          <div className="w-full flex flex-col gap-2 mt-1">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              className="w-full p-3 rounded-xl text-sm bg-slate-100 dark:bg-white/[0.07] border border-indigo-500/40 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save & Resend</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`text-[14.5px] leading-relaxed break-words ${
              isAssistant
                ? 'text-theme-main'
                : 'bg-indigo-600 text-white font-normal px-4 py-3 rounded-2xl rounded-tr-sm shadow-md shadow-indigo-600/20'
            }`}
          >
            {isAssistant ? (
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 space-y-3">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeText = String(children).replace(/\n$/, '');

                      if (!inline && (match || codeText.includes('\n'))) {
                        return (
                          <CodeBlock
                            language={match ? match[1] : ''}
                            code={codeText}
                          />
                        );
                      }

                      return (
                        <code
                          className="px-1.5 py-0.5 rounded-md bg-slate-200/60 dark:bg-white/10 text-indigo-600 dark:text-indigo-300 font-mono text-[13px]"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    table({ children }) {
                      return (
                        <div className="overflow-x-auto my-3 rounded-xl border border-slate-200 dark:border-white/10">
                          <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10 text-xs sm:text-sm text-left">
                            {children}
                          </table>
                        </div>
                      );
                    },
                    thead({ children }) {
                      return (
                        <thead className="bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 font-semibold">
                          {children}
                        </thead>
                      );
                    },
                    th({ children }) {
                      return <th className="px-3 py-2 font-medium">{children}</th>;
                    },
                    td({ children }) {
                      return <td className="px-3 py-2 border-t border-slate-200/60 dark:border-white/5">{children}</td>;
                    },
                    a({ href, children }) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-500 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-600 dark:hover:text-indigo-300"
                        >
                          {children}
                        </a>
                      );
                    },
                    p({ children }) {
                      return <p className="mb-2 last:mb-0">{children}</p>;
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>

                {/* Streaming blinking cursor */}
                {isStreaming && (
                  <span className="inline-block w-2 h-4 ml-1 align-middle bg-indigo-500 animate-pulse rounded-sm" />
                )}
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}
          </div>
        )}

        {/* Hover Action Bar */}
        {!isEditing && (
          <MessageActions
            message={message}
            onRegenerate={onRegenerate}
            onEdit={!isAssistant ? handleStartEdit : undefined}
            onSpeak={isAssistant ? onSpeak : undefined}
            isSpeakingThis={isSpeakingThis}
          />
        )}
      </div>

      {/* User Avatar */}
      {!isAssistant && (
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <User className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
}
