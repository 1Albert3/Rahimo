<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TripController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ColisController;
use App\Http\Controllers\Api\PaymentWebhookController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\FleetController;
use App\Http\Controllers\Api\Admin\RhController;
use App\Http\Controllers\Api\Admin\FinanceController;
use App\Http\Controllers\Api\Admin\ServicesController;
use App\Http\Controllers\Api\Admin\SecurityController;
use App\Http\Controllers\Api\Admin\LearningController;
use App\Http\Controllers\Api\Admin\PoliceController;
use App\Http\Controllers\Api\Admin\FraudController;
use App\Http\Controllers\Api\Admin\BaggageController;
use App\Http\Controllers\Api\Admin\CityController;
use App\Http\Controllers\Api\Admin\CompanyController;
use App\Http\Controllers\Api\Admin\StationController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\ReclamationController;
use App\Http\Controllers\Api\Admin\AlertController;
use App\Http\Controllers\Api\Admin\ReportsController;
use App\Http\Controllers\Api\Admin\NotificationController;
use App\Http\Controllers\Api\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Api\Admin\BoardingController;
use Illuminate\Support\Facades\Route;

// ── Public (no auth) ──────────────────────────────────────────────────────────

Route::get('/ping', fn () => response()->json(['status' => 'ok']));

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password',  [AuthController::class, 'resetPassword']);

Route::get('/trips',           [TripController::class, 'index']);
Route::get('/trips/{trip}',    [TripController::class, 'show']);
Route::get('/trips/{trip}/seats', [TripController::class, 'seats']);
Route::post('/promotions/validate', [TripController::class, 'validatePromo']);

Route::get('/colis/track',    [ColisController::class, 'track']);

// Services publics
Route::prefix('services')->group(function () {
    Route::post('/parking',      [ServicesController::class, 'publicParkingStore']);
    Route::post('/location',     [ServicesController::class, 'publicLocationStore']);
    Route::post('/hebergement',  [ServicesController::class, 'publicHebergementStore']);
    Route::post('/moto-transport',[ServicesController::class, 'publicMotoStore']);
    Route::post('/reclamations', [ReclamationController::class, 'publicStore']);
    Route::post('/objets-trouves',[ServicesController::class, 'publicLostAndFoundStore']);
});

// ── Authenticated (Sanctum) ───────────────────────────────────────────────────

Route::middleware([
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'auth:sanctum',
])->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // Profile
    Route::patch('/profile', [UserController::class, 'updateProfile']);
    Route::patch('/profile/password', [UserController::class, 'updatePassword']);

    // Bookings (client)
    Route::post('/bookings',                           [BookingController::class, 'store']);
    Route::get('/bookings/{booking}',                  [BookingController::class, 'show']);
    Route::post('/bookings/{booking}/cancel',          [BookingController::class, 'cancel']);
    Route::post('/bookings/{booking}/reschedule',      [BookingController::class, 'reschedule']);
    Route::post('/bookings/{booking}/change-seat',     [BookingController::class, 'changeSeat']);
    Route::get('/bookings/{booking}/pdf',              [BookingController::class, 'downloadPdf']);
    Route::get('/my-bookings',                         [BookingController::class, 'userBookings']);

    // Colis (client)
    Route::post('/colis', [ColisController::class, 'store']);

    // ── ADMIN ─────────────────────────────────────────────────────────────────

    $adminRoles = 'directeur_general,responsable_flotte,comptable,chef_garde,guichetiere,agent_police,bagagiste';

    Route::middleware("role:{$adminRoles}")->prefix('admin')->group(function () {

        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/manifeste', [DashboardController::class, 'manifeste']);

        // Notifications
        Route::get('/notifications',             [NotificationController::class, 'index']);
        Route::post('/notifications/envoyer',    [NotificationController::class, 'send']);

        // Alertes générales
        Route::get('/alertes',                   [AlertController::class, 'index']);
        Route::post('/alertes',                  [AlertController::class, 'store']);
        Route::patch('/alertes/{alert}/traiter', [AlertController::class, 'traiter']);

        // Rapports
        Route::get('/rapports',                  [ReportsController::class, 'index']);
        Route::post('/rapports/export',          [ReportsController::class, 'export']);

        // Réclamations
        Route::get('/reclamations',                        [ReclamationController::class, 'index']);
        Route::post('/reclamations',                       [ReclamationController::class, 'store']);
        Route::patch('/reclamations/{reclamation}/statut', [ReclamationController::class, 'updateStatus']);

        // Objets trouvés
        Route::get('/objets-trouves',                 [ServicesController::class, 'adminLostItems']);
        Route::patch('/objets-trouves/{lostItem}',    [ServicesController::class, 'adminLostItemUpdate']);

        // Guichet
        Route::get('/guichet',   [BookingController::class, 'guichetIndex']);
        Route::post('/guichet',  [BookingController::class, 'guichetStore']);

        // Colis admin
        Route::get('/colis',                      [ColisController::class, 'adminIndex']);
        Route::post('/colis',                     [ColisController::class, 'adminStore']);
        Route::patch('/colis/{colis}/statut',     [ColisController::class, 'updateStatus']);

        // Embarquement QR
        Route::get('/embarquement',               [BoardingController::class, 'index']);
        Route::post('/embarquement/verifier',     [BoardingController::class, 'verifyQr']);
        Route::post('/embarquement/confirmer',    [BoardingController::class, 'confirmBoarding']);

        // Paiements (annulation booking admin)
        Route::post('/annuler/{booking}',         [BookingController::class, 'adminCancel']);

        // ── Flotte (DG + responsable_flotte) ─────────────────────────────────

        Route::middleware('role:directeur_general,responsable_flotte')->group(function () {
            Route::get('/flotte',                    [FleetController::class, 'index']);
            Route::post('/flotte',                   [FleetController::class, 'store']);
            Route::put('/flotte/{vehicle}',          [FleetController::class, 'update']);
            Route::delete('/flotte/{vehicle}',       [FleetController::class, 'destroy']);
            Route::get('/flotte/gps',                [FleetController::class, 'gpsData']);
            Route::post('/flotte/gps/simuler',       [FleetController::class, 'simulateGps']);
            Route::get('/maintenance',               [FleetController::class, 'maintenanceIndex']);
            Route::post('/maintenance',              [FleetController::class, 'maintenanceStore']);
            Route::patch('/maintenance/{r}/terminer',[FleetController::class, 'maintenanceComplete']);
            Route::get('/trajets',                   [FleetController::class, 'tripsIndex']);
            Route::post('/trajets',                  [FleetController::class, 'tripsStore']);
            Route::put('/trajets/{trip}',            [FleetController::class, 'tripsUpdate']);
            Route::delete('/trajets/{trip}',         [FleetController::class, 'tripsDestroy']);
            Route::get('/planning',                  [FleetController::class, 'planningIndex']);
            Route::post('/planning/assigner',        [FleetController::class, 'planningAssign']);
            Route::get('/alertes-vitesse',           [FleetController::class, 'speedAlertsIndex']);
            Route::post('/alertes-vitesse/{sa}/acquitter', [FleetController::class, 'speedAlertsAcknowledge']);
            Route::post('/alertes-vitesse/{sa}/resoudre',  [FleetController::class, 'speedAlertsResolve']);

            // RH
            Route::get('/rh/dashboard',              [RhController::class, 'dashboard']);
            Route::get('/rh/personnel',              [RhController::class, 'personnel']);
            Route::get('/rh/personnel/{user}',       [RhController::class, 'personnelShow']);
            Route::get('/rh/contrats',               [RhController::class, 'contratsIndex']);
            Route::post('/rh/contrats',              [RhController::class, 'contratsStore']);
            Route::put('/rh/contrats/{contract}',    [RhController::class, 'contratsUpdate']);
            Route::get('/rh/conges',                 [RhController::class, 'congesIndex']);
            Route::post('/rh/conges',                [RhController::class, 'congesStore']);
            Route::post('/rh/conges/{leave}/approuver', [RhController::class, 'congesApprouver']);
            Route::post('/rh/conges/{leave}/rejeter',   [RhController::class, 'congesRejeter']);
            Route::get('/rh/pointage',               [RhController::class, 'pointageIndex']);
            Route::post('/rh/pointage',              [RhController::class, 'pointageStore']);
            Route::get('/rh/paie',                   [RhController::class, 'paieIndex']);
            Route::post('/rh/paie/generer',          [RhController::class, 'paieGenerer']);
            Route::patch('/rh/paie/{paySlip}/payer', [RhController::class, 'paiePayer']);
        });

        // ── Finance (DG + comptable) ──────────────────────────────────────────

        Route::middleware('role:directeur_general,comptable')->group(function () {
            Route::get('/comptabilite',              [FinanceController::class, 'comptabilite']);
            Route::get('/depenses',                  [FinanceController::class, 'expensesIndex']);
            Route::post('/depenses',                 [FinanceController::class, 'expensesStore']);
            Route::post('/caisses/ouvrir',           [FinanceController::class, 'caissesOuvrir']);
            Route::post('/caisses/{cr}/fermer',      [FinanceController::class, 'caissesFermer']);
            Route::post('/rapprochement',            [FinanceController::class, 'reconciliationsStore']);
            Route::get('/factures',                  [FinanceController::class, 'facturesIndex']);
            Route::post('/factures',                 [FinanceController::class, 'facturesStore']);
            Route::post('/factures/{inv}/payer',     [FinanceController::class, 'facturesPayer']);
            Route::post('/factures/{inv}/annuler',   [FinanceController::class, 'facturesAnnuler']);
            Route::get('/grand-livre',               [FinanceController::class, 'grandLivre']);
            Route::get('/bilan',                     [FinanceController::class, 'bilan']);
            Route::get('/budgets',                   [FinanceController::class, 'budgetsIndex']);
            Route::post('/budgets',                  [FinanceController::class, 'budgetsStore']);
            Route::get('/paiements',                 [AdminPaymentController::class, 'index']);
            Route::post('/paiements/{p}/rembourser', [AdminPaymentController::class, 'refund']);
            Route::post('/paiements/{p}/verifier',   [AdminPaymentController::class, 'verify']);
        });

        // ── Services (tous admins) ────────────────────────────────────────────

        Route::prefix('services')->group(function () {
            Route::get('/parking',                    [ServicesController::class, 'parking']);
            Route::post('/parking',                   [ServicesController::class, 'parkingStore']);
            Route::post('/parking/{p}/sortir',        [ServicesController::class, 'parkingSortir']);
            Route::get('/location',                   [ServicesController::class, 'location']);
            Route::post('/location',                  [ServicesController::class, 'locationStore']);
            Route::post('/location/{r}/terminer',     [ServicesController::class, 'locationTerminer']);
            Route::get('/hebergement',                [ServicesController::class, 'hebergement']);
            Route::post('/hebergement',               [ServicesController::class, 'hebergementStore']);
            Route::post('/hebergement/{a}/checkin',   [ServicesController::class, 'hebergementCheckin']);
            Route::post('/hebergement/{a}/checkout',  [ServicesController::class, 'hebergementCheckout']);
            Route::get('/moto-transport',             [ServicesController::class, 'motoTransport']);
            Route::post('/moto-transport',            [ServicesController::class, 'motoTransportStore']);
            Route::post('/moto-transport/{m}/status', [ServicesController::class, 'motoTransportUpdateStatus']);
        });

        // ── Bagages (DG + chef_garde + guichetiere + bagagiste) ───────────────

        Route::middleware('role:directeur_general,chef_garde,guichetiere,bagagiste')->group(function () {
            Route::get('/bagages',               [BaggageController::class, 'index']);
            Route::post('/bagages',              [BaggageController::class, 'store']);
            Route::post('/bagages/scanner',      [BaggageController::class, 'scan']);
            Route::get('/bagages/{baggage}',     [BaggageController::class, 'show']);
            Route::get('/bagages/trajet/{trip}', [BaggageController::class, 'tripManifest']);
        });

        // ── Police (DG + agent_police) ────────────────────────────────────────

        Route::middleware('role:directeur_general,agent_police')->group(function () {
            Route::get('/police',                           [PoliceController::class, 'index']);
            Route::post('/police/verifier',                 [PoliceController::class, 'verifyPassenger']);
            Route::post('/police/verifier-trajet/{trip}',  [PoliceController::class, 'verifyTrip']);
            Route::get('/police/surveillance',              [PoliceController::class, 'watchlistIndex']);
            Route::post('/police/surveillance',             [PoliceController::class, 'watchlistStore']);
            Route::post('/police/surveillance/{w}/retirer',[PoliceController::class, 'watchlistClear']);
            Route::get('/police/verifications',             [PoliceController::class, 'checkLogs']);
        });

        // ── DG seulement ──────────────────────────────────────────────────────

        Route::middleware('role:directeur_general')->group(function () {
            // Utilisateurs CRUD
            Route::get('/utilisateurs',          [UserController::class, 'index']);
            Route::post('/utilisateurs',         [UserController::class, 'store']);
            Route::put('/utilisateurs/{user}',   [UserController::class, 'update']);
            Route::delete('/utilisateurs/{user}',[UserController::class, 'destroy']);

            // Validation dépenses
            Route::patch('/depenses/{expense}/valider', [FinanceController::class, 'expensesValidate']);

            // Flotte maintenance (accès DG uniquement pour enregistrer)
            Route::post('/flotte/{vehicle}/maintenance', [FleetController::class, 'storeMaintenance']);

            // Sécurité
            Route::get('/securite',                       [SecurityController::class, 'dashboard']);
            Route::post('/securite/alertes',              [SecurityController::class, 'alertesStore']);
            Route::post('/securite/alertes/{a}/resoudre', [SecurityController::class, 'alertesResoudre']);
            Route::post('/securite/incidents',            [SecurityController::class, 'incidentsStore']);
            Route::post('/securite/incidents/{i}/resoudre',[SecurityController::class, 'incidentsResoudre']);
            Route::get('/securite/manifeste/{trip}',      [SecurityController::class, 'manifeste']);

            // Formations CRUD
            Route::get('/formations',                        [LearningController::class, 'coursesIndex']);
            Route::post('/formations',                       [LearningController::class, 'coursesStore']);
            Route::put('/formations/{course}',               [LearningController::class, 'coursesUpdate']);
            Route::delete('/formations/{course}',            [LearningController::class, 'coursesDestroy']);
            Route::get('/formations/{course}/quiz',          [LearningController::class, 'quizzesIndex']);
            Route::post('/formations/{course}/quiz',         [LearningController::class, 'quizzesStore']);
            Route::put('/formations/{course}/quiz/{quiz}',   [LearningController::class, 'quizzesUpdate']);
            Route::delete('/formations/{course}/quiz/{quiz}',[LearningController::class, 'quizzesDestroy']);
            Route::get('/certificats',                       [LearningController::class, 'certificatesIndex']);
            Route::post('/certificats/emettre',              [LearningController::class, 'certificatesIssue']);
            Route::get('/certificats/{certificate}/pdf',     [LearningController::class, 'certificatesGeneratePdf']);

            // Anti-fraude
            Route::get('/fraude',                        [FraudController::class, 'index']);
            Route::post('/fraude/{fc}/resoudre',         [FraudController::class, 'resolve']);
            Route::post('/fraude/{fc}/classer',          [FraudController::class, 'dismiss']);

            // Villes
            Route::get('/villes',             [CityController::class, 'index']);
            Route::post('/villes',            [CityController::class, 'store']);
            Route::put('/villes/{city}',      [CityController::class, 'update']);
            Route::delete('/villes/{city}',   [CityController::class, 'destroy']);

            // Compagnies
            Route::get('/compagnies',              [CompanyController::class, 'index']);
            Route::post('/compagnies',             [CompanyController::class, 'store']);
            Route::put('/compagnies/{company}',    [CompanyController::class, 'update']);

            // Gares
            Route::get('/gares',               [StationController::class, 'index']);
            Route::post('/gares',              [StationController::class, 'store']);
            Route::put('/gares/{station}',     [StationController::class, 'update']);
            Route::post('/gares/routes',       [StationController::class, 'routesStore']);

            // Rapports avancés
            Route::get('/rapports-avances',        [ReportsController::class, 'advanced']);
            Route::get('/rapports-avances/excel',  [ReportsController::class, 'exportExcel']);
            Route::get('/rapports-avances/csv',    [ReportsController::class, 'exportCsv']);
        });

        // ── Chauffeur (formations + alertes lecture seule) ────────────────────
    });

    // ── Chauffeur ─────────────────────────────────────────────────────────────

    Route::middleware('role:chauffeur')->prefix('chauffeur')->group(function () {
        Route::get('/trajets',               [FleetController::class, 'driverTrips']);
        Route::get('/formations',            [LearningController::class, 'myCoursesIndex']);
        Route::get('/formations/{course}',   [LearningController::class, 'myCourseShow']);
        Route::post('/formations/quiz/{quiz}',[LearningController::class, 'submitQuiz']);
        Route::get('/alertes',               [AlertController::class, 'driverIndex']);
    });

    // ── Client ────────────────────────────────────────────────────────────────

    Route::middleware('role:client')->prefix('client')->group(function () {
        // (déjà couvert par /my-bookings et /bookings/*)
    });
});

// ── Webhooks (sans auth) ──────────────────────────────────────────────────────

Route::post('/webhook/orange-money', [PaymentWebhookController::class, 'orangeMoney']);
Route::post('/webhook/moov-money',   [PaymentWebhookController::class, 'moovMoney']);
