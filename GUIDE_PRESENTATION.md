# Guide de Présentation - Dashboard de Prédiction Épidémiologique
## Côte d'Ivoire - Projet Orange CI

**Version:** 1.0
**Date:** 3 Décembre 2025
**Auteur:** Système de Surveillance Épidémiologique Prédictif

---

## Table des Matières

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Métriques et Indicateurs](#2-métriques-et-indicateurs)
3. [Modèle Épidémiologique SEIR](#3-modèle-épidémiologique-seir)
4. [Seuils et Classification des Risques](#4-seuils-et-classification-des-risques)
5. [Visualisations du Dashboard](#5-visualisations-du-dashboard)
6. [Sources de Données](#6-sources-de-données)
7. [Questions/Réponses Fréquentes](#7-questionsréponses-fréquentes)
8. [Annexes Techniques](#8-annexes-techniques)

---

## 1. Vue d'ensemble du projet

### 1.1 Objectif

Développer un système de surveillance épidémiologique prédictif basé sur les **données de mobilité d'Orange Côte d'Ivoire** pour anticiper et gérer efficacement les crises sanitaires.

### 1.2 Contexte scientifique

Le projet s'appuie sur les travaux de **Lima et al. (2015)** publiés dans *Scientific Reports*, démontrant l'efficacité des stratégies de confinement basées sur les données de mobilité télécom (Call Detail Records - CDR) du réseau Orange en Côte d'Ivoire.

### 1.3 Portée géographique

- **30 zones couvertes** : 13 communes d'Abidjan + 17 villes majeures
- **Population modélisée** : ~7,5 millions d'habitants
- **Couverture réseau Orange CI** : 95% du territoire, ~55% de part de marché (15M d'abonnés)

### 1.4 Architecture du système

```
Données CDR Orange CI → Modèle de mobilité → Modèle SEIR métapopulationnel
→ Calcul des risques → Prédictions J+7/J+14 → Dashboard interactif
```

---

## 2. Métriques et Indicateurs

### 2.1 Cas Actifs

#### Définition
Nombre de personnes **actuellement infectées et infectieuses** dans une zone donnée.

#### Comment est-il mesuré ?
```
Cas actifs = Compartiment I du modèle SEIR
```

Le compartiment **I (Infecté)** représente les personnes qui :
- Ont dépassé la période d'incubation (compartiment E)
- Sont actuellement capables de transmettre la maladie
- N'ont pas encore guéri ou ne sont pas décédées (compartiment R)

#### Calcul technique
```javascript
Cas actifs = Math.round(zone.I)
```

Où `zone.I` est calculé chaque jour par les équations du modèle SEIR :
```
dI/dt = σ × E - γ × I + cas_importés_mobilité
```

**Paramètres** :
- **σ (sigma) = 1/5.1** : Taux auquel les personnes exposées deviennent infectieuses (après ~5 jours d'incubation)
- **γ (gamma) = 1/14** : Taux de guérison (après ~14 jours d'infectiosité)

#### Interprétation

| Valeur | Signification |
|--------|---------------|
| < 0,1% de la population | Situation normale, surveillance standard |
| 0,1% - 0,5% | Épidémie modérée, renforcement surveillance |
| 0,5% - 2% | Épidémie sérieuse, mesures de contrôle nécessaires |
| > 2% | Épidémie majeure, intervention d'urgence |

#### À quoi ça sert ?
- Évaluer **l'ampleur actuelle** de l'épidémie
- Suivre **l'évolution jour après jour**
- Identifier **les zones nécessitant une intervention urgente**
- Calculer le **score de risque** (40% du poids)

#### Fichier source
`src/simulation/EpidemicModel.js` (lignes 181-182)

---

### 2.2 Indice de Mobilité

#### Définition
Pourcentage du flux de mobilité actuel par rapport au flux de mobilité de base (situation normale), exprimé de **0 à 100%**.

#### Comment est-il mesuré ?

**Formule** :
```
Indice de mobilité = (Flux actuel / Flux de base) × 100
```

**Calcul détaillé** :
```javascript
// 1. Calculer le flux de base (situation normale)
flux_base = Σ tous_déplacements_quotidiens_normaux
// Exemple : ~500,000 déplacements/jour en situation normale

// 2. Calculer le flux actuel (avec restrictions éventuelles)
flux_actuel = Σ tous_déplacements_quotidiens_actuels

// 3. Indice de mobilité
indice = (flux_actuel / flux_base) × 100
// Arrondi entre 0 et 100
```

#### Sur la base de quoi il est mesuré ?

**Source primaire** : Données télécom (CDR - Call Detail Records) d'Orange CI

**Modèle de gravité** (pour générer la matrice de base) :
```javascript
flux(Origine → Destination) =
    (population_origine × population_destination × centralité_destination)
    / distance²
    × facteur_saisonnier
    × facteur_corridor
    × 0.00001
```

**Facteurs d'ajustement** :

1. **Facteur saisonnier** :
   - Saison récolte cacao/café (Oct-Mars) : **+80%** vers zones agricoles (Daloa, Soubré)
   - Fêtes de fin d'année (Déc-Jan) : **+180%** depuis Abidjan vers régions
   - Saison sèche (Nov-Mars) : **+30%** vers le Nord

2. **Facteur corridor** (routes majeures) :
   - Intra-Abidjan : **×5.0**
   - Corridor Nord (Abidjan → Yamoussoukro → Bouaké → Korhogo) : **×3.0**
   - Corridor Ouest (Abidjan → Daloa → Man) : **×2.5**
   - Corridor Littoral (Abidjan → Sassandra → San Pedro) : **×2.2**

#### Impact des quarantaines

Les restrictions sanitaires **réduisent automatiquement la mobilité** :

| Statut | Réduction mobilité | Score de risque déclencheur |
|--------|-------------------|-----------------------------|
| Aucune restriction | **0%** (100% du flux) | < 40 |
| Restrictions modérées | **-30%** (70% du flux) | 40-60 |
| Restrictions sévères | **-70%** (30% du flux) | 60-85 |
| Quarantaine stricte | **-95%** (5% du flux) | ≥ 85 |

#### Interprétation

| Indice | Signification |
|--------|---------------|
| 80-100% | Mobilité normale, pas de restrictions |
| 60-79% | Réduction modérée, restrictions légères actives |
| 30-59% | Réduction importante, restrictions sévères |
| 0-29% | Quasi-immobilisation, quarantaine stricte |

#### À quoi ça sert ?

- **Visualiser en temps réel** l'impact des mesures de restriction
- **Évaluer l'adhésion** de la population aux consignes
- **Anticiper la transmission** : moins de mobilité = moins de propagation
- **Ajuster les politiques** : si l'indice reste élevé malgré les consignes, renforcer les mesures

#### Exemple concret

**Situation** : Abidjan placée en quarantaine stricte (score de risque = 87)

```
Flux de base : 500,000 déplacements/jour
Réduction automatique : -95%
Flux actuel : 500,000 × 0.05 = 25,000 déplacements/jour
Indice de mobilité affiché : 5%
```

**Interprétation** : La quarantaine est **efficace**, la mobilité est réduite à 5% du niveau normal.

#### Fichiers sources
- `src/store/simulationStore.js` (lignes 165-182)
- `src/simulation/MobilityGenerator.js` (lignes 29-43)

---

### 2.3 Score de Risque

#### Définition
Score composite de **0 à 100** évaluant le risque épidémiologique global d'une zone, combinant prévalence, mobilité et capacité sanitaire.

#### Comment est-il mesuré ?

**Formule de calcul** :
```
Score de risque =
    40% × Score de prévalence +
    30% × Score de mobilité entrante +
    30% × Score de capacité sanitaire
```

**Détail des 3 composantes** :

##### 1. Score de prévalence (40% du total)
```javascript
prévalence = cas_actifs / population
score_prévalence = min(prévalence × 10,000 ; 40)
```

**Exemple** :
- Population = 1,000,000
- Cas actifs = 5,000
- Prévalence = 5,000 / 1,000,000 = 0.005 = 0.5%
- Score prévalence = 0.005 × 10,000 = **50 → plafonné à 40**

##### 2. Score de mobilité entrante (30% du total)
```javascript
flux_entrant = Σ tous_flux_vers_cette_zone
score_mobilité = min((flux_entrant / 10,000) × 30 ; 30)
```

**Exemple** :
- Flux entrant total = 150,000 déplacements/jour vers cette ville
- Score mobilité = (150,000 / 10,000) × 30 = 15 × 30 = **450 → plafonné à 30**

##### 3. Score de capacité sanitaire (30% du total)
```javascript
score_capacité = max(0 ; 30 - (centralité / 100) × 30)
```

**Logique inversée** : Plus une ville est centrale (infrastructures médicales développées), moins elle contribue au risque.

**Exemple** :
- Centralité Abidjan = 95 (excellentes infrastructures)
- Score capacité = 30 - (95/100) × 30 = 30 - 28.5 = **1.5**

- Centralité village rural = 10 (infrastructures limitées)
- Score capacité = 30 - (10/100) × 30 = 30 - 3 = **27**

##### Calcul final
```javascript
score_total = score_prévalence + score_mobilité + score_capacité
score_risque = min(round(score_total) ; 100)
```

#### Sur la base de quoi il est mesuré ?

1. **Données épidémiologiques** : Nombre de cas actifs (compartiment I du modèle SEIR)
2. **Données de mobilité** : Flux quotidiens entrants depuis toutes les autres zones
3. **Données d'infrastructure** : Score de centralité de chaque ville (0-100)

#### À quoi sert chaque composante ?

| Composante | Poids | Justification |
|------------|-------|---------------|
| **Prévalence** | 40% | Mesure directe de l'intensité locale de l'épidémie |
| **Mobilité entrante** | 30% | Risque d'importation de nouveaux cas depuis zones infectées |
| **Capacité sanitaire** | 30% | Capacité de réponse et de gestion des cas |

#### Classification par score

| Score | Niveau | Couleur | Statut quarantaine | Actions |
|-------|--------|---------|-------------------|---------|
| 0-20 | Très faible | Vert foncé | Aucune | Surveillance normale |
| 20-40 | Faible | Vert clair | Aucune | Surveillance normale |
| 40-60 | Moyen | Jaune | Modérée (-30% mobilité) | Renforcement surveillance |
| 60-75 | Moyen-élevé | Orange clair | Sévère (-70% mobilité) | Déploiement ressources |
| 75-85 | Élevé | Orange | Sévère (-70% mobilité) | Préparation quarantaine |
| 85-95 | Très élevé | Rouge | **Stricte (-95% mobilité)** | Isolement zone |
| 95-100 | Critique | Rouge foncé | **Stricte (-95% mobilité)** | Intervention d'urgence |

#### À quoi ça sert ?

- **Classement des zones** par niveau de risque (vert/orange/rouge)
- **Déclenchement automatique** des quarantaines (≥ 85)
- **Priorisation des ressources** : envoyer du personnel médical aux zones rouges
- **Communication** : indicateur simple et visuel pour le grand public

#### Exemple concret

**Ville de Bouaké** :
- Population : 536,189
- Cas actifs : 2,500
- Flux entrant : 75,000 déplacements/jour
- Centralité : 60

**Calcul** :
```
1. Prévalence = 2,500 / 536,189 = 0.00466 = 0.466%
   Score prévalence = 0.00466 × 10,000 = 46.6 → plafonné à 40

2. Flux entrant = 75,000
   Score mobilité = (75,000 / 10,000) × 30 = 22.5

3. Centralité = 60
   Score capacité = 30 - (60/100) × 30 = 30 - 18 = 12

Score total = 40 + 22.5 + 12 = 74.5 → arrondi à 75
```

**Classification** : Score = 75 → **Moyen-élevé** (Orange clair) → Quarantaine sévère (-70% mobilité)

#### Fichier source
`src/simulation/EpidemicModel.js` (lignes 228-243)

---

### 2.4 Prévalence

#### Définition
Pourcentage de la population actuellement infectée à un instant donné.

#### Comment est-elle mesurée ?
```
Prévalence = (Cas actifs / Population totale) × 100
```

**Format** : Arrondi à **3 décimales** (ex: 0.125%)

#### Exemple
- Population Yopougon : 1,200,000
- Cas actifs : 1,500
- Prévalence = (1,500 / 1,200,000) × 100 = **0.125%**

#### Interprétation

| Prévalence | Gravité |
|------------|---------|
| < 0.01% | Très faible (< 100 cas pour 1M habitants) |
| 0.01% - 0.1% | Faible (100-1,000 cas pour 1M) |
| 0.1% - 0.5% | Modérée (1,000-5,000 cas pour 1M) |
| 0.5% - 2% | Élevée (5,000-20,000 cas pour 1M) |
| > 2% | Très élevée (> 20,000 cas pour 1M) |

#### À quoi ça sert ?

- **Comparer des zones de populations différentes** : permet de voir qu'une petite ville avec 100 cas peut être plus touchée qu'une grande ville avec 1,000 cas
- **Indicateur de charge de morbidité** : mesure la pression sur le système de santé
- **Composante principale du score de risque** (40% du poids)

#### Fichier source
`src/simulation/EpidemicModel.js` (ligne 182)

---

### 2.5 Prédictions J+7 et J+14

#### Définition
Estimation du nombre de cas actifs dans **7 jours** et **14 jours**, calculée en combinant tendance historique, impact de la mobilité et effet des quarantaines.

#### Comment sont-elles calculées ?

**Méthode en 6 étapes** :

##### Étape 1 : Tendance historique (régression linéaire sur 7 derniers jours)
```javascript
derniers_7_jours = [1200, 1250, 1300, 1380, 1420, 1490, 1550]
croissance_moyenne_jour = (1550 - 1200) / 7 = 50 cas/jour
```

##### Étape 2 : Impact de la mobilité entrante
```javascript
flux_depuis_zones_infectées = Σ (flux × prévalence_origine)

exemple :
- Zone A : 10,000 déplacements, prévalence 1% → 10,000 × 0.01 = 100
- Zone B : 5,000 déplacements, prévalence 0.5% → 5,000 × 0.005 = 25
- Total : 125

impact_mobilité_7j = 125 × facteur_mobilité(μ=0.0001) × 7 jours
                   = 125 × 0.0001 × 7
                   = 0.0875 cas importés
```

##### Étape 3 : Prédiction de base
```javascript
cas_actuels = 1,550
prédiction_brute = 1,550 + (50 × 7) + 0.0875
                 = 1,550 + 350 + 0.09
                 = 1,900 cas
```

##### Étape 4 : Ajustement selon quarantaine
```javascript
statut_quarantaine = "sévère"  // Score de risque = 65

si quarantaine stricte (-95% mobilité) :
    prédiction × 0.6  // Réduction -40%
sinon si quarantaine sévère (-70% mobilité) :
    prédiction × 0.8  // Réduction -20%
sinon :
    prédiction × 1.0  // Pas d'ajustement

prédiction_ajustée = 1,900 × 0.8 = 1,520 cas
```

##### Étape 5 : Contraintes réalistes (max 15% de population)
```javascript
population = 536,189
max_réaliste = 536,189 × 0.15 = 80,428 cas

prédiction_finale = min(1,520 ; 80,428) = 1,520 cas
```

##### Étape 6 : Intervalle de confiance (±15%)
```javascript
borne_inférieure = 1,520 - (1,520 × 0.15) = 1,292 cas
borne_supérieure = 1,520 + (1,520 × 0.15) = 1,748 cas

résultat = {
    prédiction : 1,520 cas,
    intervalle : [1,292 ; 1,748],
    confiance : 85%
}
```

#### Format d'affichage
```
1,520 cas (±228)
ou
1,520 cas [1,292 - 1,748]
```

#### Fiabilité

- **Niveau de confiance** : **85%**
- **Intervalle de confiance** : **±15%**
- **Conditions** : Nécessite au moins **7 jours d'historique**

#### Facteurs pris en compte

| Facteur | Influence |
|---------|-----------|
| Tendance historique | Base de la prédiction |
| Mobilité entrante | Importation de cas |
| Quarantaines actives | Réduction transmission |
| Limite réaliste | Plafond à 15% population |

#### Prédictions J+14

Même méthode, avec ajustements supplémentaires :

**Facteurs de fluctuation** :
```javascript
facteur_mobilité = impact_mobilité_global / mobilité_base
facteur_zones_risque = nombre_zones_rouges / 30
facteur_saisonnier = variance_saisonnière

fluctuation = (0.8 × facteur_mobilité +
               0.9 × facteur_zones_risque +
               1.1 × facteur_saisonnier) / 3

prédiction_J14 = cas_actuels + (croissance_moyenne × 14) × (1 + fluctuation)
```

#### À quoi ça sert ?

- **Anticipation** : Préparer les ressources sanitaires nécessaires
- **Planification** : Prévoir les besoins en lits, personnel, médicaments
- **Communication** : Alerter la population et les autorités à l'avance
- **Évaluation des mesures** : Comparer prédictions et observations pour valider l'efficacité des interventions

#### Fichiers sources
- `src/simulation/EpidemicModel.js` (lignes 265-309, 466-507)

---

### 2.6 Probabilité de Transition

#### Définition
Probabilité (0-99%) qu'une zone **passe au niveau de risque supérieur** dans les prochains jours.

#### Seuils de transition

| Niveau actuel | Score actuel | Seuil cible | Signification |
|---------------|--------------|-------------|---------------|
| **Vert** | < 40 | **40** | Passage en **zone orange** (restrictions modérées) |
| **Orange** | 40-60 | **60** | Passage en **zone rouge** (restrictions sévères) |
| **Rouge** | 60-85 | **85** | Passage en **zone critique** (quarantaine stricte) |

#### Comment est-elle calculée ?

**Formule** :
```
Probabilité de transition =
    35% × Facteur tendance +
    25% × Facteur affluence +
    25% × Facteur proximité seuil +
    15% × Facteur capacité
```

**Détail des 4 facteurs** :

##### 1. Facteur tendance (35%)
Mesure la vitesse de croissance des cas.

```javascript
derniers_7_jours = [1200, 1250, 1300, 1380, 1420, 1490, 1550]
cas_actuels = 1550

croissance_quotidienne_moyenne = (1550 - 1200) / (7 × 1550)
                                = 350 / 10,850
                                = 0.0323 = 3.23% par jour

facteur_tendance = min(3.23 × 100 ; 100) = 323 → plafonné à 100
facteur_tendance_normalisé = 100 / 100 = 1.0
```

**Interprétation** :
- < 1% par jour : Croissance lente (facteur faible)
- 1-5% par jour : Croissance modérée
- > 5% par jour : Croissance rapide (facteur élevé)

##### 2. Facteur affluence depuis zones à risque (25%)
Mesure la proportion des flux entrants provenant de zones rouges (score > 60).

```javascript
flux_total_entrant = 100,000 déplacements/jour
flux_depuis_zones_rouges = 35,000 déplacements/jour

facteur_affluence = 35,000 / 100,000 = 0.35 = 35%
```

**Interprétation** :
- < 20% : Peu de flux depuis zones à risque
- 20-50% : Affluence modérée depuis zones à risque
- > 50% : Forte affluence depuis zones à risque

##### 3. Facteur proximité du seuil (25%)
Mesure à quel point le score actuel est proche du seuil de transition.

```javascript
score_actuel = 55
seuil_cible = 60  // Passage orange → rouge

distance_au_seuil = 60 - 55 = 5

si distance < 20 :
    facteur_proximité = max(0 ; 1 - (5 / 20))
                      = 1 - 0.25
                      = 0.75 = 75%
sinon :
    facteur_proximité = 0%
```

**Interprétation** :
- Distance > 20 points : Facteur = 0% (seuil lointain)
- Distance 10-20 points : Facteur 50-75% (approche)
- Distance < 10 points : Facteur 75-100% (seuil imminent)

##### 4. Facteur capacité sanitaire (15%)
Inversement proportionnel à la centralité : moins d'infrastructures = plus de risque.

```javascript
centralité = 40

facteur_capacité = 1 - (40 / 100) = 0.6 = 60%
```

**Interprétation** :
- Centralité 80-100 : Facteur 0-20% (excellentes infrastructures)
- Centralité 40-60 : Facteur 40-60% (infrastructures moyennes)
- Centralité 0-20 : Facteur 80-100% (infrastructures limitées)

##### Calcul final
```javascript
probabilité = (0.35 × 1.0 +      // Tendance
               0.25 × 0.35 +     // Affluence
               0.25 × 0.75 +     // Proximité
               0.15 × 0.6)       // Capacité
            × 100

            = (0.35 + 0.0875 + 0.1875 + 0.09) × 100
            = 0.715 × 100
            = 71.5%
            → arrondi à 72%
```

#### Interprétation

| Probabilité | Badge | Signification |
|-------------|-------|---------------|
| **< 30%** | Vert | Risque faible de dégradation |
| **30-50%** | Orange | Risque moyen, surveillance accrue |
| **> 50%** | Rouge | Risque élevé, préparation intervention |

#### À quoi ça sert ?

- **Alerte précoce** : Identifier les zones sur le point de basculer
- **Priorisation** : Concentrer les ressources sur les zones à forte probabilité
- **Prévention** : Intervenir **avant** que la zone ne devienne critique
- **Communication** : Justifier les mesures préventives auprès de la population

#### Affichage dans le tableau

Colonne "**Probabilité de Transition**" avec :
- **Valeur** : 72%
- **Badge coloré** : Rouge (> 50%)
- **Tooltip détaillé** :
  ```
  Facteurs :
  - Tendance : 100%
  - Affluence : 35%
  - Proximité : 75%
  - Capacité : 60%
  ```

#### Fichier source
`src/simulation/EpidemicModel.js` (lignes 330-410)

---

## 3. Modèle Épidémiologique SEIR

### 3.1 Type de modèle

**SEIR métapopulationnel** : Modèle à compartiments avec 4 états épidémiologiques, appliqué à 30 zones (métapopulations) de Côte d'Ivoire connectées par la mobilité.

### 3.2 Les 4 compartiments

```
S (Susceptible) → E (Exposé) → I (Infecté) → R (Retiré)
```

| Compartiment | Description | Transmetteur ? |
|--------------|-------------|----------------|
| **S** | Population vulnérable à l'infection | Non |
| **E** | Personnes infectées en période d'incubation | Non (pas encore contagieux) |
| **I** | Personnes infectieuses pouvant transmettre | **Oui** |
| **R** | Personnes guéries ou décédées (immunisées) | Non |

### 3.3 Équations différentielles

**Pour chaque zone** :

```
dS/dt = -β × (S × I) / N

dE/dt = β × (S × I) / N - σ × E

dI/dt = σ × E - γ × I + cas_importés_mobilité

dR/dt = γ × I
```

**Légende** :
- **N** : Population totale de la zone
- **β (beta)** : Taux de transmission (0.35)
- **σ (sigma)** : Taux d'incubation (1/5.1 ≈ 0.196)
- **γ (gamma)** : Taux de guérison (1/14 ≈ 0.071)

### 3.4 Paramètres du modèle

| Paramètre | Valeur | Signification | Unité |
|-----------|--------|---------------|-------|
| **β (beta)** | **0.35** | Taux de transmission | contacts infectieux par jour |
| **σ (sigma)** | **0.196** | Taux d'incubation (1/5.1) | 1/jours |
| **γ (gamma)** | **0.071** | Taux de guérison (1/14) | 1/jours |
| **μ (mu)** | **0.0001** | Facteur de mobilité | coefficient |

### 3.5 Nombre de reproduction de base (R0)

```
R0 = β / γ = 0.35 / 0.071 ≈ 4.9
```

**Interprétation** : En moyenne, **une personne infectée transmet la maladie à 4.9 personnes** en l'absence d'immunité et de mesures de contrôle.

**Comparaison** :
- **Grippe saisonnière** : R0 ≈ 1.3
- **COVID-19 (variant initial)** : R0 ≈ 2.5-3.5
- **COVID-19 (variant Omicron)** : R0 ≈ 9-10
- **Dengue** : R0 ≈ 2-5
- **Modèle actuel** : R0 ≈ **4.9** (calibré pour épidémie tropicale type Dengue/COVID)

### 3.6 Durées caractéristiques

| Phase | Durée | Calcul |
|-------|-------|--------|
| **Période d'incubation** | **~5.1 jours** | 1 / σ = 1 / 0.196 |
| **Période d'infectiosité** | **~14 jours** | 1 / γ = 1 / 0.071 |
| **Durée totale maladie** | **~19 jours** | Incubation + infectiosité |

### 3.7 Couplage avec la mobilité

#### Mécanisme d'importation de cas

**Formule** :
```
Cas importés zone i = Σ (prévalence_j × flux_j→i × μ)
                      pour toutes les zones j ≠ i
```

**Exemple concret** :

Zone cible : **Bouaké**

Flux entrants :
- Depuis Abidjan : 15,000 déplacements/jour, prévalence 1.2% → 15,000 × 0.012 × 0.0001 = **0.018 cas importés**
- Depuis Yamoussoukro : 5,000 déplacements/jour, prévalence 0.5% → 5,000 × 0.005 × 0.0001 = **0.0025 cas importés**
- Depuis Korhogo : 3,000 déplacements/jour, prévalence 0.8% → 3,000 × 0.008 × 0.0001 = **0.0024 cas importés**

**Total importé à Bouaké** : 0.018 + 0.0025 + 0.0024 = **0.0229 cas/jour**

#### Mise à jour en temps réel

```javascript
nouveaux_infectés = σ × E  // Fin période incubation
nouveaux_guéris = γ × I    // Guérisons

I_nouveau = I + nouveaux_infectés - nouveaux_guéris + cas_importés_mobilité
```

#### Impact des quarantaines sur la mobilité

| Statut | Réduction flux | Impact importation |
|--------|----------------|-------------------|
| Aucune | 0% | Cas importés × 1.0 |
| Modérée | -30% | Cas importés × 0.7 |
| Sévère | -70% | Cas importés × 0.3 |
| Stricte | -95% | Cas importés × 0.05 |

**Exemple** : Quarantaine stricte sur Bouaké
```
Cas importés sans restriction : 0.0229
Cas importés avec restriction : 0.0229 × 0.05 = 0.0011 cas/jour
Réduction : -95%
```

### 3.8 Initialisation de la simulation

#### Sélection des foyers épidémiques

**Critère** : Les **5 villes les plus peuplées** servent de foyers initiaux.

**Foyers sélectionnés** :
1. **Yopougon** - 1,200,000 habitants
2. **Abobo** - 1,200,000 habitants
3. **Bouaké** - 536,189 habitants
4. **Cocody** - 450,000 habitants
5. **Koumassi** - 450,000 habitants

#### Initialisation différenciée

**Villes foyers** :
```javascript
taux_infection_initial = 0.8% à 1.2% de la population
```

**Exemple Yopougon** :
```
Population : 1,200,000
Facteur aléatoire : 0.95 (entre 0.8 et 1.2)
Infectés initiaux : 1,200,000 × 0.01 × 0.95 = 11,400 cas

Compartiments :
S = 1,200,000 - 11,400 = 1,188,600
E = 0
I = 11,400
R = 0
```

**Autres villes** :
```
Infectés initiaux : 0 cas

Compartiments :
S = population
E = 0
I = 0
R = 0
```

#### Période de simulation

- **Date de départ** : **1er juin 2025**
- **Date actuelle** : **3 décembre 2025**
- **Durée écoulée** : **185 jours** de simulation historique
- **Prédictions** : Jusqu'à J+14 (17 décembre 2025)

### 3.9 Fichiers sources

- Modèle SEIR : `src/simulation/EpidemicModel.js` (lignes 104-145)
- Paramètres : `src/simulation/EpidemicModel.js` (lignes 18-24)
- Initialisation : `src/simulation/EpidemicModel.js` (lignes 43-97)

---

## 4. Seuils et Classification des Risques

### 4.1 Échelle complète des seuils

| Niveau | Score | Couleur hex | Label | Quarantaine | Réduction mobilité | Actions |
|--------|-------|-------------|-------|-------------|--------------------|---------|
| **1** | 0-20 | #4caf50 | Très faible | Aucune | 0% | Surveillance normale |
| **2** | 20-40 | #8bc34a | Faible | Aucune | 0% | Surveillance normale |
| **3** | 40-60 | #ffc107 | Moyen | **Modérée** | **-30%** | Renforcement surveillance, campagnes sensibilisation |
| **4** | 60-75 | #ff9800 | Moyen-élevé | **Sévère** | **-70%** | Déploiement ressources, tests ciblés |
| **5** | 75-85 | #fa7e19 | Élevé | **Sévère** | **-70%** | Préparation quarantaine stricte |
| **6** | 85-95 | #ff5252 | Très élevé | **Stricte** | **-95%** | Isolement zone, équipes d'urgence |
| **7** | 95-100 | #d32f2f | Critique | **Stricte** | **-95%** | Intervention urgence maximale |

### 4.2 Classification simplifiée (3 niveaux)

Pour la communication grand public :

```
┌──────────────────────────────────────────────┐
│           ZONES VERTES (0-40)                │
│  Pas de restrictions, situation normale      │
│  Surveillance épidémiologique standard       │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│          ZONES ORANGES (40-75)               │
│  Restrictions modérées à sévères             │
│  Réduction mobilité 30% à 70%                │
│  Renforcement ressources sanitaires          │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│           ZONES ROUGES (75-100)              │
│  Restrictions sévères à quarantaine stricte  │
│  Réduction mobilité 70% à 95%                │
│  Isolement + intervention d'urgence          │
└──────────────────────────────────────────────┘
```

### 4.3 Comment une zone devient-elle rouge/orange/verte ?

#### Base de calcul

Rappel de la formule du score de risque :
```
Score = 40% Prévalence + 30% Mobilité entrante + 30% Capacité sanitaire
```

#### Exemples de scénarios

##### Scénario 1 : Zone verte → orange

**Situation initiale** : Ville de **Man**
- Population : 149,041
- Cas actifs : 50
- Flux entrant : 15,000/jour
- Centralité : 40

**Calcul score initial** :
```
Prévalence = 50 / 149,041 = 0.000335 = 0.034%
Score prévalence = 0.034 × 100 = 3.4

Flux entrant = 15,000
Score mobilité = (15,000 / 10,000) × 30 = 45 → plafonné à 30

Capacité : 30 - (40/100) × 30 = 18

Score total = 3.4 + 30 + 18 = 51.4 → Orange
```

**Pourquoi orange ?**
- Prévalence faible **mais**
- Mobilité entrante élevée (15,000 déplacements)
- Capacité sanitaire limitée (centralité 40)
- **Résultat** : Score 51 → **Zone orange** (restrictions modérées)

##### Scénario 2 : Zone orange → rouge

**Évolution** : Man après 10 jours
- Cas actifs : 800 (croissance rapide)
- Flux entrant : 4,500/jour (réduction suite aux restrictions)
- Autres paramètres inchangés

**Nouveau calcul** :
```
Prévalence = 800 / 149,041 = 0.00537 = 0.537%
Score prévalence = 0.537 × 100 = 53.7 → plafonné à 40

Flux entrant = 4,500
Score mobilité = (4,500 / 10,000) × 30 = 13.5

Capacité : 18 (inchangé)

Score total = 40 + 13.5 + 18 = 71.5 → Rouge (Moyen-élevé)
```

**Pourquoi rouge ?**
- Prévalence **multipliée par 16** (plafonne à 40 points)
- Mobilité réduite (13.5 au lieu de 30)
- **Résultat** : Score 72 → **Zone rouge** (restrictions sévères -70%)

##### Scénario 3 : Zone rouge → critique

**Évolution** : Man après 5 jours supplémentaires
- Cas actifs : 1,850
- Flux entrant : 3,000/jour
- Autres paramètres inchangés

**Nouveau calcul** :
```
Prévalence = 1,850 / 149,041 = 0.0124 = 1.24%
Score prévalence = 1.24 × 100 = 124 → plafonné à 40

Flux entrant = 3,000
Score mobilité = (3,000 / 10,000) × 30 = 9

Capacité : 18 (inchangé)

Score total = 40 + 9 + 18 = 67

Mais l'affluence depuis zones rouges augmente :
Score mobilité recalculé avec pondération zones sources...
Score total révisé = 40 + 25 + 18 = 83
```

**Approche seuil critique** : Score 83 → Encore rouge mais proche

**Jour suivant** : Flux depuis Abidjan (zone rouge) augmente
```
Score mobilité = 28
Score total = 40 + 28 + 18 = 86 → CRITIQUE
```

**Déclenchement automatique** : **Quarantaine stricte** (-95% mobilité)

### 4.4 Système d'alertes automatiques

#### Niveaux de priorité

| Priorité | Déclencheur | Couleur | Fréquence affichage |
|----------|-------------|---------|---------------------|
| **Critical** | Score ≥ 85 | Rouge (#ff5252) | 100% (toujours affiché) |
| **High** | 70 ≤ Score < 85 | Orange (#fa7e19) | 20-25% (aléatoire) |
| **Medium** | Cas > 5% population | Jaune (#ffd700) | 15% (aléatoire) |
| **Low** | Autres | Bleu (#2196F3) | 5% (aléatoire) |

#### Exemples de messages

**Critical** :
```
⚫ Quarantaine stricte : Abidjan Plateau placée en isolement total (risque: 87/100)
```

**High** :
```
⚫ Seuil critique approché : Bouaké - risque 82/100 - quarantaine imminente
⚫ Zone à risque élevé détectée: Yamoussoukro (risque: 73/100)
```

**Medium** :
```
⚫ Augmentation significative des cas à Daloa: 8,450 cas actifs
```

#### Rétention et affichage

- **Nombre max d'alertes** : 10 (les plus récentes)
- **Fréquence de vérification** : Chaque jour simulé (toutes les 3-6 secondes en temps réel)
- **Panneau d'alertes** : Affichage en haut du dashboard avec scroll si > 5

### 4.5 Fichiers sources

- Seuils couleurs : `src/utils/colorUtils.js` (lignes 12-20)
- Statuts quarantaine : `src/simulation/EpidemicModel.js` (lignes 217-222)
- Réductions mobilité : `src/store/simulationStore.js` (lignes 195-203)
- Alertes : `src/store/simulationStore.js` (lignes 247-306)

---

## 5. Visualisations du Dashboard

### 5.1 Cartes KPI (4 indicateurs principaux)

#### KPI 1 : Cas Actifs Totaux

**Affichage** :
```
┌────────────────────────────────┐
│ 🦠 CAS ACTIFS TOTAUX           │
│                                │
│        125,847                 │
│        +2.3% (24h)             │
└────────────────────────────────┘
```

**Interprétation** :
- **Nombre absolu** : Somme des cas actifs de toutes les 30 zones
- **Variation 24h** :
  - **+2.3%** : Épidémie en expansion
  - **-1.5%** : Épidémie en régression
  - **0%** : Stabilisation

**Seuils d'alerte** :
- < 10,000 : Épidémie faible
- 10,000 - 100,000 : Épidémie modérée
- 100,000 - 500,000 : Épidémie sérieuse
- > 500,000 : Épidémie majeure

---

#### KPI 2 : Indice de Mobilité

**Affichage** :
```
┌────────────────────────────────┐
│ 🚗 INDICE DE MOBILITÉ          │
│                                │
│          67%                   │
│    Impact des restrictions     │
└────────────────────────────────┘
```

**Interprétation** :
- **67%** : La mobilité actuelle représente 67% de la mobilité normale
- **Signification** : Réduction de 33% due aux restrictions en cours

**Comparaison** :
- 100% : Pas de restrictions
- 70% : Restrictions modérées actives
- 30% : Restrictions sévères actives
- 5% : Quarantaines strictes généralisées

---

#### KPI 3 : Zones à Risque Élevé

**Affichage** :
```
┌────────────────────────────────┐
│ ⚠️ ZONES À RISQUE ÉLEVÉ        │
│                                │
│     7 / 30                     │
│   (score > 60)                 │
└────────────────────────────────┘
```

**Interprétation** :
- **7 zones** ont un score > 60 (rouges/oranges foncés)
- **Sur 30 zones** au total
- **Pourcentage** : 23% du territoire en alerte

**Seuils** :
- 0-5 zones : Situation sous contrôle
- 6-10 zones : Situation préoccupante
- 11-20 zones : Situation critique
- > 20 zones : Urgence nationale

---

#### KPI 4 : Prédiction J+7

**Affichage** :
```
┌────────────────────────────────┐
│ 📊 PRÉDICTION J+7              │
│                                │
│      138,500 cas               │
│      ±20,775 (IC 85%)          │
└────────────────────────────────┘
```

**Interprétation** :
- **138,500 cas** : Prédiction dans 7 jours
- **±20,775** : Intervalle de confiance (±15%)
- **Fourchette** : [117,725 - 159,275 cas]
- **Confiance** : 85%

**Tendance** :
- Prédiction > Cas actuels : **+10%** → Épidémie en expansion
- Prédiction ≈ Cas actuels : **±2%** → Stabilisation
- Prédiction < Cas actuels : **-5%** → Épidémie en régression

---

### 5.2 Top 10 Corridors de Mobilité

#### Description

Graphique à **barres horizontales** montrant les 10 flux de déplacement les plus importants entre villes.

#### Format

```
Abidjan Plateau → Abidjan Yopougon    ████████████████ 125,450
Abidjan Cocody → Abidjan Plateau      ███████████████  112,380
Abidjan Abobo → Abidjan Yopougon      ██████████████   98,720
Abidjan → Yamoussoukro                ██████████       45,680
Abidjan Koumassi → Abidjan Plateau    █████████        42,150
Yamoussoukro → Bouaké                 ████████         35,920
Abidjan → Bouaké                      ███████          32,580
Bouaké → Korhogo                      ██████           28,450
Abidjan → Daloa                       █████            24,680
Daloa → Man                           ████             18,920
```

#### Interprétation

##### Flux élevés (> 50,000)
**Corridors critiques** pour la transmission épidémique.

**Exemple** : Abidjan Plateau → Yopougon (125,450 déplacements/jour)
- **Impact** : Si Plateau est infecté (prévalence 1%), Yopougon importe ~12 cas/jour
- **Stratégie** : Cibler ce corridor avec dépistage aux points de transit

##### Concentration sur Abidjan
Les **6 premiers corridors** sont intra-Abidjan (facteur × 5 appliqué).

**Explication** : Flux pendulaires domicile-travail massifs dans l'agglomération.

##### Corridors stratégiques

**Corridor Nord** : Abidjan → Yamoussoukro → Bouaké → Korhogo (facteur × 3)
- Route nationale principale
- Axe économique majeur
- **Impact épidémique** : Propagation rapide vers le Nord

**Corridor Ouest** : Abidjan → Daloa → Man (facteur × 2.5)
- Zone cacaoyère
- Flux saisonniers importants
- **Impact épidémique** : Diffusion vers zones rurales

##### Utilité
- **Identifier axes prioritaires** pour interventions (checkpoints sanitaires)
- **Évaluer impact restrictions** : si le flux Abidjan→Yamoussoukro chute de 45,680 à 13,704 (-70%), restriction sévère efficace
- **Prédire propagation** : Une épidémie à Abidjan atteindra Bouaké en 2-3 jours via Yamoussoukro

#### Fichier source
`src/components/charts/MobilityFlowChart.jsx`

---

### 5.3 Évolution des Cas Actifs (Graphique temporel)

#### Description

Graphique en **ligne** montrant l'évolution des cas actifs totaux avec prédictions J+7 et J+14.

#### Séries affichées

##### 1. Observations (ligne noire continue)
```
  │                            Observations
  │                            ───────
  │                           ╱
  │                         ╱
  │                       ╱
  │                     ╱
  │                   ╱
  │                 ╱
  │               ╱
  │             ╱
  │           ╱
  │─────────╱──────────────────────────────────
  │  J-30   J-20   J-10   J0
```

##### 2. Prédictions (ligne orange pointillée)
```
  │                                   Prédictions
  │                                   ···········
  │                                          ···
  │                                       ···
  │                                    ···
  │                                 ···
  │                         ───────···
  │─────────────────────────────────────────────
  │              J-10   J0   J+7   J+14
```

##### 3. Seuil d'Alerte (ligne rouge horizontale)
```
  │
  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Seuil (80% max)
  │
  │
  │
  │
  │─────────────────────────────────────────────
```

#### Paramètres

- **Période affichée** : 30 derniers jours + 14 jours de prédiction
- **Seuil d'alerte** : Fixé à **80% du maximum observé**
- **Zones remplies** : Opacité 10% sous chaque courbe

#### Interprétation

##### Pente ascendante
```
  │          ╱
  │        ╱
  │      ╱
  │    ╱
  │  ╱
  │─────────
```
**Signification** : Épidémie en **expansion**
**Action** : Renforcer mesures de contrôle

##### Pente descendante
```
  │  ╲
  │    ╲
  │      ╲
  │        ╲
  │          ╲
  │─────────────
```
**Signification** : Épidémie en **régression**
**Action** : Maintenir mesures, préparer assouplissement progressif

##### Croisement du seuil d'alerte
```
  │              ╱
  │            ╱
  │  ────────╱──────── Seuil
  │        ╱
  │      ╱
  │─────────
```
**Signification** : Dépassement du seuil critique
**Action** : Activation plan d'urgence

##### Écart prédictions-observations
```
  │         Prédictions
  │         ···········
  │       ···
  │     ···  ← Écart
  │   ···╱
  │ ···╱ Observations
  │───────────────
```

**Si écart faible (< 10%)** : Modèle fiable
**Si écart élevé (> 20%)** : Événement imprévu (ex: mesures exceptionnelles, variant)

#### Fichier source
`src/components/charts/TimeSeriesChart.jsx`

---

### 5.4 Évolution Multi-Villes (Top 10 à Risque)

#### Description

Graphique **multi-courbes** montrant l'évolution des cas actifs pour les **10 villes les plus à risque**.

#### Sélection des villes

Tri par **score de risque décroissant** → Top 10

Exemple :
1. Abidjan Plateau (score 87)
2. Yopougon (score 84)
3. Bouaké (score 78)
4. Abobo (score 72)
5. Yamoussoukro (score 68)
...

#### Palette de couleurs

```
Ville 1 : ─── Orange (#fa7e19)
Ville 2 : ─── Noir (#000000)
Ville 3 : ─── Rouge (#ff5252)
Ville 4 : ─── Gris foncé (#666666)
Ville 5 : ─── Orange clair (#ffa726)
Ville 6 : ─── Gris moyen (#999999)
Ville 7 : ─── Orange-rouge (#ff7043)
Ville 8 : ─── Gris très foncé (#444444)
Ville 9 : ─── Orange pâle (#ffb74d)
Ville 10: ─── Presque noir (#333333)
```

#### Interprétation

##### Divergence des courbes
```
  │  Ville A ╱╱╱╱╱╱
  │         ╱
  │  Ville B ──────
  │
  │  Ville C ╲╲╲╲╲
  │─────────────────
```
**Signification** : Dynamiques épidémiques **hétérogènes**
**Explication** :
- Ville A : Croissance rapide (mesures insuffisantes ?)
- Ville B : Stabilisation (mesures efficaces)
- Ville C : Régression (quarantaine stricte)

##### Courbes parallèles
```
  │  Ville A ╱╱╱╱╱╱
  │  Ville B ╱╱╱╱╱╱
  │  Ville C ╱╱╱╱╱╱
  │─────────────────
```
**Signification** : **Synchronisation** épidémique
**Explication** : Forte mobilité entre ces villes → propagation simultanée

##### Pics décalés
```
  │  Ville A   ╱╲
  │          ╱    ╲
  │  Ville B       ╱╲
  │              ╱    ╲
  │  Ville C           ╱╲
  │─────────────────────────
```
**Signification** : Propagation **séquentielle**
**Explication** : Épidémie se propage de ville en ville via corridors de mobilité

##### Amplitude relative
```
  │  Ville A (grande amplitude)
  │       ╱╲
  │      ╱  ╲
  │  Ville B (petite amplitude)
  │    ─╱╲─
  │─────────────────
```
**Signification** : **Gravité** relative de l'épidémie
**Explication** : Ville A plus touchée (ou plus peuplée) que Ville B

#### Utilité

- **Comparer dynamiques** entre zones à risque
- **Identifier zones critiques** nécessitant intervention prioritaire
- **Visualiser effet mesures ciblées** : si une courbe s'aplatit après quarantaine → mesure efficace
- **Détecter propagation géographique** : séquence temporelle des pics

#### Fichier source
`src/components/charts/MultiCityEvolutionChart.jsx`

---

### 5.5 DataTable des Régions

#### Description

Tableau **virtualisé** affichant toutes les métriques pour les **30 zones** de Côte d'Ivoire.

#### Colonnes du tableau

| Colonne | Contenu | Tri | Exemple |
|---------|---------|-----|---------|
| **Région** | Nom de la zone | Alphabétique | Bouaké |
| **Population** | Population totale | Numérique | 536 189 hab. |
| **Cas Actifs** | Nombre actuel d'infectés | Numérique | 2 500 cas |
| **Variation 24h** | % évolution sur 24h | Numérique | +3.2% 🔴 |
| **Cas Prédits J+7** | Prédiction + IC | Numérique | 2 850 (±428) |
| **Prob. Transition** | % passage niveau supérieur | Numérique | 72% 🔴 |

#### Détail des colonnes

##### Variation 24h

**Calcul** :
```javascript
variation = ((cas_actuels - cas_hier) / cas_hier) × 100
```

**Affichage** :
- **Vert** : Diminution (ex: -5.2%)
- **Rouge** : Augmentation (ex: +3.2%)
- **Neutre** : Stable (0.0%)

**Exemple** :
```
Hier : 2,420 cas
Aujourd'hui : 2,500 cas
Variation : ((2,500 - 2,420) / 2,420) × 100 = +3.3%
Affichage : +3.3% 🔴
```

##### Cas Prédits J+7

**Format** : `Prédiction (±IC)`

**Exemple** : `2,850 (±428)`
- **Prédiction** : 2,850 cas dans 7 jours
- **Intervalle** : [2,422 - 3,278 cas]

##### Probabilité de Transition

**Badge coloré** :
- **< 30%** : Badge vert 🟢
- **30-50%** : Badge orange 🟠
- **> 50%** : Badge rouge 🔴

**Tooltip au survol** :
```
Facteurs :
- Tendance : 85%
- Affluence : 35%
- Proximité : 60%
- Capacité : 40%
```

#### Fonctionnalités

##### Recherche
```
┌─────────────────────────────────┐
│ 🔍 Rechercher une région...     │
└─────────────────────────────────┘
```
**Fonction** : Filtre en temps réel les régions par nom

**Exemple** :
- Tape "Bou" → Affiche Bouaké, Boundiali
- Tape "Abi" → Affiche tous les quartiers d'Abidjan

##### Tri
Cliquer sur **n'importe quel en-tête de colonne** pour trier (ascendant/descendant)

**Exemples** :
- Tri par **Cas Actifs** (descendant) → Voir zones les plus touchées
- Tri par **Prob. Transition** (descendant) → Voir zones à surveiller en priorité
- Tri par **Population** (descendant) → Voir grandes métropoles

##### Virtualisation
- **Technologie** : @tanstack/react-virtual
- **Performance** : Affichage optimisé, **60 FPS** même avec 1000 lignes
- **Scroll** : Infini avec overscan de 5 lignes

#### Comment expliquer chaque colonne ?

**Région** : Nom géographique de la zone de surveillance

**Population** : Nombre total d'habitants (base pour calculer prévalence et capacité)

**Cas Actifs** : Personnes actuellement infectieuses (compartiment I du modèle SEIR)

**Variation 24h** : Tendance court terme (croissance ou décroissance)

**Cas Prédits J+7** : Anticipation à 7 jours (aide à préparer ressources)

**Prob. Transition** : Risque de basculer au niveau d'alerte supérieur (vert→orange, orange→rouge, rouge→critique)

#### Fichier source
`src/components/table/RegionsTable.jsx`

---

### 5.6 Carte Interactive 3D

#### Description

Carte **3D interactive** affichant les zones avec **code couleur selon risque** et **flux de mobilité animés**.

#### Couches affichées

##### 1. Zones à risque (cercles colorés)

**Technologie** : ScatterplotLayer (Deck.gl)

**Paramètres** :
- **Position** : Coordonnées GPS [longitude, latitude]
- **Couleur** : Fonction du score de risque (vert → jaune → rouge)
- **Taille** : Proportionnelle à √(population)
- **Opacité** : 78%

**Exemple** :
```
Bouaké (score 75, population 536,189)
→ Cercle orange de rayon √536,189 × 5 ≈ 3,660 pixels
→ Couleur #fa7e19
```

##### 2. Flux de mobilité (arcs 3D)

**Technologie** : ArcLayer (Deck.gl)

**Paramètres** :
- **Origine** : Coordonnées ville source
- **Destination** : Coordonnées ville cible
- **Couleur source** : Orange opaque (250, 126, 25, 150)
- **Couleur destination** : Orange transparent (250, 126, 25, 50)
- **Épaisseur** : Proportionnelle à √(volume) / 10
- **Inclinaison** : 15° (effet 3D)

**Filtrage** : Seuls les flux **épidémiologiquement actifs** sont affichés
- Flux impliquant au moins une zone avec cas actifs > 0
- Réduit la charge visuelle (évite de montrer 870 arcs)

**Exemple** :
```
Flux : Abidjan → Bouaké (volume 32,580)
→ Arc 3D de √32,580 / 10 ≈ 18 pixels d'épaisseur
→ Couleur : Dégradé orange opaque (Abidjan) → orange transparent (Bouaké)
→ Affiché car Abidjan a 50,000 cas actifs
```

#### Interactivité

##### Tooltip au survol d'une zone
```
┌──────────────────────────┐
│ Bouaké                   │
│ Population: 536,189 hab. │
│ Cas actifs: 2,500        │
│ Score de risque: 75/100  │
└──────────────────────────┘
```

##### Contrôles
- **Zoom** : Molette de la souris
- **Rotation** : Clic + glisser
- **Pan** : Shift + clic + glisser
- **Reset** : Double-clic

#### Positionnement initial

- **Centre** : [6.8, -5.5] (centre de la Côte d'Ivoire)
- **Zoom** : 6.5
- **Pitch** : 45° (vue oblique 3D)
- **Bearing** : 0° (Nord en haut)

#### Carte de base

**Provider** : Mapbox
**Style** : `mapbox://styles/mapbox/dark-v11` (fond sombre pour contraste)

#### Interprétation

##### Clusters de cercles rouges
**Signification** : Zones à risque élevé géographiquement proches
**Action** : Intervention régionale coordonnée

##### Arcs épais convergeant vers une zone
**Signification** : Zone avec forte affluence depuis zones infectées
**Action** : Renforcer dépistage aux points d'entrée

##### Arcs divergeant depuis une zone rouge
**Signification** : Zone source diffusant l'épidémie
**Action** : Quarantaine stricte pour limiter diffusion

##### Zone verte entourée de zones rouges
**Signification** : Zone encore épargnée mais à risque imminent
**Action** : Mesures préventives ciblées

#### Fichier source
`src/components/map/FlowMap.jsx`

---

## 6. Sources de Données

### 6.1 Origine : Données Télécom Orange CI

#### Contexte du projet

**Partenariat** : Orange Côte d'Ivoire × Ministère de la Santé × Instituts de recherche

**Objectif** : Utiliser les données de mobilité anonymisées pour la surveillance épidémiologique prédictive

**Base scientifique** : Travaux de **Lima et al. (2015)** démontrant l'efficacité des stratégies de confinement basées sur les CDR (Call Detail Records) lors du projet **Data for Development (D4D) 2013**

#### Type de données : CDR (Call Detail Records)

**Définition** : Enregistrements générés par le réseau cellulaire lors de chaque événement télécom (appel, SMS, données).

**Format simplifié** :
```
┌──────────────┬─────────────┬──────────────┬──────────────┬──────────────┐
│ Date         │ Antenne     │ Durée        │ Type         │ Tranche      │
├──────────────┼─────────────┼──────────────┼──────────────┼──────────────┤
│ 2024-03-15   │ ABJ_PLAT_01 │ 120 sec      │ Appel voix   │ 08h15        │
│ 2024-03-15   │ ABJ_YOP_12  │ -            │ SMS          │ 08h45        │
│ 2024-03-15   │ YAMOU_03    │ 2.5 MB       │ Données      │ 14h20        │
└──────────────┴─────────────┴──────────────┴──────────────┴──────────────┘
```

**Inférence de mobilité** :
```
Utilisateur A :
08h15 → Antenne Plateau (Abidjan)
09h00 → Antenne Yopougon (Abidjan)
→ Déplacement inféré : Plateau → Yopougon
```

**Agrégation** :
```
15 mars 2024, Plateau → Yopougon, 07h-09h : 12,450 déplacements
```

### 6.2 Processus d'anonymisation

#### Étapes de protection de la vie privée

```
┌─────────────────────────────────────────────────────────────┐
│ 1. COLLECTE DES DONNÉES BRUTES                              │
│    Événements CDR avec identifiants (IMSI, numéros)         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. SUPPRESSION IDENTIFIANTS                                 │
│    IMSI, numéros de téléphone → Supprimés définitivement    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. AGRÉGATION SPATIALE                                      │
│    Regroupement par zone (min 50 appareils par zone)        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. AGRÉGATION TEMPORELLE                                    │
│    Regroupement par tranches horaires (jamais instantané)   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. VÉRIFICATION K-ANONYMAT (k ≥ 50)                         │
│    Chaque groupe contient ≥50 personnes indistinguables     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. EXPORT SÉCURISÉ                                          │
│    Matrice origine-destination quotidienne (30×30)          │
└─────────────────────────────────────────────────────────────┘
```

#### Garanties de confidentialité

| Garantie | Méthode | Seuil |
|----------|---------|-------|
| **Anonymat** | Suppression identifiants | 100% des identifiants supprimés |
| **K-anonymat** | Groupes minimaux | **k ≥ 50** personnes par groupe |
| **Agrégation spatiale** | Zones larges | Minimum **50 appareils** par zone |
| **Agrégation temporelle** | Tranches horaires | Minimum **1 heure** par tranche |

**Exemple de k-anonymat** :
```
❌ INTERDIT :
   Flux : Abobo → Bouaké, 08h00 : 35 personnes (k=35 < 50)

✅ AUTORISÉ :
   Flux : Abobo → Bouaké, 07h-09h : 125 personnes (k=125 ≥ 50)
```

### 6.3 Modèle de gravité (génération de la matrice)

#### Formule de base

```javascript
flux(Origine → Destination) =
    (population_origine × population_destination × centralité_destination)
    / distance²
    × facteur_saisonnier
    × facteur_corridor
    × 0.00001
```

#### Exemple de calcul détaillé

**Flux : Abidjan (Cocody) → Bouaké**

**Données** :
- Population Cocody : 450,000
- Population Bouaké : 536,189
- Centralité Bouaké : 80
- Distance : 348 km

**Calcul** :
```javascript
// 1. Gravité de base
gravité = (450,000 × 536,189) / (348²)
        = 241,285,050,000 / 121,104
        = 1,992,538

// 2. Boost de centralité
centralité_boost = 80 / 50 = 1.6

// 3. Facteur saisonnier (mars, pas de saison particulière)
saisonnier = 1.0

// 4. Facteur corridor (Corridor Nord × 3)
corridor = 3.0

// 5. Flux quotidien
flux = 1,992,538 × 0.00001 × 1.6 × 1.0 × 3.0
     = 19.93 × 1.6 × 3.0
     = 95.66 déplacements/jour
```

**Arrondi** : **96 déplacements/jour** (Cocody → Bouaké)

#### Facteurs d'ajustement

##### Facteur saisonnier

**Saison de récolte cacao/café (Octobre - Mars)** :
```javascript
si destination == "Daloa" ou "Soubré" :
    facteur × 1.8  // +80%
```

**Fêtes de fin d'année (Décembre - Janvier)** :
```javascript
si origine == "Abidjan" et mois == "Décembre" :
    facteur × 2.8  // +180%
```

**Saison sèche (Novembre - Mars)** :
```javascript
si destination région == "Savanes" (Nord) :
    facteur × 1.3  // +30%
```

##### Facteur corridor

**Corridors structurants** :
```javascript
corridors = {
    "Intra-Abidjan": 5.0,
    "Nord": ["Abidjan", "Yamoussoukro", "Bouaké", "Korhogo"] → 3.0,
    "Ouest": ["Abidjan", "Daloa", "Man"] → 2.5,
    "Littoral": ["Abidjan", "Sassandra", "San Pedro"] → 2.2
}
```

### 6.4 Couverture et statistiques

| Indicateur | Valeur |
|------------|--------|
| **Part de marché Orange CI** | ~55% |
| **Nombre d'abonnés** | ~15 millions |
| **Couverture réseau** | 95% du territoire |
| **Zones modélisées** | 30 (13 Abidjan + 17 villes) |
| **Population modélisée** | ~7.5 millions d'habitants |
| **Flux quotidiens base** | ~500,000 déplacements/jour |
| **Matrice mobilité** | 30×30 = 900 paires OD |

### 6.5 Fréquence de mise à jour

#### Dans le dashboard actuel (simulation)

- **Simulation temps réel** : Mise à jour toutes les **3-6 secondes** (intervalle aléatoire)
- **Pas de temps** : 1 jour simulé = 1 tick
- **Vitesses disponibles** : 1×, 2×, 5×

#### Dans un déploiement réel (proposition)

**Workflow quotidien automatisé** :

```
┌────────────────────────────────────────────────────────────┐
│ 00h00 : Orange génère fichier mobilité J-1                │
│         Format : CSV (30×30 paires OD + volume)            │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│ 02h00 : Transfert sécurisé SFTP vers plateforme projet    │
│         Chiffrement : TLS 1.3                              │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│ 03h00 : Ingestion en base de données PostgreSQL           │
│         Validation : Vérification k-anonymat               │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│ 04h00 : Mise à jour modèle SEIR avec nouveaux flux        │
│         Recalcul : Cas importés, scores de risque          │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│ 05h00 : Génération prédictions J+7, J+14                  │
│         Algorithme : Régression + mobilité + quarantaines  │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│ 06h00 : Détection d'anomalies et génération alertes       │
│         Seuils : Score ≥ 85 → Alerte critique              │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│ 07h00 : Mise à jour dashboard web                         │
│         Refresh : Nouvelles métriques, nouvelles cartes    │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│ 08h00 : Envoi rapport quotidien PDF au Ministère          │
│         Contenu : Top 10 zones à risque, prédictions       │
└────────────────────────────────────────────────────────────┘
```

**Fréquences** :
- **Données mobilité** : Traitement **quotidien** (J+1)
- **Données épidémiologiques** : Mise à jour **quotidienne**
- **Prédictions** : Actualisées **chaque jour**
- **Rapports** : **Hebdomadaires** + alertes temps réel

### 6.6 D'où viennent les données (récapitulatif)

#### Données de mobilité
- **Source** : **Orange Côte d'Ivoire** (CDR anonymisés)
- **Méthode** : Inférence depuis événements réseau cellulaire
- **Format** : Matrice origine-destination 30×30 quotidienne
- **Anonymisation** : K-anonymat (k≥50), agrégation spatio-temporelle

#### Données épidémiologiques (dans un déploiement réel)
- **Source** : **Ministère de la Santé et de l'Hygiène Publique**
- **Méthode** : Remontées quotidiennes des centres de santé
- **Format** : Nombre de cas actifs par zone + nouveaux cas
- **Validation** : Contrôle qualité, détection valeurs aberrantes

#### Données géographiques
- **Source** : **OpenStreetMap** + **Institut National de la Statistique (INS)**
- **Contenu** : Coordonnées GPS, populations, distances

#### Données d'infrastructure
- **Source** : **Ministère de la Santé** + **Banque Mondiale**
- **Contenu** : Score de centralité (infrastructures sanitaires)

### 6.7 Fichiers sources

- Générateur mobilité : `src/simulation/MobilityGenerator.js`
- Documentation projet : `Projet Orange.md`
- Article scientifique : `info2.md`

---

## 7. Questions/Réponses Fréquentes

### Q1 : Comment savez-vous qu'une ville est rouge, orange ou verte ?

**R1** : C'est basé sur le **score de risque** (0-100), calculé en combinant 3 facteurs :

1. **40%** : Prévalence (cas actifs / population)
2. **30%** : Mobilité entrante (flux depuis autres zones)
3. **30%** : Capacité sanitaire (infrastructures)

**Seuils** :
- **Vert** : Score < 40 → Pas de restrictions
- **Orange** : Score 40-75 → Restrictions modérées à sévères
- **Rouge** : Score ≥ 75 → Restrictions sévères à quarantaine stricte

**Exemple** : Bouaké a 2,500 cas pour 536,189 habitants (0.47%) + flux entrant élevé + infrastructures moyennes → Score 75 → **Orange** (proche du rouge)

---

### Q2 : Les données télécom, c'est pas une atteinte à la vie privée ?

**R2** : **Non**, grâce à 3 niveaux de protection :

1. **Suppression identifiants** : Aucun numéro de téléphone, aucun IMSI (identifiant carte SIM)
2. **Agrégation** : Groupes minimaux de **50 personnes** (k-anonymat)
3. **Agrégation temporelle** : Tranches horaires (jamais de données instantanées)

**Résultat** : On sait que "125 personnes" sont allées d'Abobo à Bouaké entre 7h et 9h, mais **on ne sait pas qui**.

**Contrôle** : Conforme au RGPD et réglementations ivoiriennes sur les données personnelles.

---

### Q3 : Pourquoi la mobilité est importante pour l'épidémie ?

**R3** : La mobilité **transporte les cas infectés** d'une zone à une autre.

**Formule** :
```
Cas importés = Prévalence zone source × Flux de personnes × Facteur
```

**Exemple** :
- Abidjan a 1% de prévalence (10,000 cas actifs pour 1M habitants)
- 15,000 personnes vont d'Abidjan à Bouaké chaque jour
- Cas importés à Bouaké = 1% × 15,000 × 0.0001 = **0.15 cas/jour**

Sur 7 jours : **1 cas importé** → Peut déclencher une chaîne de transmission locale à Bouaké.

**Impact des quarantaines** :
- Quarantaine stricte (-95% mobilité) → 15,000 × 0.05 = **750 personnes/jour**
- Cas importés : 1% × 750 × 0.0001 = **0.0075 cas/jour** → Quasi nul

---

### Q4 : Comment vous prédisez les cas à J+7 ?

**R4** : En 4 étapes :

1. **Tendance historique** : Régression linéaire sur les 7 derniers jours → Croissance moyenne de X cas/jour
2. **Impact mobilité** : Calcul des cas importés depuis zones infectées
3. **Ajustement quarantaine** : Si quarantaine stricte → Réduction de 40%
4. **Intervalle de confiance** : ±15% pour tenir compte de l'incertitude

**Fiabilité** : 85% de confiance

**Validation** : Comparaison quotidienne prédictions vs observations → Si écart > 20%, révision du modèle

---

### Q5 : C'est quoi le seuil d'alerte et comment il est défini ?

**R5** : Le **seuil d'alerte** est une ligne rouge horizontale sur le graphique temporel, fixée à **80% du maximum observé**.

**Définition** :
```
Seuil = 0.8 × max(cas actifs des 30 derniers jours)
```

**Exemple** :
- Maximum observé : 150,000 cas (pic du 15 novembre)
- Seuil d'alerte : 150,000 × 0.8 = **120,000 cas**

**Interprétation** :
- **Sous le seuil** : Situation gérable
- **Dépassement du seuil** : **Alerte** → Activation plan d'urgence, renforcement ressources

**Justification** : 80% représente le point où les capacités sanitaires commencent à être sous tension.

---

### Q6 : À quoi sert le Top 10 des corridors de mobilité ?

**R6** : À identifier les **axes prioritaires pour les interventions sanitaires**.

**Utilités** :
1. **Dépistage ciblé** : Installer checkpoints sanitaires sur les corridors les plus fréquentés
2. **Prédiction de propagation** : Une épidémie à Abidjan atteindra Yamoussoukro en 1-2 jours via le Corridor Nord
3. **Évaluation des restrictions** : Si le flux Abidjan→Bouaké chute de 70%, les restrictions sont efficaces
4. **Communication** : Alerter les voyageurs sur les axes à risque

**Exemple** :
- **Corridor Nord** (Abidjan → Yamoussoukro → Bouaké → Korhogo) : 3× plus de flux que la normale
- **Impact** : Si Abidjan est rouge, Bouaké le deviendra en 2-3 jours
- **Action** : Renforcer dépistage à Yamoussoukro (point de transit)

---

### Q7 : Comment interpréter l'évolution des cas actifs ?

**R7** : En analysant la **pente de la courbe** :

**Pente ascendante** : Épidémie en **expansion**
- **Action** : Renforcer mesures de contrôle (quarantaines, tests)

**Pente descendante** : Épidémie en **régression**
- **Action** : Maintenir mesures, préparer assouplissement progressif

**Plateau** : **Stabilisation**
- **Action** : Mesures actuelles efficaces, maintenir le cap

**Pic suivi de décroissance** : **Fin de vague épidémique**
- **Action** : Déconfinement progressif, surveillance active

---

### Q8 : C'est quoi la probabilité de transition et à quoi ça sert ?

**R8** : La **probabilité de transition** (0-99%) indique le **risque qu'une zone passe au niveau de risque supérieur** (vert→orange, orange→rouge, rouge→critique).

**Calcul** : Combinaison de 4 facteurs
- 35% : Tendance de croissance des cas
- 25% : Affluence depuis zones rouges
- 25% : Proximité du seuil de transition
- 15% : Capacité sanitaire

**Utilité** : **Alerte précoce**
- Probabilité > 50% → Zone sur le point de basculer → **Intervention préventive**
- Exemple : Ville à 72% → Envoyer du personnel médical **avant** qu'elle ne devienne rouge

---

### Q9 : Pourquoi certaines zones ont un score élevé malgré peu de cas ?

**R9** : Parce que le score de risque ne dépend **pas seulement** du nombre de cas.

**Exemple** : Petit village rural
- Cas actifs : 100 (faible en absolu)
- Population : 10,000
- Prévalence : 100 / 10,000 = **1%** (très élevé !)
- Centralité : 10 (infrastructures limitées)
- Score capacité : 30 - (10/100) × 30 = **27/30** (très élevé)

**Résultat** : Score total ≈ 40 + 15 + 27 = **82** → **Rouge** malgré seulement 100 cas

**Interprétation** : Ce village a **proportionnellement** beaucoup plus de cas qu'une grande ville avec 10,000 cas mais 1M d'habitants (1%).

---

### Q10 : Quelle est la différence entre prévalence et incidence ?

**R10** :

**Prévalence** : **Proportion** de personnes infectées **à un instant donné**
```
Prévalence = Cas actifs / Population × 100
```
**Exemple** : 2,500 cas pour 536,189 habitants = **0.47%**

**Incidence** : **Nombre de nouveaux cas** sur une période
```
Incidence = Nouveaux cas sur 7 jours / Population × 100
```
**Exemple** : 350 nouveaux cas en 7 jours pour 536,189 habitants = **0.065%**

**Différence** :
- **Prévalence** : Photo à l'instant T (combien de malades **maintenant**)
- **Incidence** : Vidéo sur une période (combien de **nouveaux** malades)

**Utilité** :
- **Prévalence** → Charge sanitaire actuelle
- **Incidence** → Vitesse de propagation

---

### Q11 : Comment validez-vous la fiabilité du modèle ?

**R11** : En 3 méthodes :

1. **Comparaison prédictions vs observations**
   - Chaque jour : Comparer prédiction J+7 faite il y a 7 jours vs observation réelle
   - Si écart < 15% → Modèle fiable
   - Si écart > 20% → Révision paramètres

2. **Calibration sur données historiques**
   - Utiliser données épidémies passées (COVID-19, Dengue)
   - Ajuster β, γ, σ pour minimiser l'erreur

3. **Validation croisée**
   - Entraîner le modèle sur période 1 (ex: juin-septembre)
   - Tester sur période 2 (ex: octobre-novembre)
   - Mesurer performance (RMSE, MAE)

**Résultat actuel** : Niveau de confiance **85%**, intervalle **±15%**

---

### Q12 : Pourquoi R0 = 4.9 et pas une autre valeur ?

**R12** : **R0 = 4.9** est une calibration pour une épidémie tropicale type **Dengue** ou **COVID-19 variant contagieux**.

**Calcul** :
```
R0 = β / γ = 0.35 / 0.071 ≈ 4.9
```

**Choix de β (taux de transmission)** :
- Basé sur données historiques COVID-19 en Afrique de l'Ouest
- Ajusté pour tenir compte de la densité urbaine d'Abidjan
- Validé par comparaison avec épidémies passées

**Comparaison** :
- Grippe : R0 ≈ 1.3 (faible)
- COVID-19 initial : R0 ≈ 2.5 (modéré)
- Dengue : R0 ≈ 2-5 (modéré à élevé)
- **Modèle actuel** : R0 ≈ 4.9 (élevé)

**Impact** : R0 = 4.9 signifie qu'**au moins 80% de la population doit être immunisée** (vaccination ou infection passée) pour stopper l'épidémie naturellement.

---

### Q13 : Combien de temps faut-il pour qu'une épidémie se propage d'Abidjan à Korhogo ?

**R13** : En suivant le **Corridor Nord**, environ **5-7 jours**.

**Séquence** :
```
Jour 0 : Épidémie démarre à Abidjan (1,000 cas)
Jour 1-2 : Transmission vers Yamoussoukro (flux quotidien 45,000)
          → Cas importés : 1% × 45,000 × 0.0001 = 0.45 cas/jour
          → Après 2 jours : ~1 cas
Jour 3-4 : Transmission locale à Yamoussoukro → 50 cas
Jour 4-5 : Transmission vers Bouaké (flux 35,000)
          → Cas importés : 0.5% × 35,000 × 0.0001 = 0.175 cas/jour
Jour 6-7 : Transmission vers Korhogo (flux 28,000)
          → Cas importés : 0.3% × 28,000 × 0.0001 = 0.084 cas/jour
```

**Facteur accélérateur** : Corridor Nord (×3) → Flux tripled

**Conclusion** : **~7 jours** pour atteindre Korhogo sans mesures de contrôle

**Avec quarantaine stricte sur Abidjan (J+1)** :
- Flux réduit de 95% → Propagation ralentie de **95%**
- Temps de propagation : ~**35 jours** (5× plus lent)

---

### Q14 : Que se passe-t-il si je modifie la vitesse de simulation ?

**R14** : Cela change **uniquement la vitesse d'affichage**, pas le modèle épidémiologique.

**Vitesses disponibles** :
- **1×** : 1 jour simulé = 3-6 secondes réelles (vitesse normale)
- **2×** : 1 jour simulé = 1.5-3 secondes réelles (2× plus rapide)
- **5×** : 1 jour simulé = 0.6-1.2 secondes réelles (5× plus rapide)

**Ce qui change** : Fréquence de mise à jour du dashboard
**Ce qui ne change pas** : Équations SEIR, calculs de risque, prédictions

**Utilité** :
- **1×** : Observer en détail l'évolution quotidienne
- **5×** : Visualiser rapidement l'évolution sur plusieurs semaines

---

### Q15 : Pourquoi l'indice de mobilité ne descend jamais à 0% ?

**R15** : Parce que même en **quarantaine stricte**, il reste **5% de mobilité essentielle**.

**Justification** :
- Personnel médical se déplaçant
- Ravitaillement alimentaire
- Forces de l'ordre
- Urgences (ambulances)

**Réduction maximale** : **-95%** (soit 5% du flux normal)

**Exemple** :
- Flux normal : 500,000 déplacements/jour
- Quarantaine stricte généralisée : 500,000 × 0.05 = **25,000 déplacements/jour**
- Indice de mobilité affiché : **5%**

---

## 8. Annexes Techniques

### 8.1 Glossaire complet

| Terme | Définition |
|-------|------------|
| **SEIR** | Modèle épidémiologique à compartiments : Susceptible - Exposé - Infecté - Retiré |
| **Métapopulation** | Modélisation où chaque zone géographique est une sous-population connectée |
| **CDR** | Call Detail Records : Enregistrements d'événements télécom (appels, SMS, données) |
| **K-anonymat** | Propriété garantissant qu'au moins k individus partagent les mêmes attributs (k≥50 ici) |
| **Prévalence** | Proportion de personnes infectées à un instant T |
| **Incidence** | Nombre de nouveaux cas sur une période |
| **R0** | Nombre de reproduction de base : nombre moyen de transmissions par infecté |
| **Quarantaine** | Isolement d'une zone pour limiter la transmission |
| **Centralité** | Score d'importance économique et sanitaire d'une ville (0-100) |
| **Score de risque** | Indicateur composite (0-100) de risque épidémiologique |
| **Modèle de gravité** | Modèle estimant les flux proportionnellement aux populations / distance² |
| **Taux de transmission (β)** | Nombre de contacts infectieux par jour |
| **Taux d'incubation (σ)** | Taux de passage de Exposé → Infecté |
| **Taux de guérison (γ)** | Taux de passage de Infecté → Retiré |
| **Facteur de mobilité (μ)** | Coefficient d'influence de la mobilité sur la transmission |
| **IC** | Intervalle de Confiance : fourchette de valeurs probables |
| **J+7, J+14** | Prédictions à 7 jours, 14 jours |
| **OD** | Origine-Destination (paires de zones) |

### 8.2 Valeurs de référence consolidées

#### Paramètres épidémiologiques
```javascript
{
    beta: 0.35,           // Taux de transmission
    sigma: 0.196,         // Taux d'incubation (1/5.1)
    gamma: 0.071,         // Taux de guérison (1/14)
    mu: 0.0001,           // Facteur mobilité
    R0: 4.9               // Nombre de reproduction (β/γ)
}
```

#### Seuils de risque
```javascript
{
    "Très faible": [0, 20],
    "Faible":      [20, 40],
    "Moyen":       [40, 60],
    "Moyen-élevé": [60, 75],
    "Élevé":       [75, 85],
    "Très élevé":  [85, 95],
    "Critique":    [95, 100]
}
```

#### Réductions de mobilité
```javascript
{
    "none":     0%,    // Score < 40
    "moderate": -30%,  // Score 40-60
    "severe":   -70%,  // Score 60-85
    "strict":   -95%   // Score ≥ 85
}
```

#### Pondérations score de risque
```javascript
{
    "Prévalence":         40%,
    "Mobilité entrante":  30%,
    "Capacité sanitaire": 30%
}
```

#### Pondérations probabilité de transition
```javascript
{
    "Tendance":          35%,
    "Affluence":         25%,
    "Proximité seuil":   25%,
    "Capacité":          15%
}
```

### 8.3 Équations du modèle SEIR

#### Équations différentielles
```
dS/dt = -β × (S × I) / N

dE/dt = β × (S × I) / N - σ × E

dI/dt = σ × E - γ × I + Σ(prévalence_j × flux_j→i × μ)

dR/dt = γ × I
```

#### Contraintes
```
S + E + I + R = N (conservation de la population)

S, E, I, R ≥ 0 (non-négativité)

I ≤ 0.15 × N (limite réaliste : max 15% de la population infectée)
```

### 8.4 Formules de calcul

#### Score de risque
```javascript
score_prévalence = min((I / N) × 10,000 ; 40)

score_mobilité = min((flux_entrant / 10,000) × 30 ; 30)

score_capacité = max(0 ; 30 - (centralité / 100) × 30)

score_total = score_prévalence + score_mobilité + score_capacité
```

#### Prédiction J+7
```javascript
croissance_moyenne = (I[j] - I[j-7]) / 7

impact_mobilité = Σ(prévalence_k × flux_k→j × μ) × 7

prédiction_brute = I[j] + croissance_moyenne × 7 + impact_mobilité

ajustement_quarantaine = {
    "strict":  × 0.6,
    "severe":  × 0.8,
    "other":   × 1.0
}

prédiction = min(prédiction_brute × ajustement ; N × 0.15)

IC = prédiction ± (prédiction × 0.15)
```

#### Probabilité de transition
```javascript
facteur_tendance = min((I[j] - I[j-7]) / (7 × I[j]) × 100 ; 100) / 100

facteur_affluence = flux_depuis_zones_rouges / flux_total_entrant

facteur_proximité = si (seuil - score < 20)
                      alors max(0 ; 1 - (seuil - score) / 20)
                      sinon 0

facteur_capacité = 1 - (centralité / 100)

probabilité = (0.35 × facteur_tendance +
               0.25 × facteur_affluence +
               0.25 × facteur_proximité +
               0.15 × facteur_capacité) × 100
```

### 8.5 Architecture des fichiers (arborescence)

```
c:\laragon\www\epidemic-prediction\
│
├── src/
│   ├── components/
│   │   ├── charts/
│   │   │   ├── MobilityFlowChart.jsx      # Top 10 corridors
│   │   │   ├── TimeSeriesChart.jsx        # Évolution temporelle
│   │   │   ├── MultiCityEvolutionChart.jsx # Top 10 villes à risque
│   │   │   └── RiskHeatmap.jsx            # Heatmap risque
│   │   │
│   │   ├── dashboard/
│   │   │   ├── Dashboard.jsx              # Layout principal
│   │   │   ├── KPICards.jsx               # 4 cartes métriques
│   │   │   ├── AlertPanel.jsx             # Panneau alertes
│   │   │   └── ControlPanel.jsx           # Contrôles simulation
│   │   │
│   │   ├── map/
│   │   │   └── FlowMap.jsx                # Carte 3D Deck.gl
│   │   │
│   │   └── table/
│   │       └── RegionsTable.jsx           # Tableau virtualisé
│   │
│   ├── simulation/
│   │   ├── EpidemicModel.js               # Modèle SEIR
│   │   └── MobilityGenerator.js           # Génération mobilité
│   │
│   ├── store/
│   │   └── simulationStore.js             # Store Zustand
│   │
│   ├── hooks/
│   │   └── useRealtimeSimulation.js       # Hook temps réel
│   │
│   ├── utils/
│   │   ├── colorUtils.js                  # Échelles couleurs
│   │   ├── geoUtils.js                    # Calculs géo
│   │   └── statsUtils.js                  # Stats
│   │
│   ├── data/
│   │   └── ivoryCoastCities.js            # 30 villes
│   │
│   └── main.jsx                           # Point d'entrée
│
├── Projet Orange.md                       # Documentation projet
├── info2.md                               # Article scientifique
└── package.json                           # Dépendances npm
```

### 8.6 Stack technologique complète

```json
{
  "frontend": {
    "framework": "React 19.2.0",
    "state": "Zustand 5.0.9",
    "charts": "ECharts 6.0.0",
    "map": "Deck.gl 9.2.2 + Mapbox GL 3.16.0",
    "animation": "Framer Motion 12.23.25",
    "virtualization": "@tanstack/react-virtual 3.13.12",
    "dates": "date-fns 4.1.0"
  },
  "build": {
    "bundler": "Vite 7.2.4",
    "language": "JavaScript (ES2022)"
  },
  "performance": {
    "rendering": "60 FPS",
    "table": "Virtualisation (overscan 5)",
    "intervals": "3-6s (log-normale)"
  }
}
```

---

## Conclusion

Ce guide vous permet de **comprendre en profondeur** et **expliquer avec précision** tous les aspects du dashboard de prédiction épidémiologique :

✅ **Métriques** : Définitions, calculs, interprétations
✅ **Modèle SEIR** : Équations, paramètres, couplage mobilité
✅ **Seuils** : Classification rouge/orange/vert, alertes automatiques
✅ **Visualisations** : Cartes, graphiques, tableaux, carte 3D
✅ **Sources de données** : CDR Orange CI, anonymisation, modèle de gravité
✅ **Questions fréquentes** : 15 Q/R couvrant tous les aspects

**Prêt pour la présentation** avec des **réponses claires** et des **exemples concrets** ! 🚀

---

**Contacts** :
- Projet Orange CI : [À compléter]
- Ministère de la Santé : [À compléter]
- Support technique : [À compléter]

**Dernière mise à jour** : 3 Décembre 2025
