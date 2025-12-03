/**
 * Dashboard principal
 * Assemble tous les composants
 */

import { useEffect } from 'react';
import { useSimulationStore } from '../../store/simulationStore.js';
import { useRealtimeSimulation } from '../../hooks/useRealtimeSimulation.js';
import { Header } from './Header.jsx';
import { KPICards } from './KPICards.jsx';
import { ControlPanel } from './ControlPanel.jsx';
import { AlertPanel } from './AlertPanel.jsx';
import { FlowMap } from '../map/FlowMap.jsx';
import { TimeSeriesChart } from '../charts/TimeSeriesChart.jsx';
import { MobilityFlowChart } from '../charts/MobilityFlowChart.jsx';
import './Dashboard.css';

export function Dashboard() {
  const initialize = useSimulationStore(state => state.initialize);
  const currentMetrics = useSimulationStore(state => state.currentMetrics);

  // Initialiser la simulation au montage
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Démarrer la simulation temps réel
  useRealtimeSimulation();

  if (!currentMetrics) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-lg"></div>
        <p>Initialisation de la simulation...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Header />

      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* KPIs */}
          <KPICards />

          {/* Layout principal: Carte + Sidebar */}
          <div className="dashboard-layout">
            {/* Colonne principale: Carte + Graphiques */}
            <div className="dashboard-main-column">
              {/* Carte de flux */}
              <FlowMap />

              {/* Graphiques */}
              <div className="charts-grid">
                <TimeSeriesChart />
                <MobilityFlowChart />
              </div>
            </div>

            {/* Sidebar: Contrôles + Alertes + Top Zones */}
            <div className="dashboard-sidebar">
              {/* Contrôles */}
              <ControlPanel />

              {/* Alertes */}
              <AlertPanel />

              {/* Top 5 Zones à Risque */}
              <div className="card">
                <h4>Top 5 Zones à Risque</h4>
                <ul className="risk-list">
                  {currentMetrics
                    .sort((a, b) => b.riskScore - a.riskScore)
                    .slice(0, 5)
                    .map(zone => (
                      <li key={zone.id}>
                        <span className="zone-name">{zone.name}</span>
                        <span
                          className={`badge ${
                            zone.riskScore > 75
                              ? 'badge--risk-high'
                              : zone.riskScore > 40
                              ? 'badge--risk-medium'
                              : 'badge--risk-low'
                          }`}
                        >
                          {zone.riskScore}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
