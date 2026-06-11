<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\AdminController as BaseController;

class DashboardController extends BaseController
{
    // Les méthodes héritées (dashboard, manifeste, rapports) utilisent
    // request()->expectsJson() → retournent response()->json() automatiquement.
    // On surcharge juste les noms pour matcher les routes API.

    public function index()
    {
        return parent::dashboard();
    }
}
