<?php

namespace App\Http\Controllers;

use App\Models\Promotion;
use App\Models\Trip;
use App\Services\LoyaltyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class TripController extends Controller
{
    public function search(Request $request)
    {
        $query = Trip::forCurrentCompany()->with('vehicle')->available();

        // Filtre par station de départ
        if ($stationFrom = $request->input('departure_station_id')) {
            $query->where('departure_station_id', $stationFrom);
        }
        if ($stationTo = $request->input('arrival_station_id')) {
            $query->where('arrival_station_id', $stationTo);
        }

        if ($depart = $request->input('depart')) {
            $query->where('departure_city', $depart);
        }
        if ($arrivee = $request->input('arrivee')) {
            $query->where('arrival_city', $arrivee);
        }
        if ($date = $request->input('date')) {
            $query->whereDate('departure_date', $date);
        }

        // Filtre par type de bus (vip / standard)
        if ($busType = $request->input('bus_type')) {
            $types = explode(',', $busType);
            $query->whereHas('vehicle', fn ($q) => $q->whereIn('type', $types));
        }

        // Filtre par prix max
        if ($priceMax = $request->input('price_max')) {
            $query->where('price', '<=', (int) $priceMax);
        }

        // Filtre par plage horaire
        if ($timeFrom = $request->input('time_from')) {
            $query->where('departure_time', '>=', $timeFrom);
        }
        if ($timeTo = $request->input('time_to')) {
            $query->where('departure_time', '<=', $timeTo);
        }

        // Tri
        $sortBy = $request->input('sort_by', 'departure_time');
        $sortOrder = $request->input('sort_order', 'asc');
        $allowedSorts = ['departure_time', 'price', 'arrival_time'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder === 'desc' ? 'desc' : 'asc');
        } else {
            $query->orderBy('departure_time');
        }

        $trips = $query->get()->map(function ($trip) {
            return $this->formatTrip($trip);
        });

        $passagers = max(1, (int) $request->input('passagers', '1'));

        return response()->json([
            'trajets' => $trips,
            'depart' => $depart ?? request('depart', 'Ouagadougou'),
            'arrivee' => $arrivee ?? request('arrivee', 'Bobo-Dioulasso'),
            'date' => $date ?? request('date', ''),
            'passagers' => (string) $passagers,
            'filters' => [
                'bus_type' => $request->input('bus_type', 'vip,standard'),
                'price_max' => $request->input('price_max', ''),
                'time_from' => $request->input('time_from', ''),
                'time_to' => $request->input('time_to', ''),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    public function seats(Request $request, Trip $trip)
    {
        $trip->load('vehicle');

        $bookedSeats = $trip->bookings()
            ->where('status', 'confirmed')
            ->get()
            ->pluck('seat_numbers')
            ->flatten()
            ->toArray();

        $capacity = $trip->vehicle->capacity ?? 55;
        $seats = collect(range(1, $capacity))->map(function ($number) use ($bookedSeats) {
            $features = [];
            if ($number % 4 === 1 || $number % 4 === 0) {
                $features[] = 'fenêtre';
            } else {
                $features[] = 'couloir';
            }
            return [
                'numero' => $number,
                'libre' => !in_array($number, $bookedSeats),
                'features' => $features,
            ];
        });

        $passagers = max(1, min((int) $request->input('passagers', '1'), 10));

        return response()->json([
            'trajet' => $this->formatTrip($trip),
            'sieges' => $seats,
            'passagers_max' => $passagers,
        ]);
    }

    public function checkout(Request $request)
    {
        $tripId = $request->input('trajet');
        $sieges = $request->input('sieges', []);

        $trip = Trip::with('vehicle')->find($tripId);

        $fidelite = null;
        if ($user = Auth::user()) {
            $fidelite = LoyaltyService::getTier($user);
        }

        return response()->json([
            'trajet' => $trip ? $this->formatTrip($trip) : null,
            'sieges' => $sieges,
            'fidelite' => $fidelite,
        ]);
    }

    public function validatePromo(Request $request)
    {
        $request->validate(['code' => 'required|string|max:50', 'amount' => 'required|numeric|min:0']);

        $promo = Promotion::where('code', strtoupper($request->code))->first();

        if (!$promo || !$promo->isValid()) {
            return response()->json(['valid' => false, 'message' => 'Code promo invalide ou expiré.']);
        }

        if ($request->amount < $promo->min_amount) {
            return response()->json(['valid' => false, 'message' => 'Montant minimum non atteint (' . number_format($promo->min_amount, 0, ',', ' ') . ' FCFA).']);
        }

        $result = $promo->apply($request->amount);

        return response()->json([
            'valid' => true,
            'label' => $result['label'],
            'discount' => $result['discount'],
            'final' => $result['final'],
        ]);
    }

    public function upcoming()
    {
        $trips = Trip::with('vehicle')
            ->upcoming()
            ->take(10)
            ->get()
            ->map(fn ($t) => $this->formatTrip($t));

        return response()->json($trips);
    }

    public function activeTrips()
    {
        $trips = Trip::with('vehicle', 'driver')
            ->where('status', 'in_progress')
            ->get()
            ->map(fn ($t) => $this->formatTrip($t));

        return response()->json($trips);
    }

    private function formatTrip($trip): array
    {
        $vehicleType = $trip->vehicle?->type ?? 'standard';
        return [
            'id' => $trip->id,
            'trip_number' => $trip->trip_number,
            'departure_city' => $trip->departure_city,
            'arrival_city' => $trip->arrival_city,
            'departure_time' => $trip->departure_time?->format('H:i'),
            'arrival_time' => $trip->arrival_time?->format('H:i'),
            'price' => (int) $trip->price,
            'available_seats' => $trip->available_seats,
            'status' => $trip->status,
            'departure_date' => $trip->departure_date?->format('Y-m-d'),
            'vehicle' => $trip->vehicle ? [
                'id' => $trip->vehicle->id,
                'registration_number' => $trip->vehicle->registration_number,
                'brand' => $trip->vehicle->brand,
                'model' => $trip->vehicle->model,
                'capacity' => $trip->vehicle->capacity,
                'type' => $vehicleType,
                'status' => $trip->vehicle->status,
            ] : null,
            'vehicle_id' => $trip->vehicle_id,
            'driver_id' => $trip->driver_id,
            'duration' => $trip->duration,
            'type' => $vehicleType,
        ];
    }
}
