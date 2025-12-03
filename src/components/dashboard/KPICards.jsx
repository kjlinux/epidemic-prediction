/**
 * KPI Cards - Métriques principales animées
 */

import { motion } from 'framer-motion';
import { useSimulationStore } from '../../store/simulationStore.js';
import { formatNumber, formatPercentage } from '../../utils/statsUtils.js';
import './KPICards.css';

export function KPICards() {
  const globalMetrics = useSimulationStore(state => state.globalMetrics);
  const mobilityIndex = useSimulationStore(state => state.mobilityIndex);
  const predictions = useSimulationStore(state => state.getPredictions());

  if (!globalMetrics) {
    return (
      <div className="kpi-cards-container">
        <div className="spinner-lg"></div>
      </div>
    );
  }

  const kpis = [
    {
      id: 'active-cases',
      label: 'Cas Actifs',
      value: formatNumber(globalMetrics.totalActiveCases),
      trend: globalMetrics.caseTrend,
      icon: '🦠',
      color: 'var(--orange-primary)'
    },
    {
      id: 'mobility',
      label: 'Indice Mobilité',
      value: `${Math.round(mobilityIndex)}%`,
      trend: null,
      icon: '🚶',
      color: 'var(--black)'
    },
    {
      id: 'risk-zones',
      label: 'Zones à Risque',
      value: globalMetrics.highRiskZones,
      trend: null,
      icon: '⚠️',
      color: 'var(--risk-high)'
    },
    {
      id: 'prediction',
      label: 'Prédiction J+7',
      value: formatNumber(predictions.prediction7d),
      trend: predictions.prediction7d > globalMetrics.totalActiveCases ? '+' : '-',
      icon: '📈',
      color: 'var(--risk-medium)'
    }
  ];

  return (
    <div className="kpi-cards-container">
      {kpis.map((kpi, index) => (
        <KPICard key={kpi.id} kpi={kpi} index={index} />
      ))}
    </div>
  );
}

function KPICard({ kpi, index }) {
  return (
    <motion.div
      className="kpi-card card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <div className="kpi-icon" style={{ color: kpi.color }}>
        {kpi.icon}
      </div>

      <div className="kpi-content">
        <div className="kpi-label">{kpi.label}</div>

        <motion.div
          className="kpi-value"
          key={kpi.value}
          initial={{ scale: 1.2, color: kpi.color }}
          animate={{ scale: 1, color: 'var(--black)' }}
          transition={{ duration: 0.4 }}
        >
          {kpi.value}
        </motion.div>

        {kpi.trend !== null && kpi.trend !== 0 && (
          <div className={`kpi-trend ${kpi.trend > 0 ? 'trend-up' : 'trend-down'}`}>
            {kpi.trend > 0 ? '↑' : '↓'} {Math.abs(kpi.trend).toFixed(1)}%
          </div>
        )}
      </div>
    </motion.div>
  );
}
