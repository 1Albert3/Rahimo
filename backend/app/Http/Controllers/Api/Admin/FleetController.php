<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\FleetController as Base;
use App\Models\User;
use Illuminate\Http\Request;

class FleetController extends Base
{
    // Toutes les méthodes héritées retournent déjà JSON si expectsJson()
    // On alias maintenanceStore pour matcher la route API
    public function maintenanceStore(Request $request)
    {
        return $this->maintenanceSchedule($request);
    }
}
