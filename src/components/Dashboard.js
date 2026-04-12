/**
 * Dashboard — Overview of the garden
 */
import { store } from '../core/Store.js';
import { statusLabels, statusEmojis, formatDate } from '../utils/helpers.js';
import { getSowingPlants, getHarvestPlants, monthNames } from '../data/plants.js';
import { renderCropRotationWidget } from './CropRotation.js';

// ── Wetter-Hilfsfunktionen ─────────────────────────────────────────

const WEATHER_CACHE_KEY = 'gp_weather_cache';
const WEATHER_CACHE_TTL = 60 * 60 * 1000; // 1 Stunde

function weatherCodeToEmoji(code) {
  if (code === 0)                 return '☀️';
  if (code <= 3)                  return '🌤️';
  if (code <= 48)                 return '🌫️';
  if (code <= 67)                 return '🌧️';
  if (code <= 77)                 return '❄️';
  if (code <= 82)                 return '🌦️';
  if (code <= 86)                 return '🌨️';
  return '⛈️';
}

function weatherCodeToLabel(code) {
  if (code === 0)  return 'Klar';
  if (code <= 3)   return 'Heiter';
  if (code <= 48)  return 'Neblig';
  if (code <= 55)  return 'Nieselregen';
  if (code <= 67)  return 'Regen';
  if (code <= 77)  return 'Schnee';
  if (code <= 82)  return 'Regenschauer';
  if (code <= 86)  return 'Schneeschauer';
  return 'Gewitter';
}

import { savePrecipAnalysis } from '../utils/precipAnalysis.js';

async function fetchWeather(lat, lon, city) {
  // Cache prüfen
  try {
    const cached = JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY) || 'null');
    if (cached && cached.city === city && (Date.now() - cached.ts) < WEATHER_CACHE_TTL) {
      return cached.data;
    }
  } catch { /* ignore */ }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
    + `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode`
    + `&hourly=precipitation`
    + `&past_days=1&forecast_days=7&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Wetterdaten nicht verfügbar');
  const json = await res.json();

  const data = json.daily.time.map((date, i) => ({
    date,
    tempMax:    Math.round(json.daily.temperature_2m_max[i]),
    tempMin:    Math.round(json.daily.temperature_2m_min[i]),
    precip:     json.daily.precipitation_sum[i],
    code:       json.daily.weathercode[i],
  }));

  // Stündliche Niederschlagsdaten für Gieß-Kalender speichern
  savePrecipAnalysis(json, city);

  try {
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ city, ts: Date.now(), data }));
  } catch { /* ignore */ }

  return data;
}


function renderWeatherWidget(weatherData, city) {
  const today = new Date().toISOString().split('T')[0];
  const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  const frostDays = weatherData.filter(d => d.tempMin < 2).map(d => {
    const dt = new Date(d.date);
    return dayNames[dt.getDay()];
  });

  return `
    <div class="weather-widget animate-in">
      <div class="weather-widget-header">
        <div class="weather-location">
          <span class="weather-location-icon">📍</span>
          ${city}
        </div>
        <span class="weather-updated">7-Tage-Vorschau</span>
      </div>

      <div class="weather-forecast">
        ${weatherData.map(d => {
          const dt = new Date(d.date);
          const isToday = d.date === today;
          const isFrost = d.tempMin < 2;
          return `
            <div class="weather-day ${isToday ? 'today' : ''}">
              <div class="weather-day-name">${isToday ? 'Heute' : dayNames[dt.getDay()]}</div>
              <div class="weather-emoji" title="${weatherCodeToLabel(d.code)}">${weatherCodeToEmoji(d.code)}</div>
              <div class="weather-temp-max">${d.tempMax}°</div>
              <div class="weather-temp-min ${isFrost ? 'frost' : ''}">${isFrost ? '🥶' : ''}${d.tempMin}°</div>
              ${d.precip > 0.1 ? `<div class="weather-precip">💧${d.precip.toFixed(1)}</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>

      ${frostDays.length > 0 ? `
        <div class="weather-frost-alert">
          ❄️ <strong>Frostgefahr</strong> — Empfindliche Pflanzen schützen! (${frostDays.join(', ')})
        </div>
      ` : ''}
    </div>
  `;
}

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

  // Wetter-Widget: Platzhalter einsetzen, dann async nachladen
  const loc = store.getSettings().location || {};
  const weatherPlaceholder = loc.lat
    ? `<div id="weather-widget-container"><div class="weather-widget animate-in" style="display:flex;align-items:center;gap:12px;padding:var(--space-lg);color:var(--color-text-muted);font-size:var(--font-size-sm);">⏳ Wetterdaten werden geladen...</div></div>`
    : `<div id="weather-widget-container"><div class="weather-no-location">🌤️ <span>Kein Standort gesetzt — <a id="go-to-settings">Standort in Einstellungen festlegen</a></span></div></div>`;

  container.innerHTML = `
    <!-- Wetter -->
    ${weatherPlaceholder}

    <!-- Überfällige Tasks Alert -->
    ${(() => {
      const tasks = store.getTasks();
      const todayStr = new Date().toISOString().split('T')[0];
      const overdue = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr);
      if (overdue.length === 0) return '';
      return `
        <div class="animate-in" style="
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.35);
          border-radius: var(--radius-md);
          padding: var(--space-md) var(--space-lg);
          display: flex;
          align-items: center;
          gap: var(--space-md);
          flex-wrap: wrap;
        ">
          <span style="font-size: 22px; flex-shrink: 0;">⚠️</span>
          <div style="flex: 1; min-width: 200px;">
            <div style="font-weight: 700; color: var(--color-danger); margin-bottom: 4px;">
              ${overdue.length} überfällige Aufgabe${overdue.length > 1 ? 'n' : ''}
            </div>
            <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
              ${overdue.slice(0, 3).map(t => `📋 ${t.title}`).join('  ·  ')}${overdue.length > 3 ? `  · +${overdue.length - 3} weitere` : ''}
            </div>
          </div>
          <a id="go-to-tasks-alert" style="
            font-size: var(--font-size-sm);
            color: var(--color-danger);
            cursor: pointer;
            font-weight: 600;
            white-space: nowrap;
            text-decoration: none;
          ">Aufgaben öffnen →</a>
        </div>
      `;
    })()}

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

    <!-- Ernte-Protokoll -->
    ${(() => {
      const harvests = store.getHarvests();
      if (harvests.length === 0) return '';

      // Aggregation by plant
      const byPlant = {};
      harvests.forEach(h => {
        const key = `${h.plantEmoji} ${h.plantName}`;
        if (!byPlant[key]) byPlant[key] = { emoji: h.plantEmoji, name: h.plantName, total: {}, count: 0 };
        if (!byPlant[key].total[h.unit]) byPlant[key].total[h.unit] = 0;
        byPlant[key].total[h.unit] += h.amount;
        byPlant[key].count++;
      });

      // Grand totals by unit
      const grandTotal = {};
      harvests.forEach(h => {
        if (!grandTotal[h.unit]) grandTotal[h.unit] = 0;
        grandTotal[h.unit] += h.amount;
      });

      const totalStr = Object.entries(grandTotal)
        .map(([unit, total]) => `${total % 1 === 0 ? total : total.toFixed(1)} ${unit}`)
        .join(', ');

      return `
        <div class="dashboard-section animate-in">
          <h2>🧺 Ernte-Protokoll</h2>
          <div class="stat-card" style="margin-bottom: 16px; display: flex; align-items: center; padding: 12px;">
            <div class="stat-icon" style="background: rgba(74, 222, 128, 0.1); color: #4ade80; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-right: 16px;">🧺</div>
            <div>
              <div class="stat-value" style="font-size: 20px;">${totalStr}</div>
              <div class="stat-label">${harvests.length} Ernten insgesamt</div>
            </div>
          </div>
          <div class="harvest-dashboard-grid">
            ${Object.values(byPlant).sort((a, b) => b.count - a.count).slice(0, 8).map(p => {
              const amounts = Object.entries(p.total).map(([u, t]) => `${t % 1 === 0 ? t : t.toFixed(1)} ${u}`).join(', ');
              return `
                <div class="harvest-dashboard-item">
                  <span style="font-size: 20px;">${p.emoji}</span>
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; font-size: var(--font-size-sm);">${p.name}</div>
                    <div style="font-size: var(--font-size-xs); color: var(--color-text-muted);">${amounts} · ${p.count}× geerntet</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    })()}

    <!-- Fruchtfolge-Assistent -->
    ${renderCropRotationWidget()}

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

  // Wetter async nachladen
  if (loc.lat) {
    fetchWeather(loc.lat, loc.lon, loc.city).then(data => {
      const wc = document.getElementById('weather-widget-container');
      if (wc) wc.innerHTML = renderWeatherWidget(data, loc.city);
    }).catch(() => {
      const wc = document.getElementById('weather-widget-container');
      if (wc) wc.innerHTML = `<div class="weather-no-location">⚠️ Wetterdaten konnten nicht geladen werden.</div>`;
    });
  }

  // Bind Events for Dashboard
  setTimeout(() => {
    document.getElementById('go-to-settings')?.addEventListener('click', () => {
      document.querySelector('.nav-btn[data-view="setup"]')?.click();
    });

    document.getElementById('go-to-tasks-alert')?.addEventListener('click', () => {
      document.querySelector('.nav-btn[data-view="tasks"]')?.click();
    });

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
