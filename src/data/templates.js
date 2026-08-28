/**
 * templates.js — Fertige Gartenpläne für die Vorlagen-Bibliothek
 *
 * Rein statische Daten, keine Store-Kopplung (gleiches Muster wie plants.js).
 * `beds[]` entspricht den Feldern von store.addBed() (ohne id — wird beim
 * Anwenden vergeben). `plantings[].bedIndex` referenziert die Position im
 * beds-Array; emoji/category/isPerennial/spacing werden beim Anwenden live
 * über getPlant() aus dem Katalog aufgelöst, nicht hier hartkodiert.
 */

export const GARDEN_TEMPLATES = [
  {
    id: 'kraeuterspirale',
    name: 'Kräuterspirale',
    emoji: '🌿',
    description: 'Kompakte Spirale für Kräuter auf kleinstem Raum — ideal für Balkon oder Terrassenrand.',
    beds: [
      { name: 'Kräuterspirale', type: 'circle', x: 80, y: 80, width: 220, height: 220, kind: 'type-bed', color: '#8fae5c', soil: 'sand' },
    ],
    plantings: [
      { bedIndex: 0, name: 'Rosmarin', quantity: 2 },
      { bedIndex: 0, name: 'Thymian', quantity: 3 },
      { bedIndex: 0, name: 'Salbei', quantity: 2 },
      { bedIndex: 0, name: 'Oregano', quantity: 2 },
      { bedIndex: 0, name: 'Schnittlauch', quantity: 3 },
      { bedIndex: 0, name: 'Petersilie', quantity: 3 },
      { bedIndex: 0, name: 'Basilikum', quantity: 3 },
    ],
  },
  {
    id: 'hochbeet-quartett',
    name: 'Hochbeet-Quartett',
    emoji: '🧺',
    description: 'Vier Hochbeete für Einsteiger — bewährte Kombinationen, keine schlechten Nachbarn.',
    beds: [
      { name: 'Hochbeet 1', type: 'rect', x: 80,  y: 80,  width: 180, height: 120, kind: 'type-bed', color: '#a15332' },
      { name: 'Hochbeet 2', type: 'rect', x: 300, y: 80,  width: 180, height: 120, kind: 'type-bed', color: '#a15332' },
      { name: 'Hochbeet 3', type: 'rect', x: 80,  y: 240, width: 180, height: 120, kind: 'type-bed', color: '#a15332' },
      { name: 'Hochbeet 4', type: 'rect', x: 300, y: 240, width: 180, height: 120, kind: 'type-bed', color: '#a15332' },
    ],
    plantings: [
      { bedIndex: 0, name: 'Tomate', quantity: 4 },
      { bedIndex: 0, name: 'Basilikum', quantity: 4 },
      { bedIndex: 1, name: 'Karotte', quantity: 20 },
      { bedIndex: 1, name: 'Zwiebel', quantity: 15 },
      { bedIndex: 2, name: 'Salat', quantity: 8 },
      { bedIndex: 2, name: 'Radieschen', quantity: 15 },
      { bedIndex: 3, name: 'Zucchini', quantity: 2 },
      { bedIndex: 3, name: 'Kapuzinerkresse', quantity: 4 },
    ],
  },
  {
    id: 'permakultur-kreis',
    name: 'Permakultur-Kreis',
    emoji: '🔄',
    description: 'Staudenkern mit Nützlingspflanzen und Mischkultur drumherum — pflegeleicht über Jahre.',
    beds: [
      { name: 'Staudenkern',           type: 'circle', x: 200, y: 150, width: 180, height: 180, kind: 'type-bed', color: '#6b8e4e', soil: 'humus' },
      { name: 'Nützlingsrand Nord',    type: 'rect',   x: 80,  y: 40,  width: 420, height: 80,  kind: 'type-bed', color: '#c9a63e' },
      { name: 'Mischkultur-Rand Süd',  type: 'rect',   x: 80,  y: 360, width: 420, height: 100, kind: 'type-bed', color: '#7a9c5c' },
    ],
    plantings: [
      { bedIndex: 0, name: 'Erdbeere', quantity: 10 },
      { bedIndex: 0, name: 'Rhabarber', quantity: 2 },
      { bedIndex: 1, name: 'Ringelblume', quantity: 6 },
      { bedIndex: 1, name: 'Tagetes', quantity: 6 },
      { bedIndex: 2, name: 'Bohnenkraut', quantity: 4 },
      { bedIndex: 2, name: 'Kohlrabi', quantity: 6 },
      { bedIndex: 2, name: 'Karotte', quantity: 15 },
    ],
  },
  {
    id: 'familiengarten-20',
    name: 'Familiengarten 20 m²',
    emoji: '🏡',
    description: 'Ausgewogener Mix aus Gemüse, Kräutern und Erdbeeren für die ganze Saison.',
    beds: [
      { name: 'Gemüsebeet',        type: 'rect', x: 60,  y: 60,  width: 300, height: 150, kind: 'type-bed',  color: '#c98a4b' },
      { name: 'Kräuterbeet',       type: 'rect', x: 400, y: 60,  width: 150, height: 100, kind: 'type-bed',  color: '#8fae5c' },
      { name: 'Erdbeerbeet',       type: 'rect', x: 60,  y: 250, width: 200, height: 80,  kind: 'type-bed',  color: '#a15332' },
      { name: 'Wurzelgemüsebeet',  type: 'rect', x: 300, y: 250, width: 250, height: 120, kind: 'type-bed',  color: '#7a5c3e' },
      { name: 'Rasenrand',         type: 'rect', x: 60,  y: 400, width: 490, height: 60,  kind: 'type-lawn', color: '#86efac' },
    ],
    plantings: [
      { bedIndex: 0, name: 'Tomate', quantity: 4 },
      { bedIndex: 0, name: 'Gurke', quantity: 3 },
      { bedIndex: 0, name: 'Paprika', quantity: 4 },
      { bedIndex: 0, name: 'Zucchini', quantity: 2 },
      { bedIndex: 1, name: 'Basilikum', quantity: 3 },
      { bedIndex: 1, name: 'Petersilie', quantity: 3 },
      { bedIndex: 1, name: 'Schnittlauch', quantity: 3 },
      { bedIndex: 1, name: 'Dill', quantity: 2 },
      { bedIndex: 2, name: 'Erdbeere', quantity: 15 },
      { bedIndex: 3, name: 'Kartoffel', quantity: 10 },
      { bedIndex: 3, name: 'Karotte', quantity: 20 },
      { bedIndex: 3, name: 'Zwiebel', quantity: 15 },
    ],
  },
];
