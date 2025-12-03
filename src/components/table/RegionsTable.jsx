/**
 * Tableau virtualisé des 30 régions de Côte d'Ivoire
 * Utilise @tanstack/react-virtual pour optimisation performance
 */

import { useState, useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useSimulationStore } from '../../store/simulationStore.js';
import { formatNumber, formatPercentage } from '../../utils/statsUtils.js';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import './RegionsTable.css';

/**
 * Retourne la classe CSS selon le signe de la variation
 */
function getVariationClass(variation) {
  if (variation > 0) return 'variation-positive';
  if (variation < 0) return 'variation-negative';
  return '';
}

export function RegionsTable() {
  // État local
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('riskScore');
  const [sortOrder, setSortOrder] = useState('desc');

  // Store Zustand
  const currentMetrics = useSimulationStore(state => state.currentMetrics);

  // Gestionnaire de tri
  const handleSort = column => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Filtrage et tri des données
  const filteredAndSortedData = useMemo(() => {
    if (!currentMetrics) return [];

    // 1. Filtrer par recherche
    let filtered = currentMetrics;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = currentMetrics.filter(zone =>
        zone.name.toLowerCase().includes(term)
      );
    }

    // 2. Trier selon la colonne active
    const sorted = [...filtered].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Gestion des chaînes (nom)
      if (typeof aValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Gestion des nombres
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  }, [currentMetrics, searchTerm, sortBy, sortOrder]);

  // Virtualisation avec @tanstack/react-virtual
  const parentRef = useRef();
  const rowVirtualizer = useVirtualizer({
    count: filteredAndSortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Hauteur estimée de chaque ligne
    overscan: 5 // Buffer de 5 lignes hors vue
  });

  // Icône de tri
  const getSortIcon = column => {
    if (sortBy !== column) return <FaSort size={12} />;
    return sortOrder === 'asc' ? <FaSortUp size={12} /> : <FaSortDown size={12} />;
  };

  if (!currentMetrics) {
    return (
      <div className="regions-table-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="regions-table-container">
      {/* Header avec titre et recherche */}
      <div className="table-header">
        <h3>Toutes les Régions ({filteredAndSortedData.length})</h3>
        <input
          type="search"
          placeholder="Rechercher une région..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="table-search"
        />
      </div>

      {/* Conteneur scrollable avec virtualisation */}
      <div ref={parentRef} className="table-scroll-container">
        <table className="regions-table">
          <thead>
            <tr>
              <th className="col-name" onClick={() => handleSort('name')}>
                Région {getSortIcon('name')}
              </th>
              <th className="col-population" onClick={() => handleSort('population')}>
                Population {getSortIcon('population')}
              </th>
              <th className="col-cases" onClick={() => handleSort('activeCases')}>
                Cas Actifs {getSortIcon('activeCases')}
              </th>
              <th className="col-variation" onClick={() => handleSort('variation24h')}>
                Variation 24h {getSortIcon('variation24h')}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="4" style={{ padding: 0, border: 'none' }}>
                <div
                  className="table-body-container"
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative'
                  }}
                >
                  {/* Lignes virtualisées */}
                  {rowVirtualizer.getVirtualItems().map(virtualRow => {
                    const zone = filteredAndSortedData[virtualRow.index];

                    return (
                      <div
                        key={zone.id}
                        className="table-row-wrapper"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                          display: 'flex'
                        }}
                      >
                        <div className="col-name">{zone.name}</div>
                        <div className="col-population">{formatNumber(zone.population)}</div>
                        <div className="col-cases">{formatNumber(zone.activeCases)}</div>
                        <div className={`col-variation ${getVariationClass(zone.variation24h)}`}>
                          {zone.variation24h > 0 && '+'}
                          {formatPercentage(zone.variation24h)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Message si aucun résultat */}
      {filteredAndSortedData.length === 0 && (
        <div className="table-empty">
          <p>Aucune région trouvée pour "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}
