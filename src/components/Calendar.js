/**
 * Calendar — Monthly view of planting activities
 */
import { store } from '../core/Store.js';
import { monthNames } from '../data/plants.js';
import { statusEmojis } from '../utils/helpers.js';

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

export function renderCalendar() {
  const container = document.getElementById('calendar-content');
  const plantings = store.getPlantings();

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = lastDay.getDate();

  const today = new Date();
  const isToday = (d) => d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  // Build planting events by date
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

  // Build calendar grid
  let cells = '';

  // Day headers
  for (const dh of dayHeaders) {
    cells += `<div class="calendar-day-header">${dh}</div>`;
  }

  // Days from previous month
  const prevMonth = new Date(currentYear, currentMonth, 0);
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    cells += `<div class="calendar-day other-month"><span class="day-number">${prevMonth.getDate() - i}</span></div>`;
  }

  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const todayClass = isToday(d) ? 'today' : '';
    const events = eventsByDate[d] || [];
    cells += `
      <div class="calendar-day ${todayClass}">
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

  // Fill remaining cells
  const totalCells = startDayOfWeek + daysInMonth;
  const remaining = (7 - (totalCells % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    cells += `<div class="calendar-day other-month"><span class="day-number">${i}</span></div>`;
  }

  container.innerHTML = `
    <div class="calendar-nav animate-in">
      <button class="btn btn-ghost" id="cal-prev">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2>${monthNames[currentMonth]} ${currentYear}</h2>
      <button class="btn btn-ghost" id="cal-next">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>

    <div class="calendar-grid animate-in">
      ${cells}
    </div>

    <!-- Upcoming events -->
    ${plantings.filter(p => p.datePlanted).length > 0 ? `
      <div class="dashboard-section animate-in" style="margin-top: var(--space-xl);">
        <h2>Anstehende Pflanzungen</h2>
        <div class="planting-list">
          ${plantings
            .filter(p => p.datePlanted && new Date(p.datePlanted) >= new Date(today.toDateString()))
            .sort((a, b) => new Date(a.datePlanted) - new Date(b.datePlanted))
            .slice(0, 5)
            .map(p => {
              const bed = store.getBed(p.bedId);
              const d = new Date(p.datePlanted);
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

  // Nav events
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
