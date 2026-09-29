import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Strips markdown symbols, code fences, and links for pleasant speech synthesis.
 */
function stripMarkdownForSpeech(text) {
  if (!text) return '';
  return text
    .replace(/```[\s\S]*?```/g, 'Code snippet omitted for speech.') // Replace code blocks
    .replace(/`([^`]+)`/g, '$1') // Inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links [text](url)
    .replace(/[#*_~>]/g, '') // Formatting symbols
    .replace(/\n+/g, ' ') // Collapse newlines
    .trim();
}

/**
 * Hook for browser SpeechSynthesis (Voice Output / Read Aloud).
 */
export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [voices, setVoices] = useState([]);
  const utteranceRef = useRef(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const loadVoices = useCallback(() => {
    if (!isSupported) return;
    const available = window.speechSynthesis.getVoices();
    setVoices(available);
  }, [isSupported]);

  useEffect(() => {
    if (!isSupported) return;

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported, loadVoices]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  }, [isSupported]);

  const speak = useCallback(
    (text, messageId, options = {}) => {
      if (!isSupported || !text) return;

      // If already speaking this message, toggle stop
      if (isSpeaking && speakingMessageId === messageId) {
        stop();
        return;
      }

      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      const cleanedText = stripMarkdownForSpeech(text);
      if (!cleanedText) return;

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utteranceRef.current = utterance;

      if (options.rate) utterance.rate = options.rate;
      if (options.pitch) utterance.pitch = options.pitch;

      if (options.voiceURI && voices.length > 0) {
        const found = voices.find((v) => v.voiceURI === options.voiceURI);
        if (found) utterance.voice = found;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeakingMessageId(messageId || 'global');
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, isSpeaking, speakingMessageId, voices, stop]
  );

  return {
    isSupported,
    isSpeaking,
    speakingMessageId,
    voices,
    speak,
    stop,
  };
}
