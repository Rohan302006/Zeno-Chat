/**
 * Converts a conversation object into formatted Markdown.
 */
export function conversationToMarkdown(conversation) {
  if (!conversation) return '';

  const dateStr = conversation.createdAt ? new Date(conversation.createdAt).toLocaleString() : '';
  let md = `# ${conversation.title || 'Conversation'}\n\n`;
  md += `*Exported on: ${dateStr}*\n\n---\n\n`;

  (conversation.messages || []).forEach((msg) => {
    const roleName = msg.role === 'assistant' ? 'AI Assistant' : 'User';
    const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : '';
    md += `### ${roleName} ${timeStr ? `(${timeStr})` : ''}\n\n`;
    md += `${msg.content}\n\n---\n\n`;
  });

  return md;
}

/**
 * Triggers a browser download of a text or JSON file.
 */
export function downloadFile(content, filename, contentType = 'text/plain') {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copies text to the clipboard with modern API and legacy fallback.
 */
export async function copyToClipboard(text) {
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback
    }
  }

  // Fallback for older browsers or restricted contexts
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch {
    return false;
  }
}
