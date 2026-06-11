<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\FraudCheck;
use App\Models\Trip;
use Carbon\Carbon;
use Illuminate\Http\Request;


class FraudController extends Controller
{
    public function index()
    {
        $anomalies = $this->detectAnomalies();

        $stats = [
            'open' => FraudCheck::where('status', 'open')->count(),
            'investigating' => FraudCheck::where('status', 'investigating')->count(),
            'resolved' => FraudCheck::where('status', 'resolved')->count(),
            'critical' => FraudCheck::where('severity', 'critical')->where('status', '!=', 'resolved')->count(),
        ];

        $checks = FraudCheck::latest()
            ->paginate(30)
            ->through(fn ($f) => [
                'id' => $f->id,
                'type' => $f->type,
                'severity' => $f->severity,
                'status' => $f->status,
                'description' => $f->description,
                'created_at' => $f->created_at->format('Y-m-d H:i'),
            ]);

        $__data = compact('stats', 'checks', 'anomalies');
        if (request()->expectsJson()) return response()->json($__data);
        return response()->json($__data);
    }

    public function detectAnomalies(): array
    {
        $anomalies = [];
        $today = Carbon::today();

        // 1. Trips du jour: tickets confirmés vs places totales
        $trips = Trip::forCurrentCompany()->with('vehicle', 'bookings')
            ->whereDate('departure_date', $today)
            ->get();

        foreach ($trips as $trip) {
            $capacity = $trip->vehicle?->capacity ?? 50;
            $confirmed = $trip->bookings()->where('status', 'confirmed')->count();
            $boarded = $trip->bookings()->where('status', 'boarded')->count();

            if ($confirmed > $capacity) {
                $anomalies[] = [
                    'type' => 'surbooking',
                    'trip' => "{$trip->departure_city} → {$trip->arrival_city}",
                    'time' => $trip->departure_time?->format('H:i'),
                    'capacity' => $capacity,
                    'confirmed' => $confirmed,
                    'boarded' => $boarded,
                    'gap' => $confirmed - $boarded,
                ];
            }

            if ($boarded > $capacity) {
                $anomalies[] = [
                    'type' => 'sur_embarquement',
                    'trip' => "{$trip->departure_city} → {$trip->arrival_city}",
                    'time' => $trip->departure_time?->format('H:i'),
                    'capacity' => $capacity,
                    'confirmed' => $confirmed,
                    'boarded' => $boarded,
                    'gap' => $boarded - $capacity,
                ];
            }

            // Nb de sièges embarqués vs confirmés
            if ($boarded > $confirmed && $confirmed > 0) {
                $fraud = FraudCheck::firstOrCreate(
                    ['trip_id' => $trip->id, 'type' => 'boarding_exceeds_confirmed'],
                    [
                        'severity' => 'high',
                        'status' => 'open',
                        'description' => "{$boarded} embarqués pour {$confirmed} confirmés sur le trajet {$trip->departure_city}→{$trip->arrival_city}",
                        'evidence' => json_encode(['confirmed' => $confirmed, 'boarded' => $boarded, 'capacity' => $capacity]),
                        'flagged_by' => request()->user()?->id,
                    ]
                );

                $anomalies[] = [
                    'id' => $fraud->id,
                    'type' => 'embarquement_exces',
                    'trip' => "{$trip->departure_city} → {$trip->arrival_city}",
                    'time' => $trip->departure_time?->format('H:i'),
                    'capacity' => $capacity,
                    'confirmed' => $confirmed,
                    'boarded' => $boarded,
                    'gap' => $boarded - $confirmed,
                ];
            }
        }

        // 2. Réservations doublons (même passager, même trajet)
        $duplicates = Booking::forCurrentCompany()->where('status', 'confirmed')
            ->whereDate('created_at', '>=', $today->subDays(3))
            ->selectRaw('passenger_phone, trip_id, COUNT(*) as cnt')
            ->groupBy('passenger_phone', 'trip_id')
            ->having('cnt', '>', 1)
            ->get();

        foreach ($duplicates as $dup) {
            $trip = Trip::find($dup->trip_id);
            FraudCheck::firstOrCreate(
                ['booking_id' => null, 'type' => 'duplicate_phone_trip'],
                [
                    'severity' => 'medium',
                    'status' => 'open',
                    'trip_id' => $dup->trip_id,
                    'description' => "Téléphone {$dup->passenger_phone} a {$dup->cnt} réservations sur le même trajet",
                    'flagged_by' => request()->user()?->id,
                ]
            );
        }

        return $anomalies;
    }

    public function resolve(FraudCheck $fraudCheck)
    {
        $fraudCheck->update([
            'status' => 'resolved',
            'resolved_by' => request()->user()->id,
            'resolved_at' => now(),
        ]);

        return back()->with('success', 'Alerte fraude résolue.');
    }

    public function dismiss(FraudCheck $fraudCheck)
    {
        $fraudCheck->update([
            'status' => 'false_positive',
            'resolved_by' => request()->user()->id,
            'resolved_at' => now(),
        ]);

        return back()->with('success', 'Alerte marquée comme faux positif.');
    }
}
