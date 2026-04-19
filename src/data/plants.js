/**
 * Plant Database — Curated suggestions for common garden plants
 * Merges with user's custom plants from the local store.
 *
 * Extended fields:
 *   spacing        — Pflanzabstand in cm
 *   daysToHarvest  — Tage von Pflanzung bis Ernte
 *   waterDays      — Gießintervall in Tagen (z.B. 2 = alle 2 Tage)
 *   fertilizeWeeks — Düngeintervall in Wochen (z.B. 2 = alle 2 Wochen)
 *   preferredSoil  — Array mit geeigneten Bodentypen ('normal','sand','clay','humus')
 *                    Fehlendes Feld = keine Bodenprüfung
 */
import { store } from '../core/Store.js';

export const plants = [
  // Gemüse
  { name: 'Tomate', emoji: '🍅', category: 'Gemüse', sowMonth: [3,4], harvestMonth: [7,8,9], nutrition: 'stark', spacing: 50, daysToHarvest: 120, waterDays: 2, fertilizeWeeks: 2, preferredSoil: ['normal', 'humus'], goodNeighbors: ['Basilikum', 'Petersilie', 'Knoblauch', 'Salat'], badNeighbors: ['Kartoffel', 'Erbse', 'Gurke', 'Fenchel'] },
  { name: 'Gurke', emoji: '🥒', category: 'Gemüse', sowMonth: [4,5], harvestMonth: [7,8,9], nutrition: 'stark', spacing: 40, daysToHarvest: 90, waterDays: 2, fertilizeWeeks: 2, preferredSoil: ['normal', 'humus'], goodNeighbors: ['Bohne', 'Dill', 'Salat', 'Zwiebel'], badNeighbors: ['Tomate', 'Radieschen'] },
  { name: 'Karotte', emoji: '🥕', category: 'Gemüse', sowMonth: [3,4,5,6], harvestMonth: [6,7,8,9,10], nutrition: 'mittel', spacing: 5, daysToHarvest: 100, waterDays: 3, fertilizeWeeks: 4, preferredSoil: ['normal', 'sand'], goodNeighbors: ['Zwiebel', 'Knoblauch', 'Lauch', 'Dill'], badNeighbors: ['Minze'] },
  { name: 'Kartoffel', emoji: '🥔', category: 'Gemüse', sowMonth: [4,5], harvestMonth: [8,9,10], nutrition: 'stark', spacing: 35, daysToHarvest: 110, waterDays: 4, fertilizeWeeks: 3, preferredSoil: ['normal', 'sand', 'humus'], goodNeighbors: ['Kohlrabi', 'Spinat', 'Tagetes', 'Mais'], badNeighbors: ['Tomate', 'Kürbis', 'Sonnenblume'] },
  { name: 'Paprika', emoji: '🫑', category: 'Gemüse', sowMonth: [2,3], harvestMonth: [7,8,9,10], nutrition: 'stark', spacing: 40, daysToHarvest: 130, waterDays: 2, fertilizeWeeks: 2, preferredSoil: ['normal', 'humus'] },
  { name: 'Zucchini', emoji: '🥒', category: 'Gemüse', sowMonth: [4,5], harvestMonth: [7,8,9], nutrition: 'stark', spacing: 80, daysToHarvest: 60, waterDays: 2, fertilizeWeeks: 2, preferredSoil: ['normal', 'humus'] },
  { name: 'Kürbis', emoji: '🎃', category: 'Gemüse', sowMonth: [4,5], harvestMonth: [9,10], nutrition: 'stark', spacing: 100, daysToHarvest: 120, waterDays: 3, fertilizeWeeks: 3, preferredSoil: ['normal', 'humus'] },
  { name: 'Brokkoli', emoji: '🥦', category: 'Gemüse', sowMonth: [3,4,5], harvestMonth: [7,8,9], nutrition: 'stark', spacing: 40, daysToHarvest: 90, waterDays: 3, fertilizeWeeks: 3, preferredSoil: ['normal', 'clay', 'humus'] },
  { name: 'Blumenkohl', emoji: '🥬', category: 'Gemüse', sowMonth: [3,4,5], harvestMonth: [7,8,9], nutrition: 'stark', spacing: 50, daysToHarvest: 100, waterDays: 3, fertilizeWeeks: 3, preferredSoil: ['normal', 'clay', 'humus'] },
  { name: 'Rotkohl', emoji: '🥬', category: 'Gemüse', sowMonth: [3,4,5], harvestMonth: [8,9,10,11], nutrition: 'stark', spacing: 50, daysToHarvest: 150, waterDays: 3, fertilizeWeeks: 3, preferredSoil: ['normal', 'clay', 'humus'] },
  { name: 'Weißkohl', emoji: '🥬', category: 'Gemüse', sowMonth: [3,4,5], harvestMonth: [8,9,10,11], nutrition: 'stark', spacing: 50, daysToHarvest: 140, waterDays: 3, fertilizeWeeks: 3, preferredSoil: ['normal', 'clay', 'humus'] },
  { name: 'Wirsing', emoji: '🥬', category: 'Gemüse', sowMonth: [4,5,6], harvestMonth: [9,10,11,12], nutrition: 'stark', spacing: 40, daysToHarvest: 130, waterDays: 3, fertilizeWeeks: 3, preferredSoil: ['normal', 'clay', 'humus'] },
  { name: 'Spitzkohl', emoji: '🥬', category: 'Gemüse', sowMonth: [3,4], harvestMonth: [6,7,8], nutrition: 'stark', spacing: 40, daysToHarvest: 90, waterDays: 3, fertilizeWeeks: 3, preferredSoil: ['normal', 'clay', 'humus'] },
  { name: 'Rosenkohl', emoji: '🥬', category: 'Gemüse', sowMonth: [4,5], harvestMonth: [10,11,12,1,2], nutrition: 'stark', spacing: 50, daysToHarvest: 160, waterDays: 4, fertilizeWeeks: 4, preferredSoil: ['normal', 'clay', 'humus'] },
  { name: 'Grünkohl', emoji: '🥬', category: 'Gemüse', sowMonth: [5,6], harvestMonth: [11,12,1,2], nutrition: 'stark', spacing: 45, daysToHarvest: 140, waterDays: 4, fertilizeWeeks: 4, preferredSoil: ['normal', 'clay', 'humus'] },
  { name: 'Kohlrabi', emoji: '🥬', category: 'Gemüse', sowMonth: [3,4,5,6], harvestMonth: [5,6,7,8,9], nutrition: 'mittel', spacing: 25, daysToHarvest: 60, waterDays: 3, fertilizeWeeks: 3, preferredSoil: ['normal', 'humus'] },
  { name: 'Pak Choi', emoji: '🥬', category: 'Gemüse', sowMonth: [7,8], harvestMonth: [9,10], nutrition: 'mittel', spacing: 25, daysToHarvest: 60, waterDays: 2, fertilizeWeeks: 3 },
  { name: 'Spinat', emoji: '🥬', category: 'Gemüse', sowMonth: [3,4,8,9], harvestMonth: [5,6,10,11], nutrition: 'mittel', spacing: 15, daysToHarvest: 45, waterDays: 3, fertilizeWeeks: 4, preferredSoil: ['normal', 'humus'] },
  { name: 'Salat', emoji: '🥬', category: 'Gemüse', sowMonth: [3,4,5,6,7,8], harvestMonth: [5,6,7,8,9,10], nutrition: 'schwach', spacing: 25, daysToHarvest: 50, waterDays: 2, fertilizeWeeks: 4, preferredSoil: ['normal', 'humus'] },
  { name: 'Feldsalat', emoji: '🥗', category: 'Gemüse', sowMonth: [8,9,10], harvestMonth: [11,12,1,2,3], nutrition: 'schwach', spacing: 10, daysToHarvest: 60, waterDays: 3, fertilizeWeeks: 0 },
  { name: 'Endivie', emoji: '🥬', category: 'Gemüse', sowMonth: [6,7], harvestMonth: [9,10,11], nutrition: 'mittel', spacing: 30, daysToHarvest: 80, waterDays: 3, fertilizeWeeks: 0 },
  { name: 'Radicchio', emoji: '🥬', category: 'Gemüse', sowMonth: [6,7], harvestMonth: [9,10,11], nutrition: 'mittel', spacing: 30, daysToHarvest: 90, waterDays: 3, fertilizeWeeks: 0 },
  { name: 'Rucola', emoji: '🌿', category: 'Gemüse', sowMonth: [4,5,6,7,8,9], harvestMonth: [5,6,7,8,9,10], nutrition: 'schwach', spacing: 15, daysToHarvest: 40, waterDays: 2, fertilizeWeeks: 0 },
  { name: 'Portulak', emoji: '🌿', category: 'Gemüse', sowMonth: [9,10,11], harvestMonth: [11,12,1,2,3], nutrition: 'schwach', spacing: 15, daysToHarvest: 40, waterDays: 3, fertilizeWeeks: 0 },
  { name: 'Radieschen', emoji: '🔴', category: 'Gemüse', sowMonth: [3,4,5,6,7,8], harvestMonth: [4,5,6,7,8,9], nutrition: 'schwach', spacing: 5, daysToHarvest: 30, waterDays: 2, preferredSoil: ['normal', 'sand', 'humus'] },
  { name: 'Rettich', emoji: '🤍', category: 'Gemüse', sowMonth: [6,7,8], harvestMonth: [8,9,10], nutrition: 'mittel', spacing: 15, daysToHarvest: 60, waterDays: 3, fertilizeWeeks: 4, preferredSoil: ['normal', 'sand', 'humus'] },
  { name: 'Mairübe', emoji: '⚪', category: 'Gemüse', sowMonth: [3,4], harvestMonth: [5,6], nutrition: 'schwach', spacing: 15, daysToHarvest: 50, waterDays: 3, fertilizeWeeks: 0 },
  { name: 'Pastinake', emoji: '🥕', category: 'Gemüse', sowMonth: [3,4,5], harvestMonth: [9,10,11,12], nutrition: 'mittel', spacing: 15, daysToHarvest: 180, waterDays: 4, fertilizeWeeks: 5, preferredSoil: ['normal', 'sand'] },
  { name: 'Wurzelpetersilie', emoji: '🥕', category: 'Gemüse', sowMonth: [3,4], harvestMonth: [10,11], nutrition: 'mittel', spacing: 15, daysToHarvest: 180, waterDays: 4, fertilizeWeeks: 5, preferredSoil: ['normal', 'sand'] },
  { name: 'Schwarzwurzel', emoji: '🥢', category: 'Gemüse', sowMonth: [3,4], harvestMonth: [10,11,12], nutrition: 'mittel', spacing: 10, daysToHarvest: 200, waterDays: 4, fertilizeWeeks: 4, preferredSoil: ['normal', 'sand'] },
  { name: 'Topinambur', emoji: '🌻', category: 'Gemüse', sowMonth: [3,4], harvestMonth: [10,11,12,1,2,3], nutrition: 'mittel', spacing: 50, daysToHarvest: 150, waterDays: 5, fertilizeWeeks: 4 },
  { name: 'Bohne', emoji: '🫘', category: 'Gemüse', sowMonth: [5,6], harvestMonth: [7,8,9], nutrition: 'schwach', spacing: 30, daysToHarvest: 65, waterDays: 3, fertilizeWeeks: 4, preferredSoil: ['normal', 'sand', 'humus'], goodNeighbors: ['Kartoffel', 'Gurke', 'Kohlrabi', 'Erdbeere'], badNeighbors: ['Zwiebel', 'Knoblauch', 'Lauch', 'Erbse'] },
  { name: 'Erbse', emoji: '🟢', category: 'Gemüse', sowMonth: [3,4,5], harvestMonth: [6,7,8], nutrition: 'schwach', spacing: 5, daysToHarvest: 70, waterDays: 3, preferredSoil: ['normal', 'humus'], goodNeighbors: ['Karotte', 'Kohlrabi', 'Salat', 'Zucchini'], badNeighbors: ['Zwiebel', 'Knoblauch', 'Bohne', 'Tomate'] },
  { name: 'Zwiebel', emoji: '🧅', category: 'Gemüse', sowMonth: [3,4], harvestMonth: [8,9], nutrition: 'mittel', spacing: 10, daysToHarvest: 120, waterDays: 5, preferredSoil: ['normal', 'sand', 'humus'], goodNeighbors: ['Karotte', 'Rote Bete', 'Erdbeere', 'Kamille'], badNeighbors: ['Bohne', 'Erbse'] },
  { name: 'Knoblauch', emoji: '🧄', category: 'Gemüse', sowMonth: [10,3], harvestMonth: [7,8], nutrition: 'mittel', spacing: 10, daysToHarvest: 150, waterDays: 5, preferredSoil: ['normal', 'sand', 'humus'], goodNeighbors: ['Karotte', 'Tomate', 'Erdbeere', 'Rose'], badNeighbors: ['Bohne', 'Erbse'] },
  { name: 'Mais', emoji: '🌽', category: 'Gemüse', sowMonth: [5], harvestMonth: [9,10], nutrition: 'stark', spacing: 30, daysToHarvest: 100, waterDays: 3, fertilizeWeeks: 3, preferredSoil: ['normal', 'humus'] },
  { name: 'Sellerie', emoji: '🥬', category: 'Gemüse', sowMonth: [3,4], harvestMonth: [9,10,11], nutrition: 'stark', spacing: 30, daysToHarvest: 140, waterDays: 2, fertilizeWeeks: 2, preferredSoil: ['normal', 'humus', 'clay'] },
  { name: 'Rote Bete', emoji: '🟤', category: 'Gemüse', sowMonth: [4,5,6], harvestMonth: [7,8,9,10], nutrition: 'mittel', spacing: 10, daysToHarvest: 90, waterDays: 3, fertilizeWeeks: 4, preferredSoil: ['normal', 'humus'] },
  { name: 'Mangold', emoji: '🥬', category: 'Gemüse', sowMonth: [4,5], harvestMonth: [6,7,8,9,10], nutrition: 'mittel', spacing: 30, daysToHarvest: 60, waterDays: 2, fertilizeWeeks: 3, preferredSoil: ['normal', 'humus', 'clay'] },
  { name: 'Fenchel', emoji: '🌿', category: 'Gemüse', sowMonth: [5,6], harvestMonth: [8,9,10], nutrition: 'mittel', spacing: 25, daysToHarvest: 90, waterDays: 3, fertilizeWeeks: 3 },
  { name: 'Lauch', emoji: '🥬', category: 'Gemüse', sowMonth: [3,4], harvestMonth: [9,10,11,12], nutrition: 'stark', spacing: 15, daysToHarvest: 150, waterDays: 3, fertilizeWeeks: 3, preferredSoil: ['normal', 'clay', 'humus'] },
  { name: 'Aubergine', emoji: '🍆', category: 'Gemüse', sowMonth: [2,3], harvestMonth: [7,8,9,10], nutrition: 'stark', spacing: 50, daysToHarvest: 130, waterDays: 2, fertilizeWeeks: 2, preferredSoil: ['normal', 'humus'], goodNeighbors: ['Bohne', 'Basilikum'], badNeighbors: ['Fenchel'] },
  { name: 'Spargel', emoji: '🌱', category: 'Gemüse', isPerennial: true, sowMonth: [3,4], harvestMonth: [4,5,6], nutrition: 'mittel', spacing: 40, daysToHarvest: 365, waterDays: 4, fertilizeWeeks: 4, preferredSoil: ['normal', 'sand'], goodNeighbors: ['Petersilie', 'Basilikum', 'Tomate'], badNeighbors: ['Zwiebel', 'Knoblauch'] },
  { name: 'Artischocke', emoji: '🌿', category: 'Gemüse', isPerennial: true, sowMonth: [3,4], harvestMonth: [7,8,9], nutrition: 'stark', spacing: 80, daysToHarvest: 180, waterDays: 3, fertilizeWeeks: 3 },
  { name: 'Melone', emoji: '🍈', category: 'Gemüse', sowMonth: [4,5], harvestMonth: [8,9,10], nutrition: 'stark', spacing: 80, daysToHarvest: 100, waterDays: 2, fertilizeWeeks: 2, goodNeighbors: ['Mais', 'Sonnenblume'], badNeighbors: ['Kartoffel'] },
  { name: 'Süßkartoffel', emoji: '🍠', category: 'Gemüse', sowMonth: [5], harvestMonth: [9,10], nutrition: 'mittel', spacing: 30, daysToHarvest: 120, waterDays: 3, fertilizeWeeks: 3 },
  { name: 'Okra', emoji: '🌶️', category: 'Gemüse', sowMonth: [4,5], harvestMonth: [7,8,9], nutrition: 'stark', spacing: 40, daysToHarvest: 70, waterDays: 2, fertilizeWeeks: 2 },
  { name: 'Ingwer', emoji: '🫚', category: 'Gemüse', sowMonth: [2,3], harvestMonth: [10,11], nutrition: 'stark', spacing: 30, daysToHarvest: 200, waterDays: 2, fertilizeWeeks: 2 },
  { name: 'Kurkuma', emoji: '🫚', category: 'Gemüse', sowMonth: [2,3], harvestMonth: [10,11], nutrition: 'stark', spacing: 30, daysToHarvest: 200, waterDays: 2, fertilizeWeeks: 2 },

  // Kräuter
  { name: 'Basilikum', emoji: '🌿', category: 'Kräuter', sowMonth: [4,5], harvestMonth: [6,7,8,9], nutrition: 'mittel', spacing: 20, daysToHarvest: 45, waterDays: 2, preferredSoil: ['normal', 'humus'], goodNeighbors: ['Tomate'], badNeighbors: ['Raute'] },
  { name: 'Petersilie', emoji: '🌿', category: 'Kräuter', sowMonth: [3,4,5], harvestMonth: [5,6,7,8,9,10], nutrition: 'mittel', spacing: 15, daysToHarvest: 70, waterDays: 3, preferredSoil: ['normal', 'humus'], goodNeighbors: ['Tomate', 'Zwiebel', 'Kartoffel'], badNeighbors: ['Salat'] },
  { name: 'Schnittlauch', emoji: '🌿', category: 'Kräuter', isPerennial: true, sowMonth: [3,4], harvestMonth: [4,5,6,7,8,9,10], spacing: 15, daysToHarvest: 60, waterDays: 3 },
  { name: 'Dill', emoji: '🌿', category: 'Kräuter', sowMonth: [4,5], harvestMonth: [6,7,8], spacing: 15, daysToHarvest: 50, waterDays: 3 },
  { name: 'Rosmarin', emoji: '🌿', category: 'Kräuter', isPerennial: true, sowMonth: [3,4], harvestMonth: [1,2,3,4,5,6,7,8,9,10,11,12], spacing: 30, daysToHarvest: 90, waterDays: 7, preferredSoil: ['normal', 'sand'] },
  { name: 'Thymian', emoji: '🌿', category: 'Kräuter', isPerennial: true, sowMonth: [4,5], harvestMonth: [5,6,7,8,9,10], spacing: 20, daysToHarvest: 75, waterDays: 7, preferredSoil: ['normal', 'sand'] },
  { name: 'Oregano', emoji: '🌿', category: 'Kräuter', isPerennial: true, sowMonth: [4,5], harvestMonth: [6,7,8,9], spacing: 25, daysToHarvest: 80, waterDays: 5, preferredSoil: ['normal', 'sand'] },
  { name: 'Minze', emoji: '🍃', category: 'Kräuter', isPerennial: true, sowMonth: [4,5], harvestMonth: [5,6,7,8,9], spacing: 30, daysToHarvest: 60, waterDays: 2 },
  { name: 'Koriander', emoji: '🌿', category: 'Kräuter', sowMonth: [4,5,6], harvestMonth: [6,7,8,9], spacing: 15, daysToHarvest: 45, waterDays: 3 },
  { name: 'Salbei', emoji: '🌿', category: 'Kräuter', isPerennial: true, sowMonth: [4,5], harvestMonth: [5,6,7,8,9], spacing: 30, daysToHarvest: 80, waterDays: 5, preferredSoil: ['normal', 'sand'] },
  { name: 'Liebstöckel', emoji: '🌿', category: 'Kräuter', isPerennial: true, sowMonth: [3,4], harvestMonth: [5,6,7,8,9], spacing: 40, daysToHarvest: 90, waterDays: 4 },
  { name: 'Majoran', emoji: '🌿', category: 'Kräuter', sowMonth: [4,5], harvestMonth: [6,7,8,9], spacing: 20, daysToHarvest: 70, waterDays: 4 },
  { name: 'Zitronenmelisse', emoji: '🍋', category: 'Kräuter', isPerennial: true, sowMonth: [3,4,5], harvestMonth: [5,6,7,8,9,10], spacing: 30, daysToHarvest: 60, waterDays: 3 },
  { name: 'Estragon', emoji: '🌿', category: 'Kräuter', isPerennial: true, sowMonth: [3,4], harvestMonth: [5,6,7,8,9], spacing: 30, daysToHarvest: 90, waterDays: 5 },
  { name: 'Bohnenkraut', emoji: '🌿', category: 'Kräuter', sowMonth: [4,5], harvestMonth: [7,8,9], spacing: 20, daysToHarvest: 60, waterDays: 5, goodNeighbors: ['Bohne', 'Zwiebel'] },
  { name: 'Bärlauch', emoji: '🌿', category: 'Kräuter', isPerennial: true, sowMonth: [9,10,11], harvestMonth: [3,4,5], spacing: 20, daysToHarvest: 180, waterDays: 3 },
  { name: 'Waldmeister', emoji: '🌿', category: 'Kräuter', isPerennial: true, sowMonth: [9,10], harvestMonth: [4,5], spacing: 20, daysToHarvest: 180, waterDays: 4 },
  { name: 'Sauerampfer', emoji: '🌿', category: 'Kräuter', isPerennial: true, sowMonth: [3,4,8], harvestMonth: [5,6,7,8,9,10], spacing: 20, daysToHarvest: 60, waterDays: 3 },
  { name: 'Physalis', emoji: '🍒', category: 'Kräuter', sowMonth: [2,3], harvestMonth: [8,9,10], nutrition: 'stark', spacing: 80, daysToHarvest: 150, waterDays: 3, fertilizeWeeks: 2 },
  { name: 'Zitronenverbene', emoji: '🌿', category: 'Kräuter', sowMonth: [4,5], harvestMonth: [6,7,8,9], nutrition: 'mittel', spacing: 40, daysToHarvest: 90, waterDays: 3, fertilizeWeeks: 3 },

  // Obst & Bäume
  { name: 'Erdbeere', emoji: '🍓', category: 'Obst', isPerennial: true, sowMonth: [3,4,7,8], harvestMonth: [5,6,7], nutrition: 'mittel', spacing: 25, daysToHarvest: 90, waterDays: 2, fertilizeWeeks: 3, preferredSoil: ['normal', 'humus'], goodNeighbors: ['Knoblauch', 'Zwiebel', 'Schnittlauch', 'Spinat'], badNeighbors: ['Kohl'] },
  { name: 'Himbeere', emoji: '🫐', category: 'Obst', isPerennial: true, sowMonth: [10,11,3], harvestMonth: [6,7,8], spacing: 40, daysToHarvest: 365, waterDays: 3, fertilizeWeeks: 4, preferredSoil: ['normal', 'humus'] },
  { name: 'Heidelbeere', emoji: '🫐', category: 'Obst', isPerennial: true, sowMonth: [10,11,3], harvestMonth: [7,8], spacing: 100, daysToHarvest: 365, waterDays: 3, fertilizeWeeks: 4, preferredSoil: ['humus'] },
  { name: 'Johannisbeere', emoji: '🔴', category: 'Obst', isPerennial: true, sowMonth: [10,11,3], harvestMonth: [6,7], spacing: 100, daysToHarvest: 365, waterDays: 4, fertilizeWeeks: 4 },
  { name: 'Weintraube', emoji: '🍇', category: 'Obst', isPerennial: true, sowMonth: [3,4], harvestMonth: [9,10], spacing: 150, daysToHarvest: 365, waterDays: 5, preferredSoil: ['normal', 'sand'] },
  { name: 'Rhabarber', emoji: '🌿', category: 'Obst', isPerennial: true, sowMonth: [3,4], harvestMonth: [4,5,6], spacing: 80, daysToHarvest: 365, waterDays: 4, fertilizeWeeks: 4 },
  { name: 'Brombeere', emoji: '🫐', category: 'Obst', isPerennial: true, sowMonth: [10,11,3], harvestMonth: [7,8,9], spacing: 100, daysToHarvest: 365, waterDays: 4, fertilizeWeeks: 4 },
  { name: 'Stachelbeere', emoji: '🟢', category: 'Obst', isPerennial: true, sowMonth: [10,11,3], harvestMonth: [6,7,8], spacing: 100, daysToHarvest: 365, waterDays: 4, fertilizeWeeks: 4 },
  { name: 'Apfelbaum', emoji: '🍎', category: 'Obst', isPerennial: true, sowMonth: [10,11,3,4], harvestMonth: [8,9,10], nutrition: 'stark', spacing: 300, daysToHarvest: 1000, waterDays: 7, fertilizeWeeks: 12 },
  { name: 'Birnbaum', emoji: '🍐', category: 'Obst', isPerennial: true, sowMonth: [10,11,3,4], harvestMonth: [8,9,10], nutrition: 'stark', spacing: 300, daysToHarvest: 1000, waterDays: 7, fertilizeWeeks: 12 },
  { name: 'Kirschbaum', emoji: '🍒', category: 'Obst', isPerennial: true, sowMonth: [10,11,3,4], harvestMonth: [6,7], nutrition: 'stark', spacing: 300, daysToHarvest: 1000, waterDays: 7, fertilizeWeeks: 12 },
  { name: 'Pflaumenbaum', emoji: '🍑', category: 'Obst', isPerennial: true, sowMonth: [10,11,3,4], harvestMonth: [7,8,9], nutrition: 'stark', spacing: 300, daysToHarvest: 1000, waterDays: 7, fertilizeWeeks: 12 },
  { name: 'Pfirsichbaum', emoji: '🍑', category: 'Obst', isPerennial: true, sowMonth: [10,11,3,4], harvestMonth: [7,8], nutrition: 'stark', spacing: 300, daysToHarvest: 1000, waterDays: 7, fertilizeWeeks: 12 },
  { name: 'Quitte', emoji: '🍋', category: 'Obst', isPerennial: true, sowMonth: [10,11,3,4], harvestMonth: [10,11], nutrition: 'stark', spacing: 300, daysToHarvest: 1000, waterDays: 7, fertilizeWeeks: 12 },
  { name: 'Feige', emoji: '🟤', category: 'Obst', isPerennial: true, sowMonth: [3,4,5], harvestMonth: [8,9,10], nutrition: 'stark', spacing: 200, daysToHarvest: 365, waterDays: 5, fertilizeWeeks: 8, preferredSoil: ['normal', 'sand'] },
  { name: 'Mini-Kiwi', emoji: '🥝', category: 'Obst', isPerennial: true, sowMonth: [3,4,5], harvestMonth: [9,10], nutrition: 'stark', spacing: 150, daysToHarvest: 730, waterDays: 4, fertilizeWeeks: 4 },

  // Blumen & Begleitpflanzen
  { name: 'Sonnenblume', emoji: '🌻', category: 'Blumen', sowMonth: [4,5], harvestMonth: [8,9,10], spacing: 40, daysToHarvest: 80, waterDays: 3 },
  { name: 'Ringelblume', emoji: '🌼', category: 'Blumen', sowMonth: [4,5], harvestMonth: [6,7,8,9], spacing: 25, daysToHarvest: 60, waterDays: 4 },
  { name: 'Lavendel', emoji: '💜', category: 'Blumen', isPerennial: true, sowMonth: [3,4], harvestMonth: [6,7,8], spacing: 30, daysToHarvest: 120, waterDays: 7, preferredSoil: ['normal', 'sand'] },
  { name: 'Rose', emoji: '🌹', category: 'Blumen', isPerennial: true, sowMonth: [10,11,3,4], harvestMonth: [6,7,8,9], spacing: 50, daysToHarvest: 365, waterDays: 4, fertilizeWeeks: 4 },
  { name: 'Tulpe', emoji: '🌷', category: 'Blumen', sowMonth: [10,11], harvestMonth: [4,5], spacing: 10, daysToHarvest: 150, waterDays: 5 },
  { name: 'Dahlie', emoji: '🌸', category: 'Blumen', sowMonth: [4,5], harvestMonth: [7,8,9,10], spacing: 40, daysToHarvest: 90, waterDays: 3 },
  { name: 'Kapuzinerkresse', emoji: '🌺', category: 'Blumen', sowMonth: [4,5], harvestMonth: [6,7,8,9,10], spacing: 30, daysToHarvest: 50, waterDays: 3 },
  { name: 'Tagetes', emoji: '🌼', category: 'Blumen', sowMonth: [4,5], harvestMonth: [6,7,8,9,10], spacing: 20, daysToHarvest: 50, waterDays: 3 },
  { name: 'Borretsch', emoji: '💠', category: 'Blumen', sowMonth: [4,5,6], harvestMonth: [6,7,8,9], spacing: 30, daysToHarvest: 50, waterDays: 4 },
  { name: 'Kamille', emoji: '🌼', category: 'Blumen', sowMonth: [4,5], harvestMonth: [6,7,8], spacing: 20, daysToHarvest: 60, waterDays: 4, goodNeighbors: ['Zwiebel', 'Knoblauch'] },
  { name: 'Schafgarbe', emoji: '🌿', category: 'Blumen', sowMonth: [3,4], harvestMonth: [6,7,8,9], spacing: 30, daysToHarvest: 90, waterDays: 5 },
  { name: 'Kornblume', emoji: '💠', category: 'Blumen', sowMonth: [3,4,5], harvestMonth: [6,7,8,9], spacing: 20, daysToHarvest: 70, waterDays: 4 },

  // Gründüngung
  { name: 'Phacelia', emoji: '💜', category: 'Gründüngung', sowMonth: [4,5,6,7,8], harvestMonth: [6,7,8,9,10], nutrition: 'gruen', spacing: 10, daysToHarvest: 60, waterDays: 5, fertilizeWeeks: 0 },
  { name: 'Gelbsenf', emoji: '💛', category: 'Gründüngung', sowMonth: [4,5,6,7,8,9], harvestMonth: [6,7,8,9,10,11], nutrition: 'gruen', spacing: 10, daysToHarvest: 45, waterDays: 5, fertilizeWeeks: 0 },
  { name: 'Inkarnatklee', emoji: '🍀', category: 'Gründüngung', sowMonth: [4,5,6,7,8], harvestMonth: [6,7,8,9,10,11], nutrition: 'gruen', spacing: 10, daysToHarvest: 70, waterDays: 5, fertilizeWeeks: 0 },
  { name: 'Lupine', emoji: '🌸', category: 'Gründüngung', sowMonth: [4,5,6], harvestMonth: [6,7,8,9,10], nutrition: 'gruen', spacing: 20, daysToHarvest: 90, waterDays: 4, fertilizeWeeks: 0 },
  { name: 'Buchweizen', emoji: '🌾', category: 'Gründüngung', sowMonth: [5,6,7,8], harvestMonth: [7,8,9,10], nutrition: 'gruen', spacing: 10, daysToHarvest: 50, waterDays: 4, fertilizeWeeks: 0 },
  { name: 'Winterroggen', emoji: '🌾', category: 'Gründüngung', sowMonth: [9,10,11], harvestMonth: [4,5,6], nutrition: 'gruen', spacing: 5, daysToHarvest: 180, waterDays: 7, fertilizeWeeks: 0 },
];

/**
 * Get all plants (system plants merged with custom overrides/additions)
 */
export function getAllPlants() {
  const custom = store.getCustomPlants() || [];

  // Create a map to allow custom plants to override system plants by exact name
  const plantMap = new Map();
  plants.forEach(p => plantMap.set(p.name.toLowerCase(), { ...p, isSystem: true }));
  custom.forEach(p => plantMap.set(p.name.toLowerCase(), { ...p, isCustom: true }));

  return Array.from(plantMap.values());
}

/**
 * Search plants by query
 */
export function searchPlants(query) {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase();
  return getAllPlants().filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  ).slice(0, 10);
}

/**
 * Get plant by exact name
 */
export function getPlant(name) {
  return getAllPlants().find(p => p.name.toLowerCase() === name.toLowerCase());
}

/**
 * Get plants for current sowing month
 */
export function getSowingPlants(month) {
  const m = month || new Date().getMonth() + 1;
  return getAllPlants().filter(p => p.sowMonth && p.sowMonth.includes(m));
}

/**
 * Get plants for current harvest month
 */
export function getHarvestPlants(month) {
  const m = month || new Date().getMonth() + 1;
  return getAllPlants().filter(p => p.harvestMonth && p.harvestMonth.includes(m));
}

/**
 * Month names in German
 */
export const monthNames = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];
