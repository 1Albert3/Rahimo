<?php

namespace App\Services\Sms;

class SmsService
{
    protected SmsProvider $provider;

    public function __construct()
    {
        $driver = config('services.sms.default', 'log');

        $this->provider = match ($driver) {
            'twilio' => app(TwilioSmsProvider::class),
            default  => app(LogSmsProvider::class),
        };
    }

    public function send(string $phone, string $message): bool
    {
        return $this->provider->send($phone, $message);
    }

    public function sendTicketConfirmation(string $phone, string $passenger, string $bookingNumber, string $departure, string $arrival, string $time, array $seats): bool
    {
        $message = "Rahimo Transport - {$passenger}, votre billet {$bookingNumber} est confirmé!\n"
                 . "Trajet: {$departure} → {$arrival}\n"
                 . "Départ: {$time}\n"
                 . "Sièges: " . implode(',', $seats) . "\n"
                 . "Merci de voyager avec Rahimo!";

        return $this->send($phone, $message);
    }

    public function sendColisStatus(string $phone, string $trackingNumber, string $status): bool
    {
        $labels = [
            'en_attente' => 'enregistré',
            'en_cours'   => 'pris en charge',
            'en_transit' => 'en transit',
            'livre'      => 'livré',
        ];

        $label = $labels[$status] ?? $status;
        $message = "Rahimo Transport - Colis {$trackingNumber}: {$label}. Merci de votre confiance!";

        return $this->send($phone, $message);
    }

    public function sendTripDelay(string $phone, string $tripNumber, int $delayMinutes): bool
    {
        $message = "Rahimo Transport - Trajet {$tripNumber}: "
                 . "Retard estimé de {$delayMinutes} minutes. "
                 . "Nous vous prions de nous excuser pour ce désagrément.";

        return $this->send($phone, $message);
    }
}
