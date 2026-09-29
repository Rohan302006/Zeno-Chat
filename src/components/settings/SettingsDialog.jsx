import React, { useState, useEffect } from 'react';
import {
  X,
  Sun,
  Moon,
  Laptop,
  MessageSquare,
  Volume2,
  Database,
  Keyboard,
  Key,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';

const TABS = [
  { id: 'appearance', label: 'Appearance', icon: Sun },
  { id: 'chat', label: 'Chat & Model', icon: MessageSquare },
  { id: 'voice', label: 'Voice & Speech', icon: Volume2 },
  { id: 'data', label: 'Data & Export', icon: Database },
  { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
];

/**
 * SettingsDialog modal for configuring themes, chat options, speech properties,
 * custom API keys, and data export.
 */
export function SettingsDialog({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearAllChats,
  onExportAllChats,
  voices = [],
}) {
  const [activeTab, setActiveTab] = useState('appearance');
  const [localSettings, setLocalSettings] = useState(settings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl glass-panel border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-white/[0.08]">
          <h2 className="text-base font-semibold text-theme-main">
            Settings & Preferences
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-slate-200/60 dark:border-white/[0.06] overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-indigo-600/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'system', label: 'System', icon: Laptop },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = localSettings.theme === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleChange('theme', item.id)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-indigo-600/10 dark:bg-indigo-500/15 border-indigo-500/50 text-indigo-600 dark:text-indigo-300 shadow-sm'
                            : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                        }`}
                      >
                        <Icon className="w-5 h-5 mb-2" />
                        <span className="text-xs font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Chat & Model Tab */}
          {activeTab === 'chat' && (
            <div className="space-y-5">
              {/* Model Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  AI Model & Response Speed
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleChange('model', 'gemini-flash-lite-latest')}
                    className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all ${
                      (localSettings.model || 'gemini-flash-lite-latest') === 'gemini-flash-lite-latest'
                        ? 'bg-indigo-600/10 dark:bg-indigo-500/15 border-indigo-500/50 text-indigo-600 dark:text-indigo-300 shadow-sm'
                        : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-theme-main flex items-center gap-1.5">
                        <span>Flash Lite</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-500 font-mono">⚡ Ultra-Fast (~1s)</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Instant responses, minimal latency
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('model', 'gemini-3.8-flash')}
                    className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all ${
                      localSettings.model === 'gemini-3.8-flash'
                        ? 'bg-indigo-600/10 dark:bg-indigo-500/15 border-indigo-500/50 text-indigo-600 dark:text-indigo-300 shadow-sm'
                        : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-theme-main flex items-center gap-1.5">
                        <span>Gemini 3.8 Flash</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/10 text-indigo-400 font-mono">✦ Deep Flash</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Standard 3.8 architecture
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Enter to Send Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-white/10 glass-card">
                <div>
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    Send message on Enter
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    When enabled, pressing Enter sends the prompt. Use Shift + Enter for newline.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.enterToSend}
                  onChange={(e) => handleChange('enterToSend', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-white/20 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* System Instruction */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  System Persona & Instructions
                </label>
                <textarea
                  value={localSettings.systemInstruction}
                  onChange={(e) => handleChange('systemInstruction', e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl text-xs bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder="Define Zeno's personality, formatting style, or constraints..."
                />
              </div>

              {/* Custom API Key (Client override) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" />
                    <span>Custom Gemini API Key (Optional)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Stored in browser localStorage only</span>
                </div>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={localSettings.customApiKey || ''}
                    onChange={(e) => handleChange('customApiKey', e.target.value)}
                    placeholder="Leave empty to use server GEMINI_API_KEY"
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  By default, Zeno uses the private serverless `GEMINI_API_KEY` from your environment.
                </p>
              </div>
            </div>
          )}

          {/* Voice Tab */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Synthesizer Voice
                </label>
                <select
                  value={localSettings.selectedVoiceURI || ''}
                  onChange={(e) => handleChange('selectedVoiceURI', e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">Browser Default Voice</option>
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Speed Slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Speech Rate</span>
                  <span className="font-mono text-slate-400">{localSettings.voiceRate || 1}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={localSettings.voiceRate || 1}
                  onChange={(e) => handleChange('voiceRate', parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Pitch Slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Speech Pitch</span>
                  <span className="font-mono text-slate-400">{localSettings.voicePitch || 1}</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.2"
                  step="0.05"
                  value={localSettings.voicePitch || 1}
                  onChange={(e) => handleChange('voicePitch', parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 glass-card flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    Export All Conversations
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Download a full JSON backup of all your local chat history.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onExportAllChats}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/[0.04] flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-rose-500">Clear All Conversations</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Permanently delete all stored chats from browser storage.
                  </div>
                </div>
                {showClearConfirm ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(false)}
                      className="px-2.5 py-1 rounded-md text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClearAllChats();
                        setShowClearConfirm(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
                    >
                      Yes, Clear All
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Shortcuts Tab */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-3">
              {[
                { key: 'Enter', action: 'Send message' },
                { key: 'Shift + Enter', action: 'Create a new line in composer' },
                { key: 'Escape', action: 'Stop ongoing AI response generation' },
                { key: 'Ctrl / ⌘ + K', action: 'Open chat search palette' },
                { key: 'Ctrl / ⌘ + N', action: 'Start a new conversation' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-slate-200/50 dark:border-white/5 last:border-0"
                >
                  <span className="text-xs text-slate-700 dark:text-slate-300">{item.action}</span>
                  <kbd className="px-2 py-1 rounded-md bg-slate-200/70 dark:bg-white/10 text-[11px] font-mono text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
