<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Station;
use App\Models\StationRoute;
use App\Models\Company;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StationController extends Controller
{
    public function index()
    {
        $stations = Station::orderBy('city')->orderBy('name')
            ->paginate(30)
            ->through(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'city' => $s->city,
                'address' => $s->address,
                'type' => $s->type,
                'phone' => $s->phone,
                'is_active' => $s->is_active,
                'location' => $s->latitude && $s->longitude
                    ? round($s->latitude, 4) . ', ' . round($s->longitude, 4)
                    : null,
            ]);

        $routes = StationRoute::with('departureStation', 'arrivalStation', 'company')
            ->orderBy('route_name')
            ->paginate(30)
            ->through(fn ($r) => [
                'id' => $r->id,
                'name' => $r->route_name,
                'from' => $r->departureStation?->name,
                'to' => $r->arrivalStation?->name,
                'company' => $r->company?->name,
                'price' => (int) $r->base_price,
                'duration' => $r->estimated_minutes,
                'distance' => $r->distance_km,
                'is_active' => $r->is_active,
            ]);

        return Inertia::render('Admin/Stations/Index', compact('stations', 'routes'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'type' => 'required|in:bus_stop,terminal,agency',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_active' => 'boolean',
        ]);

        Station::create($validated);

        return back()->with('success', 'Gare créée.');
    }

    public function update(Request $request, Station $station)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'type' => 'required|in:bus_stop,terminal,agency',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_active' => 'boolean',
        ]);

        $station->update($validated);

        return back()->with('success', 'Gare mise à jour.');
    }

    public function routesStore(Request $request)
    {
        $validated = $request->validate([
            'departure_station_id' => 'required|exists:stations,id',
            'arrival_station_id' => 'required|exists:stations,id|different:departure_station_id',
            'company_id' => 'nullable|exists:companies,id',
            'route_name' => 'required|string|max:255',
            'base_price' => 'required|numeric|min:0',
            'estimated_minutes' => 'nullable|integer|min:1',
            'distance_km' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]);

        StationRoute::create($validated);

        return back()->with('success', 'Route créée.');
    }
}
