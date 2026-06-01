<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\Admin\AdminLearningController;
use App\Http\Controllers\Admin\BaggageController;
use App\Http\Controllers\Admin\CompanyController;
use App\Http\Controllers\Admin\FraudController;
use App\Http\Controllers\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Admin\StationController;
use App\Http\Controllers\Admin\PoliceController;
use App\Http\Controllers\Admin\ReportsController;
use App\Http\Controllers\AlertController;
use App\Http\Controllers\BoardingController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ColisController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\FleetController;
use App\Http\Controllers\GuichetController;
use App\Http\Controllers\LearningController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReclamationController;
use App\Http\Controllers\RhController;
use App\Http\Controllers\SecurityController;
use App\Http\Controllers\ServicesController;
use App\Http\Controllers\TripController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ─── Site Web Public ──────────────────────────────────────────────────────────

Route::get('/', fn () => Inertia::render('Welcome'))->name('welcome');

Route::get('/voyages', [TripController::class, 'search'])->name('trips.search');
Route::get('/voyages/{trip}/sieges', [TripController::class, 'seats'])->name('trips.seats');
Route::get('/paiement', [TripController::class, 'checkout'])->name('trips.checkout');
Route::post('/reserver', [BookingController::class, 'store'])->name('trips.confirm');
Route::get('/reservation/{booking}', [BookingController::class, 'show'])->name('trips.confirmation');

Route::get('/colis/suivi', [ColisController::class, 'track'])->name('colis.track');
Route::post('/colis/suivi', [ColisController::class, 'track'])->name('colis.track.post');
Route::get('/colis/envoyer', [ColisController::class, 'sendForm'])->name('colis.send');
Route::post('/colis/envoyer', [ColisController::class, 'store'])->name('colis.send.store');

Route::post('/api/promotions/validate', [TripController::class, 'validatePromo']);

// ─── Services Publics (LOT 2.4) ──────────────────────────────────────────────

Route::prefix('services')->name('services.')->group(function () {
    Route::get('/', [ServicesController::class, 'publicIndex'])->name('index');
    Route::get('/parking', [ServicesController::class, 'publicParking'])->name('public.parking');
    Route::post('/parking', [ServicesController::class, 'publicParkingStore'])->name('public.parking.store');
    Route::get('/location', [ServicesController::class, 'publicLocation'])->name('public.location');
    Route::post('/location', [ServicesController::class, 'publicLocationStore'])->name('public.location.store');
    Route::get('/hebergement', [ServicesController::class, 'publicHebergement'])->name('public.hebergement');
    Route::post('/hebergement', [ServicesController::class, 'publicHebergementStore'])->name('public.hebergement.store');
    Route::get('/moto-transport', [ServicesController::class, 'publicMoto'])->name('public.moto');
    Route::post('/moto-transport', [ServicesController::class, 'publicMotoStore'])->name('public.moto.store');
    Route::get('/reclamations', [ServicesController::class, 'publicReclamations'])->name('public.reclamations');
    Route::post('/reclamations', [ServicesController::class, 'publicReclamationsStore'])->name('public.reclamations.store');
    Route::get('/objets-trouves', [ServicesController::class, 'publicLostAndFound'])->name('public.lost-and-found');
    Route::post('/objets-trouves', [ServicesController::class, 'publicLostAndFoundStore'])->name('public.lost-and-found.store');
});

// ─── Dashboard (redirection post-login) ───────────────────────────────────────

Route::middleware('auth')->get('/dashboard', function () {
    $user = request()->user();
    return match (true) {
        in_array($user->role, ['directeur_general', 'responsable_flotte', 'comptable', 'chef_garde', 'guichetiere', 'agent_police', 'bagagiste']) => redirect()->route('admin.dashboard'),
        $user->role === 'chauffeur' => redirect()->route('driver.trips'),
        default => redirect()->route('client.dashboard'),
    };
})->name('dashboard');

// ─── Tous les utilisateurs connectés ──────────────────────────────────────────

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// ─── Espace Client ────────────────────────────────────────────────────────────

Route::middleware(['auth', 'role:client'])->name('client.')->group(function () {
    Route::get('/mon-espace', [BookingController::class, 'userBookings'])->name('client.dashboard');
    Route::post('/reservation/{booking}/annuler', [BookingController::class, 'cancel'])->name('booking.cancel');
    Route::post('/reservation/{booking}/reporter', [BookingController::class, 'reschedule'])->name('booking.reschedule');
    Route::post('/reservation/{booking}/changer-siege', [BookingController::class, 'changeSeat'])->name('booking.change-seat');
    Route::get('/reservation/{booking}/pdf', [BookingController::class, 'downloadPdf'])->name('booking.pdf');
});

// ─── Espace Chauffeur ─────────────────────────────────────────────────────────

Route::prefix('chauffeur')->name('driver.')->middleware(['auth', 'role:chauffeur'])->group(function () {
    Route::get('/trajets', [FleetController::class, 'driverTrips'])->name('trips');
    Route::get('/embarquement', [BoardingController::class, 'index'])->name('embarquement');
    Route::post('/embarquement/verifier', [BoardingController::class, 'verifyQr'])->name('embarquement.verifier');
    Route::post('/embarquement/confirmer', [BoardingController::class, 'confirmBoarding'])->name('embarquement.confirmer');
    Route::get('/formations', [LearningController::class, 'index'])->name('formations');
    Route::get('/formations/{course}', [LearningController::class, 'show'])->name('formations.show');
    Route::post('/formations/quiz/{quiz}', [LearningController::class, 'submitQuiz'])->name('formations.quiz');
    Route::get('/alertes', [AlertController::class, 'index'])->name('alertes');
});

// ─── Back-Office Admin & Agent ────────────────────────────────────────────────

Route::prefix('admin')->name('admin.')->middleware(['auth', 'role:directeur_general,responsable_flotte,comptable,chef_garde,guichetiere,agent_police,bagagiste'])->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');

    Route::get('/guichet', [GuichetController::class, 'index'])->name('guichet');
    Route::post('/guichet', [GuichetController::class, 'store'])->name('guichet.store');

    Route::get('/colis', [ColisController::class, 'index'])->name('colis');
    Route::post('/colis', [ColisController::class, 'store'])->name('colis.store');
    Route::patch('/colis/{colis}/statut', [ColisController::class, 'updateStatus'])->name('colis.status');
    Route::post('/colis/{colis}/photos', [ColisController::class, 'uploadPhoto'])->name('colis.photos');

    Route::get('/departs', [AdminController::class, 'manifeste'])->name('manifeste');

    // Phase 3 — Flotte + GPS + Maintenance (admin only for management)
    Route::get('/flotte', [FleetController::class, 'index'])->name('flotte');
    Route::get('/flotte/gps', [FleetController::class, 'gpsData'])->name('flotte.gps');
    Route::post('/flotte/gps/simuler', [FleetController::class, 'simulateGps'])->name('flotte.gps.simuler');
    Route::post('/flotte', [FleetController::class, 'store'])->name('flotte.store');
    Route::put('/flotte/{vehicle}', [FleetController::class, 'update'])->name('flotte.update');
    Route::delete('/flotte/{vehicle}', [FleetController::class, 'destroy'])->name('flotte.destroy');
    Route::get('/maintenance', [FleetController::class, 'maintenanceIndex'])->name('maintenance');
    Route::post('/maintenance', [FleetController::class, 'maintenanceSchedule'])->name('maintenance.store');
    Route::get('/utilisateurs', [RhController::class, 'usersIndex'])->name('utilisateurs');
    Route::post('/utilisateurs', [RhController::class, 'usersStore'])->name('utilisateurs.store');
    Route::put('/utilisateurs/{user}', [RhController::class, 'usersUpdate'])->name('utilisateurs.update');
    Route::delete('/utilisateurs/{user}', [RhController::class, 'usersDestroy'])->name('utilisateurs.destroy');

    Route::patch('/maintenance/{maintenanceRecord}/terminer', [FleetController::class, 'maintenanceComplete'])->name('maintenance.complete');
    Route::get('/planning', [FleetController::class, 'planningIndex'])->name('planning');
    Route::post('/planning/assigner', [FleetController::class, 'planningAssign'])->name('planning.assign');
    Route::get('/carte-gps', [FleetController::class, 'gpsMap'])->name('gps-map');

    // Trip CRUD
    Route::get('/trajets', [FleetController::class, 'tripsIndex'])->name('trajets');
    Route::post('/trajets', [FleetController::class, 'tripsStore'])->name('trajets.store');
    Route::put('/trajets/{trip}', [FleetController::class, 'tripsUpdate'])->name('trajets.update');
    Route::delete('/trajets/{trip}', [FleetController::class, 'tripsDestroy'])->name('trajets.destroy');

    // Phase A — Alertes vitesse
    Route::get('/alertes-vitesse', [FleetController::class, 'speedAlertsIndex'])->name('speed-alerts');
    Route::post('/alertes-vitesse/{speedAlert}/acquitter', [FleetController::class, 'speedAlertsAcknowledge'])->name('speed-alerts.acknowledge');
    Route::post('/alertes-vitesse/{speedAlert}/resoudre', [FleetController::class, 'speedAlertsResolve'])->name('speed-alerts.resolve');
    Route::get('/alertes-vitesse/stats', [FleetController::class, 'speedAlertsStats'])->name('speed-alerts.stats');

    // Phase 3 — Embarquement QR
    Route::get('/embarquement', [BoardingController::class, 'index'])->name('embarquement');
    Route::post('/embarquement/verifier', [BoardingController::class, 'verifyQr'])->name('embarquement.verifier');
    Route::post('/embarquement/confirmer', [BoardingController::class, 'confirmBoarding'])->name('embarquement.confirmer');

    // Phase 3 — Formations e-learning (employé)
    Route::get('/formations/mes-formations', [LearningController::class, 'index'])->name('formations');
    Route::get('/formations/mes-formations/{course}', [LearningController::class, 'show'])->name('formations.show');
    Route::post('/formations/mes-formations/quiz/{quiz}', [LearningController::class, 'submitQuiz'])->name('formations.quiz');

    // Phase 4 — Comptabilité
    Route::get('/comptabilite', [FinanceController::class, 'comptabilite'])->name('comptabilite');
    Route::get('/depenses', [FinanceController::class, 'expenses'])->name('depenses');
    Route::post('/depenses', [FinanceController::class, 'expensesStore'])->name('depenses.store');
    Route::post('/caisses/ouvrir', [FinanceController::class, 'caissesOuvrir'])->name('caisses.ouvrir');
    Route::post('/caisses/{cashRegister}/fermer', [FinanceController::class, 'caissesFermer'])->name('caisses.fermer');
    Route::post('/rapprochement', [FinanceController::class, 'reconciliationsStore'])->name('rapprochement.store');

    // Phase 5 — Services complémentaires
    Route::prefix('services')->name('services.')->group(function () {
        Route::get('/parking', [ServicesController::class, 'parking'])->name('parking');
        Route::post('/parking', [ServicesController::class, 'parkingStore'])->name('parking.store');
        Route::post('/parking/{parking}/sortir', [ServicesController::class, 'parkingSortir'])->name('parking.sortir');

        Route::get('/location', [ServicesController::class, 'location'])->name('location');
        Route::post('/location', [ServicesController::class, 'locationStore'])->name('location.store');
        Route::post('/location/{rental}/terminer', [ServicesController::class, 'locationTerminer'])->name('location.terminer');

        Route::get('/hebergement', [ServicesController::class, 'hebergement'])->name('hebergement');
        Route::post('/hebergement', [ServicesController::class, 'hebergementStore'])->name('hebergement.store');
        Route::post('/hebergement/{accommodation}/checkin', [ServicesController::class, 'hebergementCheckin'])->name('hebergement.checkin');
        Route::post('/hebergement/{accommodation}/checkout', [ServicesController::class, 'hebergementCheckout'])->name('hebergement.checkout');

        Route::get('/moto-transport', [ServicesController::class, 'motoTransport'])->name('moto');
        Route::post('/moto-transport', [ServicesController::class, 'motoTransportStore'])->name('moto.store');
        Route::post('/moto-transport/{motoTransport}/status', [ServicesController::class, 'motoTransportUpdateStatus'])->name('moto.status');
    });

    // Phase 6 — Réclamations
    Route::get('/reclamations', [ReclamationController::class, 'index'])->name('reclamations');
    Route::post('/reclamations', [ReclamationController::class, 'store'])->name('reclamations.store');
    Route::patch('/reclamations/{reclamation}/statut', [ReclamationController::class, 'updateStatus'])->name('reclamations.status');

    // Phase 6 — Objets trouvés
    Route::get('/objets-trouves', [ServicesController::class, 'adminLostItems'])->name('lost-items');
    Route::patch('/objets-trouves/{lostItem}', [ServicesController::class, 'adminLostItemUpdate'])->name('lost-items.update');
    Route::post('/objets-trouves/{lostItem}/photo', [ServicesController::class, 'adminLostItemPhoto'])->name('lost-items.photo');

    // Phase 6 — Alertes
    Route::get('/alertes', [AlertController::class, 'index'])->name('alertes');
    Route::post('/alertes', [AlertController::class, 'store'])->name('alertes.store');
    Route::patch('/alertes/{alert}/traiter', [AlertController::class, 'traiter'])->name('alertes.traiter');

    // Phase 6 — Rapports
    Route::get('/rapports', [AdminController::class, 'rapports'])->name('rapports');
    Route::post('/export/rapports', [AdminController::class, 'exportRapports'])->name('export.rapports');

    Route::post('/annuler/{booking}', [BookingController::class, 'cancel'])->name('booking.cancel');

    // ─── Interface Police (DG + Agent Police) ──────────────────────────────────────
    Route::middleware('role:directeur_general,agent_police')->group(function () {
        Route::get('/police', [PoliceController::class, 'index'])->name('police');
        Route::post('/police/verifier', [PoliceController::class, 'verifyPassenger'])->name('police.verifier');
        Route::post('/police/verifier-trajet/{trip}', [PoliceController::class, 'verifyTrip'])->name('police.verifier-trajet');
        Route::get('/police/surveillance', [PoliceController::class, 'watchlistIndex'])->name('police.watchlist');
        Route::post('/police/surveillance', [PoliceController::class, 'watchlistStore'])->name('police.watchlist.stocker');
        Route::post('/police/surveillance/{watchlistEntry}/retirer', [PoliceController::class, 'watchlistClear'])->name('police.watchlist.clear');
        Route::get('/police/verifications', [PoliceController::class, 'checkLogs'])->name('police.verifications');
    });

    // ─── Notifications (tous les rôles admin) ──────────────────────────────────────
    Route::get('/notifications', [AdminController::class, 'notifications'])->name('notifications');
    Route::post('/notifications/envoyer', [AdminController::class, 'sendNotification'])->name('notifications.envoyer');

    // ─── RH (directeur_general + responsable_flotte) ───────────────────────────────
    Route::middleware('role:directeur_general,responsable_flotte')->prefix('rh')->name('rh.')->group(function () {
        Route::get('/dashboard', [RhController::class, 'dashboard'])->name('dashboard');
        Route::get('/personnel', [RhController::class, 'personnel'])->name('personnel');
        Route::get('/personnel/{user}', [RhController::class, 'personnelShow'])->name('personnel.show');
        Route::get('/contrats', [RhController::class, 'contratsIndex'])->name('contrats');
        Route::post('/contrats', [RhController::class, 'contratsStore'])->name('contrats.store');
        Route::put('/contrats/{contract}', [RhController::class, 'contratsUpdate'])->name('contrats.update');
        Route::get('/conges', [RhController::class, 'congesIndex'])->name('conges');
        Route::post('/conges', [RhController::class, 'congesStore'])->name('conges.store');
        Route::post('/conges/{leave}/approuver', [RhController::class, 'congesApprouver'])->name('conges.approuver');
        Route::post('/conges/{leave}/rejeter', [RhController::class, 'congesRejeter'])->name('conges.rejeter');
        Route::get('/pointage', [RhController::class, 'pointageIndex'])->name('pointage');
        Route::post('/pointage', [RhController::class, 'pointageStore'])->name('pointage.store');
        Route::get('/paie', [RhController::class, 'paieIndex'])->name('paie');
        Route::post('/paie/generer', [RhController::class, 'paieGenerer'])->name('paie.generer');
        Route::patch('/paie/{paySlip}/payer', [RhController::class, 'paiePayer'])->name('paie.payer');
    });

    // ─── Finance Avancée (directeur_general + comptable) ───────────────────────────
    Route::middleware('role:directeur_general,comptable')->prefix('finance')->name('finance.')->group(function () {
        Route::get('/factures', [FinanceController::class, 'facturesIndex'])->name('factures');
        Route::post('/factures', [FinanceController::class, 'facturesStore'])->name('factures.store');
        Route::post('/factures/{invoice}/payer', [FinanceController::class, 'facturesPayer'])->name('factures.payer');
        Route::post('/factures/{invoice}/annuler', [FinanceController::class, 'facturesAnnuler'])->name('factures.annuler');
        Route::get('/grand-livre', [FinanceController::class, 'grandLivre'])->name('grand-livre');
        Route::get('/bilan', [FinanceController::class, 'bilan'])->name('bilan');
        Route::get('/budgets', [FinanceController::class, 'budgetsIndex'])->name('budgets');
        Route::post('/budgets', [FinanceController::class, 'budgetsStore'])->name('budgets.store');
    });

    // ─── Paiements (directeur_general + comptable) ─────────────────────────────────
    Route::middleware('role:directeur_general,comptable')->group(function () {
        Route::get('/paiements', [AdminPaymentController::class, 'index'])->name('paiements');
        Route::post('/paiements/{payment}/rembourser', [AdminPaymentController::class, 'refund'])->name('paiements.rembourser');
        Route::post('/paiements/{payment}/verifier', [AdminPaymentController::class, 'verify'])->name('paiements.verifier');
        Route::get('/paiements/stats', [AdminPaymentController::class, 'stats'])->name('paiements.stats');
    });

    // ─── Bagages (directeur_general + chef_garde + guichetiere + bagagiste) ───────
    Route::middleware('role:directeur_general,chef_garde,guichetiere,bagagiste')->group(function () {
        Route::get('/bagages', [BaggageController::class, 'index'])->name('bagages');
        Route::post('/bagages', [BaggageController::class, 'store'])->name('bagages.stocker');
        Route::post('/bagages/scanner', [BaggageController::class, 'scan'])->name('bagages.scanner');
        Route::get('/bagages/{baggage}', [BaggageController::class, 'show'])->name('bagages.show');
        Route::get('/bagages/trajet/{trip}', [BaggageController::class, 'tripManifest'])->name('bagages.manifeste');
    });

    // ─── Routes exclusives DG ──────────────────────────────────────────────────────
    Route::middleware('role:directeur_general')->group(function () {
        Route::post('/flotte/{vehicle}/maintenance', [FleetController::class, 'storeMaintenance'])->name('flotte.maintenance');
        Route::patch('/depenses/{expense}/valider', [FinanceController::class, 'expensesValidate'])->name('depenses.valider');

        // Sécurité
        Route::get('/securite', [SecurityController::class, 'dashboard'])->name('securite');
        Route::post('/securite/alertes', [SecurityController::class, 'alertesStore'])->name('securite.alertes.store');
        Route::post('/securite/alertes/{alert}/resoudre', [SecurityController::class, 'alertesResoudre'])->name('securite.alertes.resoudre');
        Route::post('/securite/incidents', [SecurityController::class, 'incidentsStore'])->name('securite.incidents.store');
        Route::post('/securite/incidents/{incident}/resoudre', [SecurityController::class, 'incidentsResoudre'])->name('securite.incidents.resoudre');
        Route::get('/securite/manifeste/{trip}', [SecurityController::class, 'manifeste'])->name('securite.manifeste');

        // Formations CRUD
        Route::get('/formations', [AdminLearningController::class, 'coursesIndex'])->name('formations.cours');
        Route::get('/formations/creer', [AdminLearningController::class, 'coursesCreate'])->name('formations.cours.creer');
        Route::post('/formations', [AdminLearningController::class, 'coursesStore'])->name('formations.cours.stocker');
        Route::get('/formations/{course}/modifier', [AdminLearningController::class, 'coursesEdit'])->name('formations.cours.modifier');
        Route::put('/formations/{course}', [AdminLearningController::class, 'coursesUpdate'])->name('formations.cours.mettre-a-jour');
        Route::delete('/formations/{course}', [AdminLearningController::class, 'coursesDestroy'])->name('formations.cours.supprimer');
        Route::get('/formations/{course}/quiz', [AdminLearningController::class, 'quizzesIndex'])->name('formations.quiz.index');
        Route::post('/formations/{course}/quiz', [AdminLearningController::class, 'quizzesStore'])->name('formations.quiz.stocker');
        Route::put('/formations/{course}/quiz/{quiz}', [AdminLearningController::class, 'quizzesUpdate'])->name('formations.quiz.mettre-a-jour');
        Route::delete('/formations/{course}/quiz/{quiz}', [AdminLearningController::class, 'quizzesDestroy'])->name('formations.quiz.supprimer');

        // Certificats
        Route::get('/certificats', [AdminLearningController::class, 'certificatesIndex'])->name('certificats');
        Route::post('/certificats/emettre', [AdminLearningController::class, 'certificatesIssue'])->name('certificats.emettre');
        Route::get('/certificats/{certificate}/pdf', [AdminLearningController::class, 'certificatesGeneratePdf'])->name('certificats.pdf');

        // Rapports Avancés
        Route::get('/rapports-avances', [ReportsController::class, 'index'])->name('rapports.avances');
        Route::get('/rapports-avances/excel', [ReportsController::class, 'exportExcel'])->name('rapports.avances.excel');
        Route::get('/rapports-avances/csv', [ReportsController::class, 'exportCsv'])->name('rapports.avances.csv');

        // Anti-Fraude
        Route::get('/fraude', [FraudController::class, 'index'])->name('fraude');
        Route::post('/fraude/{fraudCheck}/resoudre', [FraudController::class, 'resolve'])->name('fraude.resoudre');
        Route::post('/fraude/{fraudCheck}/classer', [FraudController::class, 'dismiss'])->name('fraude.classer');

        // Multi-Compagnies
        Route::get('/compagnies', [CompanyController::class, 'index'])->name('compagnies');
        Route::post('/compagnies', [CompanyController::class, 'store'])->name('compagnies.stocker');
        Route::put('/compagnies/{company}', [CompanyController::class, 'update'])->name('compagnies.mettre-a-jour');

        // Multi-Gares
        Route::get('/gares', [StationController::class, 'index'])->name('gares');
        Route::post('/gares', [StationController::class, 'store'])->name('gares.stocker');
        Route::put('/gares/{station}', [StationController::class, 'update'])->name('gares.mettre-a-jour');
        Route::post('/gares/routes', [StationController::class, 'routesStore'])->name('gares.routes.stocker');
    });
});

// ─── Webhooks Paiements (sans auth) ──────────────────────────────────────────────
use App\Http\Controllers\Api\PaymentWebhookController;
Route::post('/webhook/orange-money', [PaymentWebhookController::class, 'orangeMoney'])->name('webhook.orange');
Route::post('/webhook/moov-money', [PaymentWebhookController::class, 'moovMoney'])->name('webhook.moov');

require __DIR__ . '/auth.php';
