<?php

namespace App\Http\Controllers;

use App\Models\IncidentReport;
use App\Models\PoliceAlert;
use App\Models\Trip;
use App\Models\Booking;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;

class SecurityController extends Controller
{
    public function dashboard()
    {
        $alertes = PoliceAlert::with('trip', 'handler')->latest()->take(50)->get()->map(fn ($a) => [
            'id' => $a->id,
            'alert_type' => $a->alert_type,
            'severity' => $a->severity,
            'person_name' => $a->person_name,
            'description' => $a->description,
            'status' => $a->status,
            'trip_info' => $a->trip ? "{$a->trip->departure_city} → {$a->trip->arrival_city}" : null,
            'created_at' => $a->created_at->format('Y-m-d H:i'),
        ]);

        $incidents = IncidentReport::with('vehicle', 'driver', 'reporter')
            ->latest()->take(20)->get()->map(fn ($i) => [
                'id' => $i->id,
                'type' => $i->type,
                'incident_date' => $i->incident_date->format('Y-m-d'),
                'location' => $i->location,
                'description' => $i->description,
                'status' => $i->status,
                'vehicle' => $i->vehicle?->registration_number,
                'driver' => $i->driver?->name,
                'reported_by' => $i->reporter?->name,
            ]);

        $manifestes = Trip::forCurrentCompany()->with('vehicle', 'driver')
            ->whereDate('departure_date', '>=', Carbon::today())
            ->orderBy('departure_date')
            ->orderBy('departure_time')
            ->take(10)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'trip_number' => $t->trip_number,
                'route' => "{$t->departure_city} → {$t->arrival_city}",
                'departure' => $t->departure_date?->format('Y-m-d') . ' ' . $t->departure_time?->format('H:i'),
                'vehicle' => $t->vehicle?->registration_number,
                'driver' => $t->driver?->name,
                'passengers' => $t->bookings()->where('status', 'confirmed')->count(),
            ]);

        $stats = [
            'alertes_ouvertes' => PoliceAlert::where('status', 'open')->count(),
            'incidents_mois' => IncidentReport::where('incident_date', '>=', Carbon::now()->startOfMonth())->count(),
            'incidents_resolus' => IncidentReport::where('status', 'resolved')->count(),
            'departs_aujourdhui' => Trip::forCurrentCompany()->whereDate('departure_date', Carbon::today())->count(),
        ];

        return Inertia::render('Admin/Securite/Index', compact('alertes', 'incidents', 'manifestes', 'stats'));
    }

    public function alertesStore(Request $request)
    {
        $validated = $request->validate([
            'alert_type' => 'required|in:wanted_person,stolen_vehicle,security_threat,accident',
            'severity' => 'required|in:low,medium,high,critical',
            'person_name' => 'nullable|string',
            'person_phone' => 'nullable|string',
            'description' => 'required|string',
            'trip_id' => 'nullable|exists:trips,id',
        ]);

        PoliceAlert::create($validated + ['status' => 'open']);

        return redirect()->route('admin.securite')->with('success', 'Alerte de sécurité enregistrée.');
    }

    public function alertesResoudre(PoliceAlert $alert)
    {
        $alert->update(['status' => 'resolved', 'handled_by' => request()->user()->id, 'resolved_at' => now()]);
        return redirect()->route('admin.securite')->with('success', 'Alerte résolue.');
    }

    public function incidentsStore(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:accident,breakdown,assault,theft,harassment,other',
            'incident_date' => 'required|date',
            'location' => 'required|string',
            'description' => 'required|string',
            'actions_taken' => 'nullable|string',
            'injuries' => 'nullable|string',
            'damages' => 'nullable|string',
            'trip_id' => 'nullable|exists:trips,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'driver_id' => 'nullable|exists:users,id',
        ]);

        IncidentReport::create($validated + ['reported_by' => request()->user()->id, 'status' => 'reported']);

        return redirect()->route('admin.securite')->with('success', 'Incident signalé.');
    }

    public function incidentsResoudre(IncidentReport $incident)
    {
        $incident->update(['status' => 'resolved']);
        return redirect()->route('admin.securite')->with('success', 'Incident résolu.');
    }

    public function manifeste(Trip $trip)
    {
        $passagers = Booking::with('user')
            ->where('trip_id', $trip->id)
            ->where('status', 'confirmed')
            ->get()
            ->map(fn ($b) => [
                'nom' => $b->passenger_name ?? $b->user?->name,
                'telephone' => $b->passenger_phone ?? $b->user?->phone,
                'siege' => is_array($b->seat_numbers) ? implode(', ', $b->seat_numbers) : $b->seat_numbers,
                'reference' => $b->booking_number,
            ]);

        $trajet = [
            'trip_number' => $trip->trip_number,
            'route' => "{$trip->departure_city} → {$trip->arrival_city}",
            'date' => $trip->departure_date?->format('Y-m-d'),
            'heure' => $trip->departure_time?->format('H:i'),
            'bus' => $trip->vehicle?->registration_number,
            'chauffeur' => $trip->driver?->name,
        ];

        return Inertia::render('Admin/Securite/Manifeste', compact('passagers', 'trajet'));
    }
}