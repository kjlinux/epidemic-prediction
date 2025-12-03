/**
 * Utilitaires géographiques
 * Calculs de distance, coordonnées, etc.
 */

/**
 * Calcule la distance entre deux points GPS (formule de Haversine)
 * @param {Array} coord1 - [latitude, longitude]
 * @param {Array} coord2 - [latitude, longitude]
 * @returns {number} Distance en kilomètres
 */
export function haversineDistance(coord1, coord2) {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;

  const R = 6371; // Rayon de la Terre en km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convertit des degrés en radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calcule le centroïde d'un ensemble de coordonnées
 * @param {Array<Array>} coordinates - Tableau de [lat, lon]
 * @returns {Array} [latitude, longitude] du centroïde
 */
export function calculateCentroid(coordinates) {
  if (!coordinates || coordinates.length === 0) {
    return [0, 0];
  }

  const sum = coordinates.reduce(
    (acc, coord) => {
      return [acc[0] + coord[0], acc[1] + coord[1]];
    },
    [0, 0]
  );

  return [sum[0] / coordinates.length, sum[1] / coordinates.length];
}

/**
 * Vérifie si un point est dans un rayon donné d'un autre point
 * @param {Array} center - [lat, lon] du centre
 * @param {Array} point - [lat, lon] du point à tester
 * @param {number} radius - Rayon en km
 * @returns {boolean}
 */
export function isWithinRadius(center, point, radius) {
  return haversineDistance(center, point) <= radius;
}

/**
 * Calcule les limites géographiques (bounding box) d'un ensemble de points
 * @param {Array<Array>} coordinates - Tableau de [lat, lon]
 * @returns {Object} { minLat, maxLat, minLon, maxLon }
 */
export function calculateBounds(coordinates) {
  if (!coordinates || coordinates.length === 0) {
    return { minLat: 0, maxLat: 0, minLon: 0, maxLon: 0 };
  }

  const lats = coordinates.map(c => c[0]);
  const lons = coordinates.map(c => c[1]);

  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons)
  };
}

/**
 * Convertit des coordonnées [lat, lon] en [lon, lat] pour certaines bibliothèques
 * @param {Array} coord - [latitude, longitude]
 * @returns {Array} [longitude, latitude]
 */
export function swapCoordinates(coord) {
  return [coord[1], coord[0]];
}
