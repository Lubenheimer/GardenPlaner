import { store } from '../core/Store.js';
import { getAllPlants, plants as systemPlants, monthNames } from '../data/plants.js';

export function renderCatalog() {
  const container = document.getElementById('catalog-content');
  if (!container) return;

  const allPlants = getAllPlants();
  
  // Sort alphabetically
  allPlants.sort((a, b) => a.name.localeCompare(b.name));

  container.innerHTML = `
    <div class="dashboard-section animate-in" style="animation-delay: 0.1s">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
        <h2>Pflanzenbibliothek (${allPlants.length})</h2>
        <button id="btn-new-custom-plant" class="btn primary">
          <span style="margin-right: 8px;">🌱</span> Eigene Pflanze erstellen
        </button>
      </div>
      
      <div class="catalog-grid">
        ${allPlants.map(p => `
          <div class="catalog-card" data-name="${p.name}">
            <div class="catalog-card-header">
              <span class="catalog-emoji">${p.emoji}</span>
              <div class="catalog-title">
                <h3>${p.name}</h3>
                <span class="catalog-category ${p.category.toLowerCase()}">${p.category}</span>
                ${p.isCustom ? `<span class="catalog-badge-custom">Eigene</span>` : ''}
              </div>
            </div>
            
            <div class="catalog-details">
              <div class="catalog-stat" title="Nährstoffbedarf">
                <span>🍽️</span> ${p.nutrition ? p.nutrition.charAt(0).toUpperCase() + p.nutrition.slice(1) : 'Unbekannt'}
              </div>
              <div class="catalog-stat" title="Pflanzabstand">
                <span>↔️</span> ${p.spacing ? p.spacing + ' cm' : '-'}
              </div>
              <div class="catalog-stat" title="Tage bis Ernte">
                <span>⏱️</span> ${p.daysToHarvest ? p.daysToHarvest + ' Tg' : '-'}
              </div>
              <div class="catalog-stat" title="Gießintervall">
                <span>💧</span> ${p.waterDays ? p.waterDays + ' Tg' : '-'}
              </div>
            </div>
            
            <div class="catalog-actions">
              <button class="icon-btn small edit-plant-btn" data-name="${p.name}" title="Bearbeiten">✏️</button>
              ${p.isCustom ? `
                <button class="icon-btn small delete-plant-btn" data-name="${p.name}" title="Löschen" style="color: var(--color-danger)">🗑️</button>
              ` : `
                <span style="font-size: 11px; color: var(--color-text-muted); padding: 4px;">System</span>
              `}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Bind Events
  document.getElementById('btn-new-custom-plant')?.addEventListener('click', () => {
    openPlantEditor();
  });

  document.querySelectorAll('.edit-plant-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const name = e.currentTarget.dataset.name;
      const plant = allPlants.find(p => p.name === name);
      if (plant) openPlantEditor(plant);
    });
  });

  document.querySelectorAll('.delete-plant-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const name = e.currentTarget.dataset.name;
      if (confirm(`Möchtest du "${name}" wirklich löschen?`)) {
        store.deleteCustomPlant(name);
        renderCatalog(); // Refresh
      }
    });
  });
}

function openPlantEditor(existingPlant = null) {
  const container = document.getElementById('modal-container');
  const overlay = document.getElementById('modal-overlay');

  const defaults = {
    name: '', emoji: '🌱', category: 'Gemüse', nutrition: 'mittel',
    spacing: 30, daysToHarvest: 60, waterDays: 3, fertilizeWeeks: 2,
    sowMonth: [4,5], harvestMonth: [7,8,9]
  };

  const p = existingPlant || defaults;
  const isEdit = !!existingPlant;
  
  // If editing a system plant, explain it will be saved as custom override
  const isSystemOverride = isEdit && !p.isCustom;

  container.innerHTML = `
    <div class="modal-header">
      <h2>${isEdit ? 'Pflanze bearbeiten' : 'Neue Pflanze'}</h2>
      <button class="icon-btn" id="close-modal">&times;</button>
    </div>
    <div class="modal-body">
      ${isSystemOverride ? `
        <div class="alert info" style="margin-bottom: 15px; padding: 10px; border-left: 3px solid var(--color-primary); background: var(--color-primary-soft)">
          Du bearbeitest eine <strong>System-Pflanze</strong>. Wenn du speicherst, 
          wird sie als eigene, angepasste Version in deiner Datenbank hinterlegt.
        </div>
      ` : ''}
      
      <div class="form-group">
        <label>Name</label>
        <input type="text" id="cp-name" value="${p.name}" class="form-control" placeholder="z.B. Tomate (Ochsenherz)">
      </div>
      
      <div style="display:flex; gap:10px;">
        <div class="form-group" style="flex: 1;">
          <label>Kategorie</label>
          <select id="cp-category" class="form-control">
            <option value="Gemüse" ${p.category==='Gemüse'?'selected':''}>Gemüse</option>
            <option value="Kräuter" ${p.category==='Kräuter'?'selected':''}>Kräuter</option>
            <option value="Obst" ${p.category==='Obst'?'selected':''}>Obst</option>
            <option value="Blumen" ${p.category==='Blumen'?'selected':''}>Blumen</option>
            <option value="Gründüngung" ${p.category==='Gründüngung'?'selected':''}>Gründüngung</option>
          </select>
        </div>
        <div class="form-group" style="width: 80px;">
          <label>Emoji</label>
          <input type="text" id="cp-emoji" value="${p.emoji}" class="form-control" style="text-align: center;">
        </div>
      </div>

      <div class="form-group">
        <label>Nährstoffbedarf (Fruchtfolge)</label>
        <select id="cp-nutrition" class="form-control">
          <option value="stark" ${p.nutrition==='stark'?'selected':''}>🔴 Starkzehrer</option>
          <option value="mittel" ${p.nutrition==='mittel'?'selected':''}>🟡 Mittelzehrer</option>
          <option value="schwach" ${p.nutrition==='schwach'?'selected':''}>🟢 Schwachzehrer</option>
          <option value="gruen" ${p.nutrition==='gruen'?'selected':''}>🌿 Gründüngung</option>
        </select>
      </div>

      <div style="display:flex; gap:10px;">
        <div class="form-group" style="flex: 1;">
          <label>Pflanzabstand (cm)</label>
          <input type="number" id="cp-spacing" value="${p.spacing}" class="form-control">
        </div>
        <div class="form-group" style="flex: 1;">
          <label>Ernte nach X Tagen</label>
          <input type="number" id="cp-days" value="${p.daysToHarvest}" class="form-control">
        </div>
      </div>

      <div style="display:flex; gap:10px;">
        <div class="form-group" style="flex: 1;">
          <label>Gieß-Intervall (Tage)</label>
          <input type="number" id="cp-water" value="${p.waterDays}" class="form-control">
        </div>
        <div class="form-group" style="flex: 1;">
          <label>Dünge-Intervall (Wochen)</label>
          <input type="number" id="cp-fert" value="${p.fertilizeWeeks}" class="form-control">
        </div>
      </div>

      <div class="form-group" style="margin-top: 15px;">
        <button id="save-custom-plant" class="btn primary" style="width:100%">Pflanze speichern</button>
      </div>
    </div>
  `;

  overlay.classList.remove('hidden');

  document.getElementById('close-modal').onclick = () => overlay.classList.add('hidden');
  
  document.getElementById('save-custom-plant').onclick = () => {
    const name = document.getElementById('cp-name').value.trim();
    if (!name) return alert('Name fehlt!');

    const newPlant = {
      name: name,
      emoji: document.getElementById('cp-emoji').value || '🌱',
      category: document.getElementById('cp-category').value,
      nutrition: document.getElementById('cp-nutrition').value,
      spacing: parseInt(document.getElementById('cp-spacing').value, 10) || 30,
      daysToHarvest: parseInt(document.getElementById('cp-days').value, 10) || 60,
      waterDays: parseInt(document.getElementById('cp-water').value, 10) || 3,
      fertilizeWeeks: parseInt(document.getElementById('cp-fert').value, 10) || 2,
    };

    if (isEdit) {
      store.updateCustomPlant(p.name, newPlant);
    } else {
      store.addCustomPlant(newPlant);
    }
    
    overlay.classList.add('hidden');
    renderCatalog();
  };
}
