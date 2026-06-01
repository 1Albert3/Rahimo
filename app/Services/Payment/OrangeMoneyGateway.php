<?php

namespace App\Services\Payment;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OrangeMoneyGateway implements PaymentGateway
{
    protected array $config;
    protected ?string $accessToken = null;

    public function __construct()
    {
        $this->config = config('services.payment.orange_money');
    }

    protected function authenticate(): ?string
    {
        if ($this->accessToken) {
            return $this->accessToken;
        }

        try {
            $base = $this->config['sandbox']
                ? 'https://api.sandbox.orange.com'
                : 'https://api.orange.com';

            $response = Http::withBasicAuth(
                $this->config['client_id'],
                $this->config['client_secret']
            )->post("{$base}/oauth/v2/token", [
                'grant_type' => 'client_credentials',
            ]);

            if ($response->successful()) {
                $this->accessToken = $response->json('access_token');
                return $this->accessToken;
            }

            Log::error('Orange Money auth failed', ['response' => $response->body()]);
        } catch (\Exception $e) {
            Log::error('Orange Money auth exception', ['error' => $e->getMessage()]);
        }

        return null;
    }

    public function charge(array $params): PaymentResult
    {
        $token = $this->authenticate();

        if (!$token) {
            return new PaymentResult(false, '', 'failed', 'Authentification Orange Money échouée');
        }

        try {
            $base = $this->config['sandbox']
                ? 'https://api.sandbox.orange.com'
                : 'https://api.orange.com';

            $response = Http::withToken($token)->post("{$base}/orange-money-webpay/v1/payment", [
                'merchant_key' => $this->config['merchant_key'],
                'currency'     => 'XOF',
                'amount'       => $params['amount'] ?? 0,
                'order_id'     => $params['order_id'] ?? uniqid(),
                'phone_number' => $params['phone'] ?? '',
                'description'  => $params['description'] ?? 'Paiement Rahimo Transport',
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return new PaymentResult(
                    success: true,
                    transactionId: $data['pay_token'] ?? $data['transaction_id'] ?? 'OR-' . uniqid(),
                    status: 'pending',
                    message: 'Paiement Orange Money initié',
                );
            }

            Log::error('Orange Money charge failed', ['response' => $response->body()]);
        } catch (\Exception $e) {
            Log::error('Orange Money charge exception', ['error' => $e->getMessage()]);
        }

        return new PaymentResult(false, '', 'failed', 'Paiement Orange Money échoué');
    }

    public function refund(string $transactionId, ?float $amount = null): PaymentResult
    {
        $token = $this->authenticate();
        if (!$token) {
            return new PaymentResult(false, $transactionId, 'failed', 'Auth échouée');
        }

        try {
            $base = $this->config['sandbox']
                ? 'https://api.sandbox.orange.com'
                : 'https://api.orange.com';

            $response = Http::withToken($token)->post("{$base}/orange-money-webpay/v1/refund", [
                'transaction_id' => $transactionId,
                'amount' => $amount,
            ]);

            if ($response->successful()) {
                return new PaymentResult(true, $transactionId, 'refunded', 'Remboursement Orange Money effectué.');
            }
            Log::warning('Orange Money refund failed', ['response' => $response->body()]);
        } catch (\Exception $e) {
            Log::error('Orange Money refund exception', ['error' => $e->getMessage()]);
        }

        return new PaymentResult(false, $transactionId, 'failed', 'Échec remboursement.');
    }

    public function verify(string $transactionId): PaymentResult
    {
        $token = $this->authenticate();
        if (!$token) {
            return new PaymentResult(false, $transactionId, 'unknown', 'Auth échouée');
        }

        try {
            $base = $this->config['sandbox']
                ? 'https://api.sandbox.orange.com'
                : 'https://api.orange.com';

            $response = Http::withToken($token)->get("{$base}/orange-money-webpay/v1/transactions/{$transactionId}");

            if ($response->successful()) {
                $data = $response->json();
                return new PaymentResult(true, $transactionId, $data['status'] ?? 'verified', 'Transaction vérifiée.');
            }

            Log::warning('Orange Money verify failed', ['response' => $response->body()]);
        } catch (\Exception $e) {
            Log::error('Orange Money verify exception', ['error' => $e->getMessage()]);
        }

        return new PaymentResult(false, $transactionId, 'unknown', 'Impossible de vérifier.');
    }
}
