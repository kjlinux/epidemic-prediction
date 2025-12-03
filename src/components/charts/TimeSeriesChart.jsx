/**
 * Graphique d'évolution temporelle
 * Affiche l'évolution des cas avec prédictions J+7 et J+14
 */

import ReactECharts from 'echarts-for-react';
import { useSimulationStore } from '../../store/simulationStore.js';
import { useMemo } from 'react';
import './TimeSeriesChart.css';

export function TimeSeriesChart() {
  const simulation = useSimulationStore(state => state.simulation);
  const predictions = useSimulationStore(state => state.getPredictions());

  const option = useMemo(() => {
    if (!simulation || !simulation.history || simulation.history.length === 0) {
      return null;
    }

    // Prendre les 30 derniers jours
    const history = simulation.history.slice(-30);

    // Données historiques
    const dates = history.map(h => h.date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short'
    }));

    const casesData = history.map(h =>
      h.metrics.reduce((sum, m) => sum + m.activeCases, 0)
    );

    // Ajouter les prédictions
    const today = new Date();
    const pred7 = new Date(today);
    pred7.setDate(pred7.getDate() + 7);
    const pred14 = new Date(today);
    pred14.setDate(pred14.getDate() + 14);

    const predictionDates = [
      today.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      pred7.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      pred14.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    ];

    const predictionData = [
      casesData[casesData.length - 1],
      predictions.prediction7d,
      predictions.prediction14d
    ];

    return {
      color: ['#000000', '#fa7e19', '#ff5252'],

      title: {
        text: 'Évolution des Cas Actifs',
        left: 'center',
        textStyle: {
          color: '#000',
          fontSize: 16,
          fontWeight: 'bold'
        }
      },

      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#fa7e19',
        borderWidth: 2,
        textStyle: {
          color: '#000'
        }
      },

      legend: {
        data: ['Observations', 'Prédictions', 'Seuil Alerte'],
        bottom: 10,
        textStyle: { color: '#333' }
      },

      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      },

      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: [...dates, ...predictionDates.slice(1)],
        axisLine: { lineStyle: { color: '#999' } },
        splitLine: { show: false }
      },

      yAxis: {
        type: 'value',
        name: 'Cas actifs',
        axisLine: { lineStyle: { color: '#999' } },
        splitLine: { lineStyle: { color: '#f0f0f0' } }
      },

      series: [
        {
          name: 'Observations',
          type: 'line',
          data: casesData,
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#000000'
          },
          areaStyle: {
            opacity: 0.1,
            color: '#000000'
          },
          emphasis: {
            focus: 'series'
          }
        },
        {
          name: 'Prédictions',
          type: 'line',
          data: Array(dates.length).fill(null).concat(predictionData),
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#fa7e19',
            type: 'dashed'
          },
          areaStyle: {
            opacity: 0.1,
            color: '#fa7e19'
          },
          emphasis: {
            focus: 'series'
          }
        },
        {
          name: 'Seuil Alerte',
          type: 'line',
          data: Array(dates.length + 3).fill(Math.max(...casesData) * 0.8),
          lineStyle: {
            width: 2,
            color: '#ff5252',
            type: 'dotted'
          },
          silent: true
        }
      ],

      animation: true,
      animationDuration: 800,
      animationEasing: 'cubicOut'
    };
  }, [simulation, predictions]);

  if (!option) {
    return (
      <div className="chart-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="chart-container card">
      <ReactECharts
        option={option}
        style={{ height: '400px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}
