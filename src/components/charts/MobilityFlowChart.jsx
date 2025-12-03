/**
 * Graphique des flux de mobilité
 * Top 10 corridors de déplacement
 */

import ReactECharts from 'echarts-for-react';
import { useSimulationStore } from '../../store/simulationStore.js';
import { getTopFlows } from '../../simulation/MobilityGenerator.js';
import { ivoryCoastCities } from '../../data/ivoryCoastCities.js';
import { useMemo } from 'react';
import './MobilityFlowChart.css';

export function MobilityFlowChart() {
  const mobilityMatrix = useSimulationStore(state => state.mobilityMatrix);

  const option = useMemo(() => {
    if (!mobilityMatrix) return null;

    const topFlows = getTopFlows(mobilityMatrix, ivoryCoastCities, 10);

    const data = topFlows.map(flow => ({
      name: `${flow.originName} → ${flow.destName}`,
      value: flow.volume
    }));

    return {
      color: ['#fa7e19'],

      title: {
        text: 'Top 10 Corridors de Mobilité',
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
          type: 'shadow'
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#fa7e19',
        borderWidth: 2,
        textStyle: { color: '#000' },
        formatter: function(params) {
          const data = params[0];
          return `
            <div style="padding: 5px;">
              <strong>${data.name}</strong><br/>
              <span style="color: #fa7e19; font-weight: bold;">
                ${data.value.toLocaleString('fr-FR')}
              </span> déplacements/jour
            </div>
          `;
        }
      },

      grid: {
        left: '25%',
        right: '4%',
        top: '15%',
        bottom: '3%',
        containLabel: false
      },

      xAxis: {
        type: 'value',
        name: 'Déplacements/jour',
        axisLine: { lineStyle: { color: '#999' } },
        splitLine: { lineStyle: { color: '#f0f0f0' } }
      },

      yAxis: {
        type: 'category',
        data: data.map(d => d.name),
        axisLine: { lineStyle: { color: '#999' } },
        axisLabel: {
          fontSize: 11,
          color: '#333'
        },
        inverse: true
      },

      series: [
        {
          name: 'Flux',
          type: 'bar',
          data: data.map(d => d.value),
          barWidth: '60%',
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#ffb380' },
                { offset: 1, color: '#fa7e19' }
              ]
            }
          },
          emphasis: {
            itemStyle: {
              color: '#d96a0f'
            }
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{c}',
            fontSize: 10,
            color: '#666'
          }
        }
      ],

      animation: true,
      animationDuration: 1000,
      animationEasing: 'elasticOut'
    };
  }, [mobilityMatrix]);

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
