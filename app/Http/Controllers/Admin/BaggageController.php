<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Baggage;
use App\Models\Trip;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BaggageController extends Controller
{
    public function index(Request $request)
    {
        $query = Baggage::with('trip', 'booking');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('tag_number', 'LIKE', "%{$s}%")
                    ->orWhere('passenger_name', 'LIKE', "%{$s}%");
            });
        }

        $baggages = $query->latest()
            ->paginate(30)
            ->through(fn ($b) => [
                'id' => $b->id,
                'tag' => $b->tag_number,
                'passenger' => $b->passenger_name,
                'type' => $b->type,
                'weight' => $b->weight_kg,
                'status' => $b->status,
                'trip' => $b->trip ? "{$b->trip->departure_city} → {$b->trip->arrival_city}" : null,
                'scanned_at' => $b->scanned_at?->format('Y-m-d H:i'),
                'loaded_at' => $b->loaded_at?->format('Y-m-d H:i'),
                'delivered_at' => $b->delivered_at?->format('Y-m-d H:i'),
                'created_at' => $b->created_at->format('Y-m-d H:i'),
            ]);

        $stats = [
            'total' => Baggage::count(),
            'registered' => Baggage::where('status', 'registered')->count(),
            'loaded' => Baggage::where('status', 'loaded')->count(),
            'delivered' => Baggage::where('status', 'delivered')->count(),
        ];

        return Inertia::render('Admin/Bagages/Index', compact('baggages', 'stats'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'nullable|exists:bookings,id',
            'trip_id' => 'nullable|exists:trips,id',
            'passenger_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'type' => 'required|in:suitcase,bag,box,sport,other',
            'weight_kg' => 'nullable|numeric|min:0|max:100',
        ]);

        if (!empty($validated['booking_id'])) {
            $booking = Booking::find($validated['booking_id']);
            $validated['trip_id'] ??= $booking?->trip_id;
            $validated['user_id'] ??= $booking?->user_id;
        }

        $validated['tag_number'] = Baggage::generateTag();
        $validated['status'] = 'registered';

        Baggage::create($validated);

        return back()->with('success', 'Bagage enregistré. Tag: ' . $validated['tag_number']);
    }

    public function scan(Request $request)
    {
        $validated = $request->validate([
            'tag_number' => 'required|string|exists:baggage,tag_number',
            'action' => 'required|in:scan,load,unload,deliver',
        ]);

        $bag = Baggage::where('tag_number', $validated['tag_number'])->firstOrFail();

        $statusMap = [
            'scan' => ['status' => 'scanned', 'scanned_by' => $request->user()->name, 'scanned_at' => now()],
            'load' => ['status' => 'loaded', 'loaded_by' => $request->user()->name, 'loaded_at' => now()],
            'unload' => ['status' => 'unloaded', 'unloaded_by' => $request->user()->name, 'unloaded_at' => now()],
            'deliver' => ['status' => 'delivered', 'delivered_to' => $request->input('delivered_to'), 'delivered_at' => now()],
        ];

        $bag->update($statusMap[$validated['action']]);

        return response()->json([
            'success' => true,
            'baggage' => [
                'tag' => $bag->tag_number,
                'passenger' => $bag->passenger_name,
                'status' => $bag->status,
            ],
        ]);
    }

    public function show(Baggage $baggage)
    {
        $baggage->load('trip', 'booking');
        return response()->json([
            'id' => $baggage->id,
            'tag' => $baggage->tag_number,
            'passenger' => $baggage->passenger_name,
            'type' => $baggage->type,
            'weight' => $baggage->weight_kg,
            'status' => $baggage->status,
            'trip' => $baggage->trip ? "{$baggage->trip->departure_city} → {$baggage->trip->arrival_city}" : null,
            'notes' => $baggage->notes,
            'scanned_at' => $baggage->scanned_at?->format('Y-m-d H:i'),
            'loaded_at' => $baggage->loaded_at?->format('Y-m-d H:i'),
            'delivered_at' => $baggage->delivered_at?->format('Y-m-d H:i'),
        ]);
    }

    public function tripManifest(Trip $trip)
    {
        $baggages = Baggage::where('trip_id', $trip->id)
            ->orderBy('created_at')
            ->get()
            ->map(fn ($b) => [
                'tag' => $b->tag_number,
                'passenger' => $b->passenger_name,
                'type' => $b->type,
                'weight' => $b->weight_kg,
                'status' => $b->status,
            ]);

        $stats = [
            'total' => $baggages->count(),
            'loaded' => $baggages->where('status', 'loaded')->count(),
            'delivered' => $baggages->where('status', 'delivered')->count(),
            'total_weight' => $baggages->sum('weight'),
        ];

        return Inertia::render('Admin/Bagages/Manifest', [
            'trip' => [
                'id' => $trip->id,
                'route' => "{$trip->departure_city} → {$trip->arrival_city}",
                'date' => $trip->departure_date?->format('Y-m-d'),
            ],
            'baggages' => $baggages,
            'stats' => $stats,
        ]);
    }
}
