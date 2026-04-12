/**
 * BedEditor — Right panel editor for a selected bed
 */
import { store } from '../core/Store.js';
import { bedColors, statusLabels, statusEmojis, formatDate } from '../utils/helpers.js';
import { showHarvestModal } from './HarvestModal.js';

export function renderBedEditor(bed) {
  const plantings = store.getPlantings(bed.id);
  const photos = store.getPhotos(bed.id);
  const types = store.getElementTypes();
  const levels = store.getLevels();
  const currentType = types.find(t => t.id === bed.kind) || types[0];

  return `
    <div class="panel-header">
      <h2>Element bearbeiten</h2>
      <button class="icon-btn" id="panel-close-btn" title="Schließen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="panel-body">
      <!-- Name -->
      <div class="panel-section">
        <div class="form-group">
          <label class="form-label">Name</label>
          <input type="text" class="form-input" id="bed-name-input" value="${bed.name}">
        </div>
      </div>

      <!-- Typ & Ebene & Boden -->
      <div class="panel-section">
        <div class="form-group" style="margin-bottom: var(--space-sm)">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
            <label class="form-label" style="margin:0;">Flächen-Typ & Farbe</label>
            <div style="display:flex; gap: 4px; align-items:center;">
              <input type="color" id="bed-color-override" value="${bed.color || currentType.color}" title="Eigene Farbe überschreiben" style="width:20px; height:20px; padding:0; cursor:pointer; border:none; background:transparent;">
              <button class="icon-btn small" id="bed-color-reset" title="Farbe zurücksetzen" style="${!bed.color ? 'opacity: 0.3; pointer-events: none;' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              </button>
            </div>
          </div>
          <select class="form-input" id="bed-kind-select">
            ${types.map(t => `<option value="${t.id}" ${t.id === bed.kind ? 'selected' : ''}>${t.name} (${t.category === 'object' ? 'Objekt' : t.category === 'line' ? 'Linie' : 'Fläche'})</option>`).join('')}
          </select>
        </div>
        <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
          <div class="form-group" style="margin: 0; flex: 1; min-width: 90px;">
            <label class="form-label" style="font-size: 11px">Höhen-Ebene</label>
            <select class="form-input" id="bed-level-select">
              ${levels.map(l => `<option value="${l.id}" ${l.id === bed.levelId ? 'selected' : ''}>${l.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin: 0; flex: 1;">
            <label class="form-label" style="font-size: 11px">Boden</label>
            <select class="form-input" id="bed-soil-select">
              <option value="normal" ${bed.soil === 'normal' ? 'selected' : ''}>Unbekannt / Normal</option>
              <option value="sand" ${bed.soil === 'sand' ? 'selected' : ''}>Sandig (trocken)</option>
              <option value="clay" ${bed.soil === 'clay' ? 'selected' : ''}>Lehmig (schwer)</option>
              <option value="humus" ${bed.soil === 'humus' ? 'selected' : ''}>Humusreich</option>
            </select>
          </div>
          <div class="form-group" style="margin: 0; flex: 1;">
            <label class="form-label" style="font-size: 11px">Feuchtigkeit</label>
            <select class="form-input" id="bed-moisture-select">
              <option value="normal" ${bed.moisture === 'normal' ? 'selected' : ''}>Normal / Gegossen</option>
              <option value="dry" ${bed.moisture === 'dry' ? 'selected' : ''}>Trocken</option>
              <option value="wet" ${bed.moisture === 'wet' ? 'selected' : ''}>Feucht / Teichrand</option>
            </select>
          </div>
          <div class="form-group" style="margin: 0; flex: 1;">
            <label class="form-label" style="font-size: 11px">Sonnenlicht</label>
            <select class="form-input" id="bed-sunlight-select">
              <option value="sun" ${bed.sunlight === 'sun' ? 'selected' : ''}>☀️ Vollsonne</option>
              <option value="partial" ${(bed.sunlight === 'partial' || !bed.sunlight) ? 'selected' : ''}>⛅ Halbschatten</option>
              <option value="shade" ${bed.sunlight === 'shade' ? 'selected' : ''}>🌑 Schatten</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Dimensions -->
      <div class="panel-section">
        <div class="panel-section-title">Maße (m) & Form</div>
        <div style="display: flex; gap: var(--space-sm); margin-bottom: var(--space-sm);">
          <div class="form-group" style="margin: 0; flex: 1;">
            <label class="form-label" style="font-size: 11px">Länge X (m)</label>
            <input type="number" class="form-input" id="bed-dim-x" value="${((bed.width || 0) / 100).toFixed(2)}" step="0.1" min="0.01">
          </div>
          <div class="form-group" style="margin: 0; flex: 1;">
            <label class="form-label" style="font-size: 11px">Breite Y (m)</label>
            <input type="number" class="form-input" id="bed-dim-y" value="${((bed.height || 0) / 100).toFixed(2)}" step="0.1" min="0.01">
          </div>
          <div class="form-group" style="margin: 0; flex: 1;">
            <label class="form-label" style="font-size: 11px">Aufbauhöhe (m)</label>
            <input type="number" class="form-input" id="bed-custom-height" step="0.01" min="0"
              value="${bed.customHeight !== null ? (bed.customHeight / 100).toFixed(2) : ''}"
              placeholder="${((currentType.defaultHeight || 0) / 100).toFixed(2)}">
          </div>
        </div>
        <div style="display: flex; gap: var(--space-sm); margin-bottom: var(--space-sm);">
          <div class="form-group" style="margin: 0; flex: 1;">
            <label class="form-label" style="font-size: 11px">Drehung (°)</label>
            <input type="number" class="form-input" id="bed-rotation" value="${bed.rotation || 0}" step="15">
          </div>
        </div>
        <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
          <span>Form: ${bed.type === 'circle' ? '⭕ Rund' : bed.type === 'lshaped' ? '🔲 L-Form' : '▪️ Rechteck'}</span>
        </div>
      </div>

      <!-- Schattenwurf -->
      <div class="panel-section">
        <label style="display: flex; align-items: center; gap: var(--space-sm); cursor: pointer; user-select: none;">
          <div class="shadow-toggle-track ${bed.castShadow === false ? '' : 'shadow-toggle-on'}" id="cast-shadow-toggle">
            <div class="shadow-toggle-thumb"></div>
          </div>
          <span style="font-size: var(--font-size-sm); font-weight: 500;">Schattenwurf</span>
          <span style="font-size: var(--font-size-xs); color: var(--color-text-muted);">
            ${bed.castShadow === false ? 'Deaktiviert' : 'Aktiv (basierend auf Höhe & Sonnenstand)'}
          </span>
        </label>
      </div>

      <!-- Plantings -->

      ${currentType.hasPlantings ? `
      <div class="panel-section">
        <div class="panel-section-title" style="display:flex; align-items:center; justify-content:space-between;">
          Pflanzungen (${plantings.length})
          <button class="btn btn-sm btn-secondary" id="add-planting-btn">+ Hinzufügen</button>
        </div>
        ${plantings.length === 0
          ? `<div class="empty-state" style="padding: var(--space-md)">
              <div class="empty-text" style="font-size: var(--font-size-sm)">Noch keine Pflanzungen</div>
            </div>`
          : `<div class="planting-list">
              ${plantings.map(p => {
                const harvestCount = store.getHarvests(p.id).length;
                const meta = [];
                if (p.variety) meta.push(p.variety);
                if (p.quantity) meta.push(`${p.quantity} Stk`);
                if (p.spacing) meta.push(`↔${p.spacing}cm`);
                return `
                <div class="planting-item">
                  <span class="planting-emoji">${p.emoji}</span>
                  <div class="planting-info">
                    <div class="planting-name">${p.name}${meta.length > 0 ? ` <span style="font-weight:400;font-size:11px;color:var(--color-text-muted)">${meta.join(' · ')}</span>` : ''}</div>
                    <div class="planting-date">${formatDate(p.datePlanted)}${p.dateHarvestExpected ? ` → ${formatDate(p.dateHarvestExpected)}` : ''}${harvestCount > 0 ? ` · 🧺 ${harvestCount}×` : ''}</div>
                  </div>
                  <button class="btn btn-sm planting-harvest-btn" data-planting-id="${p.id}" data-bed-id="${bed.id}"
                    title="Ernte erfassen" style="padding: 2px 6px; font-size: 11px; min-width: 0;">
                    🧺
                  </button>
                  <button class="btn btn-sm planting-status-btn" data-planting-id="${p.id}"
                    title="Status ändern">
                    <span class="badge badge-${p.status}">${statusEmojis[p.status]} ${statusLabels[p.status]}</span>
                  </button>
                  <button class="icon-btn small planting-delete-btn" data-planting-id="${p.id}" title="Löschen">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              `;
              }).join('')}
            </div>`
        }
      </div>
      ` : ''}

      <!-- Photos -->
      ${photos.length > 0 ? `
        <div class="panel-section">
          <div class="panel-section-title">Fotos (${photos.length})</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">
            ${photos.map(ph => `
              <div style="border-radius: var(--radius-sm); overflow: hidden; aspect-ratio: 1; border: var(--glass-border);">
                <img src="${ph.dataUrl}" style="width: 100%; height: 100%; object-fit: cover;">
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Notes -->
      <div class="panel-section">
        <div class="form-group">
          <label class="form-label">Notizen</label>
          <textarea class="form-input" id="bed-notes-input" placeholder="Notizen zum Beet..." rows="3">${bed.notes || ''}</textarea>
        </div>
      </div>

      <!-- Copy / Delete -->
      <div class="panel-section" style="display:flex; gap: var(--space-sm);">
        <button class="btn btn-secondary" id="bed-copy-btn" style="flex:1" title="Kopieren (Ctrl+C)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Kopieren
        </button>
        <button class="btn btn-danger" id="bed-delete-btn" style="flex:1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Löschen
        </button>
      </div>
    </div>
  `;
}

export function bindBedEditorEvents(bedId, handlers) {
  const bed = store.getBed(bedId);
  if (!bed) return;

  // Name
  document.getElementById('bed-name-input')?.addEventListener('input', (e) => {
    store.updateBed(bedId, { name: e.target.value });
    handlers.onUpdate?.();
  });

  // Live update dimensions
  const dimX = document.getElementById('bed-dim-x');
  const dimY = document.getElementById('bed-dim-y');
  const customHeight = document.getElementById('bed-custom-height');
  const rotation = document.getElementById('bed-rotation');

  const updateDim = () => {
    // Eingabe in Metern → intern in cm (= Canvas-Einheiten) umrechnen
    const w  = Math.max(1, Math.round((parseFloat(dimX.value)  || 0.01) * 100));
    const h  = Math.max(1, Math.round((parseFloat(dimY.value)  || 0.01) * 100));
    const r  = parseFloat(rotation.value) || 0;
    const ch = customHeight.value !== '' ? Math.round(parseFloat(customHeight.value) * 100) : null;

    store.updateBed(bedId, { width: w, height: h, rotation: r, customHeight: ch });
    handlers.onUpdate?.();
  };

  dimX?.addEventListener('input', updateDim);
  dimY?.addEventListener('input', updateDim);
  customHeight?.addEventListener('input', updateDim);
  rotation?.addEventListener('input', updateDim);

  document.getElementById('bed-is-closed')?.addEventListener('change', (e) => {
    store.updateBed(bedId, { isClosed: e.target.checked });
    handlers.onUpdate?.();
  });

  // Color Override
  document.getElementById('bed-color-override')?.addEventListener('input', (e) => {
    store.updateBed(bedId, { color: e.target.value });
    document.getElementById('bed-color-reset').style.opacity = '1';
    document.getElementById('bed-color-reset').style.pointerEvents = 'auto';
    handlers.onUpdate?.();
  });

  document.getElementById('bed-color-reset')?.addEventListener('click', () => {
    store.updateBed(bedId, { color: '' });
    handlers.onUpdate?.();
    // re-trigger UI render to show default type color
    bus.emit('bed:selected', store.getBed(bedId));
  });

  // Types & Levels
  document.getElementById('bed-kind-select')?.addEventListener('change', (e) => {
    store.updateBed(bedId, { kind: e.target.value });
    handlers.onUpdate?.();
    bus.emit('bed:selected', store.getBed(bedId));
  });

  document.getElementById('bed-level-select')?.addEventListener('change', (e) => {
    store.updateBed(bedId, { levelId: e.target.value });
    handlers.onUpdate?.();
  });

  document.getElementById('bed-soil-select')?.addEventListener('change', (e) => {
    store.updateBed(bedId, { soil: e.target.value });
    handlers.onUpdate?.();
  });

  document.getElementById('bed-moisture-select')?.addEventListener('change', (e) => {
    store.updateBed(bedId, { moisture: e.target.value });
    handlers.onUpdate?.();
  });

  document.getElementById('bed-sunlight-select')?.addEventListener('change', (e) => {
    store.updateBed(bedId, { sunlight: e.target.value });
    handlers.onUpdate?.();
  });

  // Schattenwurf toggle
  const shadowToggle = document.getElementById('cast-shadow-toggle');
  shadowToggle?.addEventListener('click', () => {
    const current = store.getBed(bedId)?.castShadow;
    // undefined / true => disable; false => enable
    const newVal = current === false ? true : false;
    store.updateBed(bedId, { castShadow: newVal });
    shadowToggle.classList.toggle('shadow-toggle-on', newVal !== false);
    shadowToggle.nextElementSibling.nextElementSibling.textContent =
      newVal === false
        ? 'Deaktiviert'
        : 'Aktiv (basierend auf Höhe & Sonnenstand)';
    handlers.onUpdate?.();
  });

  // Notes
  document.getElementById('bed-notes-input')?.addEventListener('input', (e) => {
    store.updateBed(bedId, { notes: e.target.value });
  });

  // Close
  document.getElementById('panel-close-btn')?.addEventListener('click', handlers.onClose);

  // Copy
  document.getElementById('bed-copy-btn')?.addEventListener('click', handlers.onCopy);

  // Delete
  document.getElementById('bed-delete-btn')?.addEventListener('click', handlers.onDelete);

  // Add planting
  document.getElementById('add-planting-btn')?.addEventListener('click', handlers.onAddPlanting);

  // Planting status toggle
  document.querySelectorAll('.planting-status-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const statuses = ['planned', 'planted', 'growing', 'harvest'];
      const planting = store.getPlantings().find(p => p.id === btn.dataset.plantingId);
      if (planting) {
        const next = statuses[(statuses.indexOf(planting.status) + 1) % statuses.length];
        store.updatePlanting(btn.dataset.plantingId, { status: next });
      }
    });
  });

  // Delete planting
  document.querySelectorAll('.planting-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      store.deletePlanting(btn.dataset.plantingId);
    });
  });

  // Harvest planting
  document.querySelectorAll('.planting-harvest-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const planting = store.getPlantings().find(p => p.id === btn.dataset.plantingId);
      if (planting) {
        showHarvestModal(planting, btn.dataset.bedId);
      }
    });
  });
}
