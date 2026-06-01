<?php

namespace App\Services\Payment;

interface PaymentGateway
{
    public function charge(array $params): PaymentResult;
    public function refund(string $transactionId, ?float $amount = null): PaymentResult;
    public function verify(string $transactionId): PaymentResult;
}
