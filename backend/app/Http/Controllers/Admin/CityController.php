<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\Request;


class CityController extends Controller
{
    public function index()
    {
        $cities = City::withCount([
            'tripsAsDeparture',
            'tripsAsArrival',
            'stations',
        ])
            ->orderBy('nom')
            ->paginate(50)
            ->through(fn ($c) => [
                'id' => $c->id,
                'nom' => $c->nom,
                'trips_as_departure_count' => $c->trips_as_departure_count,
                'trips_as_arrival_count' => $c->trips_as_arrival_count,
                'stations_count' => $c->stations_count,
                'created_at' => $c->created_at?->format('Y-m-d'),
            ]);

        $__data = compact('cities');
        if (request()->expectsJson()) return response()->json($__data);
        return response()->json($__data);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255|unique:cities,nom',
        ]);

        City::create($validated);

        return redirect()->route('admin.villes')->with('success', 'Ville créée.');
    }

    public function update(Request $request, City $city)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255|unique:cities,nom,'.$city->id,
        ]);

        $city->update($validated);

        return redirect()->route('admin.villes')->with('success', 'Ville mise à jour.');
    }

    public function destroy(City $city)
    {
        // Empêcher la suppression si des relations existent
        $usageCount = $city->tripsAsDeparture()->count()
            + $city->tripsAsArrival()->count()
            + $city->stations()->count()
            + $city->colisAsDeparture()->count()
            + $city->colisAsArrival()->count()
            + $city->motoTransportsAsOrigin()->count()
            + $city->motoTransportsAsDestination()->count();

        if ($usageCount > 0) {
            return back()->withErrors([
                'message' => "Impossible de supprimer cette ville : elle est utilisée par {$usageCount} enregistrement(s).",
            ]);
        }

        $city->delete();

        return redirect()->route('admin.villes')->with('success', 'Ville supprimée.');
    }
}
