/**
 * Panneau d'Alertes en temps réel
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore } from '../../store/simulationStore.js';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FaCircle, FaDotCircle, FaCheckCircle } from 'react-icons/fa';
import './AlertPanel.css';

export function AlertPanel() {
  const alerts = useSimulationStore(state => state.alerts);

  const getPriorityIcon = priority => {
    const iconProps = { size: 16 };
    switch (priority) {
      case 'critical':
        return <FaCircle {...iconProps} color="#ff5252" />;
      case 'high':
        return <FaCircle {...iconProps} color="#fa7e19" />;
      case 'medium':
        return <FaCircle {...iconProps} color="#ffd700" />;
      default:
        return <FaCircle {...iconProps} color="#2196F3" />;
    }
  };

  return (
    <div className="alert-panel card">
      <h3 className="alert-title">Alertes Actives</h3>

      <div className="alerts-list">
        <AnimatePresence>
          {alerts.length === 0 ? (
            <motion.div
              className="no-alerts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="no-alerts-icon"><FaCheckCircle size={24} color="#4caf50" /></span>
              <p>Aucune alerte pour le moment</p>
            </motion.div>
          ) : (
            alerts.slice().reverse().map((alert, index) => (
              <motion.div
                key={alert.id}
                className={`alert-item alert-${alert.priority}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="alert-icon">
                  {getPriorityIcon(alert.priority)}
                </div>

                <div className="alert-content">
                  <div className="alert-header">
                    <span className="alert-zone">{alert.zone}</span>
                    <span className="alert-time">
                      {formatDistanceToNow(alert.timestamp, {
                        addSuffix: true,
                        locale: fr
                      })}
                    </span>
                  </div>

                  <p className="alert-message">{alert.message}</p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
