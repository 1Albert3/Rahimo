<?php

namespace App\Services;

use App\Models\Booking;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Support\Facades\Storage;

class QrCodeService
{
    public function generateForBooking(Booking $booking): string
    {
        $data = json_encode([
            'type'           => 'ticket',
            'booking_number' => $booking->booking_number,
            'trip'           => $booking->trip->trip_number ?? '',
            'passenger'      => $booking->passenger_name,
            'seats'          => $booking->seat_numbers ?? [],
        ]);

        try {
            $hash = md5($booking->booking_number);
            $filename = "{$booking->booking_number}-{$hash}.svg";
            $path = "qr-codes/{$filename}";

            $renderer = new ImageRenderer(
                new RendererStyle(300, 4),
                new SvgImageBackEnd
            );
            $writer = new Writer($renderer);
            $svg = $writer->writeString($data);

            Storage::disk('public')->put($path, $svg);

            $qrCode = url("storage/{$path}");
            $booking->update(['qr_code' => $qrCode]);

            return $qrCode;
        } catch (\Exception $e) {
            logger()->warning('QR Code generation failed', ['error' => $e->getMessage()]);
            return $this->generateFallback($booking);
        }
    }

    public function getQrCodeUrl(Booking $booking): ?string
    {
        if ($booking->qr_code) {
            return $booking->qr_code;
        }

        return $this->generateForBooking($booking);
    }

    public function verifyQrData(string $data): ?array
    {
        $decoded = json_decode($data, true);

        if (!$decoded || !isset($decoded['type']) || $decoded['type'] !== 'ticket') {
            return null;
        }

        return $decoded;
    }

    private function generateFallback(Booking $booking): string
    {
        $hash = md5($booking->booking_number . $booking->id);
        $visualCode = substr($hash, 0, 8) . '-' . substr($hash, 8, 4);

        $booking->update(['qr_code' => $visualCode]);

        return $visualCode;
    }
}
