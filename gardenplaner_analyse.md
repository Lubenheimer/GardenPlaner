# GardenPlaner – Feature-Dokumentation & Analyse (v4 – Stand April 2026)

## Projektübersicht

**GardenPlaner** ist eine intelligente Komplettlösung für die digitale Gartenplanung. Die App richtet sich an Hobby-Gärtner, Selbstversorger, Balkon-Gärtner und Schrebergärtner. Sie läuft vollständig lokal ohne Cloud-Zwang oder Account-Registrierung.

**Tech-Stack:** Vanilla JavaScript, HTML/CSS, lokaler Express.js-Server, Canvas-basiertes Rendering, Open-Meteo API (kostenlos, kein API-Key nötig)

**Aktueller Funktionsumfang:** 16 Features

---

## Änderungshistorie

| Version | Features | Pflanzendatenbank | Wichtigste Neuerung |
|---|---|---|---|
| v1 | 12 | 68 Pflanzen | Basis-Release |
| v2 | 13 | 78 Pflanzen | Pflanzen-Bibliothek & Eigene Pflanzen |
| v3 | 15 | 78 Pflanzen | Jahresstatistik + Drucken/PDF-Export |
| **v4** | **16** | **78 Pflanzen** | **Fokus-Modus, 3D entfernt, Saison-System ergänzt** |

**Neu/geändert in v4:**
- ✂️ Feature 1: 3D-Ansicht entfernt (ThreeRenderer nicht fertiggestellt, Codebase bereinigt)
- 🔍 Feature 1: Fokus-Modus hinzugefügt (Beet einzoomen, alle anderen Objekte ausblenden)
- 📊 Feature 2: Pflanzendatenbank-Zahl korrigiert (68 → 78 Pflanzen)
- 🗄️ Feature 11: Saison-System & Archiv jetzt vollständig dokumentiert (war bisher nicht in Analyse enthalten)

---

## Feature 1: Interaktiver 2D-Garten-Editor

Der Editor ist das Herzstück der App und ermöglicht präzises visuelles Planen.

- **Freie Formgestaltung:** Beete, Rasenflächen, Pflastersteine oder Zäune als Rechteck, Kreis, L-Form oder individuelles Polygon
- **Präzisionswerkzeuge:** Integriertes Mess-Werkzeug (Lineal) und ein-/abschaltbares Raster (Grid)
- **Rechtsklick-Kontextmenü:** Schnellzugriff auf Pflanzung hinzufügen, Fokus (Beet einzoomen), Umbenennen, Duplizieren, Ebene wechseln, Löschen
- **Fokus-Modus:** Zoomt auf ein einzelnes Beet und blendet alle anderen Objekte aus – ideal für detaillierte Planung. Beenden per Esc-Taste oder Schaltfläche.
- **Lesbare Beschriftungen:** Objektnamen und Pflanzen-Emojis bleiben horizontal ausgerichtet, auch bei Rotation
- **Schattenwurf-Toggle:** Pro Objekt einzeln aktivierbar/deaktivierbar (sinnvoll für flache Beete oder Bodenflächen)

---

## Feature 2: Intelligenter Pflanz-Assistent

Eine eingebaute Botanik-Datenbank verhindert schlechte Nachbarschaften und optimiert Erträge.

- **78+ Pflanzen** – Gemüse, Kräuter, Obst, Blumen, jeweils mit:
  - Guten und schlechten Nachbarn
  - Nährstoffbedarf (Starkzehrer/Schwachzehrer)
  - Pflanzabstand (cm)
  - Erntezeit (Tage)
  - Gieß- und Düngeintervallen
- **Mischkultur-Visualisierung:** Spezieller Canvas-Modus mit grünen/roten Energie-Flüssen für gute/schlechte Nachbarn (innerhalb Beetes und bis 1,5m Distanz zu Nachbarbeeten)
- **Live-Warnungen:** Sofortiges Pop-Up bei Platzierung inkompatibler Pflanzen, inkl. Bodencheck und Lichtanalyse
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
- **System-Pflanzen überschreiben:** Bearbeite Standard-Vorgaben – die App überschreibt sie virtuell mit deinen Werten, das Original bleibt als Fallback erhalten.

---

## Feature 4: Dynamische Schatten- & Sonnen-Simulation

Physikalisch korrekter Schattenwurf für optimale Pflanzenplatzierung.

- **Echter Schattenwurf:** Nordausrichtung definierbar, daraus physikalisch korrekte Schattenberechnung
- **Zeitsteuerung:** Slider für Tageszeit (6:00–20:00 Uhr) und Monat (Januar–Dezember)
- **Nordrotations-Slider:** Gartenausrichtung in Grad einstellbar für korrekte Himmelsrichtungsberechnung
- **Standort-Warnung:** Alarm bei Platzierung von Sonnenpflanzen in Schattenbereichen
- **Toggle pro Objekt:** Schattenwurf für einzelne Elemente aktivierbar/deaktivierbar

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
- **Frost-Warnung:** Bei geplanten Pflanzungen der nächsten 14 Tage und Temperaturen ≤ 2 °C

---

## Feature 8: Jahreskalender & Gantt-Diagramm

Saisonale Übersicht für die Gesamtplanung.

- **Zwei Ansichten:** Klassischer Monatskalender und Gantt-Diagramm
- **Gantt-Phasenbalken:** 🔵 Säen · 🟤 Wachsen · 🟢 Ernte
- **Beet-Gruppierung:** Pflanzen nach Beet geordnet, aktueller Monat hervorgehoben

---

## Feature 9: Jahresstatistik

Dein Garten auf einen Blick – Ernte, Kosten, Aufgaben als vollständiges Auswertungs-Dashboard.

- **Saison-Selector:** Wechsel zwischen aktiver und vergangener Saison (Archiv-Ansicht)
- **KPI-Kacheln:** Sofort-Überblick über Beete, Pflanzungen, Ernten, Ausgaben und Aufgaben-Fortschritt
- **Ernte-Ranking:** Horizontales Balkendiagramm mit allen Sorten, sortiert nach Gesamtmenge
- **Ausgaben nach Monat:** Säulendiagramm aller Ausgaben über das Jahr (12 Monate)
- **Ausgaben nach Kategorie:** Horizontale Balken für Saatgut, Erde/Dünger, Werkzeug, Sonstiges
- **Pflanzungs-Status:** Kacheln nach Status (Geplant / Gesetzt / Wachsend / Ernte)
- **Pflanzarten-Verteilung:** Aufschlüsselung aller Pflanzungen nach Kategorie
- **Aufgaben-Fortschritt:** Großer Fortschrittsbalken mit Prozentzahl (erledigt vs. offen)

---

## Feature 10: Drucken & PDF-Export

Den Gartenplan professionell auf Papier bringen.

- **Drucken / als PDF speichern:** Ein Klick öffnet ein vollständiges, formatiertes Drucklayout
- **Canvas-Snapshot:** Der aktuelle Gartenplan wird als Bildvorschau oben auf der Seite eingebettet
- **Vollständige Pflanzliste:** Alle Beete mit Pflanzungen, Sorte, Anzahl, Datum und erwartetem Erntetermin
- **Ernte-Protokoll:** Detaillierte Auflistung aller erfassten Ernten mit Menge und Notizen
- **Ausgaben-Aufstellung:** Vollständige Kostenübersicht inkl. Gesamtbetrag
- **Sauberes Layout (A4):** Optimiert für DIN A4 mit strukturierten Tabellen und Farbcodierung

---

## Feature 11: Saison-System & Archiv

Gieß dein Wissen nicht weg — nimm es mit ins nächste Jahr.

- **Weicher Jahreswechsel:** Im Frühjahr startest du mit einem Klick in die neue Saison – erledigte Pflanzungen werden archiviert, das Beet-Layout bleibt erhalten
- **Mehrjährige Pflanzen (Stauden):** Obstbäume, Beeren, Spargel als Staude markieren → beim Saisonwechsel archiviert und nahtlos in neue Saison geklont
- **Archiv-Ansicht:** Statistik jederzeit per Dropdown auf vergangene Jahre filterbar
- **Keine Datenverluste:** Pflanz-Historie bleibt dauerhaft im Store abrufbar

---

## Feature 12: Höhenebenen (Z-Achse)

Realistische Darstellung von Hanglagen und mehrstöckigen Konstruktionen.

- **Ebenen:** Bodenebene, Hauptebene, Erhöhte Fläche (und weitere benutzerdefinierte)
- **Korrekte Darstellung:** Objekte auf höheren Ebenen überlappen optisch sauber
- **Distanz-Schatten:** Höhere Objekte werfen größere, realistischere Schatten

---

## Feature 13: Wachstums- & Fotoarchiv

Visuelle Dokumentation des Gartenerfolgs.

- **Foto-Upload:** Direkt in einzelne Beete oder in die zentrale Foto-Station
- **Langzeit-Dokumentation:** Visueller Nachweis über die Saison hinweg

---

## Feature 14: Multi-Garten-Verwaltung

Verwaltung mehrerer Projekte in einer App.

- **Mehrere Gärten:** Erstellen, benennen, zwischen Projekten wechseln, löschen
- **Typische Projekte:** Hausgarten, Balkon, Schrebergarten
- **Automatische Migration:** Bestehende Einzelgarten-Daten werden automatisch ins neue Format überführt

---

## Feature 15: Farbdesign & Themes

Personalisierung der Benutzeroberfläche.

- **5 kuratierte Themes:** 🏺 Terracotta · 🌲 Forest · 🌊 Ocean · 🌾 Harvest · 🌑 Midnight
- **Je Light- & Dark-Variante:** Insgesamt 10 Erscheinungsbilder
- **Sofortvorschau:** Visuelle Kacheln mit Farbswatch, kein Neustart nötig
- **Persistenz:** Gewähltes Theme bleibt über Neustarts hinweg erhalten

---

## Feature 16: Lokale Datensicherung & Offline-Betrieb

Vollständige Datensouveränität – keine Cloud, kein Konto.

- **Lokaler Express-Server:** Schreibt alle Daten in lokale JSON-Datei
- **Dual-Write-Strategie:** Sofort-Sicherung in localStorage + Debounced Server-Push
- **Server-Status-Indikator:** Farbpunkt (grün = lokal DB aktiv, grau = nur Browser-Speicher)
- **Windows-Start:** Doppelklick auf `Start GartenPlaner.bat` startet Server und Browser

---

## Zusammenfassung

| Kategorie | Details |
|---|---|
| Features gesamt | **16** |
| Pflanzen in Datenbank | 78 (inkl. anpassbarer System-Pflanzen) |
| Eigene Pflanzen | unbegrenzt anlegbar |
| Statistik & Export | Jahresstatistik + PDF/Druck-Export |
| Saison-Management | Weicher Jahreswechsel, Stauden-Klon, Archiv |
| Fokus-Modus | Einzelbeet einzoomen, andere Objekte ausblenden |
| Wetter-API | Open-Meteo (kostenlos, kein Key) |
| Datenspeicherung | Lokal (JSON + localStorage) |
| Cloud-Pflicht | Keine |
| Plattform | Windows (Express.js + Browser) |
