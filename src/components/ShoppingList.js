/**
 * ShoppingList — Automatic shopping list from planned plantings
 * Shows all plants with status 'planned', allows check-off, editing, and CSV export
 */
import { store } from '../core/Store.js';
import { getPlant } from '../data/plants.js';

/**
 * Calculate total quantity and aggregate buying information for a plant group
 */
function aggregateShoppingData(plantGroup) {
  const totalQuantity = plantGroup.items.reduce((sum, p) => sum + (p.quantity || 1), 0);
  const varieties = [...new Set(plantGroup.items.map(p => p.variety).filter(Boolean))];
  const beds = [...new Set(plantGroup.items.map(p => {
    const bed = store.getBed(p.bedId);
    return bed ? bed.name : 'Unbekanntes Beet';
  }))];

  return {
    totalQuantity,
    varieties,
    beds,
  };
}

/**
 * Generate CSV export from planned plantings
 */
function generateCSV(plantGroups) {
  const rows = [
    ['Pflanze', 'Menge', 'Sorten', 'Beete', 'Status'].join(','),
  ];

  plantGroups.forEach(group => {
    const data = aggregateShoppingData(group);
    const varieties = data.varieties.length > 0 ? data.varieties.join(' | ') : '(Standard)';
    const beds = data.beds.join(', ');
    rows.push(
      [group.name, data.totalQuantity, varieties, beds, '[ ]']
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
  });

  return rows.join('\n');
}

/**
 * Open edit modal for a planting item
 */
function showEditModal(plantingId, onSave) {
  const planting = store.getPlantings().find(p => p.id === plantingId);
  if (!planting) return;

  const plant = getPlant(planting.name);
  const bed = store.getBed(planting.bedId);

  const overlay = document.getElementById('modal-overlay');
  const container = document.getElementById('modal-container');

  container.innerHTML = `
    <div class="modal-header">
      <h2>Pflanzung bearbeiten</h2>
      <button class="icon-btn" id="modal-close-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">Pflanze</label>
        <div style="padding: 8px; background: var(--bg-surface); border-radius: 4px; border: 1px solid var(--color-border);">
          ${planting.emoji} <strong>${planting.name}</strong> ${bed ? `— Beet: ${bed.name}` : ''}
        </div>
      </div>

      <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
        <div class="form-group" style="margin: 0; flex: 1; min-width: 100px;">
          <label class="form-label">Anzahl (Stück)</label>
          <input type="number" class="form-input" id="edit-quantity-input" value="${planting.quantity || 1}" min="1" step="1">
        </div>
        <div class="form-group" style="margin: 0; flex: 2; min-width: 140px;">
          <label class="form-label">Sorte / Varietät</label>
          <input type="text" class="form-input" id="edit-variety-input" value="${planting.variety || ''}" placeholder="z.B. San Marzano">
        </div>
      </div>

      <div class="form-group" style="margin-top: var(--space-sm);">
        <label class="form-label">Notizen</label>
        <textarea class="form-input" id="edit-notes-input" placeholder="z.B. Bio-Qualität, spezial Händler…" rows="2">${planting.notes || ''}</textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" id="modal-cancel-btn">Abbrechen</button>
      <button class="btn btn-primary" id="modal-save-btn">Speichern</button>
    </div>
  `;

  overlay.classList.remove('hidden');
  setTimeout(() => overlay.classList.add('visible'), 10);

  const closeModal = () => {
    overlay.classList.remove('visible');
    setTimeout(() => overlay.classList.add('hidden'), 250);
  };

  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.getElementById('modal-save-btn').addEventListener('click', () => {
    const quantity = parseInt(document.getElementById('edit-quantity-input').value);
    const variety = document.getElementById('edit-variety-input').value.trim();
    const notes = document.getElementById('edit-notes-input').value.trim();

    store.updatePlanting(plantingId, {
      quantity: isNaN(quantity) ? 1 : quantity,
      variety,
      notes,
    });

    closeModal();
    if (onSave) onSave();
  });
}

/**
 * Render the shopping list view
 */
export function renderShoppingList() {
  const container = document.getElementById('shopping-list-content');
  const plantGroups = store.getPlannedPlantings();

  container.innerHTML = `
    <div class="dashboard-section" style="max-width: 900px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h2>🛒 Einkaufsliste</h2>
          <p style="font-size: var(--font-size-sm); color: var(--color-text-muted); margin-top: 4px;">
            ${plantGroups.length === 0
              ? 'Keine geplanten Pflanzungen. Platziere Pflanzen mit Status „📋 Geplant".'
              : `${plantGroups.length} Pflanze${plantGroups.length !== 1 ? 'n' : ''} zum Einkaufen`}
          </p>
        </div>
        ${plantGroups.length > 0 ? `
          <button id="export-csv-btn" class="btn btn-secondary" style="white-space: nowrap;">
            📥 Als CSV exportieren
          </button>
        ` : ''}
      </div>

      ${plantGroups.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">🌱</div>
          <div class="empty-text">Noch keine geplanten Pflanzungen.</div>
          <div class="empty-hint" style="font-size: var(--font-size-sm); color: var(--color-text-muted); margin-top: 8px;">
            Füge Pflanzen mit Status „📋 Geplant" hinzu, um sie hier zu sehen.
          </div>
        </div>
      ` : `
        <div class="list-group" style="display: flex; flex-direction: column; gap: 12px;">
          ${plantGroups.map((group, idx) => {
            const data = aggregateShoppingData(group);
            const varieties = data.varieties.length > 0 ? data.varieties.join(', ') : '(Standard)';
            return `
              <div class="shopping-item" style="padding: 16px; background: var(--bg-surface); border: var(--glass-border); border-radius: var(--radius-md); display: flex; gap: 12px; align-items: flex-start; transition: all 0.2s ease;">
                <div style="font-size: 28px; line-height: 1;">${group.emoji}</div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">${group.name}</div>
                  <div style="font-size: 12px; color: var(--color-text-muted); line-height: 1.4;">
                    <div><strong>${data.totalQuantity}×</strong> ${group.category}</div>
                    <div>Sorten: ${varieties}</div>
                    <div>Beete: ${data.beds.join(', ')}</div>
                  </div>
                </div>
                <div style="display: flex; gap: 8px;">
                  ${group.items.map(item => `
                    <button class="icon-btn small edit-planting-btn" data-id="${item.id}" title="Bearbeiten">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;

  // Event listeners
  document.getElementById('export-csv-btn')?.addEventListener('click', () => {
    const csv = generateCSV(plantGroups);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `GardenPlaner-Einkaufsliste-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  });

  document.querySelectorAll('.edit-planting-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const plantingId = btn.dataset.id;
      showEditModal(plantingId, () => renderShoppingList());
    });
  });
}
