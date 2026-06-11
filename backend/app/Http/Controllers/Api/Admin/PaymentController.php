<?php
namespace App\Http\Controllers\Api\Admin;
use App\Models\Payment;
use App\Services\Payment\PaymentService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::forCurrentCompany()->with('booking.trip', 'booking.user');
        if ($request->filled('status'))  $query->where('status', $request->status);
        if ($request->filled('method'))  $query->where('payment_method', $request->method);
        if ($request->filled('from'))    $query->whereDate('created_at', '>=', $request->from);
        if ($request->filled('to'))      $query->whereDate('created_at', '<=', $request->to);

        $payments = $query->latest()->paginate(30)->through(fn ($p) => [
            'id'             => $p->id,
            'reference'      => $p->reference_number,
            'amount'         => (int) $p->amount,
            'method'         => $p->payment_method,
            'status'         => $p->status,
            'transaction_id' => $p->transaction_id,
            'client'         => $p->booking?->user?->name ?? '—',
            'booking_ref'    => $p->booking?->reference_number ?? '—',
            'route'          => $p->booking?->trip ? "{$p->booking->trip->departure_city} → {$p->booking->trip->arrival_city}" : '—',
            'date'           => $p->created_at->format('Y-m-d H:i'),
            'payment_date'   => $p->payment_date?->format('Y-m-d H:i'),
        ]);

        return response()->json([
            'payments' => $payments,
            'stats'    => [
                'total'     => Payment::forCurrentCompany()->count(),
                'completed' => Payment::forCurrentCompany()->where('status', 'completed')->sum('amount'),
                'pending'   => Payment::forCurrentCompany()->where('status', 'pending')->count(),
                'failed'    => Payment::forCurrentCompany()->where('status', 'failed')->count(),
                'refunded'  => Payment::forCurrentCompany()->where('status', 'refunded')->sum('amount'),
            ],
        ]);
    }

    public function refund(Payment $payment, PaymentService $paymentService)
    {
        $paymentService->refund($payment);
        return response()->json(['message' => 'Remboursement effectué.']);
    }

    public function verify(Payment $payment, PaymentService $paymentService)
    {
        $paymentService->verify($payment);
        return response()->json(['message' => 'Paiement vérifié.']);
    }
}
