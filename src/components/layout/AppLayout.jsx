import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { MobileHeader } from './MobileHeader';
import { ChatWindow } from '../chat/ChatWindow';
import { SearchModal } from '../sidebar/SearchModal';
import { SettingsDialog } from '../settings/SettingsDialog';
import { useConversations } from '../../hooks/useConversations';
import { useChat } from '../../hooks/useChat';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { storageService } from '../../services/storageService';

/**
 * AppLayout integrates the entire application layout, state hooks,
 * keyboard shortcut handlers, and theme management.
 */
export function AppLayout() {
  // Sidebar states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modal dialog states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings state persisted via storageService
  const [settings, setSettings] = useState(() => storageService.getSettings());

  // Conversations hook
  const {
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
  } = useConversations();

  // Chat hook
  const {
    messages,
    isGenerating,
    error,
    sendMessage,
    stopGeneration,
    regenerateResponse,
    editUserMessage,
    retryLast,
  } = useChat({
    activeConversation,
    createNewConversation,
    updateConversationMessages,
    settings,
  });

  // Speech synthesis hook
  const {
    isSpeaking,
    speakingMessageId,
    voices,
    speak,
    stop: stopSpeaking,
  } = useSpeechSynthesis();

  // Theme management effect
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = () => {
      let isDark = settings.theme === 'dark';
      if (settings.theme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [settings.theme]);

  // Cycle theme helper
  const cycleTheme = () => {
    const order = ['dark', 'light', 'system'];
    const nextTheme = order[(order.indexOf(settings.theme) + 1) % order.length];
    const updated = storageService.saveSettings({ theme: nextTheme });
    setSettings(updated);
  };

  const handleSaveSettings = (newSettings) => {
    const updated = storageService.saveSettings(newSettings);
    setSettings(updated);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd + K -> Search
      if (isCmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      // Ctrl/Cmd + N -> New Chat
      if (isCmdOrCtrl && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        createNewConversation();
        setIsMobileSidebarOpen(false);
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [createNewConversation]);

  // Read aloud handler with user preferences
  const handleSpeak = (text, messageId) => {
    speak(text, messageId, {
      rate: settings.voiceRate || 1,
      pitch: settings.voicePitch || 1,
      voiceURI: settings.selectedVoiceURI,
    });
  };

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Subtle Ambient Radial Gradients (Dribbble dashboard visual depth) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl opacity-60 dark:opacity-40" />
        <div className="absolute top-[40%] -right-[15%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-bl from-violet-500/10 via-pink-500/5 to-transparent blur-3xl opacity-50 dark:opacity-30" />
      </div>

      {/* Main App Container */}
      <div className="relative z-10 flex h-full w-full overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          isMobileOpen={isMobileSidebarOpen}
          onToggleDesktop={() => setIsSidebarOpen(!isSidebarOpen)}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          conversations={conversations}
          activeId={activeId}
          onSelectConversation={selectConversation}
          onNewChat={createNewConversation}
          onRenameConversation={renameConversation}
          onDeleteConversation={deleteConversation}
          onExportConversation={exportConversation}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          theme={settings.theme}
          onCycleTheme={cycleTheme}
        />

        {/* Content Pane */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          {/* Mobile Top Header */}
          <MobileHeader
            activeTitle={activeConversation?.title}
            onOpenSidebar={() => setIsMobileSidebarOpen(true)}
            onNewChat={createNewConversation}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          {/* Chat Window */}
          <ChatWindow
            conversation={activeConversation}
            messages={messages}
            isGenerating={isGenerating}
            error={error}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(true)}
            onSendMessage={sendMessage}
            onStopGeneration={stopGeneration}
            onRetry={retryLast}
            onRegenerate={regenerateResponse}
            onEditSave={editUserMessage}
            onSelectSuggestion={sendMessage}
            onRenameTitle={renameConversation}
            onDeleteConversation={deleteConversation}
            onExportConversation={exportConversation}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSpeak={handleSpeak}
            speakingMessageId={speakingMessageId}
            enterToSend={settings.enterToSend}
            activeModel={settings?.model || 'gemini-flash-lite-latest'}
          />
        </div>
      </div>

      {/* Command Palette Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        conversations={conversations}
        onSelectConversation={selectConversation}
      />

      {/* Settings Modal */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onClearAllChats={clearAllConversations}
        onExportAllChats={exportAllConversations}
        voices={voices}
      />
    </div>
  );
}
