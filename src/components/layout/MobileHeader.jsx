import React from 'react';
import { Menu, Plus, Settings } from 'lucide-react';

/**
 * Mobile top navigation bar displayed on screens below 768px.
 */
export function MobileHeader({
  activeTitle = 'New Chat',
  onOpenSidebar,
  onNewChat,
  onOpenSettings,
}) {
  return (
    <header className="md:hidden flex items-center justify-between px-3 py-2.5 glass-panel border-b border-slate-200/80 dark:border-white/[0.08] select-none z-20">
      {/* Menu Drawer Toggle */}
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Open conversation menu"
        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/10 active:scale-95 transition-all"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Title */}
      <div className="flex-1 text-center px-2">
        <h1 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] mx-auto">
          {activeTitle || 'New Conversation'}
        </h1>
      </div>

      {/* Right Quick Actions */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onNewChat}
          aria-label="Start new conversation"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/10 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Settings"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/10 active:scale-95 transition-all"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
