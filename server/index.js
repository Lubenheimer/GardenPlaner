/**
 * GardenPlaner — Lokaler API-Server (provisorische Datenbank)
 *
 * Speichert alle Gartendaten in einer JSON-Datei (server/garden-data.json).
 * Im Produktionsmodus (NODE_ENV=production oder kein Vite-Proxy vorhanden)
 * werden auch die statischen Frontend-Dateien aus dist/ ausgeliefert.
 */
import express from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE  = join(__dirname, 'garden-data.json');
const DIST_DIR   = join(__dirname, '..', 'dist');
const PORT       = 3001;

// Produktionsmodus: Frontend aus dist/ ausliefern?
const IS_PROD = process.env.NODE_ENV === 'production' || existsSync(DIST_DIR);

const app = express();
app.use(express.json({ limit: '50mb' }));

// ── Statische Dateien (Produktion) ─────────────────────────────────
if (IS_PROD && existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
}

// ── Hilfsfunktionen ────────────────────────────────────────────────

function readData() {
  if (!existsSync(DATA_FILE)) return null;
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    console.error('[DB] Lesefehler:', e.message);
    return null;
  }
}

function writeData(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function timestamp() {
  return new Date().toLocaleTimeString('de-DE');
}

function openBrowser(url) {
  const platform = process.platform;
  let cmd;
  if (platform === 'win32')       cmd = `start "" "${url}"`;
  else if (platform === 'darwin') cmd = `open "${url}"`;
  else                            cmd = `xdg-open "${url}"`;
  exec(cmd, (err) => {
    if (err) console.warn('[Browser] Konnte Browser nicht öffnen:', err.message);
  });
}

// ── Routen ─────────────────────────────────────────────────────────

/** Health-Check — prüft ob der Server erreichbar ist */
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, version: '1.0.0-local', storage: DATA_FILE });
});

/** Gesamten Zustand laden */
app.get('/api/data', (_req, res) => {
  try {
    const data = readData();
    console.log(`[${timestamp()}] GET /api/data → ${data ? 'gefunden' : 'leer'}`);
    res.json(data);
  } catch (e) {
    console.error('[DB] GET-Fehler:', e.message);
    res.status(500).json({ error: e.message });
  }
});

/** Gesamten Zustand speichern */
app.post('/api/data', (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Ungültige Daten' });
    }
    writeData(payload);
    const gardens = (payload.gardens || []).length;
    console.log(`[${timestamp()}] POST /api/data → ${gardens} Garten/Gärten gespeichert ✓`);
    res.json({ ok: true });
  } catch (e) {
    console.error('[DB] POST-Fehler:', e.message);
    res.status(500).json({ error: e.message });
  }
});

/** Einzelne Garden-Übersicht (für spätere Erweiterungen) */
app.get('/api/gardens', (_req, res) => {
  try {
    const data = readData();
    const gardens = (data?.gardens || []).map(g => ({
      id:          g.id,
      name:        g.name,
      bedCount:    (g.beds || []).length,
      plantCount:  (g.plantings || []).length,
      createdAt:   g.createdAt,
    }));
    res.json(gardens);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// SPA-Fallback: alle nicht-API-Routen → index.html
if (IS_PROD && existsSync(DIST_DIR)) {
  app.get('*', (_req, res) => {
    res.sendFile(join(DIST_DIR, 'index.html'));
  });
}

// ── Server starten ─────────────────────────────────────────────────

const server = app.listen(PORT, () => {
  const appUrl = `http://localhost:${PORT}`;

  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   🌱  GartenPlaner — Lokaler Server    ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  if (IS_PROD && existsSync(DIST_DIR)) {
    console.log(`   🌐  App:  ${appUrl}`);
  }
  console.log(`   🔌  API:  ${appUrl}/api`);
  console.log(`   💾  DB:   ${DATA_FILE}`);
  console.log(`   ${existsSync(DATA_FILE) ? '✅ Bestehende Daten geladen' : '📁 Neue Datenbank wird beim ersten Speichern angelegt'}`);
  console.log('');

  if (IS_PROD && existsSync(DIST_DIR)) {
    console.log('   Browser öffnet sich automatisch...');
    console.log('   (Fenster schließen zum Beenden)');
    console.log('');
    setTimeout(() => openBrowser(appUrl), 800);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('');
    console.log(`⚡ Port ${PORT} ist bereits belegt — GartenPlaner läuft schon!`);
    // Browser trotzdem öffnen, falls Produktion
    if (IS_PROD) {
      openBrowser(`http://localhost:${PORT}`);
    }
    process.exit(0);
  } else {
    console.error('Server-Fehler:', err);
    process.exit(1);
  }
});
