/**
 * HarvestModal — Modal dialog for recording a harvest from a planting
 */
import { store } from '../core/Store.js';
import { formatDate } from '../utils/helpers.js';

export function showHarvestModal(planting, bedId) {
  const overlay = document.getElementById('modal-overlay');
  const container = document.getElementById('modal-container');

  // Get existing harvests for this planting
  const existingHarvests = store.getHarvests(planting.id);

  container.innerHTML = `
    <div class="modal-header">
      <h2>${planting.emoji} Ernte erfassen — ${planting.name}</h2>
      <button class="icon-btn" id="modal-close-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="modal-body">
      <!-- Harvest form -->
      <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap; margin-bottom: var(--space-md);">
        <div class="form-group" style="margin: 0; flex: 1; min-width: 100px;">
          <label class="form-label">Menge</label>
          <input type="number" class="form-input" id="harvest-amount" placeholder="z.B. 2.5" step="0.1" min="0" value="">
        </div>
        <div class="form-group" style="margin: 0; flex: 1; min-width: 100px;">
          <label class="form-label">Einheit</label>
          <select class="form-input" id="harvest-unit">
            <option value="kg">kg</option>
            <option value="g">Gramm</option>
            <option value="stk">Stück</option>
            <option value="bund">Bund</option>
            <option value="l">Liter</option>
          </select>
        </div>
        <div class="form-group" style="margin: 0; flex: 1; min-width: 140px;">
          <label class="form-label">Erntedatum</label>
          <input type="date" class="form-input" id="harvest-date" value="${new Date().toISOString().split('T')[0]}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Notizen (optional)</label>
        <textarea class="form-input" id="harvest-notes" placeholder="z.B. Erste Ernte, sehr aromatisch…" rows="2"></textarea>
      </div>

      <!-- Existing harvests -->
      ${existingHarvests.length > 0 ? `
        <div style="margin-top: var(--space-lg); border-top: var(--glass-border); padding-top: var(--space-md);">
          <div style="font-weight: 600; font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-sm);">
            📊 Bisherige Ernten (${existingHarvests.length})
          </div>
          <div class="harvest-history-list">
            ${existingHarvests.sort((a, b) => b.date.localeCompare(a.date)).map(h => `
              <div class="harvest-history-item">
                <div class="harvest-history-info">
                  <span class="harvest-history-amount">${h.amount} ${h.unit}</span>
                  <span class="harvest-history-date">${formatDate(h.date)}</span>
                  ${h.notes ? `<span class="harvest-history-notes">${h.notes}</span>` : ''}
                </div>
                <button class="icon-btn small harvest-delete-btn" data-harvest-id="${h.id}" title="Löschen">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            `).join('')}
          </div>
          <div class="harvest-total">
            ${(() => {
              const byUnit = {};
              existingHarvests.forEach(h => {
                if (!byUnit[h.unit]) byUnit[h.unit] = 0;
                byUnit[h.unit] += h.amount;
              });
              return Object.entries(byUnit).map(([unit, total]) =>
                `<span class="harvest-total-badge">Σ ${total % 1 === 0 ? total : total.toFixed(1)} ${unit}</span>`
              ).join(' ');
            })()}
          </div>
        </div>
      ` : ''}
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" id="modal-cancel-btn">Schließen</button>
      <button class="btn btn-primary" id="modal-save-btn">🧺 Ernte speichern</button>
    </div>
  `;

  overlay.classList.remove('hidden');
  setTimeout(() => overlay.classList.add('visible'), 10);

  // Close handler
  const closeModal = () => {
    overlay.classList.remove('visible');
    setTimeout(() => overlay.classList.add('hidden'), 250);
  };

  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Delete existing harvest
  document.querySelectorAll('.harvest-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      store.deleteHarvest(btn.dataset.harvestId);
      // Re-render modal with updated data
      showHarvestModal(planting, bedId);
    });
  });

  // Save
  document.getElementById('modal-save-btn').addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('harvest-amount').value);
    if (isNaN(amount) || amount <= 0) {
      document.getElementById('harvest-amount').style.borderColor = 'var(--color-danger)';
      return;
    }

    store.addHarvest({
      plantingId: planting.id,
      bedId: bedId,
      plantName: planting.name,
      plantEmoji: planting.emoji,
      date: document.getElementById('harvest-date').value,
      amount,
      unit: document.getElementById('harvest-unit').value,
      notes: document.getElementById('harvest-notes').value.trim(),
    });

    // Re-render modal to show the new harvest in the list
    showHarvestModal(planting, bedId);
  });

  // Focus amount field
  document.getElementById('harvest-amount')?.focus();
}
