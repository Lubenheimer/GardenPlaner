# GardenPlaner – Feature-Dokumentation & Analyse (v2 – Stand April 2026)

## Projektübersicht

**GardenPlaner** ist eine intelligente Komplettlösung für die digitale Gartenplanung. Die App richtet sich an Hobby-Gärtner, Selbstversorger, Balkon-Gärtner und Schrebergärtner. Sie läuft vollständig lokal ohne Cloud-Zwang oder Account-Registrierung.

**Tech-Stack:** Vanilla JavaScript, HTML/CSS, lokaler Express.js-Server, Canvas-basiertes Rendering, Open-Meteo API (kostenlos, kein API-Key nötig)

**Aktueller Funktionsumfang:** 13 Hauptfeaturebereiche

---

## Änderungen gegenüber v1

| Bereich | v1 | v2 |
|---|---|---|
| Anzahl Features | 12 | **13** |
| Pflanzen in Datenbank | 68 | **78** |
| Neues Feature | – | 📚 Pflanzen-Bibliothek & Eigene Pflanzen |
| Feature-Nummerierung | 1–12 | 1–13 (ab #3 verschoben) |

**Neu in v2 (Highlight):** Nutzer können jetzt eigene Pflanzen anlegen, System-Pflanzen überschreiben und von einem hybriden Katalog profitieren, der eigene und System-Pflanzen nahtlos vereint.

---

## Feature 1: Interaktiver 2D & 3D Garten-Editor

Der Editor ist das Herzstück der App und ermöglicht präzises visuelles Planen.

- **Freie Formgestaltung:** Beete, Rasenflächen, Pflastersteine oder Zäune als Rechteck, Kreis, L-Form oder individuelles Polygon
- **Präzisionswerkzeuge:** Integriertes Mess-Werkzeug (Lineal) und ein- /abschaltbares Raster (Grid)
- **Echtzeit 3D-Ansicht:** Per Knopfdruck in Pseudo-3D-Ansicht wechseln für räumlichen Eindruck
- **Rechtsklick-Kontextmenü:** Schnellzugriff auf Pflanzung hinzufügen, Umbenennen, Duplizieren, Ebene wechseln, Löschen
- **Lesbare Beschriftungen:** Objektnamen und Pflanzen-Emojis bleiben horizontal ausgerichtet, auch bei Rotation
- **Schattenwurf-Toggle:** Pro Objekt einzeln aktivierbar/deaktivierbar (sinnvoll für flache Beete oder Bodenflächen)

---

## Feature 2: Intelligenter Pflanz-Assistent

Eine eingebaute Botanik-Datenbank verhindert schlechte Nachbarschaften und optimiert Erträge.

- **78 Pflanzen** *(v2: +10 gegenüber v1)* – Gemüse, Kräuter, Obst, Blumen, jeweils mit:
  - Guten und schlechten Nachbarn
  - Nährstoffbedarf (Starkzehrer/Schwachzehrer)
  - Pflanzabstand (cm)
  - Erntezeit (Tage)
  - Gieß- und Düngeintervallen
- **Live-Warnungen:** Sofortiges Pop-Up bei Platzierung inkompatibler Pflanzen im selben Beet, inkl. Bodencheck und Lichtanalyse
- **Erweiterte Pflanzungserfassung:** Anzahl (Stück), Sorte/Varietät, Pflanzabstand – teils automatisch aus Katalog befüllt
- **Info-Badges:** Kurzinfos zu Nährstoff, Abstand, Erntezeit und Pflege direkt bei Pflanzenauswahl
- **Boden- & Nährstoff-Check:** Verfolgung von Nährstoffbedarf, Bodenbeschaffenheit und Feuchtigkeit pro Beet

---

## Feature 3: Pflanzen-Bibliothek & Eigene Pflanzen (Katalog) ⭐ NEU in v2

Dein personalisiertes Garten-Lexikon direkt in der App – das Herzstück der Erweiterung in v2.

- **System-Katalog:** 78 fundierte Garten-Pflanzen (Gemüse, Obst, Kräuter, Blumen) abrufbar
- **Eigene Pflanzen anlegen:** Erstelle völlig neue Sorten mit vollständig eigenen Werten:
  - Pflanzabstand
  - Erntedauer
  - Gieß-/Düngeintervall
  - Nährstoffbedarf
  - Nachbarschaftsregeln (gut/schlecht)
- **Hybrides System:** Eigene Pflanzen verhalten sich in der gesamten App zu 100% wie System-Pflanzen – inkl. Fruchtfolge-Warnungen, Autocomplete im Beet-Editor u.v.m.
- **System-Pflanzen überschreiben:** Nicht zufrieden mit Standard-Vorgaben? Bearbeite sie – die App überschreibt sie virtuell mit deinen Werten, das Original bleibt als Fallback erhalten.

---

## Feature 4: Dynamische Schatten- & Sonnen-Simulation

Physikalisch korrekter Schattenwurf für optimale Pflanzenplatzierung.

- **Echter Schattenwurf:** Nordausrichtung definierbar, daraus physikalisch korrekte Schattenberechnung
- **Zeitsteuerung:** Slider für Tageszeit (8:00–20:00 Uhr) und Monat (Januar–Dezember) zum Durchspielen verschiedener Szenarien
- **Standort-Warnung:** Alarm bei Platzierung von Sonnenpflanzen in Schattenbereichen
- **Toggle:** Objekte können vom Schattenwurf ausgenommen werden

---

## Feature 5: Zentrale Leitzentrale (Dashboard)

Alle wichtigen Garten-Informationen auf einen Blick.

- **Flächen-Statistik:** Gesamtanzahl Beete, exakte Pflanzflächen in m²
- **Wetter-Widget:** 7-Tage-Vorhersage über Open-Meteo (kein API-Key), inkl. Frost-Warnung bei Nachttemperaturen < 2 °C
- **Saisonale Vorschläge:** Welche Pflanzen jetzt aussäen oder ernten
- **Ernte-Protokoll:** Erfassung von Erntemenge (kg/Stück/Bund/l), Datum, Notizen; Aggregation nach Pflanze
- **Fruchtfolge-Assistent:** Proaktive Empfehlungen nach Saison – Zyklus: Starkzehrer → Mittelzehrer → Schwachzehrer → Gründüngung, mit konkreten Pflanzvorschlägen
- **Status-Tracking:** „Geplant", „Gepflanzt", „Im Wachstum", „Erntebereit"
- **Aufgaben-Alert:** Roter Banner bei überfälligen Tasks

---

## Feature 6: Finanz- & Budgetverwaltung

Transparenz über alle Gartenkosten.

- **Ausgaben-Tracker:** Einkäufe eintragen (Erde, Werkzeuge, Saatgut)
- **Automatische Kategorisierung:** Mit Icons und Budget-Zuordnung
- **Saisonal aggregierte Kosten:** Gesamtausgaben pro Saison auf einen Blick

---

## Feature 7: Aufgaben & Intelligenter Gieß-/Dünge-Kalender

Das integrierte Gedächtnis des Gartens – wetter-intelligent.

- **Aufgaben-Verwaltung:** Checklisten mit Deadlines (z.B. „Hecke schneiden", „Teichfilter reinigen")
- **Automatische Erinnerungen:** Basierend auf Pflegeintervallen – Aufgabenansicht zeigt „Heute fällig" und „Demnächst" (nächste 3 Tage)
- **Niederschlags-Integration:**
  - Stündliche Regendaten der letzten 24h und nächsten 48h (Open-Meteo)
  - Ausreichend Regen → Gieß-Task automatisch als „Durch Regen erledigt" markiert und durchgestrichen
- **Pflanztyp-spezifische Schwellenwerte:**
  - Dürretolerant (Rosmarin, Thymian, 7+ Tage Rhythmus): ab 3mm als versorgt
  - Wasserintensiv (Tomate, Gurke): 8mm für vollständige Deckung
- **Niederschlags-Banner:** Kompaktinfos zu gestriger Nacht, heutiger Nacht, nächsten 24h; Staunässe-Warnung bei > 15mm
- **Pflege-Intervall-Übersicht:** Kacheln pro Beet mit Gieß- (💧 2d) und Dünge-Badges (🧪 2w)
- **Automatische Einkaufslisten:** Geplante Pflanzen erscheinen als Erinnerungs-Block auf dem Dashboard

---

## Feature 8: Jahreskalender & Gantt-Diagramm

Saisonale Übersicht für die Gesamtplanung.

- **Zwei Ansichten:** Klassischer Monatskalender und Gantt-Diagramm
- **Gantt-Phasenbalken:**
  - 🔵 Säen
  - 🟤 Wachsen
  - 🟢 Ernte
- **Beet-Gruppierung:** Pflanzen nach Beet geordnet, aktueller Monat hervorgehoben

---

## Feature 9: Höhenebenen (Z-Achse)

Realistische Darstellung von Hanglagen und mehrstöckigen Konstruktionen.

- **Ebenen:** Bodenebene, Hochbeet, Terrasse (und weitere benutzerdefinierte)
- **Korrekte Darstellung:** Objekte auf höheren Ebenen überlappen optisch sauber
- **Distanz-Schatten:** Höhere Objekte werfen größere, realistischere Schatten

---

## Feature 10: Wachstums- & Fotoarchiv

Visuelle Dokumentation des Gartenerfolgs.

- **Foto-Upload:** Direkt in einzelne Beete oder in die zentrale Foto-Station
- **Langzeit-Dokumentation:** Visueller Nachweis über die Saison hinweg

---

## Feature 11: Multi-Garten-Verwaltung

Verwaltung mehrerer Projekte in einer App.

- **Mehrere Gärten:** Erstellen, benennen, zwischen Projekten wechseln, löschen
- **Typische Projekte:** Hausgarten, Balkon, Schrebergarten
- **Automatische Migration:** Bestehende Einzelgarten-Daten werden beim Start automatisch ins neue Format überführt

---

## Feature 12: Farbdesign & Themes

Personalisierung der Benutzeroberfläche.

- **5 kuratierte Themes:**
  - 🏺 Terracotta (Standard)
  - 🌲 Forest
  - 🌊 Ocean
  - 🌾 Harvest
  - 🌑 Midnight
- **Je Light- & Dark-Variante:** Insgesamt 10 Erscheinungsbilder
- **Sofortvorschau:** Visuelle Kacheln mit Farbswatch, kein Neustart nötig
- **Persistenz:** Gewähltes Theme bleibt über Neustarts hinweg erhalten

---

## Feature 13: Lokale Datensicherung & Offline-Betrieb

Vollständige Datensouveränität – keine Cloud, kein Konto.

- **Lokaler Express-Server:** Schreibt alle Daten in lokale JSON-Datei
- **Dual-Write-Strategie:**
  - Sofort-Sicherung in localStorage (Cache/Offline-Fallback)
  - Debounced Server-Push für dauerhafte Persistenz
- **Server-Status-Indikator:** Farbpunkt zeigt Verbindungsstatus (grün = lokal DB aktiv, grau = nur Browser-Speicher)
- **Windows-Start:** Doppelklick auf `Start GartenPlaner.bat` startet Server und Browser automatisch

---

## Zusammenfassung

GardenPlaner vereint in einer einzigen lokalen App (Stand v2, April 2026):

| Kategorie | Details |
|---|---|
| Features gesamt | 13 |
| Pflanzen in Datenbank | 78 (inkl. anpassbarer System-Pflanzen) |
| Eigene Pflanzen | unbegrenzt anlegbar |
| Wetter-API | Open-Meteo (kostenlos, kein Key) |
| Datenspeicherung | Lokal (JSON + localStorage) |
| Cloud-Pflicht | Keine |
| Plattform | Windows (Electron-ähnlich via Express.js) |

Die App ist ideal für Selbstversorger und Hobby-Gärtner, die eine datenschutzfreundliche, vollständig offline nutzbare Lösung suchen und dabei auf den Komfort einer intelligenten, wetter-vernetzten Planungssoftware nicht verzichten wollen.
