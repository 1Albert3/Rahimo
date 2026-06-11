<?php

namespace App\Services\Payment;

class PaymentService
{
    protected PaymentGateway $gateway;

    public function __construct()
    {
        $driver = config('services.payment.default', 'log');

        $this->gateway = match ($driver) {
            'orange_money' => app(OrangeMoneyGateway::class),
            'moov_money'   => app(MoovMoneyGateway::class),
            default        => app(LogPaymentGateway::class),
        };
    }

    public function charge(string $method, array $params): PaymentResult
    {
        if ($method === 'cash') {
            return new PaymentResult(true, 'CASH-' . uniqid(), 'completed', 'Paiement en espèces');
        }

        return $this->gateway->charge($params);
    }

    public function refund(string $transactionId, ?float $amount = null): PaymentResult
    {
        return $this->gateway->refund($transactionId, $amount);
    }

    public function verify(string $transactionId): PaymentResult
    {
        return $this->gateway->verify($transactionId);
    }
}
