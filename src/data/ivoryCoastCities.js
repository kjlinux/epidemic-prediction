/**
 * Données géographiques des 30 villes principales de Côte d'Ivoire
 * Source: OpenStreetMap + données démographiques officielles
 *
 * 13 communes d'Abidjan + 17 villes majeures du pays
 */

export const ivoryCoastCities = [
  // === CLUSTER ABIDJAN (13 communes) ===
  {
    id: 'CI-AB-PLT',
    name: 'Plateau',
    region: 'Abidjan',
    district: 'Abidjan Autonome',
    coordinates: [5.3196, -4.0083], // [latitude, longitude]
    population: 25000,
    centrality: 98, // Score 0-100 (importance économique/mobilité)
    urbanType: 'urban',
    isCapital: false,
    description: 'Centre d\'affaires et administratif d\'Abidjan'
  },
  {
    id: 'CI-AB-YOP',
    name: 'Yopougon',
    region: 'Abidjan',
    district: 'Abidjan Autonome',
    coordinates: [5.3453, -4.0864],
    population: 1200000,
    centrality: 85,
    urbanType: 'urban',
    isCapital: false,
    description: 'Commune la plus peuplée d\'Abidjan'
  },
  {
    id: 'CI-AB-COC',
    name: 'Cocody',
    region: 'Abidjan',
    district: 'Abidjan Autonome',
    coordinates: [5.3574, -3.9814],
    population: 450000,
    centrality: 90,
    urbanType: 'urban',
    isCapital: false,
    description: 'Quartier résidentiel huppé, universités'
  },
  {
    id: 'CI-AB-ABO',
    name: 'Abobo',
    region: 'Abidjan',
    district: 'Abidjan Autonome',
    coordinates: [5.4236, -4.0208],
    population: 1200000,
    centrality: 80,
    urbanType: 'urban',
    isCapital: false,
    description: 'Commune populaire du nord d\'Abidjan'
  },
  {
    id: 'CI-AB-ADJ',
    name: 'Adjamé',
    region: 'Abidjan',
    district: 'Abidjan Autonome',
    coordinates: [5.3536, -4.0236],
    population: 400000,
    centrality: 88,
    urbanType: 'urban',
    isCapital: false,
    description: 'Gare routière principale, hub de transport'
  },
  {
    id: 'CI-AB-ATT',
    name: 'Attécoubé',
    region: 'Abidjan',
    district: 'Abidjan Autonome',
    coordinates: [5.3319, -4.0492],
    population: 300000,
    centrality: 75,
    urbanType: 'urban',
    isCapital: false,
    description: 'Commune industrielle et commerciale'
  },
  {
    id: 'CI-AB-KOU',
    name: 'Koumassi',
    region: 'Abidjan',
    district: 'Abidjan Autonome',
    coordinates: [5.3028, -3.9500],
    population: 450000,
    centrality: 70,
    urbanType: 'urban',
    isCapital: false,
    description: 'Zone industrielle importante'
  },
  {
    id: 'CI-AB-MAR',
    name: 'Marcory',
    region: 'Abidjan',
    district: 'Abidjan Autonome',
    coordinates: [5.2872, -3.9753],
    population: 200000,
    centrality: 72,
    urbanType: 'urban',
    isCapital: false,
    description: 'Zone résidentielle et commerciale'
  },
  {
    id: 'CI-AB-PBO',
    name: 'Port-Bouët',
    region: 'Abidjan',
    district: 'Abidjan Autonome',
    coordinates: [5.2575, -3.9239],
    population: 350000,
    centrality: 68,
    urbanType: 'urban',
    isCapital: false,
    description: 'Aéroport international, zone portuaire'
  },
  {
    id: 'CI-AB-TRE',
    name: 'Treichville',
    region: 'Abidjan',
    district: 'Abidjan Autonome',
    coordinates: [5.2847, -4.0017],
    population: 150000,
    centrality: 82,
    urbanType: 'urban',
    isCapital: false,
    description: 'Centre commercial historique'
  },
  {
    id: 'CI-AB-BIN',
    name: 'Bingerville',
    region: 'Abidjan',
    district: 'Abidjan Autonome',
    coordinates: [5.3553, -3.8933],
    population: 100000,
    centrality: 60,
    urbanType: 'peri-urban',
    isCapital: false,
    description: 'Ancienne capitale coloniale, banlieue est'
  },
  {
    id: 'CI-AB-SON',
    name: 'Songon',
    region: 'Abidjan',
    district: 'Abidjan Autonome',
    coordinates: [5.2889, -4.2667],
    population: 80000,
    centrality: 50,
    urbanType: 'peri-urban',
    isCapital: false,
    description: 'Banlieue ouest en développement'
  },
  {
    id: 'CI-AB-ANY',
    name: 'Anyama',
    region: 'Abidjan',
    district: 'Abidjan Autonome',
    coordinates: [5.4950, -4.0514],
    population: 150000,
    centrality: 55,
    urbanType: 'peri-urban',
    isCapital: false,
    description: 'Banlieue nord, flux pendulaires importants'
  },

  // === VILLES MAJEURES (17 villes) ===
  {
    id: 'CI-YAM',
    name: 'Yamoussoukro',
    region: 'Yamoussoukro',
    district: 'Yamoussoukro Autonome',
    coordinates: [6.8206, -5.2767],
    population: 355573,
    centrality: 85,
    urbanType: 'urban',
    isCapital: true,
    description: 'Capitale politique de la Côte d\'Ivoire'
  },
  {
    id: 'CI-BOU',
    name: 'Bouaké',
    region: 'Gbêkê',
    district: 'Vallée du Bandama',
    coordinates: [7.6906, -5.0300],
    population: 536189,
    centrality: 82,
    urbanType: 'urban',
    isCapital: false,
    description: 'Deuxième ville du pays, carrefour commercial'
  },
  {
    id: 'CI-DAL',
    name: 'Daloa',
    region: 'Haut-Sassandra',
    district: 'Sassandra-Marahoué',
    coordinates: [6.8772, -6.4503],
    population: 266324,
    centrality: 70,
    urbanType: 'urban',
    isCapital: false,
    description: 'Centre du cacao et du café'
  },
  {
    id: 'CI-SAN',
    name: 'San Pedro',
    region: 'San-Pédro',
    district: 'Bas-Sassandra',
    coordinates: [4.7489, -6.6367],
    population: 263451,
    centrality: 75,
    urbanType: 'urban',
    isCapital: false,
    description: 'Deuxième port du pays'
  },
  {
    id: 'CI-KOR',
    name: 'Korhogo',
    region: 'Poro',
    district: 'Savanes',
    coordinates: [9.4581, -5.6297],
    population: 286071,
    centrality: 68,
    urbanType: 'urban',
    isCapital: false,
    description: 'Capitale du Nord, zone cotonnière'
  },
  {
    id: 'CI-MAN',
    name: 'Man',
    region: 'Tonkpi',
    district: 'Montagnes',
    coordinates: [7.4122, -7.5539],
    population: 139341,
    centrality: 65,
    urbanType: 'urban',
    isCapital: false,
    description: 'Région montagneuse de l\'Ouest'
  },
  {
    id: 'CI-GAG',
    name: 'Gagnoa',
    region: 'Gôh',
    district: 'Gôh-Djiboua',
    coordinates: [6.1319, -5.9508],
    population: 160465,
    centrality: 62,
    urbanType: 'urban',
    isCapital: false,
    description: 'Zone agricole cacao/café'
  },
  {
    id: 'CI-ABE',
    name: 'Abengourou',
    region: 'Indénié-Djuablin',
    district: 'Comoé',
    coordinates: [6.7297, -3.4964],
    population: 117221,
    centrality: 60,
    urbanType: 'urban',
    isCapital: false,
    description: 'Est ivoirien, zone aurifère'
  },
  {
    id: 'CI-DIV',
    name: 'Divo',
    region: 'Lôh-Djiboua',
    district: 'Gôh-Djiboua',
    coordinates: [5.8378, -5.3572],
    population: 127867,
    centrality: 58,
    urbanType: 'urban',
    isCapital: false,
    description: 'Carrefour routier Sud-Ouest'
  },
  {
    id: 'CI-BON',
    name: 'Bondoukou',
    region: 'Gontougo',
    district: 'Zanzan',
    coordinates: [8.0403, -2.8000],
    population: 87341,
    centrality: 55,
    urbanType: 'urban',
    isCapital: false,
    description: 'Frontière Ghana, commerce transfrontalier'
  },
  {
    id: 'CI-ODI',
    name: 'Odienné',
    region: 'Kabadougou',
    district: 'Denguélé',
    coordinates: [9.5069, -7.5650],
    population: 66293,
    centrality: 52,
    urbanType: 'urban',
    isCapital: false,
    description: 'Nord-Ouest, frontière Mali/Guinée'
  },
  {
    id: 'CI-SAS',
    name: 'Sassandra',
    region: 'Gbôklé',
    district: 'Bas-Sassandra',
    coordinates: [4.9522, -6.0867],
    population: 57766,
    centrality: 50,
    urbanType: 'urban',
    isCapital: false,
    description: 'Port de pêche sur le littoral'
  },
  {
    id: 'CI-TOU',
    name: 'Touba',
    region: 'Bafing',
    district: 'Woroba',
    coordinates: [8.2833, -7.6833],
    population: 40689,
    centrality: 48,
    urbanType: 'urban',
    isCapital: false,
    description: 'Frontière Guinée, zone montagneuse'
  },
  {
    id: 'CI-GBA',
    name: 'Grand-Bassam',
    region: 'Sud-Comoé',
    district: 'Comoé',
    coordinates: [5.2000, -3.7333],
    population: 86147,
    centrality: 53,
    urbanType: 'urban',
    isCapital: false,
    description: 'Ancienne capitale, station balnéaire'
  },
  {
    id: 'CI-SOU',
    name: 'Soubré',
    region: 'Nawa',
    district: 'Bas-Sassandra',
    coordinates: [5.7858, -6.6006],
    population: 129430,
    centrality: 56,
    urbanType: 'urban',
    isCapital: false,
    description: 'Zone cacaoyère du Sud-Ouest'
  },
  {
    id: 'CI-DIM',
    name: 'Dimbokro',
    region: 'N\'zi',
    district: 'Lacs',
    coordinates: [6.6472, -4.7081],
    population: 67349,
    centrality: 54,
    urbanType: 'urban',
    isCapital: false,
    description: 'Centre agricole et commercial'
  },
  {
    id: 'CI-FER',
    name: 'Ferkessédougou',
    region: 'Tchologo',
    district: 'Savanes',
    coordinates: [9.5997, -5.1969],
    population: 87809,
    centrality: 57,
    urbanType: 'urban',
    isCapital: false,
    description: 'Carrefour Nord, zone agricole'
  }
];

/**
 * Obtenir une ville par son ID
 */
export function getCityById(id) {
  return ivoryCoastCities.find(city => city.id === id);
}

/**
 * Obtenir les villes par région
 */
export function getCitiesByRegion(region) {
  return ivoryCoastCities.filter(city => city.region === region);
}

/**
 * Obtenir les N villes les plus centrales
 */
export function getTopCentralCities(limit = 10) {
  return [...ivoryCoastCities]
    .sort((a, b) => b.centrality - a.centrality)
    .slice(0, limit);
}

/**
 * Obtenir les villes du cluster Abidjan
 */
export function getAbidjanCluster() {
  return ivoryCoastCities.filter(city => city.region === 'Abidjan');
}

/**
 * Population totale
 */
export function getTotalPopulation() {
  return ivoryCoastCities.reduce((sum, city) => sum + city.population, 0);
}

/**
 * Statistiques par type urbain
 */
export function getUrbanStats() {
  const stats = {
    urban: { count: 0, population: 0 },
    'peri-urban': { count: 0, population: 0 },
    rural: { count: 0, population: 0 }
  };

  ivoryCoastCities.forEach(city => {
    stats[city.urbanType].count++;
    stats[city.urbanType].population += city.population;
  });

  return stats;
}
