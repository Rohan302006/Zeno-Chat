/**
 * LocalStorage persistence service for Zeno Chat.
 * Provides a clean, isolated abstraction layer for conversations and user preferences.
 */

const STORAGE_KEYS = {
  CONVERSATIONS: 'zeno_conversations_v1',
  ACTIVE_ID: 'zeno_active_conversation_id_v1',
  SETTINGS: 'zeno_settings_v1',
};

const DEFAULT_SETTINGS = {
  theme: 'dark', // 'dark' | 'light' | 'system'
  enterToSend: true,
  model: 'gemini-flash-lite-latest', // Ultra-fast model by default
  systemInstruction: 'You are Zeno, a precise, helpful, and modern AI assistant.',
  customApiKey: '',
  voiceRate: 1,
  voicePitch: 1,
  selectedVoiceURI: '',
};

export const storageService = {
  /**
   * Retrieves all saved conversations, sorted by most recently updated first.
   */
  getConversations() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to load conversations from localStorage:', e);
      return [];
    }
  },

  /**
   * Persists the entire list of conversations.
   */
  saveConversations(conversations) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save conversations to localStorage:', e);
    }
  },

  /**
   * Finds a specific conversation by ID.
   */
  getConversation(id) {
    const list = this.getConversations();
    return list.find((conv) => conv.id === id) || null;
  },

  /**
   * Saves or updates a single conversation.
   */
  saveConversation(conversation) {
    if (!conversation?.id) return;
    const list = this.getConversations();
    const index = list.findIndex((c) => c.id === conversation.id);

    const updated = {
      ...conversation,
      updatedAt: Date.now(),
    };

    if (index >= 0) {
      list[index] = updated;
    } else {
      list.unshift(updated);
    }

    this.saveConversations(list);
    return updated;
  },

  /**
   * Deletes a conversation by ID.
   */
  deleteConversation(id) {
    const list = this.getConversations();
    const filtered = list.filter((conv) => conv.id !== id);
    this.saveConversations(filtered);
    return filtered;
  },

  /**
   * Clears all saved conversations.
   */
  clearAllConversations() {
    try {
      localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
    } catch (e) {
      console.error('Failed to clear conversations:', e);
    }
  },

  /**
   * Active conversation ID tracking
   */
  getActiveConversationId() {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_ID) || null;
    } catch {
      return null;
    }
  },

  setActiveConversationId(id) {
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
      }
    } catch (e) {
      console.error('Failed to persist active conversation id:', e);
    }
  },

  /**
   * User Settings persistence
   */
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings) {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to save settings:', e);
      return DEFAULT_SETTINGS;
    }
  },
};
