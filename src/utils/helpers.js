/**
 * Utility helpers
 */

/**
 * Format a date string for display
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Format relative time
 */
export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Heute';
  if (diffDays === 1) return 'Gestern';
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  if (diffDays < 30) return `vor ${Math.floor(diffDays / 7)} Wochen`;
  return formatDate(dateStr);
}

/**
 * Generate a UUID-like string
 */
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Clamp value between min and max
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Deep clone an object
 */
export function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Status label mapping
 */
export const statusLabels = {
  planned: 'Geplant',
  planted: 'Gesetzt',
  growing: 'Wachsend',
  harvest: 'Ernte',
};

/**
 * Status emoji mapping
 */
export const statusEmojis = {
  planned: '📋',
  planted: '🌱',
  growing: '🌿',
  harvest: '🧺',
};

/**
 * Bed colors palette
 */
export const bedColors = [
  '#4ade80', '#22c55e', '#16a34a',
  '#a78bfa', '#8b5cf6', '#7c3aed',
  '#fb923c', '#f97316', '#ea580c',
  '#60a5fa', '#3b82f6', '#2563eb',
  '#f87171', '#ef4444', '#dc2626',
  '#fbbf24', '#f59e0b', '#d97706',
  '#a3e635', '#84cc16', '#65a30d',
  '#e879f9', '#d946ef', '#c026d3',
];

/**
 * Compress image data URL to reduce storage size
 */
export function compressImage(dataUrl, maxWidth = 800) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width;
      let h = img.height;
      if (w > maxWidth) {
        h = (maxWidth / w) * h;
        w = maxWidth;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = dataUrl;
  });
}
