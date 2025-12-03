/**
 * Heatmap temporelle du risque épidémiologique
 * ✅ PHASE 5 : Graphique temps réel basé sur le DataTable
 */

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useSimulationStore } from '../../store/simulationStore';

const RiskHeatmap = () => {
  const currentMetrics = useSimulationStore(state => state.currentMetrics);
  const currentDay = useSimulationStore(state => state.globalMetrics?.currentDay || 0);

  const chartOption = useMemo(() => {
    if (!currentMetrics || currentMetrics.length === 0) {
      return null;
    }

    // Trier les villes par risque décroissant
    const sortedCities = [...currentMetrics]
      .sort((a, b) => b.riskScore - a.riskScore);

    // Préparer les données pour la heatmap
    const heatmapData = [];
    sortedCities.forEach((zone, cityIndex) => {
      const historyLength = Math.min(zone.history?.I?.length || 0, 30);

      // Calculer le score de risque historique (simplifié)
      for (let dayOffset = 0; dayOffset < historyLength; dayOffset++) {
        const dayIndex = (zone.history?.I?.length || 0) - historyLength + dayOffset;
        const cases = zone.history?.I?.[dayIndex] || 0;
        const prevalence = (cases / zone.population) * 100;

        // Score de risque simplifié basé sur la prévalence
        const riskScore = Math.min(prevalence * 2000, 100);

        heatmapData.push([dayOffset, cityIndex, Math.round(riskScore)]);
      }
    });

    // Axe X : derniers 30 jours
    const maxHistoryLength = Math.max(...sortedCities.map(z => z.history?.I?.length || 0));
    const displayLength = Math.min(maxHistoryLength, 30);
    const xAxisData = Array.from({ length: displayLength }, (_, i) => {
      const day = Math.max(0, currentDay - displayLength + 1 + i);
      return `J${day}`;
    });

    // Axe Y : noms des villes
    const yAxisData = sortedCities.map(z => z.name);

    return {
      title: {
        text: 'Heatmap du Risque Épidémiologique',
        left: 'center',
        textStyle: {
          color: '#000',
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        position: 'top',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#fa7e19',
        borderWidth: 2,
        textStyle: { color: '#000' },
        formatter: (params) => {
          const [day, cityIdx, risk] = params.data;
          const cityName = yAxisData[cityIdx];
          const dayLabel = xAxisData[day];
          return `<strong>${cityName}</strong><br/>${dayLabel}<br/>Score de risque: <strong>${risk}/100</strong>`;
        }
      },
      grid: {
        left: '15%',
        right: '5%',
        top: '15%',
        bottom: '12%'
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(250, 250, 250, 0.1)', 'rgba(240, 240, 240, 0.1)']
          }
        },
        axisLine: { lineStyle: { color: '#999' } },
        axisLabel: { color: '#666', rotate: 45, fontSize: 11 }
      },
      yAxis: {
        type: 'category',
        data: yAxisData,
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(250, 250, 250, 0.1)', 'rgba(240, 240, 240, 0.1)']
          }
        },
        axisLine: { lineStyle: { color: '#999' } },
        axisLabel: {
          fontSize: 11,
          overflow: 'truncate',
          width: 100,
          color: '#666'
        }
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '1%',
        inRange: {
          color: ['#4caf50', '#8bc34a', '#ffeb3b', '#fa7e19', '#ff9800', '#ff5722', '#ff5252']
        },
        text: ['Critique', 'Faible'],
        textStyle: {
          fontSize: 12,
          color: '#666'
        }
      },
      series: [{
        name: 'Score de risque',
        type: 'heatmap',
        data: heatmapData,
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(250, 126, 25, 0.5)',
            borderColor: '#fa7e19',
            borderWidth: 2
          }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        }
      }],
      animation: true,
      animationDuration: 800,
      animationEasing: 'cubicOut'
    };
  }, [currentMetrics, currentDay]);

  if (!chartOption) {
    return (
      <div className="chart-container card">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="chart-container card">
      <ReactECharts
        option={chartOption}
        style={{ height: '500px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
};

export default RiskHeatmap;
