<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Trip;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $trips = Trip::where('status', '!=', 'cancelled')->get();
        $users = User::where('role', 'client')->get();

        if ($trips->isEmpty() || $users->isEmpty()) {
            return;
        }

        $statuses = ['confirmed', 'confirmed', 'confirmed', 'pending', 'completed'];
        $paymentStatuses = ['paid', 'paid', 'paid', 'pending', 'paid'];
        $methods = ['cash', 'mobile_money', 'mobile_money', 'cash', 'card'];

        foreach ($trips->take(20) as $trip) {
            $user = $users->random();
            $status = $statuses[array_rand($statuses)];
            $paymentStatus = $paymentStatuses[array_rand($paymentStatuses)];
            $paymentMethod = $methods[array_rand($methods)];
            $seatsCount = rand(1, 3);

            $booking = Booking::create([
                'user_id' => $user->id,
                'trip_id' => $trip->id,
                'passenger_name' => $user->name,
                'passenger_phone' => $user->phone ?? '70000000',
                'passenger_email' => $user->email,
                'seat_numbers' => collect(range(1, $trip->available_seats))->random($seatsCount)->values()->toArray(),
                'seats_count' => $seatsCount,
                'total_price' => $trip->price * $seatsCount,
                'status' => $status,
                'payment_status' => $paymentStatus,
                'payment_method' => $paymentMethod,
                'booking_date' => Carbon::now()->subDays(rand(0, 5)),
            ]);

            $trip->decrement('available_seats', $seatsCount);

            if ($paymentStatus === 'paid') {
                Payment::create([
                    'booking_id' => $booking->id,
                    'amount' => $booking->total_price,
                    'payment_method' => $paymentMethod,
                    'transaction_id' => 'TXN-' . strtoupper(\Illuminate\Support\Str::random(12)),
                    'status' => Payment::STATUS_COMPLETED,
                    'payment_date' => $booking->booking_date,
                ]);
            }
        }
    }
}
