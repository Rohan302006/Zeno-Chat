/**
 * Service for communicating with the serverless /api/chat endpoint.
 * Handles streaming responses, SSE parsing, and abort signals.
 */

export const chatService = {
  /**
   * Sends messages to the serverless /api/chat endpoint and streams the response.
   *
   * @param {Object} options
   * @param {Array} options.messages - Array of { role: 'user'|'assistant', content: string }
   * @param {string} [options.model] - Model identifier (default: 'gemini-2.5-flash')
   * @param {string} [options.systemInstruction] - Optional system instruction
   * @param {string} [options.customApiKey] - Optional API key override
   * @param {AbortSignal} [options.signal] - AbortSignal to cancel generation
   * @param {Function} options.onChunk - Callback invoked with (fullAccumulatedText, delta)
   * @param {Function} options.onDone - Callback invoked with (finalFullText)
   * @param {Function} options.onError - Callback invoked with (errorString)
   */
  async streamChat({
    messages,
    model = 'gemini-2.5-flash',
    systemInstruction,
    customApiKey,
    signal,
    onChunk,
    onDone,
    onError,
  }) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (customApiKey && customApiKey.trim()) {
        headers['x-gemini-key'] = customApiKey.trim();
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages,
          model,
          systemInstruction,
        }),
        signal,
      });

      if (!response.ok) {
        let errorMsg = 'Failed to generate response.';
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errorMsg = errData.error;
          }
        } catch {
          errorMsg = `Server error (${response.status}: ${response.statusText})`;
        }
        if (onError) onError(errorMsg);
        return;
      }

      // Check if body is streamable
      if (!response.body) {
        if (onError) onError('Streaming is not supported by the response body.');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        // Keep the last partial segment in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const dataStr = trimmed.slice(5).trim();
          if (dataStr === '[DONE]') {
            if (onDone) onDone(accumulatedText);
            return;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              if (onError) onError(parsed.error);
              return;
            }
            if (parsed.text) {
              accumulatedText += parsed.text;
              if (onChunk) onChunk(accumulatedText, parsed.text);
            }
          } catch (e) {
            console.warn('Failed to parse SSE chunk:', dataStr, e);
          }
        }
      }

      // Final flush
      if (onDone) onDone(accumulatedText);
    } catch (err) {
      if (err.name === 'AbortError') {
        // Request was aborted by the user
        return;
      }
      console.error('Chat stream error:', err);
      if (onError) {
        onError(err.message || 'Network error encountered during communication.');
      }
    }
  },
};
