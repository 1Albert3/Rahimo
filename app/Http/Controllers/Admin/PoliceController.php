<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\IncidentReport;
use App\Models\PoliceAlert;
use App\Models\PoliceCheckLog;
use App\Models\Trip;
use App\Models\WatchlistEntry;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PoliceController extends Controller
{
    public function index()
    {
        $stats = [
            'watchlist_active' => WatchlistEntry::where('status', 'active')->count(),
            'checks_today' => PoliceCheckLog::whereDate('created_at', today())->count(),
            'matches_found' => PoliceCheckLog::whereIn('match_status', ['possible_match', 'confirmed_match'])
                ->whereDate('created_at', today())->count(),
            'alertes_ouvertes' => PoliceAlert::where('status', 'open')->count(),
        ];

        $recentChecks = PoliceCheckLog::latest()->take(20)->get()->map(fn ($l) => [
            'id' => $l->id,
            'name' => $l->full_name,
            'phone' => $l->phone,
            'status' => $l->match_status,
            'type' => $l->check_type,
            'created_at' => $l->created_at->format('Y-m-d H:i'),
        ]);

        $watchlist = WatchlistEntry::where('status', 'active')->latest()->take(50)->get();

        $departs = Trip::forCurrentCompany()->with('vehicle', 'driver')
            ->whereDate('departure_date', '>=', today())
            ->orderBy('departure_date')
            ->orderBy('departure_time')
            ->take(20)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'route' => "{$t->departure_city} → {$t->arrival_city}",
                'date' => $t->departure_date?->format('Y-m-d'),
                'heure' => $t->departure_time?->format('H:i'),
                'vehicle' => $t->vehicle?->registration_number,
                'driver' => $t->driver?->name,
                'passengers' => $t->bookings()->where('status', 'confirmed')->count(),
            ]);

        return Inertia::render('Admin/Police/Index', compact('stats', 'recentChecks', 'watchlist', 'departs'));
    }

    public function verifyPassenger(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string',
            'phone' => 'nullable|string',
            'id_card_number' => 'nullable|string',
            'trip_id' => 'nullable|exists:trips,id',
            'booking_id' => 'nullable|exists:bookings,id',
        ]);

        $match = WatchlistEntry::where('status', 'active')
            ->where(function ($q) use ($validated) {
                $q->where('full_name', 'LIKE', "%{$validated['full_name']}%");
                if (!empty($validated['phone'])) {
                    $q->orWhere('phone', $validated['phone']);
                }
                if (!empty($validated['id_card_number'])) {
                    $q->orWhere('id_card_number', $validated['id_card_number']);
                }
            })
            ->first();

        $matchStatus = $match
            ? ($match->full_name === $validated['full_name'] ? 'confirmed_match' : 'possible_match')
            : 'no_match';

        $log = PoliceCheckLog::create([
            'user_id' => null,
            'booking_id' => $validated['booking_id'] ?? null,
            'trip_id' => $validated['trip_id'] ?? null,
            'full_name' => $validated['full_name'],
            'phone' => $validated['phone'] ?? null,
            'id_card_number' => $validated['id_card_number'] ?? null,
            'match_status' => $matchStatus,
            'check_type' => 'silent',
            'performed_by' => $request->user()->id,
        ]);

        return response()->json([
            'match' => $matchStatus !== 'no_match',
            'match_status' => $matchStatus,
            'log_id' => $log->id,
            'details' => $match ? [
                'reason' => $match->reason,
                'status' => $matchStatus === 'confirmed_match' ? 'ALERTE CONFIRMÉE' : 'CORRESPONDANCE POSSIBLE',
            ] : null,
        ]);
    }

    public function verifyTrip(Request $request, Trip $trip)
    {
        $bookings = Booking::with('user')
            ->where('trip_id', $trip->id)
            ->where('status', 'confirmed')
            ->get();

        $results = $bookings->map(function ($b) {
            $name = $b->passenger_name ?? $b->user?->name;
            $phone = $b->passenger_phone ?? $b->user?->phone;

            $match = WatchlistEntry::where('status', 'active')
                ->where(function ($q) use ($name, $phone) {
                    $q->where('full_name', 'LIKE', "%{$name}%");
                    if ($phone) $q->orWhere('phone', $phone);
                })
                ->first();

            PoliceCheckLog::create([
                'booking_id' => $b->id,
                'trip_id' => $trip->id,
                'full_name' => $name,
                'phone' => $phone,
                'match_status' => $match ? ($match->full_name === $name ? 'confirmed_match' : 'possible_match') : 'no_match',
                'check_type' => 'batch',
                'performed_by' => request()->user()->id,
            ]);

            return [
                'name' => $name,
                'phone' => $phone,
                'seat' => $b->seat_number,
                'match' => $match ? true : false,
                'reason' => $match?->reason,
            ];
        });

        $matches = $results->where('match', true)->values();

        return response()->json([
            'total' => $results->count(),
            'passengers' => $results,
            'matches' => $matches,
            'match_count' => $matches->count(),
        ]);
    }

    public function watchlistIndex()
    {
        $entries = WatchlistEntry::where('status', 'active')
            ->latest()
            ->paginate(50);

        return Inertia::render('Admin/Police/Watchlist', compact('entries'));
    }

    public function watchlistStore(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'id_card_number' => 'nullable|string|max:50',
            'reason' => 'required|string|max:255',
        ]);

        WatchlistEntry::create($validated + ['added_by' => $request->user()->id, 'status' => 'active']);

        return back()->with('success', 'Personne ajoutée à la liste de surveillance.');
    }

    public function watchlistClear(WatchlistEntry $watchlistEntry)
    {
        $watchlistEntry->update(['status' => 'cleared']);
        return back()->with('success', 'Entrée retirée de la liste.');
    }

    public function checkLogs()
    {
        $logs = PoliceCheckLog::with('trip')
            ->latest()
            ->paginate(50)
            ->through(fn ($l) => [
                'id' => $l->id,
                'name' => $l->full_name,
                'phone' => $l->phone,
                'match_status' => $l->match_status,
                'check_type' => $l->check_type,
                'trip' => $l->trip ? "{$l->trip->departure_city} → {$l->trip->arrival_city}" : null,
                'created_at' => $l->created_at->format('Y-m-d H:i'),
            ]);

        $stats = [
            'total' => PoliceCheckLog::count(),
            'today' => PoliceCheckLog::whereDate('created_at', today())->count(),
            'matches' => PoliceCheckLog::whereIn('match_status', ['possible_match', 'confirmed_match'])->count(),
        ];

        return Inertia::render('Admin/Police/CheckLogs', compact('logs', 'stats'));
    }
}
