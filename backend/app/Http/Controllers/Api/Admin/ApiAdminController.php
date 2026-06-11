<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;

/**
 * Contrôleur de base pour les API Admin.
 * Les méthodes délèguent aux contrôleurs Inertia existants
 * en remplaçant Inertia::render() par response()->json().
 */
abstract class ApiAdminController extends Controller {}
