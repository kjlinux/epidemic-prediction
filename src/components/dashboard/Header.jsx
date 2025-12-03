/**
 * Header du Dashboard
 * Titre, horloge temps réel, indicateur de simulation
 */

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { NotificationBanner } from './NotificationBanner.jsx';
import './Header.css';

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">
            Système de Prédiction Épidémique
          </h1>
          {/* <p className="header-subtitle">Côte d'Ivoire - Modèle SEIR Métapopulationnel</p> */}
        </div>

        {/* Notification Banner intégré dans le flux */}
        <div className="header-center">
          <NotificationBanner />
        </div>

        <div className="header-right">
          <div className="simulation-status">
            <span className="status-dot pulse-orange"></span>
            <span className="status-text">Suivi temps réel</span>
          </div>

          <div className="current-time">
            <div className="time-display">
              {format(currentTime, 'HH:mm:ss')}
            </div>
            <div className="date-display">
              {format(currentTime, 'EEEE d MMMM yyyy', { locale: fr })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
