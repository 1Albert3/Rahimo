# Comparaison : Projets Yael vs App Actuelle (Rahimo)

## 1. Vue d'ensemble des 3 projets Yael

| Projet | Type | Technologie | Base de données | Rôle |
|--------|------|-------------|-----------------|------|
| **Yael_backend-main** | API REST Backend | Node.js / Express 5 | PostgreSQL | Backend unique pour les deux frontends |
| **Yael_gare-master** | Interface Gare (Frontend) | Laravel 12 + Blade | Aucune (proxy vers API) | Interface de gestion au niveau gare |
| **yael_compagnie-main** | Interface Compagnie (Frontend) | HTML/CSS/JS statique + Bootstrap | Aucune (appels API) | Interface de gestion au niveau compagnie |

---

## 2. Architecture

### Yael (original)
```
yael_compagnie-main (compagnie) ─┐
                                  ├──► Yael_backend-main (API Express/PostgreSQL)
Yael_gare-master (gare) ─────────┘
```

### Rahimo (actuel)
```
App Laravel monolithique (Inertia.js + Vue) ───► Base de données MySQL
    ├── Backend intégré (Laravel, pas d'API séparée)
    ├── Frontend intégré (Inertia SPA, pas de frontend séparé)
    └── Multi-gare + multi-compagnie intégré
```

---

## 3. Fonctionnalités : Yael vs Rahimo

### 3.1 Entités communes

| Entité | Yael_backend | Yael_gare | yael_compagnie | Rahimo | Notes |
|--------|-------------|-----------|----------------|--------|-------|
| **Villes** | ✅ CRUD | ❌ | ✅ CRUD | ❌ (pas de table dédiée) | Rahimo utilise `departure_city`/`arrival_city` directement |
| **Gares (Stations)** | ✅ CRUD + login | ✅ Login via API | ✅ CRUD | ✅ (model `Station`) | Rahimo a `Station` + `StationRoute` |
| **Agents** | ✅ CRUD + login | ✅ CRUD | ❌ | ✅ (via `User` avec rôles) | Rahimo gère via système de rôles RBAC |
| **Bus** | ✅ CRUD | ✅ CRUD | ❌ | ✅ (model `Vehicle`) | Rahimo a un modèle plus riche (marque, modèle, année, carburant, GPS, maintenance) |
| **Chauffeurs** | ✅ CRUD | ✅ CRUD | ❌ | ✅ (via `User` rôle `chauffeur`) | Rahimo lie aux véhicules et voyages |
| **Destinations** | ✅ CRUD | ✅ CRUD | ❌ | ✅ (via `StationRoute`) | Rahimo gère via routes de gares |
| **Horaires** | ✅ CRUD | ✅ CRUD | ❌ | ✅ (via `departure_time` dans `Trip`) | Rahimo intègre horaire dans les voyages |
| **Trajets** | ✅ CRUD (avec jointure gare/destination/horaire) | ✅ CRUD | ❌ | ✅ (via `Trip`) | Rahimo a un modèle plus complet |
| **Voyages** | ✅ CRUD | ✅ CRUD | ❌ | ✅ (model `Trip`) | Rahimo a statut, prix, places dispo, etc. |
| **Passagers** | ✅ CRUD (avec CNIB, dates) | ✅ CRUD | ❌ | ✅ (via `Booking`) | Rahimo gère via les réservations |
| **Réservations** | ✅ CRUD | ✅ CRUD | ❌ | ✅ (model `Booking`) | Rahimo a paiement, statut, QR code, etc. |
| **Utilisateurs** | ✅ login uniquement | ❌ | ✅ login | ✅ CRUD complet | Rahimo a inscription, rôles, permissions |

### 3.2 Fonctionnalités présentes uniquement dans Rahimo

| Fonctionnalité | Rahimo | Détails |
|----------------|--------|---------|
| **Multi-compagnie** | ✅ | Gestion de plusieurs compagnies avec `company_id` |
| **Multi-station** | ✅ | Gares avec routes, prix, distances |
| **Paiements** | ✅ | Orange Money, Moov Money, Cash, Carte, Virement - avec webhooks |
| **QR Code** | ✅ | Génération et scan pour embarquement |
| **Fidélité** | ✅ | Système de points et paliers (Bronze/Argent/Or/Platine) |
| **SMS** | ✅ | Twilio avec templates (confirmation, retard, colis) |
| **GPS Temps réel** | ✅ | Localisation des véhicules, alertes de vitesse |
| **Maintenance** | ✅ | Planification, historique, coûts |
| **Colis** | ✅ | Suivi par numéro, statuts, photos, paiement à la livraison |
| **Bagages** | ✅ | Scan, chargement/déchargement, livraison |
| **Parking** | ✅ | Entrée/sortie, montant, statut |
| **Location voiture/moto** | ✅ | Location avec acompte |
| **Hébergement** | ✅ | Check-in/check-out, types de chambres |
| **Transport Moto** | ✅ | Envoi de motos entre villes |
| **RH** | ✅ | Contrats, congés, pointage, paie |
| **Comptabilité** | ✅ | Journal, grand livre, bilan, budgets |
| **Facturation** | ✅ | Génération, paiement, annulation |
| **Caisse** | ✅ | Ouverture/fermeture, rapprochement bancaire |
| **E-learning** | ✅ | Cours avec quiz, certificats |
| **Sécurité/Police** | ✅ | Alertes, watchlist, vérification passagers |
| **Fraude** | ✅ | Détection de surréservation, doublons |
| **Réclamations** | ✅ | Codes uniques, suivi, statuts |
| **Objets trouvés** | ✅ | Déclaration, photo, statut |
| **Alertes** | ✅ | Types (danger/warning/info), sévérité |
| **Rapports** | ✅ | Export CSV/PDF, rapports avancés |
| **Notifications** | ✅ | SMS groupés |
| **Embarquement** | ✅ | Scan QR, confirmation |
| **Guichet** | ✅ | Vente au guichet avec QR + SMS |
| **Tableau de bord admin** | ✅ | KPIs, tendances, top routes, revenus par service, occupation |

### 3.3 Fonctionnalités présentes dans Yael mais absentes ou différentes dans Rahimo

| Fonctionnalité | Yael | Rahimo |
|----------------|------|--------|
| **Table dédiée `villes`** | ✅ Base de données séparée | ❌ Pas de table villes ; utilisation de champs textes `departure_city`/`arrival_city` |
| **CNIB passager** | ✅ Champ obligatoire avec validation regex `^[A-Za-z0-9]{6,20}$` | ❌ Pas géré (passager = simple nom/téléphone) |
| **Auth gare (login via numéro)** | ✅ Authentification par `numero` (téléphone) + JWT | ✅ Auth par email (Laravel Breeze) |
| **Deux frontends séparés** | ✅ Compagnie (villes/gares) + Gare (opérations) | ❌ Frontend unique Inertia SPA avec rôles |
| **Rate limiting 5/min** | ✅ Sur login | ❌ Configurable via Laravel |

---

## 4. Base de données

### 4.1 Schéma Yael_backend (PostgreSQL)
```
villes(id, nom)
gares(id, ville_id FK, nom, numero, password)
users(id, email, password)
agents(id, nom, prenom, numero, password, gare_id FK)
bus(id, nom, matricule, capacite, statut, gare_id FK)
chauffeurs(id, nom, prenom, telephone, gare_id FK)
horaires(id, heure, gare_id FK)
destinations(id, nom, gare_id FK)
trajets(id, nom, depart_gare_id FK, destination_id FK, duree, horaire_id FK, date, prix, gare_id FK)
voyages(id, trajet_id FK, bus_id FK, chauffeur_id FK, statut, gare_id FK)
passagers(id, nom, prenom, telephone, numerocnib, date_etablissement, date_expiration, trajet_id FK, codeqr, gare_id FK)
reservations(id, nom, prenom, telephone, voyage_id FK, actif bool, gare_id FK)
```

### 4.2 Schéma Rahimo (MySQL) - Extraits clés
```
companies(id, name, slug, ...)
stations(id, name, city, address, ...)
station_routes(id, departure_station_id FK, arrival_station_id FK, ...)
users(id, name, email, password, phone, role, company_id FK, ...)
vehicles(id, registration_number, brand, model, capacity, type, status, gps fields, ...)
trips(id, trip_number, vehicle_id FK, driver_id FK, departure_city, arrival_city, departure_time, arrival_time, price, available_seats, status, company_id FK, ...)
bookings(id, booking_number, user_id FK, trip_id FK, passenger_name, seat_numbers, total_price, status, payment_status, ...)
payments(id, booking_id FK, amount, method, transaction_id, status, ...)
colis(id, tracking_number, sender/recipient info, status, ...)
baggage(id, tag_number, booking_id FK, trip_id FK, ...)
parking(id, vehicle_registration, entry/exit, amount, ...)
rentals(id, type, brand, model, rental_start/end, ...)
accommodations(id, guest_name, check_in/out, room_type, ...)
moto_transports(id, sender/recipient, origin/destination, ...)
maintenance_records(id, vehicle_id FK, type, cost, ...)
vehicle_locations(id, vehicle_id FK, latitude, longitude, speed, ...)
speed_alerts(id, vehicle_id FK, trip_id FK, speed, ...)
contracts(id, user_id FK, type, salary, ...)
leaves(id, user_id FK, start/end date, status, ...)
attendance(id, user_id FK, date, clock_in/out, ...)
pay_slips(id, user_id FK, period, net_salary, ...)
expenses(id, user_id FK, category, amount, ...)
invoices(id, invoice_number, client, total, status, ...)
journal_entries(id, reference, account_code, debit, credit, ...)
cash_registers(id, user_id FK, opening/closing balance, ...)
bank_reconciliations(id, account_name, statement_balance, ...)
budgets(id, label, period, total/spent, ...)
courses(id, titre, description, categorie, ...)
quizzes(id, course_id FK, question, options, correct_answer, ...)
quiz_attempts(id, user_id FK, quiz_id FK, answer, correct, ...)
course_progress(id, user_id FK, course_id FK, completed, score, ...)
certificates(id, user_id FK, course_id FK, certificate_number, ...)
police_alerts(id, alert_type, severity, person info, ...)
police_check_logs(id, booking_id FK, trip_id FK, match_status, ...)
watchlist_entries(id, full_name, phone, id_card_number, ...)
incident_reports(id, trip_id FK, vehicle_id FK, driver_id FK, ...)
fraud_checks(id, trip_id FK, booking_id FK, severity, ...)
activity_logs(id, user_id FK, action, description, ...)
reclamations(id, code, type, description, statut, ...)
lost_items(id, type, reporter info, status, photo, ...)
alerts(id, type, categorie, titre, severity, ...)
promotions(id, code, label, type, value, ...)
report_exports(id, user_id FK, type, period, format, ...)
```

**Constats** :
- Rahimo a **~45 modèles** contre **12 modèles** pour Yael
- Rahimo utilise MySQL, Yael utilise PostgreSQL
- Rahimo a un système multi-tenant (`company_id`, `gare_id`), Yael seulement `gare_id` pour le partitionnement
- Yael a un champ `numerocnib` pour les passagers et une table `villes` dédiée qui n'existent pas dans Rahimo

---

## 5. Authentification

| Aspect | Yael_backend | Yael_gare | yael_compagnie | Rahimo |
|--------|-------------|-----------|----------------|--------|
| **Méthode** | JWT | Token en session | JWT (localStorage) | Laravel Breeze (session) |
| **Rôles** | user, gare, agent | Gare (token API) | User (compagnie) | directeur_general, responsable_flotte, comptable, chef_garde, guichetiere, agent_police, bagagiste, chauffeur, client |
| **Login gare** | `POST /api/gares/login` (numero + password) | API externe | ❌ | Intégré Laravel |
| **Login compagnie** | `POST /api/users/login` (email + password) | ❌ | API externe | Intégré Laravel |
| **Rate limiting** | 5/min | 5/min | ❌ | Configurable |
| **Inscription** | ❌ (seed) | ❌ | ❌ | ✅ |

---

## 6. API vs Monolithique

| Aspect | Yael | Rahimo |
|--------|------|--------|
| **Architecture** | API REST (Express) + 2 frontends séparés | Monolithique Laravel (Inertia SPA) |
| **Points d'API** | ~40 endpoints REST | Routes web + quelques webhooks API |
| **Portabilité** | Frontends interchangeables | Tout est dans Laravel |
| **Performance** | +1 requête HTTP par action (proxy) | Direct (pas de proxy) |
| **Déploiement** | 3 services à déployer | 1 seul service |

---

## 7. Frontend

| Aspect | yael_compagnie | Yael_gare | Rahimo |
|--------|---------------|-----------|--------|
| **Technologie** | HTML statique + JS vanilla + Bootstrap 5 | Laravel Blade + Bootstrap 5 + JS vanilla | Inertia.js + Vue 3 (SPA) |
| **UI/UX** | CSS custom (orange/noir), SweetAlert2, loader | CSS custom (orange), Font Awesome, toasts | Tailwind CSS, composants Vue modernes |
| **Page login** | 2 colonnes (image + formulaire) | 2 colonnes (image + formulaire) | Interface moderne Inertia |
| **Dashboard** | Cartes stats (4), graphiques, tableaux récents | Cartes stats (4), graphiques, tableaux récents | KPIs, tendances, top routes, revenus par service |
| **CRUD** | Modals + SweetAlert2 | Modals Bootstrap + toast | Composants Vue réactifs |
| **Responsive** | ✅ (media queries) | ✅ (Bootstrap) | ✅ (Tailwind) |

---

## 8. Points forts de chaque projet

### Yael_backend-main (API)
- ☑ Architecture propre et légère (Express + PostgreSQL)
- ☑ Séparation claire des rôles (user/gare/agent)
- ☑ Rate limiting
- ☑ Middleware JWT bien conçu
- ☱ Manque : validation avancée, tests, documentation API

### Yael_gare-master (Laravel Gare)
- ☑ Interface claire et fonctionnelle
- ☑ CRUD complets pour toutes les entités
- ☑ Pattern proxy API bien factorisé (trait `CallsFrontApi`)
- ☑ Gestion des erreurs API
- ☱ Manque : pas de données locales, dépendant de l'API externe

### yael_compagnie-main (Frontend Compagnie)
- ☑ Interface légère et rapide
- ☑ CRUD villes + gares
- ☑ Gestion de session (localStorage)
- ☱ Très limité en fonctionnalités (seulement 2 entités)

### Rahimo (App actuelle)
- ☑ **Très complet** : 45+ modèles, ~34 contrôleurs
- ☑ Multi-tenant (compagnies + gares)
- ☑ Paiements intégrés (Orange Money, Moov Money)
- ☑ SMS (Twilio), QR codes, GPS temps réel
- ☑ RH, Compta, E-learning, Sécurité, Services annexes
- ☑ Architecture moderne (Inertia + Vue)
- ☱ Complexité plus élevée, courbe d'apprentissage

---

## 9. Ce qui est présent dans Yael mais pas (ou différent) dans Rahimo

1. **Table `villes` dédiée** : Yael a une table normalisée pour les villes. Rahimo utilise des champs texte `departure_city`, `arrival_city` - à envisager si normalisation nécessaire.
2. **CNIB (Carte Nationale d'Identité Burkinabè)** : Yael gère le numéro CNIB des passagers avec validation (`^[A-Za-z0-9]{6,20}$`). Rahimo n'a pas ce champ - utile si requis par la réglementation.
3. **Dates d'établissement/expiration CNIB** : Présent dans Yael, absent dans Rahimo.
4. **Numéro de téléphone 8 chiffres** : Yael valide le format `^\d{8}$` pour agents et chauffeurs (format burkinabè). Rahimo est plus flexible.
5. **Auth gare par numéro** : Yael authentifie les gares par `numero` + `password`. Rahimo utilise email + password (standard Laravel).
6. **Dual frontend (compagnie vs gare)** : Yael sépare clairement les interfaces compagnie (gestion villes/gares) et gare (opérations quotidiennes). Rahimo unifie tout avec des rôles.

---

## 10. Synthèse

| Critère | Yael | Rahimo |
|---------|------|--------|
| **Couverture fonctionnelle** | ✅ Transport de base (12 entités) | ✅✅ Transport + RH + Compta + Services + E-learning + Sécurité (45+ entités) |
| **Architecture** | ✅ Backend API + 2 frontends | ✅ Monolithique moderne (Inertia SPA) |
| **Multi-tenant** | ❌ (gare_id simple) | ✅ (compagnies + stations) |
| **Paiements** | ❌ | ✅ (Mobile money + cash + virement) |
| **SMS/Notifications** | ❌ | ✅ (Twilio, templates) |
| **GPS/Tracking** | ❌ | ✅ (temps réel, alertes vitesse) |
| **RH** | ❌ | ✅ (contrats, congés, paie, pointage) |
| **Comptabilité** | ❌ | ✅ (journaux, bilan, budgets) |
| **Services annexes** | ❌ | ✅ (parking, location, hébergement, colis) |
| **Sécurité/Police** | ❌ | ✅ (watchlist, incidents, vérifications) |
| **Carte d'identité (CNIB)** | ✅ | ❌ |
| **Table villes dédiée** | ✅ | ❌ |
| **Simplicité** | ✅✅ Très simple et focus | ✅ Complexié mais complet |
| **Maintenabilité** | ✅ 3 projets à maintenir | ✅ 1 seul projet |
| **Évolutivité** | ❌ Backend limité | ✅ Architecture extensible |
