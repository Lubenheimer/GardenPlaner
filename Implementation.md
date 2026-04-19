# Implementierungsplan: GardenPlaner V2

Letzte Aktualisierung: April 2026 (Abgeglichen mit Code-Stand: 19.04.2026)

---

## 📋 Offene To-Dos (Kurzübersicht)

| Priorität | Feature | Abschnitt |
|---|---|---|
| 🔴 Mittel | Automatische Einkaufsliste (Check-off + CSV) | 6.3 |
| 🔴 Mittel | Boden-Eignungswarnung bei Pflanzauswahl | 6.8 |
| 🟡 Mittel | Inter-Beet Mischkultur-Prüfung beim Pflanzen | 7.2 |
| 🟡 Mittel | `prompt()` in Kontextmenü (Umbenennen) + GardenManager ersetzen | 7.x |
| 🟢 Groß | Mobile-Optimierung (Pinch-to-Zoom, Touch) | 7.6 |
| 🟢 Groß | Erweiterter Jahresplan (tatsächlich vs. geplant im Gantt) | 7.7 |
| ⚪ Vision | KI-Assistent / Auto-Layout | 7.8 |

---

## ✅ 1. Neues Design & Farbgebung — ERLEDIGT

- ✅ **Texturen auf Canvas:** Erde, Rindenmulch, Gras, Holzdielen, Kies — per `ctx.createPattern()` als Overlay
- ✅ **Erdtöne-Theming:** Terracotta (`#7c5c3e`), Sand, Schieferblau; 5 Farbthemes (Terracotta, Forest, Ocean, Harvest, Midnight) je mit Light + Dark Mode
- ✅ **Glassmorphismus:** Sidebar, Right Panel, Toolbar im Dark Mode mit `backdrop-filter: blur()`
- ✅ **Schatten & Licht auf UI-Ebene:** Weiche Box-Shadows auf allen Panels und Karten
- ✅ **Sanfte Animationen:** `plantGrow`-Keyframe auf Pflanzungs-Items, Badge-Shimmer bei Statuswechsel
- ✅ **Schattenwurf-Simulation:** Physikalische Sonnenstand-Berechnung (Elevation, Azimut, Jahreszeit, Nordausrichtung)

---

## ✅ 2. Multi-Projekt-Support (Garten-Entität) — ERLEDIGT

- ✅ **Neue Store-Struktur:** `{ activeGardenId, gardens[], elementTypes (global), settings (global) }`
- ✅ **Migration:** Altes Single-Garden-Format wird automatisch ins neue Format konvertiert
- ✅ **Garten-Manager UI:** Modal zum Wechseln, Anlegen, Umbenennen, Löschen von Garten-Projekten
- ✅ **Garden-Switcher** in der Sidebar mit aktivem Gartennamen

---

## ✅ 3. Lokale Datenpersistenz — ERLEDIGT

- ✅ **Express-Backend** (`server/index.js`): `GET/POST /api/data` → schreibt `server/garden-data.json`
- ✅ **Dual-Write-Pattern:** localStorage (sofort) + debounced Server-Push (600ms)
- ✅ **Server als autoritativ beim Start:** `initFromServer()` lädt Server-Daten und überschreibt localStorage-Cache
- ✅ **Server-Status-Indikator:** Farbiger Dot in der Toolbar (grün = online, grau = nur localStorage)
- ✅ **Produktionsmodus:** Server liefert auch statische Dateien aus `dist/` aus
- ✅ **Start-Skript:** `Start GartenPlaner.bat` für Windows-Doppelklick-Start

> **Bewusst zurückgestellt (Cloud-SaaS):** Authentifizierung, Cloud-Sync, Stripe-Paywall → siehe Abschnitt 8.

---

## ✅ 4a. Jahres-Gantt-Diagramm — ERLEDIGT

- ✅ Toggle zwischen **Monatsansicht** und **Jahresplan** im Kalender-View
- ✅ Balken nach Phase: 🔵 Säen · 🟤 Wachsen · 🟢 Ernte
- ✅ Pflanzen aus dem Katalog (`plants.js`) als Datenbasis, nach Beet gruppiert
- ✅ Aktueller Monat hervorgehoben, Legende, Leer-Zustand

---

## ✅ 4b. Wetter & Frost-API — ERLEDIGT

- ✅ **Open-Meteo** (kostenlos, kein API-Key): Geocoding + 7-Tage-Forecast
- ✅ **Standort-Eingabe** in Einstellungen: City-Autocomplete speichert `{ city, lat, lon }`
- ✅ **Wetter-Widget** im Dashboard: 7 Tage, Emoji, Min/Max-Temp, Niederschlag
- ✅ **Frost-Warnung** als Alert-Banner wenn Nachttemperatur < 2 °C
- ✅ **Cache:** Wetterdaten 1h in localStorage gecacht, bei Standortwechsel geleert

---

## ✅ 5. Quick Wins & UX-Verbesserungen — ERLEDIGT

- ✅ **Undo / Redo** — `store.undo()` / `store.redo()` mit History-Stack (max. 30 Schritte), Ctrl+Z / Ctrl+Y
- ✅ **Beet kopieren / einfügen** — Clipboard via Ctrl+C / Ctrl+V, Offset +20px; auch Copy-Button im BedEditor
- ✅ **„Alles einpassen"-Zoom** — `renderer.fitAll()` in Toolbar; wird auch beim Start aufgerufen
- ✅ **Fläche beim Zeichnen anzeigen** — `drawPreview()` in CanvasInteraction.js zeigt `B × H m (X m²)` live neben dem Cursor
- ✅ **Task-System: Modal statt `prompt()`** — Tasks.js nutzt Inline-Formular
- ✅ **Budget-System: Modal statt `prompt()`** — Dashboard.js nutzt Modal mit Kategorie-Picker
- ✅ **Sunlight-Feld im BedEditor** — `<select id="bed-sunlight-select">` (☀️/⛅/🌑)
- ✅ **Dashboard: Überfällige Tasks als Alert-Sektion** — roter Banner mit Link in Tasks-Tab
- ✅ **Standort für Sonnenberechnung** — `location.lat` wird in CanvasRenderer für Elevation genutzt

---

## ✅ 6. Gärtner-Features — GRÖSSTENTEILS ERLEDIGT

1. ✅ **Fruchtfolge-Assistent** — `CropRotation.js`-Komponente mit Dashboard-Widget; Zyklus Stark→Mittel→Schwach→Gründüngung

2. ✅ **Ernte-Protokoll** — `HarvestModal.js` (🧺-Button im BedEditor); `Store.addHarvest()`/`getHarvests()`; Dashboard-Aggregation nach Pflanze

3. ❌ **Automatische Einkaufsliste** ⭐
   Aktuell: Nur passiver Hinweistext im Dashboard für Pflanzungen mit Status `planned`.
   **Offen:** Eigene `ShoppingList.js`-Komponente mit Check-off, Bearbeiten-Funktion und CSV-Export.

4. ✅ **Erweiterte Pflanzungserfassung** — PlantingModal mit Anzahl, Sorte/Varietät, Pflanzabstand (aus DB), geplantem Erntedatum

5. ✅ **Gieß- & Dünge-Kalender** — Tasks-Tab mit automatischen Erinnerungen, „Heute fällig" + „Demnächst", Niederschlags-Integration (Open-Meteo stündlich), pflanztyp-spezifische Schwellenwerte

6. ✅ **Saison-System & Archiv** — `planting.season`-Feld, `store.startNewSeason()`, Statistik-Jahres-Dropdown, Stauden-Klon beim Saisonwechsel, weicher Jahreswechsel per Button

7. ✅ **Aussaat-Erinnerungen** — `generateSowingReminders()` in Tasks.js zeigt geplante Pflanzungen der nächsten 14 Tage priorisiert; inkl. Frost-Warnung bei ≤ 2 °C

8. ❌ **Boden-Eignungswarnung bei Pflanzauswahl**
   Beim Hinzufügen einer Pflanzung wird `bed.soil` (`normal / sand / clay / humus`) gegen einen neuen Katalogwert `preferredSoil[]` der Pflanze geprüft. Bei Nichtübereinstimmung erscheint ein gelber, nicht-blockierender Warnhinweis im Modal — analog zu Nachbarschafts- und Lichtwarnungen.
   
   **Umsetzung:**
   - `plants.js`: Neues Feld `preferredSoil: ['normal', 'humus']` pro Pflanze (fehlendes Feld = keine Prüfung)
   - `PlantingModal.js`: Warnung z.B. _„⚠️ Tomate bevorzugt humosen Boden — dein Beet hat Lehmboden."_
   - Eigene Pflanzen (`customPlants`) können `preferredSoil` ebenfalls setzen

---

## 🚀 7. Größere Features — TEILS ERLEDIGT

1. ✅ **Mischkultur-Visualisierung auf Canvas** — `showCompanionRelationships` in CanvasRenderer; 🛡️-Toggle-Button in Toolbar; zeigt grüne/rote Verbindungslinien zwischen benachbarten Beeten (bis 1,5m)

2. ❌ **Inter-Beet Mischkultur-Prüfung beim Pflanzen**
   `PlantingModal.js` prüft aktuell nur Pflanzen *innerhalb* eines Beetes. Benachbarte Beete (Distanz < X Pixel) werden ignoriert.
   **Umsetzung:** Distanzberechnung über Beet-Koordinaten in `PlantingModal.js` → Warnung „In Beet 'Tomaten' (50 cm entfernt) wächst Kartoffel — schlechter Nachbar!"

3. ✅ **Rechtsklick-Kontextmenü auf Canvas** — `_onContextMenu()` + `_showContextMenu()` in CanvasInteraction.js; Aktionen: Pflanzung hinzufügen, Fokus, Umbenennen, Duplizieren, Ebene wechseln, Löschen
   > ⚠️ Umbenennen nutzt noch `window.prompt()` — sollte durch ein Inline-Input ersetzt werden

4. ✅ **Jahresstatistik-Ansicht** — `Statistics.js` mit KPI-Kacheln, Ernte-Ranking, Ausgaben-Charts, Status-Grid, Jahres-Selektor

5. ✅ **Drucken / PDF-Export** — In Statistics.js integriert; Canvas-Snapshot, Pflanzliste, Ernte-Protokoll, Ausgaben, A4-Layout

6. ❌ **Mobile-Optimierung**
   Pinch-to-Zoom, bessere Touch-Targets, vereinfachte Ansicht für den Einsatz im Garten mit dem Smartphone.

7. ❌ **Erweiterter Jahresplan**
   Tatsächliche Pflanz- und Erntedaten als Overlay über den Katalog-Richtwerten im Gantt; Lücken-Analyse für Nachkulturen.

8. ❌ **KI-Assistent (Auto-Layout)**
   Leeres Beet anlegen → „Generieren" → App befüllt es automatisch mit perfekt gematchten Mischkulturen basierend auf Beetgröße, Lichtverhältnissen und bereits geplanten Nachbarbeeten.

---

## ☁️ 8. Cloud & SaaS — BEWUSST ZURÜCKGESTELLT

Erst relevant wenn das Tool vermarktet werden soll:

- **Authentifizierung** (Supabase / Firebase): E-Mail- oder Google-Login
- **Cloud-Datenbank-Sync:** `Store.save()` / `load()` gegen Cloud-API statt lokalen Server
- **Bezahl-Schranke (Stripe):**
  - *Free-Tier:* 1 Garten, Basis-Pflanzenkatalog
  - *Pro-Tier (Abo):* Unbegrenzte Gärten, Frost-Alarm, Fruchtfolge-Assistent, KI-Layout
