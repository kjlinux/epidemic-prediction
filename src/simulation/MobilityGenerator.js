/**
 * Générateur de Matrice de Mobilité
 * Basé sur le modèle de gravité et les caractéristiques de la Côte d'Ivoire
 */

import { haversineDistance } from '../utils/geoUtils.js';

/**
 * Génère la matrice de flux de mobilité entre villes
 * Modèle: flux ∝ (pop_i × pop_j × centralité_j) / distance²
 *
 * @param {Array} cities - Tableau des villes (ivoryCoastCities)
 * @param {Date} currentDate - Date actuelle pour facteurs saisonniers
 * @returns {Map} Map<"originId_destId", flowVolume>
 */
export function generateMobilityMatrix(cities, currentDate = new Date()) {
  const flows = new Map();

  for (const origin of cities) {
    for (const dest of cities) {
      if (origin.id === dest.id) continue;

      const distance = haversineDistance(origin.coordinates, dest.coordinates);

      // Éviter divisions par zéro pour très courtes distances
      const safeDistance = Math.max(distance, 1);

      // Modèle de gravité de base
      const gravityFlow =
        (origin.population * dest.population) / Math.pow(safeDistance, 2);

      // Facteur de centralité de la destination (Abidjan attire x10)
      const centralityBoost = dest.centrality / 50; // Normalisation

      // Facteur saisonnier
      const seasonalFactor = getSeasonalFactor(currentDate, origin, dest);

      // Facteur de corridor économique
      const corridorBoost = getCorridorBoost(origin, dest);

      // Flux quotidien calculé
      const dailyFlow =
        gravityFlow * 0.00001 * centralityBoost * seasonalFactor * corridorBoost;

      // Seuil minimum pour éviter flux négligeables
      if (dailyFlow > 50) {
        const flowKey = `${origin.id}_${dest.id}`;
        flows.set(flowKey, Math.round(dailyFlow));
      }
    }
  }

  return flows;
}

/**
 * Calcule le facteur saisonnier de mobilité
 * @param {Date} date
 * @param {Object} origin
 * @param {Object} dest
 * @returns {number} Facteur multiplicatif (1.0 = normal, >1 = augmentation)
 */
function getSeasonalFactor(date, origin, dest) {
  const month = date.getMonth(); // 0-11

  // Saison de récolte du cacao/café (Octobre-Mars) : Oct=9, Nov=10, Dec=11, Jan=0, Feb=1, Mar=2
  const isHarvestSeason = month >= 9 || month <= 2;

  // Période de fêtes de fin d'année (Décembre-Janvier)
  const isHolidaySeason = month === 11 || month === 0;

  // Migrations saisonnières vers zones agricoles
  if (isHarvestSeason && dest.region.includes('Daloa') || dest.region.includes('Soubré')) {
    return 1.8; // +80% de mobilité vers zones cacaoyères
  }

  // Retours au village pour les fêtes (depuis Abidjan vers autres régions)
  if (isHolidaySeason && origin.region === 'Abidjan' && dest.region !== 'Abidjan') {
    return 2.8; // +180% pendant les fêtes
  }

  // Saison sèche (Novembre-Mars) : plus de mobilité vers le Nord
  if ((month >= 10 || month <= 2) && dest.district === 'Savanes') {
    return 1.3;
  }

  return 1.0; // Normal
}

/**
 * Boost pour corridors économiques majeurs
 * @param {Object} origin
 * @param {Object} dest
 * @returns {number} Facteur multiplicatif
 */
function getCorridorBoost(origin, dest) {
  // Corridor Nord : Abidjan → Yamoussoukro → Bouaké → Korhogo
  const isNorthCorridor =
    (origin.name === 'Plateau' && dest.name === 'Yamoussoukro') ||
    (origin.name === 'Yamoussoukro' && dest.name === 'Bouaké') ||
    (origin.name === 'Bouaké' && dest.name === 'Korhogo');

  // Corridor Ouest : Abidjan → Daloa → Man
  const isWestCorridor =
    (origin.name === 'Plateau' && dest.name === 'Daloa') ||
    (origin.name === 'Daloa' && dest.name === 'Man');

  // Corridor Littoral : Abidjan → Sassandra → San Pedro
  const isCoastalCorridor =
    (origin.name === 'Plateau' && dest.name === 'Sassandra') ||
    (origin.name === 'Sassandra' && dest.name === 'San Pedro');

  // Flux pendulaires intra-Abidjan
  const isAbidjanCommute =
    origin.region === 'Abidjan' && dest.region === 'Abidjan';

  if (isNorthCorridor) return 3.0; // Corridor principal x3
  if (isWestCorridor) return 2.5;
  if (isCoastalCorridor) return 2.2;
  if (isAbidjanCommute) return 5.0; // Flux pendulaires massifs x5

  return 1.0;
}

/**
 * Obtient le volume de flux entre deux villes
 * @param {Map} mobilityMatrix
 * @param {string} originId
 * @param {string} destId
 * @returns {number}
 */
export function getFlow(mobilityMatrix, originId, destId) {
  const flowKey = `${originId}_${destId}`;
  return mobilityMatrix.get(flowKey) || 0;
}

/**
 * Obtient tous les flux sortants d'une ville
 * @param {Map} mobilityMatrix
 * @param {string} cityId
 * @returns {Array<{destId, volume}>}
 */
export function getOutflows(mobilityMatrix, cityId) {
  const outflows = [];

  for (const [key, volume] of mobilityMatrix.entries()) {
    const [originId, destId] = key.split('_');
    if (originId === cityId) {
      outflows.push({ destId, volume });
    }
  }

  return outflows;
}

/**
 * Obtient tous les flux entrants vers une ville
 * @param {Map} mobilityMatrix
 * @param {string} cityId
 * @returns {Array<{originId, volume}>}
 */
export function getInflows(mobilityMatrix, cityId) {
  const inflows = [];

  for (const [key, volume] of mobilityMatrix.entries()) {
    const [originId, destId] = key.split('_');
    if (destId === cityId) {
      inflows.push({ originId, volume });
    }
  }

  return inflows;
}

/**
 * Calcule l'indice de mobilité global (0-100)
 * @param {Map} mobilityMatrix
 * @returns {number}
 */
export function calculateMobilityIndex(mobilityMatrix) {
  const totalFlow = Array.from(mobilityMatrix.values()).reduce(
    (sum, val) => sum + val,
    0
  );

  // Normalisation : ~500,000 déplacements/jour = 100%
  const baselineFlow = 500000;
  return Math.min(100, (totalFlow / baselineFlow) * 100);
}

/**
 * Convertit la matrice en format pour visualisation (top N flux)
 * @param {Map} mobilityMatrix
 * @param {Array} cities
 * @param {number} topN - Nombre de flux à retourner
 * @returns {Array<{origin, dest, volume}>}
 */
export function getTopFlows(mobilityMatrix, cities, topN = 20) {
  const flows = [];

  for (const [key, volume] of mobilityMatrix.entries()) {
    const [originId, destId] = key.split('_');
    const origin = cities.find(c => c.id === originId);
    const dest = cities.find(c => c.id === destId);

    if (origin && dest) {
      flows.push({
        originId,
        destId,
        originName: origin.name,
        destName: dest.name,
        originCoords: origin.coordinates,
        destCoords: dest.coordinates,
        volume
      });
    }
  }

  // Trier par volume décroissant et prendre le top N
  return flows.sort((a, b) => b.volume - a.volume).slice(0, topN);
}
