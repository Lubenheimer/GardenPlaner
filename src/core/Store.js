/**
 * Store — Central state management with localStorage persistence
 * Supports multiple garden projects (multi-garden).
 */
import { bus } from './EventBus.js';

const STORAGE_KEY = 'gartenplaner_data';

const DEFAULT_LEVELS = [
  { id: 'level-0', name: 'Niedrigere Fläche', zIndex: 0 },
  { id: 'level-1', name: 'Hauptebene', zIndex: 1 },
  { id: 'level-2', name: 'Erhöhte Fläche', zIndex: 2 },
];

const DEFAULT_ELEMENT_TYPES = [
  { id: 'type-bed',    name: 'Beet',         color: '#4ade80', category: 'object', defaultHeight: 40,  hasPlantings: true  },
  { id: 'type-lawn',   name: 'Rasenfläche',  color: '#86efac', category: 'area',   defaultHeight: 0,   hasPlantings: false },
  { id: 'type-terrace',name: 'Terrasse',     color: '#a8a29e', category: 'area',   defaultHeight: 5,   hasPlantings: false },
  { id: 'type-shed',   name: 'Gartenhaus',   color: '#fcd34d', category: 'object', defaultHeight: 250, hasPlantings: false },
  { id: 'type-tree',   name: 'Baum',         color: '#166534', category: 'object', defaultHeight: 400, hasPlantings: false },
  { id: 'type-fence',  name: 'Zaun',         color: '#78350f', category: 'line',   defaultHeight: 120, hasPlantings: false },
  { id: 'type-path',   name: 'Weg',          color: '#d6d3d1', category: 'area',   defaultHeight: 0,   hasPlantings: false },
];

function makeDefaultGarden(id, name = 'Mein Garten') {
  return {
    id,
    name,
    garden: { name, width: 2000, height: 1500, shape: 'rect', points: null },
    beds: [],
    plantings: [],
    photos: [],
    expenses: [],
    tasks: [],
    harvests: [],
    levels: JSON.parse(JSON.stringify(DEFAULT_LEVELS)),
    createdAt: new Date().toISOString(),
  };
}

const defaultState = {
  activeGardenId: 'garden-1',
  gardens: [makeDefaultGarden('garden-1')],
  elementTypes: JSON.parse(JSON.stringify(DEFAULT_ELEMENT_TYPES)),
  customPlants: [],
  settings: {
    theme: 'dark',
    showGrid: true,
    gridSize: 20,
    location: { city: '', lat: null, lon: null },
  },
};

class Store {
  constructor() {
    this.state          = this.load();
    this.nextId         = this._calculateNextId();
    this._saveTimer     = null;
    this._serverOnline  = false;
    this._history       = [];
    this._future        = [];
    this._historyMax    = 30;
    this._historyLocked = false;
  }

  // ── History (Undo/Redo) ────────────────────────────────────────────

  _pushHistory() {
    if (this._historyLocked) return;
    this._history.push(JSON.stringify(this._active().beds));
    if (this._history.length > this._historyMax) this._history.shift();
    this._future = [];
  }

  lockHistory() {
    this._historyLocked = true;
  }

  unlockHistory() {
    this._historyLocked = false;
    this._pushHistory(); // one snapshot after drag/resize ends
  }

  canUndo() { return this._history.length > 0; }
  canRedo()  { return this._future.length  > 0; }

  undo() {
    if (!this.canUndo()) return;
    this._future.push(JSON.stringify(this._active().beds));
    this._active().beds = JSON.parse(this._history.pop());
    this.save();
    bus.emit('beds:changed', this._active().beds);
  }

  redo() {
    if (!this.canRedo()) return;
    this._history.push(JSON.stringify(this._active().beds));
    this._active().beds = JSON.parse(this._future.pop());
    this.save();
    bus.emit('beds:changed', this._active().beds);
  }

  _clearHistory() {
    this._history = [];
    this._future  = [];
  }

  // ── Private helpers ────────────────────────────────────────────────

  /** Returns the active garden object */
  _active() {
    return this.state.gardens.find(g => g.id === this.state.activeGardenId)
      || this.state.gardens[0];
  }

  _calculateNextId() {
    let max = 0;
    const scan = (id) => {
      const n = parseInt((id || '').replace(/[^0-9]/g, '')) || 0;
      if (n > max) max = n;
    };
    for (const g of this.state.gardens) {
      (g.beds      || []).forEach(x => scan(x.id));
      (g.plantings || []).forEach(x => scan(x.id));
      (g.photos    || []).forEach(x => scan(x.id));
      (g.expenses  || []).forEach(x => scan(x.id));
      (g.tasks     || []).forEach(x => scan(x.id));
      (g.harvests  || []).forEach(x => scan(x.id));
    }
    return max + 1;
  }

  generateId(prefix) {
    return `${prefix}-${this.nextId++}`;
  }

  // ── Persistence ────────────────────────────────────────────────────

  /** Normalisiert rohe JSON-Daten (aus localStorage oder Server) in gültigen State */
  _mergeState(parsed) {
    if (!parsed) return JSON.parse(JSON.stringify(defaultState));

    // Altes Single-Garden-Format migrieren
    if (!parsed.gardens && parsed.beds !== undefined) {
      const gardenId = 'garden-1';
      return {
        activeGardenId: gardenId,
        gardens: [{
          id:        gardenId,
          name:      parsed.garden?.name || 'Mein Garten',
          garden:    { ...makeDefaultGarden(gardenId).garden, ...(parsed.garden || {}) },
          beds:      parsed.beds      || [],
          plantings: parsed.plantings || [],
          photos:    parsed.photos    || [],
          expenses:  parsed.expenses  || [],
          tasks:     parsed.tasks     || [],
          harvests:  parsed.harvests  || [],
          levels:    parsed.levels    || JSON.parse(JSON.stringify(DEFAULT_LEVELS)),
          createdAt: new Date().toISOString(),
        }],
        elementTypes: parsed.elementTypes || JSON.parse(JSON.stringify(DEFAULT_ELEMENT_TYPES)),
        customPlants: parsed.customPlants || [],
        settings: { ...defaultState.settings, ...(parsed.settings || {}) },
      };
    }

    // Neues Multi-Garden-Format
    return {
      ...defaultState,
      ...parsed,
      elementTypes: parsed.elementTypes || JSON.parse(JSON.stringify(DEFAULT_ELEMENT_TYPES)),
      customPlants: parsed.customPlants || [],
      settings: { ...defaultState.settings, ...(parsed.settings || {}) },
      gardens: (parsed.gardens || []).map(g => ({
        ...makeDefaultGarden(g.id, g.name),
        ...g,
        levels: g.levels || JSON.parse(JSON.stringify(DEFAULT_LEVELS)),
      })),
    };
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return this._mergeState(JSON.parse(raw));
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(defaultState));
  }

  /**
   * Speichert sofort in localStorage (synchron) und
   * plant asynchron einen debounced Server-Push.
   */
  save() {
    // 1. localStorage — sofort, synchron (Fallback & Cache)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('localStorage-Fehler:', e);
    }
    // 2. Server — debounced, nicht-blockierend
    this._scheduleSave();
  }

  _scheduleSave() {
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => this._pushToServer(), 600);
  }

  async _pushToServer() {
    try {
      const res = await fetch('/api/data', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(this.state),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!this._serverOnline) {
        this._serverOnline = true;
        bus.emit('server:status', true);
      }
    } catch {
      if (this._serverOnline) {
        this._serverOnline = false;
        bus.emit('server:status', false);
      }
    }
  }

  /**
   * Lädt Daten vom lokalen Server (autoritativ).
   * Wird einmalig nach App-Start aufgerufen.
   * Fallback: localStorage bleibt aktiv wenn Server nicht erreichbar.
   */
  async initFromServer() {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      this._serverOnline = true;
      bus.emit('server:status', true);

      if (!data) {
        // Server hat noch keine Daten → lokale Daten initial hochladen
        console.info('[Store] Server leer → lokale Daten werden hochgeladen.');
        await this._pushToServer();
        return;
      }

      // Server-Daten sind autoritativ → State ersetzen
      const merged = this._mergeState(data);
      const changed = JSON.stringify(merged) !== JSON.stringify(this.state);
      if (changed) {
        this.state  = merged;
        this.nextId = this._calculateNextId();
        this._clearHistory();
        // Lokalen Cache aktualisieren
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state)); } catch {}
        bus.emit('store:reloaded');
      }
    } catch {
      this._serverOnline = false;
      bus.emit('server:status', false);
      console.info('[Store] Server nicht erreichbar – lokaler Modus aktiv (localStorage).');
    }
  }

  // ── Multi-Garden API ───────────────────────────────────────────────

  getGardens() {
    return this.state.gardens;
  }

  getActiveGardenId() {
    return this.state.activeGardenId;
  }

  switchGarden(id) {
    if (!this.state.gardens.find(g => g.id === id)) return;
    this.state.activeGardenId = id;
    this.nextId = this._calculateNextId();
    this._clearHistory();
    this.save();
    bus.emit('garden:switched', this._active());
  }

  createGarden(name) {
    const id = `garden-${Date.now()}`;
    const g = makeDefaultGarden(id, name);
    this.state.gardens.push(g);
    this.save();
    bus.emit('gardens:changed', this.state.gardens);
    return g;
  }

  deleteGarden(id) {
    if (this.state.gardens.length <= 1) return; // always keep at least one
    this.state.gardens = this.state.gardens.filter(g => g.id !== id);
    if (this.state.activeGardenId === id) {
      this.state.activeGardenId = this.state.gardens[0].id;
      this.nextId = this._calculateNextId();
    }
    this.save();
    bus.emit('gardens:changed', this.state.gardens);
    bus.emit('garden:switched', this._active());
  }

  renameGarden(id, name) {
    const g = this.state.gardens.find(g => g.id === id);
    if (!g) return;
    g.name = name;
    g.garden.name = name;
    this.save();
    bus.emit('gardens:changed', this.state.gardens);
    if (id === this.state.activeGardenId) bus.emit('garden:changed', g.garden);
  }

  // ── Garden / Property (delegates to active) ────────────────────────

  getGarden() {
    return this._active().garden;
  }

  updateGarden(updates) {
    Object.assign(this._active().garden, updates);
    if (updates.name) this._active().name = updates.name;
    this.save();
    bus.emit('garden:changed', this._active().garden);
  }

  // ── Beds ───────────────────────────────────────────────────────────

  getBeds() {
    return this._active().beds;
  }

  getBed(id) {
    return this._active().beds.find(b => b.id === id);
  }

  addBed(bed) {
    this._pushHistory();
    const newBed = {
      id:           this.generateId('bed'),
      name:         bed.name || `Objekt ${this._active().beds.length + 1}`,
      kind:         bed.kind || 'type-bed',
      levelId:      bed.levelId || 'level-1',
      type:         bed.type || 'rect',
      x:            bed.x || 100,
      y:            bed.y || 100,
      width:        bed.width || 200,
      height:       bed.height || 150,
      color:        bed.color || '',
      rotation:     bed.rotation || 0,
      customHeight: bed.customHeight || null,
      soil:         bed.soil || 'normal',
      moisture:     bed.moisture || 'normal',
      points:       bed.points || [],
      notes:        bed.notes || '',
      createdAt:    new Date().toISOString(),
    };
    this._active().beds.push(newBed);
    this.save();
    bus.emit('beds:changed', this._active().beds);
    bus.emit('bed:added', newBed);
    return newBed;
  }

  updateBed(id, updates) {
    const bed = this.getBed(id);
    if (!bed) return null;
    this._pushHistory();
    Object.assign(bed, updates);
    this.save();
    bus.emit('beds:changed', this._active().beds);
    bus.emit('bed:updated', bed);
    return bed;
  }

  deleteBed(id) {
    this._pushHistory();
    const active = this._active();
    active.beds      = active.beds.filter(b => b.id !== id);
    active.plantings = active.plantings.filter(p => p.bedId !== id);
    active.photos    = active.photos.filter(p => p.bedId !== id);
    this.save();
    bus.emit('beds:changed', active.beds);
    bus.emit('bed:deleted', id);
  }

  // ── Plantings ──────────────────────────────────────────────────────

  getPlantings(bedId) {
    const all = this._active().plantings;
    return bedId ? all.filter(p => p.bedId === bedId) : all;
  }

  addPlanting(planting) {
    const newPlanting = {
      id:                  this.generateId('planting'),
      bedId:               planting.bedId,
      name:                planting.name,
      emoji:               planting.emoji || '🌱',
      category:            planting.category || '',
      datePlanted:         planting.datePlanted || null,
      dateHarvest:         planting.dateHarvest || null,
      dateHarvestExpected: planting.dateHarvestExpected || null,
      status:              planting.status || 'planned',
      quantity:            planting.quantity || null,
      variety:             planting.variety || '',
      spacing:             planting.spacing || null,
      notes:               planting.notes || '',
      createdAt:           new Date().toISOString(),
    };
    this._active().plantings.push(newPlanting);
    this.save();
    bus.emit('plantings:changed', this._active().plantings);
    bus.emit('planting:added', newPlanting);
    return newPlanting;
  }

  updatePlanting(id, updates) {
    const p = this._active().plantings.find(p => p.id === id);
    if (!p) return null;
    Object.assign(p, updates);
    this.save();
    bus.emit('plantings:changed', this._active().plantings);
    return p;
  }

  deletePlanting(id) {
    const active = this._active();
    active.plantings = active.plantings.filter(p => p.id !== id);
    this.save();
    bus.emit('plantings:changed', active.plantings);
  }

  // ── Photos ─────────────────────────────────────────────────────────

  getPhotos(bedId) {
    const all = this._active().photos;
    return bedId ? all.filter(p => p.bedId === bedId) : all;
  }

  addPhoto(photo) {
    const newPhoto = {
      id:        this.generateId('photo'),
      bedId:     photo.bedId || null,
      dataUrl:   photo.dataUrl,
      caption:   photo.caption || '',
      takenAt:   photo.takenAt || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this._active().photos.push(newPhoto);
    this.save();
    bus.emit('photos:changed', this._active().photos);
    return newPhoto;
  }

  updatePhoto(id, updates) {
    const p = this._active().photos.find(p => p.id === id);
    if (!p) return null;
    Object.assign(p, updates);
    this.save();
    bus.emit('photos:changed', this._active().photos);
    return p;
  }

  deletePhoto(id) {
    const active = this._active();
    active.photos = active.photos.filter(p => p.id !== id);
    this.save();
    bus.emit('photos:changed', active.photos);
  }

  // ── Expenses ───────────────────────────────────────────────────────

  getExpenses() {
    return this._active().expenses || [];
  }

  addExpense(expense) {
    if (!this._active().expenses) this._active().expenses = [];
    const newExpense = {
      id:       this.generateId('expense'),
      name:     expense.name || 'Neuer Posten',
      amount:   expense.amount || 0,
      date:     expense.date || new Date().toISOString(),
      category: expense.category || 'misc',
    };
    this._active().expenses.push(newExpense);
    this.save();
    bus.emit('expenses:changed', this._active().expenses);
    return newExpense;
  }

  deleteExpense(id) {
    const active = this._active();
    active.expenses = (active.expenses || []).filter(e => e.id !== id);
    this.save();
    bus.emit('expenses:changed', active.expenses);
  }

  // ── Tasks ──────────────────────────────────────────────────────────

  getTasks() {
    return this._active().tasks || [];
  }

  addTask(task) {
    if (!this._active().tasks) this._active().tasks = [];
    const newTask = {
      id:        this.generateId('task'),
      title:     task.title || 'Neue Aufgabe',
      completed: task.completed || false,
      dueDate:   task.dueDate || null,
      bedId:     task.bedId || null,
    };
    this._active().tasks.push(newTask);
    this.save();
    bus.emit('tasks:changed', this._active().tasks);
    return newTask;
  }

  updateTask(id, updates) {
    const t = (this._active().tasks || []).find(t => t.id === id);
    if (!t) return null;
    Object.assign(t, updates);
    this.save();
    bus.emit('tasks:changed', this._active().tasks);
    return t;
  }

  deleteTask(id) {
    const active = this._active();
    active.tasks = (active.tasks || []).filter(t => t.id !== id);
    this.save();
    bus.emit('tasks:changed', active.tasks);
  }

  // ── Harvests ──────────────────────────────────────────────────────

  getHarvests(plantingId) {
    const all = this._active().harvests || [];
    return plantingId ? all.filter(h => h.plantingId === plantingId) : all;
  }

  addHarvest(harvest) {
    if (!this._active().harvests) this._active().harvests = [];
    const newHarvest = {
      id:         this.generateId('harvest'),
      plantingId: harvest.plantingId,
      bedId:      harvest.bedId || null,
      plantName:  harvest.plantName || '',
      plantEmoji: harvest.plantEmoji || '🌱',
      date:       harvest.date || new Date().toISOString().split('T')[0],
      amount:     harvest.amount || 0,
      unit:       harvest.unit || 'kg',
      notes:      harvest.notes || '',
      createdAt:  new Date().toISOString(),
    };
    this._active().harvests.push(newHarvest);
    this.save();
    bus.emit('harvests:changed', this._active().harvests);
    return newHarvest;
  }

  deleteHarvest(id) {
    const active = this._active();
    active.harvests = (active.harvests || []).filter(h => h.id !== id);
    this.save();
    bus.emit('harvests:changed', active.harvests);
  }

  // ── Settings (global) ──────────────────────────────────────────────

  getSettings() {
    return this.state.settings;
  }

  updateSettings(updates) {
    Object.assign(this.state.settings, updates);
    this.save();
    bus.emit('settings:changed', this.state.settings);
  }

  // ── Custom Plants (global) ─────────────────────────────────────────

  getCustomPlants() {
    return this.state.customPlants || [];
  }

  addCustomPlant(plant) {
    if (!this.state.customPlants) this.state.customPlants = [];
    const idx = this.state.customPlants.findIndex(p => p.name.toLowerCase() === plant.name.toLowerCase());
    if (idx !== -1) {
      this.state.customPlants[idx] = { ...this.state.customPlants[idx], ...plant };
    } else {
      this.state.customPlants.push(plant);
    }
    this.save();
    bus.emit('customplants:changed', this.state.customPlants);
  }

  updateCustomPlant(originalName, plantUpdates) {
    if (!this.state.customPlants) this.state.customPlants = [];
    const idx = this.state.customPlants.findIndex(p => p.name.toLowerCase() === originalName.toLowerCase());
    if (idx !== -1) {
      this.state.customPlants[idx] = { ...this.state.customPlants[idx], ...plantUpdates };
    } else {
      this.state.customPlants.push({ name: originalName, ...plantUpdates });
    }
    this.save();
    bus.emit('customplants:changed', this.state.customPlants);
  }

  deleteCustomPlant(name) {
    if (!this.state.customPlants) return;
    this.state.customPlants = this.state.customPlants.filter(p => p.name.toLowerCase() !== name.toLowerCase());
    this.save();
    bus.emit('customplants:changed', this.state.customPlants);
  }

  // ── Element Types (global) ─────────────────────────────────────────

  getElementTypes() {
    return this.state.elementTypes;
  }

  updateElementTypes(types) {
    this.state.elementTypes = types;
    this.save();
    bus.emit('types:changed', types);
  }

  // ── Levels (per garden) ────────────────────────────────────────────

  getLevels() {
    return this._active().levels;
  }

  updateLevels(levels) {
    this._active().levels = levels;
    this.save();
    bus.emit('levels:changed', levels);
  }
}

export const store = new Store();
export default Store;
