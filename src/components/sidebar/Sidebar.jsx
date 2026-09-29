import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Settings,
  Sun,
  Moon,
  Laptop,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Trash2,
} from 'lucide-react';
import { ConversationList } from './ConversationList';

/**
 * Sidebar component supporting collapsible desktop mode and responsive mobile drawer.
 */
export function Sidebar({
  isOpen,
  isMobileOpen,
  onToggleDesktop,
  onCloseMobile,
  conversations = [],
  activeId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onExportConversation,
  onOpenSearch,
  onOpenSettings,
  theme,
  onCycleTheme,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Laptop;

  // Content shared between desktop and mobile drawer
  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-[1px] shadow-sm shadow-indigo-500/30">
            <div className="w-full h-full rounded-[11px] bg-slate-900 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-theme-main">
                Zeno
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 font-medium">
                3.8
              </span>
            </div>
          </div>
        </div>

        {/* Mobile close button or Desktop collapse button */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onToggleDesktop}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Actions: New Chat & Search */}
      <div className="p-3 space-y-2">
        {/* New Chat Button */}
        <button
          type="button"
          onClick={() => {
            onNewChat();
            if (onCloseMobile) onCloseMobile();
          }}
          className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white shadow-sm shadow-indigo-600/20 text-xs font-semibold tracking-wide transition-all"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </div>
          <span className="hidden sm:inline-block text-[10px] bg-indigo-700/60 px-1.5 py-0.5 rounded text-indigo-200 font-mono">
            Ctrl N
          </span>
        </button>

        {/* Quick Search Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/10 transition-all"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search chats...</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-white/10 text-slate-400 font-mono">
            ⌘K
          </span>
        </button>
      </div>

      {/* Chronological Conversations List */}
      <ConversationList
        conversations={conversations}
        activeId={activeId}
        searchQuery={searchQuery}
        onSelect={(id) => {
          onSelectConversation(id);
          if (onCloseMobile) onCloseMobile();
        }}
        onRename={onRenameConversation}
        onDelete={onDeleteConversation}
        onExport={onExportConversation}
      />

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between gap-1">
        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>

        {/* Theme Switcher Button */}
        <button
          type="button"
          onClick={onCycleTheme}
          title={`Current theme: ${theme}. Click to switch.`}
          aria-label="Switch color theme"
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 active:scale-95 transition-all"
        >
          <ThemeIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 glass-panel border-r border-slate-200 dark:border-white/10 md:hidden transition-transform duration-300 ease-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar Container */}
      <aside
        className={`hidden md:block flex-shrink-0 glass-panel border-r border-slate-200/80 dark:border-white/[0.08] transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'w-64 lg:w-72' : 'w-0 border-r-0'
        }`}
      >
        <div className="w-64 lg:w-72 h-full">{sidebarContent}</div>
      </aside>
    </>
  );
}
