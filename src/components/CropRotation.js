/**
 * CropRotation — Proactive crop rotation assistant
 * Analyzes plantings in each bed and recommends what to grow next season
 * based on nutrient demand cycle: Stark → Mittel → Schwach → Gründüngung → Stark
 */
import { store } from '../core/Store.js';
import { plants, getPlant } from '../data/plants.js';

const NUTRITION_ORDER = ['stark', 'mittel', 'schwach', 'gruen'];

const NUTRITION_LABELS = {
  stark:  { label: 'Starkzehrer',   emoji: '🔴', color: 'rgba(239, 68, 68, 0.15)', textColor: '#ef4444' },
  mittel: { label: 'Mittelzehrer',  emoji: '🟡', color: 'rgba(245, 158, 11, 0.15)', textColor: '#f59e0b' },
  schwach:{ label: 'Schwachzehrer', emoji: '🟢', color: 'rgba(74, 222, 128, 0.15)', textColor: '#4ade80' },
  gruen:  { label: 'Gründüngung',  emoji: '🌿', color: 'rgba(34, 197, 94, 0.15)',  textColor: '#22c55e' },
};

const GREEN_MANURE = [
  { name: 'Gelbsenf',   emoji: '🌾', note: 'Schnelle Bodenbedeckung, lockert den Boden' },
  { name: 'Phacelia',   emoji: '💜', note: 'Bienenweide, gute Durchwurzelung' },
  { name: 'Klee',       emoji: '🍀', note: 'Stickstoff-Fixierer, ideal vor Starkzehrern' },
  { name: 'Lupine',     emoji: '🌸', note: 'Tiefwurzler, fixiert Stickstoff' },
  { name: 'Winterroggen', emoji: '🌾', note: 'Winterbegrünung, unterdrückt Unkraut' },
];

/**
 * Determine what nutrition level was planted this season in a bed
 */
function analyzeBedNutrition(bedId) {
  const plantings = store.getPlantings(bedId);
  if (plantings.length === 0) return null;

  const nutritionLevels = plantings
    .map(p => {
      const plant = getPlant(p.name);
      return plant?.nutrition || null;
    })
    .filter(Boolean);

  if (nutritionLevels.length === 0) return null;

  // Dominant nutrition level (most frequent)
  const counts = {};
  nutritionLevels.forEach(n => { counts[n] = (counts[n] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

/**
 * Get recommended nutrition level for next season
 */
function getNextNutrition(current) {
  const idx = NUTRITION_ORDER.indexOf(current);
  if (idx === -1) return 'mittel';
  return NUTRITION_ORDER[(idx + 1) % NUTRITION_ORDER.length];
}

/**
 * Get concrete plant suggestions for a nutrition level
 */
function getSuggestions(nutritionLevel, excludeNames = []) {
  if (nutritionLevel === 'gruen') {
    return GREEN_MANURE.map(g => ({
      name: g.name,
      emoji: g.emoji,
      note: g.note,
      nutrition: 'gruen',
    }));
  }

  return plants
    .filter(p =>
      p.nutrition === nutritionLevel &&
      !excludeNames.includes(p.name) &&
      p.category === 'Gemüse'
    )
    .slice(0, 6)
    .map(p => ({
      name: p.name,
      emoji: p.emoji,
      note: `${p.category}`,
      nutrition: nutritionLevel,
    }));
}

/**
 * Generate full crop rotation analysis for the active garden
 */
export function analyzeCropRotation() {
  const beds = store.getBeds();
  const types = store.getElementTypes();

  const results = [];

  for (const bed of beds) {
    const type = types.find(t => t.id === bed.kind);
    if (!type || !type.hasPlantings) continue;

    const plantings = store.getPlantings(bed.id);
    if (plantings.length === 0) continue;

    const currentNutrition = analyzeBedNutrition(bed.id);
    const nextNutrition = currentNutrition ? getNextNutrition(currentNutrition) : null;

    const currentPlantNames = plantings.map(p => p.name);
    const suggestions = nextNutrition ? getSuggestions(nextNutrition, currentPlantNames) : [];

    results.push({
      bed,
      plantings,
      currentNutrition,
      nextNutrition,
      suggestions,
    });
  }

  return results;
}

/**
 * Render crop rotation widget HTML for dashboard embedding
 */
export function renderCropRotationWidget() {
  const analysis = analyzeCropRotation();

  if (analysis.length === 0) {
    return `
      <div class="dashboard-section animate-in">
        <h2>🔄 Fruchtfolge-Assistent</h2>
        <div class="empty-state" style="padding: var(--space-md);">
          <div class="empty-text">Pflanze Gemüse in deine Beete, um Fruchtfolge-Empfehlungen zu erhalten.</div>
        </div>
      </div>
    `;
  }

  return `
    <div class="dashboard-section animate-in">
      <h2>🔄 Fruchtfolge-Assistent — Nächste Saison</h2>
      <p style="font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: var(--space-md);">
        Basierend auf dem Nährstoffbedarf deiner aktuellen Pflanzungen: Starkzehrer → Mittelzehrer → Schwachzehrer → Gründüngung → Starkzehrer
      </p>
      <div class="crop-rotation-grid">
        ${analysis.map(r => {
          const current = NUTRITION_LABELS[r.currentNutrition] || NUTRITION_LABELS.mittel;
          const next = NUTRITION_LABELS[r.nextNutrition] || NUTRITION_LABELS.mittel;

          return `
            <div class="crop-rotation-card">
              <div class="crop-rotation-card-header">
                <div class="crop-rotation-bed-name">${r.bed.name}</div>
                <div class="crop-rotation-flow">
                  <span class="crop-rotation-badge" style="background: ${current.color}; color: ${current.textColor};">
                    ${current.emoji} ${current.label}
                  </span>
                  <span class="crop-rotation-arrow">→</span>
                  <span class="crop-rotation-badge" style="background: ${next.color}; color: ${next.textColor};">
                    ${next.emoji} ${next.label}
                  </span>
                </div>
              </div>
              <div class="crop-rotation-current">
                <span style="font-size: var(--font-size-xs); color: var(--color-text-muted);">Aktuell:</span>
                ${r.plantings.slice(0, 4).map(p => `<span class="crop-rotation-plant">${p.emoji} ${p.name}</span>`).join('')}
                ${r.plantings.length > 4 ? `<span style="font-size: var(--font-size-xs); color: var(--color-text-muted);">+${r.plantings.length - 4}</span>` : ''}
              </div>
              ${r.suggestions.length > 0 ? `
                <div class="crop-rotation-suggestions">
                  <span style="font-size: var(--font-size-xs); color: var(--color-text-muted);">Empfehlung nächste Saison:</span>
                  <div class="crop-rotation-suggestion-list">
                    ${r.suggestions.map(s => `
                      <span class="crop-rotation-suggestion" title="${s.note || ''}">
                        ${s.emoji} ${s.name}
                      </span>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
