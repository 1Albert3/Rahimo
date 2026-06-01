# Guide Administrateur — Rahimo Transport

## Sommaire
1. [Présentation](#1-présentation)
2. [Accès & Rôles](#2-accès--rôles)
3. [Dashboard & Navigation](#3-dashboard--navigation)
4. [RH — Ressources Humaines](#4-rh)
5. [Comptabilité & Finance](#5-comptabilité)
6. [Sécurité & Police](#6-sécurité--police)
7. [Flotte & Maintenance](#7-flotte)
8. [Formations E-Learning](#8-formations)
9. [Bagages](#9-bagages)
10. [Rapports Avancés](#10-rapports)
11. [Anti-Fraude](#11-anti-fraude)
12. [Multi-Compagnies & Gares](#12-multi-compagnies)
13. [Alertes Vitesse GPS](#13-alertes-vitesse)
14. [Paiements](#14-paiements)
15. [Notifications Masse](#15-notifications)

---

## 1. Présentation

**Rahimo Transport** est une plateforme web de gestion intégrée pour compagnie de transport interurbain. Elle couvre :

- **Site client** : recherche/réservation de billets, envoi colis, services annexes (parking, location, hébergement, transport moto)
- **Back-office** : gestion complète de la flotte, RH, comptabilité, sécurité, formations, rapports

### Prérequis techniques
- PHP 8.2+, MariaDB/MySQL 10.6+, Node.js 20+
- Navigateur : Chrome/Firefox récent
- Compte administrateur requis pour accéder au back-office

---

## 2. Accès & Rôles

### Connexion
URL : `https://votre-domaine.com/login` (ou `http://localhost/login` en dev)

### Hiérarchie des rôles

| Rôle | Accès |
|------|-------|
| **admin** | Toutes les fonctionnalités back-office |
| **agent** | Guichet, embarquement, colis, services, carte GPS, alertes |
| **driver** | Ses trajets assignés uniquement |
| **client** | Son espace client (réservations, colis) |

### Créer un utilisateur
Se fait depuis **RH → Personnel** (admin uniquement).

---

## 3. Dashboard & Navigation

### Dashboard admin
Indicateurs clés : trajets du jour, réservations, revenus, flotte active.
Graphiques : tendance revenus 30 jours, top routes, occupation.

### Sidebar
Structure hiérarchique avec dropdowns pour RH, Comptabilité, Services, Sécurité, Formations.

### Barre de recherche
Recherche globale par nom, référence, téléphone.

---

## 4. RH

### Module RH complet (6 pages)

| Page | Description |
|------|-------------|
| **Dashboard RH** | Effectifs, pointage du jour, masse salariale |
| **Personnel** | Liste des employés avec statut, badge rôle |
| **Contrats** | CRUD contrats (type, dates, salaire) |
| **Congés** | Demandes de congés, approbation/rejet |
| **Pointage** | Pointage quotidien (présent/absent/congé) |
| **Paie** | Génération bulletins, calcul auto, impression PDF |

### Génération de la paie
1. Aller dans **RH → Paie**
2. Cliquer "Générer la paie du mois"
3. Le système calcule automatiquement :
   - Salaire brut
   - Déductions (5%)
   - Taxe (1%)
   - CNSS (3,5%)
   - Net à payer
4. Marquer comme payé individuellement

---

## 5. Comptabilité

| Page | Description |
|------|-------------|
| **Synthèse** | Recettes/dépenses journalières et mensuelles, sources de paiement |
| **Dépenses** | CRUD + validation admin uniquement |
| **Factures** | CRUD, suivi impayé, marquer payé/annulé |
| **Grand-Livre** | Écritures comptables, 200 dernières, solde par compte |
| **Bilan / P&L** | Compte de résultat mensuel avec graphiques (PieChart, BarChart) |
| **Budgets** | Budgets prévisionnels avec suivi consommation |

---

## 6. Sécurité & Police

### Dashboard Sécurité
- Alertes de sécurité (personnes recherchées, véhicules volés)
- Incidents signalés (accident, panne, agression)
- Manifestes passagers des départs à venir

### Interface Police
- **Vérification silencieuse** : saisir un nom + téléphone, le système vérifie discrètement contre la watchlist sans alerter le passager
- **Vérification batch** : scanner un trajet complet pour détecter des correspondances
- **Liste de surveillance** : CRUD des personnes recherchées
- **Journal des vérifications** : historique complet

### Watchlist
Ajouter une personne : nom, téléphone, N° carte d'identité, motif.
Les entrées actives sont comparées silencieusement à chaque vérification.

---

## 7. Flotte

### Véhicules
CRUD complet : marque, modèle, capacité, type (VIP/Standard), statut.

### Carte GPS (Leaflet + OSM)
- Marqueurs des véhicules actifs
- Popups avec infos (conducteur, vitesse, statut)
- Rafraîchissement automatique toutes les 15 secondes

### Simulation GPS (développement)
Route `/flotte/gps/simuler` → `POST` → génère des positions aléatoires autour de Ouagadougou.

### Planning Conducteurs
- Tableau 21 jours roulants
- Affectation manuelle conducteur → véhicule → trajet

### Maintenance
- Calendrier des maintenances préventives
- Formulaire d'enregistrement
- Statistiques (coûts, fréquence par véhicule)
- Historique complet

---

## 8. Formations

### Côté employé
- Liste des modules e-learning
- Progression (quiz passés / quiz total)
- Score et statut (complété ou non)

### Côté admin (Gérer)
| Fonction | Description |
|----------|-------------|
| **Gérer** | CRUD complet des formations |
| **Quiz** | Ajout/modification/suppression questions par formation |
| **Certificats** | Délivrance et téléchargement PDF |

### Créer une formation
1. Aller dans **Formations → Gérer**
2. Cliquer "Nouvelle Formation"
3. Remplir : titre, catégorie (Sécurité/Règlement/Conduite/Service), difficulté, durée
4. Optionnel : URL vidéo, URL document, contenu HTML/markdown

### Ajouter des quiz
1. Cliquer sur le nombre de questions d'une formation
2. Ajouter des questions avec choix multiples
3. Sélectionner la bonne réponse

### Certificats
- Généré automatiquement quand score ≥ 80%
- Délivrance manuelle possible depuis la page Certificats
- Téléchargement PDF avec score, dates, numéro unique

---

## 9. Bagages

### Fonctionnalités
| Fonction | Description |
|----------|-------------|
| **Enregistrement** | Saisir passager, type, poids → génère un tag unique |
| **Scan rapide** | Scanner le tag pour changer de statut |
| **Manifeste** | Liste des bagages par trajet |

### Cycle de vie d'un bagage
`Enregistré → Scanné → Chargé → En transit → Déchargé → Livré`

### Actions de scan
- **Scanner** : enregistre le scan
- **Charger** : marque comme chargé dans le bus
- **Décharger** : arrivé à destination
- **Livrer** : remis au passager

---

## 10. Rapports

### Rapports Avancés
Page unique avec sélecteur de période (date range).

### Indicateurs
- Revenu total, dépenses, résultat net, taux d'occupation
- Graphique : revenus par jour (BarChart)
- Graphique : répartition par service (PieChart)
- Top routes par revenu
- Coûts maintenance par véhicule (BarChart horizontal)
- Comparaison YoY (année sur année)

### Exports
- **XLSX** : rapport financier structuré (maatwebsite/laravel-excel)
- **CSV** : liste des réservations sur la période

---

## 11. Anti-Fraude

### Détection automatique
Le système détecte en temps réel :

| Type d'anomalie | Description |
|----------------|-------------|
| **Surbooking** | Plus de réservations que de places disponibles |
| **Sur-embarquement** | Plus de passagers embarqués que de capacité |
| **Embarquement > Confirmés** | Passagers montés sans réservation confirmée |
| **Doublon téléphone** | Même téléphone, même trajet, plusieurs réservations |

### Actions
- **Résoudre** : marque l'alerte comme traitée
- **Faux positif** : ignore l'alerte

---

## 12. Multi-Compagnies & Gares

### Compagnies
Permet de gérer plusieurs compagnies de transport depuis une même plateforme.
Chaque compagnie a : nom, slug, N° d'enregistrement, couleur primaire.

Les données (véhicules, trajets, réservations, paiements, utilisateurs) sont automatiquement filtrées par compagnie.

### Gares
Types : Arrêt, Terminus, Agence.
Chaque gare a : nom, ville, adresse, coordonnées GPS.

### Routes
Définir des routes entre gares avec :
- Station départ / arrivée
- Compagnie associée
- Prix de base, durée estimée, distance

---

## 13. Alertes Vitesse

### Fonctionnement
Le simulateur GPS (`POST /flotte/gps/simuler`) génère des vitesses aléatoires.
Si un véhicule dépasse 90 km/h :
- **Avertissement** (90-105 km/h)
- **Danger** (>105 km/h) → notification critique

### Page Alertes
- Statistiques : actives, niveau DANGER, aujourd'hui
- Tableau : véhicule, conducteur, vitesse, niveau, notification
- Actions : Acquitter (prendre en compte) ou Résoudre

---

## 14. Paiements

### Modes de paiement
| Méthode | Statut |
|---------|--------|
| Espèces (cash) | ✅ Fonctionnel (validation manuelle) |
| Orange Money | ✅ Gateway implémentée, nécessite clés API |
| Moov Money | ✅ Gateway implémentée, nécessite clés API |
| Carte bancaire | ✅ Interface prête, nécessite prestataire |

### Gateway Orange Money
- `charge()` : appel API réel vers `api.orange.com`
- `refund()` : appel API réel
- `verify()` : vérification transaction

### Webhooks
- `POST /webhook/orange-money` : réception IPN Orange
- `POST /webhook/moov-money` : réception IPN Moov

### Configuration
Dans `.env` :
```
PAYMENT_DRIVER=log              # log (simulation) | orange_money | moov_money
ORANGE_MERCHANT_KEY=xxx
ORANGE_CLIENT_ID=xxx
ORANGE_CLIENT_SECRET=xxx
MOOV_API_KEY=xxx
```

### Page Paiements (admin)
- Liste de toutes les transactions
- Filtres : statut, méthode, date
- Actions : rembourser, vérifier statut
- Stats : complétés, en attente, échoués, remboursés

---

## 15. Notifications

### Envoi de notifications masse
1. Aller dans **Notifications**
2. Sélectionner le canal : SMS, WhatsApp, Email
3. Cibler : tous les utilisateurs, par rôle, ou utilisateur spécifique
4. Saisir le message
5. Envoyer

**Note** : En mode développement, les notifications sont uniquement loggées (pas de fournisseur SMS/Email configuré).

---

## Développement

### Commandes utiles

```bash
# Lancer le serveur
php artisan serve

# Compiler les assets
npm run build          # Production
npm run dev            # Développement

# Migrations
php artisan migrate

# Simulation GPS
curl -X POST http://localhost/flotte/gps/simuler

# Générer la paie
# Depuis RH → Paie, cliquer "Générer"

# Tests
php artisan test                   # Feature + Unit
php artisan dusk                   # Browser (Laravel Dusk)
```

### Base de données
Les migrations sont numérotées par phase :
- `2026_05_25_190000_phase3_*` : LOT 3 (flotte, alertes, learning)
- `2026_05_28_000005_phase4_*` : LOT 4 (RH, compta, sécurité)
- `2026_05_28_000006_phase_a_*` : Phase A (speed alerts)
- `2026_05_28_191933_phase_b_*` : Phase B (formations vidéo, certificats)
- `2026_05_28_192546_phase_c_*` : Phase C (rapports)
- `2026_05_28_192823_phase_d_*` : Phase D (police)
- `2026_05_28_200046_phase_f_*` : Phase F (bagages)
- `2026_05_28_200241_phase_g_*` : Phase G (anti-fraude)
- `2026_05_28_200408_phase_h_*` : Phase H (multi-gares, compagnies)

### Filtrage multi-compagnie
Le trait `BelongsToCompany` est utilisé par les modèles `User`, `Trip`, `Vehicle`, `Booking`, `Payment`.
Le scope `forCurrentCompany()` filtre automatiquement par `company_id` de l'utilisateur connecté.
