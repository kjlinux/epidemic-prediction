/**
 * Carte de Flux Interactive (Flow Map)
 * Deck.gl + Mapbox GL pour visualiser les flux de mobilité et les zones à risque
 */

import { useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl';
import { ArcLayer, ScatterplotLayer } from '@deck.gl/layers';
import { useSimulationStore } from '../../store/simulationStore.js';
import { getTopFlows } from '../../simulation/MobilityGenerator.js';
import { ivoryCoastCities } from '../../data/ivoryCoastCities.js';
import { getRiskColorRGBA } from '../../utils/colorUtils.js';
import 'mapbox-gl/dist/mapbox-gl.css';
import './FlowMap.css';

// Token Mapbox (à remplacer par le vôtre dans .env)
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ||
  'pk.eyJ1IjoiZXBpZGVtaWMtZGVtbyIsImEiOiJjbHp4eHh4In0.demo'; // Token démo (ne fonctionnera pas)

const INITIAL_VIEW_STATE = {
  latitude: 7.5, // Centre de la Côte d'Ivoire
  longitude: -5.5,
  zoom: 6.5,
  pitch: 30,
  bearing: 0
};

export function FlowMap() {
  const currentMetrics = useSimulationStore(state => state.currentMetrics);
  const mobilityMatrix = useSimulationStore(state => state.mobilityMatrix);

  // Préparer les données pour les flux (top 50 flux les plus importants)
  const flowsData = useMemo(() => {
    if (!mobilityMatrix) return [];
    return getTopFlows(mobilityMatrix, ivoryCoastCities, 50);
  }, [mobilityMatrix]);

  // Préparer les données pour les zones (cercles)
  const zonesData = useMemo(() => {
    if (!currentMetrics) return [];

    return currentMetrics.map(zone => ({
      ...zone,
      // Deck.gl utilise [lon, lat] au lieu de [lat, lon]
      position: [zone.coordinates[1], zone.coordinates[0]]
    }));
  }, [currentMetrics]);

  // Couche 1 : Flux animés (Arcs)
  const arcLayer = new ArcLayer({
    id: 'mobility-arcs',
    data: flowsData,
    getSourcePosition: d => [d.originCoords[1], d.originCoords[0]], // [lon, lat]
    getTargetPosition: d => [d.destCoords[1], d.destCoords[0]],
    getSourceColor: [250, 126, 25, 180], // Orange #fa7e19
    getTargetColor: [250, 126, 25, 80], // Dégradé vers transparent
    getWidth: d => Math.log(d.volume + 1) * 0.8,
    greatCircle: true,

    // Animation
    widthMinPixels: 1,
    widthMaxPixels: 8,

    // Transitions fluides
    transitions: {
      getWidth: 600,
      getSourceColor: 600
    },

    // Performance
    updateTriggers: {
      getWidth: flowsData,
      getSourceColor: flowsData
    }
  });

  // Couche 2 : Zones (Cercles)
  const scatterLayer = new ScatterplotLayer({
    id: 'risk-zones',
    data: zonesData,
    getPosition: d => d.position,
    getRadius: d => Math.sqrt(d.population) * 15,
    getFillColor: d => getRiskColorRGBA(d.riskScore, 200),
    getLineColor: [0, 0, 0, 100],
    getLineWidth: 2,

    pickable: true,
    radiusMinPixels: 5,
    radiusMaxPixels: 50,
    lineWidthMinPixels: 1,

    // Transitions
    transitions: {
      getFillColor: 800,
      getRadius: 600
    },

    // Tooltip
    onHover: info => {
      if (info.object) {
        // Le tooltip est géré par le composant parent via getTooltip
      }
    },

    updateTriggers: {
      getFillColor: currentMetrics,
      getRadius: currentMetrics
    }
  });

  const layers = [arcLayer, scatterLayer];

  // Fonction pour afficher le tooltip
  const getTooltip = ({ object }) => {
    if (!object) return null;

    return {
      html: `
        <div class="map-tooltip">
          <h4>${object.name}</h4>
          <div class="tooltip-content">
            <div class="tooltip-row">
              <span>Cas actifs:</span>
              <strong>${object.activeCases}</strong>
            </div>
            <div class="tooltip-row">
              <span>Score de risque:</span>
              <strong class="risk-score-${object.riskScore > 75 ? 'high' : object.riskScore > 40 ? 'medium' : 'low'}">
                ${object.riskScore}
              </strong>
            </div>
            <div class="tooltip-row">
              <span>Prévalence:</span>
              <strong>${object.prevalence}%</strong>
            </div>
            <div class="tooltip-row">
              <span>Population:</span>
              <strong>${object.population.toLocaleString('fr-FR')}</strong>
            </div>
          </div>
        </div>
      `,
      style: {
        backgroundColor: '#fff',
        fontSize: '0.8em',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }
    };
  };

  if (!currentMetrics || !mobilityMatrix) {
    return (
      <div className="flow-map-container">
        <div className="map-loading">
          <div className="spinner-lg"></div>
          <p>Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flow-map-container">
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        getTooltip={getTooltip}
        style={{ position: 'relative', width: '100%', height: '100%' }}
      >
        <Map
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          style={{ width: '100%', height: '100%' }}
        />
      </DeckGL>

      {/* Légende */}
      <MapLegend />
    </div>
  );
}

// Composant de légende
function MapLegend() {
  return (
    <div className="map-legend">
      <h4 className="legend-title">Légende</h4>

      <div className="legend-section">
        <div className="legend-label">Niveau de risque:</div>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#4caf50' }}></span>
            <span>Faible (&lt;40)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#fa7e19' }}></span>
            <span>Moyen (40-75)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#ff5252' }}></span>
            <span>Élevé (&gt;75)</span>
          </div>
        </div>
      </div>

      <div className="legend-section">
        <div className="legend-label">Flux de mobilité:</div>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-line legend-line-thin"></span>
            <span>Faible</span>
          </div>
          <div className="legend-item">
            <span className="legend-line legend-line-thick"></span>
            <span>Élevé</span>
          </div>
        </div>
      </div>

      <div className="legend-note">
        <strong>💡 Astuce:</strong> Survolez les villes pour voir les détails
      </div>
    </div>
  );
}
