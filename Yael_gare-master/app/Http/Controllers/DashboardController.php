<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Session;

class DashboardController extends Controller
{
    public function index()
    {
        // Sécurise un minimum l'accès (si pas de token en session -> retour login)
        if (! Session::get('auth.token')) {
            return redirect()->route('login')->with('toast', [
                'type' => 'warning',
                'title' => 'Session expirée',
                'message' => 'Veuillez vous reconnecter.',
            ]);
        }

        // Rend ta vue du tableau de bord
        return view('pages.dashboard'); // resources/views/pages/dashboard.blade.php
    }
}
