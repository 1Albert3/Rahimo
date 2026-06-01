<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Trip;
use App\Services\LoyaltyService;
use App\Services\NotificationService;
use App\Services\Payment\PaymentService;
use App\Services\QrCodeService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class GuichetController extends Controller
{
    public function __construct(
        protected NotificationService $notifier,
        protected QrCodeService       $qrCode,
        protected PaymentService      $payment,
    ) {}

    public function index()
    {
        $trips = Trip::forCurrentCompany()->with('vehicle')
            ->available()
            ->orderBy('departure_time')
            ->get()
            ->map(function ($trip) {
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
                    'duration' => $trip->duration,
                    'type' => 'standard',
                    'vehicle' => $trip->vehicle ? [
                        'id' => $trip->vehicle->id,
                        'registration_number' => $trip->vehicle->registration_number,
                        'brand' => $trip->vehicle->brand,
                        'model' => $trip->vehicle->model,
                        'capacity' => $trip->vehicle->capacity,
                    ] : null,
                ];
            });

        return Inertia::render('Admin/Guichet', [
            'trajets' => $trips,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'trip_id' => 'required|exists:trips,id',
            'passenger_name' => 'required|string|max:255',
            'passenger_phone' => 'required|string|max:20',
            'seat_numbers' => 'required|array|min:1',
            'seat_numbers.*' => 'integer|min:1',
            'payment_method' => 'required|in:cash,mobile_money,card',
            'amount_received' => 'required_if:payment_method,cash|numeric|min:0',
        ]);

        $trip = Trip::findOrFail($validated['trip_id']);

        if (!$trip->hasAvailableSeats(count($validated['seat_numbers']))) {
            throw ValidationException::withMessages([
                'seat_numbers' => 'Pas assez de places disponibles.',
            ]);
        }

        $totalPrice = $trip->price * count($validated['seat_numbers']);

        if ($validated['payment_method'] === 'cash') {
            $change = $validated['amount_received'] - $totalPrice;
            if ($change < 0) {
                throw ValidationException::withMessages([
                    'amount_received' => 'Le montant reçu est insuffisant. Total : ' . number_format($totalPrice, 0, ',', ' ') . ' FCFA',
                ]);
            }
        }

        $paymentResult = $this->payment->charge($validated['payment_method'], [
            'amount'   => $totalPrice,
            'currency' => 'XOF',
            'order_id' => 'WALKIN-' . uniqid(),
            'description' => "Vente guichet — {$validated['passenger_name']}",
        ]);

        $booking = Booking::create([
            'trip_id' => $trip->id,
            'passenger_name' => $validated['passenger_name'],
            'passenger_phone' => $validated['passenger_phone'],
            'seat_numbers' => $validated['seat_numbers'],
            'seats_count' => count($validated['seat_numbers']),
            'total_price' => $totalPrice,
            'status' => Booking::STATUS_CONFIRMED,
            'payment_status' => $paymentResult->success ? Booking::PAYMENT_PAID : Booking::PAYMENT_PENDING,
            'payment_method' => $validated['payment_method'],
            'booking_date' => now(),
        ]);

        $trip->decrement('available_seats', count($validated['seat_numbers']));

        $this->qrCode->generateForBooking($booking);
        $this->notifier->sendTicketConfirmation($booking);

        $change = $validated['payment_method'] === 'cash'
            ? $validated['amount_received'] - $totalPrice
            : 0;

        return back()->with('success', [
            'message' => 'Billet émis avec succès.',
            'booking_number' => $booking->booking_number,
            'change' => $change,
            'total' => $totalPrice,
        ]);
    }
}
