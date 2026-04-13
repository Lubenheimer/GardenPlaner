import { store } from '../core/Store.js';
import { monthNames } from '../data/plants.js';

export function renderStatistics() {
  const container = document.getElementById('statistics-content');
  if (!container) return;

  const currentSeason = store.getCurrentSeason();
  const availableSeasons = store.getAvailableSeasons();

  // Selected year from previously rendered dropdown, or current season
  const selectedYear = container.dataset.selectedYear || currentSeason;
  container.dataset.selectedYear = selectedYear;

  _renderStatisticsForYear(container, selectedYear, availableSeasons, currentSeason);
}

function _renderStatisticsForYear(container, selectedYear, availableSeasons, currentSeason) {
  const garden   = store.getGarden();
  const beds     = store.getBeds();

  // Filter ALL plantings (incl. archived) by selected year
  const plantings = store.getPlantingsBySeason(selectedYear);
  // Active plantings (non-archived) regardless of year — for status grid
  const activePlantings = store.getPlantings();

  const harvests = (store.getHarvests ? store.getHarvests() : (store._active?.()?.harvests || []))
    .filter(h => {
      const d = h.date ? new Date(h.date) : null;
      return d && String(d.getFullYear()) === String(selectedYear);
    });

  const expenses = store.getExpenses()
    .filter(e => {
      const d = e.date ? new Date(e.date) : null;
      return d && String(d.getFullYear()) === String(selectedYear);
    });

  const tasks = store.getTasks();

  // ── Ernte-Auswertung (nach Pflanze aggregiert) ─────────────────
  const harvestByPlant = {};
  harvests.forEach(h => {
    const key = h.plantName || 'Unbekannt';
    if (!harvestByPlant[key]) harvestByPlant[key] = { emoji: h.plantEmoji || '🌱', total: 0, count: 0, unit: h.unit || 'kg' };
    harvestByPlant[key].total += parseFloat(h.amount) || 0;
    harvestByPlant[key].count++;
  });
  const harvestEntries = Object.entries(harvestByPlant).sort((a, b) => b[1].total - a[1].total);

  // ── Ausgaben nach Monat ────────────────────────────────────────
  const expByMonth = Array(12).fill(0);
  expenses.forEach(e => {
    const d = new Date(e.date);
    if (!isNaN(d)) expByMonth[d.getMonth()] += parseFloat(e.amount) || 0;
  });
  const totalExpenses = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  // ── Ausgaben nach Kategorie ────────────────────────────────────
  const catEmoji = { seeds: '🌱', soil: '🪴', tools: '🔧', misc: '📦' };
  const catLabels = { seeds: 'Saatgut', soil: 'Erde/Dünger', tools: 'Werkzeug', misc: 'Sonstiges' };
  const expByCat = {};
  expenses.forEach(e => {
    const cat = e.category || 'misc';
    if (!expByCat[cat]) expByCat[cat] = 0;
    expByCat[cat] += parseFloat(e.amount) || 0;
  });

  // ── Pflanzungen nach Status ────────────────────────────────────
  const statusCounts = { planned: 0, planted: 0, growing: 0, harvest: 0 };
  const statusLabels = { planned: '📋 Geplant', planted: '🌱 Gesetzt', growing: '🌿 Wachsend', harvest: '🧺 Erntebereit' };
  plantings.forEach(p => { if (statusCounts[p.status] !== undefined) statusCounts[p.status]++; });

  // ── Pflanzungen nach Kategorie ─────────────────────────────────
  const plantByCat = {};
  plantings.forEach(p => {
    const cat = p.category || 'Sonstiges';
    if (!plantByCat[cat]) plantByCat[cat] = 0;
    plantByCat[cat]++;
  });

  // ── Tasks ──────────────────────────────────────────────────────
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks     = tasks.length;

  // ── Render ─────────────────────────────────────────────────────
  const isCurrentSeason = String(selectedYear) === String(currentSeason);
  container.innerHTML = `
    <div style="padding: 0 0 60px 0;">

      <!-- Season Selector Bar -->
      <div class="stats-season-bar animate-in" style="animation-delay:0s">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <span style="font-size:13px;color:var(--color-text-muted);font-weight:500">Saison:</span>
          <div class="stats-season-tabs">
            ${availableSeasons.map(y => `
              <button class="stats-season-tab${String(y) === String(selectedYear) ? ' active' : ''}" data-year="${y}">
                ${y}${String(y) === String(currentSeason) ? ' <span class="stats-season-live">Aktiv</span>' : ''}
              </button>`).join('')}
          </div>
        </div>
        ${!isCurrentSeason ? `
          <span style="font-size:12px;color:var(--color-text-muted)">
            📁 Archiv-Ansicht für Saison ${selectedYear}
          </span>` : ''}
      </div>

      <!-- KPI Row -->
      <div class="stats-kpi-row animate-in" style="animation-delay:0.05s">
        ${kpiCard('🌿', 'Beete', beds.length, '')}
        ${kpiCard('🌱', 'Pflanzungen', plantings.length, '')}
        ${kpiCard('🧺', 'Ernten', harvests.length, 'Einträge')}
        ${kpiCard('💸', 'Ausgaben', totalExpenses.toFixed(2), '€')}
        ${kpiCard('✅', 'Aufgaben', `${completedTasks}/${totalTasks}`, 'erledigt')}
      </div>

      <div class="stats-grid animate-in" style="animation-delay:0.1s">

        <!-- Ernte nach Pflanze -->
        <div class="dashboard-section">
          <h2>🧺 Ernte-Übersicht</h2>
          ${harvestEntries.length === 0
            ? `<p class="empty-state-text">Noch keine Ernte erfasst.</p>`
            : `<div class="stats-bar-chart">
                ${harvestEntries.slice(0, 8).map(([name, d]) => {
                  const max = harvestEntries[0][1].total || 1;
                  const pct = Math.round((d.total / max) * 100);
                  return `
                    <div class="stats-bar-row">
                      <span class="stats-bar-label">${d.emoji} ${name}</span>
                      <div class="stats-bar-track">
                        <div class="stats-bar-fill" style="width:${pct}%"></div>
                      </div>
                      <span class="stats-bar-value">${d.total.toFixed(1)} ${d.unit}</span>
                    </div>`;
                }).join('')}
              </div>`}
        </div>

        <!-- Ausgaben nach Monat -->
        <div class="dashboard-section">
          <h2>💸 Ausgaben nach Monat</h2>
          ${expenses.length === 0
            ? `<p class="empty-state-text">Noch keine Ausgaben erfasst.</p>`
            : `<div class="stats-column-chart">
                ${expByMonth.map((val, i) => {
                  const max = Math.max(...expByMonth, 1);
                  const pct = Math.round((val / max) * 100);
                  return `
                    <div class="stats-col">
                      <div class="stats-col-bar" title="${val.toFixed(2)} €">
                        <div class="stats-col-fill" style="height:${pct}%"></div>
                      </div>
                      <span class="stats-col-label">${monthNames[i].slice(0,3)}</span>
                      ${val > 0 ? `<span class="stats-col-value">${val.toFixed(0)}€</span>` : ''}
                    </div>`;
                }).join('')}
              </div>
              <p style="text-align:right;font-size:12px;color:var(--color-text-muted);margin-top:8px">Gesamt: <strong>${totalExpenses.toFixed(2)} €</strong></p>`}
        </div>

        <!-- Ausgaben nach Kategorie -->
        <div class="dashboard-section">
          <h2>📂 Ausgaben nach Kategorie</h2>
          ${Object.keys(expByCat).length === 0
            ? `<p class="empty-state-text">Noch keine Ausgaben.</p>`
            : `<div class="stats-donut-list">
                ${Object.entries(expByCat).sort((a,b)=>b[1]-a[1]).map(([cat, amt]) => {
                  const pct = totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0;
                  return `
                    <div class="stats-donut-row">
                      <span>${catEmoji[cat] || '📦'} ${catLabels[cat] || cat}</span>
                      <div class="stats-donut-bar">
                        <div class="stats-donut-fill" style="width:${pct}%"></div>
                      </div>
                      <span class="stats-bar-value">${amt.toFixed(2)} € <small style="opacity:0.6">(${pct}%)</small></span>
                    </div>`;
                }).join('')}
              </div>`}
        </div>

        <!-- Pflanzungen nach Status -->
        <div class="dashboard-section">
          <h2>🌱 Pflanzungen nach Status</h2>
          <div class="stats-status-grid">
            ${Object.entries(statusCounts).map(([s, c]) => `
              <div class="stats-status-card status-${s}">
                <span class="stats-status-count">${c}</span>
                <span class="stats-status-label">${statusLabels[s]}</span>
              </div>`).join('')}
          </div>
        </div>

        <!-- Pflanzungen nach Kategorie -->
        <div class="dashboard-section">
          <h2>🥦 Pflanzarten-Verteilung</h2>
          ${Object.keys(plantByCat).length === 0
            ? `<p class="empty-state-text">Noch keine Pflanzungen.</p>`
            : `<div class="stats-bar-chart">
                ${Object.entries(plantByCat).sort((a,b)=>b[1]-a[1]).map(([cat, cnt]) => {
                  const max = Math.max(...Object.values(plantByCat), 1);
                  const pct = Math.round((cnt / max) * 100);
                  return `
                    <div class="stats-bar-row">
                      <span class="stats-bar-label">${cat}</span>
                      <div class="stats-bar-track">
                        <div class="stats-bar-fill stats-bar-secondary" style="width:${pct}%"></div>
                      </div>
                      <span class="stats-bar-value">${cnt}</span>
                    </div>`;
                }).join('')}
              </div>`}
        </div>

        <!-- Aufgaben-Fortschritt -->
        <div class="dashboard-section">
          <h2>✅ Aufgaben-Fortschritt</h2>
          ${totalTasks === 0
            ? `<p class="empty-state-text">Noch keine Aufgaben angelegt.</p>`
            : `<div class="stats-progress-wrap">
                <div class="stats-progress-header">
                  <span>${completedTasks} von ${totalTasks} erledigt</span>
                  <strong>${Math.round((completedTasks/totalTasks)*100)}%</strong>
                </div>
                <div class="stats-progress-bar">
                  <div class="stats-progress-fill" style="width:${Math.round((completedTasks/totalTasks)*100)}%"></div>
                </div>
                <div class="stats-task-pills">
                  <span class="stats-pill done">✓ ${completedTasks} erledigt</span>
                  <span class="stats-pill open">⏳ ${totalTasks - completedTasks} offen</span>
                </div>
              </div>`}
        </div>

      </div>

      <!-- PDF Export -->
      <div class="stats-export-bar animate-in" style="animation-delay:0.2s">
        <span>Gartenplan exportieren</span>
        <button id="btn-print-gardenplan" class="btn primary">
          🖨️ Gartenplan drucken / als PDF speichern
        </button>
      </div>

    </div>
  `;

  // Season tab switching
  container.querySelectorAll('.stats-season-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      container.dataset.selectedYear = btn.dataset.year;
      _renderStatisticsForYear(container, btn.dataset.year, availableSeasons, currentSeason);
    });
  });

  // Print button
  document.getElementById('btn-print-gardenplan')?.addEventListener('click', printGardenPlan);
}

function kpiCard(icon, label, value, unit) {
  return `
    <div class="stats-kpi-card">
      <span class="stats-kpi-icon">${icon}</span>
      <div class="stats-kpi-body">
        <div class="stats-kpi-value">${value}<small>${unit}</small></div>
        <div class="stats-kpi-label">${label}</div>
      </div>
    </div>`;
}

// ─────────────────────────────────────────────────────────────────
//  PDF / Print
// ─────────────────────────────────────────────────────────────────
function printGardenPlan() {
  const garden   = store.getGarden();
  const beds     = store.getBeds();
  const plantings= store.getPlantings();
  const harvests = store.getHarvests ? store.getHarvests() : (store._active?.()?.harvests || []);
  const expenses = store.getExpenses();

  // Capture the current canvas as image
  const canvas = document.getElementById('garden-canvas');
  let canvasDataUrl = '';
  try { canvasDataUrl = canvas?.toDataURL('image/png') || ''; } catch(e) {}

  const totalExpenses = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  // Group plantings by bed
  const plantingsByBed = {};
  plantings.forEach(p => {
    if (!plantingsByBed[p.bedId]) plantingsByBed[p.bedId] = [];
    plantingsByBed[p.bedId].push(p);
  });

  const statusLabel = { planned: 'Geplant', planted: 'Gesetzt', growing: 'Wachsend', harvest: 'Ernte' };

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Gartenplan – ${garden.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 12px;
      color: #1a1a1a;
      background: #fff;
      padding: 20mm 18mm;
    }
    h1 { font-size: 22px; color: #4a6741; margin-bottom: 4px; }
    h2 { font-size: 14px; color: #4a6741; margin: 20px 0 8px; border-bottom: 2px solid #e8f0e4; padding-bottom: 4px; }
    h3 { font-size: 12px; color: #333; margin: 12px 0 4px; }
    .meta { color: #666; font-size: 11px; margin-bottom: 20px; }
    .canvas-img { width: 100%; max-height: 220px; object-fit: contain; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 20px; background: #f9f9f9; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { background: #e8f0e4; color: #2d4a25; text-align: left; padding: 5px 8px; font-size: 11px; }
    td { padding: 5px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
    td.num { text-align: right; }
    .bed-name { font-weight: 700; color: #333; }
    .status-planned { color: #64748b; }
    .status-planted { color: #16a34a; }
    .status-growing { color: #15803d; }
    .status-harvest { color: #ca8a04; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 12px 0 24px; }
    .kpi { background: #f0f7ee; border-radius: 6px; padding: 10px; text-align: center; }
    .kpi-val { font-size: 22px; font-weight: 800; color: #2d6a1a; }
    .kpi-lbl { font-size: 10px; color: #555; margin-top: 2px; }
    .footer { margin-top: 30px; font-size: 10px; color: #aaa; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
    @media print {
      body { padding: 12mm 15mm; }
      button { display: none !important; }
      @page { size: A4; margin: 12mm; }
    }
  </style>
</head>
<body>

  <h1>🌱 ${garden.name}</h1>
  <p class="meta">Erstellt: ${new Date().toLocaleDateString('de-DE', { day:'2-digit', month:'long', year:'numeric' })} · GartenPlaner V2</p>

  <!-- Gartenplan Canvas -->
  ${canvasDataUrl
    ? `<img class="canvas-img" src="${canvasDataUrl}" alt="Gartenplan">`
    : `<div class="canvas-img" style="display:flex;align-items:center;justify-content:center;color:#aaa;">Kein Canvas-Snapshot verfügbar</div>`}

  <!-- KPI Zusammenfassung -->
  <div class="summary-grid">
    <div class="kpi"><div class="kpi-val">${beds.length}</div><div class="kpi-lbl">Beete & Objekte</div></div>
    <div class="kpi"><div class="kpi-val">${plantings.length}</div><div class="kpi-lbl">Pflanzungen</div></div>
    <div class="kpi"><div class="kpi-val">${harvests.length}</div><div class="kpi-lbl">Ernten</div></div>
    <div class="kpi"><div class="kpi-val">${totalExpenses.toFixed(2)} €</div><div class="kpi-lbl">Ausgaben</div></div>
  </div>

  <!-- Pflanzplan nach Beet -->
  <h2>🌿 Pflanzplan nach Beet</h2>
  ${beds.map(bed => {
    const bPlantings = plantingsByBed[bed.id] || [];
    if (bPlantings.length === 0) return '';
    const area = bed.type === 'circle'
      ? `∅ ca. ${(2 * Math.PI * Math.pow(bed.width / 2 / 100, 2)).toFixed(1)} m²`
      : `${(bed.width/100).toFixed(1)} m × ${(bed.height/100).toFixed(1)} m`;
    return `
      <h3>📦 ${bed.name} <small style="font-weight:400;color:#888">(${area})</small></h3>
      <table>
        <thead><tr><th>Pflanze</th><th>Sorte</th><th>Anzahl</th><th>Gepflanzt</th><th>Ernte erwartet</th><th>Status</th></tr></thead>
        <tbody>
          ${bPlantings.map(p => `
            <tr>
              <td>${p.emoji} ${p.name}</td>
              <td>${p.variety || '—'}</td>
              <td class="num">${p.quantity || '—'}</td>
              <td>${p.datePlanted ? new Date(p.datePlanted).toLocaleDateString('de-DE') : '—'}</td>
              <td>${p.dateHarvestExpected ? new Date(p.dateHarvestExpected).toLocaleDateString('de-DE') : '—'}</td>
              <td class="status-${p.status}">${statusLabel[p.status] || p.status}</td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  }).join('')}

  <!-- Ernte-Protokoll -->
  ${harvests.length > 0 ? `
  <h2>🧺 Ernte-Protokoll</h2>
  <table>
    <thead><tr><th>Pflanze</th><th>Menge</th><th>Datum</th><th>Notizen</th></tr></thead>
    <tbody>
      ${harvests.map(h => `
        <tr>
          <td>${h.plantEmoji || '🌱'} ${h.plantName}</td>
          <td class="num">${h.amount} ${h.unit}</td>
          <td>${h.date ? new Date(h.date).toLocaleDateString('de-DE') : '—'}</td>
          <td>${h.notes || '—'}</td>
        </tr>`).join('')}
    </tbody>
  </table>` : ''}

  <!-- Ausgaben -->
  ${expenses.length > 0 ? `
  <h2>💸 Ausgaben</h2>
  <table>
    <thead><tr><th>Bezeichnung</th><th>Kategorie</th><th>Datum</th><th class="num">Betrag</th></tr></thead>
    <tbody>
      ${expenses.map(e => `
        <tr>
          <td>${e.name}</td>
          <td>${e.category || '—'}</td>
          <td>${e.date ? new Date(e.date).toLocaleDateString('de-DE') : '—'}</td>
          <td class="num"><strong>${parseFloat(e.amount).toFixed(2)} €</strong></td>
        </tr>`).join('')}
      <tr style="background:#f0f7ee"><td colspan="3"><strong>Gesamt</strong></td><td class="num"><strong>${totalExpenses.toFixed(2)} €</strong></td></tr>
    </tbody>
  </table>` : ''}

  <div class="footer">
    Gedruckt am ${new Date().toLocaleString('de-DE')} · GartenPlaner V2 – Dein digitaler Gartenassistent
  </div>
</body>
</html>`);

  printWindow.document.close();
  printWindow.addEventListener('load', () => {
    setTimeout(() => printWindow.print(), 400);
  });
}
