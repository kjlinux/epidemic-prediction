/**
 * Hook de simulation en temps réel
 * Gère les intervalles irréguliers et les mises à jour du store
 */

import { useEffect, useRef, useState } from 'react';
import { useSimulationStore } from '../store/simulationStore.js';
import { randomLogNormal } from '../utils/statsUtils.js';

/**
 * Hook principal de simulation temps réel
 * @param {Object} config - Configuration optionnelle
 * @returns {Object} { isRunning, speed, toggle, setSpeed, reset }
 */
export function useRealtimeSimulation(config = {}) {
  const {
    minInterval = 3000, // 3 secondes minimum
    maxInterval = 6000, // 6 secondes maximum
    enableRandomEvents = true
  } = config;

  const timeoutRef = useRef(null);

  // Store Zustand
  const isRunning = useSimulationStore(state => state.isRunning);
  const simulationSpeed = useSimulationStore(state => state.simulationSpeed);
  const stepSimulation = useSimulationStore(state => state.stepSimulation);
  const toggleSimulation = useSimulationStore(state => state.toggleSimulation);
  const setSimulationSpeed = useSimulationStore(state => state.setSimulationSpeed);
  const resetSimulation = useSimulationStore(state => state.reset);

  /**
   * Génère le prochain intervalle irrégulier (distribution log-normale)
   * Ajusté selon la vitesse de simulation
   */
  const getNextInterval = () => {
    const baseInterval = randomLogNormal(minInterval, maxInterval);
    return baseInterval / simulationSpeed;
  };

  /**
   * Déclenche aléatoirement des événements (pics de mobilité, nouveaux foyers)
   */
  const triggerRandomEvent = () => {
    if (!enableRandomEvents) return;

    const eventProbability = 0.1; // 10% de chance par tick

    if (Math.random() < eventProbability) {
      const eventTypes = [
        {
          type: 'mobility_spike',
          message: 'Pic de mobilité détecté (événement, marché)',
          action: simulation => {
            // Temporairement augmenter le facteur de mobilité
            simulation.updateParams({ mu: simulation.params.mu * 1.5 });
            setTimeout(() => {
              simulation.updateParams({ mu: simulation.params.mu / 1.5 });
            }, 5000);
          }
        },
        {
          type: 'new_outbreak',
          message: 'Nouveau foyer épidémique détecté',
          action: simulation => {
            // Ajouter des cas dans une zone aléatoire
            const randomZone = simulation.zones[Math.floor(Math.random() * simulation.zones.length)];
            randomZone.I += Math.random() * 50 + 20;
          }
        }
      ];

      const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      console.log(`🎲 [Random Event] ${event.type}: ${event.message}`);

      const simulation = useSimulationStore.getState().simulation;
      if (simulation) {
        event.action(simulation);
      }
    }
  };

  /**
   * Fonction de tick principale
   */
  const tick = () => {
    if (!isRunning) {
      // Si la simulation est en pause, on ne fait rien
      return;
    }

    // Événements aléatoires
    triggerRandomEvent();

    // Avancer la simulation d'un jour
    stepSimulation();

    // Planifier le prochain tick avec intervalle irrégulier
    const nextInterval = getNextInterval();
    timeoutRef.current = setTimeout(tick, nextInterval);
  };

  // Effet pour démarrer/arrêter la simulation
  useEffect(() => {
    if (isRunning) {
      // Démarrer la simulation
      const initialInterval = getNextInterval();
      timeoutRef.current = setTimeout(tick, initialInterval);
    } else {
      // Arrêter la simulation
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    // Cleanup lors du démontage
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isRunning, simulationSpeed]); // Re-déclencher si isRunning ou speed change

  return {
    isRunning,
    simulationSpeed,
    toggle: toggleSimulation,
    setSpeed: setSimulationSpeed,
    reset: resetSimulation
  };
}

/**
 * Hook pour débouncer des valeurs qui changent rapidement
 * Utilisé pour éviter trop de re-renders
 */
export function useDebouncedValue(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
