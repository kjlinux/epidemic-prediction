/**
 * Modèle Épidémiologique SEIR Métapopulationnel
 * États: Susceptible → Exposé → Infecté → Retiré
 * Avec couplage de mobilité entre villes
 */

import { getFlow } from './MobilityGenerator.js';

/**
 * Classe principale du modèle épidémiologique
 */
export class EpidemicSimulation {
  constructor(cities, mobilityMatrix, params = {}) {
    this.cities = cities;
    this.mobilityMatrix = mobilityMatrix;

    // Paramètres épidémiologiques (calibrés sur COVID-19/Dengue)
    this.params = {
      beta: params.beta || 0.35, // Taux de transmission (contacts/jour × prob. infection)
      sigma: params.sigma || 1 / 5.1, // Taux d'incubation (1/durée latence en jours)
      gamma: params.gamma || 1 / 14, // Taux de guérison (1/durée infectiosité)
      mu: params.mu || 0.0001, // Facteur d'influence de la mobilité
      ...params
    };

    // ✅ Date de départ de la simulation (fixe)
    this.startDate = params.startDate || new Date('2025-06-01');

    // ✅ PHASE 2 : Sélectionner les foyers épidémiques AVANT d'initialiser les zones
    this.outbreakCityIds = this.selectInitialOutbreakCities(cities);

    // Initialisation des compartiments SEIR pour chaque ville
    this.zones = cities.map(city => this.initializeZone(city));

    // Historique pour graphiques temporels
    this.history = [];
    this.currentDay = 0;
  }

  /**
   * Sélectionne les 5 villes les plus peuplées comme foyers épidémiques initiaux
   */
  selectInitialOutbreakCities(cities) {
    // Trier par population décroissante
    const sorted = [...cities].sort((a, b) => b.population - a.population);

    // Prendre les 5 plus peuplées
    const outbreakCities = sorted.slice(0, 5);

    // Logging pour validation
    console.log('🦠 Foyers épidémiques initiaux:',
      outbreakCities.map(c => `${c.name} (${c.population.toLocaleString('fr-FR')} hab.)`).join(', ')
    );

    return new Set(outbreakCities.map(c => c.id));
  }

  /**
   * Initialise les compartiments SEIR d'une ville
   * ✅ PHASE 2 : Initialisation différenciée pour foyers vs villes saines
   */
  initializeZone(city) {
    const isOutbreakCity = this.outbreakCityIds.has(city.id);

    // Initialisation différenciée
    let initialInfected;
    if (isOutbreakCity) {
      // Foyers : 0.8-1.2% d'infections (variation aléatoire)
      const randomFactor = 0.8 + Math.random() * 0.4;
      initialInfected = city.population * 0.01 * randomFactor;
    } else {
      // Villes saines : 0 cas
      initialInfected = 0;
    }

    return {
      id: city.id,
      name: city.name,
      population: city.population,
      coordinates: city.coordinates,
      centrality: city.centrality,
      isOutbreakCity,  // ✅ Nouveau flag

      // Compartiments SEIR
      S: city.population - initialInfected, // Susceptibles
      E: 0, // Exposés (incubation)
      I: initialInfected, // Infectés
      R: 0, // Retirés (guéris + décédés)

      // Historique
      history: {
        S: [city.population - initialInfected],
        E: [0],
        I: [initialInfected],
        R: [0]
      }
    };
  }

  /**
   * Simule un pas de temps (1 jour)
   * @returns {Object} Métriques du jour
   */
  step() {
    const newStates = this.zones.map(zone => ({ ...zone }));

    for (let i = 0; i < this.zones.length; i++) {
      const zone = this.zones[i];
      const N = zone.population;

      // === Transmission locale (SEIR classique) ===
      const newExposed = (this.params.beta * zone.S * zone.I) / N;
      const newInfected = this.params.sigma * zone.E;
      const newRecovered = this.params.gamma * zone.I;

      // === Importation de cas via mobilité ===
      const importedCases = this.calculateImportedCases(zone.id);

      // === Mise à jour des compartiments ===
      newStates[i].S = Math.max(0, zone.S - newExposed);
      newStates[i].E = Math.max(0, zone.E + newExposed - newInfected);
      newStates[i].I = Math.max(0, zone.I + newInfected - newRecovered + importedCases);
      newStates[i].R = Math.max(0, zone.R + newRecovered);

      // Enregistrer dans l'historique
      newStates[i].history.S.push(newStates[i].S);
      newStates[i].history.E.push(newStates[i].E);
      newStates[i].history.I.push(newStates[i].I);
      newStates[i].history.R.push(newStates[i].R);
    }

    this.zones = newStates;
    this.currentDay++;

    // Enregistrer snapshot pour historique global
    const metrics = this.getMetrics();
    const currentDate = new Date(this.startDate);
    currentDate.setDate(currentDate.getDate() + this.currentDay);

    this.history.push({
      day: this.currentDay,
      date: currentDate,
      metrics
    });

    return metrics;
  }

  /**
   * Calcule les cas importés via la mobilité
   * Formule: Σ (I_j / N_j) × flux_j→i × μ
   */
  calculateImportedCases(zoneId) {
    let imported = 0;

    for (const originZone of this.zones) {
      if (originZone.id === zoneId) continue;

      const flow = getFlow(this.mobilityMatrix, originZone.id, zoneId);
      if (flow === 0) continue;

      // Prévalence dans la zone d'origine
      const prevalence = originZone.I / originZone.population;

      // Cas importés = prévalence × flux × facteur mobilité
      imported += prevalence * flow * this.params.mu;
    }

    return imported;
  }

  /**
   * Extrait les métriques pour le dashboard
   * @returns {Array} Métriques par zone
   * ✅ PHASE 3 : Ajout de quarantineStatus
   * ✅ PHASE 4 : Ajout de prediction7d et transitionProb
   */
  getMetrics() {
    return this.zones.map(zone => {
      const totalCases = zone.E + zone.I + zone.R;
      const activeCases = Math.round(zone.I);
      const prevalence = (zone.I / zone.population) * 100;

      // ✅ Calculer riskScore localement AVANT de l'utiliser
      const riskScore = this.calculateRiskScore(zone);
      const quarantineStatus = this.getQuarantineStatus(riskScore);

      // ✅ PHASE 4 : Ajouter les prédictions
      const prediction7d = this.getZonePrediction7d(zone.id);
      const transitionProb = this.calculateTransitionProbability(zone);

      return {
        id: zone.id,
        name: zone.name,
        coordinates: zone.coordinates,
        population: zone.population,
        activeCases,
        totalCases: Math.round(totalCases),
        prevalence: parseFloat(prevalence.toFixed(3)),
        riskScore,
        quarantineStatus,  // ✅ Phase 3
        prediction7d,       // ✅ Phase 4
        transitionProb,     // ✅ Phase 4
        S: Math.round(zone.S),
        E: Math.round(zone.E),
        I: Math.round(zone.I),
        R: Math.round(zone.R),
        history: zone.history  // ✅ Nécessaire pour les graphiques Phase 5
      };
    });
  }

  /**
   * Détermine le statut de quarantaine selon le score de risque
   * ✅ PHASE 3 : Nouvelle méthode
   */
  getQuarantineStatus(riskScore) {
    if (riskScore >= 85) return 'strict';     // Quarantaine stricte
    if (riskScore >= 60) return 'severe';     // Restrictions sévères
    if (riskScore >= 40) return 'moderate';   // Restrictions modérées
    return 'none';                            // Aucune restriction
  }

  /**
   * Calcule le score de risque (0-100) d'une zone
   * Basé sur: prévalence (40%), mobilité entrante (30%), capacité sanitaire (30%)
   */
  calculateRiskScore(zone) {
    // 1. Score de prévalence (0-40)
    const prevalence = zone.I / zone.population;
    const prevalenceScore = Math.min(prevalence * 10000, 40); // Normalisation

    // 2. Score de mobilité entrante (0-30)
    const totalInflow = this.getTotalInflow(zone.id);
    const mobilityScore = Math.min((totalInflow / 10000) * 30, 30);

    // 3. Score de capacité sanitaire (0-30)
    // Estimation simplifiée: zones avec faible centralité = moins de capacité
    const capacityScore = Math.max(0, 30 - (zone.centrality / 100) * 30);

    const totalScore = prevalenceScore + mobilityScore + capacityScore;
    return Math.min(Math.round(totalScore), 100);
  }

  /**
   * Calcule le flux total entrant vers une zone
   */
  getTotalInflow(zoneId) {
    let totalInflow = 0;

    for (const [key, volume] of this.mobilityMatrix.entries()) {
      const [, destId] = key.split('_');
      if (destId === zoneId) {
        totalInflow += volume;
      }
    }

    return totalInflow;
  }

  /**
   * Prédit le nombre de cas actifs dans une zone dans 7 jours
   * ✅ PHASE 4 : Nouvelle méthode pour prédiction J+7
   */
  getZonePrediction7d(zoneId) {
    const zone = this.zones.find(z => z.id === zoneId);

    // Retourner un objet complet même en cas d'historique insuffisant
    if (!zone || zone.history.I.length < 7) {
      return {
        prediction: 0,
        lower: 0,
        upper: 0,
        confidence: 0
      };
    }

    // 1. Tendance linéaire des 7 derniers jours
    const last7Days = zone.history.I.slice(-7);
    const avgGrowth = (last7Days[6] - last7Days[0]) / 7;

    // 2. Impact de la mobilité entrante
    const inflowFromInfectedZones = this.calculateInflowFromInfectedZones(zoneId);
    const mobilityImpact = inflowFromInfectedZones * this.params.mu * 7;

    // 3. Prédiction de base
    let prediction = zone.I + (avgGrowth * 7) + mobilityImpact;

    // 4. Ajustement selon le statut de quarantaine
    const quarantineStatus = this.getQuarantineStatus(this.calculateRiskScore(zone));
    if (quarantineStatus === 'strict') {
      prediction *= 0.6;  // Réduction de 40% si quarantaine
    } else if (quarantineStatus === 'severe') {
      prediction *= 0.8;  // Réduction de 20% si restrictions sévères
    }

    // 5. Limites réalistes
    prediction = Math.max(0, Math.min(prediction, zone.population * 0.15));

    // 6. Intervalle de confiance (±15%)
    const confidenceInterval = prediction * 0.15;

    return {
      prediction: Math.round(prediction),
      lower: Math.round(prediction - confidenceInterval),
      upper: Math.round(prediction + confidenceInterval),
      confidence: 0.85  // 85% de confiance
    };
  }

  /**
   * Calcule l'afflux de cas depuis les zones infectées
   * ✅ PHASE 4 : Méthode auxiliaire pour prédiction
   */
  calculateInflowFromInfectedZones(zoneId) {
    let totalInflow = 0;
    for (const originZone of this.zones) {
      if (originZone.id === zoneId) continue;
      const flow = getFlow(this.mobilityMatrix, originZone.id, zoneId);
      const prevalence = originZone.I / originZone.population;
      totalInflow += flow * prevalence;
    }
    return totalInflow;
  }

  /**
   * Calcule la probabilité de transition vers un niveau de risque supérieur
   * ✅ PHASE 4 : Nouvelle méthode pour probabilité de transition
   */
  calculateTransitionProbability(zone) {
    const currentRisk = this.calculateRiskScore(zone);

    // Gérer le cas où le risque est déjà maximal
    if (currentRisk >= 85) {
      return {
        probability: 0,  // Pas de transition possible au-delà de critique
        targetThreshold: 100,
        factors: { trend: 0, affluence: 0, risk: 0, capacity: 0 }
      };
    }

    // Déterminer la transition à calculer
    let targetThreshold;
    if (currentRisk < 40) {
      targetThreshold = 40;  // Vert → Orange
    } else if (currentRisk < 60) {
      targetThreshold = 60;  // Orange → Rouge
    } else {
      targetThreshold = 85;  // Rouge → Critique
    }

    // Retourner un objet complet si historique insuffisant
    if (zone.history.I.length < 7) {
      return {
        probability: 0,
        targetThreshold,
        factors: { trend: 0, affluence: 0, risk: 0, capacity: 0 }
      };
    }

    // === Facteur 1 : Tendance (35%) ===
    const last7Days = zone.history.I.slice(-7);

    // Éviter division par zéro
    let trendFactor = 0;
    if (zone.I > 0) {
      const avgDailyGrowth = (last7Days[6] - last7Days[0]) / (7 * zone.I);
      trendFactor = Math.max(0, Math.min(avgDailyGrowth * 100, 1.0));  // Clamp entre [0, 1]
    }

    // === Facteur 2 : Affluence depuis zones à risque (25%) ===
    const inflowFromRedZones = this.zones
      .filter(z => this.calculateRiskScore(z) > 60)
      .reduce((sum, z) => {
        const flow = getFlow(this.mobilityMatrix, z.id, zone.id);
        return sum + flow;
      }, 0);
    const totalInflow = this.zones
      .filter(z => z.id !== zone.id)
      .reduce((sum, z) => sum + getFlow(this.mobilityMatrix, z.id, zone.id), 0);
    const affluenceFactor = totalInflow > 0 ? inflowFromRedZones / totalInflow : 0;

    // === Facteur 3 : Proximité du seuil (25%) ===
    const distanceToThreshold = targetThreshold - currentRisk;
    const riskFactor = distanceToThreshold < 20
      ? Math.max(0, 1 - (distanceToThreshold / 20))  // Plus proche = plus probable
      : 0;

    // === Facteur 4 : Capacité sanitaire (15%) ===
    const capacityFactor = 1 - (zone.centrality / 100);  // Centralité faible = risque élevé

    // === Calcul final ===
    const probability = (
      0.35 * trendFactor +
      0.25 * affluenceFactor +
      0.25 * riskFactor +
      0.15 * capacityFactor
    ) * 100;

    return {
      probability: Math.round(Math.min(probability, 99)),  // Max 99%
      targetThreshold,
      factors: {
        trend: Math.round(trendFactor * 100),
        affluence: Math.round(affluenceFactor * 100),
        risk: Math.round(riskFactor * 100),
        capacity: Math.round(capacityFactor * 100)
      }
    };
  }

  /**
   * Obtient les métriques globales (tous pays)
   * @returns {Object}
   */
  getGlobalMetrics() {
    const totalActiveCases = this.zones.reduce((sum, z) => sum + z.I, 0);
    const totalCases = this.zones.reduce((sum, z) => sum + z.E + z.I + z.R, 0);
    const totalRecovered = this.zones.reduce((sum, z) => sum + z.R, 0);

    // Nombre de zones à risque élevé (score > 70)
    const metrics = this.getMetrics();
    const highRiskZones = metrics.filter(m => m.riskScore > 70).length;

    // Tendance (variation sur 7 derniers jours si disponible)
    let caseTrend = 0;
    if (this.history.length >= 7) {
      const last7Days = this.history.slice(-7);
      const casesNow = totalActiveCases;
      const cases7DaysAgo = last7Days[0].metrics.reduce((sum, m) => sum + m.activeCases, 0);
      caseTrend = cases7DaysAgo > 0 ? ((casesNow - cases7DaysAgo) / cases7DaysAgo) * 100 : 0;
    }

    return {
      totalActiveCases: Math.round(totalActiveCases),
      totalCases: Math.round(totalCases),
      totalRecovered: Math.round(totalRecovered),
      highRiskZones,
      caseTrend: parseFloat(caseTrend.toFixed(1)),
      currentDay: this.currentDay
    };
  }

  /**
   * Réinitialise la simulation
   */
  reset() {
    this.zones = this.cities.map(city => this.initializeZone(city));
    this.history = [];
    this.currentDay = 0;
  }

  /**
   * Modifie les paramètres épidémiologiques
   * @param {Object} newParams - Nouveaux paramètres partiels
   */
  updateParams(newParams) {
    this.params = { ...this.params, ...newParams };
  }

  /**
   * Génère des prédictions à J+7 et J+14
   * Utilise un modèle avec fluctuations réalistes basées sur la mobilité et les dynamiques de population
   * @returns {Object} { prediction7d, prediction14d }
   */
  getPredictions() {
    if (this.history.length < 7) {
      return { prediction7d: 0, prediction14d: 0 };
    }

    // Calculer la tendance sur les 7 derniers jours
    const recent = this.history.slice(-7);
    const totalCasesRecent = recent.map(h =>
      h.metrics.reduce((sum, m) => sum + m.activeCases, 0)
    );

    // Régression linéaire simple pour la tendance de base
    const avgGrowth =
      (totalCasesRecent[6] - totalCasesRecent[0]) / 7;

    const currentCases = totalCasesRecent[6];

    // Calculer les facteurs de fluctuation basés sur la mobilité et les zones à risque
    const mobilityFactor = this.calculateMobilityImpact();
    const riskZonesFactor = this.calculateRiskZonesImpact();
    const seasonalFactor = this.calculateSeasonalFactor();

    // Combiner les facteurs pour créer des fluctuations réalistes
    // Les villes avec forte mobilité peuvent voir des pics suivis de baisses
    const fluctuation7d = (mobilityFactor + riskZonesFactor + seasonalFactor) / 3;
    const fluctuation14d = (mobilityFactor * 0.8 + riskZonesFactor * 0.9 + seasonalFactor * 1.1) / 3;

    // Appliquer les fluctuations à la tendance de base
    const prediction7d = Math.max(0, Math.round(
      currentCases + (avgGrowth * 7 * (1 + fluctuation7d))
    ));

    const prediction14d = Math.max(0, Math.round(
      currentCases + (avgGrowth * 14 * (1 + fluctuation14d))
    ));

    return {
      prediction7d,
      prediction14d,
      confidenceInterval: 0.15 // ±15%
    };
  }

  /**
   * Calcule l'impact de la mobilité sur les prédictions
   * Retourne un facteur entre -0.3 et 0.3
   */
  calculateMobilityImpact() {
    // Calculer la mobilité moyenne des zones
    const totalMobilityFlows = Array.from(this.mobilityMatrix.values())
      .reduce((sum, flow) => sum + flow, 0);

    const avgMobility = totalMobilityFlows / Math.max(this.zones.length, 1);

    // Normaliser et créer un facteur de fluctuation
    // Forte mobilité peut causer des pics temporaires puis des stabilisations
    const mobilityScore = Math.min(avgMobility / 5000, 1);

    // Oscillation sinusoïdale basée sur le jour actuel
    const oscillation = Math.sin(this.currentDay * 0.5) * 0.2;

    return (mobilityScore - 0.5) * 0.6 + oscillation;
  }

  /**
   * Calcule l'impact des zones à risque sur les prédictions
   * Retourne un facteur entre -0.2 et 0.4
   */
  calculateRiskZonesImpact() {
    const metrics = this.getMetrics();
    const highRiskZones = metrics.filter(m => m.riskScore > 70);
    const mediumRiskZones = metrics.filter(m => m.riskScore > 40 && m.riskScore <= 70);

    // Plus de zones à risque = plus de variations potentielles
    const riskRatio = (highRiskZones.length * 2 + mediumRiskZones.length) / metrics.length;

    // Les zones à risque peuvent causer des hausses mais aussi des baisses
    // (dues à des mesures de confinement, réduction de mobilité, etc.)
    const baseImpact = (riskRatio - 0.3) * 0.8;

    // Ajouter une composante cyclique
    const cyclicVariation = Math.cos(this.currentDay * 0.3) * 0.3;

    return Math.max(-0.2, Math.min(0.4, baseImpact + cyclicVariation));
  }

  /**
   * Calcule le facteur saisonnier
   * Retourne un facteur entre -0.2 et 0.2
   */
  calculateSeasonalFactor() {
    // Simulation de facteurs saisonniers et hebdomadaires
    const weekCycle = Math.sin((this.currentDay % 7) * Math.PI / 3.5) * 0.1;
    const monthCycle = Math.cos(this.currentDay * 0.1) * 0.15;

    return weekCycle + monthCycle * 0.5;
  }
}

/**
 * Simule N jours d'épidémie
 * @param {EpidemicSimulation} simulation
 * @param {number} days
 * @returns {Array} Historique complet
 */
export function simulateDays(simulation, days) {
  const results = [];

  for (let i = 0; i < days; i++) {
    const metrics = simulation.step();
    results.push({
      day: simulation.currentDay,
      metrics,
      global: simulation.getGlobalMetrics()
    });
  }

  return results;
}
