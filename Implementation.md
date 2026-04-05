# Implementierungsplan: GardenPlaner V2 (SaaS & Multi-Garten)

Die aktuelle Version des GardenPlaners funktioniert als großartiges, lokales Planungstool. Um das Projekt als Software-as-a-Service (SaaS) auf den Markt zu bringen, bedarf es optischer Tiefe, Multi-Mandanten-Fähigkeit (bzw. Speicher für mehrere Projekte) und einer serverbasierten Architektur.

---

## 🎨 1. Neues Design & Farbgebung (Raus aus dem "Zu viel Grün")

Die App ist aktuell sehr "flach" und grün-lastig. Um Premium-Nutzer anzusprechen, müssen wir das UI aufwerten.

### Geplante Design-Upgrades
- **Texturen statt Farben:** Statt flacher Hex-Farben für Beete implementieren wir **Assets/Texturen** (Erde, Rindenmulch, Gras, Holzdielen, Holzrahmen für Hochbeete). Die 3D-Ansicht wird dadurch massiv aufgewertet.
- **Modernes Color-Theming:** 
  - Die App-Oberfläche wird auf Erdtöne (Terracotta, Sand, tiefes Blaugrau) oder eine neutrale, dunkle Ästhetik (Glassmorphismus) umgestellt, damit der grüne Content (der Garten) im Fokus steht und nicht mit dem UI "konkurriert".
- **Schatten & Licht:** Einführung von weicheren ambienten Schattenwürfen auch auf der UI-Ebene für eine "tiefere" Benutzererfahrung.
- **Sanfte Animationen:** Interaktives Feedback beim Ziehen von Pflanzen ins Beet, "Wachsen"-Animationen beim Ändern des Pflanzenstatus.

---

## 🏡 2. Die neue "Garten"-Entität (Multi-Projekt-Support)

Bisher gibt es exakt einen Garten pro Anwender in der `localStorage`.

### Architektur (`src/core/Store.js`)
- **Store-Struktur:** Das Speicherschema wird grundlegend umgestellt.
  ```json
  {
    "userSettings": { "theme": "dark" },
    "activeGardenId": "g1",
    "gardens": [
      {
        "id": "g1",
        "name": "Mein Gemüsegarten",
        "dimensions": { "w": 2000, "h": 1500 },
        "beds": [...],
        "plantings": [...],
        "tasks": [...]
      }
    ]
  }
  ```
- **Projekt-Manager UI:** Eine neue Ansicht im Startmenü ("Meine Gärten"), wo man zwischen verschiedenen Gärten wechseln, neue anlegen oder sie löschen kann.

---

## ☁️ 3. SaaS-Fähigkeit (Monetarisierung & Cloud)

Um das Tool zu verkaufen, müssen wir weg vom reinen `localStorage` hin zu einem echten Backend.

### Infrastruktur-Umbau
1. **Authentifizierung (z. B. via Supabase oder Firebase):**
   - User-Login (E-Mail, Google) hinzufügen.
   - Lokaler Sandbox-Modus (ohne Login nutzbar, fordert irgendwann zum Speichern auf).
2. **Datenbank-Synchronisierung:**
   - Die `Store.js` `save()` und `load()` Funktionen kommunizieren per REST API/WebSocket mit einer Cloud-Datenbank.
3. **Bezahl-Schranke (z. B. Stripe Integration):**
   - **Free-Tier:** 1 Garten-Projekt, Basis-Pflanzenkatalog, keine 3D-Ansicht.
   - **Pro-Tier (Abo):** Unendliche Projekte, volle 3D-Schatten-Simulation, detaillierte Wetter-Daten, KI-Assistent.

---

## 🚀 4. Neue, sinnvolle Feature-Ideen

Um sich von klassischer Stift-und-Papier-Planung abzuheben, braucht die App "Killer-Features", die nur digital möglich sind:

1. **Jahres-Gantt-Diagramm (Plant-Timeline):** 
   Eine visuelle Jahresübersicht, in der man Balken sieht, wann welche Pflanze gesät, ausgepflanzt und geerntet wird – so visualisiert man Lücken in Beeten, wo noch eine "Nachkultur" gepflanzt werden kann.
2. **Wetter- und Frost-API Integration:**
   Anhand von Geo-Koordinaten des Gartens wird echtes Wetter geladen ("Achtung: Nächste Woche noch Bodenfrost, Tomaten noch nicht rausstellen!").
3. **Automatischer KI-Assistent (Auto-Layout):**
   Man legt ein leeres Beet an, klickt auf "Generieren" und die App setzt perfekt gematchte Mischkulturen auf Basis der Beet-Größe und des Lichts automatisch ein.
