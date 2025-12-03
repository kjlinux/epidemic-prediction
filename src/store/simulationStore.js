/**
 * Store Zustand - Gestion d'état global de la simulation
 */

import { create } from 'zustand';
import { EpidemicSimulation } from '../simulation/EpidemicModel.js';
import { generateMobilityMatrix, calculateMobilityIndex } from '../simulation/MobilityGenerator.js';
import { ivoryCoastCities } from '../data/ivoryCoastCities.js';

export const useSimulationStore = create((set, get) => ({
  // === État ===
  simulation: null,
  currentMetrics: null,
  globalMetrics: null,
  mobilityMatrix: null,
  baseMobilityMatrix: null, // ✅ Matrice de base pour calculer l'indice relatif
  mobilityIndex: 0,
  isRunning: false,
  simulationSpeed: 1, // 1x, 2x, 5x
  currentDate: new Date(),
  alerts: [],

  // === Actions ===

  /**
   * Initialise la simulation
   */
  initialize: () => {
    // ✅ Démarrer depuis le 1er juin 2025
    const startDate = new Date('2025-06-01');
    const baseMobilityMatrix = generateMobilityMatrix(ivoryCoastCities, startDate);
    const simulation = new EpidemicSimulation(ivoryCoastCities, baseMobilityMatrix, { startDate });

    // ✅ Calculer le nombre de jours entre le 1er juin 2025 et aujourd'hui (3 décembre 2025)
    const today = new Date('2025-12-03'); // Date d'aujourd'hui
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

    console.log(`🗓️ Simulation de l'historique: ${daysSinceStart} jours (du 1er juin 2025 au 3 décembre 2025)`);

    // Simuler tout l'historique jusqu'à aujourd'hui
    for (let i = 0; i < daysSinceStart; i++) {
      simulation.step();
    }

    const metrics = simulation.getMetrics();
    const global = simulation.getGlobalMetrics();

    // ✅ Calculer l'indice de mobilité initial (100% au départ)
    const mobilityIndex = 100;

    // Ajouter variation24h = 0 pour l'initialisation
    const metricsWithVariation = metrics.map(zone => ({
      ...zone,
      variation24h: 0
    }));

    set({
      simulation,
      mobilityMatrix: baseMobilityMatrix,
      baseMobilityMatrix, // ✅ Stocker la matrice de base
      currentMetrics: metricsWithVariation,
      globalMetrics: global,
      mobilityIndex,
      isRunning: true,
      currentDate: today // ✅ Date actuelle = aujourd'hui
    });

    console.log('✅ Simulation initialisée avec', ivoryCoastCities.length, 'villes');
    console.log('📊 Cas actifs totaux:', global.totalActiveCases);
    console.log('📅 Date actuelle:', today.toLocaleDateString('fr-FR'));
  },

  /**
   * Avance la simulation d'un jour
   */
  stepSimulation: () => {
    const { simulation, currentDate, currentMetrics: previousMetrics } = get();
    if (!simulation) return;

    const metrics = simulation.step();
    const global = simulation.getGlobalMetrics();

    // Calculer variation 24h pour chaque zone
    const metricsWithVariation = metrics.map(zone => {
      const variation24h = get().calculateVariation24h(zone.id, zone.activeCases, previousMetrics);
      return { ...zone, variation24h };
    });

    // Générer des alertes si nécessaire
    const newAlerts = get().generateAlerts(metricsWithVariation);

    // Mise à jour de la date
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Recalculer la mobilityMatrix en temps réel en tenant compte des risques
    const updatedMobilityMatrix = get().updateMobilityMatrix(metricsWithVariation, nextDate);

    // ✅ Calculer l'indice de mobilité comme % du flux de base
    const baseMobilityMatrix = get().baseMobilityMatrix;
    const mobilityIndex = get().calculateRelativeMobilityIndex(updatedMobilityMatrix, baseMobilityMatrix);

    set(state => ({
      currentMetrics: metricsWithVariation,
      globalMetrics: global,
      currentDate: nextDate,
      mobilityMatrix: updatedMobilityMatrix,
      mobilityIndex,
      alerts: [...state.alerts, ...newAlerts].slice(-10) // Garder 10 dernières alertes
    }));
  },

  /**
   * Toggle play/pause
   */
  toggleSimulation: () => {
    set(state => ({ isRunning: !state.isRunning }));
  },

  /**
   * Change la vitesse de simulation
   */
  setSimulationSpeed: speed => {
    set({ simulationSpeed: speed });
  },

  /**
   * Réinitialise la simulation
   */
  reset: () => {
    const { simulation } = get();
    if (simulation) {
      simulation.reset();

      // Re-simuler 60 jours d'historique
      for (let i = 0; i < 60; i++) {
        simulation.step();
      }

      const metrics = simulation.getMetrics();
      const global = simulation.getGlobalMetrics();

      // Recalculer la mobilityMatrix basée sur l'état actuel
      const currentDate = new Date();
      const updatedMobilityMatrix = get().updateMobilityMatrix(metrics, currentDate);
      const baseMobilityMatrix = get().baseMobilityMatrix;
      const mobilityIndex = get().calculateRelativeMobilityIndex(updatedMobilityMatrix, baseMobilityMatrix);

      set({
        currentMetrics: metrics,
        globalMetrics: global,
        mobilityMatrix: updatedMobilityMatrix,
        mobilityIndex,
        currentDate,
        alerts: [],
        isRunning: true
      });
    }
  },

  /**
   * Calcule l'indice de mobilité relatif (pourcentage du flux de base)
   * ✅ Permet de voir l'impact des restrictions en temps réel
   */
  calculateRelativeMobilityIndex: (currentMatrix, baseMatrix) => {
    if (!currentMatrix || !baseMatrix) return 100;

    const currentFlow = Array.from(currentMatrix.values()).reduce(
      (sum, val) => sum + val,
      0
    );
    const baseFlow = Array.from(baseMatrix.values()).reduce(
      (sum, val) => sum + val,
      0
    );

    if (baseFlow === 0) return 0;

    // Calculer le pourcentage du flux de base
    const relativeIndex = (currentFlow / baseFlow) * 100;
    return Math.round(Math.max(0, Math.min(100, relativeIndex)));
  },

  /**
   * Met à jour la matrice de mobilité en fonction des risques épidémiologiques
   * Les zones à haut risque voient leur mobilité réduite
   * ✅ PHASE 3 : Quarantaine stricte à partir de risque ≥ 85
   */
  updateMobilityMatrix: (currentMetrics, currentDate) => {
    // Générer la matrice de base avec facteurs saisonniers
    const baseMobilityMatrix = generateMobilityMatrix(ivoryCoastCities, currentDate);
    const adjustedMatrix = new Map();

    // ✅ Fonction de réduction améliorée basée sur quarantineStatus
    const getReductionFactor = (quarantineStatus) => {
      switch (quarantineStatus) {
        case 'none':     return 1.0;   // 100% mobilité
        case 'moderate': return 0.7;   // -30%
        case 'severe':   return 0.3;   // -70%
        case 'strict':   return 0.05;  // -95% (QUARANTAINE)
        default:         return 1.0;
      }
    };

    // Ajuster chaque flux en fonction des statuts de quarantaine
    for (const [key, baseFlow] of baseMobilityMatrix.entries()) {
      const [originId, destId] = key.split('_');
      const originMetrics = currentMetrics.find(m => m.id === originId);
      const destMetrics = currentMetrics.find(m => m.id === destId);

      // ✅ Isolement total : bloquer flux entrants ET sortants
      const originFactor = getReductionFactor(originMetrics?.quarantineStatus || 'none');
      const destFactor = getReductionFactor(destMetrics?.quarantineStatus || 'none');

      // Utiliser le facteur le plus restrictif
      const combinedFactor = Math.min(originFactor, destFactor);

      const adjustedFlow = Math.round(baseFlow * combinedFactor);

      // ✅ Seuil minimum réduit pour garder le flux (5 au lieu de 10)
      // Les flux tombent à 0 automatiquement lors de quarantaine stricte
      if (adjustedFlow > 5) {
        adjustedMatrix.set(key, adjustedFlow);
      }
    }

    return adjustedMatrix;
  },

  /**
   * Calcule la variation 24h d'une zone
   */
  calculateVariation24h: (zoneId, currentCases, previousMetrics) => {
    if (!previousMetrics) return 0;

    const previousZone = previousMetrics.find(m => m.id === zoneId);
    if (!previousZone || previousZone.activeCases === 0) return 0;

    const variation = ((currentCases - previousZone.activeCases) / previousZone.activeCases) * 100;
    return parseFloat(variation.toFixed(1));
  },

  /**
   * Génère des alertes basées sur les métriques
   * ✅ PHASE 3 : Alertes de quarantaine ajoutées
   */
  generateAlerts: metrics => {
    const alerts = [];
    const now = new Date();

    metrics.forEach(zone => {
      // ✅ PHASE 3 : Alerte de quarantaine stricte
      if (zone.quarantineStatus === 'strict' && zone.riskScore >= 85) {
        alerts.push({
          id: `quarantine-${zone.id}-${Date.now()}`,
          type: 'quarantine',
          priority: 'critical',
          zone: zone.name,
          message: `Quarantaine stricte : ${zone.name} placée en isolement total (risque: ${zone.riskScore}/100)`,
          timestamp: now,
          data: { riskScore: zone.riskScore, quarantineStatus: zone.quarantineStatus }
        });
      }

      // ✅ PHASE 3 : Alerte d'approche du seuil critique
      if (zone.riskScore >= 80 && zone.riskScore < 85 && Math.random() < 0.25) {
        alerts.push({
          id: `warning-${zone.id}-${Date.now()}`,
          type: 'warning',
          priority: 'high',
          zone: zone.name,
          message: `Seuil critique approché : ${zone.name} - risque ${zone.riskScore}/100 - quarantaine imminente`,
          timestamp: now,
          data: { riskScore: zone.riskScore }
        });
      }

      // Alerte: Nouvelle zone à risque élevé
      if (zone.riskScore > 70 && zone.riskScore < 80 && Math.random() < 0.2) {
        alerts.push({
          id: `alert-${Date.now()}-${zone.id}`,
          type: 'risk',
          priority: 'high',
          zone: zone.name,
          message: `Zone à risque élevé détectée: ${zone.name} (risque: ${zone.riskScore}/100)`,
          timestamp: now,
          data: { riskScore: zone.riskScore }
        });
      }

      // Alerte: Augmentation rapide des cas
      if (zone.activeCases > zone.population * 0.05 && Math.random() < 0.15) {
        alerts.push({
          id: `alert-${Date.now()}-cases-${zone.id}`,
          type: 'cases',
          priority: 'medium',
          zone: zone.name,
          message: `Augmentation significative des cas à ${zone.name}: ${zone.activeCases.toLocaleString('fr-FR')} cas actifs`,
          timestamp: now,
          data: { activeCases: zone.activeCases }
        });
      }
    });

    return alerts;
  },

  // === Sélecteurs ===

  /**
   * Obtient les métriques d'une zone spécifique
   */
  getZoneMetrics: zoneId => {
    const { currentMetrics } = get();
    return currentMetrics?.find(m => m.id === zoneId);
  },

  /**
   * Obtient les N zones avec le risque le plus élevé
   */
  getTopRiskZones: (limit = 10) => {
    const { currentMetrics } = get();
    if (!currentMetrics) return [];

    return [...currentMetrics]
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, limit);
  },

  /**
   * Obtient l'historique pour les graphiques
   */
  getHistoricalData: () => {
    const { simulation } = get();
    if (!simulation || !simulation.history) return [];

    return simulation.history.map(h => ({
      day: h.day,
      date: h.date,
      totalCases: h.metrics.reduce((sum, m) => sum + m.activeCases, 0),
      newCases: Math.round(Math.random() * 100 + 50), // Simplifié pour l'instant
      topRiskZones: h.metrics
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 5)
        .map(m => m.name)
    }));
  },

  /**
   * Obtient les prédictions J+7 et J+14
   */
  getPredictions: () => {
    const { simulation } = get();
    if (!simulation) return { prediction7d: 0, prediction14d: 0 };

    return simulation.getPredictions();
  }
}));
