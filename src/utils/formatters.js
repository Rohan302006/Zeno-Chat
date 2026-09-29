/**
 * Formats a timestamp into a relative or friendly date string.
 */
export function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Categorizes a timestamp into conversation time buckets:
 * 'Today', 'Yesterday', 'Previous 7 Days', or 'Older'
 */
export function getConversationGroup(timestamp) {
  if (!timestamp) return 'Older';
  const date = new Date(timestamp);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  if (date >= startOfToday) {
    return 'Today';
  } else if (date >= startOfYesterday) {
    return 'Yesterday';
  } else if (date >= startOfWeek) {
    return 'Previous 7 Days';
  } else {
    return 'Older';
  }
}

/**
 * Generates a clean, concise conversation title from the first user message.
 * Does not make an API call, adheres to Phase 1 specs.
 */
export function generateTitleFromMessage(messageText) {
  if (!messageText) return 'New Conversation';
  
  // Clean up any leading markdown hashes, asterisks or whitespace
  let clean = messageText.replace(/^[#*`\-_\s]+/, '').trim();
  
  // Take first sentence or first line
  clean = clean.split('\n')[0].trim();
  
  // Truncate to reasonable length without cutting words in half if possible
  const maxLength = 38;
  if (clean.length > maxLength) {
    const truncated = clean.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    clean = (lastSpace > 20 ? truncated.substring(0, lastSpace) : truncated) + '...';
  }

  // Capitalize first letter
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  return clean || 'New Conversation';
}
