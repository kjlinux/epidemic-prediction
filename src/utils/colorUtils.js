/**
 * Utilitaires de couleurs pour le dashboard
 * Échelles de risque, dégradés, etc.
 */

/**
 * Obtient la couleur selon le score de risque (0-100)
 * Gradient : Vert → Jaune → Orange → Rouge
 * @param {number} riskScore - Score entre 0 et 100
 * @returns {string} Code couleur hexadécimal
 */
export function getRiskColor(riskScore) {
  if (riskScore < 20) return '#4caf50'; // Vert (très faible)
  if (riskScore < 40) return '#8bc34a'; // Vert clair (faible)
  if (riskScore < 60) return '#ffc107'; // Jaune (moyen-faible)
  if (riskScore < 75) return '#ff9800'; // Orange clair (moyen)
  if (riskScore < 85) return '#fa7e19'; // Orange (moyen-élevé)
  if (riskScore < 95) return '#ff5252'; // Rouge (élevé)
  return '#d32f2f'; // Rouge foncé (critique)
}

/**
 * Obtient la couleur RGBA selon le score de risque
 * @param {number} riskScore - Score entre 0 et 100
 * @param {number} alpha - Transparence (0-1)
 * @returns {Array} [r, g, b, a]
 */
export function getRiskColorRGBA(riskScore, alpha = 255) {
  const color = getRiskColor(riskScore);
  const rgb = hexToRgb(color);
  return [rgb.r, rgb.g, rgb.b, alpha];
}

/**
 * Convertit hexadécimal en RGB
 * @param {string} hex - Code couleur hexadécimal
 * @returns {Object} { r, g, b }
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Obtient le label textuel du niveau de risque
 * @param {number} riskScore - Score entre 0 et 100
 * @returns {string}
 */
export function getRiskLabel(riskScore) {
  if (riskScore < 20) return 'Très faible';
  if (riskScore < 40) return 'Faible';
  if (riskScore < 60) return 'Moyen';
  if (riskScore < 75) return 'Moyen-élevé';
  if (riskScore < 85) return 'Élevé';
  if (riskScore < 95) return 'Très élevé';
  return 'Critique';
}

/**
 * Obtient la classe CSS du badge de risque
 * @param {number} riskScore - Score entre 0 et 100
 * @returns {string}
 */
export function getRiskBadgeClass(riskScore) {
  if (riskScore < 40) return 'badge--risk-low';
  if (riskScore < 75) return 'badge--risk-medium';
  return 'badge--risk-high';
}

/**
 * Interpolation linéaire entre deux couleurs
 * @param {Array} color1 - [r, g, b]
 * @param {Array} color2 - [r, g, b]
 * @param {number} factor - Facteur d'interpolation (0-1)
 * @returns {Array} [r, g, b]
 */
export function interpolateColor(color1, color2, factor) {
  const result = color1.slice();
  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
  }
  return result;
}

/**
 * Palette de couleurs Orange pour les graphiques
 */
export const ORANGE_PALETTE = {
  primary: '#fa7e19',
  light: '#ffb380',
  dark: '#d96a0f',
  pale: 'rgba(250, 126, 25, 0.1)',
  transparent: 'rgba(250, 126, 25, 0.3)'
};

/**
 * Palette de couleurs de risque
 */
export const RISK_COLORS = {
  veryLow: '#4caf50',
  low: '#8bc34a',
  mediumLow: '#ffc107',
  medium: '#ff9800',
  mediumHigh: '#fa7e19',
  high: '#ff5252',
  critical: '#d32f2f'
};
