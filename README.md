# Zeno — Intelligent AI Workspace

A modern, production-quality AI chat web application built with React, Vite, and Tailwind CSS. Featuring a refined glassmorphism aesthetic inspired by premium task dashboards, seamless streaming via Gemini, voice input & speech synthesis, and local conversation persistence.

---

## ✨ Features

- **AI Streaming Responses**: Real-time token streaming from Google Gemini via a lightweight, secure serverless `/api/chat` function.
- **Private API Key Architecture**: `GEMINI_API_KEY` remains strictly server-side. No client-side exposure.
- **Rich Markdown & Syntax Highlighting**: Full Markdown support (tables, lists, inline code) with language-detected syntax highlighting and instant "Copy Code" feedback.
- **Interactive Conversation Flow**:
  - Stop ongoing generation (`Esc` or Stop button)
  - Regenerate any AI response
  - Inline edit any previous user message with automatic re-streaming
  - Retry failed requests
  - Read aloud responses with visual soundwave animation
- **Voice Dictation (Speech-to-Text)**: Speak directly into the composer using the browser's Web Speech API with animated listening states and graceful fallbacks.
- **Local Conversation Persistence**:
  - Zero database setup required for Phase 1 (clean `storageService` abstraction over `localStorage`).
  - Automatic title generation from the first user prompt.
  - Chronological grouping: *Today*, *Yesterday*, *Previous 7 Days*, and *Older*.
  - Rename, delete, and export individual conversations.
- **Fast Search Palette**: Global instant search across conversation titles and message history triggered via `Ctrl + K` / `⌘K`.
- **Theme System**: Seamlessly switch between **Dark**, **Light**, and **System** themes with persistent preferences and glassmorphic translucent surfaces.
- **Settings & Preferences**:
  - Configure Enter to send vs. Shift+Enter.
  - Custom system persona & prompt instructions.
  - Speech rate, pitch, and voice synthesizer selection.
  - Full JSON backup export and data purge.
  - Optional custom API key override stored strictly in local browser storage.
- **Responsive Design**: Collapsible desktop sidebar, full-height mobile drawer sheet, auto-expanding composer, and touch-friendly controls.
- **Future-Proofed for Phase 2**: Clean attachment slot and architecture ready for image upload and image generation.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom glassmorphism design tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **Markdown & Code**: `react-markdown`, `remark-gfm`, `highlight.js`
- **AI Integration**: `@google/genai` (Google Gen AI SDK)
- **Deployment**: Compatible with Vercel / Netlify serverless functions (`api/chat.js`) & Vite dev server middleware.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v18+` or `v20+` (tested on Node v24)
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### 2. Environment Configuration
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Open `.env` and add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
*(Note: You can also optionally enter your key directly inside the in-app Settings dialog, which will save it strictly in your browser's local storage).*

### 3. Install Dependencies & Run Locally
```bash
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| **Enter** | Send message (when Enter to send is enabled) |
| **Shift + Enter** | Create a new line in composer |
| **Esc** | Stop AI response generation / Close dialogs |
| **Ctrl / ⌘ + K** | Open quick search command palette |
| **Ctrl / ⌘ + N** | Start a new conversation |

---

## 📁 Project Architecture

```
├── api/
│   └── chat.js                 # Serverless Gemini streaming handler
├── public/
├── src/
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatWindow.jsx       # Chat layout & header actions
│   │   │   ├── MessageList.jsx      # Auto-scroll timeline & indicators
│   │   │   ├── MessageBubble.jsx    # Markdown rendering & inline edit
│   │   │   ├── MessageActions.jsx   # Hover toolbar (copy, speak, regen)
│   │   │   ├── CodeBlock.jsx        # Syntax highlighter & copy
│   │   │   └── EmptyState.jsx       # Luminous welcome & suggestions
│   │   ├── composer/
│   │   │   ├── ChatComposer.jsx     # Auto-expanding composer
│   │   │   ├── SendButton.jsx       # Send / Stop toggle button
│   │   │   └── VoiceButton.jsx      # Speech recognition button
│   │   ├── sidebar/
│   │   │   ├── Sidebar.jsx          # Collapsible desktop & mobile drawer
│   │   │   ├── ConversationList.jsx # Chronologically grouped list
│   │   │   ├── ConversationItem.jsx # Inline rename & actions menu
│   │   │   └── SearchModal.jsx      # Command-palette search dialog
│   │   ├── settings/
│   │   │   └── SettingsDialog.jsx   # Preferences modal
│   │   └── layout/
│   │       ├── AppLayout.jsx        # Master layout & global shortcuts
│   │       └── MobileHeader.jsx     # Small-screen navigation
│   ├── hooks/
│   │   ├── useChat.js               # Message streaming & state lifecycle
│   │   ├── useConversations.js      # Conversation persistence & CRUD
│   │   ├── useLocalStorage.js       # Local storage sync hook
│   │   ├── useSpeechRecognition.js  # Voice input dictation hook
│   │   └── useSpeechSynthesis.js    # Voice reading output hook
│   ├── services/
│   │   ├── chatService.js           # Serverless SSE stream client
│   │   └── storageService.js        # Clean localStorage abstraction
│   ├── utils/
│   │   ├── chatHelpers.js           # Markdown / JSON exports & clipboard
│   │   └── formatters.js            # Timestamps, dates, auto-titles
│   ├── App.jsx
│   ├── index.css                    # Glassmorphism tokens & animations
│   └── main.jsx
├── .env.example
├── vite.config.js
└── package.json
```

---