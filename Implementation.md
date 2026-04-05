# Implementierungsplan: GardenPlaner V2

Letzte Aktualisierung: April 2026

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

## 🔧 5. Quick Wins & UX-Verbesserungen — OFFEN

Kleinere Features mit hohem Alltagsnutzen:

1. **Undo / Redo** ⭐
   Rückgängig/Wiederholen für alle Canvas-Aktionen (Verschieben, Löschen, Zeichnen). Aktuell führt jeder Fehler zu manuellem Aufräumen.

2. **Beet kopieren / einfügen**
   Gleiche Beete mehrfach verwenden ohne jedes Mal neu zu konfigurieren.

3. **„Alles einpassen"-Zoom**
   Button der den Garten zentriert und vollständig sichtbar macht (z. B. beim Öffnen oder nach dem Zeichnen).

4. **Fläche beim Zeichnen anzeigen**
   Beim Aufziehen eines Rechtecks/Kreises die Fläche in m² live neben dem Cursor anzeigen.

5. **Standort für Sonnenberechnung nutzen**
   Den gespeicherten Breiten-/Längengrad (aus Wetter-Einstellungen) für die Schattensimulation verwenden statt hartkodierter 50°N.

6. **Mehr Pflanzen im Katalog**
   Aktuell 51 Pflanzen — Erweiterung um häufige Sorten (z. B. Zucchini-Varianten, Beerenobst, Heilkräuter).

---

## 🌱 6. Gärtner-Features — OFFEN

Features die die App im Alltag über die Saison relevant halten:

1. **Fruchtfolge-Assistent** ⭐
   Nach der Saison Empfehlungen für das Folgejahr: „Hier war Tomate (Starkzehrer) → nächstes Jahr Bohne (Schwachzehrer)". Basiert auf Nährstoffbedarf aus `plants.js` (`nutrition: 'stark'/'mittel'/'schwach'`).

2. **Ernte-Protokoll**
   Pro Beet/Pflanze: wann geerntet, wieviel (kg/Stück), Notiz. Ermöglicht Jahresvergleiche und Planung der Menge für Folgejahr.

3. **Gieß- & Dünge-Kalender**
   Erinnerungen pro Beet oder Pflanze (z. B. „Tomate alle 2–3 Tage gießen"). Integration in den bestehenden Aufgaben-Tab.

4. **Saison-Archiv**
   Aktuellen Gartenstatus eines Jahres „einfrieren" (Read-only-Kopie) um Vorjahres-Bepflanzung als Referenz zu behalten.

5. **Aussaat-Erinnerungen**
   Push-Notifications oder Dashboard-Hinweis: „In 2 Wochen ist ideale Aussaatzeit für Tomaten (laut Standort & Gantt)".

---

## 🚀 7. Größere Features — OFFEN

Aufwändigere Features mit Alleinstellungsmerkmal gegenüber Stift & Papier:

1. **Mischkultur-Visualisierung auf Canvas** ⭐
   Gute/schlechte Nachbarn zwischen benachbarten Beeten als farbige Verbindungslinien oder Warn-Icons direkt im Gartenplan sichtbar machen.

2. **Drucken / PDF-Export des Gartenplans**
   Den Canvas-Gartenplan als sauber formatiertes PDF exportieren — inkl. Pflanzliste, Legende und Beet-Details.

3. **Mobile-Optimierung**
   Pinch-to-Zoom, bessere Touch-Targets, vereinfachte Ansicht für den Einsatz im Garten mit dem Smartphone.

4. **Erweiterter Jahresplan**
   Tatsächliche Pflanz- und Erntedaten als Overlay über den Katalog-Richtwerten im Gantt; Lücken-Analyse für Nachkulturen.

5. **KI-Assistent (Auto-Layout)**
   Leeres Beet anlegen → „Generieren" → App befüllt es automatisch mit perfekt gematchten Mischkulturen basierend auf Beetgröße, Lichtverhältnissen und bereits geplanten Nachbarbeeten.

---

## ☁️ 8. Cloud & SaaS — ZURÜCKGESTELLT

Erst relevant wenn das Tool vermarktet werden soll:

- **Authentifizierung** (Supabase / Firebase): E-Mail- oder Google-Login
- **Cloud-Datenbank-Sync:** `Store.save()` / `load()` gegen Cloud-API statt lokalen Server
- **Bezahl-Schranke (Stripe):**
  - *Free-Tier:* 1 Garten, Basis-Pflanzenkatalog
  - *Pro-Tier (Abo):* Unbegrenzte Gärten, Frost-Alarm, Fruchtfolge-Assistent, KI-Layout
