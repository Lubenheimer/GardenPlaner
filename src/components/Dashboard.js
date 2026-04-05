/**
 * Dashboard — Overview of the garden
 */
import { store } from '../core/Store.js';
import { statusLabels, statusEmojis, formatDate } from '../utils/helpers.js';
import { getSowingPlants, getHarvestPlants, monthNames } from '../data/plants.js';
export function renderDashboard() {
  const container = document.getElementById('dashboard-content');
  const beds = store.getBeds();
  const plantings = store.getPlantings();
  const photos = store.getPhotos();
  const expenses = store.getExpenses();
  const currentMonth = new Date().getMonth() + 1;
  const sortedBeds = [...beds].sort((a,b) => {
    if(a.levelId !== b.levelId) return (a.levelId||'').localeCompare(b.levelId||'');
    return a.name.localeCompare(b.name);
  });

  const totalArea = beds.reduce((sum, b) => sum + (b.width * b.height / 10000), 0);
  
  // Collect all plantings
  const allPlantings = [];
  beds.forEach(b => {
    if (b.plantings) {
      b.plantings.forEach(p => {
        allPlantings.push({ ...p, bedName: b.name });
      });
    }
  });

  // Sort by date (closest first)
  const today = new Date();
  allPlantings.sort((a,b) => {
    const da = new Date(today.getFullYear(), a.month - 1, 15);
    const db = new Date(today.getFullYear(), b.month - 1, 15);
    return da - db;
  });

  const sowingNow = getSowingPlants(currentMonth);
  const harvestNow = getHarvestPlants(currentMonth);

  const statusCounts = { planned: 0, planted: 0, growing: 0, harvest: 0 };
  plantings.forEach(p => {
    if (statusCounts[p.status] !== undefined) statusCounts[p.status]++;
  });

  container.innerHTML = `
    <!-- Stats Row -->
    <div class="dashboard-stats animate-in" style="display: flex; gap: var(--space-md); flex-wrap: wrap;">
      <div class="stat-card" style="flex: 1; min-width: 150px;">
        <div class="stat-icon" style="background: var(--color-primary-soft); color: var(--color-primary);">🌱</div>
        <div class="stat-value">${beds.length}</div>
        <div class="stat-label">Elemente</div>
      </div>
      <div class="stat-card" style="flex: 1; min-width: 150px;">
        <div class="stat-icon" style="background: var(--color-primary-soft); color: var(--color-primary);">📏</div>
        <div class="stat-value">${totalArea.toFixed(1)}</div>
        <div class="stat-label">Fläche (m²)</div>
      </div>
      <div class="stat-card" style="flex: 1; min-width: 150px;">
        <div class="stat-icon" style="background: var(--color-primary-soft); color: var(--color-primary);">📸</div>
        <div class="stat-value">${photos.length}</div>
        <div class="stat-label">Fotos</div>
      </div>
    </div>

    <!-- Status overview -->
    ${plantings.length > 0 ? `
      <div class="dashboard-section animate-in">
        <h2>Status-Übersicht</h2>
        <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
          ${Object.entries(statusCounts).filter(([,v]) => v > 0).map(([status, count]) => `
            <div style="flex: 1; min-width: 120px; padding: var(--space-md); border-radius: var(--radius-md); border: var(--glass-border); text-align: center;">
              <div style="font-size: 24px; margin-bottom: var(--space-xs);">${statusEmojis[status]}</div>
              <div style="font-size: var(--font-size-lg); font-weight: 700;">${count}</div>
              <div style="font-size: var(--font-size-xs); color: var(--color-text-muted);">${statusLabels[status]}</div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Sowing suggestions -->
    <div class="dashboard-section animate-in">
      <h2>🌱 Jetzt aussäen (${monthNames[currentMonth - 1]})</h2>
      <div style="display: flex; flex-wrap: wrap; gap: var(--space-sm);">
        ${sowingNow.slice(0, 12).map(p => `
          <span class="badge badge-planted" style="font-size: var(--font-size-sm); padding: 4px 12px;">
            ${p.emoji} ${p.name}
          </span>
        `).join('')}
      </div>
    </div>

    <!-- Harvest suggestions -->
    <div class="dashboard-section animate-in">
      <h2>🧺 Jetzt ernten (${monthNames[currentMonth - 1]})</h2>
      <div style="display: flex; flex-wrap: wrap; gap: var(--space-sm);">
        ${harvestNow.length > 0 ? harvestNow.slice(0, 12).map(p => `
          <span class="badge badge-harvest" style="font-size: var(--font-size-sm); padding: 4px 12px;">
            ${p.emoji} ${p.name}
          </span>
        `).join('') : '<span style="color: var(--color-text-muted); font-size: var(--font-size-sm);">Keine Erntevorschläge für diesen Monat</span>'}
      </div>
    </div>

    <!-- Recent plantings -->
    ${plantings.length > 0 ? `
      <div class="dashboard-section animate-in">
        <h2>Letzte Pflanzungen</h2>
        <div class="planting-list">
          ${plantings.slice(-5).reverse().map(p => {
            const bed = store.getBed(p.bedId);
            return `
              <div class="planting-item">
                <span class="planting-emoji">${p.emoji}</span>
                <div class="planting-info">
                  <div class="planting-name">${p.name}</div>
                  <div class="planting-date">${bed ? bed.name : 'Unbekanntes Beet'} • ${formatDate(p.datePlanted)}</div>
                </div>
                <span class="badge badge-${p.status}">${statusEmojis[p.status]} ${statusLabels[p.status]}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : `
      <div class="dashboard-section animate-in">
        <div class="empty-state">
          <div class="empty-icon">🌻</div>
          <div class="empty-text">Lege Beete an und füge Pflanzungen hinzu, um dein Dashboard zu füllen!</div>
        </div>
      </div>
    `}

    <!-- Vorbereitungen -->
    ${allPlantings.some(p => p.status === 'planned') ? `
      <div class="dashboard-section animate-in">
        <h2>📋 Vorbereitungen (Diesen Monat)</h2>
        <div class="list-group" style="display: flex; flex-direction: column; gap: 8px;">
          ${allPlantings.filter(p => p.status === 'planned').map(p => `
            <div class="list-item" style="display: flex; gap: 12px; align-items: center; padding: 12px; background: var(--bg-surface); border: var(--glass-border); border-radius: var(--radius-md);">
              <span style="font-size: 20px;">🛒</span>
              <div>
                <div style="font-weight: 600;">Saatgut/Setzlinge besorgen: ${p.emoji} ${p.name}</div>
                <div style="font-size: 12px; color: var(--color-text-muted);">Geplant für Beet: ${p.bedName}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Budget / Expenses -->
    <div class="dashboard-section animate-in">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
         <h2 style="margin: 0;">💸 Budget & Ausgaben</h2>
         <button id="add-expense-btn" class="btn btn-primary btn-sm" style="padding: 4px 12px; font-size: 12px;">+ Neue Ausgabe</button>
      </div>
      
      <div class="stat-card" style="margin-bottom: 16px; display: flex; align-items: center; padding: 12px;">
        <div class="stat-icon" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-right: 16px;">💶</div>
        <div>
          <div class="stat-value" style="font-size: 24px;">${expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)} €</div>
          <div class="stat-label">Gesamtausgaben</div>
        </div>
      </div>

      ${expenses.length > 0 ? `
        <div class="planting-list">
          ${expenses.slice(-5).reverse().map(e => `
            <div class="planting-item">
              <span class="planting-emoji">${e.category === 'seeds' ? '🌱' : e.category === 'soil' ? '🟤' : e.category === 'tools' ? '🛠️' : '🛒'}</span>
              <div class="planting-info">
                <div class="planting-name">${e.name}</div>
                <div class="planting-date">${formatDate(e.date)}</div>
              </div>
              <span class="badge" style="background: rgba(239, 68, 68, 0.1); color: #ef4444;">${e.amount.toFixed(2)} €</span>
            </div>
          `).join('')}
        </div>
      ` : '<div class="empty-state" style="padding: 16px;"><div class="empty-text">Noch keine Ausgaben erfasst.</div></div>'}
    </div>
  `;

  // Bind Events for Dashboard
  setTimeout(() => {
    document.getElementById('add-expense-btn')?.addEventListener('click', () => {
      const name = prompt('Wofür wurde Geld ausgegeben? (z.B. Blumenerde)');
      if (!name) return;
      const amountStr = prompt('Wie viel hat es gekostet? (z.B. 14.50)');
      if (!amountStr) return;
      
      const amount = parseFloat(amountStr.replace(',', '.'));
      if (isNaN(amount)) {
        alert('Ungültiger Betrag!');
        return;
      }
      
      let category = 'misc';
      const n = name.toLowerCase();
      if (n.includes('samen') || n.includes('saat') || n.includes('pflanze')) category = 'seeds';
      if (n.includes('erde') || n.includes('dünger') || n.includes('kompost')) category = 'soil';
      if (n.includes('werkzeug') || n.includes('spaten') || n.includes('schere')) category = 'tools';
      
      store.addExpense({ name, amount, category });
      renderDashboard(); // Re-render to show new expense
    });
  }, 0);
}
