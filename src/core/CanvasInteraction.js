/**
 * CanvasInteraction — Mouse/Touch events, drag & drop, resize, pan, zoom
 */
import { store } from './Store.js';
import { bus } from './EventBus.js';
import { clamp } from '../utils/helpers.js';

export class CanvasInteraction {
  constructor(renderer) {
    this.renderer = renderer;
    this.canvas = renderer.canvas;
    this.tool = 'select'; // select, rect, circle, lshaped
    this.isDragging = false;
    this.isPanning = false;
    this.isResizing = false;
    this.isDrawing = false;
    this.dragStart = { x: 0, y: 0 };
    this.dragOffset = { x: 0, y: 0 };
    this.resizeHandle = null;
    this.resizeStartBed = null;
    this.drawStart = null;
    this.enabled = true;
    
    // Intra-Bed Planting State
    this.plantingMode = false;
    this.editingBedId = null;
    this.editingPlantingId = null;
    this.plantingTool = 'point'; // 'point', 'line', 'area'
    
    this.renderer.interaction = this;

    this._bindEvents();
  }

  setTool(tool) {
    this.tool = tool;
    this.canvas.style.cursor = tool === 'select' ? 'default' : 'crosshair';
  }

  _bindEvents() {
    this.canvas.addEventListener('mousedown', (e) => this._onMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this._onMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this._onMouseUp(e));
    this.canvas.addEventListener('mouseleave', () => this._onMouseLeave());
    this.canvas.addEventListener('wheel', (e) => this._onWheel(e), { passive: false });
    this.canvas.addEventListener('dblclick', (e) => this._onDblClick(e));
    this.canvas.addEventListener('contextmenu', (e) => this._onContextMenu(e));

    // Touch support
    this.canvas.addEventListener('touchstart', (e) => this._onTouchStart(e), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => this._onTouchMove(e), { passive: false });
    this.canvas.addEventListener('touchend', (e) => this._onTouchEnd(e));

    // Planting Mode bindings
    bus.on('planting:draw', (data) => this.startPlantingMode(data.bedId, data.plantingId));

    document.getElementById('tool-plant-point')?.addEventListener('click', (e) => this._setPlantingTool('point', e.currentTarget));
    document.getElementById('tool-plant-line')?.addEventListener('click', (e) => this._setPlantingTool('line', e.currentTarget));
    document.getElementById('tool-plant-area')?.addEventListener('click', (e) => this._setPlantingTool('area', e.currentTarget));
    document.getElementById('btn-finish-planting')?.addEventListener('click', () => this.stopPlantingMode());
  }

  _setPlantingTool(tool, element) {
    this.plantingTool = tool;
    document.querySelectorAll('#planting-toolbar .tool-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
  }

  startPlantingMode(bedId, plantingId) {
    this.plantingMode = true;
    this.editingBedId = bedId;
    this.editingPlantingId = plantingId;
    this.setTool('select'); // Base tool
    this.renderer.selectedBedId = bedId; // Focus visually
    
    const toolbar = document.getElementById('planting-toolbar');
    if (toolbar) toolbar.classList.remove('hidden');

    const planting = store.getPlantings().find(p => p.id === plantingId);
    if (planting) {
      document.getElementById('planting-mode-label').textContent = planting.name + ' pflanzen';
    }
  }

  stopPlantingMode() {
    this.plantingMode = false;
    this.editingBedId = null;
    this.editingPlantingId = null;
    this.isDrawing = false;
    this.drawStart = null;
    const toolbar = document.getElementById('planting-toolbar');
    if (toolbar) toolbar.classList.add('hidden');
    this.renderer.render();
  }

  _getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  _onMouseDown(e) {
    if (!this.enabled) return;
    const pos = this._getMousePos(e);
    const world = this.renderer.screenToWorld(pos.x, pos.y);

    if (this.plantingMode && this.editingBedId && this.editingPlantingId) {
      if (e.button === 1) {
        // middle click pan allowed
      } else {
        if (this.plantingTool === 'point') {
           this._savePlantingPlacement('point', { x: world.x, y: world.y });
        } else {
           this.isDrawing = true;
           this.drawStart = { x: world.x, y: world.y, type: this.plantingTool };
           if (this.plantingTool === 'line') {
             this.polygonPoints = [{ x: world.x, y: world.y }];
           }
        }
        return;
      }
    }

    // Drawing mode: create new bed
    if (this.tool !== 'select') {
      if (this.tool === 'polygon' || this.tool === 'line') {
        this.isDrawing = true;
        this.polygonPoints = [{ x: world.x, y: world.y }];
        this.lastDrawPoint = { x: world.x, y: world.y };
        return;
      }
      if (this.tool === 'measure') {
        if (!this.isMeasuring) {
          this.isMeasuring = true;
          this.drawStart = { x: world.x, y: world.y };
          this.measureEnd = { x: world.x, y: world.y };
        } else {
          this.isMeasuring = false;
          this.measureEnd = { x: world.x, y: world.y };
        }
        this.renderer.render();
        return;
      }
      this.isDrawing = true;
      this.drawStart = { x: world.x, y: world.y, type: this.tool };
      return;
    }

    // Middle mouse button = pan
    if (e.button === 1) {
      e.preventDefault();
      this.isPanning = true;
      this.dragStart = { x: e.clientX, y: e.clientY };
      this.dragOffset = { x: this.renderer.offsetX, y: this.renderer.offsetY };
      this.canvas.style.cursor = 'grabbing';
      return;
    }

    // Check resize handles first
    const handle = this.renderer.getHandleAtPosition(world.x, world.y);
    if (handle) {
      this.isResizing = true;
      this.resizeHandle = handle;
      const bed = store.getBed(this.renderer.selectedBedId);
      this.resizeStartBed = { ...bed };
      this.dragStart = { x: world.x, y: world.y };
      store.lockHistory();
      return;
    }

    // Check if clicking a bed
    const bed = this.renderer.getBedAtPosition(world.x, world.y);
    if (bed) {
      this.renderer.selectedBedId = bed.id;
      this.isDragging = true;
      this.renderer.draggingBedId = bed.id;
      this.dragStart = { x: world.x, y: world.y };
      this.dragOffset = { x: bed.x, y: bed.y };
      this.canvas.style.cursor = 'move';
      store.lockHistory();
      bus.emit('bed:selected', bed);
    } else {
      // Deselect
      if (this.renderer.selectedBedId) {
        this.renderer.selectedBedId = null;
        bus.emit('bed:deselected');
      }
      // Start panning
      this.isPanning = true;
      this.dragStart = { x: e.clientX, y: e.clientY };
      this.dragOffset = { x: this.renderer.offsetX, y: this.renderer.offsetY };
      this.canvas.style.cursor = 'grabbing';
    }

    this.renderer.render();
  }

  _onMouseMove(e) {
    if (!this.enabled) return;
    const pos = this._getMousePos(e);
    const world = this.renderer.screenToWorld(pos.x, pos.y);

    this.lastHoverPoint = world;

    if (this.isDrawing) {
      if (this.tool === 'polygon' || this.tool === 'line') {
        const dx = world.x - this.lastDrawPoint.x;
        const dy = world.y - this.lastDrawPoint.y;
        if (Math.sqrt(dx*dx + dy*dy) > 10) {
           this.polygonPoints.push({ x: world.x, y: world.y });
           this.lastDrawPoint = { x: world.x, y: world.y };
        }
        this.renderer.render();
        return;
      }
    }
    
    if (this.tool === 'measure' && this.isMeasuring) {
      this.measureEnd = { x: world.x, y: world.y };
      this.renderer.render();
      return;
    }

    if (this.isDrawing && this.drawStart) {
      this.renderer.render();
      return;
    }

    if (this.isPanning) {
      const dx = e.clientX - this.dragStart.x;
      const dy = e.clientY - this.dragStart.y;
      this.renderer.setOffset(this.dragOffset.x + dx, this.dragOffset.y + dy);
      return;
    }

    if (this.isDragging && this.renderer.selectedBedId) {
      const dx = world.x - this.dragStart.x;
      const dy = world.y - this.dragStart.y;
      const gridSize = store.getSettings().showGrid ? this.renderer.gridSize : 1;
      const newX = Math.round((this.dragOffset.x + dx) / gridSize) * gridSize;
      const newY = Math.round((this.dragOffset.y + dy) / gridSize) * gridSize;
      store.updateBed(this.renderer.selectedBedId, { x: newX, y: newY });
      this.renderer.render();
      return;
    }

    if (this.isResizing && this.resizeHandle && this.resizeStartBed) {
      const dx = world.x - this.dragStart.x;
      const dy = world.y - this.dragStart.y;
      const bed = this.resizeStartBed;
      
      if (this.resizeHandle.pos === 'rot') {
        const cx = bed.x + bed.width / 2;
        const cy = bed.y + bed.height / 2;
        let angle = Math.atan2(world.y - cy, world.x - cx) * 180 / Math.PI;
        let newRot = Math.round(angle + 90);
        if (newRot < 0) newRot += 360;
        store.updateBed(this.renderer.selectedBedId, { rotation: newRot });
        this.renderer.render();
        return;
      }
      
      const gridSize = this.renderer.gridSize;
      let updates = {};

      const pos = this.resizeHandle.pos;
      if (pos.includes('e')) {
        updates.width = Math.max(gridSize * 2, Math.round((bed.width + dx) / gridSize) * gridSize);
      }
      if (pos.includes('w')) {
        const newW = Math.max(gridSize * 2, Math.round((bed.width - dx) / gridSize) * gridSize);
        updates.width = newW;
        updates.x = Math.round((bed.x + bed.width - newW) / gridSize) * gridSize;
      }
      if (pos.includes('s')) {
        updates.height = Math.max(gridSize * 2, Math.round((bed.height + dy) / gridSize) * gridSize);
      }
      if (pos.includes('n')) {
        const newH = Math.max(gridSize * 2, Math.round((bed.height - dy) / gridSize) * gridSize);
        updates.height = newH;
        updates.y = Math.round((bed.y + bed.height - newH) / gridSize) * gridSize;
      }

      store.updateBed(this.renderer.selectedBedId, updates);
      this.renderer.render();
      return;
    }

    // Hover effects
    if (this.tool === 'select') {
      const handle = this.renderer.getHandleAtPosition(world.x, world.y);
      if (handle) {
        const cursors = {
          nw: 'nw-resize', ne: 'ne-resize', sw: 'sw-resize', se: 'se-resize',
          n: 'n-resize', s: 's-resize', w: 'w-resize', e: 'e-resize',
          rot: 'grab'
        };
        this.canvas.style.cursor = cursors[handle.pos] || 'pointer';
      } else {
        const bed = this.renderer.getBedAtPosition(world.x, world.y);
        const newHoveredId = bed ? bed.id : null;
        if (newHoveredId !== this.renderer.hoveredBedId) {
          this.renderer.hoveredBedId = newHoveredId;
          this.renderer.render();
        }
        this.canvas.style.cursor = bed ? 'pointer' : 'default';
      }
    }
  }

  _onMouseUp(e) {
    if (!this.enabled) return;

    if (this.plantingMode && this.isDrawing && this.drawStart) {
      const pos = this._getMousePos(e);
      const world = this.renderer.screenToWorld(pos.x, pos.y);
      if (this.drawStart.type === 'line') {
         this._savePlantingPlacement('line', {
             p1: { x: this.drawStart.x, y: this.drawStart.y },
             p2: { x: world.x, y: world.y }
         });
      } else if (this.drawStart.type === 'area') {
         const x = Math.min(this.drawStart.x, world.x);
         const y = Math.min(this.drawStart.y, world.y);
         const w = Math.abs(world.x - this.drawStart.x);
         const h = Math.abs(world.y - this.drawStart.y);
         if (w > 10 && h > 10) {
            this._savePlantingPlacement('area', { x, y, w, h });
         }
      }
      this.isDrawing = false;
      this.drawStart = null;
      this.renderer.render();
      return;
    }
    
    if (this.isDrawing && (this.tool === 'polygon' || this.tool === 'line')) {
      if (this.polygonPoints && this.polygonPoints.length > 1) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        this.polygonPoints.forEach(p => {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        });
        
        let width = Math.max(20, maxX - minX);
        let height = Math.max(20, maxY - minY);
        
        const normPoints = this.polygonPoints.map(p => ({ x: p.x - minX, y: p.y - minY }));
        
        const bed = store.addBed({
          type: this.tool === 'line' ? 'line' : 'polygon',
          x: minX,
          y: minY,
          width: width,
          height: height,
          points: normPoints,
          isClosed: this.tool === 'polygon', 
        });
        this.renderer.selectedBedId = bed.id;
        bus.emit('bed:selected', bed);
      }
      this.isDrawing = false;
      this.polygonPoints = [];
      this.setTool('select');
      
      document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
      document.getElementById('tool-select')?.classList.add('active');
      this.renderer.render();
      return;
    }
    
    // Wir fangen das mouseup des Measure Tools hier ab – keine Aktion nötig,
    // da Measure auf Klick reagiert, nicht Drag.
    if (this.tool === 'measure') {
      return;
    }
    
    if (this.isDrawing && this.drawStart) {
      const pos = this._getMousePos(e);
      const world = this.renderer.screenToWorld(pos.x, pos.y);
      const x = Math.min(this.drawStart.x, world.x);
      const y = Math.min(this.drawStart.y, world.y);
      const w = Math.abs(world.x - this.drawStart.x);
      const h = Math.abs(world.y - this.drawStart.y);

      if (w > 20 && h > 20) {
        const gridSize = this.renderer.gridSize;
        const bed = store.addBed({
          type: this.drawStart.type,
          x: Math.round(x / gridSize) * gridSize,
          y: Math.round(y / gridSize) * gridSize,
          width: Math.round(w / gridSize) * gridSize,
          height: Math.round(h / gridSize) * gridSize,
        });
        this.renderer.selectedBedId = bed.id;
        bus.emit('bed:selected', bed);
      }
      this.isDrawing = false;
      this.drawStart = null;
      // Switch back to select
      this.setTool('select');
      bus.emit('tool:changed', 'select');
    }

    if (this.isDragging || this.isResizing) {
      store.unlockHistory();
    }
    this.isDragging = false;
    this.isPanning = false;
    this.isResizing = false;
    this.resizeHandle = null;
    this.resizeStartBed = null;
    this.renderer.draggingBedId = null;
    if (this.tool === 'select') {
      this.canvas.style.cursor = 'default';
    }
    this.renderer.render();
  }

  _onMouseLeave() {
    if (!this.enabled) return;
    this.renderer.hoveredBedId = null;
    this.renderer.render();
  }

  _onWheel(e) {
    if (!this.enabled) return;
    e.preventDefault();
    const pos = this._getMousePos(e);
    const worldBefore = this.renderer.screenToWorld(pos.x, pos.y);

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = clamp(this.renderer.zoom * delta, 0.2, 3);
    this.renderer.zoom = newZoom;

    // Keep the point under cursor stable
    const worldAfter = this.renderer.screenToWorld(pos.x, pos.y);
    this.renderer.offsetX += (worldAfter.x - worldBefore.x) * this.renderer.zoom;
    this.renderer.offsetY += (worldAfter.y - worldBefore.y) * this.renderer.zoom;

    this.renderer.render();
    bus.emit('zoom:changed', newZoom);
  }

  _onDblClick(e) {
    if (!this.enabled) return;
    const pos = this._getMousePos(e);
    const world = this.renderer.screenToWorld(pos.x, pos.y);
    const bed = this.renderer.getBedAtPosition(world.x, world.y);
    if (bed) {
      // If already in focus mode for this bed, exit
      if (this.renderer.focusBedId === bed.id) {
        this.renderer.exitFocus();
      } else {
        this.renderer.focusBed(bed.id);
      }
    } else if (this.renderer.focusBedId) {
      // Doppelklick auf leere Fläche beendet Fokus
      this.renderer.exitFocus();
    }
  }

  _onContextMenu(e) {
    e.preventDefault();
    if (!this.enabled) return;

    const pos = this._getMousePos(e);
    const world = this.renderer.screenToWorld(pos.x, pos.y);
    const bed = this.renderer.getBedAtPosition(world.x, world.y);

    if (bed) {
      // Select the bed so context actions apply to it
      this.renderer.selectedBedId = bed.id;
      this.renderer.render();
      bus.emit('bed:selected', bed);
      this._showContextMenu(e.clientX, e.clientY, bed);
    } else {
      this._hideContextMenu();
    }
  }

  _showContextMenu(clientX, clientY, bed) {
    this._hideContextMenu(); // remove any existing menu

    const levels = store.getLevels();
    const types  = store.getElementTypes();
    const currentType = types.find(t => t.id === bed.kind) || types[0];
    const hasPlantings = currentType?.hasPlantings;

    const menu = document.createElement('div');
    menu.id = 'canvas-context-menu';
    menu.className = 'context-menu';

    // Build level submenu items
    const levelItems = levels.length > 1
      ? levels.map(l => `
          <div class="context-menu-item context-menu-sub${l.id === bed.levelId ? ' active' : ''}" data-action="level" data-level-id="${l.id}">
            <span class="ctx-icon">⛰️</span> ${l.name}${l.id === bed.levelId ? ' ✓' : ''}
          </div>`).join('')
      : `<div class="context-menu-item disabled"><span class="ctx-icon">⛰️</span> Nur eine Ebene vorhanden</div>`;

    menu.innerHTML = `
      <div class="context-menu-header">${bed.name || 'Element'}</div>
      ${hasPlantings ? `
        <div class="context-menu-item" data-action="plant">
          <span class="ctx-icon">🌱</span> Pflanzung hinzufügen
        </div>
      ` : ''}
      <div class="context-menu-item" data-action="focus">
        <span class="ctx-icon">🔍</span> Fokus (Beet einzoomen)
      </div>
      <div class="context-menu-item" data-action="rename">
        <span class="ctx-icon">✏️</span> Umbenennen
      </div>
      <div class="context-menu-item" data-action="duplicate">
        <span class="ctx-icon">📋</span> Duplizieren
      </div>
      <div class="context-menu-separator"></div>
      <div class="context-menu-label">Ebene wechseln</div>
      ${levelItems}
      <div class="context-menu-separator"></div>
      <div class="context-menu-item context-menu-danger" data-action="delete">
        <span class="ctx-icon">🗑️</span> Löschen
      </div>
    `;

    // Position: keep within viewport
    document.body.appendChild(menu);
    const menuW = menu.offsetWidth || 200;
    const menuH = menu.offsetHeight || 250;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    menu.style.left = `${Math.min(clientX, vw - menuW - 8)}px`;
    menu.style.top  = `${Math.min(clientY, vh - menuH - 8)}px`;

    // Bind action clicks
    menu.querySelectorAll('.context-menu-item[data-action]').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        this._hideContextMenu();

        if (action === 'plant') {
          bus.emit('bed:addPlanting', bed);
        } else if (action === 'focus') {
          this.renderer.focusBed(bed.id);
        } else if (action === 'rename') {
          const newName = prompt('Neuer Name:', bed.name);
          if (newName && newName.trim()) {
            store.updateBed(bed.id, { name: newName.trim() });
            this.renderer.render();
            bus.emit('bed:selected', store.getBed(bed.id));
          }
        } else if (action === 'duplicate') {
          const offset = 20;
          const newBed = store.addBed({
            ...bed,
            id: undefined,
            x: bed.x + offset,
            y: bed.y + offset,
            name: bed.name + ' (Kopie)',
          });
          this.renderer.selectedBedId = newBed.id;
          this.renderer.render();
          bus.emit('bed:selected', newBed);
        } else if (action === 'level') {
          const levelId = item.dataset.levelId;
          store.updateBed(bed.id, { levelId });
          this.renderer.render();
          bus.emit('bed:selected', store.getBed(bed.id));
        } else if (action === 'delete') {
          if (confirm(`"${bed.name}" wirklich löschen?`)) {
            store.deleteBed(bed.id);
            this.renderer.selectedBedId = null;
            this.renderer.render();
            bus.emit('bed:deselected');
          }
        }
      });
    });

    // Close on outside click
    const closeHandler = (ev) => {
      if (!menu.contains(ev.target)) {
        this._hideContextMenu();
        document.removeEventListener('mousedown', closeHandler);
      }
    };
    setTimeout(() => document.addEventListener('mousedown', closeHandler), 10);
  }

  _hideContextMenu() {
    document.getElementById('canvas-context-menu')?.remove();
  }

  // Basic touch support
  _onTouchStart(e) {
    if (!this.enabled) return;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this._onMouseDown({ clientX: touch.clientX, clientY: touch.clientY, button: 0, preventDefault: () => {} });
    }
  }

  _onTouchMove(e) {
    if (!this.enabled) return;
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this._onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
    }
  }

  _onTouchEnd(e) {
    if (!this.enabled) return;
    this._onMouseUp({ clientX: 0, clientY: 0, button: 0, preventDefault: () => {} });
  }

  drawPreview(ctx) {
    // Hinweis: ctx ist bereits mit translate(offsetX, offsetY) + scale(zoom) transformiert
    // (durch _draw() in CanvasRenderer). Hier NUR Linestyle-spezifische save/restore.

    if (this.tool === 'polygon' || this.tool === 'line') {
      if (this.polygonPoints && this.polygonPoints.length > 0) {
        ctx.save();
        ctx.fillStyle = 'rgba(74, 222, 128, 0.2)';
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.polygonPoints[0].x, this.polygonPoints[0].y);
        for (let i = 1; i < this.polygonPoints.length; i++) {
          ctx.lineTo(this.polygonPoints[i].x, this.polygonPoints[i].y);
        }
        if (this.lastHoverPoint) {
          ctx.lineTo(this.lastHoverPoint.x, this.lastHoverPoint.y);
        }
        ctx.stroke();
        ctx.restore();
      }
    } else if (this.tool === 'measure' && this.drawStart && this.measureEnd) {
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(this.drawStart.x, this.drawStart.y);
      ctx.lineTo(this.measureEnd.x, this.measureEnd.y);
      ctx.stroke();

      const distPx = Math.sqrt(
        Math.pow(this.measureEnd.x - this.drawStart.x, 2) +
        Math.pow(this.measureEnd.y - this.drawStart.y, 2)
      );
      const cx = (this.drawStart.x + this.measureEnd.x) / 2;
      const cy = (this.drawStart.y + this.measureEnd.y) / 2;

      ctx.setLineDash([]);
      ctx.fillStyle = '#ef4444';
      ctx.font = `bold ${14 / this.renderer.zoom}px Inter`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${(distPx / 100).toFixed(2)} m`, cx, cy - 8);
      ctx.restore();
    } else if (this.isDrawing && this.drawStart && this.lastHoverPoint && ['rect', 'circle', 'lshaped'].includes(this.tool)) {
      ctx.save();
      ctx.fillStyle = 'rgba(74, 222, 128, 0.2)';
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      const w = Math.abs(this.lastHoverPoint.x - this.drawStart.x);
      const h = Math.abs(this.lastHoverPoint.y - this.drawStart.y);
      const x = Math.min(this.drawStart.x, this.lastHoverPoint.x);
      const y = Math.min(this.drawStart.y, this.lastHoverPoint.y);

      if (this.tool === 'circle') {
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 4);
        ctx.fill();
        ctx.stroke();
      }

      // Dimension + area label near cursor
      if (w > 5 && h > 5) {
        const wM = (w / 100).toFixed(2);
        const hM = (h / 100).toFixed(2);
        let areaText;
        if (this.tool === 'circle') {
          const rx = w / 2 / 100, ry = h / 2 / 100;
          areaText = `${wM} × ${hM} m  (${(Math.PI * rx * ry).toFixed(2)} m²)`;
        } else {
          areaText = `${wM} × ${hM} m  (${((w * h) / 10000).toFixed(2)} m²)`;
        }
        const fontSize = Math.max(12, 14 / this.renderer.zoom);
        ctx.setLineDash([]);
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        const textW = ctx.measureText(areaText).width;
        const px = this.lastHoverPoint.x + 10 / this.renderer.zoom;
        const py = this.lastHoverPoint.y - 6 / this.renderer.zoom;
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.beginPath();
        ctx.roundRect(px - 4, py - fontSize, textW + 8, fontSize + 6, 4);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(areaText, px, py);
      }

      ctx.restore();
    }
  }

  _savePlantingPlacement(type, geometry) {
    const bed = store.getBed(this.editingBedId);
    if (!bed) return;
    const planting = store.getPlantings().find(p => p.id === this.editingPlantingId);
    if (!planting) return;

    // Convert world coordinates to bed-relative coordinates
    // Bed center:
    const cx = bed.x + bed.width / 2;
    const cy = bed.y + bed.height / 2;
    const angleRad = -(bed.rotation || 0) * Math.PI / 180;
    
    // Function to rotate a point back by the bed's rotation around its center
    const unrotate = (px, py) => {
       const dx = px - cx;
       const dy = py - cy;
       return {
         x: cx + dx * Math.cos(angleRad) - dy * Math.sin(angleRad),
         y: cy + dx * Math.sin(angleRad) + dy * Math.cos(angleRad)
       };
    };

    let locData = { type };
    if (type === 'point') {
       const local = unrotate(geometry.x, geometry.y);
       locData.x = local.x - bed.x;
       locData.y = local.y - bed.y;
    } else if (type === 'line') {
       const l1 = unrotate(geometry.p1.x, geometry.p1.y);
       const l2 = unrotate(geometry.p2.x, geometry.p2.y);
       locData.p1 = { x: l1.x - bed.x, y: l1.y - bed.y };
       locData.p2 = { x: l2.x - bed.x, y: l2.y - bed.y };
    } else if (type === 'area') {
       const lt = unrotate(geometry.x, geometry.y);
       locData.x = lt.x - bed.x;
       locData.y = lt.y - bed.y;
       locData.w = geometry.w;
       locData.h = geometry.h;
    }

    const placements = planting.placements || [];
    placements.push(locData);
    store.updatePlanting(planting.id, { placements });
    
    this.renderer.render(); // Redraw immediately to show new placement
  }
}
