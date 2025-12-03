/**
 * Panneau de contrôles de la simulation
 * Play/Pause, Reset, Vitesse
 */

import { motion } from 'framer-motion';
import { useRealtimeSimulation } from '../../hooks/useRealtimeSimulation.js';
import './ControlPanel.css';

export function ControlPanel() {
  const { isRunning, simulationSpeed, toggle, setSpeed, reset } = useRealtimeSimulation();

  const speedOptions = [
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 5, label: '5x' }
  ];

  return (
    <motion.div
      className="control-panel card"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="control-title">Contrôles</h3>

      <div className="control-buttons">
        {/* Play/Pause */}
        <button
          className={`btn ${isRunning ? 'btn-secondary' : 'btn-primary'}`}
          onClick={toggle}
        >
          {isRunning ? '⏸ Pause' : '▶ Play'}
        </button>

        {/* Reset */}
        <button className="btn btn-secondary" onClick={reset}>
          🔄 Reset
        </button>
      </div>

      {/* Vitesse */}
      <div className="speed-control">
        <label className="speed-label">Vitesse:</label>
        <div className="speed-buttons">
          {speedOptions.map(option => (
            <button
              key={option.value}
              className={`btn btn-ghost ${
                simulationSpeed === option.value ? 'active' : ''
              }`}
              onClick={() => setSpeed(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
