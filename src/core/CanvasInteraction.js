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

    // Touch support
    this.canvas.addEventListener('touchstart', (e) => this._onTouchStart(e), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => this._onTouchMove(e), { passive: false });
    this.canvas.addEventListener('touchend', (e) => this._onTouchEnd(e));
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
      bus.emit('bed:edit', bed);
    }
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
    if (this.tool === 'polygon' || this.tool === 'line') {
      if (this.polygonPoints && this.polygonPoints.length > 0) {
        ctx.save();
        ctx.translate(this.renderer.offsetX, this.renderer.offsetY);
        ctx.scale(this.renderer.zoom, this.renderer.zoom);
        ctx.fillStyle = 'rgba(74, 222, 128, 0.2)';
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.polygonPoints[0].x, this.polygonPoints[0].y);
        for(let i=1; i<this.polygonPoints.length; i++) {
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
      ctx.translate(this.renderer.offsetX, this.renderer.offsetY);
      ctx.scale(this.renderer.zoom, this.renderer.zoom);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(this.drawStart.x, this.drawStart.y);
      ctx.lineTo(this.measureEnd.x, this.measureEnd.y);
      ctx.stroke();
      
      const distPx = Math.sqrt(Math.pow(this.measureEnd.x - this.drawStart.x, 2) + Math.pow(this.measureEnd.y - this.drawStart.y, 2));
      const cx = (this.drawStart.x + this.measureEnd.x) / 2;
      const cy = (this.drawStart.y + this.measureEnd.y) / 2;
      
      ctx.fillStyle = '#ef4444';
      ctx.font = `bold ${14/this.renderer.zoom}px Inter`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${Math.round(distPx)} cm`, cx, cy - 8);
      ctx.restore();
    } else if (this.isDrawing && this.drawStart && this.lastHoverPoint && ['rect', 'circle', 'lshaped'].includes(this.tool)) {
      ctx.save();
      ctx.translate(this.renderer.offsetX, this.renderer.offsetY);
      ctx.scale(this.renderer.zoom, this.renderer.zoom);
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
      ctx.restore();
    }
  }
}
