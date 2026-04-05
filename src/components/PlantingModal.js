/**
 * PlantingModal — Modal dialog for adding a planting to a bed
 */
import { store } from '../core/Store.js';
import { searchPlants, getPlant } from '../data/plants.js';

export function showPlantingModal(bedId) {
  const overlay = document.getElementById('modal-overlay');
  const container = document.getElementById('modal-container');

  container.innerHTML = `
    <div class="modal-header">
      <h2>Pflanzung hinzufügen</h2>
      <button class="icon-btn" id="modal-close-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">Pflanze</label>
        <div class="autocomplete-wrapper">
          <input type="text" class="form-input" id="plant-name-input" placeholder="Name eingeben oder suchen..." autocomplete="off">
          <div id="autocomplete-results" class="autocomplete-list" style="display:none"></div>
        </div>
        <div id="plant-warnings" style="margin-top: 12px;"></div>
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-select" id="plant-status-select">
          <option value="planned">📋 Geplant</option>
          <option value="planted">🌱 Gesetzt</option>
          <option value="growing">🌿 Wachsend</option>
          <option value="harvest">🧺 Ernte</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Datum gesetzt</label>
        <input type="date" class="form-input" id="plant-date-input" value="${new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group">
        <label class="form-label">Notizen</label>
        <textarea class="form-input" id="plant-notes-input" placeholder="Optionale Notizen..." rows="2"></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" id="modal-cancel-btn">Abbrechen</button>
      <button class="btn btn-primary" id="modal-save-btn">Hinzufügen</button>
    </div>
  `;

  overlay.classList.remove('hidden');
  setTimeout(() => overlay.classList.add('visible'), 10);

  let selectedPlant = null;

  // Autocomplete
  const input = document.getElementById('plant-name-input');
  const results = document.getElementById('autocomplete-results');

  const evaluateWarnings = (plantName) => {
    const warningsDiv = document.getElementById('plant-warnings');
    warningsDiv.innerHTML = '';
    if (!plantName) return;
    
    const plant = getPlant(plantName);
    if (!plant) return;
    
    const currentPlantings = store.getPlantings(bedId);
    const activePlantings = currentPlantings.filter(p => p.status !== 'harvest');
    const historyPlantings = currentPlantings.filter(p => p.status === 'harvest');
    
    let html = '';
    
    const bed = store.getBed(bedId);
    
    // 1. Mischkultur (Bad Neighbors)
    if (plant.badNeighbors && plant.badNeighbors.length > 0) {
      const conflicts = activePlantings.filter(p => plant.badNeighbors.includes(p.name));
      if (conflicts.length > 0) {
        html += `<div style="background: rgba(239, 68, 68, 0.1); color: var(--color-danger); padding: 8px; border-radius: 4px; font-size: 12px; margin-bottom: 4px;">
          ⚠️ <strong>Schlechte Nachbarn:</strong> Verträgt sich nicht gut mit ${conflicts.map(c => c.name).join(', ')} im selben Beet.
        </div>`;
      }
    }
    
    // Good neighbors
    if (plant.goodNeighbors && plant.goodNeighbors.length > 0) {
      const friends = activePlantings.filter(p => plant.goodNeighbors.includes(p.name));
      if (friends.length > 0) {
        html += `<div style="background: rgba(74, 222, 128, 0.1); color: var(--color-success); padding: 8px; border-radius: 4px; font-size: 12px; margin-bottom: 4px;">
          💚 <strong>Gute Nachbarschaft:</strong> Verträgt sich super mit ${friends.map(f => f.name).join(', ')}.
        </div>`;
      }
    }
    
    // 2. Fruchtfolge (Heavy feeder on heavy feeder)
    if (plant.nutrition === 'stark') {
      const previousHeavyFeeders = historyPlantings.filter(p => {
        const oldPlant = getPlant(p.name);
        return oldPlant && oldPlant.nutrition === 'stark';
      });
      if (previousHeavyFeeders.length > 0) {
        html += `<div style="background: rgba(245, 158, 11, 0.1); color: var(--color-warning); padding: 8px; border-radius: 4px; font-size: 12px; margin-bottom: 4px;">
          🔄 <strong>Fruchtfolge beachten:</strong> Hier wuchsen zuvor bereits Starkzehrer (${previousHeavyFeeders.map(p => p.name).join(', ')}). Boden gut vorbereiten!
        </div>`;
      }
    }

    // 3. Bodenbeschaffenheit & Feuchtigkeit
    if (bed && bed.soil === 'sand' && plant.nutrition === 'stark') {
      html += `<div style="background: rgba(59, 130, 246, 0.1); color: var(--color-primary); padding: 8px; border-radius: 4px; font-size: 12px; margin-bottom: 4px;">
        ℹ️ <strong>Sandiger Boden:</strong> Starkzehrer wie ${plant.name} benötigen hier deutlich mehr Dünger und regelmäßiges Gießen.
      </div>`;
    }
    if (bed && bed.moisture === 'dry' && plant.category === 'Gemüse') {
      html += `<div style="background: rgba(245, 158, 11, 0.1); color: var(--color-warning); padding: 8px; border-radius: 4px; font-size: 12px; margin-bottom: 4px;">
        🏜️ <strong>Trockenzone:</strong> Gemüseanlagen benötigen in dieser ausgewiesenen Trockenzone wahrscheinlich zusätzliche Bewässerung!
      </div>`;
    }
    
    // 4. Sonnen- / Schattenanalyse
    if (bed && bed.sunlight) {
       const sunReq = plant.sun || (plant.category === 'Gemüse' ? 'sun' : 'partial');
       if (bed.sunlight === 'shade' && sunReq === 'sun') {
          html += `<div style="background: rgba(239, 68, 68, 0.1); color: var(--color-danger); padding: 8px; border-radius: 4px; font-size: 12px; margin-bottom: 4px;">
            🌑 <strong>Zu schattig:</strong> ${plant.name} benötigt viel Sonne, das Beet ist jedoch als schattig konfiguriert.
          </div>`;
       } else if (bed.sunlight === 'sun' && sunReq === 'shade') {
          html += `<div style="background: rgba(245, 158, 11, 0.1); color: var(--color-warning); padding: 8px; border-radius: 4px; font-size: 12px; margin-bottom: 4px;">
            ☀️ <strong>Vollsonne:</strong> ${plant.name} brennt in der direkten Sonne schnell aus. Halbschatten wäre besser.
          </div>`;
       }
    }
    
    warningsDiv.innerHTML = html;
  };

  input.addEventListener('input', () => {
    const query = input.value.trim();
    evaluateWarnings(query);
    const matches = searchPlants(query);
    if (matches.length > 0) {
      results.style.display = 'block';
      results.innerHTML = matches.map(p => `
        <div class="autocomplete-item" data-name="${p.name}" data-emoji="${p.emoji}" data-category="${p.category}">
          <span class="plant-emoji">${p.emoji}</span>
          <div class="plant-info">
            <div class="plant-name">${p.name}</div>
            <div class="plant-category">${p.category}</div>
          </div>
        </div>
      `).join('');

      results.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
          input.value = item.dataset.name;
          selectedPlant = {
            name: item.dataset.name,
            emoji: item.dataset.emoji,
            category: item.dataset.category,
          };
          evaluateWarnings(item.dataset.name);
          results.style.display = 'none';
        });
      });
    } else {
      results.style.display = 'none';
    }
  });

  input.addEventListener('blur', () => {
    setTimeout(() => { results.style.display = 'none'; }, 200);
  });

  // Close
  const closeModal = () => {
    overlay.classList.remove('visible');
    setTimeout(() => overlay.classList.add('hidden'), 250);
  };

  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Save
  document.getElementById('modal-save-btn').addEventListener('click', () => {
    const name = input.value.trim();
    if (!name) {
      input.style.borderColor = 'var(--color-danger)';
      return;
    }

    const plant = selectedPlant || getPlant(name) || { name, emoji: '🌱', category: '' };

    store.addPlanting({
      bedId,
      name: plant.name,
      emoji: plant.emoji,
      category: plant.category,
      status: document.getElementById('plant-status-select').value,
      datePlanted: document.getElementById('plant-date-input').value || null,
      notes: document.getElementById('plant-notes-input').value,
    });

    closeModal();
  });

  input.focus();
}
