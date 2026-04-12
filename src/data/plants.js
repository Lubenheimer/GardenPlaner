/**
 * Plant Database — Curated suggestions for common garden plants
 *
 * Extended fields:
 *   spacing       — Pflanzabstand in cm
 *   daysToHarvest — Tage von Pflanzung bis Ernte
 *   waterDays     — Gießintervall in Tagen (z.B. 2 = alle 2 Tage)
 *   fertilizeWeeks— Düngeintervall in Wochen (z.B. 2 = alle 2 Wochen)
 */
export const plants = [
  // Gemüse
  { name: 'Tomate', emoji: '🍅', category: 'Gemüse', sowMonth: [3,4], harvestMonth: [7,8,9], nutrition: 'stark', spacing: 50, daysToHarvest: 120, waterDays: 2, fertilizeWeeks: 2, goodNeighbors: ['Basilikum', 'Petersilie', 'Knoblauch', 'Salat'], badNeighbors: ['Kartoffel', 'Erbse', 'Gurke', 'Fenchel'] },
  { name: 'Gurke', emoji: '🥒', category: 'Gemüse', sowMonth: [4,5], harvestMonth: [7,8,9], nutrition: 'stark', spacing: 40, daysToHarvest: 90, waterDays: 2, fertilizeWeeks: 2, goodNeighbors: ['Bohne', 'Dill', 'Salat', 'Zwiebel'], badNeighbors: ['Tomate', 'Radieschen'] },
  { name: 'Karotte', emoji: '🥕', category: 'Gemüse', sowMonth: [3,4,5,6], harvestMonth: [6,7,8,9,10], nutrition: 'mittel', spacing: 5, daysToHarvest: 100, waterDays: 3, fertilizeWeeks: 4, goodNeighbors: ['Zwiebel', 'Knoblauch', 'Lauch', 'Dill'], badNeighbors: ['Minze'] },
  { name: 'Kartoffel', emoji: '🥔', category: 'Gemüse', sowMonth: [4,5], harvestMonth: [8,9,10], nutrition: 'stark', spacing: 35, daysToHarvest: 110, waterDays: 4, fertilizeWeeks: 3, goodNeighbors: ['Kohlrabi', 'Spinat', 'Tagetes', 'Mais'], badNeighbors: ['Tomate', 'Kürbis', 'Sonnenblume'] },
  { name: 'Paprika', emoji: '🫑', category: 'Gemüse', sowMonth: [2,3], harvestMonth: [7,8,9,10], nutrition: 'stark', spacing: 40, daysToHarvest: 130, waterDays: 2, fertilizeWeeks: 2 },
  { name: 'Zucchini', emoji: '🥒', category: 'Gemüse', sowMonth: [4,5], harvestMonth: [7,8,9], nutrition: 'stark', spacing: 80, daysToHarvest: 60, waterDays: 2, fertilizeWeeks: 2 },
  { name: 'Kürbis', emoji: '🎃', category: 'Gemüse', sowMonth: [4,5], harvestMonth: [9,10], nutrition: 'stark', spacing: 100, daysToHarvest: 120, waterDays: 3, fertilizeWeeks: 3 },
  { name: 'Brokkoli', emoji: '🥦', category: 'Gemüse', sowMonth: [3,4,5], harvestMonth: [7,8,9], nutrition: 'stark', spacing: 40, daysToHarvest: 90, waterDays: 3, fertilizeWeeks: 3 },
  { name: 'Blumenkohl', emoji: '🥬', category: 'Gemüse', sowMonth: [3,4,5], harvestMonth: [7,8,9], nutrition: 'stark', spacing: 50, daysToHarvest: 100, waterDays: 3, fertilizeWeeks: 3 },
  { name: 'Spinat', emoji: '🥬', category: 'Gemüse', sowMonth: [3,4,8,9], harvestMonth: [5,6,10,11], nutrition: 'mittel', spacing: 15, daysToHarvest: 45, waterDays: 3, fertilizeWeeks: 4 },
  { name: 'Salat', emoji: '🥬', category: 'Gemüse', sowMonth: [3,4,5,6,7,8], harvestMonth: [5,6,7,8,9,10], nutrition: 'schwach', spacing: 25, daysToHarvest: 50, waterDays: 2, fertilizeWeeks: 4 },
  { name: 'Radieschen', emoji: '🔴', category: 'Gemüse', sowMonth: [3,4,5,6,7,8], harvestMonth: [4,5,6,7,8,9], nutrition: 'schwach', spacing: 5, daysToHarvest: 30, waterDays: 2 },
  { name: 'Bohne', emoji: '🫘', category: 'Gemüse', sowMonth: [5,6], harvestMonth: [7,8,9], nutrition: 'schwach', spacing: 30, daysToHarvest: 65, waterDays: 3, fertilizeWeeks: 4, goodNeighbors: ['Kartoffel', 'Gurke', 'Kohlrabi', 'Erdbeere'], badNeighbors: ['Zwiebel', 'Knoblauch', 'Lauch', 'Erbse'] },
  { name: 'Erbse', emoji: '🟢', category: 'Gemüse', sowMonth: [3,4,5], harvestMonth: [6,7,8], nutrition: 'schwach', spacing: 5, daysToHarvest: 70, waterDays: 3, goodNeighbors: ['Karotte', 'Kohlrabi', 'Salat', 'Zucchini'], badNeighbors: ['Zwiebel', 'Knoblauch', 'Bohne', 'Tomate'] },
  { name: 'Zwiebel', emoji: '🧅', category: 'Gemüse', sowMonth: [3,4], harvestMonth: [8,9], nutrition: 'mittel', spacing: 10, daysToHarvest: 120, waterDays: 5, goodNeighbors: ['Karotte', 'Rote Bete', 'Erdbeere', 'Kamille'], badNeighbors: ['Bohne', 'Erbse'] },
  { name: 'Knoblauch', emoji: '🧄', category: 'Gemüse', sowMonth: [10,3], harvestMonth: [7,8], nutrition: 'mittel', spacing: 10, daysToHarvest: 150, waterDays: 5, goodNeighbors: ['Karotte', 'Tomate', 'Erdbeere', 'Rose'], badNeighbors: ['Bohne', 'Erbse'] },
  { name: 'Mais', emoji: '🌽', category: 'Gemüse', sowMonth: [5], harvestMonth: [9,10], nutrition: 'stark', spacing: 30, daysToHarvest: 100, waterDays: 3, fertilizeWeeks: 3 },
  { name: 'Sellerie', emoji: '🥬', category: 'Gemüse', sowMonth: [3,4], harvestMonth: [9,10,11], nutrition: 'stark', spacing: 30, daysToHarvest: 140, waterDays: 2, fertilizeWeeks: 2 },
  { name: 'Kohlrabi', emoji: '🥬', category: 'Gemüse', sowMonth: [3,4,5,6], harvestMonth: [5,6,7,8,9], nutrition: 'mittel', spacing: 25, daysToHarvest: 60, waterDays: 3, fertilizeWeeks: 3 },
  { name: 'Rote Bete', emoji: '🟤', category: 'Gemüse', sowMonth: [4,5,6], harvestMonth: [7,8,9,10], nutrition: 'mittel', spacing: 10, daysToHarvest: 90, waterDays: 3, fertilizeWeeks: 4 },
  { name: 'Mangold', emoji: '🥬', category: 'Gemüse', sowMonth: [4,5], harvestMonth: [6,7,8,9,10], nutrition: 'mittel', spacing: 30, daysToHarvest: 60, waterDays: 2, fertilizeWeeks: 3 },
  { name: 'Fenchel', emoji: '🌿', category: 'Gemüse', sowMonth: [5,6], harvestMonth: [8,9,10], nutrition: 'mittel', spacing: 25, daysToHarvest: 90, waterDays: 3, fertilizeWeeks: 3 },
  { name: 'Lauch', emoji: '🥬', category: 'Gemüse', sowMonth: [3,4], harvestMonth: [9,10,11,12], nutrition: 'stark', spacing: 15, daysToHarvest: 150, waterDays: 3, fertilizeWeeks: 3 },
  { name: 'Aubergine', emoji: '🍆', category: 'Gemüse', sowMonth: [2,3], harvestMonth: [7,8,9,10], nutrition: 'stark', spacing: 50, daysToHarvest: 130, waterDays: 2, fertilizeWeeks: 2, goodNeighbors: ['Bohne', 'Basilikum'], badNeighbors: ['Fenchel'] },
  { name: 'Spargel', emoji: '🌱', category: 'Gemüse', sowMonth: [3,4], harvestMonth: [4,5,6], nutrition: 'mittel', spacing: 40, daysToHarvest: 365, waterDays: 4, fertilizeWeeks: 4, goodNeighbors: ['Petersilie', 'Basilikum', 'Tomate'], badNeighbors: ['Zwiebel', 'Knoblauch'] },
  { name: 'Artischocke', emoji: '🌿', category: 'Gemüse', sowMonth: [3,4], harvestMonth: [7,8,9], nutrition: 'stark', spacing: 80, daysToHarvest: 180, waterDays: 3, fertilizeWeeks: 3 },
  { name: 'Melone', emoji: '🍈', category: 'Gemüse', sowMonth: [4,5], harvestMonth: [8,9,10], nutrition: 'stark', spacing: 80, daysToHarvest: 100, waterDays: 2, fertilizeWeeks: 2, goodNeighbors: ['Mais', 'Sonnenblume'], badNeighbors: ['Kartoffel'] },
  { name: 'Süßkartoffel', emoji: '🍠', category: 'Gemüse', sowMonth: [5], harvestMonth: [9,10], nutrition: 'mittel', spacing: 30, daysToHarvest: 120, waterDays: 3, fertilizeWeeks: 3 },

  // Kräuter
  { name: 'Basilikum', emoji: '🌿', category: 'Kräuter', sowMonth: [4,5], harvestMonth: [6,7,8,9], nutrition: 'mittel', spacing: 20, daysToHarvest: 45, waterDays: 2, goodNeighbors: ['Tomate'], badNeighbors: ['Raute'] },
  { name: 'Petersilie', emoji: '🌿', category: 'Kräuter', sowMonth: [3,4,5], harvestMonth: [5,6,7,8,9,10], nutrition: 'mittel', spacing: 15, daysToHarvest: 70, waterDays: 3, goodNeighbors: ['Tomate', 'Zwiebel', 'Kartoffel'], badNeighbors: ['Salat'] },
  { name: 'Schnittlauch', emoji: '🌿', category: 'Kräuter', sowMonth: [3,4], harvestMonth: [4,5,6,7,8,9,10], spacing: 15, daysToHarvest: 60, waterDays: 3 },
  { name: 'Dill', emoji: '🌿', category: 'Kräuter', sowMonth: [4,5], harvestMonth: [6,7,8], spacing: 15, daysToHarvest: 50, waterDays: 3 },
  { name: 'Rosmarin', emoji: '🌿', category: 'Kräuter', sowMonth: [3,4], harvestMonth: [1,2,3,4,5,6,7,8,9,10,11,12], spacing: 30, daysToHarvest: 90, waterDays: 7 },
  { name: 'Thymian', emoji: '🌿', category: 'Kräuter', sowMonth: [4,5], harvestMonth: [5,6,7,8,9,10], spacing: 20, daysToHarvest: 75, waterDays: 7 },
  { name: 'Oregano', emoji: '🌿', category: 'Kräuter', sowMonth: [4,5], harvestMonth: [6,7,8,9], spacing: 25, daysToHarvest: 80, waterDays: 5 },
  { name: 'Minze', emoji: '🍃', category: 'Kräuter', sowMonth: [4,5], harvestMonth: [5,6,7,8,9], spacing: 30, daysToHarvest: 60, waterDays: 2 },
  { name: 'Koriander', emoji: '🌿', category: 'Kräuter', sowMonth: [4,5,6], harvestMonth: [6,7,8,9], spacing: 15, daysToHarvest: 45, waterDays: 3 },
  { name: 'Salbei', emoji: '🌿', category: 'Kräuter', sowMonth: [4,5], harvestMonth: [5,6,7,8,9], spacing: 30, daysToHarvest: 80, waterDays: 5 },
  { name: 'Liebstöckel', emoji: '🌿', category: 'Kräuter', sowMonth: [3,4], harvestMonth: [5,6,7,8,9], spacing: 40, daysToHarvest: 90, waterDays: 4 },
  { name: 'Majoran', emoji: '🌿', category: 'Kräuter', sowMonth: [4,5], harvestMonth: [6,7,8,9], spacing: 20, daysToHarvest: 70, waterDays: 4 },
  { name: 'Zitronenmelisse', emoji: '🍋', category: 'Kräuter', sowMonth: [3,4,5], harvestMonth: [5,6,7,8,9,10], spacing: 30, daysToHarvest: 60, waterDays: 3 },
  { name: 'Estragon', emoji: '🌿', category: 'Kräuter', sowMonth: [3,4], harvestMonth: [5,6,7,8,9], spacing: 30, daysToHarvest: 90, waterDays: 5 },
  { name: 'Bohnenkraut', emoji: '🌿', category: 'Kräuter', sowMonth: [4,5], harvestMonth: [7,8,9], spacing: 20, daysToHarvest: 60, waterDays: 5, goodNeighbors: ['Bohne', 'Zwiebel'] },

  // Obst
  { name: 'Erdbeere', emoji: '🍓', category: 'Obst', sowMonth: [3,4,7,8], harvestMonth: [5,6,7], nutrition: 'mittel', spacing: 25, daysToHarvest: 90, waterDays: 2, fertilizeWeeks: 3, goodNeighbors: ['Knoblauch', 'Zwiebel', 'Schnittlauch', 'Spinat'], badNeighbors: ['Kohl'] },
  { name: 'Himbeere', emoji: '🫐', category: 'Obst', sowMonth: [10,11,3], harvestMonth: [6,7,8], spacing: 40, daysToHarvest: 365, waterDays: 3, fertilizeWeeks: 4 },
  { name: 'Heidelbeere', emoji: '🫐', category: 'Obst', sowMonth: [10,11,3], harvestMonth: [7,8], spacing: 100, daysToHarvest: 365, waterDays: 3, fertilizeWeeks: 4 },
  { name: 'Johannisbeere', emoji: '🔴', category: 'Obst', sowMonth: [10,11,3], harvestMonth: [6,7], spacing: 100, daysToHarvest: 365, waterDays: 4, fertilizeWeeks: 4 },
  { name: 'Weintraube', emoji: '🍇', category: 'Obst', sowMonth: [3,4], harvestMonth: [9,10], spacing: 150, daysToHarvest: 365, waterDays: 5 },
  { name: 'Rhabarber', emoji: '🌿', category: 'Obst', sowMonth: [3,4], harvestMonth: [4,5,6], spacing: 80, daysToHarvest: 365, waterDays: 4, fertilizeWeeks: 4 },
  { name: 'Brombeere', emoji: '🫐', category: 'Obst', sowMonth: [10,11,3], harvestMonth: [7,8,9], spacing: 100, daysToHarvest: 365, waterDays: 4, fertilizeWeeks: 4 },
  { name: 'Stachelbeere', emoji: '🟢', category: 'Obst', sowMonth: [10,11,3], harvestMonth: [6,7,8], spacing: 100, daysToHarvest: 365, waterDays: 4, fertilizeWeeks: 4 },

  // Blumen
  { name: 'Sonnenblume', emoji: '🌻', category: 'Blumen', sowMonth: [4,5], harvestMonth: [8,9,10], spacing: 40, daysToHarvest: 80, waterDays: 3 },
  { name: 'Ringelblume', emoji: '🌼', category: 'Blumen', sowMonth: [4,5], harvestMonth: [6,7,8,9], spacing: 25, daysToHarvest: 60, waterDays: 4 },
  { name: 'Lavendel', emoji: '💜', category: 'Blumen', sowMonth: [3,4], harvestMonth: [6,7,8], spacing: 30, daysToHarvest: 120, waterDays: 7 },
  { name: 'Rose', emoji: '🌹', category: 'Blumen', sowMonth: [10,11,3,4], harvestMonth: [6,7,8,9], spacing: 50, daysToHarvest: 365, waterDays: 4, fertilizeWeeks: 4 },
  { name: 'Tulpe', emoji: '🌷', category: 'Blumen', sowMonth: [10,11], harvestMonth: [4,5], spacing: 10, daysToHarvest: 150, waterDays: 5 },
  { name: 'Dahlie', emoji: '🌸', category: 'Blumen', sowMonth: [4,5], harvestMonth: [7,8,9,10], spacing: 40, daysToHarvest: 90, waterDays: 3 },
  { name: 'Kapuzinerkresse', emoji: '🌺', category: 'Blumen', sowMonth: [4,5], harvestMonth: [6,7,8,9,10], spacing: 30, daysToHarvest: 50, waterDays: 3 },
  { name: 'Tagetes', emoji: '🌼', category: 'Blumen', sowMonth: [4,5], harvestMonth: [6,7,8,9,10], spacing: 20, daysToHarvest: 50, waterDays: 3 },
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
