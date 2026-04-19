import { store } from '../core/Store.js';
import { bus } from '../core/EventBus.js';

const COLOR_THEMES = [
  {
    id: 'terracotta',
    label: 'Terracotta',
    emoji: '🌿',
    light: { bg: '#f0ebe0', primary: '#7c5c3e', accent: '#4a7a8a' },
    dark:  { bg: '#18120e', primary: '#d4956a', accent: '#6eb5c8' },
  },
  {
    id: 'forest',
    label: 'Forest',
    emoji: '🌲',
    light: { bg: '#ebf2ec', primary: '#2d6a4f', accent: '#52796f' },
    dark:  { bg: '#0d1a10', primary: '#74c69d', accent: '#52b788' },
  },
  {
    id: 'ocean',
    label: 'Ocean',
    emoji: '🌊',
    light: { bg: '#e8f3f8', primary: '#1a6b8a', accent: '#2a9080' },
    dark:  { bg: '#0a1820', primary: '#46c4e0', accent: '#38c4b0' },
  },
  {
    id: 'harvest',
    label: 'Harvest',
    emoji: '🌾',
    light: { bg: '#fdf4e0', primary: '#9a5e20', accent: '#7a6820' },
    dark:  { bg: '#1a1205', primary: '#f0a040', accent: '#d4a030' },
  },
  {
    id: 'midnight',
    label: 'Midnight',
    emoji: '🌑',
    light: { bg: '#eef1f8', primary: '#3a5a8c', accent: '#7a5a9c' },
    dark:  { bg: '#0c1020', primary: '#7ab0e0', accent: '#9a80c8' },
  },
];

export function renderSetup() {
  const container = document.getElementById('setup-content');
  if (!container) return;
  
  container.innerHTML = renderSettingsManager();

  // Attach event listeners after HTML is bound
  setTimeout(() => {
    bindSettingsEvents(container, () => renderSetup());
  }, 0);
}

export function renderSettingsManager() {
  const levels = store.getLevels();
  const types = store.getElementTypes();

  const currentColorTheme = store.getSettings().colorTheme || 'terracotta';
  const isDark = (store.getSettings().theme || 'light') === 'dark';

  return `
    <div class="config-container dashboard-section animate-in" style="margin-top: 24px;">
      <h2>⚙️ Garten-Einstellungen</h2>

      <!-- Theme Picker -->
      <div style="margin-top: 20px; margin-bottom: 28px;">
        <h3 style="margin-bottom: 12px;">🎨 Farbdesign</h3>
        <div class="theme-picker-grid">
          ${COLOR_THEMES.map(t => {
            const colors = isDark ? t.dark : t.light;
            const active = currentColorTheme === t.id;
            return `
              <button class="theme-tile ${active ? 'theme-tile-active' : ''}" data-theme-id="${t.id}" title="${t.label}">
                <div class="theme-tile-preview">
                  <div style="background: ${colors.bg}; flex: 1; border-radius: 6px 6px 0 0; display: flex; align-items: center; justify-content: center; gap: 4px; padding: 8px;">
                    <div style="width: 18px; height: 18px; border-radius: 50%; background: ${colors.primary};"></div>
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: ${colors.accent}; opacity: 0.7;"></div>
                    <div style="width: 10px; height: 10px; border-radius: 50%; background: ${colors.primary}; opacity: 0.4;"></div>
                  </div>
                </div>
                <div class="theme-tile-label">${t.emoji} ${t.label}</div>
                ${active ? '<div class="theme-tile-check">✓</div>' : ''}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <div style="display: flex; gap: var(--space-lg); flex-wrap: wrap;">
        
        <!-- Grundstück -->
        <div class="config-section" style="flex: 1; min-width: 250px;">
          <h3>📐 Grundstück & Maße</h3>
          <p style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 12px;">Definiere die Ausmaße deines Gartens in Metern (m). Das Raster passt sich automatisch an.</p>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; font-weight: 500;">Breite (X-Achse, m)</span>
              <input type="number" id="config-garden-width" class="form-input" value="${(store.getGarden().width / 100).toFixed(2)}" step="0.1" style="width: 100px;">
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; font-weight: 500;">Länge (Y-Achse, m)</span>
              <input type="number" id="config-garden-height" class="form-input" value="${(store.getGarden().height / 100).toFixed(2)}" step="0.1" style="width: 100px;">
            </div>
            <button id="config-garden-save" class="btn btn-secondary btn-sm" style="margin-top: 8px;">Maße anwenden</button>
          </div>
        </div>

        <!-- Levels -->
        <div class="config-section" style="flex: 1; min-width: 250px;">
          <h3>⛰️ Höhen-Ebenen</h3>
          <p style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 12px;">Definiere die physischen Ebenen / Terrassen in deinem Garten. Der Z-Index bestimmt die Überlagerung und den Schatteneffekt.</p>
          
          <div class="list-group" id="config-levels-list">
            ${levels.sort((a,b) => a.zIndex - b.zIndex).map(l => `
              <div class="list-item" style="display:flex; justify-content:space-between; align-items:center; padding: 8px; border: var(--glass-border); margin-bottom: 8px; border-radius: 4px; background: rgba(0,0,0,0.05);">
                <div>
                  <strong>${l.name}</strong> <span style="font-size:10px; color:var(--color-text-muted)">(Höhe: ${l.zIndex})</span>
                </div>
                <button class="icon-btn small delete-level-btn" data-id="${l.id}" ${levels.length <= 1 ? 'disabled style="opacity: 0.3"' : ''}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px; height:14px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            `).join('')}
          </div>
          
          <div style="display: flex; gap: 8px; margin-top: 12px;">
            <input type="text" id="new-level-name" class="form-input" placeholder="Neue Ebene" style="flex: 1;">
            <input type="number" id="new-level-z" class="form-input" placeholder="Z" style="width: 60px;" value="${levels.length}">
            <button id="add-level-btn" class="btn btn-primary" style="padding: 0 12px;">+</button>
          </div>
        </div>

        <!-- Types -->
        <div class="config-section" style="flex: 1; min-width: 250px;">
          <h3>🎨 Flächen-Typen</h3>
          <p style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 12px;">Erstelle neue Elemente wie Teich, Sandkasten oder Hecke.</p>
          
          <div class="list-group" id="config-types-list">
            ${types.map(t => `
              <div class="list-item" style="display:flex; justify-content:space-between; align-items:center; padding: 8px; border: var(--glass-border); margin-bottom: 8px; border-radius: 4px; background: rgba(0,0,0,0.05);">
                <div style="display:flex; align-items:center; gap: 8px;">
                  <span style="width: 16px; height: 16px; border-radius: 3px; background: ${t.color}"></span>
                  <strong>${t.name}</strong>
                  <span style="font-size:10px; color:var(--color-text-muted)">(${t.category || 'Fläche'}, ${((t.defaultHeight || 0) / 100).toFixed(2)}m)</span>
                  ${t.hasPlantings ? '<span title="Bepflanzbar" style="font-size: 12px;">🌱</span>' : ''}
                </div>
                <button class="icon-btn small delete-type-btn" data-id="${t.id}" ${types.length <= 1 ? 'disabled style="opacity: 0.3"' : ''}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px; height:14px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            `).join('')}
          </div>
          
          <div style="display: flex; gap: 8px; margin-top: 12px; flex-direction: column;">
            <div style="display: flex; gap: 8px;">
              <input type="text" id="new-type-name" class="form-input" placeholder="Neuer Typ (z.B. Sandkasten)" style="flex: 1;">
              <input type="color" id="new-type-color" class="form-input" value="#fcd34d" style="width: 40px; padding: 0;">
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <select id="new-type-category" class="form-input" style="flex:1; padding: 4px;">
                <option value="object">Objekt / Aufbau</option>
                <option value="area">Fläche / Boden</option>
                <option value="line">Zaun / Linie</option>
              </select>
              <input type="number" id="new-type-height" class="form-input" placeholder="Höhe in m" step="0.01" min="0" style="width: 80px;" value="0">
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <label style="font-size: 12px; display:flex; align-items:center; gap: 4px; cursor: pointer;">
                <input type="checkbox" id="new-type-plantings"> Bepflanzbar?
              </label>
              <button id="add-type-btn" class="btn btn-secondary btn-sm" style="padding: 4px 12px;">Hinzufügen</button>
            </div>
          </div>
        </div>

        <!-- Standort -->
        <div class="config-section" style="flex: 1; min-width: 250px;">
          <h3>📍 Standort & Wetter</h3>
          <p style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 12px;">
            Gib deinen Standort an, um aktuelle Wetterdaten und Frostwarnungen im Dashboard zu sehen.
          </p>
          ${(() => {
            const loc = store.getSettings().location || {};
            return loc.city ? `
              <div class="location-selected-badge">
                📍 ${loc.city}
                <button id="location-clear-btn" style="background:none;border:none;cursor:pointer;color:var(--color-text-muted);padding:0 0 0 4px;font-size:12px;" title="Standort entfernen">✕</button>
              </div>
              <p style="font-size:11px; color:var(--color-text-muted); margin-top:6px;">Koordinaten: ${loc.lat?.toFixed(3)}, ${loc.lon?.toFixed(3)}</p>
            ` : '';
          })()}
          <div class="location-search-wrapper" style="margin-top: 10px;">
            <input type="text" id="location-search-input" class="form-input" placeholder="Stadt suchen (z.B. Berlin, Wien, Zürich)..." autocomplete="off">
            <div class="location-result-list" id="location-results" style="display:none;"></div>
          </div>
        </div>

        <!-- Backup -->
        <div class="config-section" style="flex: 1; min-width: 250px;">
          <h3>💾 Backup & Speicher</h3>
          <p style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 12px;">Erstelle eine Sicherungskopie, um deinen Garten aufzubewahren oder auf ein anderes Gerät zu übertragen.</p>
          <div style="display: flex; gap: 8px; flex-direction: column;">
            <button id="backup-export-btn" class="btn btn-primary" style="justify-content: center; width: 100%;">
               Exportieren (Download)
            </button>
            <div style="position: relative; margin-top: 12px;">
              <input type="file" id="backup-import-input" accept=".json" style="position: absolute; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
              <button class="btn btn-secondary" style="justify-content: center; width: 100%; pointer-events: none;">
                 Importieren (Wiederherstellen)
              </button>
            </div>
            <button id="export-image-btn" class="btn btn-secondary" style="justify-content: center; width: 100%; margin-top: 12px;">
               🖼️ Als Bild speichern (PNG)
            </button>
            <p style="font-size: 10px; color: var(--color-text-muted); margin-top: 4px; text-align: center;">Vorsicht: Beim Import werden aktuelle Daten überschrieben.</p>
            
            <hr style="margin: 16px 0; border: 0; border-top: 1px solid var(--border-color);">
            <button id="danger-reset-btn" class="btn" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.5); justify-content: center; width: 100%;">
               🧨 Garten komplett löschen
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  `;
}

export function bindSettingsEvents(containerBlock, onUpdateCallback) {
  // ── Location / City Search ────────────────────────────────────────
  const locationInput  = containerBlock.querySelector('#location-search-input');
  const locationResults = containerBlock.querySelector('#location-results');

  let _locationTimer = null;
  locationInput?.addEventListener('input', () => {
    clearTimeout(_locationTimer);
    const q = locationInput.value.trim();
    if (q.length < 2) { locationResults.style.display = 'none'; return; }
    _locationTimer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=de&format=json`
        );
        const data = await res.json();
        const results = data.results || [];
        if (results.length === 0) {
          locationResults.innerHTML = `<div class="location-result-item" style="color:var(--color-text-muted);">Keine Ergebnisse</div>`;
        } else {
          locationResults.innerHTML = results.map(r => `
            <div class="location-result-item" data-lat="${r.latitude}" data-lon="${r.longitude}" data-city="${r.name}${r.admin1 ? ', ' + r.admin1 : ''}">
              <span>📍</span>
              <span>${r.name}${r.admin1 ? ' <span style="color:var(--color-text-muted)">' + r.admin1 + '</span>' : ''}</span>
              <span class="loc-country">${r.country || ''}</span>
            </div>
          `).join('');
          locationResults.querySelectorAll('.location-result-item[data-lat]').forEach(item => {
            item.addEventListener('click', () => {
              const loc = {
                city: item.dataset.city,
                lat:  parseFloat(item.dataset.lat),
                lon:  parseFloat(item.dataset.lon),
              };
              store.updateSettings({ location: loc });
              // Clear weather cache so it re-fetches
              localStorage.removeItem('gp_weather_cache');
              locationResults.style.display = 'none';
              onUpdateCallback?.();
            });
          });
        }
        locationResults.style.display = 'block';
      } catch {
        locationResults.style.display = 'none';
      }
    }, 350);
  });

  locationInput?.addEventListener('blur', () => {
    setTimeout(() => { locationResults.style.display = 'none'; }, 200);
  });

  // Theme picker
  containerBlock.querySelectorAll('.theme-tile').forEach(btn => {
    btn.addEventListener('click', () => {
      const themeId = btn.dataset.themeId;
      bus.emit('settings:colorTheme', themeId);
      onUpdateCallback?.();
    });
  });

  containerBlock.querySelector('#location-clear-btn')?.addEventListener('click', () => {
    store.updateSettings({ location: { city: '', lat: null, lon: null } });
    localStorage.removeItem('gp_weather_cache');
    onUpdateCallback?.();
  });

  // Garden dimensions
  containerBlock.querySelector('#config-garden-save')?.addEventListener('click', () => {
    const wStr = containerBlock.querySelector('#config-garden-width').value;
    const hStr = containerBlock.querySelector('#config-garden-height').value;
    const w = Math.round((parseFloat(wStr) || 20) * 100);
    const h = Math.round((parseFloat(hStr) || 15) * 100);
    store.updateGarden({ width: w, height: h, shape: 'rect' });
    onUpdateCallback?.();
  });

  // Add Level
  containerBlock.querySelector('#add-level-btn')?.addEventListener('click', () => {
    const name = containerBlock.querySelector('#new-level-name').value.trim();
    const z = parseInt(containerBlock.querySelector('#new-level-z').value) || 0;
    if (!name) return;
    const levels = store.getLevels();
    levels.push({ id: 'level-' + Date.now(), name, zIndex: z });
    store.updateLevels(levels);
    onUpdateCallback?.();
  });

  // Delete Level
  containerBlock.querySelectorAll('.delete-level-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      let levels = store.getLevels();
      if (levels.length > 1) {
        levels = levels.filter(l => l.id !== id);

        // move beds from deleted layer to first available
        store.getBeds().forEach(bed => {
          if(bed.levelId === id) store.updateBed(bed.id, {levelId: levels[0].id});
        });

        store.updateLevels(levels);
        onUpdateCallback?.();
      }
    });
  });

  // Add Type
  containerBlock.querySelector('#add-type-btn')?.addEventListener('click', () => {
    const name = containerBlock.querySelector('#new-type-name').value.trim();
    const color = containerBlock.querySelector('#new-type-color').value;
    const category = containerBlock.querySelector('#new-type-category').value;
    const defaultHeight = Math.round((parseFloat(containerBlock.querySelector('#new-type-height').value) || 0) * 100);
    const hasPlantings = containerBlock.querySelector('#new-type-plantings').checked;
    if (!name) return;
    const types = store.getElementTypes();
    types.push({ id: 'type-' + Date.now(), name, color, category, defaultHeight, hasPlantings });
    store.updateElementTypes(types);
    onUpdateCallback?.();
  });

  // Delete Type
  containerBlock.querySelectorAll('.delete-type-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      let types = store.getElementTypes();
      if (types.length > 1) {
        types = types.filter(t => t.id !== id);

        // move beds from deleted type to first available
        store.getBeds().forEach(bed => {
          if(bed.kind === id) store.updateBed(bed.id, {kind: types[0].id});
        });

        store.updateElementTypes(types);
        onUpdateCallback?.();
      }
    });
  });

  // Backup Export
  containerBlock.querySelector('#backup-export-btn')?.addEventListener('click', () => {
    const raw = localStorage.getItem('gartenplaner_data');
    if (!raw) return alert('Keine Daten zum Exportieren gefunden.');
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GartenPlaner_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Backup Import
  containerBlock.querySelector('#backup-import-input')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        JSON.parse(text); // validate
        localStorage.setItem('gartenplaner_data', text);
        alert('Backup erfolgreich wiederhergestellt! Die Seite wird nun neu geladen.');
        location.reload();
      } catch (err) {
        alert('Fehler beim Importieren: Die Datei ist ungültig oder beschädigt.');
      }
    };
    reader.readAsText(file);
  });

  // Image Export
  containerBlock.querySelector('#export-image-btn')?.addEventListener('click', () => {
    const container = document.querySelector('.canvas-container');
    if (!container) return;
    const canvases = Array.from(container.querySelectorAll('canvas'));
    if (canvases.length === 0) return;
    
    const offscreen = document.createElement('canvas');
    offscreen.width = canvases[0].width;
    offscreen.height = canvases[0].height;
    const ctx = offscreen.getContext('2d');
    
    canvases.sort((a,b) => {
       const da = parseFloat(a.style.getPropertyValue('--depth')) || 0;
       const db = parseFloat(b.style.getPropertyValue('--depth')) || 0;
       return da - db;
    });

    canvases.forEach(c => {
      ctx.drawImage(c, 0, 0);
    });

    const url = offscreen.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Garten_Export_${new Date().toISOString().split('T')[0]}.png`;
    a.click();
  });

  // Reset Everything
  containerBlock.querySelector('#danger-reset-btn')?.addEventListener('click', () => {
    if (confirm('BIST DU SICHER?\nAlle deine Beete, Pflanzen, Einstellungen und Fotos werden unwiderruflich gelöscht!')) {
      if (confirm('WIRKLICH ALLES LÖSCHEN? (Dies kann nicht mehr rückgängig gemacht werden!)')) {
        localStorage.removeItem('gartenplaner_data');
        location.reload();
      }
    }
  });
}
