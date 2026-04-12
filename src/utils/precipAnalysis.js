/**
 * precipAnalysis.js
 * Analyzes hourly precipitation data from Open-Meteo
 * and determines watering status for plants.
 *
 * Cache key: gp_precip_cache (separate from weather cache)
 * TTL: 1 hour
 */

export const PRECIP_CACHE_KEY = 'gp_precip_cache';
export const PRECIP_CACHE_TTL = 60 * 60 * 1000; // 1h

/**
 * Precipitation thresholds (mm) per plant drought tolerance category.
 * waterDays ≥ 7 = drought tolerant (Rosmarin, Thymian, Lavendel…)
 * waterDays 4–6 = moderate
 * waterDays ≤ 3 = water-hungry (Tomate, Gurke, Salat…)
 */
export function getPrecipThreshold(waterDays) {
  if (!waterDays) return 5;
  if (waterDays >= 7) return 3;   // drought tolerant: 3mm sufficient
  if (waterDays >= 4) return 5;   // moderate: 5mm
  return 8;                       // water-hungry: 8mm (they need a thorough soak)
}

/**
 * Evaluate watering necessity given recent precipitation.
 * Returns a status object describing the precipitation situation.
 *
 * @param {number} precipMm  - mm of rainfall in relevant window
 * @param {number} waterDays - plant's watering interval
 * @returns {{ status, label, emoji, color, skipWatering, isHeavy }}
 */
export function evaluatePrecip(precipMm, waterDays) {
  const threshold = getPrecipThreshold(waterDays);

  if (precipMm === null || precipMm === undefined) {
    return { status: 'unknown', label: '', emoji: '', skipWatering: false };
  }

  if (precipMm < 2) {
    // Negligible — just dew/traces
    return {
      status: 'none',
      label: `Nur Spurenregen (${precipMm.toFixed(1)} mm)`,
      emoji: '🌫️',
      color: 'var(--color-text-muted)',
      skipWatering: false,
      isHeavy: false,
    };
  }

  if (precipMm < threshold) {
    // Light rain — may help but is borderline for this plant type
    return {
      status: 'light',
      label: `Leichter Regen (${precipMm.toFixed(1)} mm)`,
      emoji: '🌦️',
      color: 'var(--color-warning)',
      skipWatering: false,
      isHeavy: false,
      hint: 'Evtl. noch etwas gießen bei empfindlichen Pflanzen',
    };
  }

  if (precipMm < 15) {
    // Good rain — watering not needed
    return {
      status: 'sufficient',
      label: `Regen (${precipMm.toFixed(1)} mm) — kein Gießen nötig`,
      emoji: '🌧️',
      color: 'var(--color-accent)',
      skipWatering: true,
      isHeavy: false,
    };
  }

  // Heavy rain — skip watering AND warn about waterlogging
  return {
    status: 'heavy',
    label: `Starkregen (${precipMm.toFixed(1)} mm)`,
    emoji: '🌊',
    color: 'var(--color-danger)',
    skipWatering: true,
    isHeavy: true,
    hint: 'Staunässe prüfen — besonders bei Hochbeeten & Kübeln!',
  };
}

/**
 * Read the cached precipitation analysis from localStorage.
 * Returns null if no valid cache exists.
 */
export function getCachedPrecipAnalysis() {
  try {
    const cached = JSON.parse(localStorage.getItem(PRECIP_CACHE_KEY) || 'null');
    if (cached && (Date.now() - cached.ts) < PRECIP_CACHE_TTL) {
      return cached;
    }
  } catch { /* ignore */ }
  return null;
}

/**
 * Parse raw hourly precipitation from Open-Meteo API response
 * and store sums in localStorage cache.
 *
 * @param {Object} json - Raw Open-Meteo API JSON response
 * @param {string} city - Location name for cache invalidation
 */
export function savePrecipAnalysis(json, city) {
  try {
    const times = json.hourly?.time || [];
    const precips = json.hourly?.precipitation || [];
    const now = new Date();
    const nowMs = now.getTime();

    // Helper: parse ISO datetime offset-aware
    const parseHour = (t) => new Date(t).getTime();

    let last24h = 0;
    let tonight = 0;    // Tonight 18:00–06:00 local
    let next24h = 0;

    const todayMidnight = new Date(now);
    todayMidnight.setHours(0, 0, 0, 0);
    const tonightStart = new Date(now);
    tonightStart.setHours(18, 0, 0, 0);
    const tonightEnd = new Date(now);
    tonightEnd.setDate(tonightEnd.getDate() + 1);
    tonightEnd.setHours(6, 0, 0, 0);
    const next24End = new Date(nowMs + 24 * 60 * 60 * 1000);

    for (let i = 0; i < times.length; i++) {
      const t = parseHour(times[i]);
      const mm = precips[i] || 0;

      // Last 24 hours (past precipitation)
      if (t >= nowMs - 24 * 60 * 60 * 1000 && t < nowMs) {
        last24h += mm;
      }
      // Tonight window
      if (t >= tonightStart.getTime() && t <= tonightEnd.getTime()) {
        tonight += mm;
      }
      // Next 24h (future)
      if (t >= nowMs && t <= next24End.getTime()) {
        next24h += mm;
      }
    }

    // Round to 1 decimal
    last24h = Math.round(last24h * 10) / 10;
    tonight = Math.round(tonight * 10) / 10;
    next24h = Math.round(next24h * 10) / 10;

    const analysis = {
      ts: Date.now(),
      city,
      last24h,
      tonight,
      next24h,
    };

    localStorage.setItem(PRECIP_CACHE_KEY, JSON.stringify(analysis));
    return analysis;
  } catch (e) {
    console.warn('precipAnalysis: save failed', e);
    return null;
  }
}
