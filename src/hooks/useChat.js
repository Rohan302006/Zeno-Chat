import { useState, useRef, useCallback } from 'react';
import { chatService } from '../services/chatService';

/**
 * Hook to manage chat messaging, streaming, stop generation,
 * regeneration, editing user messages, and retry.
 */
export function useChat({
  activeConversation,
  createNewConversation,
  updateConversationMessages,
  settings,
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const messages = activeConversation?.messages || [];

  /**
   * Helper to execute streaming given a conversation ID and a message list to send
   */
  const executeStream = useCallback(
    async (targetConvId, historyMessages) => {
      const assistantMessageId = 'msg_asst_' + Date.now();

      // Create placeholder assistant message
      const placeholderMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
      };

      // Append assistant placeholder
      updateConversationMessages(targetConvId, (prev) => [...prev, placeholderMessage]);

      setIsGenerating(true);
      setError(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      await chatService.streamChat({
        messages: historyMessages,
        model: settings?.model || 'gemini-flash-lite-latest',
        systemInstruction: settings?.systemInstruction,
        customApiKey: settings?.customApiKey,
        signal: controller.signal,
        onChunk: (accumulated) => {
          updateConversationMessages(targetConvId, (prev) =>
            prev.map((m) => (m.id === assistantMessageId ? { ...m, content: accumulated } : m))
          );
        },
        onDone: (finalText) => {
          setIsGenerating(false);
          abortControllerRef.current = null;
          updateConversationMessages(targetConvId, (prev) =>
            prev.map((m) => (m.id === assistantMessageId ? { ...m, content: finalText } : m))
          );
        },
        onError: (err) => {
          setIsGenerating(false);
          abortControllerRef.current = null;
          setError(err);
          // If assistant message was empty, remove it so user can retry cleanly
          updateConversationMessages(targetConvId, (prev) =>
            prev.filter((m) => !(m.id === assistantMessageId && !m.content.trim()))
          );
        },
      });
    },
    [settings, updateConversationMessages]
  );

  /**
   * Send a new message from the user
   */
  const sendMessage = useCallback(
    async (text) => {
      if (!text || !text.trim() || isGenerating) return;

      const trimmedText = text.trim();
      let targetConvId = activeConversation?.id;

      // If no conversation currently active, create one first
      if (!targetConvId) {
        const newConv = createNewConversation();
        targetConvId = newConv.id;
      }

      const userMessage = {
        id: 'msg_user_' + Date.now(),
        role: 'user',
        content: trimmedText,
        createdAt: Date.now(),
      };

      const currentMessages = activeConversation?.id === targetConvId ? messages : [];
      const updatedMessages = [...currentMessages, userMessage];

      // Update messages in conversation state
      updateConversationMessages(targetConvId, updatedMessages);

      // Execute stream with the updated history
      await executeStream(targetConvId, updatedMessages);
    },
    [activeConversation, messages, isGenerating, createNewConversation, updateConversationMessages, executeStream]
  );

  /**
   * Stop ongoing generation
   */
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
    }
  }, []);

  /**
   * Regenerate assistant response
   */
  const regenerateResponse = useCallback(
    async (messageId) => {
      if (isGenerating || !activeConversation?.id) return;

      const targetIndex = messages.findIndex((m) => m.id === messageId);
      if (targetIndex === -1) return;

      // Slice messages up to the user message that prompted this response
      // If target is assistant, slice before it; if target is user, slice through it
      let historyToSend = [];
      let newMessagesList = [];

      if (messages[targetIndex].role === 'assistant') {
        historyToSend = messages.slice(0, targetIndex);
        newMessagesList = messages.slice(0, targetIndex);
      } else {
        historyToSend = messages.slice(0, targetIndex + 1);
        newMessagesList = messages.slice(0, targetIndex + 1);
      }

      if (historyToSend.length === 0) return;

      updateConversationMessages(activeConversation.id, newMessagesList);
      await executeStream(activeConversation.id, historyToSend);
    },
    [isGenerating, activeConversation, messages, updateConversationMessages, executeStream]
  );

  /**
   * Edit a user message and re-generate from that point
   */
  const editUserMessage = useCallback(
    async (messageId, newContent) => {
      if (isGenerating || !activeConversation?.id || !newContent.trim()) return;

      const targetIndex = messages.findIndex((m) => m.id === messageId);
      if (targetIndex === -1 || messages[targetIndex].role !== 'user') return;

      const editedUserMsg = {
        ...messages[targetIndex],
        content: newContent.trim(),
        updatedAt: Date.now(),
      };

      const updatedHistory = [...messages.slice(0, targetIndex), editedUserMsg];
      updateConversationMessages(activeConversation.id, updatedHistory);

      await executeStream(activeConversation.id, updatedHistory);
    },
    [isGenerating, activeConversation, messages, updateConversationMessages, executeStream]
  );

  /**
   * Retry the last failed request
   */
  const retryLast = useCallback(async () => {
    if (isGenerating || !activeConversation?.id || messages.length === 0) return;

    // Find the last user message
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    const historyToSend = messages.slice(0, lastUserIndex + 1);
    updateConversationMessages(activeConversation.id, historyToSend);
    await executeStream(activeConversation.id, historyToSend);
  }, [isGenerating, activeConversation, messages, updateConversationMessages, executeStream]);

  return {
    messages,
    isGenerating,
    error,
    clearError: () => setError(null),
    sendMessage,
    stopGeneration,
    regenerateResponse,
    editUserMessage,
    retryLast,
  };
}
