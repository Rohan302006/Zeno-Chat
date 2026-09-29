import React, { useState } from 'react';
import {
  PanelLeftOpen,
  Sparkles,
  Download,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
} from 'lucide-react';
import { MessageList } from './MessageList';
import { ChatComposer } from '../composer/ChatComposer';

/**
 * ChatWindow manages the conversation header, message timeline, and bottom composer.
 */
export function ChatWindow({
  conversation,
  messages = [],
  isGenerating = false,
  error = null,
  isSidebarOpen,
  onToggleSidebar,
  onSendMessage,
  onStopGeneration,
  onRetry,
  onRegenerate,
  onEditSave,
  onSelectSuggestion,
  onRenameTitle,
  onDeleteConversation,
  onExportConversation,
  onOpenSearch,
  onOpenSettings,
  onSpeak,
  speakingMessageId,
  enterToSend = true,
  activeModel = 'gemini-flash-lite-latest',
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(conversation?.title || 'New Conversation');

  const handleStartTitleEdit = () => {
    setTitleInput(conversation?.title || 'New Conversation');
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    if (titleInput.trim() && conversation?.id) {
      onRenameTitle(conversation.id, titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setTitleInput(conversation?.title || 'New Conversation');
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveTitle();
    else if (e.key === 'Escape') handleCancelTitle();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Desktop Chat Header */}
      <header className="hidden md:flex items-center justify-between px-6 py-3.5 glass-panel border-b border-slate-200/80 dark:border-white/[0.08] select-none z-10">
        <div className="flex items-center gap-3 min-w-0">
          {/* Toggle sidebar button when collapsed */}
          {!isSidebarOpen && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}

          {/* Active Conversation Title & Inline Rename */}
          {isEditingTitle ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border border-indigo-500/50 focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="p-1 rounded-md text-emerald-500 hover:bg-emerald-500/10"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleCancelTitle}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-500/10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={handleStartTitleEdit}>
              <h2 className="text-sm font-semibold text-theme-main truncate max-w-sm">
                {conversation?.title || 'New Conversation'}
              </h2>
              <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Model Status Badge (Clickable to switch model / speed) */}
          <button
            type="button"
            onClick={onOpenSettings}
            title="Click to toggle AI model & speed in Settings"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>
              {activeModel === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : '⚡ Flash Lite (Ultra-Fast)'}
            </span>
          </button>

          {/* Search Trigger */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
            title="Search chats (Ctrl + K)"
            aria-label="Search chats"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Export conversation */}
          {conversation && (
            <button
              type="button"
              onClick={() => onExportConversation(conversation.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
              title="Export conversation"
              aria-label="Export conversation"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Delete conversation */}
          {conversation && (
            <button
              type="button"
              onClick={() => onDeleteConversation(conversation.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Delete conversation"
              aria-label="Delete conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Message List Area */}
      <MessageList
        messages={messages}
        isGenerating={isGenerating}
        error={error}
        onRetry={onRetry}
        onRegenerate={onRegenerate}
        onEditSave={onEditSave}
        onSelectSuggestion={onSendMessage}
        onSpeak={onSpeak}
        speakingMessageId={speakingMessageId}
      />

      {/* Bottom Floating Composer */}
      <div className="w-full absolute bottom-0 left-0 right-0 pointer-events-none">
        <div className="w-full bg-gradient-to-t from-background via-background/90 to-transparent pt-8 pb-1 pointer-events-auto">
          <ChatComposer
            onSendMessage={onSendMessage}
            onStopGeneration={onStopGeneration}
            isGenerating={isGenerating}
            enterToSend={enterToSend}
          />
        </div>
      </div>
    </div>
  );
}
