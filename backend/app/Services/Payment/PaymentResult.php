<?php

namespace App\Services\Payment;

use Illuminate\Support\Facades\Log;

class PaymentResult
{
    public function __construct(
        public readonly bool   $success,
        public readonly string $transactionId,
        public readonly string $status,
        public readonly string $message = '',
    ) {}
}
