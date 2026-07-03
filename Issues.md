# 🐛 Issues — GardenPlaner

Vollständiges Bug-Protokoll aus der Codebase-Analyse vom 12.06.2026 (Code-Stand: Commit `75145b9`).
Analysierter Umfang: alle 23 JS-Dateien in `src/` und `server/` (~8.300 Zeilen).

**Status-Legende:** 🔲 Offen · 🔧 In Arbeit · ✅ Behoben

---

## 🔴 Kritisch — Datenverlust oder Kernfunktion defekt

### #1 — Undo nach Beet-Löschen verliert Pflanzungen & Fotos unwiderruflich
**Status:** ✅ Behoben (12.06.2026)
**Dateien:** `src/core/Store.js:68` (`_pushHistory`), `src/core/Store.js:383` (`deleteBed`)

> **Umsetzung:** History-Snapshot umfasst jetzt `beds` + `plantings` + Foto-Zuordnungen (`photoLinks`, nur id→bedId statt Bilddaten — kein Speicher-Overhead). `deleteBed` löscht Fotos nicht mehr, sondern setzt nur `bedId: null`; Undo stellt die Zuordnung wieder her. Funktional verifiziert: Löschen + Undo → Beet, Pflanzung und Foto-Zuordnung vollständig zurück.

Die Undo-History speichert ausschließlich das `beds`-Array (`JSON.stringify(this._active().beds)`).
`deleteBed()` löscht jedoch zusätzlich alle Pflanzungen (`plantings`) und Fotos (`photos`) des Beets.
Nach Löschen + Ctrl+Z wird nur die leere Beet-Hülle wiederhergestellt — Pflanzungen und Fotos sind dauerhaft weg.

**Reproduktion:** Beet mit Pflanzungen anlegen → Beet löschen → Ctrl+Z → Beet ist da, Pflanzungen fehlen.
**Fix-Idee:** History-Snapshot auf `{ beds, plantings, photos }` erweitern, oder `deleteBed` archiviert statt löscht.

---

### #2 — Delete/Backspace löscht Beet ohne Bestätigung, auch bei fokussiertem Dropdown
**Status:** ✅ Behoben (12.06.2026)
**Datei:** `src/main.js:490-533` (globaler `keydown`-Handler)

> **Umsetzung:** Early-Return erweitert um `SELECT` und `isContentEditable`; vor dem Löschen per Shortcut erscheint jetzt `confirm("…wirklich löschen?")` (konsistent mit dem Kontextmenü). Verifiziert: Backspace bei fokussiertem Dropdown löscht nichts mehr.

Der Handler schließt nur `INPUT` und `TEXTAREA` aus — nicht `SELECT`.
Wer im Eigenschaften-Panel ein Dropdown (Boden, Ebene, Sonnenlicht …) fokussiert hat und Backspace/Delete drückt, löscht kommentarlos das gesamte Beet. In Kombination mit Issue #1 sind dann auch alle Pflanzungen weg.

**Fix-Idee:** `SELECT` (und `isContentEditable`) in den Early-Return aufnehmen + `confirm()` vor dem Löschen (das Kontextmenü fragt bereits nach, der Shortcut nicht).

---

### #3 — macOS: Cmd+Z / Cmd+C / Cmd+V funktionieren nicht; Ctrl+Shift+Z (Redo) feuert nie
**Status:** ✅ Behoben (12.06.2026)
**Datei:** `src/main.js:494-526`

> **Umsetzung:** `const mod = e.ctrlKey || e.metaKey` für alle Shortcuts; `e.key.toLowerCase()` normalisiert den Shift-Großbuchstaben. Verifiziert mit synthetischen Events: Cmd+Z macht rückgängig, Cmd+Shift+Z (Key `'Z'`) stellt wieder her.

1. Alle Shortcuts prüfen nur `e.ctrlKey`, nie `e.metaKey` → auf dem Mac (Primärplattform des Entwicklers!) gehen Cmd-Shortcuts ins Leere.
2. Redo-Check: `e.key === 'y' || (e.shiftKey && e.key === 'z')` — mit gedrücktem Shift liefert der Browser `e.key === 'Z'` (Großbuchstabe). Die Bedingung ist nie wahr; Ctrl+Shift+Z macht nichts.

**Fix-Idee:** `const mod = e.ctrlKey || e.metaKey;` und `e.key.toLowerCase()` verwenden.

---

### #4 — System-Pflanze bearbeiten zerstört Katalogdaten (sowMonth, Nachbarn, Boden)
**Status:** ✅ Behoben (12.06.2026)
**Dateien:** `src/components/Catalog.js:187-211` (`save-custom-plant`), `src/data/plants.js:133-142` (`getAllPlants`)

Beim Speichern im Pflanzen-Editor wird `newPlant` nur aus den Formularfeldern gebaut:
`name, emoji, category, nutrition, isPerennial, spacing, daysToHarvest, waterDays, fertilizeWeeks`.
**Fehlend:** `sowMonth`, `harvestMonth`, `goodNeighbors`, `badNeighbors`, `preferredSoil`.

Da `getAllPlants()` die System-Pflanze per `plantMap.set()` vollständig durch die Custom-Version ersetzt, verliert z. B. eine bearbeitete Tomate:
- ihre Aussaat-/Erntemonate → verschwindet aus Gantt-Jahresplan und Saisonvorschlägen
- ihre Nachbarschaftsdaten → keine Mischkultur-Warnungen mehr
- ihre Bodenpräferenzen → keine Bodeneignungswarnung mehr

Features.md verspricht: „das Original bleibt als Fallback in der Datenbank erhalten" — das stimmt für diese Felder nicht.

**Zusatzproblem:** Neue eigene Pflanzen können nie `sowMonth`/`harvestMonth` bekommen — das Formular hat keine Eingabefelder dafür (die `defaults` in Zeile 91-95 deklarieren sie zwar, sie werden aber beim Speichern nicht übernommen).

**Fix-Idee:** Beim System-Override die fehlenden Felder aus der System-Pflanze mergen (`{ ...systemPlant, ...newPlant }`); Monatsauswahl-UI im Editor ergänzen.

> **Umsetzung:** Editor bekommt zwei Monats-Checkbox-Grids (Aussaat/Ernte, vorbelegt aus dem Katalog). Beim Speichern: `isEdit ? { ...p, ...formFields } : formFields` — alle bestehenden Katalogfelder (`goodNeighbors`, `badNeighbors`, `preferredSoil`, …) bleiben erhalten, nur die Formularfelder werden überschrieben. Verifiziert über echten UI-Flow: Tomate-Spacing auf 60 geändert und gespeichert → Nachbarn, Bodenpräferenz und Monate unverändert vorhanden.

---

### #5 — Mischkultur-Modus: unbegrenzt wachsende requestAnimationFrame-Schleifen
**Status:** ✅ Behoben (12.06.2026)
**Datei:** `src/core/CanvasRenderer.js:283-289` (`_draw`)

```js
if (this.showCompanionRelationships) {
  this._drawCompanionRelationships(this.ctx);
  if (!this.animationFrameLooping) {
    requestAnimationFrame(() => this._draw());
  }
}
```

`this.animationFrameLooping` wird **nirgendwo im Code gesetzt** (grep-verifiziert: einzige Fundstelle ist diese Abfrage). Folge:
1. Jeder `_draw()` bei aktivem Modus plant einen weiteren `_draw()` → Endlosschleife (gewollt für die Animation).
2. ABER: Jedes externe `render()` (Hover, Drag, Zoom, Bus-Events …) startet eine **zusätzliche parallele** Endloskette, da die direkten rAF-Aufrufe am Drossel-Mechanismus von `render()` (Zeile 202-205) vorbeigehen.

Nach einigen Minuten Interaktion laufen Dutzende parallele Render-Schleifen → CPU-Last steigt kontinuierlich, Lüfter, Lag.

**Fix-Idee:** Flag tatsächlich setzen/zurücksetzen, oder die Animationsschleife über den bestehenden `render()`-Mechanismus mit `cancelAnimationFrame` führen.

> **Umsetzung:** Direkter `requestAnimationFrame`-Aufruf durch `this.render()` ersetzt — nutzt den bestehenden `cancelAnimationFrame`/`animationFrame`-Handle, sodass immer nur eine einzige Kette existiert; externe `render()`-Aufrufe (Hover, Drag) ersetzen den Handle statt eine zusätzliche Kette zu starten. Verifiziert: während aktiv konstant ~60 rAF-Calls/Sekunde (eine Kette), nach dem Ausschalten sofort 0 rAF-Calls — keine Restschleife.

---

## 🟠 Mittel — Funktionsfehler

### #6 — Resize rotierter Beete verzerrt
**Status:** ✅ Behoben (12.06.2026)
**Datei:** `src/core/CanvasInteraction.js:378-417`

Die Hit-Erkennung der Griffe (`getHandleAtPosition`) transformiert den Mauspunkt korrekt ins unrotierte Koordinatensystem. Die Resize-Logik selbst rechnet aber mit den **rohen Welt-Deltas** `dx/dy` — bei einem um z. B. 45° gedrehten Beet ziehen die Griffe in die falsche Richtung und Position/Größe springen.

**Fix-Idee:** `dx/dy` vor der Anwendung um `-bed.rotation` um das Beet-Zentrum rotieren.

> **Umsetzung:** Maus-Delta wird jetzt vor der Anwendung um `-bed.rotation` rotiert (Rotation eines Differenzvektors ist pivotunabhängig, daher genügt die reine Winkel-Rotation ohne Zentrumsberechnung). Verifiziert: bei 90°-Rotation transformiert sich ein Welt-Delta (10, 0) korrekt zu einem lokalen Delta (0, -10) statt unverändert übernommen zu werden.

---

### #7 — Stauden-Flag (isPerennial) geht bei Autocomplete-Auswahl verloren
**Status:** ✅ Behoben (12.06.2026)
**Datei:** `src/components/PlantingModal.js:311-324` und `:360`

Bei Klick auf einen Autocomplete-Eintrag wird `selectedPlant` nur aus `dataset.name/emoji/category` gebaut — ohne `isPerennial`. Beim Speichern gilt `const plant = selectedPlant || …`, also gewinnt das unvollständige Objekt: `isPerennial: plant.isPerennial || false` → immer `false`.

**Folge:** Apfelbaum, Erdbeere, Spargel etc. aus dem Katalog werden nicht als mehrjährig angelegt und beim Saisonwechsel **nicht** in die neue Saison geklont (Kernversprechen des Saison-Systems).

**Fix-Idee:** Beim Speichern immer `getPlant(name)` als Quelle für Katalog-Metadaten nutzen.

> **Umsetzung:** Priorität beim Speichern umgedreht: `getPlant(name) || selectedPlant || { name, emoji: '🌱', category: '' }` statt `selectedPlant || getPlant(name) || …`. Verifiziert über echten UI-Flow: Erdbeere per Autocomplete ausgewählt und gespeichert → `isPerennial: true` (vorher `false`).

---

### #8 — Dashboard-Sektion „Vorbereitungen (Diesen Monat)" rendert nie
**Status:** ✅ Behoben (12.06.2026)
**Datei:** `src/components/Dashboard.js:136-151` und `:375-390`

```js
beds.forEach(b => { if (b.plantings) { b.plantings.forEach(...) } });
```

Beete haben **kein** `plantings`-Feld — Pflanzungen liegen in `garden.plantings` mit `bedId`-Referenz. `allPlantings` ist daher immer leer und die gesamte Sektion erscheint nie. Die Sortierung in Zeile 147-151 nutzt zudem `a.month`/`b.month`, ein Feld das ebenfalls nicht existiert (→ `NaN`-Dates).

**Fix-Idee:** `store.getPlantings()` verwenden und über `bedId` auf den Beetnamen mappen — oder Sektion entfernen (Einkaufsliste deckt den Use-Case inzwischen ab).

> **Umsetzung:** `allPlantings` wird jetzt aus `plantings` (= `store.getPlantings()`) gebaut, mit `bedId → bedName`-Lookup statt des nicht existierenden `bed.plantings`. Sortierung nutzt jetzt `datePlanted` statt des nicht existierenden `month`-Feldes (Pflanzungen ohne Datum landen ans Ende). Verifiziert über echten `renderDashboard()`-Aufruf: Sektion erscheint mit korrektem Beet- und Pflanzennamen.

---

### #9 — Flächenberechnungen falsch (Kreis doppelt, L-Form +25 %)
**Status:** ✅ Behoben (12.06.2026)
**Dateien:** `src/components/Statistics.js:361-363` (Druck), `src/components/Dashboard.js:133`

1. **Druck/PDF:** Kreisfläche wird als `2 * π * r²` berechnet — **doppelt** so groß wie korrekt (`π * r²`).
2. **Dashboard-Statistik:** `width * height` für alle Formen — Kreise werden um Faktor 4/π (+27 %) überschätzt, L-Formen um +25 % (Aussparung wird mitgezählt). Features.md verspricht „exakt berechnete Pflanzflächen (in m²)".

**Fix-Idee:** Formabhängige Flächenformel zentral in einem Helper (`bedArea(bed)`).

> **Umsetzung:** Neuer zentraler Helper `bedAreaCm2(bed)`/`bedAreaM2(bed)` in `utils/helpers.js` — korrekte Formeln für circle (`π·rx·ry`), lshaped (`0.75·w·h`, passend zum Cutout in `CanvasRenderer._buildBedPath`), polygon (Shoelace-Formel) und line (0, keine Fläche). In Dashboard.js und Statistics.js (Druck) eingesetzt. Verifiziert: Kreis Ø100cm → 0.7854 m² (statt vorher 1.57 m² im Druck), L-Form 200×150cm → 2.25 m² (statt 3.0 m²).

---

### #10 — Zäune/Linien: Klick-Hit-Test umfasst die gesamte Bounding Box
**Status:** ✅ Behoben (12.06.2026)
**Datei:** `src/core/CanvasRenderer.js:742` (`_isPointInBed`)

Der Segment-Distanz-Check gilt nur für `bed.type === 'polygon'`. Mit dem Linien-Werkzeug erstellte Elemente haben aber `type === 'line'` (CanvasInteraction.js:472) und fallen auf den Bounding-Box-Test zurück.

**Folge:** Ein diagonaler Zaun ist über seine gesamte (riesige) Box anklickbar und fängt Klicks ab, die eigentlich darunterliegende Beete treffen sollten.

**Fix-Idee:** Bedingung auf `bed.type === 'polygon' || bed.type === 'line'` erweitern.

> **Umsetzung:** Bedingung erweitert auf `(bed.type === 'polygon' || bed.type === 'line')`; Linien haben stets `isClosed: false`, laufen also automatisch in den Segment-Distanz-Zweig statt in Ray-Casting. Verifiziert: Klick weit von der Diagonalen entfernt (aber innerhalb der alten Bounding-Box) trifft nicht mehr, Klick direkt auf der Linie trifft weiterhin.

---

### #11 — Performance: Jede Mausbewegung serialisiert den kompletten State (inkl. Fotos)
**Status:** ✅ Behoben (12.06.2026)
**Dateien:** `src/core/Store.js:196-205` (`save`), `src/core/CanvasInteraction.js:367-376`, `src/components/BedEditor.js:244`

1. **Drag/Resize:** Pro `mousemove` läuft `updateBed → save()` → synchrones `JSON.stringify` des **gesamten States inklusive aller Base64-Fotos** nach localStorage. Mit vielen Fotos ruckelt jedes Verschieben massiv.
2. **Namensfeld:** `input`-Event auf dem Beet-Namen ruft pro Tastendruck `updateBed` auf → `_pushHistory()` pro Buchstabe → die 30er-Undo-History ist nach einem Beetnamen voll und ältere echte Zustände sind verdrängt.

**Fix-Idee:** localStorage-Write ebenfalls debouncen; History-Push für Text-Inputs erst auf `change`/`blur`.

> **Umsetzung:** (1) `save()` debounced den localStorage-Write jetzt mit 150ms (analog zum bestehenden 600ms-Server-Debounce), inkl. `beforeunload`-Flush damit beim Tab-Schließen nichts verloren geht. (2) `_pushHistory()` überspringt Pushes, die weniger als 500ms nach dem letzten liegen — schnelle Tastenfolgen landen als EIN Undo-Schritt (Kompromiss: zwei verschiedene Bearbeitungen innerhalb 500ms werden ebenfalls zusammengefasst, akzeptabler Trade-off). Verifiziert: 20 schnelle `updateBed`-Aufrufe → 0 sofortige localStorage-Writes, nur 1 nach Debounce-Ablauf; 11 simulierte Tastendrücke im Namensfeld → nur 1 History-Eintrag statt 11.

---

### #12 — Pflanzen-Marker-Drag re-rendert das komplette Seitenpanel pro Mausbewegung
**Status:** ✅ Behoben (12.06.2026)
**Dateien:** `src/core/CanvasInteraction.js:318-327`, `src/main.js:409-416`

Beim Ziehen eines Pflanzen-Markers feuert jede Mausbewegung `updatePlanting` → `plantings:changed` → main.js re-emittiert `bed:selected` → `openRightPanel` ersetzt das komplette Panel-innerHTML und bindet alle Events neu. Pro `mousemove`. Sichtbares Ruckeln + Fokusverlust in Panel-Inputs.

**Fix-Idee:** Während `isDraggingPlant` die Position nur lokal halten und erst bei `mouseup` in den Store schreiben.

> **Umsetzung:** Position wird während des Ziehens nur in `renderer.draggingPlantPos` gehalten (neues Feld); `CanvasRenderer._drawPlantPositions` nutzt diese lokale Position fürs Rendering des gezogenen Markers. Erst bei `mouseup` wird einmalig `store.updatePlanting()` aufgerufen. Verifiziert mit isoliertem Renderer/Interaction-Paar: 15 simulierte Mausbewegungen → 0 `updatePlanting`-Aufrufe während des Ziehens, genau 1 Aufruf bei `mouseup` mit exakt korrekter Endposition.

---

### #13 — Erweiterter Jahresplan: Überwinternde Kulturen ohne Actual-Balken
**Status:** ✅ Behoben (12.06.2026)
**Datei:** `src/components/Calendar.js:31-44` (`buildActualRange`)

Bei Pflanzung im Oktober und erwarteter Ernte im März (`startM=10`, `endM=3`) läuft die Schleife `for (let m = startM; m <= endM; m++)` nicht — `monthSet` bleibt leer, kein Balken wird gezeichnet. Das Jahr der Daten wird generell ignoriert. Gleiches Problem in der Lücken-Analyse (`busyMonths`).

**Fix-Idee:** Bei `endM < startM` über die Jahresgrenze wickeln (`10,11,12,1,2,3`).

> **Umsetzung:** `buildActualRange` wickelt jetzt bei `endM < startM` über den Jahreswechsel (`startM..12` + `1..endM`). Die Lücken-Analyse (`busyMonths`) nutzt jetzt direkt das korrekte `actualSet` statt eine eigene (fehlerhafte) Range-Schleife zu wiederholen. Verifiziert über echten `renderCalendar()`-Aufruf: Pflanzung Okt. 2026 → Ernte März 2027 erzeugt genau 6 `actual-bar`-Zellen (Okt–März) statt vorher 0.

---

### #14 — Touch: Zeichnen endet immer bei Bildschirmposition (0,0)
**Status:** ✅ Behoben (12.06.2026)
**Datei:** `src/core/CanvasInteraction.js:749-752` (`_onTouchEnd`)

`_onMouseUp({ clientX: 0, clientY: 0, … })` — der Rect/Kreis/L-Form-Abschluss berechnet die zweite Ecke aus der Position (0,0) statt aus dem letzten Touchpunkt. Auf Touch-Geräten entstehen Beete mit falscher Geometrie. (Mobile-Optimierung ist Backlog 7.6, aber das hier ist ein echter Fehler, kein fehlendes Feature.)

**Fix-Idee:** Letzten bekannten Touchpunkt aus `touchmove` zwischenspeichern und in `_onTouchEnd` verwenden.

> **Umsetzung:** `_onTouchStart`/`_onTouchMove` speichern jetzt `this._lastTouchPoint`; `_onTouchEnd` verwendet diesen statt hartcodierter `(0,0)`-Koordinaten. Code-Review-verifiziert (keine Touch-Emulation im Test-Setup verfügbar); Fix ist eine reine 1:1-Ersetzung der Konstante durch den zwischengespeicherten Wert.

---

### #15 — Kontextmenü „Duplizieren" teilt das points-Array per Referenz
**Status:** ✅ Behoben (12.06.2026)
**Datei:** `src/core/CanvasInteraction.js:689-697`

`store.addBed({ ...bed, … })` kopiert flach; `addBed` übernimmt `points: bed.points || []` — Original-Polygon und Duplikat zeigen auf **dasselbe Array**. Jede zukünftige Punkt-Mutation träfe beide Beete. (Ctrl+C/V in main.js macht es korrekt mit `JSON.parse(JSON.stringify(...))`.)

**Fix-Idee:** `points: structuredClone(bed.points)` beim Duplizieren.

> **Umsetzung:** Exakt wie vorgeschlagen — `points: bed.points ? structuredClone(bed.points) : bed.points`. Verifiziert: nach Duplizieren `bed.points === newBed.points` ist `false`; Mutation am Original-Array beeinflusst die Kopie nicht mehr.

---

### #16 — localStorage-Quota: Fotos als Base64 im State → stilles Speicherversagen
**Status:** 🔧 Teilweise behoben (12.06.2026)
**Dateien:** `src/core/Store.js:196-202`, `src/components/Photos.js`, `src/utils/helpers.js:92`

Fotos werden komprimiert (~100–200 KB Base64) direkt im State gespeichert. Bei ~5 MB localStorage-Quota schlägt ab ca. 30–40 Fotos **jede** lokale Speicherung fehl — nur mit `console.warn`, ohne UI-Hinweis. Der grüne Server-Status-Dot suggeriert weiterhin Sicherheit; im Offline-Modus (localStorage-only) ist es realer Datenverlust beim nächsten Reload.

**Fix-Idee:** Fotos getrennt vom Kern-State speichern (IndexedDB oder nur serverseitig); Quota-Fehler im UI anzeigen.

> **Umsetzung (Teil 1 von 2):** Quota-Fehler ist jetzt sichtbar statt still — `_writeLocalStorage()` emittiert bei Fehlschlag `storage:quota-exceeded`; main.js zeigt einen persistenten roten Banner mit „💾 Notfall-Backup exportieren"-Button, der direkt aus dem In-Memory-`store.state` exportiert (nicht aus dem — dann veralteten — localStorage). Banner verschwindet automatisch, sobald ein Write wieder gelingt (`storage:quota-ok`, z.B. nach Foto-Löschung). Verifiziert: simulierter `QuotaExceededError` → Banner erscheint; simulierte Recovery → Banner verschwindet; Export-Button wirft keinen Fehler.
>
> **Noch offen (Teil 2):** Die eigentliche Architektur-Änderung — Fotos getrennt vom Kern-State speichern (IndexedDB oder nur serverseitig) — ist NICHT umgesetzt. Das verhindert den Quota-Fehler nicht, macht ihn nur sichtbar und gibt dem Nutzer eine Notfall-Exit-Option. Größerer Umbau, empfohlen für eine eigene Welle.

---

## 🟡 Klein — Inkonsistenzen, Leaks, Robustheit

### #17 — Frost-Schwelle inkonsistent (`< 2` vs. `<= 2`)
**Status:** 🔲 Offen — `src/components/Dashboard.js:80,99` nutzt `< 2`; `src/components/Tasks.js:153` nutzt `<= 2`. Features.md sagt an einer Stelle „unter 2 °C", an anderer „≤ 2 °C". Bei exakt 2,0 °C warnt der Aufgaben-Tab, das Dashboard nicht.

### #18 — Modal-Overlay akkumuliert Click-Listener
**Status:** 🔲 Offen — PlantingModal, Photos, HarvestModal, ShoppingList rufen bei jedem Öffnen `overlay.addEventListener('click', …)` auf dem **geteilten** `#modal-overlay` auf, ohne alte Listener zu entfernen. HarvestModal re-rendert sich zudem nach jedem Speichern selbst → besonders schnelle Akkumulation. Folgen: mehrfache `closeModal`-Aufrufe, Memory-Leak über die Session.

### #19 — Gartenwechsel führt `_onGardenSwitch` doppelt aus
**Status:** 🔲 Offen — `store.switchGarden()` emittiert `garden:switched` (→ main.js:423 ruft `_onGardenSwitch`), zusätzlich ruft GardenManager.js:93 den Callback direkt auf. Doppeltes Re-Rendering aller Views bei jedem Wechsel.

### #20 — Zoom-Anzeige stale / Zoom-Sprung nach Fokus-Modus
**Status:** 🔲 Offen — (a) `fitAll()` beim App-Start (main.js:41) und in `exitFocus()` emittiert kein `zoom:changed` → Label zeigt 100 % obwohl der Zoom anders ist. (b) `focusBed` zoomt bis 6×, das Mausrad clampt auf max. 3× (CanvasInteraction.js:554) → erster Scroll im Fokus-Modus springt hart von 6× auf 3×.

### #21 — User-Eingaben unescaped in HTML-Templates
**Status:** 🔲 Offen — Beet-Namen, Notizen, Sorten, Pflanzennamen werden in fast allen Komponenten unescaped in Template-Literals interpoliert (z. B. BedEditor.js:28 `value="${bed.name}"`). Ein `"` im Beetnamen zerbricht das Attribut, `<` bricht Layout; lokales XSS-Risiko gering, aber UI-Korruption real. Einzig GardenManager.js hat `_escapeHtml`. **Fix-Idee:** zentrale `esc()`-Helper-Funktion und konsequent nutzen.

### #22 — Server: JSON-Write nicht atomar
**Status:** 🔲 Offen — `server/index.js:43`: `writeFileSync` direkt auf die Zieldatei. Absturz/Stromausfall mitten im Write hinterlässt eine korrupte `garden-data.json` → beim nächsten Start liefert `readData()` `null` und der Client lädt/überschreibt mit leerem Stand. **Fix-Idee:** in Temp-Datei schreiben + `renameSync`; optional Backup-Rotation.

### #23 — Toter Selector `[data-view=garden]`
**Status:** 🔲 Offen — BedEditor.js:389: `document.querySelector('[data-view=garden]')?.click()` — die View heißt `canvas`, der Selector findet nie etwas. Harmlos (das gewünschte Re-Rendering passiert über den Event-Bus sowieso), aber toter Code.

### #24 — Gieß-Erinnerung „Heute fällig" jeden Tag bei fehlendem Pflanzdatum
**Status:** 🔲 Offen — Tasks.js:33-36: Ohne `datePlanted` ist `daysSincePlanted = 0` und `0 % waterDays === 0` → die Pflanzung erscheint **jeden Tag** als „Heute fällig". Gleiches Muster beim Düngen (dort durch `daysSincePlanted > 0` abgefangen — nur beim Gießen fehlt der Check).

### #25 — L-Form: Klick in die Aussparung trifft das Beet
**Status:** 🔲 Offen — CanvasRenderer.js:789: L-Form nutzt Bounding-Box-Hit-Test; die ausgesparte Ecke (oben rechts) ist klickbar/wählbar und Pflanzen-Marker lassen sich dort platzieren, obwohl dort kein Beet ist.

### #26 — `compressImage` ohne Fehlerbehandlung
**Status:** 🔲 Offen — helpers.js:92: kein `img.onerror` → bei defekter Bilddatei wird das Promise nie resolved, der Foto-Upload hängt still.

### #27 — Backup-Export liest localStorage statt Store-State
**Status:** 🔲 Offen — SettingsManager.js:372: Export nutzt `localStorage.getItem(...)`. Wenn der letzte localStorage-Write am Quota scheiterte (Issue #16), exportiert man veraltete Daten, obwohl der aktuelle State im Speicher korrekt wäre. **Fix-Idee:** `JSON.stringify(store.state)` exportieren.

### #28 — `customHeight: 0` nicht speicherbar
**Status:** 🔲 Offen — Store.js:358: `customHeight: bed.customHeight || null` — eine explizit gesetzte Aufbauhöhe von 0 m wird durch `|| null` verworfen und fällt auf die Typ-Standardhöhe zurück (relevant z. B. für flache Bodenbeete, die keinen Schatten werfen sollen). Gleiches `||`-Muster bei `rotation: 0` (harmlos, da 0 = Default) und in `updateDim` (BedEditor). **Fix-Idee:** `?? null` statt `|| null`.

---

## Priorisierungsvorschlag

| Welle | Issues | Begründung |
|-------|--------|------------|
| 1 | #1, #2, #3 | Datenverlust + Grundbedienung auf macOS |
| 2 | #4, #5, #7 | Katalog-Datenverlust, CPU-Leak, Saison-Kernversprechen |
| 3 | #6, #8–#16 | Sichtbare Funktionsfehler |
| 4 | #17–#28 | Aufräumarbeiten, Robustheit |
