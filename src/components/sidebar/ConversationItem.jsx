import React, { useState } from 'react';
import { MessageSquare, MoreHorizontal, Edit2, Trash2, Download, Check, X } from 'lucide-react';

/**
 * ConversationItem represents a single conversation in the sidebar list.
 * Supports inline renaming, deletion, export, and active status styling.
 */
export function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onRename,
  onDelete,
  onExport,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const [showMenu, setShowMenu] = useState(false);

  const handleSaveRename = (e) => {
    e?.stopPropagation();
    if (editTitle.trim()) {
      onRename(conversation.id, editTitle.trim());
    }
    setIsEditing(false);
    setShowMenu(false);
  };

  const handleCancelRename = (e) => {
    e?.stopPropagation();
    setEditTitle(conversation.title);
    setIsEditing(false);
    setShowMenu(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveRename(e);
    } else if (e.key === 'Escape') {
      handleCancelRename(e);
    }
  };

  const messageCount = conversation.messages?.length || 0;

  return (
    <div
      onClick={() => !isEditing && onSelect(conversation.id)}
      onMouseLeave={() => setShowMenu(false)}
      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs sm:text-[13px] font-medium transition-all duration-150 ${
        isActive
          ? 'bg-indigo-600/10 dark:bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 shadow-sm'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-white/[0.05] border border-transparent'
      }`}
    >
      {/* Title or Inline Edit */}
      {isEditing ? (
        <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 px-2 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-indigo-500/50 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSaveRename}
            title="Save title"
            className="p-1 rounded-md text-emerald-500 hover:bg-emerald-500/10"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCancelRename}
            title="Cancel"
            className="p-1 rounded-md text-slate-400 hover:bg-slate-500/10"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <MessageSquare
              className={`w-3.5 h-3.5 flex-shrink-0 ${
                isActive ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-500'
              }`}
            />
            <span className="truncate">{conversation.title || 'Untitled Conversation'}</span>
          </div>

          {/* Action Trigger / Dropdown Menu */}
          <div className="relative flex items-center">
            {/* Message count badge when idle */}
            {!showMenu && (
              <span className="text-[10px] text-slate-400 group-hover:hidden px-1">
                {messageCount > 0 ? messageCount : ''}
              </span>
            )}

            {/* Context menu button on hover */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              title="Conversation options"
              aria-label="Conversation options"
              className={`p-1 rounded-lg transition-all ${
                showMenu
                  ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white'
                  : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10'
              }`}
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* Dropdown Menu Modal */}
            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-7 w-36 rounded-xl glass-panel p-1.5 shadow-xl border border-slate-200 dark:border-white/10 z-30 animate-in fade-in zoom-in-95 duration-100"
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  <Edit2 className="w-3 h-3 text-slate-400" />
                  <span>Rename</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onExport(conversation.id);
                  }}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  <Download className="w-3 h-3 text-slate-400" />
                  <span>Export</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(conversation.id);
                  }}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-rose-500" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
