<?php

namespace App\Services\Sms;

use Illuminate\Support\Facades\Log;

class LogSmsProvider implements SmsProvider
{
    public function send(string $phone, string $message): bool
    {
        Log::info('SMS envoyé', [
            'to' => $phone,
            'message' => $message,
        ]);

        return true;
    }
}
