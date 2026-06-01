<?php

namespace App\Services\Payment;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MoovMoneyGateway implements PaymentGateway
{
    public function __construct(
        protected string $apiKey,
        protected bool $sandbox = true,
    ) {}

    protected function baseUrl(): string
    {
        return $this->sandbox
            ? 'https://sandbox-api.moov.africa/v1'
            : 'https://api.moov.africa/v1';
    }

    public function charge(array $params): PaymentResult
    {
        $payload = [
            'amount' => $params['amount'],
            'currency' => 'XOF',
            'phone' => $params['phone'] ?? '',
            'description' => $params['description'] ?? 'Paiement Rahimo Transport',
            'reference' => $params['reference'] ?? uniqid('MOOV-'),
            'callback_url' => route('webhook.moov'),
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl()}/collections/request-to-pay", $payload);

            if ($response->successful()) {
                $data = $response->json();
                return new PaymentResult(
                    success: true,
                    transactionId: $data['transactionId'] ?? $payload['reference'],
                    status: 'pending',
                    message: 'Paiement Moov Money initié.',
                );
            }

            Log::warning('Moov Money charge failed', ['response' => $response->body()]);
            return new PaymentResult(false, null, 'failed', $response->json('message') ?? 'Erreur Moov Money.');
        } catch (\Exception $e) {
            Log::error('Moov Money charge exception', ['error' => $e->getMessage()]);
            return new PaymentResult(false, null, 'failed', $e->getMessage());
        }
    }

    public function refund(string $transactionId, ?float $amount = null): PaymentResult
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
            ])->post("{$this->baseUrl()}/collections/refund", [
                'transactionId' => $transactionId,
                'amount' => $amount,
            ]);

            if ($response->successful()) {
                return new PaymentResult(true, $transactionId, 'refunded', 'Remboursement Moov Money effectué.');
            }

            Log::warning('Moov Money refund failed', ['response' => $response->body()]);
            return new PaymentResult(false, $transactionId, 'failed', 'Échec remboursement Moov Money.');
        } catch (\Exception $e) {
            Log::error('Moov Money refund exception', ['error' => $e->getMessage()]);
            return new PaymentResult(false, $transactionId, 'failed', $e->getMessage());
        }
    }

    public function verify(string $transactionId): PaymentResult
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
            ])->get("{$this->baseUrl()}/collections/transactions/{$transactionId}");

            if ($response->successful()) {
                $data = $response->json();
                return new PaymentResult(
                    success: true,
                    transactionId: $transactionId,
                    status: $data['status'] ?? 'unknown',
                    message: 'Statut vérifié.',
                );
            }

            return new PaymentResult(false, $transactionId, 'unknown', 'Impossible de vérifier.');
        } catch (\Exception $e) {
            Log::error('Moov Money verify exception', ['error' => $e->getMessage()]);
            return new PaymentResult(false, $transactionId, 'unknown', $e->getMessage());
        }
    }
}
