# GardenPlaner – Feature-Dokumentation & Analyse (v3 – Stand April 2026)

## Projektübersicht

**GardenPlaner** ist eine intelligente Komplettlösung für die digitale Gartenplanung. Die App richtet sich an Hobby-Gärtner, Selbstversorger, Balkon-Gärtner und Schrebergärtner. Sie läuft vollständig lokal ohne Cloud-Zwang oder Account-Registrierung.

**Tech-Stack:** Vanilla JavaScript, HTML/CSS, lokaler Express.js-Server, Canvas-basiertes Rendering, Open-Meteo API (kostenlos, kein API-Key nötig)

**Aktueller Funktionsumfang:** 15 Features

---

## Änderungshistorie

| Version | Features | Pflanzendatenbank | Wichtigste Neuerung |
|---|---|---|---|
| v1 | 12 | 68 Pflanzen | Basis-Release |
| v2 | 13 | 78 Pflanzen | Pflanzen-Bibliothek & Eigene Pflanzen |
| **v3** | **15** | **78 Pflanzen** | **Jahresstatistik + Drucken/PDF-Export** |

**Neu in v3:**
- 📊 Feature 9: Jahresstatistik mit KPI-Kacheln, Diagrammen und Auswertungen
- 🖨️ Feature 10: Drucken & PDF-Export des Gartenplans

---

## Feature 1: Interaktiver 2D & 3D Garten-Editor

Der Editor ist das Herzstück der App und ermöglicht präzises visuelles Planen.

- **Freie Formgestaltung:** Beete, Rasenflächen, Pflastersteine oder Zäune als Rechteck, Kreis, L-Form oder individuelles Polygon
- **Präzisionswerkzeuge:** Integriertes Mess-Werkzeug (Lineal) und ein-/abschaltbares Raster (Grid)
- **Echtzeit 3D-Ansicht:** Per Knopfdruck in Pseudo-3D-Ansicht wechseln für räumlichen Eindruck
- **Rechtsklick-Kontextmenü:** Schnellzugriff auf Pflanzung hinzufügen, Umbenennen, Duplizieren, Ebene wechseln, Löschen
- **Lesbare Beschriftungen:** Objektnamen und Pflanzen-Emojis bleiben horizontal ausgerichtet, auch bei Rotation
- **Schattenwurf-Toggle:** Pro Objekt einzeln aktivierbar/deaktivierbar (sinnvoll für flache Beete oder Bodenflächen)

---

## Feature 2: Intelligenter Pflanz-Assistent

Eine eingebaute Botanik-Datenbank verhindert schlechte Nachbarschaften und optimiert Erträge.

- **68+ Pflanzen** – Gemüse, Kräuter, Obst, Blumen, jeweils mit:
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

## Feature 3: Pflanzen-Bibliothek & Eigene Pflanzen (Katalog)

Dein personalisiertes Garten-Lexikon direkt in der App.

- **System-Katalog:** 78 fundierte Garten-Pflanzen (Gemüse, Obst, Kräuter, Blumen) abrufbar
- **Eigene Pflanzen anlegen:** Erstelle völlig neue Sorten mit vollständig eigenen Werten:
  - Pflanzabstand, Erntedauer, Gieß-/Düngeintervall, Nährstoffbedarf, Nachbarschaftsregeln
- **Hybrides System:** Eigene Pflanzen verhalten sich in der gesamten App zu 100% wie System-Pflanzen – inkl. Fruchtfolge-Warnungen, Autocomplete im Beet-Editor u.v.m.
- **System-Pflanzen überschreiben:** Nicht zufrieden mit Standard-Vorgaben? Bearbeite sie – die App überschreibt sie virtuell mit deinen Werten, das Original bleibt als Fallback erhalten.

---

## Feature 4: Dynamische Schatten- & Sonnen-Simulation

Physikalisch korrekter Schattenwurf für optimale Pflanzenplatzierung.

- **Echter Schattenwurf:** Nordausrichtung definierbar, daraus physikalisch korrekte Schattenberechnung
- **Zeitsteuerung:** Slider für Tageszeit (8:00–20:00 Uhr) und Monat (Januar–Dezember)
- **Standort-Warnung:** Alarm bei Platzierung von Sonnenpflanzen in Schattenbereichen
- **Toggle:** Objekte können vom Schattenwurf ausgenommen werden

---

## Feature 5: Zentrale Leitzentrale (Dashboard)

Alle wichtigen Garten-Informationen auf einen Blick.

- **Flächen-Statistik:** Gesamtanzahl Beete, exakte Pflanzflächen in m²
- **Wetter-Widget:** 7-Tage-Vorhersage über Open-Meteo (kein API-Key), inkl. Frost-Warnung bei < 2 °C
- **Saisonale Vorschläge:** Welche Pflanzen jetzt aussäen oder ernten
- **Ernte-Protokoll:** Erfassung von Erntemenge (kg/Stück/Bund/l), Datum, Notizen; Aggregation nach Pflanze
- **Fruchtfolge-Assistent:** Zyklus Starkzehrer → Mittelzehrer → Schwachzehrer → Gründüngung
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

- **Aufgaben-Verwaltung:** Checklisten mit Deadlines
- **Automatische Erinnerungen:** „Heute fällig" und „Demnächst" (nächste 3 Tage)
- **Niederschlags-Integration:** Open-Meteo stündlich; ausreichend Regen → Task automatisch als „Durch Regen erledigt"
- **Pflanztyp-spezifische Schwellenwerte:** Dürretolerant ab 3mm, wasserintensiv ab 8mm
- **Niederschlags-Banner:** inkl. Staunässe-Warnung bei > 15mm
- **Pflege-Intervall-Übersicht:** Kacheln pro Beet mit 💧 und 🧪 Badges
- **Automatische Einkaufslisten:** Geplante Pflanzen erscheinen als Erinnerungs-Block

---

## Feature 8: Jahreskalender & Gantt-Diagramm

Saisonale Übersicht für die Gesamtplanung.

- **Zwei Ansichten:** Klassischer Monatskalender und Gantt-Diagramm
- **Gantt-Phasenbalken:** 🔵 Säen · 🟤 Wachsen · 🟢 Ernte
- **Beet-Gruppierung:** Pflanzen nach Beet geordnet, aktueller Monat hervorgehoben

---

## Feature 9: Jahresstatistik ⭐ NEU in v3

Dein Garten auf einen Blick – Ernte, Kosten, Aufgaben als vollständiges Auswertungs-Dashboard.

- **KPI-Kacheln:** Sofort-Überblick über Beete, Pflanzungen, Ernten, Ausgaben und Aufgaben-Fortschritt
- **Ernte-Ranking:** Horizontales Balkendiagramm mit allen Sorten, sortiert nach Gesamtmenge
- **Ausgaben nach Monat:** Säulendiagramm aller Ausgaben über das Jahr (12 Monate)
- **Ausgaben nach Kategorie:** Horizontale Balken für Saatgut, Erde/Dünger, Werkzeug, Sonstiges
- **Pflanzungs-Status:** Kacheln nach Status (Geplant / Gesetzt / Wachsend / Ernte)
- **Pflanzarten-Verteilung:** Aufschlüsselung aller Pflanzungen nach Gemüse / Kräuter / Obst / Blumen
- **Aufgaben-Fortschritt:** Großer Fortschrittsbalken mit Prozentzahl (erledigt vs. offen)

---

## Feature 10: Drucken & PDF-Export ⭐ NEU in v3

Den Gartenplan professionell auf Papier bringen.

- **Drucken / als PDF speichern:** Ein Klick öffnet ein vollständiges, formatiertes Drucklayout
- **Canvas-Snapshot:** Der aktuelle Gartenplan wird als Bildvorschau oben auf der Seite eingebettet
- **Vollständige Pflanzliste:** Alle Beete mit Pflanzungen, Sorte, Anzahl, Datum und erwartetem Erntetermin
- **Ernte-Protokoll:** Detaillierte Auflistung aller erfassten Ernten mit Menge und Notizen
- **Ausgaben-Aufstellung:** Vollständige Kostenübersicht inkl. Gesamtbetrag
- **Sauberes Layout (A4):** Optimiert für DIN A4 mit strukturierten Tabellen und Farbcodierung

---

## Feature 11: Höhenebenen (Z-Achse)

Realistische Darstellung von Hanglagen und mehrstöckigen Konstruktionen.

- **Ebenen:** Bodenebene, Hochbeet, Terrasse (und weitere benutzerdefinierte)
- **Korrekte Darstellung:** Objekte auf höheren Ebenen überlappen optisch sauber
- **Distanz-Schatten:** Höhere Objekte werfen größere, realistischere Schatten

---

## Feature 12: Wachstums- & Fotoarchiv

Visuelle Dokumentation des Gartenerfolgs.

- **Foto-Upload:** Direkt in einzelne Beete oder in die zentrale Foto-Station
- **Langzeit-Dokumentation:** Visueller Nachweis über die Saison hinweg

---

## Feature 13: Multi-Garten-Verwaltung

Verwaltung mehrerer Projekte in einer App.

- **Mehrere Gärten:** Erstellen, benennen, zwischen Projekten wechseln, löschen
- **Typische Projekte:** Hausgarten, Balkon, Schrebergarten
- **Automatische Migration:** Bestehende Einzelgarten-Daten werden automatisch ins neue Format überführt

---

## Feature 14: Farbdesign & Themes

Personalisierung der Benutzeroberfläche.

- **5 kuratierte Themes:** 🏺 Terracotta · 🌲 Forest · 🌊 Ocean · 🌾 Harvest · 🌑 Midnight
- **Je Light- & Dark-Variante:** Insgesamt 10 Erscheinungsbilder
- **Sofortvorschau:** Visuelle Kacheln mit Farbswatch, kein Neustart nötig
- **Persistenz:** Gewähltes Theme bleibt über Neustarts hinweg erhalten

---

## Feature 15: Lokale Datensicherung & Offline-Betrieb

Vollständige Datensouveränität – keine Cloud, kein Konto.

- **Lokaler Express-Server:** Schreibt alle Daten in lokale JSON-Datei
- **Dual-Write-Strategie:** Sofort-Sicherung in localStorage + Debounced Server-Push
- **Server-Status-Indikator:** Farbpunkt (grün = lokal DB aktiv, grau = nur Browser-Speicher)
- **Windows-Start:** Doppelklick auf `Start GartenPlaner.bat` startet Server und Browser

---

## Zusammenfassung

| Kategorie | Details |
|---|---|
| Features gesamt | **15** |
| Pflanzen in Datenbank | 78 (inkl. anpassbarer System-Pflanzen) |
| Eigene Pflanzen | unbegrenzt anlegbar |
| Statistik & Export | Jahresstatistik + PDF/Druck-Export (neu in v3) |
| Wetter-API | Open-Meteo (kostenlos, kein Key) |
| Datenspeicherung | Lokal (JSON + localStorage) |
| Cloud-Pflicht | Keine |
| Plattform | Windows (Express.js + Browser) |
