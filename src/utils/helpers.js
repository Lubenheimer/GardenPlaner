/**
 * Utility helpers
 */

/**
 * Escaped Nutzer-Text für sichere Interpolation in Template-Literal-HTML.
 * Ohne dies bricht z.B. ein `"` in einem Beetnamen das umgebende
 * value="..."-Attribut, oder `<` verunstaltet das Layout.
 */
export function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
 * Berechnet die Fläche eines Beets in cm² — formabhängig, da width×height
 * für Kreise (+27%) und L-Formen (+25%, Aussparung würde mitgezählt) falsch ist.
 */
export function bedAreaCm2(bed) {
  const w = bed.width || 0;
  const h = bed.height || 0;

  if (bed.type === 'circle') {
    return Math.PI * (w / 2) * (h / 2);
  }
  if (bed.type === 'lshaped') {
    // L-Form spart das obere rechte Viertel aus (siehe CanvasRenderer._buildBedPath)
    return w * h * 0.75;
  }
  if (bed.type === 'polygon' && bed.points?.length >= 3) {
    // Shoelace-Formel — Translation um bed.x/y ändert die Fläche nicht
    let sum = 0;
    const pts = bed.points;
    for (let i = 0; i < pts.length; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      sum += p1.x * p2.y - p2.x * p1.y;
    }
    return Math.abs(sum) / 2;
  }
  if (bed.type === 'line') {
    return 0; // Zäune/Linien/offene Pfade haben keine Fläche
  }
  return w * h;
}

/** Gleiche Berechnung wie bedAreaCm2, aber in m² (Canvas-Einheiten sind cm). */
export function bedAreaM2(bed) {
  return bedAreaCm2(bed) / 10000;
}

/**
 * Compress image data URL to reduce storage size
 */
export function compressImage(dataUrl, maxWidth = 800) {
  return new Promise((resolve, reject) => {
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
    // Ohne diesen Handler blieb das Promise bei einer defekten Bilddatei für
    // immer offen — der Foto-Upload hing still, ohne Fehler oder Timeout.
    img.onerror = () => reject(new Error('Bild konnte nicht geladen werden'));
    img.src = dataUrl;
  });
}
