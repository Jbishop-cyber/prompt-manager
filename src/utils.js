/* ============================================
   AI Prompt Manager — Shared Utilities
   ============================================ */

/**
 * Escape HTML special characters to prevent XSS.
 */
export function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Format a timestamp into a human-readable "time ago" string.
 */
export function timeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

/**
 * Strip markdown formatting for clean preview text.
 * Removes: **bold**, *italic*, # headings, - lists, ``` code blocks, links, etc.
 */
export function stripMarkdown(str) {
    return str
        .replace(/```[\s\S]*?```/g, '')           // code blocks
        .replace(/`([^`]+)`/g, '$1')              // inline code
        .replace(/#{1,6}\s+/g, '')                // headings
        .replace(/\*\*([^*]+)\*\*/g, '$1')        // bold
        .replace(/\*([^*]+)\*/g, '$1')            // italic
        .replace(/__([^_]+)__/g, '$1')            // bold alt
        .replace(/_([^_]+)_/g, '$1')              // italic alt
        .replace(/~~([^~]+)~~/g, '$1')            // strikethrough
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // links
        .replace(/^\s*[-*+]\s+/gm, '')            // unordered lists
        .replace(/^\s*\d+\.\s+/gm, '')            // ordered lists
        .replace(/^\s*>\s+/gm, '')                // blockquotes
        .replace(/\n{2,}/g, ' ')                  // collapse multiple newlines
        .replace(/\n/g, ' ')                      // remaining newlines to spaces
        .replace(/\s{2,}/g, ' ')                  // collapse whitespace
        .trim();
}
