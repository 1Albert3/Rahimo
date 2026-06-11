<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\Colis;
use App\Models\Promotion;
use App\Models\Trip;
use App\Services\LoyaltyService;
use App\Services\NotificationService;
use App\Services\Payment\PaymentService;
use App\Services\QrCodeService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;


class BookingController extends Controller
{
    public function __construct(
        protected NotificationService $notifier,
        protected QrCodeService $qrCode,
        protected PaymentService $payment,
    ) {}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'trip_id' => 'required|exists:trips,id',
            'passenger_name' => 'required|string|max:255',
            'passenger_phone' => 'required|string|max:20',
            'passenger_email' => 'nullable|email|max:255',
            'passenger_cnib' => 'nullable|string|regex:/^[A-Za-z0-9]{6,20}$/',
            'cnib_date_etablissement' => 'nullable|date|before_or_equal:today',
            'cnib_date_expiration' => 'nullable|date|after:cnib_date_etablissement',
            'seat_numbers' => 'required|array|min:1',
            'seat_numbers.*' => 'integer|min:1',
            'payment_method' => 'required|in:cash,mobile_money,card',
            'notification_channel' => 'nullable|in:sms,email,whatsapp',
            'promo_code' => 'nullable|string|max:50',
        ]);

        $trip = Trip::findOrFail($validated['trip_id']);

        if (! $trip->hasAvailableSeats(count($validated['seat_numbers']))) {
            throw ValidationException::withMessages([
                'seat_numbers' => 'Pas assez de places disponibles.',
            ]);
        }

        $totalPrice = $trip->price * count($validated['seat_numbers']);

        $user = Auth::user();

        // Appliquer réduction fidélité si connecté
        if ($user) {
            $discount = LoyaltyService::applyDiscount($user, $totalPrice);
            $totalPrice = $discount['final'];
        }

        // Appliquer code promo
        $promoCode = $validated['promo_code'] ?? null;
        $appliedPromo = null;
        if ($promoCode) {
            $promo = Promotion::where('code', strtoupper($promoCode))->first();
            if ($promo && $promo->isValid() && $totalPrice >= $promo->min_amount) {
                $result = $promo->apply($totalPrice);
                $totalPrice = $result['final'];
                $appliedPromo = $promo;
            }
        }

        // Traiter le paiement
        $paymentResult = $this->payment->charge($validated['payment_method'], [
            'amount' => $totalPrice,
            'currency' => 'XOF',
            'phone' => $validated['passenger_phone'],
            'order_id' => 'BK-'.uniqid(),
            'description' => "Billet {$validated['passenger_name']} — {$trip->departure_city}→{$trip->arrival_city}",
        ]);

        $channel = $validated['notification_channel'] ?? 'sms';

        $booking = Booking::create([
            'user_id' => $user?->id,
            'trip_id' => $trip->id,
            'passenger_name' => $validated['passenger_name'],
            'passenger_phone' => $validated['passenger_phone'],
            'passenger_email' => $validated['passenger_email'] ?? null,
            'passenger_cnib' => $validated['passenger_cnib'] ?? null,
            'cnib_date_etablissement' => $validated['cnib_date_etablissement'] ?? null,
            'cnib_date_expiration' => $validated['cnib_date_expiration'] ?? null,
            'seat_numbers' => $validated['seat_numbers'],
            'seats_count' => count($validated['seat_numbers']),
            'total_price' => $totalPrice,
            'status' => Booking::STATUS_CONFIRMED,
            'payment_status' => $paymentResult->success ? Booking::PAYMENT_PAID : Booking::PAYMENT_PENDING,
            'payment_method' => $validated['payment_method'],
            'notification_channel' => $channel,
            'booking_date' => now(),
        ]);

        if ($appliedPromo) {
            $appliedPromo->incrementUsage();
        }

        $trip->decrement('available_seats', count($validated['seat_numbers']));

        // Générer QR code
        $this->qrCode->generateForBooking($booking);

        // Points de fidélité
        if ($user) {
            LoyaltyService::awardPoints($user);
        }

        // Notification selon le canal choisi
        $this->notifier->sendTicketConfirmation($booking);

        return redirect()->route('trips.confirmation', ['booking' => $booking->id])
            ->with('success', 'Réservation confirmée !');
    }

    public function show(Booking $booking)
    {
        $booking->load('trip.vehicle');

        return response()->json([
            'billet' => $this->formatBooking($booking),
        ]);
    }

    public function cancel(Request $request, Booking $booking)
    {
        abort_if($booking->user_id !== Auth::id(), 403);

        if (! $booking->canBeCancelled()) {
            return back()->withErrors(['message' => 'Ce billet ne peut plus être annulé (délai dépassé).']);
        }

        $refundPct = $booking->getRefundPercentage();
        $refundAmount = $booking->getRefundAmount();

        // Remboursement via le service de paiement
        if ($refundAmount > 0 && $booking->payment_status === Booking::PAYMENT_PAID) {
            $this->payment->refund($booking);
        }

        $booking->update([
            'status' => Booking::STATUS_CANCELLED,
            'payment_status' => $refundAmount > 0 ? Booking::PAYMENT_REFUNDED : Booking::PAYMENT_PAID,
        ]);

        $booking->trip->increment('available_seats', $booking->seats_count);

        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'annulation',
            'description' => "Annulation billet {$booking->booking_number} — remboursement {$refundPct}% ({$refundAmount} FCFA)",
        ]);

        return back()->with('success', "Billet annulé. Remboursement de {$refundPct}% soit ".number_format($refundAmount, 0, ',', ' ').' FCFA.');
    }

    public function reschedule(Request $request, Booking $booking)
    {
        abort_if($booking->user_id !== Auth::id(), 403);

        $validated = $request->validate([
            'new_trip_id' => 'required|exists:trips,id',
        ]);

        $newTrip = Trip::findOrFail($validated['new_trip_id']);

        if (! $newTrip->hasAvailableSeats($booking->seats_count)) {
            return back()->withErrors(['message' => 'Pas assez de places disponibles sur ce trajet.']);
        }

        // Remettre les anciennes places
        $booking->trip->increment('available_seats', $booking->seats_count);

        // Prendre les nouvelles
        $newTrip->decrement('available_seats', $booking->seats_count);

        $booking->update([
            'trip_id' => $newTrip->id,
        ]);

        $this->qrCode->generateForBooking($booking);

        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'report',
            'description' => "Report billet {$booking->booking_number} vers le trajet {$newTrip->trip_number} ({$newTrip->departure_city}→{$newTrip->arrival_city})",
        ]);

        return back()->with('success', 'Voyage reporté avec succès.');
    }

    public function changeSeat(Request $request, Booking $booking)
    {
        abort_if($booking->user_id !== Auth::id(), 403);

        $validated = $request->validate([
            'seat_numbers' => 'required|array|min:1',
            'seat_numbers.*' => 'integer|min:1',
        ]);

        if (count($validated['seat_numbers']) !== $booking->seats_count) {
            return back()->withErrors(['message' => 'Le nombre de sièges doit correspondre à la réservation.']);
        }

        $trip = $booking->trip;

        // Vérifier que les nouveaux sièges sont disponibles
        $bookedSeats = Booking::where('trip_id', $trip->id)
            ->where('id', '!=', $booking->id)
            ->where('status', Booking::STATUS_CONFIRMED)
            ->get()
            ->pluck('seat_numbers')
            ->flatten()
            ->toArray();

        $intersect = array_intersect($validated['seat_numbers'], $bookedSeats);
        if (! empty($intersect)) {
            return back()->withErrors(['message' => 'Certains sièges sélectionnés sont déjà pris : '.implode(', ', $intersect)]);
        }

        $booking->update([
            'seat_numbers' => $validated['seat_numbers'],
        ]);

        $this->qrCode->generateForBooking($booking);

        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'changement_siege',
            'description' => "Changement sièges billet {$booking->booking_number} vers ".implode(', ', $validated['seat_numbers']),
        ]);

        return back()->with('success', 'Sièges modifiés avec succès.');
    }

    public function downloadPdf(Booking $booking)
    {
        abort_if($booking->user_id !== Auth::id(), 403);

        $booking->load('trip.vehicle');
        $billet = $this->formatBooking($booking);

        $pdf = Pdf::loadView('pdfs.ticket', compact('billet'));

        return $pdf->download("billet-{$booking->booking_number}.pdf");
    }

    public function userBookings()
    {
        $user = Auth::user();

        $bookings = Booking::with('trip.vehicle')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($b) => $this->formatBooking($b));

        $colis = Colis::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'tracking_number' => $c->tracking_number,
                'departure_city' => $c->departure_city,
                'arrival_city' => $c->arrival_city,
                'weight' => $c->weight,
                'status' => $c->status,
                'price' => (float) $c->price,
                'description' => $c->description,
                'expedition_date' => $c->expedition_date?->format('Y-m-d'),
            ]);

        $loyalty = LoyaltyService::getTier($user);

        $recentActivity = ActivityLog::where('user_id', $user->id)
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($l) => [
                'action' => $l->action,
                'description' => $l->description,
                'created_at' => $l->created_at?->diffForHumans(),
            ]);

        return response()->json([
            'billets' => $bookings,
            'colis' => $colis,
            'points_fidelite' => $loyalty['points'],
            'fidelite' => $loyalty,
            'recent_activity' => $recentActivity,
        ]);
    }

    private function formatBooking($booking): array
    {
        $trip = $booking->trip;

        return [
            'id' => $booking->id,
            'booking_number' => $booking->booking_number,
            'passenger_name' => $booking->passenger_name,
            'passenger_phone' => $booking->passenger_phone,
            'passenger_email' => $booking->passenger_email,
            'passenger_cnib' => $booking->passenger_cnib,
            'cnib_date_etablissement' => $booking->cnib_date_etablissement?->format('Y-m-d'),
            'cnib_date_expiration' => $booking->cnib_date_expiration?->format('Y-m-d'),
            'seat_numbers' => $booking->seat_numbers ?? [],
            'seats_count' => $booking->seats_count,
            'total_price' => (int) $booking->total_price,
            'status' => $booking->status,
            'payment_status' => $booking->payment_status,
            'payment_method' => $booking->payment_method,
            'notification_channel' => $booking->notification_channel ?? 'sms',
            'booking_date' => $booking->booking_date?->format('c'),
            'qr_code' => $booking->qr_code,
            'can_cancel' => $booking->canBeCancelled(),
            'refund_percentage' => $booking->canBeCancelled() ? $booking->getRefundPercentage() : 0,
            'refund_amount' => $booking->canBeCancelled() ? (int) $booking->getRefundAmount() : 0,
            'refund_policy' => $booking->canBeCancelled()
                ? ($booking->getRefundPercentage() >= 100 ? 'Remboursement intégral (>24h)' : ($booking->getRefundPercentage() >= 50 ? 'Remboursement 50% (6-24h)' : 'Non remboursable (<6h)'))
                : 'Non remboursable',
            'trip' => $trip ? [
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
                    'registration_number' => $trip->vehicle->registration_number,
                    'brand' => $trip->vehicle->brand,
                    'model' => $trip->vehicle->model,
                    'capacity' => $trip->vehicle->capacity,
                ] : null,
                'duration' => $trip->duration,
                'type' => 'standard',
                'vehicle_id' => $trip->vehicle_id,
            ] : null,
        ];
    }
}
