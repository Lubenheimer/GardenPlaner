import { store } from '../core/Store.js';
import { formatDate } from '../utils/helpers.js';
import { getPlant } from '../data/plants.js';
import {
  getCachedPrecipAnalysis,
  evaluatePrecip,
} from '../utils/precipAnalysis.js';

/**
 * Generate watering and fertilizing reminders based on active plantings.
 * For watering reminders, integrates precipitation data to skip/downgrade
 * when the weather has done the job already.
 */
function generateCareReminders(precipAnalysis) {
  const plantings = store.getPlantings();
  const beds = store.getBeds();
  const today = new Date();
  const reminders = [];

  const bedMap = {};
  beds.forEach(b => { bedMap[b.id] = b; });

  const activePlantings = plantings.filter(p => p.status === 'planted' || p.status === 'growing');

  activePlantings.forEach(p => {
    const plant = getPlant(p.name);
    if (!plant) return;
    const bed = bedMap[p.bedId];
    const bedName = bed ? bed.name : 'Unbekanntes Beet';

    // ── Watering reminder ────────────────────────────────────────────
    if (plant.waterDays) {
      const daysSincePlanted = p.datePlanted
        ? Math.floor((today - new Date(p.datePlanted)) / (1000 * 60 * 60 * 24))
        : 0;
      const isWateringDay = daysSincePlanted % plant.waterDays === 0;
      const nextWateringIn = plant.waterDays - (daysSincePlanted % plant.waterDays);
      const nextIn = nextWateringIn === plant.waterDays ? 0 : nextWateringIn;

      // ── Precipitation check ──────────────────────────────────────
      // For "today" reminders: use last 24h rain
      // For "tomorrow" (nextIn === 1): use expected rain tonight + tomorrow
      let precip = null;
      if (precipAnalysis) {
        if (isWateringDay || nextIn === 0) {
          precip = precipAnalysis.last24h;
        } else if (nextIn === 1) {
          // Tonight + next day precip
          precip = (precipAnalysis.tonight || 0) + (precipAnalysis.next24h || 0);
        }
      }

      const precipInfo = evaluatePrecip(precip, plant.waterDays);

      reminders.push({
        type: 'water',
        emoji: precipInfo.skipWatering ? precipInfo.emoji : '💧',
        plant: p,
        plantData: plant,
        bedName,
        interval: plant.waterDays,
        isToday: isWateringDay,
        nextIn,
        priority: isWateringDay ? 0 : nextIn,
        precipInfo,
        // Effective skip: only skip watering reminders, not fertilizer
        skippedByRain: precipInfo.skipWatering && plant.waterDays < 14,
      });
    }

    // ── Fertilizing reminder ─────────────────────────────────────────
    if (plant.fertilizeWeeks) {
      const daysSincePlanted = p.datePlanted
        ? Math.floor((today - new Date(p.datePlanted)) / (1000 * 60 * 60 * 24))
        : 0;
      const intervalDays = plant.fertilizeWeeks * 7;
      const isFertilizeDay = intervalDays > 0 && daysSincePlanted % intervalDays === 0 && daysSincePlanted > 0;
      const nextFertilizeIn = intervalDays - (daysSincePlanted % intervalDays);

      reminders.push({
        type: 'fertilize',
        emoji: '🧪',
        plant: p,
        plantData: plant,
        bedName,
        interval: plant.fertilizeWeeks,
        intervalUnit: 'Wochen',
        isToday: isFertilizeDay,
        nextIn: nextFertilizeIn === intervalDays ? 0 : nextFertilizeIn,
        priority: isFertilizeDay ? 0 : nextFertilizeIn,
        precipInfo: null,
        skippedByRain: false,
      });
    }
  });

  return reminders;
}

/**
 * Render a single care reminder card (today or upcoming)
 */
function renderReminderCard(r, isToday) {
  const { precipInfo, skippedByRain } = r;
  const hasRainNote = r.type === 'water' && precipInfo && precipInfo.status !== 'unknown' && precipInfo.status !== 'none';

  const cardClass = skippedByRain
    ? 'care-reminder-item care-reminder-rained'
    : isToday
      ? 'care-reminder-item care-reminder-today'
      : 'care-reminder-item';

  let badge, rainNote = '';

  if (skippedByRain) {
    badge = `<span class="care-reminder-badge care-reminder-badge-rain">${precipInfo.emoji} Regen</span>`;
  } else if (isToday) {
    badge = `<span class="care-reminder-badge care-reminder-badge-today">Heute</span>`;
  } else {
    badge = `<span class="care-reminder-badge">in ${r.nextIn} ${r.nextIn === 1 ? 'Tag' : 'Tagen'}</span>`;
  }

  if (hasRainNote) {
    const noteStyle = `color: ${precipInfo.color || 'var(--color-accent)'}; font-size: var(--font-size-xs); margin-top: 2px;`;
    rainNote = `<div style="${noteStyle}">${precipInfo.emoji} ${precipInfo.label}${precipInfo.hint ? ` — ${precipInfo.hint}` : ''}</div>`;
  }

  return `
    <div class="${cardClass}">
      <span class="care-reminder-emoji">${r.emoji}</span>
      <div class="care-reminder-info">
        <div class="care-reminder-title ${skippedByRain ? 'care-skipped' : ''}">
          ${r.type === 'water' ? 'Gießen' : 'Düngen'}: ${r.plant.emoji} ${r.plant.name}
        </div>
        <div class="care-reminder-meta">
          ${r.bedName} · alle ${r.type === 'water' ? `${r.interval} Tage` : `${r.interval} Wochen`}
        </div>
        ${rainNote}
      </div>
      ${badge}
    </div>
  `;
}

// ── Aussaat & Pflanz-Erinnerung ───────────────────────────────────────
function getUpcomingFrostAlerts() {
  try {
    const cached = JSON.parse(localStorage.getItem('gp_weather_cache') || 'null');
    if (cached && cached.data) {
      const frostDays = [];
      const nowMs = Date.now();
      cached.data.forEach(d => {
        if (d.tempMin <= 2) {
          const dt = new Date(d.date);
          if (dt.getTime() >= nowMs - 24 * 3600 * 1000) {
            frostDays.push(dt);
          }
        }
      });
      return frostDays;
    }
  } catch {}
  return [];
}

function generateSowingReminders() {
  const plantings = store.getPlantings().filter(p => p.status === 'planned');
  const beds = store.getBeds();
  const bedMap = {};
  beds.forEach(b => { bedMap[b.id] = b; });
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const frostDates = getUpcomingFrostAlerts();
  
  const sowingReminders = plantings.map(p => {
    if (!p.datePlanted) return null;
    const plant = getPlant(p.name);
    const bedName = bedMap[p.bedId]?.name || 'Unbekanntes Beet';
    
    // We treat datePlanted as the planned sowing/planting date for "planned" status
    const plannedDate = new Date(p.datePlanted);
    plannedDate.setHours(0,0,0,0);
    const diffDays = Math.round((plannedDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 14) return null; // Only show next 14 days
    
    let isFrostResistant = false;
    // Check if frost resistant: Kohl, Feldsalat, Wurzelgemüse, Gründüngung, missing plant data implies ignore
    if (plant && (plant.emoji === '🥬' || plant.emoji === '🥗' || plant.emoji === '🤍' || plant.emoji === '🥕' || plant.nutrition === 'gruen')) {
      isFrostResistant = true; 
    }
    
    let hasFrostWarning = false;
    // Warn if frost is coming and it's not frost resistant, and sowing is within a week
    if (frostDates.length > 0 && Math.abs(diffDays) <= 7 && !isFrostResistant) {
      hasFrostWarning = true;
    }
    
    return {
      type: 'sow',
      plant: p,
      plantData: plant || { name: p.name, emoji: p.emoji },
      bedName,
      diffDays,
      isToday: diffDays === 0,
      isOverdue: diffDays < 0,
      dateFormatted: plannedDate.toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric'}),
      hasFrostWarning
    };
  }).filter(Boolean);
  
  sowingReminders.sort((a,b) => a.diffDays - b.diffDays);
  return sowingReminders;
}

function renderSowingCard(r) {
  const cardClass = r.isOverdue || r.isToday ? 'care-reminder-item care-reminder-today' : 'care-reminder-item';
  let badge = '';
  
  if (r.hasFrostWarning) {
    badge = `<span class="care-reminder-badge" style="background:var(--color-danger);color:#fff;border-color:var(--color-danger);font-weight:600;">Frostgefahr! ❄️</span>`;
  } else if (r.isOverdue) {
    badge = `<span class="care-reminder-badge" style="background:#f59e0b;color:#fff;border-color:#f59e0b;font-weight:600;">Überfällig</span>`;
  } else if (r.isToday) {
    badge = `<span class="care-reminder-badge care-reminder-badge-today">Heute pflanzen</span>`;
  } else {
    badge = `<span class="care-reminder-badge">am ${r.dateFormatted}</span>`;
  }

  const frostNote = r.hasFrostWarning 
    ? `<div style="color: var(--color-danger); font-size: 11px; margin-top: 4px; font-weight:600;">⚠️ Wetter warnt vor Nachtfrost — Pflanzen besser geschützt lassen!</div>`
    : '';

  return `
    <div class="${cardClass}" style="${r.hasFrostWarning ? 'border-color:var(--color-danger); background:rgba(239,68,68,0.05);' : ''}">
      <span class="care-reminder-emoji">${r.plantData.emoji}</span>
      <div class="care-reminder-info">
        <div class="care-reminder-title" style="margin-bottom: 2px;">
          ${r.plantData.name} ${r.plant.variety ? `<span style="font-weight:400; font-size:11px;">(${r.plant.variety})</span>` : ''} 
          ${r.plant.quantity ? `<span style="color:var(--color-primary); font-size:11px;">· ${r.plant.quantity} Stk</span>` : ''}
        </div>
        <div class="care-reminder-meta">
          📍 ${r.bedName}
        </div>
        ${frostNote}
      </div>
      ${badge}
    </div>
  `;
}
export function renderTasks() {
  const container = document.getElementById('tasks-content');
  const tasks = store.getTasks();

  // Read precipitation analysis from cache (written by Dashboard.js on weather fetch)
  const precipAnalysis = getCachedPrecipAnalysis();
  const careReminders = generateCareReminders(precipAnalysis);

  // Split reminders: today/overdue vs. upcoming
  const todayReminders = careReminders.filter(r => r.isToday || r.nextIn <= 1);
  const upcomingReminders = careReminders
    .filter(r => !r.isToday && r.nextIn > 1 && r.nextIn <= 3)
    .sort((a, b) => a.nextIn - b.nextIn);

  // Deduplicate: one reminder per bed+type
  const deduped = (list) => {
    const seen = new Set();
    return list.filter(r => {
      const key = `${r.type}-${r.plant.bedId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const todayDeduped = deduped(todayReminders);
  const upcomingDeduped = deduped(upcomingReminders);

  // Today's watering reminders that are skipped by rain
  const skippedToday  = todayDeduped.filter(r => r.skippedByRain);
  const activeToday   = todayDeduped.filter(r => !r.skippedByRain);
  const heavyRain     = precipAnalysis && precipAnalysis.last24h >= 15;

  // Build precipitation summary banner
  const precipBanner = precipAnalysis && (precipAnalysis.last24h > 0 || precipAnalysis.next24h > 0) ? `
    <div class="precip-summary-banner ${heavyRain ? 'precip-heavy' : precipAnalysis.last24h >= 5 ? 'precip-good' : 'precip-light'}">
      <div class="precip-banner-icon">${heavyRain ? '🌊' : precipAnalysis.last24h >= 5 ? '🌧️' : '🌦️'}</div>
      <div class="precip-banner-info">
        <div class="precip-banner-title">Niederschlag (letzte 24h)</div>
        <div class="precip-banner-detail">
          ${precipAnalysis.last24h > 0 ? `<span>Letzte Nacht / Heute: <strong>${precipAnalysis.last24h.toFixed(1)} mm</strong></span>` : ''}
          ${precipAnalysis.tonight > 0 ? `<span>Heute Nacht erwartet: <strong>${precipAnalysis.tonight.toFixed(1)} mm</strong></span>` : ''}
          ${precipAnalysis.next24h > 0 ? `<span>Nächste 24h: <strong>${precipAnalysis.next24h.toFixed(1)} mm</strong></span>` : ''}
        </div>
        ${heavyRain ? `<div class="precip-banner-warning">⚠️ Staunässe-Check empfohlen bei Töpfen & Hochbeeten</div>` : ''}
        ${skippedToday.length > 0 ? `<div class="precip-banner-skipped">✓ ${skippedToday.length} Gieß-${skippedToday.length === 1 ? 'Erinnerung' : 'Erinnerungen'} durch Regen erledigt</div>` : ''}
      </div>
    </div>
  ` : '';

  const sowingReminders = generateSowingReminders();

  container.innerHTML = `
    <!-- Aussaat & Pflanzplan -->
    ${sowingReminders.length > 0 ? `
      <div class="dashboard-section animate-in" style="max-width: 800px;">
        <h2>🌱 Aussaat- & Pflanzplan</h2>
        <p style="font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: var(--space-md);">
          Deine geplanten Pflanzungen der nächsten 14 Tage.
        </p>
        <div class="care-reminder-list">
          ${sowingReminders.map(r => renderSowingCard(r)).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Gieß- & Dünge-Kalender -->
    ${(todayDeduped.length > 0 || upcomingDeduped.length > 0 || precipBanner) ? `
      <div class="dashboard-section animate-in" style="margin-top: 24px; max-width: 800px;">
        <h2>💧 Gieß- & Dünge-Kalender</h2>
        <p style="font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: var(--space-md);">
          Automatische Erinnerungen basierend auf Pflegebedarf und aktuellem Wetter${precipAnalysis ? '' : ' (keine Standort-Wetterdaten — <a href="#" onclick="document.querySelector(\'[data-view=setup]\')?.click();return false;" style="color:var(--color-primary)">Standort konfigurieren</a>)'}.
        </p>

        ${precipBanner}

        ${activeToday.length > 0 ? `
          <div style="margin-bottom: var(--space-md);">
            <div style="font-size: var(--font-size-xs); font-weight: 600; text-transform: uppercase; color: var(--color-primary); margin-bottom: var(--space-sm); letter-spacing: 0.05em;">
              Heute fällig
            </div>
            <div class="care-reminder-list">
              ${activeToday.map(r => renderReminderCard(r, true)).join('')}
            </div>
          </div>
        ` : ''}

        ${skippedToday.length > 0 ? `
          <div style="margin-bottom: var(--space-md);">
            <div style="font-size: var(--font-size-xs); font-weight: 600; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: var(--space-sm); letter-spacing: 0.05em;">
              Durch Regen erledigt
            </div>
            <div class="care-reminder-list">
              ${skippedToday.map(r => renderReminderCard(r, true)).join('')}
            </div>
          </div>
        ` : ''}

        ${upcomingDeduped.length > 0 ? `
          <div>
            <div style="font-size: var(--font-size-xs); font-weight: 600; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: var(--space-sm); letter-spacing: 0.05em;">
              Demnächst
            </div>
            <div class="care-reminder-list">
              ${upcomingDeduped.map(r => renderReminderCard(r, false)).join('')}
            </div>
          </div>
        ` : ''}

        ${activeToday.length === 0 && upcomingDeduped.length === 0 && skippedToday.length === 0 ? `
          <div class="empty-state" style="padding: var(--space-md);">
            <div class="empty-text" style="font-size: var(--font-size-sm);">Keine anstehenden Pflege-Erinnerungen.</div>
          </div>
        ` : ''}
      </div>
    ` : ''}

    <!-- Aufgaben -->
    <div class="dashboard-section animate-in" style="margin-top: 24px; max-width: 800px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h2>📝 Meine Aufgaben</h2>
        <button id="add-task-btn" class="btn btn-primary">+ Aufgabe hinzufügen</button>
      </div>

      <div class="list-group" style="display: flex; flex-direction: column; gap: 8px;">
        ${tasks.length === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">✅</div>
            <div class="empty-text">Alles erledigt! Keine Aufgaben vorhanden.</div>
          </div>
        ` : tasks.sort((a,b) => {
             if (a.completed !== b.completed) return a.completed ? 1 : -1;
             return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
           }).map(t => `
            <div class="list-item ${t.completed ? 'completed' : ''}" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-surface); border: var(--glass-border); border-radius: var(--radius-md); opacity: ${t.completed ? '0.6' : '1'};">
              <div style="display: flex; gap: 16px; align-items: center;">
                <input type="checkbox" class="task-checkbox" data-id="${t.id}" ${t.completed ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;">
                <div>
                  <div style="font-weight: 600; font-size: 16px; text-decoration: ${t.completed ? 'line-through' : 'none'};">${t.title}</div>
                  ${t.dueDate ? `<div style="font-size: 12px; color: var(--color-danger); margin-top: 4px;">📅 Bis: ${formatDate(t.dueDate)}</div>` : ''}
                </div>
              </div>
              <button class="icon-btn small delete-task-btn" data-id="${t.id}" style="color: var(--color-danger);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
           `).join('')
        }
      </div>
    </div>

    <!-- Pflege-Intervall-Übersicht -->
    ${careReminders.length > 0 ? `
      <div class="dashboard-section animate-in" style="margin-top: 24px; max-width: 800px;">
        <h2>📋 Pflege-Intervalle</h2>
        <p style="font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: var(--space-md);">
          Übersicht aller Gieß- und Düngeintervalle deiner aktiven Pflanzungen.
        </p>
        <div class="care-schedule-grid">
          ${(() => {
            const byBed = {};
            const activePlantings = store.getPlantings().filter(p => p.status === 'planted' || p.status === 'growing');
            activePlantings.forEach(p => {
              if (!byBed[p.bedId]) byBed[p.bedId] = { bed: store.getBed(p.bedId), plantings: [] };
              byBed[p.bedId].plantings.push(p);
            });
            return Object.values(byBed).map(({ bed, plantings }) => {
              if (!bed) return '';
              return `
                <div class="care-schedule-card">
                  <div class="care-schedule-bed-name">${bed.name}</div>
                  <div class="care-schedule-plants">
                    ${plantings.map(p => {
                      const plant = getPlant(p.name);
                      if (!plant) return '';
                      return `
                        <div class="care-schedule-plant">
                          <span>${p.emoji} ${p.name}</span>
                          <div class="care-schedule-badges">
                            ${plant.waterDays ? `<span class="care-badge care-badge-water">💧 ${plant.waterDays}d</span>` : ''}
                            ${plant.fertilizeWeeks ? `<span class="care-badge care-badge-fertilize">🧪 ${plant.fertilizeWeeks}w</span>` : ''}
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('');
          })()}
        </div>
      </div>
    ` : ''}
  `;

  // Bind Events
  setTimeout(() => {
    document.getElementById('add-task-btn')?.addEventListener('click', () => {
      const title = prompt('Welche Aufgabe steht an?');
      if (!title) return;
      const dueDate = prompt('Bis wann? (Format: YYYY-MM-DD) – Optional', new Date().toISOString().split('T')[0]);
      store.addTask({ title, dueDate: dueDate || null });
      renderTasks();
    });

    document.querySelectorAll('.task-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        store.updateTask(e.target.dataset.id, { completed: e.target.checked });
        renderTasks();
      });
    });

    document.querySelectorAll('.delete-task-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        if (confirm('Aufgabe wirklich löschen?')) {
          store.deleteTask(id);
          renderTasks();
        }
      });
    });
  }, 0);
}
