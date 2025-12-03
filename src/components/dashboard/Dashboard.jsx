/**
 * Dashboard principal
 * Assemble tous les composants
 */

import { useEffect } from 'react';
import { useSimulationStore } from '../../store/simulationStore.js';
import { useRealtimeSimulation } from '../../hooks/useRealtimeSimulation.js';
import { Header } from './Header.jsx';
import { KPICards } from './KPICards.jsx';
import { FlowMap } from '../map/FlowMap.jsx';
import { TimeSeriesChart } from '../charts/TimeSeriesChart.jsx';
import { MobilityFlowChart } from '../charts/MobilityFlowChart.jsx';
import { RegionsTable } from '../table/RegionsTable.jsx';
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
        <p>Chargement ...</p>
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

          {/* Carte de flux - Pleine largeur */}
          <FlowMap />

          {/* Graphiques */}
          <div className="charts-grid">
            <TimeSeriesChart />
            <MobilityFlowChart />
          </div>

          {/* Tableau de toutes les régions - Pleine largeur */}
          <RegionsTable />
        </div>
      </main>
    </div>
  );
}
