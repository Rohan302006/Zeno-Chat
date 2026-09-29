import { useState, useEffect, useCallback, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { conversationToMarkdown, downloadFile } from '../utils/chatHelpers';
import { generateTitleFromMessage } from '../utils/formatters';

/**
 * Hook to manage conversations list, active conversation selection,
 * creating new conversations, renaming, deleting, and exporting.
 */
export function useConversations() {
  const [conversations, setConversations] = useState(() => storageService.getConversations());
  const [activeId, setActiveId] = useState(() => {
    const savedActiveId = storageService.getActiveConversationId();
    const list = storageService.getConversations();
    if (savedActiveId && list.some((c) => c.id === savedActiveId)) {
      return savedActiveId;
    }
    return list[0]?.id || null;
  });

  // Keep activeId in sync with localStorage
  useEffect(() => {
    storageService.setActiveConversationId(activeId);
  }, [activeId]);

  // Current active conversation object
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeId) || null;
  }, [conversations, activeId]);

  /**
   * Creates a new empty conversation and sets it active.
   */
  const createNewConversation = useCallback((title = 'New Conversation') => {
    const newConv = {
      id: 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };

    setConversations((prev) => {
      const updated = [newConv, ...prev];
      storageService.saveConversations(updated);
      return updated;
    });

    setActiveId(newConv.id);
    return newConv;
  }, []);

  /**
   * Selects an active conversation.
   */
  const selectConversation = useCallback((id) => {
    setActiveId(id);
  }, []);

  /**
   * Renames a conversation.
   */
  const renameConversation = useCallback((id, newTitle) => {
    if (!newTitle || !newTitle.trim()) return;

    setConversations((prev) => {
      const updated = prev.map((conv) => {
        if (conv.id === id) {
          return {
            ...conv,
            title: newTitle.trim(),
            updatedAt: Date.now(),
          };
        }
        return conv;
      });
      storageService.saveConversations(updated);
      return updated;
    });
  }, []);

  /**
   * Deletes a conversation by ID.
   */
  const deleteConversation = useCallback((id) => {
    setConversations((prev) => {
      const updated = prev.filter((conv) => conv.id !== id);
      storageService.saveConversations(updated);

      // If active conversation was deleted, pick the first one or null
      setActiveId((currentActive) => {
        if (currentActive === id) {
          return updated[0]?.id || null;
        }
        return currentActive;
      });

      return updated;
    });
  }, []);

  /**
   * Clears all conversations.
   */
  const clearAllConversations = useCallback(() => {
    storageService.clearAllConversations();
    setConversations([]);
    setActiveId(null);
  }, []);

  /**
   * Updates messages inside a specific conversation.
   */
  const updateConversationMessages = useCallback(
    (convId, messagesUpdater) => {
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === convId);
        if (index === -1) return prev;

        const target = prev[index];
        const updatedMessages =
          typeof messagesUpdater === 'function' ? messagesUpdater(target.messages || []) : messagesUpdater;

        // Auto-generate title if this is the first user message and title is still default
        let newTitle = target.title;
        if (
          (!target.title || target.title === 'New Conversation') &&
          updatedMessages.length > 0 &&
          updatedMessages[0].role === 'user'
        ) {
          newTitle = generateTitleFromMessage(updatedMessages[0].content);
        }

        const updatedConv = {
          ...target,
          title: newTitle,
          messages: updatedMessages,
          updatedAt: Date.now(),
        };

        const updatedList = [...prev];
        // Move updated conversation to the top
        updatedList.splice(index, 1);
        updatedList.unshift(updatedConv);

        storageService.saveConversations(updatedList);
        return updatedList;
      });
    },
    []
  );

  /**
   * Exports a conversation to Markdown or JSON.
   */
  const exportConversation = useCallback(
    (id, format = 'markdown') => {
      const conv = conversations.find((c) => c.id === id);
      if (!conv) return;

      const safeTitle = (conv.title || 'conversation')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      if (format === 'json') {
        const jsonStr = JSON.stringify(conv, null, 2);
        downloadFile(jsonStr, `${safeTitle}.json`, 'application/json');
      } else {
        const mdStr = conversationToMarkdown(conv);
        downloadFile(mdStr, `${safeTitle}.md`, 'text/markdown');
      }
    },
    [conversations]
  );

  /**
   * Exports all conversations as a single JSON backup.
   */
  const exportAllConversations = useCallback(() => {
    const jsonStr = JSON.stringify(conversations, null, 2);
    downloadFile(jsonStr, `zeno-chat-export-${Date.now()}.json`, 'application/json');
  }, [conversations]);

  return {
    conversations,
    activeId,
    activeConversation,
    createNewConversation,
    selectConversation,
    renameConversation,
    deleteConversation,
    clearAllConversations,
    updateConversationMessages,
    exportConversation,
    exportAllConversations,
  };
}
