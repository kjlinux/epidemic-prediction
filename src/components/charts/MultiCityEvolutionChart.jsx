/**
 * Graphique d'évolution multi-courbes des 10 villes les plus à risque
 * ✅ PHASE 5 : Graphique temps réel basé sur le DataTable
 */

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useSimulationStore } from '../../store/simulationStore';

const MultiCityEvolutionChart = () => {
  const currentMetrics = useSimulationStore(state => state.currentMetrics);
  const currentDay = useSimulationStore(state => state.globalMetrics?.currentDay || 0);

  const chartOption = useMemo(() => {
    if (!currentMetrics || currentMetrics.length === 0) {
      return null;
    }

    // Sélectionner les 10 villes les plus à risque
    const topRiskCities = [...currentMetrics]
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);

    // Palette de couleurs élégante (orange dominant)
    const colors = [
      '#fa7e19', '#000000', '#ff5252', '#666666', '#ffa726',
      '#999999', '#ff7043', '#444444', '#ffb74d', '#333333'
    ];

    // Préparer les séries de données
    const series = topRiskCities.map((zone, index) => {
      // Récupérer l'historique des 30 derniers jours
      const historyLength = Math.min(zone.history?.I?.length || 0, 30);
      const history = zone.history?.I?.slice(-historyLength) || [];

      return {
        name: zone.name,
        type: 'line',
        smooth: true,
        data: history,
        lineStyle: {
          width: 3,
          color: colors[index]
        },
        itemStyle: { color: colors[index] },
        showSymbol: false,
        emphasis: { focus: 'series' }
      };
    });

    // Axe X : derniers 30 jours
    const maxHistoryLength = Math.max(...topRiskCities.map(z => z.history?.I?.length || 0));
    const displayLength = Math.min(maxHistoryLength, 30);
    const xAxisData = Array.from({ length: displayLength }, (_, i) => {
      const day = Math.max(0, currentDay - displayLength + 1 + i);
      return `J${day}`;
    });

    return {
      color: colors,
      title: {
        text: 'Évolution des Cas - Top 10 Villes à Risque',
        left: 'center',
        textStyle: {
          color: '#000',
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#fa7e19',
        borderWidth: 2,
        textStyle: { color: '#000' },
        formatter: (params) => {
          let tooltip = `<strong>${params[0].axisValue}</strong><br/>`;
          params.forEach(param => {
            tooltip += `${param.marker} ${param.seriesName}: <strong>${Math.round(param.value).toLocaleString('fr-FR')}</strong> cas<br/>`;
          });
          return tooltip;
        }
      },
      legend: {
        type: 'scroll',
        bottom: 10,
        data: topRiskCities.map(z => z.name),
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
        data: xAxisData,
        axisLine: { lineStyle: { color: '#999' } },
        axisLabel: { color: '#666' },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        name: 'Cas actifs',
        nameTextStyle: { color: '#666' },
        axisLine: { lineStyle: { color: '#999' } },
        axisLabel: {
          formatter: (value) => value.toLocaleString('fr-FR'),
          color: '#666'
        },
        splitLine: { lineStyle: { color: '#f0f0f0' } }
      },
      series,
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
        style={{ height: '400px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
};

export default MultiCityEvolutionChart;
