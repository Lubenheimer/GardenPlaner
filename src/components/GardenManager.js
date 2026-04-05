/**
 * GardenManager — Modal for managing multiple garden projects
 */
import { store } from '../core/Store.js';
import { bus } from '../core/EventBus.js';

let onSwitchCallback = null;

export function showGardenManager(onSwitch) {
  onSwitchCallback = onSwitch;
  _render();

  const overlay = document.getElementById('garden-manager-overlay');
  overlay.classList.remove('hidden');
  // Force reflow so the CSS transition fires
  void overlay.offsetHeight;
  overlay.classList.add('visible');
}

function _close() {
  const overlay = document.getElementById('garden-manager-overlay');
  overlay.classList.remove('visible');
  setTimeout(() => overlay.classList.add('hidden'), 250);
}

function _render() {
  const overlay = document.getElementById('garden-manager-overlay');
  const gardens  = store.getGardens();
  const activeId = store.getActiveGardenId();

  overlay.innerHTML = `
    <div class="modal-container" style="max-width:520px">
      <div class="modal-header">
        <h2>🌿 Meine Gärten</h2>
        <button class="icon-btn" id="gm-close-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <div id="gm-garden-list" style="display:flex;flex-direction:column;gap:var(--space-sm);margin-bottom:var(--space-lg)">
          ${gardens.map(g => _gardenCard(g, activeId)).join('')}
        </div>
        <button class="btn btn-secondary" id="gm-new-btn" style="width:100%">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Neuen Garten anlegen
        </button>
      </div>
    </div>
  `;

  _bindEvents();
}

function _gardenCard(g, activeId) {
  const isActive   = g.id === activeId;
  const bedCount   = (g.beds || []).length;
  const plantCount = (g.plantings || []).length;
  const created    = new Date(g.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });

  return `
    <div class="gm-card ${isActive ? 'gm-card--active' : ''}" data-garden-id="${g.id}">
      <div class="gm-card-icon">🌱</div>
      <div class="gm-card-info">
        <div class="gm-card-name" id="gm-name-${g.id}">${_escapeHtml(g.name)}</div>
        <div class="gm-card-meta">${bedCount} Elemente · ${plantCount} Pflanzungen · Seit ${created}</div>
      </div>
      <div class="gm-card-actions">
        ${isActive
          ? `<span class="badge badge-planted" style="font-size:0.7rem">Aktiv</span>`
          : `<button class="btn btn-sm btn-secondary gm-switch-btn" data-id="${g.id}">Wechseln</button>`
        }
        <button class="icon-btn small gm-rename-btn" data-id="${g.id}" title="Umbenennen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="icon-btn small gm-delete-btn" data-id="${g.id}" title="Löschen" ${store.getGardens().length <= 1 ? 'disabled' : ''}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </div>
    </div>
  `;
}

function _bindEvents() {
  const overlay = document.getElementById('garden-manager-overlay');

  overlay.querySelector('#gm-close-btn').addEventListener('click', _close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) _close(); });

  // Switch garden
  overlay.querySelectorAll('.gm-switch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      store.switchGarden(btn.dataset.id);
      if (onSwitchCallback) onSwitchCallback();
      _close();
    });
  });

  // Rename garden
  overlay.querySelectorAll('.gm-rename-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id   = btn.dataset.id;
      const g    = store.getGardens().find(g => g.id === id);
      const name = prompt('Neuer Name:', g?.name || '');
      if (name && name.trim()) {
        store.renameGarden(id, name.trim());
        _render();
        _bindEvents();
      }
    });
  });

  // Delete garden
  overlay.querySelectorAll('.gm-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const g  = store.getGardens().find(g => g.id === id);
      if (!confirm(`Garten "${g?.name}" wirklich löschen? Alle Daten gehen verloren.`)) return;
      store.deleteGarden(id);
      if (onSwitchCallback) onSwitchCallback();
      _render();
      _bindEvents();
    });
  });

  // New garden
  overlay.querySelector('#gm-new-btn').addEventListener('click', () => {
    const name = prompt('Name des neuen Gartens:', 'Neuer Garten');
    if (!name || !name.trim()) return;
    const g = store.createGarden(name.trim());
    store.switchGarden(g.id);
    if (onSwitchCallback) onSwitchCallback();
    _close();
  });
}

function _escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── CSS injected once ───────────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
  .gm-card {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md);
    border-radius: var(--radius-md);
    border: var(--glass-border);
    background: var(--color-surface);
    transition: all var(--transition-fast);
  }
  .gm-card:hover { border-color: var(--color-border-strong); box-shadow: 0 4px 12px var(--color-shadow); }
  .gm-card--active {
    border-color: var(--color-primary);
    background: var(--color-primary-soft);
    box-shadow: 0 0 0 2px var(--color-primary-soft);
  }
  .gm-card-icon { font-size: 28px; flex-shrink: 0; }
  .gm-card-info { flex: 1; min-width: 0; }
  .gm-card-name { font-weight: 600; font-size: var(--font-size-base); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .gm-card-meta { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px; }
  .gm-card-actions { display: flex; align-items: center; gap: var(--space-xs); flex-shrink: 0; }
  .gm-delete-btn { color: var(--color-danger) !important; }
  .gm-delete-btn:hover { background: var(--color-danger-soft) !important; }
  .gm-delete-btn:disabled { opacity: 0.3; cursor: not-allowed; }
`;
document.head.appendChild(style);
