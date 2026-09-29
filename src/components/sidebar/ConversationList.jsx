import React, { useMemo } from 'react';
import { ConversationItem } from './ConversationItem';
import { getConversationGroup } from '../../utils/formatters';

const GROUP_ORDER = ['Today', 'Yesterday', 'Previous 7 Days', 'Older'];

/**
 * ConversationList renders grouped conversation items chronologically.
 */
export function ConversationList({
  conversations = [],
  activeId,
  searchQuery = '',
  onSelect,
  onRename,
  onDelete,
  onExport,
}) {
  // Filter conversations if a search query is provided
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter((c) => {
      const matchTitle = (c.title || '').toLowerCase().includes(q);
      const matchMessages = (c.messages || []).some((m) =>
        (m.content || '').toLowerCase().includes(q)
      );
      return matchTitle || matchMessages;
    });
  }, [conversations, searchQuery]);

  // Group conversations chronologically
  const grouped = useMemo(() => {
    const map = {
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
      Older: [],
    };

    filteredConversations.forEach((conv) => {
      const group = getConversationGroup(conv.updatedAt || conv.createdAt);
      if (map[group]) {
        map[group].push(conv);
      } else {
        map.Older.push(conv);
      }
    });

    return map;
  }, [filteredConversations]);

  if (filteredConversations.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-xs text-slate-400 dark:text-slate-500">
        {searchQuery ? 'No matching conversations found' : 'No conversations yet'}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 space-y-4">
      {GROUP_ORDER.map((groupName) => {
        const items = grouped[groupName];
        if (!items || items.length === 0) return null;

        return (
          <div key={groupName} className="space-y-1">
            {/* Section Header */}
            <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400/80">
              {groupName}
            </div>

            {/* Items */}
            <div className="space-y-0.5">
              {items.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === activeId}
                  onSelect={onSelect}
                  onRename={onRename}
                  onDelete={onDelete}
                  onExport={onExport}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
