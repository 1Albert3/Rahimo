<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use Illuminate\Http\Request;

class TripController extends Controller
{
    public function index(Request $request)
    {
        $query = Trip::query();

        if ($departure = $request->query('departure')) {
            $query->where('departure_city', $departure);
        }
        if ($arrival = $request->query('arrival')) {
            $query->where('arrival_city', $arrival);
        }
        if ($date = $request->query('date')) {
            $query->whereDate('departure_time', $date);
        }
        if ($busType = $request->query('bus_type')) {
            $types = explode(',', $busType);
            $query->whereHas('vehicle', fn ($q) => $q->whereIn('type', $types));
        }
        if ($priceMax = $request->query('price_max')) {
            $query->where('price', '<=', (int) $priceMax);
        }
        $sortBy = in_array($request->query('sort_by'), ['departure_time','price','arrival_time'])
            ? $request->query('sort_by') : 'departure_time';
        $query->orderBy($sortBy, $request->query('sort_order') === 'desc' ? 'desc' : 'asc');

        $trips = $query->with('vehicle')->paginate(20);
        return response()->json($trips);
    }

    public function show(Trip $trip)
    {
        $trip->load('vehicle');
        return response()->json($trip);
    }

    public function seats(Request $request, Trip $trip)
    {
        $web = app(\App\Http\Controllers\TripController::class);
        $r = $web->seats($request, $trip);
        if (method_exists($r, 'getData')) return response()->json($r->getData());
        return $r;
    }

    public function validatePromo(Request $request)
    {
        return app(\App\Http\Controllers\TripController::class)->validatePromo($request);
    }
}
