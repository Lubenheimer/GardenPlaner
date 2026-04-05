/**
 * Calendar — Monthly view + Jahres-Gantt (Saison-Übersicht)
 */
import { store } from '../core/Store.js';
import { monthNames, getPlant } from '../data/plants.js';
import { statusEmojis } from '../utils/helpers.js';

let currentYear  = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let calView = 'month'; // 'month' | 'gantt'

// ── Hilfsfunktion: In welchen Monaten ist die Phase aktiv? ────────
// Gibt ein Array [1..12] der Monate zurück, die zur Phase gehören.
function getPhaseMonths(plant) {
  const sow     = plant.sowMonth     || [];
  const harvest = plant.harvestMonth || [];

  // Säen-Phase
  const sowSet = new Set(sow);

  // Ernte-Phase
  const harvestSet = new Set(harvest);

  // Wachstums-Phase: Monate zwischen letztem Sämonat und erstem Erntemonat
  const sowEnd   = sow.length     ? Math.max(...sow)     : null;
  const hvStart  = harvest.length ? Math.min(...harvest) : null;
  const growSet  = new Set();
  if (sowEnd && hvStart && hvStart > sowEnd) {
    for (let m = sowEnd + 1; m < hvStart; m++) growSet.add(m);
  }

  return { sowSet, growSet, harvestSet };
}

// ── Gantt-Ansicht ─────────────────────────────────────────────────
function renderGantt() {
  const plantings = store.getPlantings();
  const nowMonth  = new Date().getMonth() + 1; // 1-12

  // Pflanzen mit Katalog-Eintrag filtern und nach Beet gruppieren
  const bedGroups = {};
  for (const p of plantings) {
    const plant = getPlant(p.name);
    if (!plant) continue; // Kein Katalogeintrag → skip
    const bed = store.getBed(p.bedId);
    const bedName = bed ? bed.name : 'Kein Beet';
    if (!bedGroups[bedName]) bedGroups[bedName] = [];
    // Duplikate innerhalb eines Beets überspringen
    if (!bedGroups[bedName].find(x => x.name === p.name)) {
      bedGroups[bedName].push({ ...plant, planting: p });
    }
  }

  const monthAbbr = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];

  // Header
  const header = `
    <div class="gantt-header">
      <div class="gantt-header-label">Pflanze</div>
      ${monthAbbr.map((m, i) => `
        <div class="gantt-month-label ${i + 1 === nowMonth ? 'current' : ''}">${m}</div>
      `).join('')}
    </div>
  `;

  // Rows
  let rows = '';
  const bedNames = Object.keys(bedGroups);

  if (bedNames.length === 0) {
    return `
      <div class="empty-state" style="padding: var(--space-2xl) 0;">
        <div class="empty-icon">🌱</div>
        <div class="empty-text">Noch keine Pflanzen aus dem Katalog gepflanzt.<br>
          Füge Pflanzen zu deinen Beeten hinzu, um den Jahresplan zu sehen.</div>
      </div>
    `;
  }

  for (const bedName of bedNames) {
    const plants = bedGroups[bedName];
    rows += `<div class="gantt-bed-header">📦 ${bedName}</div>`;

    for (const plant of plants) {
      const { sowSet, growSet, harvestSet } = getPhaseMonths(plant);

      const cells = Array.from({ length: 12 }, (_, i) => {
        const m = i + 1;
        const isCurrent = m === nowMonth;
        let barHtml = '';

        if (sowSet.has(m)) {
          const isStart = !sowSet.has(m - 1);
          const isEnd   = !sowSet.has(m + 1) && !growSet.has(m + 1) && !harvestSet.has(m + 1);
          const cls = isStart && isEnd ? 'range-only' : isStart ? 'range-start' : isEnd ? 'range-end' : '';
          barHtml = `<div class="gantt-bar phase-sow ${cls}" title="Säen"></div>`;
        } else if (growSet.has(m)) {
          const isStart = !sowSet.has(m - 1) && !growSet.has(m - 1);
          const isEnd   = !growSet.has(m + 1) && !harvestSet.has(m + 1);
          const cls = isStart && isEnd ? 'range-only' : isStart ? 'range-start' : isEnd ? 'range-end' : '';
          barHtml = `<div class="gantt-bar phase-grow ${cls}" title="Wachsen"></div>`;
        } else if (harvestSet.has(m)) {
          const isStart = !growSet.has(m - 1) && !harvestSet.has(m - 1) && !sowSet.has(m - 1);
          const isEnd   = !harvestSet.has(m + 1);
          const cls = isStart && isEnd ? 'range-only' : isStart ? 'range-start' : isEnd ? 'range-end' : '';
          barHtml = `<div class="gantt-bar phase-harvest ${cls}" title="Ernte"></div>`;
        }

        return `<div class="gantt-cell ${isCurrent ? 'current-month' : ''}">${barHtml}</div>`;
      }).join('');

      rows += `
        <div class="gantt-row">
          <div class="gantt-plant-label">
            <span class="plant-emoji">${plant.emoji}</span>
            <span>${plant.name}</span>
          </div>
          ${cells}
        </div>
      `;
    }
  }

  const legend = `
    <div class="gantt-legend">
      <span><span class="gantt-legend-dot" style="background:var(--color-accent)"></span>Säen</span>
      <span><span class="gantt-legend-dot" style="background:var(--color-primary);opacity:0.7"></span>Wachsen</span>
      <span><span class="gantt-legend-dot" style="background:var(--color-success)"></span>Ernte</span>
      <span style="margin-left:auto; background:var(--color-primary-soft); padding: 2px 8px; border-radius: 4px; font-size: 11px; color:var(--color-primary);">▌ = Aktueller Monat</span>
    </div>
  `;

  return `${legend}${header}${rows}`;
}

// ── Monatsansicht (bestehend) ─────────────────────────────────────
function renderMonthView() {
  const plantings = store.getPlantings();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay  = new Date(currentYear, currentMonth + 1, 0);
  const startDayOfWeek = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const today = new Date();
  const isToday = (d) => d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  const eventsByDate = {};
  for (const p of plantings) {
    if (p.datePlanted) {
      const d = new Date(p.datePlanted);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const key = d.getDate();
        if (!eventsByDate[key]) eventsByDate[key] = [];
        eventsByDate[key].push(p);
      }
    }
  }

  const dayHeaders = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  let cells = '';
  for (const dh of dayHeaders) cells += `<div class="calendar-day-header">${dh}</div>`;

  const prevMonth = new Date(currentYear, currentMonth, 0);
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    cells += `<div class="calendar-day other-month"><span class="day-number">${prevMonth.getDate() - i}</span></div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const events = eventsByDate[d] || [];
    cells += `
      <div class="calendar-day ${isToday(d) ? 'today' : ''}">
        <span class="day-number">${d}</span>
        ${events.slice(0, 3).map(p => `
          <div class="calendar-event" style="background: var(--color-primary-soft); color: var(--color-primary);">
            ${p.emoji} ${p.name}
          </div>
        `).join('')}
        ${events.length > 3 ? `<div style="font-size: var(--font-size-xs); color: var(--color-text-muted);">+${events.length - 3} mehr</div>` : ''}
      </div>
    `;
  }

  const totalCells = startDayOfWeek + daysInMonth;
  const remaining  = (7 - (totalCells % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    cells += `<div class="calendar-day other-month"><span class="day-number">${i}</span></div>`;
  }

  const upcomingPlantings = plantings
    .filter(p => p.datePlanted && new Date(p.datePlanted) >= new Date(today.toDateString()))
    .sort((a, b) => new Date(a.datePlanted) - new Date(b.datePlanted))
    .slice(0, 5);

  return `
    <div class="calendar-nav animate-in">
      <button class="btn btn-ghost" id="cal-prev">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>${monthNames[currentMonth]} ${currentYear}</h2>
      <button class="btn btn-ghost" id="cal-next">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>

    <div class="calendar-grid animate-in">${cells}</div>

    ${upcomingPlantings.length > 0 ? `
      <div class="dashboard-section animate-in" style="margin-top: var(--space-xl);">
        <h2>Anstehende Pflanzungen</h2>
        <div class="planting-list">
          ${upcomingPlantings.map(p => {
            const bed = store.getBed(p.bedId);
            const d   = new Date(p.datePlanted);
            return `
              <div class="planting-item">
                <span class="planting-emoji">${p.emoji}</span>
                <div class="planting-info">
                  <div class="planting-name">${p.name}</div>
                  <div class="planting-date">${bed ? bed.name + ' • ' : ''}${d.toLocaleDateString('de-DE')}</div>
                </div>
                <span class="badge badge-${p.status}">${statusEmojis[p.status]}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

// ── Haupt-Render ──────────────────────────────────────────────────
export function renderCalendar() {
  const container = document.getElementById('calendar-content');

  container.innerHTML = `
    <div class="gantt-wrapper">
      <!-- View Toggle -->
      <div class="gantt-view-toggle animate-in">
        <button class="toggle-btn ${calView === 'month' ? 'active' : ''}" id="cal-toggle-month">📅 Monatsansicht</button>
        <button class="toggle-btn ${calView === 'gantt' ? 'active' : ''}" id="cal-toggle-gantt">📊 Jahresplan</button>
      </div>

      <!-- Content -->
      <div id="cal-view-content">
        ${calView === 'month' ? renderMonthView() : renderGantt()}
      </div>
    </div>
  `;

  // Toggle-Buttons
  document.getElementById('cal-toggle-month')?.addEventListener('click', () => {
    if (calView === 'month') return;
    calView = 'month';
    renderCalendar();
  });

  document.getElementById('cal-toggle-gantt')?.addEventListener('click', () => {
    if (calView === 'gantt') return;
    calView = 'gantt';
    renderCalendar();
  });

  // Monats-Navigation (nur im Monats-Modus)
  document.getElementById('cal-prev')?.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar();
  });

  document.getElementById('cal-next')?.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar();
  });
}
