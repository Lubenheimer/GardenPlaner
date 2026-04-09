/**
 * GartenPlaner — Main Entry Point
 */
import './styles/index.css';
import './styles/layout.css';
import './styles/components.css';

import { store } from './core/Store.js';
import { bus } from './core/EventBus.js';
import { CanvasRenderer } from './core/CanvasRenderer.js';
import { CanvasInteraction } from './core/CanvasInteraction.js';
import { renderBedEditor, bindBedEditorEvents } from './components/BedEditor.js';
import { renderDashboard } from './components/Dashboard.js';
import { renderCalendar } from './components/Calendar.js';
import { renderPhotos } from './components/Photos.js';
import { renderTasks } from './components/Tasks.js';
import { showPlantingModal } from './components/PlantingModal.js';
import { renderSetup } from './components/SettingsManager.js';
import { showGardenManager } from './components/GardenManager.js';
import { bedColors } from './utils/helpers.js';

let renderer, interaction;
let currentView = 'canvas';
let _clipboard = null;

// ========== Init ==========
function init() {
  applyTheme();
  initCanvas();
  initNavigation();
  initToolbar();
  initSidebar();
  initEvents();
  _updateGardenLabel();
  renderCurrentView();

  // Center canvas
  setTimeout(() => {
    const container = document.querySelector('.canvas-container');
    if (container) {
      renderer.setOffset(
        container.clientWidth / 2 - store.getGarden().width / 2,
        container.clientHeight / 2 - store.getGarden().height / 2
      );
    }
  }, 100);
}

// ========== Theme ==========
function applyTheme() {
  const theme = store.getSettings().theme;
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
  const current = store.getSettings().theme;
  const next = current === 'dark' ? 'light' : 'dark';
  store.updateSettings({ theme: next });
  document.documentElement.setAttribute('data-theme', next);
  renderer.render();
}

// ========== Canvas ==========
function initCanvas() {
  const canvas = document.getElementById('garden-canvas');
  renderer = new CanvasRenderer(canvas);
  interaction = new CanvasInteraction(renderer);

  const settings = store.getSettings();
  renderer.showGrid = settings.showGrid;

  window.addEventListener('resize', () => renderer.resize());
}

// ========== Navigation ==========
function initNavigation() {
  document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Garden switcher button
  document.getElementById('garden-switcher-btn')?.addEventListener('click', () => {
    showGardenManager(_onGardenSwitch);
  });
}

function _updateGardenLabel() {
  const nameEl = document.getElementById('active-garden-name');
  if (nameEl) nameEl.textContent = store.getGarden().name || 'Mein Garten';
}

function _onGardenSwitch() {
  // Reset canvas state
  renderer.selectedBedId  = null;
  renderer.draggingBedId  = null;
  renderer._textureCache?.clear();
  closeRightPanel();

  // Re-center on the new garden
  const garden = store.getGarden();
  const container = document.querySelector('.canvas-container');
  if (container) {
    renderer.setOffset(
      container.clientWidth  / 2 - garden.width  / 2,
      container.clientHeight / 2 - garden.height / 2,
    );
  }

  _updateGardenLabel();
  renderBedList();
  renderer.render();
  renderCurrentView();
}

function switchView(view) {
  currentView = view;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-view="${view}"]`)?.classList.add('active');
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${view}`)?.classList.add('active');

  document.getElementById('bed-list-section').style.display = view === 'canvas' ? 'flex' : 'none';
  closeRightPanel();
  renderCurrentView();
}

function renderCurrentView() {
  switch (currentView) {
    case 'canvas': renderer.resize(); break;
    case 'dashboard': renderDashboard(); break;
    case 'calendar': renderCalendar(); break;
    case 'photos': renderPhotos(); break;
    case 'tasks': renderTasks(); break;
    case 'setup': renderSetup(); break;
  }
}

// ========== Toolbar ==========
function initToolbar() {
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // Drawing tools
  const tools = ['select', 'rect', 'circle', 'lshaped', 'polygon', 'line', 'measure'];
  tools.forEach(tool => {
    document.getElementById(`tool-${tool}`)?.addEventListener('click', () => {
      tools.forEach(t => document.getElementById(`tool-${t}`)?.classList.remove('active'));
      document.getElementById(`tool-${tool}`)?.classList.add('active');
      interaction.setTool(tool);
    });
  });

  // 3D View Toggle
  let is3DView = false;
  document.getElementById('tool-3d')?.addEventListener('click', (e) => {
    is3DView = !is3DView;
    e.currentTarget.classList.toggle('active', is3DView);
    const container = document.querySelector('.canvas-container');
    container.classList.toggle('is-3d-view', is3DView);
    
    // Disable canvas interaction while in 3D
    interaction.enabled = !is3DView;
    
    if (is3DView && renderer.zoom < 0.7) {
      renderer.setZoom(0.7);
      bus.emit('zoom:changed', 0.7);
    }
  });

  // Zoom
  document.getElementById('tool-zoom-in').addEventListener('click', () => {
    renderer.setZoom(renderer.zoom * 1.2);
    bus.emit('zoom:changed', renderer.zoom);
  });
  document.getElementById('tool-zoom-out').addEventListener('click', () => {
    renderer.setZoom(renderer.zoom / 1.2);
    bus.emit('zoom:changed', renderer.zoom);
  });

  // Grid toggle
  document.getElementById('tool-grid').addEventListener('click', (e) => {
    renderer.showGrid = !renderer.showGrid;
    e.currentTarget.classList.toggle('active', renderer.showGrid);
    store.updateSettings({ showGrid: renderer.showGrid });
    renderer.render();
  });

  // Undo / Redo buttons
  document.getElementById('tool-undo')?.addEventListener('click', () => {
    store.undo();
    _updateUndoRedoButtons();
  });
  document.getElementById('tool-redo')?.addEventListener('click', () => {
    store.redo();
    _updateUndoRedoButtons();
  });

  // Fit-All button
  document.getElementById('tool-fit')?.addEventListener('click', () => {
    renderer.fitAll();
    bus.emit('zoom:changed', renderer.zoom);
  });

  // Environment Sliders
  const envTime = document.getElementById('env-time');
  const envTimeLabel = document.getElementById('env-time-label');
  const envMonth = document.getElementById('env-month');
  const envMonthLabel = document.getElementById('env-month-label');
  const envNorth = document.getElementById('env-north');
  const envNorthLabel = document.getElementById('env-north-label');
  
  const updateEnv = () => {
    const time = parseFloat(envTime.value);
    const m = parseInt(envMonth.value);
    const minSuffix = time % 1 === 0.5 ? '30' : '00';
    envTimeLabel.textContent = `${Math.floor(time)}:${minSuffix}`;
    const months = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
    envMonthLabel.textContent = months[m-1];
    envNorthLabel.textContent = `${envNorth.value}°`;

    store.updateSettings({ 
      simulationTime: time, 
      simulationMonth: m, 
      northRotation: parseInt(envNorth.value) 
    });
    renderer.render();
  };

  if (envTime) {
    const s = store.getSettings();
    if(s.simulationTime) envTime.value = s.simulationTime;
    if(s.simulationMonth) envMonth.value = s.simulationMonth;
    if(s.northRotation) envNorth.value = s.northRotation;
    
    envTime.addEventListener('input', updateEnv);
    envMonth.addEventListener('input', updateEnv);
    envNorth.addEventListener('input', updateEnv);
    updateEnv();
  }

  // Add bed
  document.getElementById('add-bed-btn').addEventListener('click', () => {
    const garden = store.getGarden();
    const bed = store.addBed({
      x: garden.width / 2 - 100,
      y: garden.height / 2 - 75,
      width: 200,
      height: 150,
      type: 'rect',
      color: bedColors[store.getBeds().length % bedColors.length],
    });
    renderer.selectedBedId = bed.id;
    bus.emit('bed:selected', bed);
    renderer.render();
  });
}

// ========== Sidebar Bed List ==========
function initSidebar() {
  renderBedList();

  // Settings in Sidebar-Header navigiert nun auch zum Setup
  document.getElementById('mgr-settings-btn')?.addEventListener('click', () => {
    document.querySelector('.nav-btn[data-view="setup"]')?.click();
  });
}

function renderBedList() {
  const container = document.getElementById('bed-list');
  const beds = store.getBeds();
  const levels = store.getLevels();
  const types = store.getElementTypes();

  if (beds.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: var(--space-md)">
        <div class="empty-icon">🌱</div>
        <div class="empty-text" style="font-size: var(--font-size-sm)">
          Noch keine Elemente.<br>Klicke + oder zeichne auf dem Canvas.
        </div>
      </div>
    `;
    return;
  }

  // Sort levels by zIndex (top to bottom)
  const sortedLevels = [...levels].sort((a,b) => b.zIndex - a.zIndex);
  
  let html = '';
  
  sortedLevels.forEach(level => {
    const levelBeds = beds.filter(b => b.levelId === level.id);
    if (levelBeds.length === 0) return;
    
    html += `<div style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--color-text-muted); padding:var(--space-md) var(--space-md) var(--space-xs) var(--space-md)">${level.name}</div>`;
    
    levelBeds.forEach(bed => {
      const count = store.getPlantings(bed.id).length;
      const selected = bed.id === renderer?.selectedBedId;
      const type = types.find(t => t.id === bed.kind) || types[0];
      html += `
        <div class="bed-item ${selected ? 'selected' : ''}" data-bed-id="${bed.id}">
          <span class="bed-color-dot" style="background: ${type.color}"></span>
          <span class="bed-item-name">${bed.name}</span>
          ${count > 0 ? `<span class="bed-item-count">${count}</span>` : ''}
        </div>
      `;
    });
  });

  // Ungrouped fallback
  const ungrouped = beds.filter(b => !levels.find(l => l.id === b.levelId));
  if (ungrouped.length > 0) {
    html += `<div style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--color-text-muted); padding:var(--space-md) var(--space-md) var(--space-xs) var(--space-md)">Ohne Ebene</div>`;
    ungrouped.forEach(bed => {
      const selected = bed.id === renderer?.selectedBedId;
      const type = types.find(t => t.id === bed.kind) || types[0];
      html += `
        <div class="bed-item ${selected ? 'selected' : ''}" data-bed-id="${bed.id}">
          <span class="bed-color-dot" style="background: ${type.color}"></span>
          <span class="bed-item-name">${bed.name}</span>
        </div>
      `;
    });
  }

  container.innerHTML = html;

  container.querySelectorAll('.bed-item').forEach(item => {
    item.addEventListener('click', () => {
      const bed = store.getBed(item.dataset.bedId);
      if (bed) {
        renderer.selectedBedId = bed.id;
        renderer.render();
        bus.emit('bed:selected', bed);
        renderBedList();
      }
    });
  });
}

// ========== Right Panel ==========
function openRightPanel(html) {
  const panel = document.getElementById('right-panel');
  document.getElementById('panel-content').innerHTML = html;
  panel.classList.remove('hidden');
  renderer.resize();
}

function closeRightPanel() {
  document.getElementById('right-panel').classList.add('hidden');
  renderer?.resize();
}

// ========== Events ==========
function initEvents() {
  bus.on('bed:selected', (bed) => {
    openRightPanel(renderBedEditor(bed));
    bindBedEditorEvents(bed.id, {
      onClose: () => { renderer.selectedBedId = null; closeRightPanel(); bus.emit('bed:deselected'); },
      onDelete: () => {
        store.deleteBed(bed.id);
        renderer.selectedBedId = null;
        closeRightPanel();
        renderer.render();
      },
      onCopy: () => {
        const b = store.getBed(bed.id);
        if (b) _clipboard = JSON.parse(JSON.stringify(b));
      },
      onAddPlanting: () => showPlantingModal(bed.id),
      onUpdate: () => { renderBedList(); renderer.render(); },
    });
    renderBedList();
  });

  bus.on('bed:deselected', () => {
    closeRightPanel();
    renderBedList();
  });

  bus.on('bed:edit', (bed) => {
    renderer.selectedBedId = bed.id;
    bus.emit('bed:selected', bed);
  });

  bus.on('beds:changed', () => {
    renderBedList();
    renderer.render();
    _updateUndoRedoButtons();

    // Auto-update inputs if editor is open and not actively focused
    if (renderer.selectedBedId) {
      const bed = store.getBed(renderer.selectedBedId);
      if (bed) {
        const rotInput = document.getElementById('bed-rotation');
        if (rotInput && document.activeElement !== rotInput) {
          rotInput.value = bed.rotation || 0;
        }
        const dimX = document.getElementById('bed-dim-x');
        if (dimX && document.activeElement !== dimX) dimX.value = ((bed.width || 0) / 100).toFixed(2);
        const dimY = document.getElementById('bed-dim-y');
        if (dimY && document.activeElement !== dimY) dimY.value = ((bed.height || 0) / 100).toFixed(2);
      }
    }
  });

  bus.on('plantings:changed', () => {
    renderer.render();
    const id = renderer.selectedBedId;
    if (id) {
      const bed = store.getBed(id);
      if (bed) bus.emit('bed:selected', bed);
    }
  });

  bus.on('garden:changed', () => {
    _updateGardenLabel();
    renderer.render();
  });

  bus.on('garden:switched', () => {
    _onGardenSwitch();
  });

  // Server-Verbindungsstatus
  bus.on('server:status', (online) => {
    _updateServerStatus(online);
  });

  // Store wurde vom Server neu geladen (authoritative Daten)
  bus.on('store:reloaded', () => {
    renderer.selectedBedId = null;
    renderer._textureCache?.clear();
    closeRightPanel();
    _updateGardenLabel();
    renderBedList();
    renderer.render();
    renderCurrentView();
  });

  bus.on('zoom:changed', (zoom) => {
    document.getElementById('zoom-level').textContent = Math.round(zoom * 100) + '%';
  });

  bus.on('tool:changed', (tool) => {
    ['select', 'rect', 'circle', 'lshaped'].forEach(t =>
      document.getElementById(`tool-${t}`)?.classList.remove('active')
    );
    document.getElementById(`tool-${tool}`)?.classList.add('active');
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // Undo / Redo
    if (e.ctrlKey && !e.shiftKey && e.key === 'z') {
      e.preventDefault();
      store.undo();
      _updateUndoRedoButtons();
      return;
    }
    if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
      e.preventDefault();
      store.redo();
      _updateUndoRedoButtons();
      return;
    }

    // Copy / Paste
    if (e.ctrlKey && e.key === 'c' && renderer.selectedBedId) {
      e.preventDefault();
      const bed = store.getBed(renderer.selectedBedId);
      if (bed) _clipboard = JSON.parse(JSON.stringify(bed));
      return;
    }
    if (e.ctrlKey && e.key === 'v' && _clipboard) {
      e.preventDefault();
      const newBed = store.addBed({
        ..._clipboard,
        x: _clipboard.x + 20,
        y: _clipboard.y + 20,
        name: _clipboard.name + ' (Kopie)',
      });
      renderer.selectedBedId = newBed.id;
      bus.emit('bed:selected', newBed);
      renderer.render();
      return;
    }

    if ((e.key === 'Delete' || e.key === 'Backspace') && renderer.selectedBedId) {
      store.deleteBed(renderer.selectedBedId);
      renderer.selectedBedId = null;
      closeRightPanel();
      renderer.render();
    }

    if (e.key === 'Escape') {
      renderer.selectedBedId = null;
      closeRightPanel();
      interaction.setTool('select');
      bus.emit('tool:changed', 'select');
      renderer.render();
    }
  });
}

// ========== Undo/Redo button state ==========
function _updateUndoRedoButtons() {
  const undoBtn = document.getElementById('tool-undo');
  const redoBtn = document.getElementById('tool-redo');
  if (undoBtn) undoBtn.disabled = !store.canUndo();
  if (redoBtn) redoBtn.disabled = !store.canRedo();
}

// ========== Server-Status-Indikator ==========
function _updateServerStatus(online) {
  const dot = document.getElementById('server-status-dot');
  if (!dot) return;
  if (online) {
    dot.style.background = 'var(--color-success)';
    dot.title = '✅ Lokale Datenbank verbunden – Daten werden automatisch gesichert';
  } else {
    dot.style.background = 'var(--color-text-muted)';
    dot.title = '⚠️ Offline-Modus – Daten nur im Browser-Speicher (localStorage)';
  }
}

// ========== Start ==========
document.addEventListener('DOMContentLoaded', () => {
  init();

  // Nach dem Start asynchron Server-Daten laden
  store.initFromServer();
});
