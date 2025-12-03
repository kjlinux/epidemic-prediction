/**
 * Notification Banner - Affiche les alertes une par une dans le header
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore } from '../../store/simulationStore.js';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FaCircle, FaTimes } from 'react-icons/fa';
import './NotificationBanner.css';

export function NotificationBanner() {
  const alerts = useSimulationStore(state => state.alerts);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (alerts.length === 0) {
      setIsVisible(false);
      return;
    }

    // Afficher la notification
    setIsVisible(true);

    // Passer à la notification suivante après 5 secondes
    const timer = setTimeout(() => {
      setIsVisible(false);

      // Attendre la fin de l'animation de sortie avant de changer d'index
      setTimeout(() => {
        setCurrentAlertIndex((prev) => (prev + 1) % alerts.length);
      }, 500);
    }, 5000);

    return () => clearTimeout(timer);
  }, [alerts, currentAlertIndex]);

  if (alerts.length === 0) {
    return null;
  }

  const currentAlert = alerts[currentAlertIndex];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return '#ff5252';
      case 'high':
        return '#fa7e19';
      case 'medium':
        return '#ffd700';
      default:
        return '#2196F3';
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && currentAlert && (
        <motion.div
          className="notification-banner"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          style={{ borderLeftColor: getPriorityColor(currentAlert.priority) }}
        >
          <div className="notification-icon">
            <FaCircle size={10} color={getPriorityColor(currentAlert.priority)} />
          </div>

          <div className="notification-content">
            <div className="notification-header">
              <span className="notification-zone">{currentAlert.zone}</span>
              <span style={{ color: '#ccc' }}>•</span>
              <span className="notification-time">
                {formatDistanceToNow(currentAlert.timestamp, {
                  addSuffix: true,
                  locale: fr
                })}
              </span>
            </div>
            <p className="notification-message">{currentAlert.message}</p>
          </div>

          {alerts.length > 1 && (
            <div className="notification-indicator">
              {currentAlertIndex + 1}/{alerts.length}
            </div>
          )}

          <button className="notification-dismiss" onClick={handleDismiss}>
            <FaTimes size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
