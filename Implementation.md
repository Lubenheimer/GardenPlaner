# Implementierungsplan: GardenPlaner V2

Letzte Aktualisierung: Juni 2026 (Abgeglichen mit Code-Stand: 09.06.2026, Feature 7 implementiert)

---

## 📋 Offene To-Dos (Kurzübersicht)

| Priorität | Feature | Abschnitt |
|---|---|---|
| 🟢 Groß | Mobile-Optimierung (Pinch-to-Zoom, Touch) | 7.6 |
| ⚪ Vision | KI-Assistent / Auto-Layout | 7.8 |
| 🔵 Neu | KI-Pflanzenerkennung (Foto → Krankheit/Schädling) | 9.1 |
| 🔵 Neu | Samenbank-Verwaltung | 9.2 |
| 🔵 Neu | Kalender-Export (iCal / .ics) | 9.3 |
| 🔵 Neu | Garten-Tagebuch / Journal | 9.4 |
| 🔵 Neu | Schädlings- & Krankheitsdatenbank | 9.5 |
| 🔵 Neu | Jahresvergleich (Saison A vs. B) | 9.6 |
| 🔵 Neu | PWA + Push-Benachrichtigungen | 9.7 |
| 🔵 Neu | Saatgut-Tauschbörse (Community) | 9.8 |
| 🔵 Neu | Bodenanalyse-Tracker | 9.9 |

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

3. ✅ **Automatische Einkaufsliste** 
   `ShoppingList.js`-Komponente mit voller Funktionalität:
   - Aggregiert geplante Pflanzungen nach Pflanzname (gleiche Pflanzen zusammengefasst)
   - Zeigt: Sorte, Menge, betroffene Beete
   - Für jede Pflanzung: Edit-Button → Modal zum Ändern von Menge, Sorte, Notizen
   - CSV-Export-Button → `GardenPlaner-Einkaufsliste-YYYY-MM-DD.csv` für Ausdrucken/Excel
   - Neuer Tab „🛒 Einkaufsliste" in der Hauptnavigation

4. ✅ **Erweiterte Pflanzungserfassung** — PlantingModal mit Anzahl, Sorte/Varietät, Pflanzabstand (aus DB), geplantem Erntedatum

5. ✅ **Gieß- & Dünge-Kalender** — Tasks-Tab mit automatischen Erinnerungen, „Heute fällig" + „Demnächst", Niederschlags-Integration (Open-Meteo stündlich), pflanztyp-spezifische Schwellenwerte

6. ✅ **Saison-System & Archiv** — `planting.season`-Feld, `store.startNewSeason()`, Statistik-Jahres-Dropdown, Stauden-Klon beim Saisonwechsel, weicher Jahreswechsel per Button

7. ✅ **Aussaat-Erinnerungen** — `generateSowingReminders()` in Tasks.js zeigt geplante Pflanzungen der nächsten 14 Tage priorisiert; inkl. Frost-Warnung bei ≤ 2 °C

8. ✅ **Boden-Eignungswarnung bei Pflanzauswahl**
   Beim Hinzufügen einer Pflanzung wird `bed.soil` (`normal / sand / clay / humus`) gegen `preferredSoil[]` der Pflanze geprüft. Bei Nichtübereinstimmung erscheint ein gelber, nicht-blockierender Warnhinweis im Modal — analog zu Nachbarschafts- und Lichtwarnungen.
   
   **Umsetzung:**
   - `plants.js`: Neues Feld `preferredSoil: ['normal', 'humus']` für ~35 Pflanzen (fehlendes Feld = keine Prüfung)
   - `PlantingModal.js`: Warnung z.B. _„🪨 **Bodeneignung:** Tomate ist weniger geeignet für Lehmboden. Ideal: humusreicher Boden."_
   - Eigene Pflanzen (`customPlants`) können `preferredSoil` ebenfalls setzen
   - **Warnt bei:** Tonboden für Wurzelgemüse, Sandboden für Nährstoffzährer, einzelne Spezialisten wie Heidelbeere (nur Humus)

---

## 🚀 7. Größere Features — TEILS ERLEDIGT

1. ✅ **Mischkultur-Visualisierung auf Canvas** — `showCompanionRelationships` in CanvasRenderer; 🛡️-Toggle-Button in Toolbar; zeigt grüne/rote Verbindungslinien zwischen benachbarten Beeten (bis 1,5m)

2. ✅ **Inter-Beet Mischkultur-Prüfung beim Pflanzen**
   `PlantingModal.js` prüft jetzt auch Pflanzen in Nachbarbeeten (Distanz < 150px, gleicher Threshold wie Canvas-Visualisierung). Zeigt rote Warnung bei schlechten Nachbarn und grüne Info bei guten Nachbarn in der Nähe.

3. ✅ **Rechtsklick-Kontextmenü auf Canvas** — `_onContextMenu()` + `_showContextMenu()` in CanvasInteraction.js; Aktionen: Pflanzung hinzufügen, Fokus, Umbenennen, Duplizieren, Ebene wechseln, Löschen. Umbenennen per Inline-Input (kein `window.prompt()` mehr); Enter = speichern, Escape = abbrechen.

4. ✅ **Jahresstatistik-Ansicht** — `Statistics.js` mit KPI-Kacheln, Ernte-Ranking, Ausgaben-Charts, Status-Grid, Jahres-Selektor

5. ✅ **Drucken / PDF-Export** — In Statistics.js integriert; Canvas-Snapshot, Pflanzliste, Ernte-Protokoll, Ausgaben, A4-Layout

6. ❌ **Mobile-Optimierung**
   Pinch-to-Zoom, bessere Touch-Targets, vereinfachte Ansicht für den Einsatz im Garten mit dem Smartphone.

7. ✅ **Erweiterter Jahresplan**
   Tatsächliche Pflanz- und Erntedaten als Overlay-Balken über den Katalog-Richtwerten im Gantt; Datumszeile je Pflanze; Lücken-Analyse pro Beet mit schraffiertem Indikator; Nachkultur-Vorschläge (≤90 Tage, passende Säzeit) als Chips.

8. ❌ **KI-Assistent (Auto-Layout)**
   Leeres Beet anlegen → „Generieren" → App befüllt es automatisch mit perfekt gematchten Mischkulturen basierend auf Beetgröße, Lichtverhältnissen und bereits geplanten Nachbarbeeten.

---

## 🌱 9. Neue Feature-Ideen — BACKLOG

### 🔥 Hoher Nutzen, machbar

#### 9.1 ❌ KI-Pflanzenerkennung
Foto von Pflanze oder Blatt hochladen → Claude Vision API erkennt Krankheiten, Schädlinge oder die Pflanzensorte selbst. Ergebnis inkl. Behandlungsempfehlung direkt im Foto-Tab oder BedEditor.
- **Input:** Bild-Upload (bestehender Foto-Tab)
- **API:** Claude API mit Vision (Multimodal)
- **Output:** Name des Problems + organische Gegenmaßnahmen + betroffene Pflanzung verknüpfen

#### 9.2 ❌ Samenbank-Verwaltung
Eigene Saatgutvorräte tracken — unabhängig von aktiven Pflanzungen.
- Felder: Sorte, Pflanze, Erntejahr/Kaufjahr, Menge (g/Stück), Haltbarkeit bis, Herkunft (selbst gezogen / gekauft)
- Automatische Warnung wenn Saatgut in 0–3 Monaten abläuft
- Verknüpfung mit Einkaufsliste: „Vorrat aufbrauchen" statt nachkaufen

#### 9.3 ❌ Kalender-Export (iCal / .ics)
Pflanztermine, Gießerinnerungen und Erntetermine als `.ics`-Datei exportieren.
- Direkt importierbar in Apple Kalender, Google Calendar, Outlook
- Export-Button im Kalender-Tab und Aufgaben-Tab
- Einzel-Event pro Pflanzung oder gebündelter Tages-Event

#### 9.4 ❌ Garten-Tagebuch / Journal
Chronologisches Tagebuch mit Einträgen pro Tag/Ereignis.
- Felder: Datum, freier Text, optionales Foto, Wetter (auto-befüllt), verknüpfte Beete/Pflanzen
- Timeline-Ansicht pro Beet oder gesamt
- Durchsuchbar und filterbar nach Saison

---

### 🧪 Mittlerer Aufwand

#### 9.5 ❌ Schädlings- & Krankheitsdatenbank
Eingebaute Datenbank häufiger Gartenprobleme.
- Einträge: Name, Erkennungsmerkmale, betroffene Pflanzen, organische Gegenmaßnahmen
- Verknüpft mit Pflanzenkatalog: „Tomate → häufige Probleme: Braunfäule, Tomatenmosaik"
- Manueller Alert: „Ich habe Befall festgestellt" → Task wird automatisch erstellt

#### 9.6 ❌ Jahresvergleich (Saison A vs. B)
Zwei Saisons nebeneinander in der Statistik vergleichen.
- Erntemenge Saison 2025 vs. 2026 pro Pflanze
- Ausgaben-Vergleich, Aufgaben-Erledigungsquote
- Welche Beete haben besser performt?

#### 9.7 ❌ PWA + Push-Benachrichtigungen
App als Progressive Web App installierbar (Homescreen-Icon, Offline-Betrieb).
- `manifest.json` + Service Worker
- Web Push API für echte Gieß- und Ernte-Erinnerungen auf dem Smartphone
- Kombinierbar mit Mobile-Optimierung (7.6)

---

### 💡 Längerfristig / Vision

#### 9.8 ❌ Saatgut-Tauschbörse (Community)
Lokale Community-Funktion: wer hat welches Saatgut übrig, wer sucht was?
- Erfordert optionale Cloud-Anbindung (→ Abschnitt 10)
- PLZ-basierte Suche, Kontaktaufnahme per E-Mail

#### 9.9 ❌ Bodenanalyse-Tracker
pH-Wert, Hauptnährstoffe (N/P/K) und Bodenfeuchte manuell erfassen und über Saisons verfolgen.
- Verlaufsdiagramm pro Beet
- Düngeempfehlungen basierend auf aktuellen Messwerten und geplanten Pflanzen

---

## ☁️ 10. Cloud & SaaS — BEWUSST ZURÜCKGESTELLT

Erst relevant wenn das Tool vermarktet werden soll:

- **Authentifizierung** (Supabase / Firebase): E-Mail- oder Google-Login
- **Cloud-Datenbank-Sync:** `Store.save()` / `load()` gegen Cloud-API statt lokalen Server
- **Bezahl-Schranke (Stripe):**
  - *Free-Tier:* 1 Garten, Basis-Pflanzenkatalog
  - *Pro-Tier (Abo):* Unbegrenzte Gärten, Frost-Alarm, Fruchtfolge-Assistent, KI-Layout
