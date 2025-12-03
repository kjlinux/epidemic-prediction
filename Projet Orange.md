# Projet de Prédiction de Propagation Épidémique par Données de Mobilité
## Partenariat Orange Côte d'Ivoire & Institutions de Santé Publique

---

## 1. RÉSUMÉ EXÉCUTIF

### Vision du projet
Développer un système de surveillance épidémiologique prédictif basé sur les données de mobilité d'Orange CI pour anticiper et gérer efficacement les crises sanitaires en Côte d'Ivoire.

### Objectif principal
Transformer les données de mobilité anonymisées d'Orange en outil stratégique de santé publique permettant de prédire la propagation des épidémies 7 à 14 jours à l'avance.

---

## 2. CONTEXTE ET JUSTIFICATION

### 2.1 Contexte sanitaire ivoirien

La Côte d'Ivoire fait face à plusieurs défis épidémiologiques récurrents :

**Maladies endémiques**
- Paludisme (principale cause de morbidité)
- Dengue et fièvre jaune
- Méningite (surtout dans le nord pendant la saison sèche)
- Choléra (zones périurbaines avec assainissement précaire)

**Menaces épidémiques émergentes**
- COVID-19 et variants futurs
- Fièvres hémorragiques virales (Ebola, Lassa)
- Maladies à transmission vectorielle accentuées par le changement climatique

**Défis structurels**
- Capacités hospitalières limitées (environ 4 lits pour 10,000 habitants)
- Distribution inégale des infrastructures de santé (concentration à Abidjan)
- Ressources humaines insuffisantes (1 médecin pour 5,000 habitants)
- Système de surveillance épidémiologique réactif plutôt que prédictif

### 2.2 Opportunité unique d'Orange CI

**Position de leader télécoms**
- Plus de 15 millions d'abonnés mobiles (≈55% du marché)
- Couverture réseau sur 95% du territoire national
- Infrastructure 4G dans toutes les grandes villes
- Présence dans les 31 régions administratives

**Atouts techniques**
- Infrastructure Big Data déjà existante
- Équipes data analytics qualifiées
- Systèmes de sécurité et anonymisation robustes
- Expérience en projets d'innovation sociale (Orange Money, Orange Digital Center)

**Précédents internationaux**
- Orange Sénégal : Projet de cartographie de mobilité post-épidémie COVID
- Orange Mali : Partenariat avec UNICEF sur la mobilité de population
- Groupe Orange : Programme "Data for Development" (D4D)

### 2.3 Alignement stratégique

**Pour Orange CI**
- Renforcement du positionnement RSE et impact social
- Valorisation des actifs data existants
- Différenciation concurrentielle sur l'innovation sociale
- Nouvelles opportunités de partenariats institutionnels

**Pour la Côte d'Ivoire**
- Contribution aux Objectifs de Développement Durable (ODD 3 : Santé)
- Modernisation du système de santé publique
- Renforcement de la résilience nationale face aux crises sanitaires
- Positionnement comme leader régional en santé numérique

---

## 3. OBJECTIFS DU PROJET

### 3.1 Objectifs sanitaires

**Objectif principal**
Réduire de 30% le temps de réponse aux épidémies grâce à une détection précoce et une allocation optimisée des ressources.

**Objectifs spécifiques**
1. Prédire les zones à risque épidémique 7-14 jours à l'avance avec une précision >75%
2. Identifier les corridors de mobilité critiques pour la transmission
3. Optimiser le déploiement des ressources sanitaires (stocks, équipes mobiles)
4. Évaluer l'impact des mesures de restriction de mobilité avant leur mise en œuvre
5. Créer un système d'alerte précoce automatisé pour le Ministère de la Santé

### 3.2 Objectifs techniques

1. Développer une plateforme de traitement des données de mobilité en temps quasi-réel
2. Créer des modèles prédictifs calibrés sur les épidémies passées (COVID-19, dengue)
3. Produire des visualisations cartographiques interactives
4. Mettre en place une API permettant l'intégration avec les systèmes du Ministère
5. Garantir l'anonymisation totale et la conformité RGPD/législation ivoirienne

### 3.3 Objectifs de partenariat

1. Établir un cadre de collaboration formalisé entre Orange CI, le Ministère de la Santé, l'INHP (Institut National d'Hygiène Publique)
2. Créer un comité d'éthique mixte supervisant l'usage des données
3. Former 20-30 professionnels de santé publique à l'utilisation de la plateforme
4. Publier des études scientifiques valorisant l'initiative (visibilité internationale)
5. Créer un modèle reproductible pour d'autres pays Orange Africa

---

## 4. SPÉCIFICITÉS DU CONTEXTE IVOIRIEN

### 4.1 Géographie et mobilité

**Caractéristiques territoriales**
- Abidjan concentre 25% de la population nationale (5+ millions d'habitants)
- Forte migration saisonnière agricole (cacao, café, hévéa)
- Axes routiers majeurs : Abidjan-Yamoussoukro, corridor nord vers Burkina/Mali
- Zones frontalières poreuses avec 5 pays voisins

**Patterns de mobilité spécifiques**
- Migrations pendulaires massives vers Abidjan depuis banlieues (Anyama, Bingerville, Songon)
- Retours au village lors des fêtes (Ramadan, Pâques, fin d'année) - pics de mobilité
- Mobilité saisonnière agricole (octobre-mars : récoltes cacao/café)
- Flux commerciaux hebdomadaires vers grands marchés (Adjamé, Rimi, marchés de gros)
- Mobilité transfrontalière importante (Ghana, Burkina Faso, Mali)

**Implications pour la modélisation**
- Nécessité de modèles multi-échelles (intra-urbain, inter-urbain, transfrontalier)
- Prise en compte des événements calendaires (calendrier musulman, chrétien, agricole)
- Identification des super-propagateurs géographiques (marchés, gares, points de transit)

### 4.2 Infrastructure sanitaire

**Distribution actuelle**
- Abidjan : 60% des capacités hospitalières nationales
- CHU de Treichville, Cocody, Yopougon comme centres de référence
- Hôpitaux généraux dans chefs-lieux de région (souvent sous-équipés)
- Centres de santé ruraux avec capacités limitées

**Zones vulnérables identifiées**
- Nord et nord-ouest (Korhogo, Odienné) : éloignement, méningite saisonnière
- Zones périurbaines d'Abidjan : densité, assainissement précaire, choléra
- Zones frontalières : surveillance épidémiologique difficile
- San Pedro, Sassandra : ports, risques d'importation de maladies

### 4.3 Profil des abonnés Orange CI

**Segmentation pertinente**
- Urbains actifs (smartphones, fort usage data) : traceurs de mobilité fiables
- Périurbains et ruraux (feature phones, principalement voix/SMS) : couverture large
- Professionnels mobiles (transporteurs, commerçants) : patterns réguliers
- Population étudiante : forte mobilité inter-villes

**Taux de pénétration par zone**
- Abidjan et grandes villes : >90% de pénétration mobile
- Zones rurales : 60-70% de pénétration
- Couverture Orange spécifique : ~55% du marché (représentatif statistiquement)

---

## 5. DONNÉES NÉCESSAIRES

### 5.1 Données Orange (source principale)

#### Données de mobilité (CDR - Call Detail Records)

**Format requis : Matrices origine-destination agrégées**

Exemple de structure :
```
Date | Zone_Origine | Zone_Destination | Nombre_Déplacements | Tranche_Horaire
-----|--------------|------------------|---------------------|----------------
2024-03-15 | Abidjan_Plateau | Abidjan_Yopougon | 12,450 | 07h-09h
2024-03-15 | Abidjan_Cocody | Bingerville | 3,280 | 07h-09h
2024-03-15 | Abidjan | Yamoussoukro | 850 | Journée_complète
```

**Granularité spatiale**
- Niveau 1 (urbain) : Communes d'Abidjan (13 communes)
- Niveau 2 (national) : Districts et régions (31 régions)
- Niveau 3 (détaillé) : Sous-préfectures pour zones à risque

**Granularité temporelle**
- Quotidienne pour surveillance continue
- Horaire pour événements spéciaux (tranches de 3h)
- Hebdomadaire pour analyse de tendances

**Indicateurs dérivés nécessaires**
- Rayon de gyration moyen par zone (distance moyenne parcourue)
- Taux de mobilité (% population se déplaçant hors zone résidence)
- Matrice de connectivité (quelles zones sont le plus interconnectées)
- Identification domicile/travail (pour comprendre patterns pendulaires)
- Densité de population dynamique (population présente vs résidente)

#### Données contextuelles

**Profil démographique agrégé par zone**
- Distribution d'âge approximative (par catégories : <18, 18-35, 35-60, >60)
- Type d'appareil (smartphone vs feature phone - indicateur socio-économique)
- Ancienneté du compte (population stable vs mobile)

**Données d'utilisation**
- Volume de communication (indicateur d'activité économique)
- Horaires d'activité (patterns jour/nuit)
- Zones de forte affluence (événements, rassemblements)

### 5.2 Données sanitaires (partenaires institutionnels)

#### Du Ministère de la Santé et de l'INHP

**Données épidémiologiques**
- Cas confirmés quotidiens par district sanitaire
- Hospitalisations et décès
- Taux de positivité des tests
- Localisation GPS des cas (si disponible, sinon adresse déclarée)

**Infrastructure sanitaire**
- Localisation et capacité de chaque établissement de santé
- Disponibilité de lits, respirateurs, personnel
- Stock de médicaments et équipements de protection
- Centres de dépistage actifs

**Programmes de vaccination**
- Couverture vaccinale par zone
- Calendrier de campagnes de vaccination
- Sites de vaccination

#### Données historiques

**Épidémies passées pour calibration**
- COVID-19 (2020-2023) : vagues, mesures prises, impact
- Dengue (épidémies 2019, 2022)
- Choléra (flambées périurbaines)
- Méningite (saisons 2018-2024 dans le nord)

### 5.3 Données contextuelles complémentaires

#### Données géographiques et environnementales

**OpenStreetMap et sources officielles**
- Réseau routier, ferroviaire, aérien
- Localisation des marchés, gares routières, points de transit
- Zones d'habitation denses
- Cours d'eau (risque choléra)

**Données climatiques**
- Température, humidité, pluviométrie (SODEXAM)
- Saisons (impact sur maladies vectorielles)

#### Données socio-économiques

**De l'INS (Institut National de la Statistique)**
- Recensement de population par localité
- Données de migration et urbanisation
- Calendrier agricole et marchés

**Événements planifiés**
- Calendrier scolaire et universitaire
- Fêtes religieuses et culturelles
- Grands événements sportifs, culturels
- Marchés hebdomadaires importants

### 5.4 Architecture des données

**Flux de données proposé**

```
┌─────────────────────┐
│  Réseau Orange CI   │
│   (CDR, Antennes)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Plateforme de      │
│  Traitement Orange  │
│  (Anonymisation)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐         ┌──────────────────┐
│   Base de Données   │◄────────│  Données Santé   │
│   Mobilité Agrégée  │         │  (Min. Santé)    │
└──────────┬──────────┘         └──────────────────┘
           │
           ▼
┌─────────────────────┐
│  Modèles Prédictifs │
│  (Machine Learning) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Tableau de Bord    │
│  & Alertes          │
│  (Min. Santé/INHP)  │
└─────────────────────┘
```

**Fréquence de mise à jour**
- Données mobilité : Traitement quotidien (J+1)
- Données épidémiologiques : Mise à jour quotidienne
- Prédictions : Actualisées chaque jour
- Rapports : Hebdomadaires + alertes temps réel

**Volume de données estimé**
- Données brutes CDR : Plusieurs To/mois (conservées par Orange)
- Données agrégées transférées : ~100-500 Mo/jour
- Base de données projet : ~50-100 Go première année

---

## 6. EXEMPLES CONCRETS D'UTILISATION

### 6.1 Scénario 1 : Épidémie de dengue à Abidjan

**Situation**
Mars 2025 : L'INHP détecte une augmentation des cas de dengue à Yopougon (100 cas en une semaine).

**Utilisation du système**

**Jour 1 : Détection**
- Le système identifie Yopougon comme zone à transmission active
- Analyse automatique des flux de mobilité depuis Yopougon vers autres communes

**Jour 2-3 : Prédiction**
- Le modèle prédit que Abobo et Adjamé recevront 3,000-4,000 personnes/jour depuis Yopougon
- Risque élevé de transmission vers ces zones dans 5-7 jours
- Port-Bouët et Treichville : risque moyen (1,500 personnes/jour)

**Jour 4-5 : Action préventive**
- Le Ministère déploie préventivement des équipes de sensibilisation à Abobo et Adjamé
- Distribution de moustiquaires et répulsifs dans ces zones
- Activation de centres de dépistage avant l'arrivée des cas

**Résultat**
- Détection précoce de 70% des cas dans les zones prédites
- Réduction de 40% de la propagation par rapport à une épidémie non anticipée
- Économie de ressources (ciblage précis vs couverture large)

### 6.2 Scénario 2 : Préparation pour grande fête religieuse

**Situation**
Ramadan 2025 : Fin du jeûne avec retours massifs au village prévus.

**Utilisation du système**

**3 semaines avant**
- Analyse des patterns historiques (Ramadan 2023, 2024)
- Identification des principales routes migratoires : Abidjan → Nord (Korhogo, Boundiali), Abidjan → Ouest (Man, Danané)
- Estimation : 500,000 déplacements sur 3-4 jours

**2 semaines avant**
- Si une épidémie est active à Abidjan (ex: grippe), le modèle prédit :
  - Korhogo recevra 15,000 personnes d'Abidjan (probabilité 80% d'introduction du virus)
  - Bouaké : 25,000 personnes (probabilité 95% d'introduction)
  - Man : 8,000 personnes (probabilité 65%)

**1 semaine avant**
- Le Ministère prépare :
  - Stocks de médicaments et tests dans hôpitaux de Korhogo et Bouaké
  - Équipes mobiles aux gares routières principales
  - Messages de sensibilisation diffusés par Orange (SMS ciblés)

**Résultat**
- Système de santé préparé avant l'arrivée de la vague de cas
- Évitement de saturation hospitalière
- Communication préventive efficace

### 6.3 Scénario 3 : Évaluation de mesures de restriction

**Situation**
Une nouvelle épidémie nécessite potentiellement des restrictions de déplacement.

**Utilisation du système**

**Simulation avant décision**
- Le gouvernement envisage de fermer les liaisons Abidjan-intérieur pendant 2 semaines
- Le système simule l'impact sur la propagation :
  - Scénario A : Fermeture totale → réduction de 75% des flux → ralentissement épidémie de 60%
  - Scénario B : Fermeture partielle (50% réduction) → ralentissement de 35%
  - Scénario C : Pas de restriction → propagation complète en 3 semaines

**Analyse coût-bénéfice**
- Scénario A : Impact économique fort mais épidémie contrôlée en 1 mois
- Scénario B : Équilibre entre économie et santé, épidémie sur 6 semaines
- Données objectives pour décision politique

**Monitoring pendant mise en œuvre**
- Si Scénario B choisi, le système monitore en temps réel l'efficacité réelle
- Ajustement des mesures si la réduction observée est inférieure à l'objectif

**Résultat**
- Décisions basées sur données réelles plutôt qu'intuition
- Optimisation du rapport bénéfice sanitaire / coût économique
- Transparence et communication publique facilitée

### 6.4 Scénario 4 : Alerte transfrontalière

**Situation**
Épidémie de fièvre Lassa détectée en Guinée, proche de la frontière ivoirienne.

**Utilisation du système**

**Monitoring des zones frontalières**
- Surveillance accrue de la mobilité vers/depuis Odienné, Touba, Danané
- Détection d'une augmentation de 30% des flux depuis la Guinée (commerce, migrations)

**Alerte précoce**
- Le système alerte l'INHP sur le risque d'importation de cas
- Identification des corridors à surveiller prioritairement

**Déploiement ciblé**
- Postes de dépistage aux points d'entrée identifiés par données de mobilité
- Sensibilisation des établissements de santé des sous-préfectures frontalières
- Coordination avec autorités guinéennes

**Résultat**
- Détection et isolation de cas importés avant propagation locale
- Prévention d'une épidémie nationale

---

## 7. PLUS-VALUE DU PROJET

### 7.1 Pour Orange Côte d'Ivoire

#### Impact RSE et réputation

**Leadership en innovation sociale**
- Positionnement comme entreprise citoyenne engagée pour la santé publique
- Premier opérateur télécom en Afrique de l'Ouest avec système prédictif épidémique opérationnel
- Valorisation médiatique nationale et internationale

**Communication et marque**
- Campagnes de communication autour du projet ("Orange protège la santé des Ivoiriens")
- Reconnaissance institutionnelle (prix, distinctions RSE)
- Attraction de talents sensibles à l'impact social

#### Valorisation des actifs data

**Monétisation indirecte**
- Les données CDR sont déjà collectées (coût marginal faible)
- Création de valeur à partir d'actifs sous-utilisés
- Modèle potentiellement réplicable dans d'autres pays Orange Africa

**Développement de compétences**
- Montée en compétence des équipes data science Orange CI
- Expertise unique en épidémiologie numérique
- Capacité à répondre à des appels d'offres internationaux (OMS, Banque Mondiale)

#### Relations institutionnelles

**Renforcement des partenariats**
- Relation privilégiée avec le Ministère de la Santé
- Collaborations avec universités ivoiriennes (recherche, stages)
- Porte d'entrée pour d'autres projets gouvernementaux (smart cities, agriculture)

**Facilitation réglementaire**
- Bonne volonté des régulateurs pour entreprise contributrice au bien public
- Potentiel de contreparties (licences, fréquences, projets futurs)

#### Opportunités commerciales indirectes

**Orange Money**
- Intégration possible : paiements pour tests/vaccins via Orange Money
- Remboursements assurance santé Orange
- Micro-assurance santé basée sur données épidémiologiques

**Services à valeur ajoutée**
- Alertes santé personnalisées pour abonnés (SMS premium)
- Applications santé connectées
- Services B2B pour entreprises (gestion sanitaire des employés)

### 7.2 Pour la Côte d'Ivoire

#### Impact sanitaire direct

**Vies sauvées**
- Réduction estimée de 20-30% de la mortalité épidémique grâce à l'anticipation
- Sur une épidémie majeure (type COVID) : potentiellement des milliers de vies
- Détection précoce de 50-70% des foyers épidémiques émergents

**Optimisation des ressources**
- Allocation efficiente de ressources sanitaires limitées
- Réduction du gaspillage (médicaments, équipements mal distribués)
- Économie estimée : 15-25% des coûts de gestion épidémique

**Renforcement du système de santé**
- Modernisation de la surveillance épidémiologique
- Formation de professionnels aux outils numériques
- Infrastructure pérenne au-delà du projet initial

#### Impact économique

**Réduction des coûts directs**
- Moins d'hospitalisations prolongées
- Moins de décès (perte de capital humain)
- Réduction des dépenses publiques en urgence sanitaire

**Réduction des coûts indirects**
- Moins de perturbations économiques (fermetures, confinements)
- Restrictions ciblées plutôt que généralisées
- Maintien de l'activité économique dans zones non affectées

**Attractivité économique**
- Image de pays capable de gérer les risques sanitaires
- Confiance des investisseurs étrangers
- Tourisme et voyages d'affaires sécurisés

#### Positionnement régional et international

**Leadership CEDEAO**
- Modèle pour autres pays d'Afrique de l'Ouest
- Plateforme de coopération sanitaire régionale
- Expertise exportable (consulting, formations)

**Reconnaissance internationale**
- Publications scientifiques de haut niveau
- Présentations dans conférences internationales (OMS, Union Africaine)
- Attractivité pour bailleurs de fonds (Banque Mondiale, Fondation Gates)

**Objectifs de Développement Durable**
- Contribution directe à l'ODD 3 (Bonne santé et bien-être)
- Contribution indirecte aux ODD 9 (Innovation), 11 (Villes durables), 17 (Partenariats)

### 7.3 Pour la recherche scientifique

#### Avancées méthodologiques

**Publications académiques**
- Études sur patterns de mobilité en Afrique subsaharienne
- Validation de modèles épidémiologiques en contexte africain
- Approches innovantes d'anonymisation et éthique des données

**Base de données unique**
- Données longitudinales rares en Afrique
- Opportunités de recherche pour doctorants, post-docs
- Collaborations internationales (universités européennes, américaines)

#### Formation et transfert de compétences

**Université Félix Houphouët-Boigny, INP-HB**
- Stages pour étudiants en data science, santé publique
- Sujets de thèses et mémoires
- Enseignements sur cas réels ivoiriens

**Écosystème d'innovation**
- Stimulation de startups healthtech ivoiriennes
- Hackathons et challenges autour des données santé
- Création d'emplois qualifiés (data scientists, épidémiologistes)

---

## 8. ARCHITECTURE TECHNIQUE ET IMPLÉMENTATION

### 8.1 Architecture système globale

#### Couche 1 : Collecte et anonymisation (Orange CI)

**Infrastructure existante**
- Serveurs CDR d'Orange (déjà en place)
- Système de billing et géolocalisation des antennes

**Traitement pour le projet**
- **Extraction quotidienne** : Requêtes SQL automatisées sur bases CDR
- **Anonymisation** : 
  - Suppression de tous identifiants personnels (IMSI, numéros de téléphone)
  - Agrégation spatiale (minimum 50 appareils par zone pour éviter ré-identification)
  - Agrégation temporelle (tranches horaires, jamais données instantanées)
  - Hachage cryptographique des identifiants techniques transitoires

**Exemple de pipeline anonymisation**
```
Données brutes CDR → Suppression identifiants → Agrégation spatiale → 
Agrégation temporelle → Vérification k-anonymat (k≥50) → Export sécurisé
```

**Output**
- Fichiers CSV ou JSON quotidiens
- Format standardisé (origine, destination, volume, timestamp)
- Stockage sécurisé accessible uniquement via API dédiée

#### Couche 2 : Plateforme de traitement et modélisation

**Infrastructure recommandée**

**Option A : Cloud public** (Microsoft Azure, AWS, Google Cloud)
- Avantages : Scalabilité, services ML intégrés, sécurité certifiée
- Inconvénients : Coûts récurrents, dépendance externe
- Coût estimé : 500,000 - 1M FCFA/mois

**Option B : Infrastructure locale** (Data Center Orange ou gouvernemental)
- Avantages : Souveraineté des données, coûts long terme plus bas
- Inconvénients : Investissement initial, maintenance
- Recommandation : Hybride (stockage local, compute cloud pour ML)

**Composants techniques**

**Base de données**
- PostgreSQL + PostGIS (données géospatiales)
- Schéma optimisé pour requêtes temporelles et spatiales
- Indexation sur date, zone_origine, zone_destination

**Stack de traitement**
- Python 3.10+ (langage principal)
- Pandas, GeoPandas (manipulation de données)
- Apache Airflow (orchestration des pipelines quotidiens)
- Docker/Kubernetes (containerisation, déploiement)

**Modèles prédictifs**

**Modèle 1 : Matrices de mobilité prédictives**
- Algorithme : SARIMA (Seasonal AutoRegressive Integrated Moving Average)
- Objectif : Prédire les flux futurs basés sur historique et saisonnalité
- Input : Historique de mobilité, calendrier, météo
- Output : Matrice origine-destination prédite à J+7, J+14

**Modèle 2 : Propagation épidémique**
- Algorithme : SEIR métapopulationnel (Susceptible-Exposé-Infecté-Retiré)
- Équations différentielles couplées entre zones
- Paramètres calibrés sur épidémies passées (COVID-19, dengue)
- Input : Cas actuels par zone + matrice de mobilité
- Output : Nombre de cas prédits par zone à différents horizons

**Modèle 3 : Machine Learning pour détection précoce**
- Algorithme : Random Forest ou XGBoost
- Features : Mobilité anormale, agrégation de cas, saisonnalité, météo
- Objectif : Détecter émergence épidémique avant signalement officiel massif
- Output : Score de risque épidémique par zone (0-100)

**Exemple de workflow quotidien automatisé**
```
00h00 : Orange génère fichier mobilité J-1
02h00 : Transfert sécurisé vers plateforme projet
03h00 : Ingestion en base de données
04h00 : Mise à jour modèles prédictifs
05h00 : Génération des prédictions J+7, J+14
06h00 : Détection d'anomalies et alertes automatiques
07h00 : Mise à jour tableau de bord web
08h00 : Rapport quotidien envoyé au Ministère de la Santé
```

#### Couche 3 : Visualisation et interface utilisateur

**Tableau de bord web (pour Ministère, INHP)**

**Technologies**
- Frontend : React.js + Mapbox GL (cartes interactives)
- Backend : FastAPI (Python)
- Authentification : OAuth 2.0 + gestion de rôles

**Fonctionnalités principales**

**Vue carte interactive**
- Carte de Côte d'Ivoire avec zones colorées selon risque épidémique
- Flux de mobilité animés (origine → destination)
- Sélection de date, type d'épidémie, horizon de prédiction
- Zoom sur Abidjan avec niveau commune

**Tableau de bord synthétique**
- Indicateurs clés : Nombre de zones à risque élevé, mobilité vs moyenne historique
- Graphiques temporels : Évolution des cas prédits vs observés
- Classement des zones par risque
- Alertes actives (changements significatifs détectés)

**Module de simulation**
- Interface pour tester scénarios ("Que se passe-t-il si mobilité réduite de X% ?")
- Comparaison de scénarios côte-à-côte
- Export de rapports pour décideurs

**Système d'alertes**
- Emails automatiques si seuils dépassés
- SMS pour alertes critiques
- Webhooks pour intégration avec systèmes du Ministère

#### Couche 4 : Sécurité et conformité

**Mesures de sécurité**

**Chiffrement**
- Données en transit : TLS 1.3
- Données au repos : AES-256
- Clés de chiffrement gérées par HSM (Hardware Security Module)

**Contrôle d'accès**
- Authentification multi-facteurs obligatoire
- Principe du moindre privilège (accès basé sur rôle)
- Logs d'audit complets (qui accède à quoi, quand)
- Révision trimestrielle des accès

**Conformité légale**
- Respect de la loi ivoirienne sur protection des données personnelles
- Conformité RGPD (standard international)
- Comité d'éthique supervisant l'usage des données
- Audits annuels par tiers indépendant

**Anonymisation renforcée**
- K-anonymat : Minimum 50 individus par groupe
- L-diversité : Diversité des attributs sensibles
- Differential privacy : Ajout de bruit statistique pour empêcher inférence

### 8.2 Plan de déploiement par phases

#### Phase 1 : Projet pilote 

**Périmètre limité**
- Zone géographique : Abidjan uniquement (13 communes)
- Épidémie cible : Dengue (historique disponible)
- Participants : Orange CI, INHP, CHU de Treichville

**Objectifs**
- Valider la chaîne technique complète
- Calibrer les modèles sur données réelles
- Former les premiers utilisateurs
- Identifier les problèmes techniques et organisationnels

**Livrables**
- Plateforme fonctionnelle pour Abidjan
- Rapport de validation scientifique
- Recommandations pour passage à l'échelle nationale

#### Phase 2 : Extension nationale 

**Périmètre élargi**
- Couverture : 31 régions de Côte d'Ivoire
- Épidémies : COVID-19, dengue, méningite, choléra
- Participants : Ajout des directions régionales de santé

**Objectifs**
- Déploiement de la plateforme à l'échelle nationale
- Intégration avec système d'information sanitaire national
- Formation de 50+ professionnels de santé

**Livrables**
- Plateforme nationale opérationnelle
- Réseau de points focaux formés dans chaque région
- Procédures standardisées de réponse aux alertes

#### Phase 3 : Optimisation et pérennisation 

**Amélioration continue**
- Affinement des modèles basé sur nouvelles données
- Ajout de nouvelles fonctionnalités (prédiction climat, intégration vaccination)
- Extension à d'autres maladies

**Durabilité**
- Transfert progressif de compétences au Ministère/INHP
- Modèle économique pour maintenance long terme
- Documentation complète et formation continue

**Expansion régionale**
- Collaboration avec pays voisins (Ghana, Burkina, Mali)
- Modèle transfrontalier pour épidémies régionales
- Partage d'expertise avec autres pays Orange Africa

### 8.3 Ressources humaines nécessaires

#### Équipe Orange CI (4-6 personnes dédiées)

**Data Engineers (2 personnes)**
- Extraction et anonymisation des données CDR
- Maintenance des pipelines de traitement
- Gestion de l'infrastructure technique

**Data Scientists (2 personnes)**
- Développement et calibration des modèles prédictifs
- Analyses ad hoc pour questions spécifiques
- Recherche et amélioration continue

**Chef de projet / Product Manager (1 personne)**
- Coordination avec partenaires (Ministère, INHP)
- Gestion du planning et des livrables
- Communication et reporting

**Expert sécurité / conformité (0.5 ETP)**
- Supervision anonymisation et protection données
- Audits réguliers
- Gestion des risques

#### Équipe Ministère de la Santé / INHP 

**Épidémiologistes (2 personnes)**
- Validation médicale des prédictions
- Interprétation des résultats
- Liaison avec services de terrain

**Analyste de données santé (1 personne)**
- Intégration des données épidémiologiques
- Utilisation quotidienne de la plateforme
- Formation d'autres utilisateurs

**Coordinateur opérationnel (1 personne)**
- Coordination des réponses aux alertes
- Communication avec régions sanitaires
- Suivi des indicateurs de performance

#### Partenaires externes (selon besoins)

**Consultant épidémiologiste international** (Phase 1)
- Validation méthodologique
- Calibration initiale des modèles
- Transfert d'expertise

**Développeur web** (Contractuel pour tableau de bord)
- Développement interface utilisateur
- Maintenance applicative

**Auditeur indépendant** (Annuel)
- Audit sécurité et conformité
- Recommandations d'amélioration


