/**
 * Utilitaires statistiques
 * Calculs de moyennes, lissage, etc.
 */

/**
 * Lissage exponentiel (pour transitions fluides)
 * @param {number} previous - Valeur précédente
 * @param {number} current - Valeur actuelle
 * @param {number} alpha - Facteur de lissage (0-1), défaut 0.3
 * @returns {number}
 */
export function exponentialSmoothing(previous, current, alpha = 0.3) {
  if (previous === null || previous === undefined) {
    return current;
  }
  return previous * (1 - alpha) + current * alpha;
}

/**
 * Moyenne mobile simple
 * @param {Array<number>} values - Tableau de valeurs
 * @param {number} window - Taille de la fenêtre
 * @returns {Array<number>}
 */
export function movingAverage(values, window = 3) {
  if (!values || values.length === 0) return [];

  const result = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    const avg = slice.reduce((sum, val) => sum + val, 0) / slice.length;
    result.push(avg);
  }
  return result;
}

/**
 * Calcule la variation en pourcentage
 * @param {number} current - Valeur actuelle
 * @param {number} previous - Valeur précédente
 * @returns {number} Pourcentage de variation
 */
export function percentageChange(current, previous) {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Génère un nombre aléatoire selon une distribution normale (Box-Muller)
 * @param {number} mean - Moyenne
 * @param {number} stdDev - Écart-type
 * @returns {number}
 */
export function randomNormal(mean = 0, stdDev = 1) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z0 * stdDev;
}

/**
 * Génère un nombre aléatoire selon une distribution log-normale
 * Utilisé pour les intervalles irréguliers (2-8s)
 * @param {number} min - Valeur minimale
 * @param {number} max - Valeur maximale
 * @returns {number}
 */
export function randomLogNormal(min, max) {
  const mean = (min + max) / 2;
  const variance = (max - min) / 6; // 99.7% des valeurs dans [min, max]
  const value = randomNormal(mean, variance);
  return Math.max(min, Math.min(max, value));
}

/**
 * Clamp (limite) une valeur entre min et max
 * @param {number} value - Valeur à limiter
 * @param {number} min - Minimum
 * @param {number} max - Maximum
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Normalise une valeur dans une plage [0, 1]
 * @param {number} value - Valeur à normaliser
 * @param {number} min - Valeur minimale de la plage source
 * @param {number} max - Valeur maximale de la plage source
 * @returns {number}
 */
export function normalize(value, min, max) {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

/**
 * Calcule la médiane d'un tableau
 * @param {Array<number>} values
 * @returns {number}
 */
export function median(values) {
  if (!values || values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Calcule l'écart-type
 * @param {Array<number>} values
 * @returns {number}
 */
export function standardDeviation(values) {
  if (!values || values.length === 0) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;

  return Math.sqrt(variance);
}

/**
 * Formatage de nombres avec séparateurs de milliers
 * @param {number} value
 * @returns {string}
 */
export function formatNumber(value) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(value));
}

/**
 * Formatage de pourcentages
 * @param {number} value
 * @param {number} decimals - Nombre de décimales
 * @returns {string}
 */
export function formatPercentage(value, decimals = 1) {
  return value.toFixed(decimals) + '%';
}
