<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\BookingController as WebController;
use App\Http\Controllers\GuichetController;
use Illuminate\Http\Request;

class BookingController extends WebController
{
    private function j($r)
    {
        if (method_exists($r, 'getData')) return response()->json($r->getData());
        return $r;
    }

    public function store(Request $request)
    {
        // Le WebController fait redirect() → on adapte pour JSON
        $response = parent::store($request);
        if (request()->expectsJson() && method_exists($response, 'getTargetUrl')) {
            // Extraire le booking depuis la session ou re-chercher
            $booking = \App\Models\Booking::where('user_id', auth()->id())
                ->latest()->first();
            return response()->json($booking, 201);
        }
        return $response;
    }

    public function show(\App\Models\Booking $booking)
    {
        return $this->j(parent::show($booking));
    }

    public function cancel(Request $request, \App\Models\Booking $booking)
    {
        parent::cancel($request, $booking);
        return request()->expectsJson()
            ? response()->json(['message' => 'Billet annulé.'])
            : back();
    }

    public function adminCancel(Request $request, \App\Models\Booking $booking)
    {
        $booking->update(['status' => \App\Models\Booking::STATUS_CANCELLED]);
        return response()->json(['message' => 'Billet annulé par l\'admin.']);
    }

    public function reschedule(Request $request, \App\Models\Booking $booking)
    {
        parent::reschedule($request, $booking);
        return request()->expectsJson()
            ? response()->json(['message' => 'Voyage reporté.'])
            : back();
    }

    public function changeSeat(Request $request, \App\Models\Booking $booking)
    {
        parent::changeSeat($request, $booking);
        return request()->expectsJson()
            ? response()->json(['message' => 'Sièges modifiés.'])
            : back();
    }

    public function downloadPdf(\App\Models\Booking $booking)
    {
        return parent::downloadPdf($booking);
    }

    public function userBookings()
    {
        return $this->j(parent::userBookings());
    }

    public function guichetIndex()
    {
        $trips = \App\Models\Trip::forCurrentCompany()->with('vehicle')
            ->available()
            ->orderBy('departure_time')
            ->get()
            ->map(fn($trip) => [
                'id'               => $trip->id,
                'trip_number'      => $trip->trip_number,
                'departure_city'   => $trip->departure_city,
                'arrival_city'     => $trip->arrival_city,
                'departure_time'   => $trip->departure_time?->format('H:i'),
                'arrival_time'     => $trip->arrival_time?->format('H:i'),
                'price'            => (int) $trip->price,
                'available_seats'  => $trip->available_seats,
                'status'           => $trip->status,
                'departure_date'   => $trip->departure_date?->format('Y-m-d'),
                'vehicle'          => $trip->vehicle ? [
                    'id'                  => $trip->vehicle->id,
                    'registration_number' => $trip->vehicle->registration_number,
                    'capacity'            => $trip->vehicle->capacity,
                ] : null,
            ]);

        return response()->json(['trajets' => $trips]);
    }

    public function guichetStore(Request $request)
    {
        $guichet = app(GuichetController::class);
        $r = $guichet->store($request);
        return request()->expectsJson()
            ? response()->json(['message' => 'Billet vendu au guichet.'], 201)
            : $r;
    }
}
