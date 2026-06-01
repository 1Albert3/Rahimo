# 🚍 Rahimo Transport — Système de Gestion de Transport Multimodal (SGTM)

Application web de gestion complète pour une compagnie de transport burkinabè.  
**Stack** : Laravel 13 · React 18 · Inertia.js · Tailwind CSS · TypeScript · MySQL

---

## Fonctionnalités

### 🎫 Billetterie & Réservation
- Recherche de voyages par ville, date, type de bus, prix
- Sélection interactive des sièges
- Paiement par **Orange Money**, **Moov Money** ou **Espèces**
- E-ticket avec **QR Code** et téléchargement PDF
- Envoi automatique de SMS/Email de confirmation
- Annulation, report et changement de siège (espace client)

### 📦 Colis (Envoi & Suivi)
- Enregistrement d'envoi avec photos
- Suivi par numéro de tracking
- Mise à jour du statut par les agents

### 🚌 Gestion de Flotte
- CRUD complet des véhicules
- **GPS temps réel** avec suivi sur carte Leaflet
- **Alertes de vitesse** avec acquittement/résolution
- Planification des conducteurs par trajet
- Maintenance préventive et corrective (coûts, historique)

### 👥 Ressources Humaines (RH)
- Gestion du personnel (chauffeurs, guichetières, agents…)
- Contrats de travail (CDI, CDD, temporaire)
- Congés (demande, approbation, rejet)
- Pointage (check-in / check-out)
- Paie avec génération de fiches de paie (PDF)

### 💰 Comptabilité & Finance
- Caisse (ouverture/fermeture, rapprochement)
- Dépenses (saisie, validation)
- Facturation (création, paiement, annulation)
- Grand livre, bilan, budgets
- Rapports CSV/PDF/Excel
- Export de relevé bancaire

### 🏢 Services Complémentaires (Lot 2.4)
- **Parking** – entrée/sortie avec suivi
- **Location de véhicules** – réservation, restitution
- **Hébergement** – chambres de transit, check-in/check-out
- **Moto-transport** – logistique moto

### 🔒 Sécurité & Conformité
- **Vérification police** – passeport/watchlist, manifeste voyageurs
- **Alertes sécurité** et gestion d'incidents
- **Anti-fraude** – détection d'anomalies automatisée
- **Journalisation des activités** (log middleware)

### 🎓 E-Learning
- Cours avec contenu enrichi (vidéos, documents)
- Quiz de validation
- Certificats PDF téléchargeables
- Suivi de progression par apprenant

### 🎁 Programme de Fidélité
- Points cumulés par réservation
- Réductions basées sur le niveau (Bronze → Argent → Or)

### 🏛 Multi-Compagnies & Multi-Gares
- Gestion de plusieurs compagnies de transport
- Gestion de plusieurs gares routières
- Définition de routes entre gares

---

## Architecture

```
rahimo-transport/
├── app/
│   ├── Exports/          # Export Excel (FinancialReportExport)
│   ├── Http/Controllers/ # Controllers (Admin, Api, Auth)
│   ├── Http/Middleware/   # CheckRole, HandleInertiaRequests, LogActivity
│   ├── Models/            # 46 models Eloquent
│   ├── Services/          # Sms, Payment, QrCode, ActivityLogger, Loyalty
├── bootstrap/             # App config, middleware registration
├── config/                # Base de données, services (SMS/Paiement)
├── database/
│   ├── migrations/        # 32 migrations
│   ├── seeders/           # 11 seeders (utilisateurs + données métier)
├── resources/
│   ├── js/Components/     # Composants React (UI, Layouts)
│   ├── js/Pages/          # Pages Inertia (Admin, Auth, Client, Driver…)
│   ├── views/             # Templates Blade (root, PDF)
├── routes/
│   ├── web.php            # Routes web (~70 endpoints)
│   ├── auth.php           # Routes d'authentification
```

---

## Rôles & Périmètres

| Rôle | Accès principal |
|------|----------------|
| `directeur_general` | Tout le back-office, RH, finance, rapports, compagnies, gares |
| `responsable_flotte` | Flotte, GPS, maintenance, planification, alertes vitesse |
| `comptable` | Comptabilité, caisse, dépenses, factures, budgets |
| `chef_garde` | Guichet, colis, départs, services (parking, hébergement…) |
| `guichetiere` | Guichet (vente de tickets), colis |
| `agent_police` | Vérification police, watchlist, manifeste |
| `bagagiste` | Bagages (scan, manifeste) |
| `chauffeur` | Trajets, embarquement QR, formations, alertes |
| `client` | Réservations, historique, annulation, PDF |

---

## Démarrage rapide

```bash
# 1. Configuration
cp .env.example .env
php artisan key:generate

# 2. Base de données (MySQL)
# Éditer .env : DB_DATABASE, DB_USERNAME, DB_PASSWORD
php artisan migrate --seed

# 3. Dépendances
composer install
npm install
npm run build

# 4. Lancer l'application
php artisan serve
npm run dev    # ou : npm run build
```

### Comptes de démonstration (seed)

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| `dg@rahimo.bf` | `password` | Directeur Général |
| `flotte@rahimo.bf` | `password` | Responsable Flotte |
| `comptable@rahimo.bf` | `password` | Comptable |
| `chefgarde@rahimo.bf` | `password` | Chef de Gare |
| `guichet@rahimo.bf` | `password` | Guichetière |
| `police@rahimo.bf` | `password` | Agent Police |
| `bagagiste@rahimo.bf` | `password` | Bagagiste |
| `chauffeur@rahimo.bf` | `password` | Chauffeur |
| `client@rahimo.bf` | `password` | Client |

---

## Webhooks Paiement

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/webhook/orange-money` | POST | Notification Orange Money |
| `/webhook/moov-money` | POST | Notification Moov Money |

---

## Déploiement

- PHP ≥ 8.3
- MySQL ≥ 8.0 / MariaDB ≥ 10.6
- Node.js ≥ 20
- Composer ≥ 2.7
- Extensions PHP : `bcmath`, `curl`, `dom`, `gd`, `mbstring`, `pdo_mysql`, `xml`, `zip`

---

## Dépendances principales

### Backend
- **Laravel 13** – Framework PHP
- **Inertia.js** – SPA sans API
- **bacon/bacon-qr-code** – QR Code pour les e-tickets
- **barryvdh/laravel-dompdf** – Génération PDF (tickets, certificats, rapports)
- **maatwebsite/excel** – Export Excel

### Frontend
- **React 18** + **TypeScript**
- **Tailwind CSS 3** + **@headlessui/react**
- **Recharts** – Graphiques KPI
- **Leaflet** – Cartes GPS
- **Framer Motion** – Animations
- **Lucide React** – Icônes
- **Radix UI** – Dialog, Dropdown, Progress, Select, Tabs, Tooltip

---

## Licence

Projet privé — Rahimo Transport
# Rahimo
