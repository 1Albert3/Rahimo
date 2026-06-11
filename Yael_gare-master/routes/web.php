<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ChauffeursController;
use App\Http\Controllers\BusController;
use App\Http\Controllers\AgentsController;
use App\Http\Controllers\HorairesController;
use App\Http\Controllers\TrajetsController;
use App\Http\Controllers\DestinationsController;
use App\Http\Controllers\VoyagesController;
use App\Http\Controllers\PassagersController;
use App\Http\Controllers\ReservationsController;

// --- Auth public ---
Route::view('/login', 'auth.login')->name('login');
Route::post('/login', [LoginController::class, 'authenticate'])
    ->middleware('throttle:5,1')
    ->name('login.perform');

// --- Déconnexion (protégée) ---
Route::post('/logout', [LoginController::class, 'logout'])
    ->middleware('front.auth')
    ->name('logout');

// --- Redirection racine ---
Route::get('/', fn () => redirect()->route('dashboard'));

// --- Pages protégées ---
Route::middleware('front.auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('chauffeurs', ChauffeursController::class)->names('chauffeurs');
    Route::resource('bus',        BusController::class)->names('bus');
    Route::resource('agents',     AgentsController::class)->names('agents');
    Route::resource('horaires',   HorairesController::class)->names('horaires');
    Route::resource('destinations', DestinationsController::class)->names('destinations');
    Route::resource('trajets',      TrajetsController::class)->names('trajets');
    Route::resource('voyages',      VoyagesController::class)->names('voyages');
    Route::resource('passagers',    PassagersController::class)->names('passagers');
    Route::resource('reservations', ReservationsController::class)->names('reservations');
    Route::get('/debug-session', [TrajetsController::class, 'debugSession']);
    // Route::get('destinations', [DestinationsController::class, 'index'])->name('destinations.index');
    // Route::get('trajets',      [TrajetsController::class, 'index'])->name('trajets.index');
    // Route::get('voyages',      [VoyagesController::class, 'index'])->name('voyages.index');
    // Route::get('passagers',    [PassagersController::class, 'index'])->name('passagers.index');

    // Route::get('/trajets', [TrajetsController::class, 'index'])->name('trajets.index');
    // // Route::get('reservations', [ReservationsController::class, 'index'])->name('reservations.index');
    // Route::get('/trajets', [TrajetsController::class, 'index'])->name('trajets.index');
    // Route::post('/trajets', [TrajetsController::class, 'store'])->name('trajets.store');
    // Route::put('/trajets/{id}', [TrajetsController::class, 'update'])->name('trajets.update');
    // Route::delete('/trajets/{id}', [TrajetsController::class, 'destroy'])->name('trajets.destroy');
});
