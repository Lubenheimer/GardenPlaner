/**
 * CanvasRenderer — Renders the garden canvas with beds, grid, and selection
 */
import { store } from './Store.js';
import { bus } from './EventBus.js';

export class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.container = canvas.parentElement;
    this.bgCanvas = document.createElement('canvas');
    this.bgCanvas.className = 'garden-layer';
    this.bgCanvas.setAttribute('data-bg', 'true');
    this.bgCanvas.style.setProperty('--depth', '0px');
    if (this.container) {
      this.container.insertBefore(this.bgCanvas, this.canvas);
    }

    this.layerCanvases = new Map(); // zIndex -> canvas
    this._textureCache = new Map(); // typeName -> CanvasPattern

    this.zoom = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.showGrid = true;
    this.gridSize = 20;
    this.selectedBedId = null;
    this.hoveredBedId = null;
    this.draggingBedId = null;
    this.animationFrame = null;

    // ── Focus / Zoom-to-Bed ────────────────────────────────────────
    this.focusBedId   = null;  // ID of the currently focused bed (null = overview)
    this._focusAnim   = null;  // rAF handle for smooth camera animation

    this.resize();
  }

  resize() {
    if (!this.container) return;
    const dpr = window.devicePixelRatio || 1;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    
    this._resizeCanvas(this.canvas, w, h, dpr);
    if (this.bgCanvas) this._resizeCanvas(this.bgCanvas, w, h, dpr);
    for (const c of this.layerCanvases.values()) {
      this._resizeCanvas(c, w, h, dpr);
    }
    
    this.canvasWidth = w;
    this.canvasHeight = h;
    this.render();
  }

  _resizeCanvas(c, w, h, dpr) {
    if (!c) return;
    c.width = w * dpr;
    c.height = h * dpr;
    c.style.width = w + 'px';
    c.style.height = h + 'px';
    const ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  setZoom(zoom) {
    this.zoom = Math.max(0.2, Math.min(3, zoom));
    this.render();
  }

  // ── Beet-Fokus (Zoom in, Dimming) ─────────────────────────────────

  /**
   * Smooth-animiert die Kamera auf das gewählte Beet.
   * Alle anderen Beete werden gedimmt (Opacity 0.25).
   */
  focusBed(bedId, padding = 80) {
    const bed = store.getBed(bedId);
    if (!bed) return;

    this.focusBedId = bedId;

    // Bounding box des Beetes
    const bW = bed.width  || 100;
    const bH = bed.height || 100;
    const W  = this.canvasWidth;
    const H  = this.canvasHeight;

    const targetZoom = Math.min(
      (W - padding * 2) / bW,
      (H - padding * 2) / bH,
      6  // max zoom für Fokus (höher als normales Max von 3)
    );
    const targetX = W / 2 - (bed.x + bW / 2) * targetZoom;
    const targetY = H / 2 - (bed.y + bH / 2) * targetZoom;

    this._animateCameraTo(targetZoom, targetX, targetY, 350, () => {
      this.render();
    });

    bus.emit('focus:entered', bed);
  }

  /**
   * Beendet den Fokus-Modus und kehrt zur Übersicht zurück.
   */
  exitFocus() {
    if (!this.focusBedId) return;
    this.focusBedId = null;
    this.fitAll(60);
    bus.emit('focus:exited');
  }

  /**
   * Animiert Zoom + Offset flüssig zum Ziel (Ease-Out).
   */
  _animateCameraTo(targetZoom, targetX, targetY, durationMs, onDone) {
    if (this._focusAnim) cancelAnimationFrame(this._focusAnim);
    const startZoom = this.zoom;
    const startX    = this.offsetX;
    const startY    = this.offsetY;
    const startTime = performance.now();

    const step = (now) => {
      const t  = Math.min((now - startTime) / durationMs, 1);
      const e  = 1 - Math.pow(1 - t, 3); // ease-out cubic

      this.zoom    = startZoom + (targetZoom - startZoom) * e;
      this.offsetX = startX    + (targetX    - startX)    * e;
      this.offsetY = startY    + (targetY    - startY)    * e;
      this._draw();

      if (t < 1) {
        this._focusAnim = requestAnimationFrame(step);
      } else {
        this._focusAnim = null;
        if (onDone) onDone();
      }
    };
    this._focusAnim = requestAnimationFrame(step);
  }

  setOffset(x, y) {
    this.offsetX = x;
    this.offsetY = y;
    this.render();
  }

  fitAll(padding = 60) {
    const beds = store.getBeds();
    if (!beds.length) {
      // Fall back to showing the full garden outline
      const garden = store.getGarden();
      this.zoom = Math.min(
        Math.max((this.canvasWidth  - padding * 2) / garden.width,  0.2),
        Math.max((this.canvasHeight - padding * 2) / garden.height, 0.2),
        3
      );
      this.offsetX = (this.canvasWidth  - garden.width  * this.zoom) / 2;
      this.offsetY = (this.canvasHeight - garden.height * this.zoom) / 2;
      this.render();
      return;
    }
    const xs = beds.flatMap(b => [b.x, b.x + (b.width  || 100)]);
    const ys = beds.flatMap(b => [b.y, b.y + (b.height || 100)]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const bW = maxX - minX || 100;
    const bH = maxY - minY || 100;
    const w = this.canvasWidth;
    const h = this.canvasHeight;
    const newZoom = Math.min(
      Math.max((w - padding * 2) / bW, 0.2),
      Math.max((h - padding * 2) / bH, 0.2),
      3
    );
    this.zoom    = newZoom;
    this.offsetX = (w - bW * newZoom) / 2 - minX * newZoom;
    this.offsetY = (h - bH * newZoom) / 2 - minY * newZoom;
    this.render();
  }

  screenToWorld(sx, sy) {
    return {
      x: (sx - this.offsetX) / this.zoom,
      y: (sy - this.offsetY) / this.zoom,
    };
  }

  worldToScreen(wx, wy) {
    return {
      x: wx * this.zoom + this.offsetX,
      y: wy * this.zoom + this.offsetY,
    };
  }

  render() {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = requestAnimationFrame(() => this._draw());
  }

  _getLayerCtx(zIndex) {
    if (zIndex === 0) return this.bgCanvas.getContext('2d');
    if (!this.layerCanvases.has(zIndex)) {
      const c = document.createElement('canvas');
      c.className = 'garden-layer';
      c.style.setProperty('--depth', `${zIndex * 50}px`);
      if (this.container) {
        this.container.insertBefore(c, this.canvas);
      }
      if (this.canvasWidth) {
        const dpr = window.devicePixelRatio || 1;
        this._resizeCanvas(c, this.canvasWidth, this.canvasHeight, dpr);
      }
      this.layerCanvases.set(zIndex, c);
    }
    return this.layerCanvases.get(zIndex).getContext('2d');
  }

  _draw() {
    const w = this.canvasWidth;
    const h = this.canvasHeight;

    const allCanvases = [this.canvas, this.bgCanvas, ...this.layerCanvases.values()];
    for (const c of allCanvases) {
      if (!c) continue;
      const cx = c.getContext('2d');
      cx.clearRect(0, 0, w, h);
      cx.save();
      cx.translate(this.offsetX, this.offsetY);
      cx.scale(this.zoom, this.zoom);
    }

    const garden = store.getGarden();
    const bgCtx = this.bgCanvas.getContext('2d');
    this._drawGardenArea(bgCtx, garden);

    // In focus mode always show grid to help with plant spacing
    if (this.showGrid || this.focusBedId) {
      this._drawGrid(bgCtx, garden);
    }

    const beds = store.getBeds();
    const levels = store.getLevels();
    const types = store.getElementTypes();
    
    // Sort beds to maintain draw overlap within the same canvas
    const sortedBeds = [...beds].sort((a, b) => {
      const la = levels.find(l => l.id === a.levelId);
      const lb = levels.find(l => l.id === b.levelId);
      return (la?.zIndex || 0) - (lb?.zIndex || 0);
    });

    for (const bed of sortedBeds) {
      const type = types.find(t => t.id === bed.kind) || types[0];
      const level = levels.find(l => l.id === bed.levelId);
      const z = level?.zIndex || 0;
      const layerCtx = this._getLayerCtx(z);
      this._drawBed(layerCtx, bed, type, level);
    }

    if (this.selectedBedId) {
      const bed = store.getBed(this.selectedBedId);
      if (bed) {
        const level = levels.find(l => l.id === bed.levelId);
        const z = level?.zIndex || 0;
        this.canvas.style.setProperty('--depth', `${z * 50 + 1}px`);
        this._drawSelection(this.ctx, bed);
      }
    } else {
      this.canvas.style.setProperty('--depth', '0px');
    }

    if (this.interaction && typeof this.interaction.drawPreview === 'function') {
      this.interaction.drawPreview(this.ctx);
    }

    for (const c of allCanvases) {
      if (c) c.getContext('2d').restore();
    }
  }

  _drawGardenArea(ctx, garden) {
    ctx.fillStyle = this._getThemeColor('canvas-bg');
    ctx.strokeStyle = this._getThemeColor('border-strong');
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    if (garden.shape === 'polygon' && garden.points && garden.points.length > 2) {
      ctx.moveTo(garden.points[0].x, garden.points[0].y);
      for (let i = 1; i < garden.points.length; i++) {
        ctx.lineTo(garden.points[i].x, garden.points[i].y);
      }
      ctx.closePath();
    } else {
      ctx.roundRect(0, 0, garden.width, garden.height, 8);
    }
    
    ctx.fill();
    ctx.stroke();
  }

  _drawGrid(ctx, garden) {
    ctx.strokeStyle = this._getThemeColor('grid');
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= garden.width; x += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, garden.height);
      ctx.stroke();
    }
    for (let y = 0; y <= garden.height; y += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(garden.width, y);
      ctx.stroke();
    }

    // North Arrow
    const north = store.getSettings().northRotation || 0;
    ctx.save();
    // Position it in the top right corner
    ctx.translate(garden.width - 60, 60);
    ctx.rotate(-north * Math.PI / 180); // Rotate the whole arrow based on user north
    ctx.beginPath();
    ctx.moveTo(0, -25);
    ctx.lineTo(10, 15);
    ctx.lineTo(0, 5);
    ctx.lineTo(-10, 15);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.strokeStyle = this._getThemeColor('border-strong');
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = this._getThemeColor('text');
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', 0, -42);
    ctx.restore();
  }

  /** Builds the shape path for a bed (no fill/stroke) */
  _buildBedPath(ctx, bed) {
    ctx.beginPath();
    if (bed.type === 'circle') {
      const rx = bed.width / 2;
      const ry = bed.height / 2;
      ctx.ellipse(bed.x + rx, bed.y + ry, rx, ry, 0, 0, Math.PI * 2);
    } else if (bed.type === 'lshaped') {
      ctx.moveTo(bed.x, bed.y);
      ctx.lineTo(bed.x + bed.width * 0.5, bed.y);
      ctx.lineTo(bed.x + bed.width * 0.5, bed.y + bed.height * 0.5);
      ctx.lineTo(bed.x + bed.width, bed.y + bed.height * 0.5);
      ctx.lineTo(bed.x + bed.width, bed.y + bed.height);
      ctx.lineTo(bed.x, bed.y + bed.height);
      ctx.closePath();
    } else if ((bed.type === 'polygon' || bed.type === 'line') && bed.points?.length > 0) {
      ctx.moveTo(bed.x + bed.points[0].x, bed.y + bed.points[0].y);
      for (let i = 1; i < bed.points.length; i++) {
        ctx.lineTo(bed.x + bed.points[i].x, bed.y + bed.points[i].y);
      }
      if (bed.isClosed) ctx.closePath();
    } else {
      ctx.roundRect(bed.x, bed.y, bed.width, bed.height, 4);
    }
  }

  _drawBed(ctx, bed, type, level) {
    const isSelected  = bed.id === this.selectedBedId;
    const isHovered   = bed.id === this.hoveredBedId;
    const isDragging  = bed.id === this.draggingBedId;
    const alpha       = isSelected ? 0.55 : isHovered ? 0.45 : 0.35;
    const color       = bed.color ? bed.color : (type ? type.color : '#8b6542');
    const height      = bed.customHeight !== null ? bed.customHeight : (type?.defaultHeight || 0);
    const isLine      = (bed.type === 'polygon' || bed.type === 'line') && !bed.isClosed;

    ctx.save();

    // ── Dimming (Fokus-Modus) ──────────────────────────────────────
    if (this.focusBedId && bed.id !== this.focusBedId) {
      ctx.globalAlpha = 0.22;
    }

    // ── Shadow (sun simulation or drag lift) ───────────────────────
    if (isDragging) {
      // Lifted appearance while dragging
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur  = 24;
      ctx.shadowOffsetX = 8;
      ctx.shadowOffsetY = 14;
    } else if (bed.castShadow !== false && ((level && level.zIndex > 0) || height > 0)) {
      const s    = store.getSettings();
      const t    = s.simulationTime   !== undefined ? s.simulationTime   : 12;
      const m    = s.simulationMonth  !== undefined ? s.simulationMonth  : 6;
      const north = s.northRotation   !== undefined ? s.northRotation    : 0;

      // ── Echte Sonnen-Elevation (~50°N Mitteleuropa) ───────────────
      const hourAngleDeg   = (t - 12) * 15;                                // 15°/h vom Mittag
      const declinationDeg = 23.45 * Math.sin((m - 3) / 12 * 2 * Math.PI); // Jahreszeit-Deklination
      const lat     = store.getSettings().location?.lat || 50;
      const latRad  = lat * Math.PI / 180;
      const declRad = declinationDeg * Math.PI / 180;
      const haRad   = hourAngleDeg   * Math.PI / 180;

      // sin(Elevation) = sin(Lat)·sin(Dekl) + cos(Lat)·cos(Dekl)·cos(Stundenwinkel)
      const sinElev = Math.sin(latRad) * Math.sin(declRad)
                    + Math.cos(latRad) * Math.cos(declRad) * Math.cos(haRad);

      // shadowFactor = cot(Elevation) = cos/sin — gibt physikalische Schattenlänge relativ zur Höhe
      // Clamp: min ~3.5° (kein unendlicher Horizont-Schatten), max 5× Höhe (Abendsonne)
      const elevClamped  = Math.max(sinElev, 0.06);
      const shadowFactor = Math.min(Math.sqrt(1 - elevClamped * elevClamped) / elevClamped, 5);

      // Schatten-Richtung (Azimut) bleibt wie bisher
      const sunAzimuthDeg = hourAngleDeg - north;
      const shadowX       = Math.sin(sunAzimuthDeg * Math.PI / 180);
      const shadowY       = -Math.cos(sunAzimuthDeg * Math.PI / 180);

      const baseObjH = height > 0 ? height : ((level?.zIndex || 0) * 10);

      // ctx.shadowOffset ist eine Schlagschatten-API, keine Geometrie.
      // Ab ~50px sieht es wie ein losgelöstes Duplikat aus, egal wie groß das Objekt.
      // Daher: proportionale Skalierung für kleine Objekte, hartes Cap für große.
      const MAX_SHADOW_PX = 48;
      const offsetLength  = Math.min(baseObjH * shadowFactor * 0.25, MAX_SHADOW_PX);
      const bedRotRad    = (bed.rotation || 0) * Math.PI / 180;
      const localShadowX = shadowX * Math.cos(-bedRotRad) - shadowY * Math.sin(-bedRotRad);
      const localShadowY = shadowX * Math.sin(-bedRotRad) + shadowY * Math.cos(-bedRotRad);

      ctx.shadowColor   = 'rgba(0,0,0,0.40)';
      ctx.shadowBlur    = Math.min(baseObjH * 0.03 + (level?.zIndex || 0) * 3, 30);
      ctx.shadowOffsetX = localShadowX * offsetLength;
      ctx.shadowOffsetY = localShadowY * offsetLength;
    }

    // ── Rotation ───────────────────────────────────────────────────
    if (bed.rotation) {
      const cx = bed.x + bed.width / 2;
      const cy = bed.y + bed.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate(bed.rotation * Math.PI / 180);
      ctx.translate(-cx, -cy);
    }

    // ── Pass 1: solid colour fill (carries shadow) ─────────────────
    ctx.fillStyle  = this._hexToRgba(color, alpha);
    ctx.strokeStyle = color;
    ctx.lineWidth  = isSelected ? 3 : isHovered ? 2.5 : 2;

    this._buildBedPath(ctx, bed);

    if (isLine) {
      ctx.lineJoin = 'round';
      ctx.lineCap  = 'round';
      ctx.lineWidth = isSelected ? 6 : (isHovered ? 5 : 4);
      ctx.stroke();
    } else {
      ctx.fill();
      ctx.stroke();

      // ── Pass 2: texture overlay (no shadow) ──────────────────────
      ctx.shadowColor   = 'transparent';
      ctx.shadowBlur    = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      const pattern = this._getPattern(ctx, type);
      if (pattern) {
        ctx.globalAlpha = 0.22;
        ctx.fillStyle   = pattern;
        this._buildBedPath(ctx, bed);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // ── Restore rotation BEFORE drawing label ──────────────────────
    // This ensures the label is always drawn horizontally, regardless
    // of how much the bed object has been rotated.
    ctx.restore();

    // ── Label (always horizontal & readable) ───────────────────────
    ctx.save();
    ctx.shadowColor   = 'transparent';
    ctx.shadowBlur    = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const plantings = store.getPlantings(bed.id);
    ctx.fillStyle    = this._getThemeColor('text');
    ctx.font         = `600 ${Math.max(11, 14 / Math.max(this.zoom, 0.5))}px Inter, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    const lcx = bed.x + bed.width / 2;
    const lcy = bed.y + bed.height / 2;
    ctx.fillText(bed.name, lcx, lcy - 8);

    if (plantings.length > 0) {
      ctx.font      = `400 ${Math.max(9, 11 / Math.max(this.zoom, 0.5))}px Inter, sans-serif`;
      ctx.fillStyle = this._getThemeColor('text-muted');
      const emojis  = plantings.slice(0, 4).map(p => p.emoji).join(' ');
      ctx.fillText(emojis, lcx, lcy + 10);
    }

    ctx.restore();
  }

  _drawSelection(ctx, bed) {
    const handleSize = 8;
    const handles = this._getResizeHandles(bed, handleSize);

    // Dashed border
    ctx.save();
    
    // Apply rotation
    if (bed.rotation) {
      const cx = bed.x + bed.width / 2;
      const cy = bed.y + bed.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate(bed.rotation * Math.PI / 180);
      ctx.translate(-cx, -cy);
    }

    ctx.strokeStyle = this._getThemeColor('primary');
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.rect(
      bed.x - 4,
      bed.y - 4,
      bed.width + 8,
      bed.height + 8,
    );
    ctx.stroke();
    ctx.setLineDash([]);

    // Resize handles
    ctx.lineWidth = 2;
    for (const h of handles) {
      if (h.pos === 'rot') {
        ctx.strokeStyle = this._getThemeColor('primary');
        ctx.beginPath();
        ctx.moveTo(bed.x + bed.width / 2, bed.y);
        ctx.lineTo(h.x, h.y);
        ctx.stroke();

        ctx.fillStyle = this._getThemeColor('surface');
        ctx.beginPath();
        ctx.arc(h.x, h.y, handleSize / 2 + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = this._getThemeColor('primary');
        ctx.strokeStyle = this._getThemeColor('surface');
        ctx.beginPath();
        ctx.arc(h.x, h.y, handleSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  _getResizeHandles(bed, size) {
    return [
      { pos: 'nw', x: bed.x, y: bed.y },
      { pos: 'ne', x: bed.x + bed.width, y: bed.y },
      { pos: 'sw', x: bed.x, y: bed.y + bed.height },
      { pos: 'se', x: bed.x + bed.width, y: bed.y + bed.height },
      { pos: 'n', x: bed.x + bed.width / 2, y: bed.y },
      { pos: 's', x: bed.x + bed.width / 2, y: bed.y + bed.height },
      { pos: 'w', x: bed.x, y: bed.y + bed.height / 2 },
      { pos: 'e', x: bed.x + bed.width, y: bed.y + bed.height / 2 },
      { pos: 'rot', x: bed.x + bed.width / 2, y: bed.y - 30 },
    ];
  }

  getBedAtPosition(worldX, worldY) {
    const beds = store.getBeds();
    const levels = store.getLevels();
    
    // Sort beds to match drawing order, then iterate backwards (top-most first)
    const sortedBeds = [...beds].sort((a, b) => {
      const la = levels.find(l => l.id === a.levelId);
      const lb = levels.find(l => l.id === b.levelId);
      return (la?.zIndex || 0) - (lb?.zIndex || 0);
    });

    for (let i = sortedBeds.length - 1; i >= 0; i--) {
      const bed = sortedBeds[i];
      if (this._isPointInBed(worldX, worldY, bed)) {
        return bed;
      }
    }
    return null;
  }

  getHandleAtPosition(worldX, worldY) {
    if (!this.selectedBedId) return null;
    const bed = store.getBed(this.selectedBedId);
    if (!bed) return null;
    
    let pX = worldX;
    let pY = worldY;
    
    if (bed.rotation) {
      const cx = bed.x + bed.width / 2;
      const cy = bed.y + bed.height / 2;
      const rad = -(bed.rotation * Math.PI / 180);
      pX = cx + (worldX - cx) * Math.cos(rad) - (worldY - cy) * Math.sin(rad);
      pY = cy + (worldX - cx) * Math.sin(rad) + (worldY - cy) * Math.cos(rad);
    }
    
    const handles = this._getResizeHandles(bed, 12);
    for (const h of handles) {
      const dist = Math.sqrt((pX - h.x) ** 2 + (pY - h.y) ** 2);
      if (dist < 10) return h;
    }
    return null;
  }

  _isPointInBed(x, y, bed) {
    let pX = x;
    let pY = y;
    
    if (bed.rotation) {
      const cx = bed.x + bed.width / 2;
      const cy = bed.y + bed.height / 2;
      const rad = -(bed.rotation * Math.PI / 180);
      pX = cx + (x - cx) * Math.cos(rad) - (y - cy) * Math.sin(rad);
      pY = cy + (x - cx) * Math.sin(rad) + (y - cy) * Math.cos(rad);
    }

    if (bed.type === 'circle') {
      const cx = bed.x + bed.width / 2;
      const cy = bed.y + bed.height / 2;
      const rx = bed.width / 2;
      const ry = bed.height / 2;
      return ((pX - cx) ** 2) / (rx ** 2) + ((pY - cy) ** 2) / (ry ** 2) <= 1;
    }
    
    if (bed.type === 'polygon' && bed.points) {
      if (!bed.isClosed) {
        // Distance to line segments for open paths
        for (let i = 0; i < bed.points.length - 1; i++) {
          const x1 = bed.x + bed.points[i].x;
          const y1 = bed.y + bed.points[i].y;
          const x2 = bed.x + bed.points[i + 1].x;
          const y2 = bed.y + bed.points[i + 1].y;
          
          const A = pX - x1;
          const B = pY - y1;
          const C = x2 - x1;
          const D = y2 - y1;
          
          const dot = A * C + B * D;
          const len_sq = C * C + D * D;
          let param = -1;
          if (len_sq !== 0) param = dot / len_sq;
          
          let xx, yy;
          if (param < 0) {
            xx = x1; yy = y1;
          } else if (param > 1) {
            xx = x2; yy = y2;
          } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
          }
          
          const dist = Math.sqrt((pX - xx) ** 2 + (pY - yy) ** 2);
          if (dist < 10) return true; // 10px hit radius
        }
        return false;
      } else {
        // Ray casting for closed polygons
        let inside = false;
        for (let i = 0, j = bed.points.length - 1; i < bed.points.length; j = i++) {
          let xi = bed.x + bed.points[i].x, yi = bed.y + bed.points[i].y;
          let xj = bed.x + bed.points[j].x, yj = bed.y + bed.points[j].y;
          let intersect = ((yi > pY) !== (yj > pY)) && (pX < (xj - xi) * (pY - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
        }
        return inside;
      }
    }
    
    // Simple bounding box for rect and L-shaped
    return pX >= bed.x && pX <= bed.x + bed.width && pY >= bed.y && pY <= bed.y + bed.height;
  }

  _hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  _getThemeColor(name) {
    const style = getComputedStyle(document.documentElement);
    const map = {
      'canvas-bg':     '--color-canvas-bg',
      'grid':          '--color-canvas-grid',
      'border-strong': '--color-border-strong',
      'text':          '--color-text',
      'text-muted':    '--color-text-muted',
      'primary':       '--color-primary',
      'surface':       '--color-surface',
    };
    const varName = map[name];
    if (varName) {
      const val = style.getPropertyValue(varName).trim();
      if (val) return val;
    }
    return '#888';
  }

  // ── Texture system ──────────────────────────────────────────────────

  /** Maps a type name to a texture key */
  _getTextureType(typeName) {
    const n = (typeName || '').toLowerCase();
    if (n.includes('beet') || n.includes('gemüse') || n.includes('hochbeet') || n.includes('kräuter')) return 'soil';
    if (n.includes('rasen') || n.includes('gras') || n.includes('wiese')) return 'grass';
    if (n.includes('terrasse') || n.includes('holz') || n.includes('diele') || n.includes('gartenhaus') || n.includes('haus')) return 'wood';
    if (n.includes('weg') || n.includes('kies') || n.includes('pflaster') || n.includes('schotter')) return 'gravel';
    if (n.includes('mulch') || n.includes('rinde')) return 'mulch';
    return 'default';
  }

  /** Returns (or creates+caches) a canvas pattern for the given element type */
  _getPattern(ctx, type) {
    if (!type) return null;
    const key = type.name;
    if (this._textureCache.has(key)) return this._textureCache.get(key);

    const textureType = this._getTextureType(type.name);
    const size = 40;
    const pc = document.createElement('canvas');
    pc.width = size;
    pc.height = size;
    const pCtx = pc.getContext('2d');

    switch (textureType) {
      case 'soil':   this._drawSoilTexture(pCtx, size, size);   break;
      case 'grass':  this._drawGrassTexture(pCtx, size, size);  break;
      case 'wood':   this._drawWoodTexture(pCtx, size, size);   break;
      case 'gravel': this._drawGravelTexture(pCtx, size, size); break;
      case 'mulch':  this._drawMulchTexture(pCtx, size, size);  break;
      default:       return null; // no texture for unknown types
    }

    const pattern = ctx.createPattern(pc, 'repeat');
    this._textureCache.set(key, pattern);
    return pattern;
  }

  _drawSoilTexture(ctx, w, h) {
    // Dark stippled earth texture
    const dots = [
      [4,4],[14,7],[24,3],[34,9],[8,16],[20,13],[31,18],[6,26],
      [17,29],[28,24],[37,32],[11,35],[22,38],[33,34],[3,38],[26,8],
    ];
    for (const [x, y] of dots) {
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath(); ctx.arc(x + 1, y + 1, 1, 0, Math.PI * 2); ctx.fill();
    }
    // A few tiny pebble-shapes
    const pebbles = [[10,21],[30,6],[36,22]];
    for (const [x, y] of pebbles) {
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.beginPath(); ctx.ellipse(x, y, 3, 2, 0.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  _drawGrassTexture(ctx, w, h) {
    // Short grass blade strokes
    const blades = [
      [4,h,4,h-7,-1],[10,h,10,h-5,1],[16,h,16,h-8,0],
      [22,h,22,h-6,-1],[28,h,28,h-7,1],[34,h,34,h-5,0],
      [7,h-14,7,h-20,1],[19,h-12,19,h-19,-1],[31,h-13,31,h-20,1],
    ];
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    for (const [x1,y1,x2,y2,lean] of blades) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(x1 + lean * 2, (y1 + y2) / 2, x2 + lean, y2);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    for (const [x1,y1,x2,y2,lean] of blades.slice(0,4)) {
      ctx.beginPath();
      ctx.moveTo(x1 + 1, y1);
      ctx.quadraticCurveTo(x1 + lean + 1, (y1 + y2) / 2, x2 + lean + 1, y2);
      ctx.stroke();
    }
  }

  _drawWoodTexture(ctx, w, h) {
    // Horizontal plank stripes with grain
    const plankH = 10;
    for (let y = 0; y < h; y += plankH) {
      // Plank gap
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(0, y, w, 1);
      // Grain lines within plank
      const grainPositions = [3, 6, 8];
      ctx.strokeStyle = 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 0.5;
      for (const gy of grainPositions) {
        if (y + gy >= h) break;
        ctx.beginPath();
        ctx.moveTo(0, y + gy);
        ctx.lineTo(w, y + gy + (gy % 2 === 0 ? 0.5 : -0.5));
        ctx.stroke();
      }
      // Highlight top of plank
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.fillRect(0, y + 1, w, 2);
    }
  }

  _drawGravelTexture(ctx, w, h) {
    // Small oval stones
    const stones = [
      [5,5,4,3,0.3],[15,8,5,3,0.8],[26,4,4,3,0.1],[36,9,3,2,0.5],
      [8,18,4,3,0.9],[20,22,5,3,0.2],[32,17,4,3,0.6],[3,28,3,2,0.4],
      [13,32,5,4,0.7],[28,30,4,3,0.1],[38,25,3,2,0.8],[18,13,4,3,0.3],
    ];
    for (const [x,y,rx,ry,rot] of stones) {
      ctx.fillStyle = 'rgba(0,0,0,0.14)';
      ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath(); ctx.ellipse(x - 1, y - 1, rx * 0.5, ry * 0.5, rot, 0, Math.PI * 2); ctx.fill();
    }
  }

  _drawMulchTexture(ctx, w, h) {
    // Irregular bark-chip shapes
    const chips = [
      [[2,4],[10,2],[12,7],[4,9]], [[14,5],[22,3],[24,10],[16,11]],
      [[26,2],[36,4],[35,9],[27,8]], [[1,14],[9,12],[11,18],[3,20]],
      [[13,16],[21,14],[23,20],[14,22]], [[25,13],[35,15],[34,20],[24,19]],
      [[4,25],[12,23],[13,30],[5,31]], [[16,27],[26,25],[28,32],[17,33]],
      [[29,26],[38,28],[37,34],[30,33]],
    ];
    for (const pts of chips) {
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.moveTo(pts[0][0]+1, pts[0][1]+1);
      ctx.lineTo(pts[1][0]-1, pts[1][1]+1);
      ctx.lineTo(pts[1][0]-1, pts[1][1]+3);
      ctx.stroke();
    }
  }
}
