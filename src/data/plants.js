/**
 * Plant Database — Curated suggestions for common garden plants
 */
export const plants = [
  // Gemüse
  { name: 'Tomate', emoji: '🍅', category: 'Gemüse', sowMonth: [3,4], harvestMonth: [7,8,9], nutrition: 'stark', goodNeighbors: ['Basilikum', 'Petersilie', 'Knoblauch', 'Salat'], badNeighbors: ['Kartoffel', 'Erbse', 'Gurke', 'Fenchel'] },
  { name: 'Gurke', emoji: '🥒', category: 'Gemüse', sowMonth: [4,5], harvestMonth: [7,8,9], nutrition: 'stark', goodNeighbors: ['Bohne', 'Dill', 'Salat', 'Zwiebel'], badNeighbors: ['Tomate', 'Radieschen'] },
  { name: 'Karotte', emoji: '🥕', category: 'Gemüse', sowMonth: [3,4,5,6], harvestMonth: [6,7,8,9,10], nutrition: 'mittel', goodNeighbors: ['Zwiebel', 'Knoblauch', 'Lauch', 'Dill'], badNeighbors: ['Minze'] },
  { name: 'Kartoffel', emoji: '🥔', category: 'Gemüse', sowMonth: [4,5], harvestMonth: [8,9,10], nutrition: 'stark', goodNeighbors: ['Kohlrabi', 'Spinat', 'Tagetes', 'Mais'], badNeighbors: ['Tomate', 'Kürbis', 'Sonnenblume'] },
  { name: 'Paprika', emoji: '🫑', category: 'Gemüse', sowMonth: [2,3], harvestMonth: [7,8,9,10] },
  { name: 'Zucchini', emoji: '🥒', category: 'Gemüse', sowMonth: [4,5], harvestMonth: [7,8,9] },
  { name: 'Kürbis', emoji: '🎃', category: 'Gemüse', sowMonth: [4,5], harvestMonth: [9,10] },
  { name: 'Brokkoli', emoji: '🥦', category: 'Gemüse', sowMonth: [3,4,5], harvestMonth: [7,8,9] },
  { name: 'Blumenkohl', emoji: '🥬', category: 'Gemüse', sowMonth: [3,4,5], harvestMonth: [7,8,9] },
  { name: 'Spinat', emoji: '🥬', category: 'Gemüse', sowMonth: [3,4,8,9], harvestMonth: [5,6,10,11] },
  { name: 'Salat', emoji: '🥬', category: 'Gemüse', sowMonth: [3,4,5,6,7,8], harvestMonth: [5,6,7,8,9,10] },
  { name: 'Radieschen', emoji: '🔴', category: 'Gemüse', sowMonth: [3,4,5,6,7,8], harvestMonth: [4,5,6,7,8,9] },
  { name: 'Bohne', emoji: '🫘', category: 'Gemüse', sowMonth: [5,6], harvestMonth: [7,8,9], nutrition: 'schwach', goodNeighbors: ['Kartoffel', 'Gurke', 'Kohlrabi', 'Erdbeere'], badNeighbors: ['Zwiebel', 'Knoblauch', 'Lauch', 'Erbse'] },
  { name: 'Erbse', emoji: '🟢', category: 'Gemüse', sowMonth: [3,4,5], harvestMonth: [6,7,8], nutrition: 'schwach', goodNeighbors: ['Karotte', 'Kohlrabi', 'Salat', 'Zucchini'], badNeighbors: ['Zwiebel', 'Knoblauch', 'Bohne', 'Tomate'] },
  { name: 'Zwiebel', emoji: '🧅', category: 'Gemüse', sowMonth: [3,4], harvestMonth: [8,9], nutrition: 'mittel', goodNeighbors: ['Karotte', 'Rote Bete', 'Erdbeere', 'Kamille'], badNeighbors: ['Bohne', 'Erbse'] },
  { name: 'Knoblauch', emoji: '🧄', category: 'Gemüse', sowMonth: [10,3], harvestMonth: [7,8], nutrition: 'mittel', goodNeighbors: ['Karotte', 'Tomate', 'Erdbeere', 'Rose'], badNeighbors: ['Bohne', 'Erbse'] },
  { name: 'Mais', emoji: '🌽', category: 'Gemüse', sowMonth: [5], harvestMonth: [9,10] },
  { name: 'Sellerie', emoji: '🥬', category: 'Gemüse', sowMonth: [3,4], harvestMonth: [9,10,11] },
  { name: 'Kohlrabi', emoji: '🥬', category: 'Gemüse', sowMonth: [3,4,5,6], harvestMonth: [5,6,7,8,9] },
  { name: 'Rote Bete', emoji: '🟤', category: 'Gemüse', sowMonth: [4,5,6], harvestMonth: [7,8,9,10] },
  { name: 'Mangold', emoji: '🥬', category: 'Gemüse', sowMonth: [4,5], harvestMonth: [6,7,8,9,10] },
  { name: 'Fenchel', emoji: '🌿', category: 'Gemüse', sowMonth: [5,6], harvestMonth: [8,9,10] },
  { name: 'Lauch', emoji: '🥬', category: 'Gemüse', sowMonth: [3,4], harvestMonth: [9,10,11,12] },
  { name: 'Aubergine', emoji: '🍆', category: 'Gemüse', sowMonth: [2,3], harvestMonth: [7,8,9,10], nutrition: 'stark', goodNeighbors: ['Bohne', 'Basilikum'], badNeighbors: ['Fenchel'] },
  { name: 'Spargel', emoji: '🌱', category: 'Gemüse', sowMonth: [3,4], harvestMonth: [4,5,6], nutrition: 'mittel', goodNeighbors: ['Petersilie', 'Basilikum', 'Tomate'], badNeighbors: ['Zwiebel', 'Knoblauch'] },
  { name: 'Artischocke', emoji: '🌿', category: 'Gemüse', sowMonth: [3,4], harvestMonth: [7,8,9], nutrition: 'stark' },
  { name: 'Melone', emoji: '🍈', category: 'Gemüse', sowMonth: [4,5], harvestMonth: [8,9,10], nutrition: 'stark', goodNeighbors: ['Mais', 'Sonnenblume'], badNeighbors: ['Kartoffel'] },
  { name: 'Süßkartoffel', emoji: '🍠', category: 'Gemüse', sowMonth: [5], harvestMonth: [9,10], nutrition: 'mittel' },

  // Kräuter
  { name: 'Basilikum', emoji: '🌿', category: 'Kräuter', sowMonth: [4,5], harvestMonth: [6,7,8,9], nutrition: 'mittel', goodNeighbors: ['Tomate'], badNeighbors: ['Raute'] },
  { name: 'Petersilie', emoji: '🌿', category: 'Kräuter', sowMonth: [3,4,5], harvestMonth: [5,6,7,8,9,10], nutrition: 'mittel', goodNeighbors: ['Tomate', 'Zwiebel', 'Kartoffel'], badNeighbors: ['Salat'] },
  { name: 'Schnittlauch', emoji: '🌿', category: 'Kräuter', sowMonth: [3,4], harvestMonth: [4,5,6,7,8,9,10] },
  { name: 'Dill', emoji: '🌿', category: 'Kräuter', sowMonth: [4,5], harvestMonth: [6,7,8] },
  { name: 'Rosmarin', emoji: '🌿', category: 'Kräuter', sowMonth: [3,4], harvestMonth: [1,2,3,4,5,6,7,8,9,10,11,12] },
  { name: 'Thymian', emoji: '🌿', category: 'Kräuter', sowMonth: [4,5], harvestMonth: [5,6,7,8,9,10] },
  { name: 'Oregano', emoji: '🌿', category: 'Kräuter', sowMonth: [4,5], harvestMonth: [6,7,8,9] },
  { name: 'Minze', emoji: '🍃', category: 'Kräuter', sowMonth: [4,5], harvestMonth: [5,6,7,8,9] },
  { name: 'Koriander', emoji: '🌿', category: 'Kräuter', sowMonth: [4,5,6], harvestMonth: [6,7,8,9] },
  { name: 'Salbei', emoji: '🌿', category: 'Kräuter', sowMonth: [4,5], harvestMonth: [5,6,7,8,9] },
  { name: 'Liebstöckel', emoji: '🌿', category: 'Kräuter', sowMonth: [3,4], harvestMonth: [5,6,7,8,9] },
  { name: 'Majoran', emoji: '🌿', category: 'Kräuter', sowMonth: [4,5], harvestMonth: [6,7,8,9] },
  { name: 'Zitronenmelisse', emoji: '🍋', category: 'Kräuter', sowMonth: [3,4,5], harvestMonth: [5,6,7,8,9,10] },
  { name: 'Estragon', emoji: '🌿', category: 'Kräuter', sowMonth: [3,4], harvestMonth: [5,6,7,8,9] },
  { name: 'Bohnenkraut', emoji: '🌿', category: 'Kräuter', sowMonth: [4,5], harvestMonth: [7,8,9], goodNeighbors: ['Bohne', 'Zwiebel'] },

  // Obst
  { name: 'Erdbeere', emoji: '🍓', category: 'Obst', sowMonth: [3,4,7,8], harvestMonth: [5,6,7], nutrition: 'mittel', goodNeighbors: ['Knoblauch', 'Zwiebel', 'Schnittlauch', 'Spinat'], badNeighbors: ['Kohl'] },
  { name: 'Himbeere', emoji: '🫐', category: 'Obst', sowMonth: [10,11,3], harvestMonth: [6,7,8] },
  { name: 'Heidelbeere', emoji: '🫐', category: 'Obst', sowMonth: [10,11,3], harvestMonth: [7,8] },
  { name: 'Johannisbeere', emoji: '🔴', category: 'Obst', sowMonth: [10,11,3], harvestMonth: [6,7] },
  { name: 'Weintraube', emoji: '🍇', category: 'Obst', sowMonth: [3,4], harvestMonth: [9,10] },
  { name: 'Rhabarber', emoji: '🌿', category: 'Obst', sowMonth: [3,4], harvestMonth: [4,5,6] },
  { name: 'Brombeere', emoji: '🫐', category: 'Obst', sowMonth: [10,11,3], harvestMonth: [7,8,9] },
  { name: 'Stachelbeere', emoji: '🟢', category: 'Obst', sowMonth: [10,11,3], harvestMonth: [6,7,8] },

  // Blumen
  { name: 'Sonnenblume', emoji: '🌻', category: 'Blumen', sowMonth: [4,5], harvestMonth: [8,9,10] },
  { name: 'Ringelblume', emoji: '🌼', category: 'Blumen', sowMonth: [4,5], harvestMonth: [6,7,8,9] },
  { name: 'Lavendel', emoji: '💜', category: 'Blumen', sowMonth: [3,4], harvestMonth: [6,7,8] },
  { name: 'Rose', emoji: '🌹', category: 'Blumen', sowMonth: [10,11,3,4], harvestMonth: [6,7,8,9] },
  { name: 'Tulpe', emoji: '🌷', category: 'Blumen', sowMonth: [10,11], harvestMonth: [4,5] },
  { name: 'Dahlie', emoji: '🌸', category: 'Blumen', sowMonth: [4,5], harvestMonth: [7,8,9,10] },
  { name: 'Kapuzinerkresse', emoji: '🌺', category: 'Blumen', sowMonth: [4,5], harvestMonth: [6,7,8,9,10] },
  { name: 'Tagetes', emoji: '🌼', category: 'Blumen', sowMonth: [4,5], harvestMonth: [6,7,8,9,10] },
];

/**
 * Search plants by query
 */
export function searchPlants(query) {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase();
  return plants.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  ).slice(0, 10);
}

/**
 * Get plant by exact name
 */
export function getPlant(name) {
  return plants.find(p => p.name.toLowerCase() === name.toLowerCase());
}

/**
 * Get plants for current sowing month
 */
export function getSowingPlants(month) {
  const m = month || new Date().getMonth() + 1;
  return plants.filter(p => p.sowMonth.includes(m));
}

/**
 * Get plants for current harvest month
 */
export function getHarvestPlants(month) {
  const m = month || new Date().getMonth() + 1;
  return plants.filter(p => p.harvestMonth.includes(m));
}

/**
 * Month names in German
 */
export const monthNames = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];
