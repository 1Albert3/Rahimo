<?php

namespace App\Services\Payment;

use Illuminate\Support\Facades\Log;

class LogPaymentGateway implements PaymentGateway
{
    public function charge(array $params): PaymentResult
    {
        Log::info('Paiement simulé', $params);

        return new PaymentResult(
            success: true,
            transactionId: 'TXN-' . strtoupper(substr(md5(uniqid()), 0, 12)),
            status: 'completed',
            message: 'Paiement simulé avec succès',
        );
    }

    public function refund(string $transactionId, ?float $amount = null): PaymentResult
    {
        Log::info('Remboursement simulé', [
            'transaction_id' => $transactionId,
            'amount' => $amount,
        ]);

        return new PaymentResult(
            success: true,
            transactionId: $transactionId,
            status: 'refunded',
            message: 'Remboursement simulé avec succès',
        );
    }

    public function verify(string $transactionId): PaymentResult
    {
        return new PaymentResult(
            success: true,
            transactionId: $transactionId,
            status: 'verified',
            message: 'Transaction vérifiée',
        );
    }
}
