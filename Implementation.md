# Implementierungsplan: GardenPlaner V2

Letzte Aktualisierung: April 2026 (Abgeglichen mit Code-Stand: 12.04.2026)

---

## ✅ 1. Neues Design & Farbgebung — ERLEDIGT

- ✅ **Texturen auf Canvas:** Erde, Rindenmulch, Gras, Holzdielen, Kies — per `ctx.createPattern()` als Overlay
- ✅ **Erdtöne-Theming:** Terracotta (`#7c5c3e`), Sand, Schieferblau statt Grün-Lastig; Light + Dark Mode
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

## ✅ 3. Lokale Datenpersistenz (provisorisch) — ERLEDIGT

Statt reinem `localStorage` ein lokaler Express-Server als persistente Datenbank.

- ✅ **Express-Backend** (`server/index.js`): `GET/POST /api/data` → schreibt `server/garden-data.json`
- ✅ **Dual-Write-Pattern:** localStorage (sofort) + debounced Server-Push (600ms)
- ✅ **Server als autoritativ beim Start:** `initFromServer()` lädt Server-Daten und überschreibt localStorage-Cache
- ✅ **Server-Status-Indikator:** Farbiger Dot in der Toolbar (grün = online, grau = nur localStorage)
- ✅ **Produktionsmodus:** Server liefert auch statische Dateien aus `dist/` aus
- ✅ **Start-Skript:** `Start GartenPlaner.bat` für Windows-Doppelklick-Start
- ✅ **GitHub Pages Deployment:** GitHub Actions Workflow für statisches Frontend-Hosting

> **Offen (Cloud-SaaS):** Authentifizierung (Supabase/Firebase), Cloud-Datenbank-Sync, Stripe-Paywall — erst relevant wenn das Tool vermarktet werden soll.

---

## ✅ 4a. Jahres-Gantt-Diagramm — ERLEDIGT

- ✅ Toggle zwischen **Monatsansicht** und **Jahresplan** im Kalender-View
- ✅ Balken nach Phase: 🔵 Säen (Accent) · 🟤 Wachsen (Primary) · 🟢 Ernte (Success)
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

## ✅ Bugfixes & UX-Korrekturen — ERLEDIGT

- ✅ **Maßverhältnisse Beete:** Eingabe und Anzeige in Metern (intern cm) — konsistent mit Gartenmaßen
- ✅ **Aufbauhöhe in Metern:** BedEditor + SettingsManager zeigen Höhen in m statt cm
- ✅ **Schattengröße:** Physikalisch korrekte Elevation-Formel (war 10× zu klein)
- ✅ **Schatten-Offset-Cap:** Max 48px — verhindert losgelöstes Ghost-Duplikat bei großen Objekten
- ✅ **Lineal / Zeichenvorschau:** Doppelter Canvas-Transform entfernt — Preview liegt jetzt am Mauszeiger

---

## ✅ 5. Quick Wins & UX-Verbesserungen — GRÖSSTENTEILS ERLEDIGT

Kleinere Features mit hohem Alltagsnutzen:

- ✅ **Undo / Redo** — `store.undo()` / `store.redo()` mit History-Stack (max. 30 Schritte), Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z
- ✅ **Beet kopieren / einfügen** — Clipboard via Ctrl+C / Ctrl+V, Offset +20px, Name mit „(Kopie)"-Suffix; auch Copy-Button im BedEditor
- ✅ **„Alles einpassen"-Zoom** — `renderer.fitAll()` Button in Toolbar
- ✅ **Standort für Sonnenberechnung nutzen** — `store.getSettings().location.lat` wird in `CanvasRenderer._drawBed()` für physikalische Elevation genutzt
- ✅ **Mehr Pflanzen im Katalog** — 71 Pflanzen (Gemüse, Kräuter, Obst, Blumen) inkl. `goodNeighbors`, `badNeighbors`, `nutrition`

**Noch offen aus diesem Abschnitt:**

1. **Fläche beim Zeichnen anzeigen**
   Beim Aufziehen eines Rechtecks/Kreises die Fläche in m² live neben dem Cursor anzeigen. (`CanvasInteraction.js` → `drawPreview()`)

2. **Task-System: Modal statt `prompt()`** 🔴 UX-Blocker
   `Tasks.js` Z.47–52 nutzt `window.prompt()` — ersetzen durch Inline-Formular mit Feldern: Titel, Fälligkeitsdatum (Date-Picker), Beet-Verknüpfung (Dropdown), Priorität (`high/normal/low`), Kategorie-Tag (🪴/🛠️/💧/🛒).
   Store-Erweiterung: `priority`, `category` zum Task-Objekt ergänzen.

3. **Budget-System: Modal statt `prompt()`** 🔴 UX-Blocker
   `Dashboard.js` Z.319–322 nutzt `window.prompt()` für Name + Betrag — ersetzen durch Modal mit Kategorie-Picker, Bearbeiten-Funktion und monatlicher Gruppenansicht.

4. ✅ **Sunlight-Feld im BedEditor fehlt im HTML** — ERLEDIGT
   `BedEditor.js`: `<select id="bed-sunlight-select">` nach dem Feuchtigkeit-Feld eingefügt (☀️/⛅/🌑). Standard-Wert: `partial` wenn noch nicht gesetzt.

5. ✅ **Dashboard: Überfällige Tasks als Alert-Sektion** — ERLEDIGT
   Tasks mit `dueDate < heute` und `completed = false` erscheinen als roter Alert-Banner oben im Dashboard, inkl. Auflistung der ersten 3 Titel und Link direkt in den Tasks-Tab.

---

## 🌱 6. Gärtner-Features — OFFEN

Features die die App im Alltag über die Saison relevant halten:

1. ✅ **Fruchtfolge-Assistent** — ERLEDIGT
   Proaktive Saison-Ende-Empfehlung pro Beet: Analysiert den Nährstoffbedarf (Stark→Mittel→Schwach→Gründüngung→Stark) und empfiehlt konkrete Folgepflanzungen.
   Implementiert als `CropRotation.js`-Komponente mit Dashboard-Widget. Enthält auch Gründüngungsvorschläge (Gelbsenf, Phacelia, Klee etc.).
   > Die bestehende Fruchtfolge-Warnung beim Pflanzen (`PlantingModal.js`) bleibt unverändert aktiv.

2. ✅ **Ernte-Protokoll** — ERLEDIGT
   Pro Pflanzung: wann geerntet, wieviel (kg/Stück/Bund/g/l), Notiz. Ermöglicht Saisonvergleiche.
   Implementiert als `HarvestModal.js` (Modal über 🧺-Button im BedEditor), `Store.addHarvest()`/`getHarvests()`/`deleteHarvest()` API.
   Dashboard-Widget: „Ernte-Protokoll" zeigt Gesamternte aggregiert nach Pflanze mit Mengen.

3. **Automatische Einkaufsliste** ⭐
   Alle Pflanzungen mit Status `planned` sollen automatisch Einkaufseinträge erzeugen. Aktuell nur als passiver Hinweistext im Dashboard — kein Check-off, kein Export.
   Umsetzung: Neue Komponente `ShoppingList.js`, Integration im Dashboard und Tasks-Tab, CSV-Export.

4. **Erweiterte Pflanzungserfassung**
   Beim Hinzufügen einer Pflanzung fehlen: Anzahl (Stück), Sorte/Varietät (Freitext), Pflanzabstand (cm, aus DB vorbelegt), geplantes Erntedatum (auto-berechnet aus `datePlanted + daysToHarvest`).
   Ergänzung `plants.js`: Felder `spacing`, `daysToHarvest`, `sunRequirement`.

5. **Gieß- & Dünge-Kalender**
   Erinnerungen pro Beet oder Pflanze (z. B. „Tomate alle 2–3 Tage gießen"). Integration in den bestehenden Aufgaben-Tab.

6. **Saison-Archiv**
   Aktuellen Gartenstatus eines Jahres „einfrieren" (Read-only-Kopie) um Vorjahres-Bepflanzung als Referenz zu behalten.

7. **Aussaat-Erinnerungen**
   Push-Notifications oder Dashboard-Hinweis: „In 2 Wochen ist ideale Aussaatzeit für Tomaten (laut Standort & Gantt)".

---

## 🚀 7. Größere Features — OFFEN

Aufwändigere Features mit Alleinstellungsmerkmal gegenüber Stift & Papier:

1. **Mischkultur-Visualisierung auf Canvas** ⭐
   Gute/schlechte Nachbarn zwischen benachbarten Beeten als farbige Verbindungslinien oder Warn-Icons direkt im Gartenplan sichtbar machen.

2. **Inter-Beet Mischkultur-Prüfung beim Pflanzen**
   `PlantingModal.js` prüft aktuell nur Pflanzen *innerhalb* eines Beets. Schlechte Nachbarn in *benachbarten* Beeten (Distanz < X Pixel) werden ignoriert.
   Umsetzung: Distanzberechnung über Beet-Koordinaten → Warnung „In Beet 'Tomaten' (50 cm entfernt) wächst Kartoffel — schlechter Nachbar!".

3. **Rechtsklick-Kontextmenü auf Canvas**
   Rechtsklick auf ein Beet → Kontextmenü: Pflanzung hinzufügen, Umbenennen, Duplizieren, Ebene wechseln, Löschen.
   Umsetzung: `CanvasInteraction.js` via `contextmenu`-Event + positioniertes Overlay-Div.

4. **Jahresstatistik-Ansicht** (neuer Tab 📊)
   Gesamternte nach Kategorie, aktivste Beete, Ausgaben nach Monat (Bar-Chart via Canvas), Vergleich Vorjahr vs. aktuell, erledigte Tasks nach Monat.
   Neue Datei: `src/components/Statistics.js`, neuer Nav-Eintrag in `main.js`.

5. **Drucken / PDF-Export des Gartenplans**
   Den Canvas-Gartenplan als sauber formatiertes PDF exportieren — inkl. Pflanzliste, Legende und Beet-Details.

6. **Mobile-Optimierung**
   Pinch-to-Zoom, bessere Touch-Targets, vereinfachte Ansicht für den Einsatz im Garten mit dem Smartphone.

7. **Erweiterter Jahresplan**
   Tatsächliche Pflanz- und Erntedaten als Overlay über den Katalog-Richtwerten im Gantt; Lücken-Analyse für Nachkulturen.

8. **KI-Assistent (Auto-Layout)**
   Leeres Beet anlegen → „Generieren" → App befüllt es automatisch mit perfekt gematchten Mischkulturen basierend auf Beetgröße, Lichtverhältnissen und bereits geplanten Nachbarbeeten.

---

## ☁️ 8. Cloud & SaaS — ZURÜCKGESTELLT

Erst relevant wenn das Tool vermarktet werden soll:

- **Authentifizierung** (Supabase / Firebase): E-Mail- oder Google-Login
- **Cloud-Datenbank-Sync:** `Store.save()` / `load()` gegen Cloud-API statt lokalen Server
- **Bezahl-Schranke (Stripe):**
  - *Free-Tier:* 1 Garten, Basis-Pflanzenkatalog
  - *Pro-Tier (Abo):* Unbegrenzte Gärten, Frost-Alarm, Fruchtfolge-Assistent, KI-Layout
