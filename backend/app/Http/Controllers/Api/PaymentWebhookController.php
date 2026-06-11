<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentWebhookController extends Controller
{
    public function orangeMoney(Request $request)
    {
        Log::info('Orange Money webhook received', $request->all());

        $transactionId = $request->input('pay_token') ?? $request->input('transaction_id');
        $status = $request->input('status', 'completed');

        if ($transactionId) {
            $payment = Payment::where('transaction_id', $transactionId)->first();
            if ($payment) {
                $payment->update([
                    'status' => $status === 'success' ? 'completed' : 'failed',
                    'payment_date' => now(),
                ]);
            }
        }

        return response()->json(['message' => 'OK']);
    }

    public function moovMoney(Request $request)
    {
        Log::info('Moov Money webhook received', $request->all());

        $transactionId = $request->input('transactionId') ?? $request->input('reference');
        $status = $request->input('status', 'success');

        if ($transactionId) {
            $payment = Payment::where('transaction_id', $transactionId)->first();
            if ($payment) {
                $payment->update([
                    'status' => $status === 'success' ? 'completed' : 'failed',
                    'payment_date' => now(),
                ]);
            }
        }

        return response()->json(['message' => 'OK']);
    }
}
