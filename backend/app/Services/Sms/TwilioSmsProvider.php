<?php

namespace App\Services\Sms;

use Illuminate\Support\Facades\Log;
use Twilio\Rest\Client;

class TwilioSmsProvider implements SmsProvider
{
    protected ?Client $client = null;
    protected string $from;

    public function __construct()
    {
        $config = config('services.sms.drivers.twilio');

        $this->from = $config['from'] ?? '';

        if (!empty($config['account_sid']) && !empty($config['auth_token'])) {
            $this->client = new Client($config['account_sid'], $config['auth_token']);
        }
    }

    public function send(string $phone, string $message): bool
    {
        if (!$this->client) {
            Log::warning('Twilio non configuré, fallback log', [
                'to' => $phone,
                'message' => $message,
            ]);
            return app(LogSmsProvider::class)->send($phone, $message);
        }

        try {
            $this->client->messages->create($phone, [
                'from' => $this->from,
                'body' => $message,
            ]);
            return true;
        } catch (\Exception $e) {
            Log::error('Twilio SMS failed', [
                'to' => $phone,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
