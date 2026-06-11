<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Services\QrCodeService;
use Illuminate\Http\Request;


class BoardingController extends Controller
{
    public function index()
    {
        return response()->json([]);
    }

    public function verifyQr(Request $request)
    {
        $validated = $request->validate([
            'qr_data' => 'required|string',
        ]);

        // Peut être une URL ou un code brut
        $qrData = $validated['qr_data'];

        // Extraire le booking_number de l'URL si c'est une URL
        $bookingNumber = null;
        if (str_starts_with($qrData, 'http')) {
            $parts = explode('booking=', $qrData);
            $bookingNumber = $parts[1] ?? null;
        } else {
            $bookingNumber = $qrData;
        }

        $booking = Booking::with('trip.vehicle')
            ->where('booking_number', $bookingNumber)
            ->orWhere('id', is_numeric($qrData) ? $qrData : null)
            ->first();

        if (!$booking) {
            return response()->json([
                'valid' => false,
                'message' => 'Billet non trouvé.',
            ], 404);
        }

        if ($booking->status === 'cancelled') {
            return response()->json([
                'valid' => false,
                'message' => 'Ce billet a été annulé.',
                'booking' => $this->format($booking),
            ]);
        }

        if ($booking->status === 'completed') {
            return response()->json([
                'valid' => false,
                'message' => 'Ce billet a déjà été utilisé.',
                'booking' => $this->format($booking),
            ]);
        }

        return response()->json([
            'valid' => true,
            'message' => 'Billet valide. Embarquement autorisé.',
            'booking' => $this->format($booking),
            'passenger' => [
                'name' => $booking->passenger_name,
                'phone' => $booking->passenger_phone,
                'seats' => $booking->seat_numbers,
            ],
        ]);
    }

    public function confirmBoarding(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
        ]);

        $booking = Booking::findOrFail($validated['booking_id']);

        if ($booking->status !== 'confirmed') {
            return back()->withErrors(['message' => 'Ce billet ne peut pas être embarqué.']);
        }

        $booking->update(['status' => 'completed']);

        return back()->with('success', "Embarquement confirmé pour {$booking->passenger_name}.");
    }

    private function format($booking): array
    {
        return [
            'id' => $booking->id,
            'booking_number' => $booking->booking_number,
            'passenger_name' => $booking->passenger_name,
            'passenger_phone' => $booking->passenger_phone,
            'seat_numbers' => $booking->seat_numbers ?? [],
            'status' => $booking->status,
            'trip' => $booking->trip ? [
                'departure_city' => $booking->trip->departure_city,
                'arrival_city' => $booking->trip->arrival_city,
                'departure_time' => $booking->trip->departure_time?->format('H:i'),
                'vehicle' => $booking->trip->vehicle?->registration_number,
            ] : null,
        ];
    }
}
