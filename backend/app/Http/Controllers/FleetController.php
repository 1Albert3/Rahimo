<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use App\Models\SpeedAlert;
use App\Models\SpeedAlertLog;
use App\Models\Trip;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleLocation;
use App\Models\MaintenanceRecord;
use Carbon\Carbon;
use Illuminate\Http\Request;


class FleetController extends Controller
{
    public function index()
    {
        $vehicles = Vehicle::forCurrentCompany()->withCount('trips', 'maintenanceRecords')
            ->with(['maintenanceRecords' => function ($q) {
                $q->latest()->limit(1);
            }])
            ->get()
            ->map(function ($v) {
                return [
                    'id' => $v->id,
                    'registration_number' => $v->registration_number,
                    'brand' => $v->brand,
                    'model' => $v->model,
                    'capacity' => $v->capacity,
                    'status' => $v->status,
                    'year' => $v->year,
                    'fuel_type' => $v->fuel_type,
                    'mileage' => $v->mileage,
                    'last_maintenance_date' => $v->last_maintenance_date?->format('Y-m-d'),
                    'next_maintenance_date' => $v->next_maintenance_date?->format('Y-m-d'),
                    'last_latitude' => $v->last_latitude,
                    'last_longitude' => $v->last_longitude,
                    'last_gps_update' => $v->last_gps_update?->diffForHumans(),
                ];
            });

        $stats = [
            'total' => Vehicle::forCurrentCompany()->count(),
            'actifs' => Vehicle::forCurrentCompany()->where('status', 'active')->count(),
            'maintenance' => Vehicle::forCurrentCompany()->where('status', 'maintenance')->count(),
            'hors_service' => Vehicle::forCurrentCompany()->where('status', 'out_of_service')->count(),
            'en_retard_maintenance' => Vehicle::forCurrentCompany()->where('next_maintenance_date', '<=', now())
                ->where('next_maintenance_date', '!=', null)->count(),
        ];

        $__data = ['vehicules' => $vehicles, 'stats' => $stats];
        if (request()->expectsJson()) return response()->json($__data);
        return response()->json($__data);
    }

    public function gpsData()
    {
        $locations = VehicleLocation::with('vehicle')
            ->whereHas('vehicle', fn ($q) => $q->where('status', 'active'))
            ->latest('recorded_at')
            ->get()
            ->groupBy('vehicle_id')
            ->map(fn ($locs) => $locs->first());

        $vehicles = Vehicle::forCurrentCompany()->where('status', 'active')->get()->map(function ($v) use ($locations) {
            $loc = $locations->get($v->id);
            return [
                'id' => $v->id,
                'registration_number' => $v->registration_number,
                'brand' => $v->brand,
                'model' => $v->model,
                'latitude' => $loc?->latitude ?? $v->last_latitude ?? 12.3714,
                'longitude' => $loc?->longitude ?? $v->last_longitude ?? -1.5197,
                'speed' => $loc?->speed ?? 0,
                'heading' => $loc?->heading ?? 0,
                'status' => $v->status,
                'last_update' => $loc?->recorded_at?->diffForHumans() ?? $v->last_gps_update?->diffForHumans() ?? 'N/A',
            ];
        });

        return response()->json(['vehicules' => $vehicles]);
    }

    public function simulateGps(Request $request)
    {
        $vehicles = Vehicle::forCurrentCompany()->where('status', 'active')->get();
        $now = now();

        foreach ($vehicles as $v) {
            // Simulation de positions GPS autour de Ouagadougou
            $lat = 12.3714 + (mt_rand(-100, 100) / 10000);
            $lng = -1.5197 + (mt_rand(-100, 100) / 10000);
            $speed = mt_rand(0, 110);

            VehicleLocation::create([
                'vehicle_id' => $v->id,
                'latitude' => $lat,
                'longitude' => $lng,
                'speed' => $speed,
                'heading' => mt_rand(0, 360),
                'recorded_at' => $now,
            ]);

            $v->update([
                'last_latitude' => $lat,
                'last_longitude' => $lng,
                'last_gps_update' => $now,
            ]);

            // Générer alerte si vitesse excessive
            if ($speed > 95) {
                Alert::create([
                    'type' => 'danger',
                    'categorie' => 'Vitesse',
                    'titre' => 'Excès de Vitesse Critique',
                    'description' => "Bus {$v->registration_number} détecté à {$speed} km/h. Limite autorisée : 90 km/h.",
                    'severity' => Alert::SEVERITY_CRITICAL,
                    'vehicle_id' => $v->id,
                    'lieu' => 'Axe Ouaga–Bobo',
                    'source' => 'gps',
                    'traitee' => false,
                ]);
            }
        }

        // Créer les SpeedAlert
        foreach ($vehicles as $v) {
            $loc = $v->locations()->latest('recorded_at')->first();
            if (!$loc) continue;

            if ($loc->speed > 90) {
                $trip = Trip::forCurrentCompany()->where('vehicle_id', $v->id)
                    ->whereDate('departure_date', today())
                    ->where('status', 'in_progress')
                    ->first();

                $existing = SpeedAlert::where('vehicle_id', $v->id)
                    ->where('status', 'active')
                    ->first();

                $level = $loc->speed > 105 ? 'danger' : 'warning';
                $notifMsg = $level === 'danger'
                    ? "DANGER : {$v->registration_number} roule à {$loc->speed} km/h (limite 90). Alerte critique."
                    : "ATTENTION : {$v->registration_number} roule à {$loc->speed} km/h. Ralentissez.";

                if ($existing) {
                    if ($loc->speed > 105 && $existing->level === 'warning') {
                        $existing->update([
                            'level' => 'danger',
                            'speed' => $loc->speed,
                            'notification_sent' => ($existing->notification_sent ?? '') . "\n[+2min] $notifMsg",
                        ]);
                    }
                    $existing->logs()->create([
                        'speed' => $loc->speed,
                        'latitude' => $loc->latitude,
                        'longitude' => $loc->longitude,
                        'recorded_at' => now(),
                    ]);
                } else {
                    $alert = SpeedAlert::create([
                        'vehicle_id' => $v->id,
                        'trip_id' => $trip?->id,
                        'driver_id' => $trip?->driver_id,
                        'speed' => $loc->speed,
                        'speed_limit' => 90,
                        'latitude' => $loc->latitude,
                        'longitude' => $loc->longitude,
                        'level' => $level,
                        'notification_sent' => $notifMsg,
                        'status' => 'active',
                    ]);
                    $alert->logs()->create([
                        'speed' => $loc->speed,
                        'latitude' => $loc->latitude,
                        'longitude' => $loc->longitude,
                        'recorded_at' => now(),
                    ]);
                }
            }
        }

        return response()->json(['simulated' => $vehicles->count()]);
    }

    public function speedAlertsIndex()
    {
        $alerts = SpeedAlert::with('vehicle', 'driver', 'trip')
            ->latest()
            ->paginate(50)
            ->through(fn ($a) => [
                'id' => $a->id,
                'vehicle' => $a->vehicle?->registration_number,
                'driver' => $a->driver?->name,
                'speed' => $a->speed,
                'speed_limit' => $a->speed_limit,
                'level' => $a->level,
                'status' => $a->status,
                'notification' => $a->notification_sent,
                'location' => $a->latitude && $a->longitude
                    ? round($a->latitude, 4) . ', ' . round($a->longitude, 4)
                    : null,
                'created_at' => $a->created_at->format('Y-m-d H:i:s'),
                'log_count' => $a->logs()->count(),
            ]);

        $stats = [
            'active' => SpeedAlert::where('status', 'active')->count(),
            'danger' => SpeedAlert::where('level', 'danger')->where('status', 'active')->count(),
            'today' => SpeedAlert::whereDate('created_at', today())->count(),
        ];

        $__data = compact('alerts', 'stats');
        if (request()->expectsJson()) return response()->json($__data);
        return response()->json($__data);
    }

    public function speedAlertsAcknowledge(SpeedAlert $speedAlert)
    {
        $speedAlert->update(['status' => 'acknowledged']);
        if (request()->expectsJson()) return response()->json(['message' => 'Alerte acquittée.']);
        return back()->with('success', 'Alerte acquittée.');
    }

    public function speedAlertsResolve(SpeedAlert $speedAlert)
    {
        $speedAlert->update(['status' => 'resolved', 'resolved_at' => now()]);
        if (request()->expectsJson()) return response()->json(['message' => 'Alerte résolue.']);
        return back()->with('success', 'Alerte résolue.');
    }

    public function speedAlertsStats()
    {
        $weekly = SpeedAlert::where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count, AVG(speed) as avg_speed')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $byVehicle = SpeedAlert::with('vehicle')
            ->selectRaw('vehicle_id, COUNT(*) as count, AVG(speed) as avg_speed')
            ->groupBy('vehicle_id')
            ->orderByDesc('count')
            ->take(10)
            ->get()
            ->map(fn ($a) => [
                'vehicle' => $a->vehicle?->registration_number,
                'count' => $a->count,
                'avg_speed' => round($a->avg_speed, 1),
            ]);

        return response()->json(compact('weekly', 'byVehicle'));
    }

    public function maintenanceHistory(Vehicle $vehicle)
    {
        $records = $vehicle->maintenanceRecords()
            ->orderBy('maintenance_date', 'desc')
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'type' => $r->maintenance_type,
                    'description' => $r->description,
                    'cost' => (int) $r->cost,
                    'date' => $r->maintenance_date?->format('Y-m-d'),
                    'next_date' => $r->next_maintenance_date?->format('Y-m-d'),
                    'performed_by' => $r->performed_by,
                    'status' => $r->status,
                    'mileage' => $r->mileage_at_maintenance,
                ];
            });

        return response()->json($records);
    }

    public function storeMaintenance(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'maintenance_type' => 'required|in:routine,repair,inspection,emergency',
            'description' => 'required|string',
            'cost' => 'required|numeric|min:0',
            'maintenance_date' => 'required|date',
            'next_maintenance_date' => 'nullable|date|after:maintenance_date',
            'performed_by' => 'nullable|string|max:255',
            'mileage_at_maintenance' => 'nullable|integer|min:0',
        ]);

        $vehicle->maintenanceRecords()->create($validated + ['status' => 'completed']);

        if (!empty($validated['next_maintenance_date'])) {
            $vehicle->update(['next_maintenance_date' => $validated['next_maintenance_date']]);
        }

        if (request()->expectsJson()) return response()->json(['message' => 'Entretien enregistré.']);
        return back()->with('success', 'Entretien enregistré.');
    }

    // ─── CRUD Trajets ─────────────────────────────────────────────────────────

    public function tripsIndex()
    {
        $trips = Trip::forCurrentCompany()->with('vehicle', 'driver')
            ->orderBy('departure_date', 'desc')
            ->orderBy('departure_time')
            ->paginate(30)
            ->through(fn ($t) => [
                'id' => $t->id,
                'trip_number' => $t->trip_number,
                'departure_city' => $t->departure_city,
                'arrival_city' => $t->arrival_city,
                'departure_date' => $t->departure_date?->format('Y-m-d'),
                'departure_time' => $t->departure_time?->format('H:i'),
                'arrival_time' => $t->arrival_time?->format('H:i'),
                'price' => (float) $t->price,
                'available_seats' => $t->available_seats,
                'vehicle' => $t->vehicle?->registration_number,
                'driver' => $t->driver?->name,
                'status' => $t->status,
                'booked_seats' => $t->bookings()->where('status', 'confirmed')->sum('seats_count'),
            ]);

        $vehicles = Vehicle::forCurrentCompany()->whereIn('status', ['active', 'maintenance'])->get()->map(fn ($v) => [
            'id' => $v->id,
            'label' => "{$v->registration_number} — {$v->brand} {$v->model} ({$v->capacity} pl.)",
        ]);

        $drivers = User::forCurrentCompany()->chauffeurs()->where('is_active', true)->get()->map(fn ($d) => [
            'id' => $d->id,
            'name' => $d->name,
        ]);

        $__data = compact('trips', 'vehicles', 'drivers');
        if (request()->expectsJson()) return response()->json($__data);
        return response()->json($__data);
    }

    public function tripsStore(Request $request)
    {
        $validated = $request->validate([
            'departure_city' => 'required|string|max:255',
            'arrival_city' => 'required|string|max:255',
            'departure_date' => 'required|date',
            'departure_time' => 'required|date_format:H:i',
            'arrival_time' => 'required|date_format:H:i|after:departure_time',
            'price' => 'required|numeric|min:0',
            'available_seats' => 'required|integer|min:1',
            'vehicle_id' => 'required|exists:vehicles,id',
            'driver_id' => 'nullable|exists:users,id',
            'status' => 'required|in:scheduled,in_progress,completed,cancelled',
        ]);

        $validated['trip_number'] = 'TRIP-' . strtoupper(substr(md5(uniqid()), 0, 8));

        Trip::create($validated + ['company_id' => auth()->user()->company_id]);

        if (request()->expectsJson()) return response()->json(['message' => 'Trajet créé.'], 201);
        return redirect()->route('admin.trajets')->with('success', 'Trajet créé.');
    }

    public function tripsUpdate(Request $request, Trip $trip)
    {
        $validated = $request->validate([
            'departure_city' => 'required|string|max:255',
            'arrival_city' => 'required|string|max:255',
            'departure_date' => 'required|date',
            'departure_time' => 'required|date_format:H:i',
            'arrival_time' => 'required|date_format:H:i|after:departure_time',
            'price' => 'required|numeric|min:0',
            'available_seats' => 'required|integer|min:1',
            'vehicle_id' => 'required|exists:vehicles,id',
            'driver_id' => 'nullable|exists:users,id',
            'status' => 'required|in:scheduled,in_progress,completed,cancelled',
        ]);

        $trip->update($validated);

        if (request()->expectsJson()) return response()->json(['message' => 'Trajet mis à jour.']);
        return redirect()->route('admin.trajets')->with('success', 'Trajet mis à jour.');
    }

    public function tripsDestroy(Trip $trip)
    {
        $trip->bookings()->where('status', 'confirmed')->update(['status' => 'cancelled']);
        $trip->delete();

        if (request()->expectsJson()) return response()->json(['message' => 'Trajet supprimé.']);
        return redirect()->route('admin.trajets')->with('success', 'Trajet supprimé.');
    }

    // ─── CRUD Véhicules ──────────────────────────────────────────────────────

    public function store(Request $request)
    {
        $validated = $request->validate([
            'registration_number' => 'required|string|max:50|unique:vehicles',
            'brand' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'capacity' => 'required|integer|min:1',
            'type' => 'nullable|string|max:50',
            'year' => 'nullable|integer|min:1900|max:' . (now()->year + 1),
            'fuel_type' => 'nullable|string|max:50',
            'mileage' => 'nullable|integer|min:0',
            'status' => 'required|in:active,maintenance,out_of_service',
        ]);

        Vehicle::create($validated + ['company_id' => auth()->user()->company_id]);

        if (request()->expectsJson()) return response()->json(['message' => 'Véhicule ajouté.'], 201);
        return redirect()->route('admin.flotte')->with('success', 'Véhicule ajouté.');
    }

    public function update(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'registration_number' => 'required|string|max:50|unique:vehicles,registration_number,' . $vehicle->id,
            'brand' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'capacity' => 'required|integer|min:1',
            'type' => 'nullable|string|max:50',
            'year' => 'nullable|integer|min:1900|max:' . (now()->year + 1),
            'fuel_type' => 'nullable|string|max:50',
            'mileage' => 'nullable|integer|min:0',
            'status' => 'required|in:active,maintenance,out_of_service',
        ]);

        $vehicle->update($validated);

        if (request()->expectsJson()) return response()->json(['message' => 'Véhicule mis à jour.']);
        return redirect()->route('admin.flotte')->with('success', 'Véhicule mis à jour.');
    }

    public function destroy(Vehicle $vehicle)
    {
        $vehicle->delete();

        if (request()->expectsJson()) return response()->json(['message' => 'Véhicule supprimé.']);
        return redirect()->route('admin.flotte')->with('success', 'Véhicule supprimé.');
    }

    // ─── 3.3 Maintenance Préventive ──────────────────────────────────────────

    public function maintenanceIndex()
    {
        $vehicles = Vehicle::forCurrentCompany()->withCount('maintenanceRecords')->get()->map(fn ($v) => [
            'id' => $v->id,
            'registration_number' => $v->registration_number,
            'brand' => $v->brand,
            'model' => $v->model,
            'mileage' => $v->mileage,
            'status' => $v->status,
            'last_maintenance_date' => $v->last_maintenance_date?->format('Y-m-d'),
            'next_maintenance_date' => $v->next_maintenance_date?->format('Y-m-d'),
            'maintenance_count' => $v->maintenance_records_count,
        ]);

        $upcoming = MaintenanceRecord::with('vehicle')
            ->whereIn('status', [MaintenanceRecord::STATUS_SCHEDULED])
            ->where('maintenance_date', '>=', now())
            ->orderBy('maintenance_date')
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'vehicle' => $r->vehicle?->registration_number,
                'type' => $r->maintenance_type,
                'description' => $r->description,
                'cost' => (float) $r->cost,
                'date' => $r->maintenance_date?->format('Y-m-d'),
                'mileage' => $r->mileage_at_maintenance,
            ]);

        $overdue = MaintenanceRecord::with('vehicle')
            ->whereIn('status', [MaintenanceRecord::STATUS_SCHEDULED])
            ->where('maintenance_date', '<', now())
            ->orderBy('maintenance_date')
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'vehicle' => $r->vehicle?->registration_number,
                'type' => $r->maintenance_type,
                'description' => $r->description,
                'cost' => (float) $r->cost,
                'date' => $r->maintenance_date?->format('Y-m-d'),
                'mileage' => $r->mileage_at_maintenance,
            ]);

        $history = MaintenanceRecord::with('vehicle')
            ->where('status', MaintenanceRecord::STATUS_COMPLETED)
            ->latest('maintenance_date')
            ->take(20)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'vehicle' => $r->vehicle?->registration_number,
                'type' => $r->maintenance_type,
                'description' => $r->description,
                'cost' => (float) $r->cost,
                'date' => $r->maintenance_date?->format('Y-m-d'),
                'performed_by' => $r->performed_by,
                'mileage' => $r->mileage_at_maintenance,
            ]);

        $stats = [
            'total' => MaintenanceRecord::count(),
            'upcoming' => $upcoming->count(),
            'overdue' => $overdue->count(),
            'completed' => $history->count(),
            'total_cost' => (float) MaintenanceRecord::where('status', 'completed')->sum('cost'),
            'month_cost' => (float) MaintenanceRecord::where('status', 'completed')
                ->where('maintenance_date', '>=', now()->startOfMonth())
                ->sum('cost'),
        ];

        $__data = compact('vehicles', 'upcoming', 'overdue', 'history', 'stats');
        if (request()->expectsJson()) return response()->json($__data);
        return response()->json($__data);
    }

    public function maintenanceSchedule(Request $request)
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'maintenance_type' => 'required|in:routine,repair,inspection,emergency',
            'description' => 'required|string',
            'cost' => 'required|numeric|min:0',
            'maintenance_date' => 'required|date',
            'next_maintenance_date' => 'nullable|date|after:maintenance_date',
            'performed_by' => 'nullable|string|max:255',
            'mileage_at_maintenance' => 'nullable|integer|min:0',
        ]);

        $validated['status'] = MaintenanceRecord::STATUS_SCHEDULED;

        MaintenanceRecord::create($validated);

        if (request()->expectsJson()) return response()->json(['message' => 'Entretien programmé.'], 201);
        return redirect()->route('admin.maintenance')->with('success', 'Entretien programmé.');
    }

    public function maintenanceComplete(Request $request, MaintenanceRecord $maintenanceRecord)
    {
        $validated = $request->validate([
            'cost' => 'required|numeric|min:0',
            'performed_by' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $maintenanceRecord->update([
            'status' => MaintenanceRecord::STATUS_COMPLETED,
            'cost' => $validated['cost'],
            'performed_by' => $validated['performed_by'],
            'description' => $maintenanceRecord->description . ($validated['notes'] ? "\n" . $validated['notes'] : ''),
        ]);

        $vehicle = $maintenanceRecord->vehicle;
        $vehicle->update([
            'last_maintenance_date' => $maintenanceRecord->maintenance_date,
            'status' => Vehicle::STATUS_ACTIVE,
        ]);

        if (request()->expectsJson()) return response()->json(['message' => 'Entretien marqué comme terminé.']);
        return redirect()->route('admin.maintenance')->with('success', 'Entretien marqué comme terminé.');
    }

    // ─── 3.4 Planning Conducteurs ────────────────────────────────────────────

    public function planningIndex()
    {
        $today = Carbon::today();

        $trips = Trip::forCurrentCompany()->with('vehicle', 'driver')
            ->whereDate('departure_date', '>=', $today->copy()->subDays(7))
            ->whereDate('departure_date', '<=', $today->copy()->addDays(14))
            ->orderBy('departure_date')
            ->orderBy('departure_time')
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'trip_number' => $t->trip_number,
                'departure_city' => $t->departure_city,
                'arrival_city' => $t->arrival_city,
                'departure_date' => $t->departure_date?->format('Y-m-d'),
                'departure_time' => $t->departure_time?->format('H:i'),
                'arrival_time' => $t->arrival_time?->format('H:i'),
                'vehicle' => $t->vehicle?->registration_number,
                'driver_name' => $t->driver?->name,
                'driver_id' => $t->driver_id,
                'status' => $t->status,
                'booked_seats' => $t->bookings()->where('status', 'confirmed')->sum('seats_count'),
                'capacity' => $t->vehicle?->capacity ?? 0,
            ]);

        $drivers = User::forCurrentCompany()->chauffeurs()->where('is_active', true)->get()->map(fn ($d) => [
            'id' => $d->id,
            'name' => $d->name,
            'phone' => $d->phone,
        ]);

        $vehicles = Vehicle::forCurrentCompany()->where('status', 'active')->get()->map(fn ($v) => [
            'id' => $v->id,
            'label' => "{$v->registration_number} — {$v->brand} {$v->model}",
        ]);

        $__data = compact('trips', 'drivers', 'vehicles');
        if (request()->expectsJson()) return response()->json($__data);
        return response()->json($__data);
    }

    public function planningAssign(Request $request)
    {
        $validated = $request->validate([
            'trip_id' => 'required|exists:trips,id',
            'driver_id' => 'required|exists:users,id',
        ]);

        $trip = Trip::findOrFail($validated['trip_id']);
        $trip->update(['driver_id' => $validated['driver_id']]);

        if (request()->expectsJson()) return response()->json(['message' => 'Conducteur assigné au trajet.']);
        return redirect()->route('admin.planning')->with('success', 'Conducteur assigné au trajet.');
    }

    // ─── 3.5 Carte GPS ───────────────────────────────────────────────────────

    public function gpsMap()
    {
        $vehicles = Vehicle::forCurrentCompany()->where('status', 'active')->get()->map(fn ($v) => [
            'id' => $v->id,
            'registration_number' => $v->registration_number,
            'brand' => $v->brand,
            'model' => $v->model,
            'latitude' => $v->last_latitude ?? 12.3714,
            'longitude' => $v->last_longitude ?? -1.5197,
            'speed' => 0,
            'status' => $v->status,
            'last_update' => $v->last_gps_update?->diffForHumans(),
        ]);

        $__data = ['vehicules' => $vehicles];
        if (request()->expectsJson()) return response()->json($__data);
        return response()->json($__data);
    }

    public function driverTrips()
    {
        $driver = request()->user();
        $today = Carbon::today();

        $trips = Trip::with('vehicle', 'bookings')
            ->where('driver_id', $driver->id)
            ->whereDate('departure_date', '>=', $today->copy()->subDay())
            ->orderBy('departure_date')
            ->orderBy('departure_time')
            ->get()
            ->map(function ($trip) {
                $confirmedBookings = $trip->bookings->where('status', 'confirmed');
                return [
                    'id' => $trip->id,
                    'trip_number' => $trip->trip_number,
                    'departure_city' => $trip->departure_city,
                    'arrival_city' => $trip->arrival_city,
                    'departure_time' => $trip->departure_time?->format('H:i'),
                    'arrival_time' => $trip->arrival_time?->format('H:i'),
                    'departure_date' => $trip->departure_date?->format('Y-m-d'),
                    'vehicle' => $trip->vehicle?->registration_number . ' - ' . $trip->vehicle?->brand . ' ' . $trip->vehicle?->model,
                    'booked_seats' => $confirmedBookings->sum('seats_count'),
                    'total_seats' => $trip->vehicle?->capacity ?? 0,
                    'fill_rate' => $trip->vehicle && $trip->vehicle->capacity > 0
                        ? round(($confirmedBookings->sum('seats_count') / $trip->vehicle->capacity) * 100)
                        : 0,
                    'status' => $trip->status,
                ];
            });

        $currentTrip = $trips->firstWhere('status', 'in_progress');

        $__data = ['trips' => $trips, 'currentTrip' => $currentTrip];
        if (request()->expectsJson()) return response()->json($__data);
        return response()->json($__data);
    }
}
