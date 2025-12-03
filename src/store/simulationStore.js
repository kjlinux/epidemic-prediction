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
    const mobilityMatrix = generateMobilityMatrix(ivoryCoastCities, new Date());
    const simulation = new EpidemicSimulation(ivoryCoastCities, mobilityMatrix);

    // Simuler 60 jours initiaux pour avoir de l'historique
    for (let i = 0; i < 60; i++) {
      simulation.step();
    }

    const metrics = simulation.getMetrics();
    const global = simulation.getGlobalMetrics();
    const mobilityIndex = calculateMobilityIndex(mobilityMatrix);

    // Ajouter variation24h = 0 pour l'initialisation
    const metricsWithVariation = metrics.map(zone => ({
      ...zone,
      variation24h: 0
    }));

    set({
      simulation,
      mobilityMatrix,
      currentMetrics: metricsWithVariation,
      globalMetrics: global,
      mobilityIndex,
      isRunning: true,
      currentDate: new Date()
    });

    console.log('✅ Simulation initialisée avec', ivoryCoastCities.length, 'villes');
    console.log('📊 Cas actifs totaux:', global.totalActiveCases);
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

    set(state => ({
      currentMetrics: metricsWithVariation,
      globalMetrics: global,
      currentDate: nextDate,
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

      set({
        currentMetrics: metrics,
        globalMetrics: global,
        currentDate: new Date(),
        alerts: [],
        isRunning: true
      });
    }
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
   */
  generateAlerts: metrics => {
    const alerts = [];
    const now = new Date();

    metrics.forEach(zone => {
      // Alerte: Nouvelle zone à risque élevé
      if (zone.riskScore > 85 && Math.random() < 0.3) {
        alerts.push({
          id: `alert-${Date.now()}-${zone.id}`,
          type: 'risk',
          priority: 'critical',
          zone: zone.name,
          message: `Nouvelle zone à risque critique détectée: ${zone.name}`,
          timestamp: now,
          data: { riskScore: zone.riskScore }
        });
      }

      // Alerte: Augmentation rapide des cas
      if (zone.activeCases > zone.population * 0.05 && Math.random() < 0.2) {
        alerts.push({
          id: `alert-${Date.now()}-cases-${zone.id}`,
          type: 'cases',
          priority: 'high',
          zone: zone.name,
          message: `Augmentation significative des cas à ${zone.name}: ${zone.activeCases} cas actifs`,
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
