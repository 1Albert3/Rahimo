<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Colis;
use App\Services\Sms\SmsService;

class NotificationService
{
    public function __construct(
        protected SmsService $sms,
    ) {}

    public function sendTicketConfirmation(Booking $booking): void
    {
        $trip = $booking->trip;

        $this->sms->sendTicketConfirmation(
            phone: $booking->passenger_phone,
            passenger: $booking->passenger_name,
            bookingNumber: $booking->booking_number,
            departure: $trip->departure_city,
            arrival: $trip->arrival_city,
            time: $trip->departure_time?->format('H:i d/m/Y') ?? '',
            seats: $booking->seat_numbers ?? [],
        );
    }

    public function sendTripDelay(string $phone, string $tripNumber, int $delayMinutes): void
    {
        $this->sms->sendTripDelay($phone, $tripNumber, $delayMinutes);
    }

    public function sendColisStatus(string $phone, string $trackingNumber, string $status): void
    {
        $this->sms->sendColisStatus($phone, $trackingNumber, $status);
    }

    public function sendSms(string $phone, string $message): void
    {
        $this->sms->send($phone, $message);
    }
}
