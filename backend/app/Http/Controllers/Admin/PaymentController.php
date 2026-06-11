<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\Payment\PaymentService;
use Carbon\Carbon;
use Illuminate\Http\Request;


class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::forCurrentCompany()->with('booking.trip', 'booking.user');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('method')) {
            $query->where('payment_method', $request->method);
        }
        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        $payments = $query->latest()
            ->paginate(30)
            ->through(fn ($p) => [
                'id' => $p->id,
                'reference' => $p->reference_number,
                'amount' => (int) $p->amount,
                'method' => $p->payment_method,
                'status' => $p->status,
                'transaction_id' => $p->transaction_id,
                'client' => $p->booking?->user?->name ?? '—',
                'booking_ref' => $p->booking?->reference_number ?? '—',
                'route' => $p->booking?->trip ? "{$p->booking->trip->departure_city} → {$p->booking->trip->arrival_city}" : '—',
                'date' => $p->created_at->format('Y-m-d H:i'),
                'payment_date' => $p->payment_date?->format('Y-m-d H:i'),
            ]);

        $stats = [
            'total' => Payment::forCurrentCompany()->count(),
            'completed' => Payment::forCurrentCompany()->where('status', 'completed')->sum('amount'),
            'pending' => Payment::forCurrentCompany()->where('status', 'pending')->count(),
            'failed' => Payment::forCurrentCompany()->where('status', 'failed')->count(),
            'refunded' => Payment::forCurrentCompany()->where('status', 'refunded')->sum('amount'),
        ];

        return response()->json([
            'payments' => $payments,
            'stats' => $stats,
            'filters' => $request->only(['status', 'method', 'from', 'to']),
        ]);
    }

    public function refund(Payment $payment, PaymentService $paymentService)
    {
        if ($payment->status !== 'completed') {
            return back()->with('error', 'Seuls les paiements complétés peuvent être remboursés.');
        }

        $result = $paymentService->refund($payment->transaction_id, $payment->amount);

        if ($result->success) {
            $payment->update(['status' => 'refunded', 'payment_date' => now()]);
            return back()->with('success', 'Paiement remboursé.');
        }

        return back()->with('error', 'Échec du remboursement: ' . $result->message);
    }

    public function verify(Payment $payment, PaymentService $paymentService)
    {
        if (!$payment->transaction_id) {
            return back()->with('error', 'Aucune transaction à vérifier.');
        }

        $result = $paymentService->verify($payment->transaction_id);

        if ($result->success) {
            $payment->update(['status' => $result->status === 'completed' || $result->status === 'verified' ? 'completed' : $payment->status]);
            return back()->with('success', 'Statut: ' . $result->status);
        }

        return back()->with('error', 'Vérification échouée.');
    }

    public function stats()
    {
        $daily = Payment::forCurrentCompany()->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, SUM(CASE WHEN status = "completed" THEN amount ELSE 0 END) as revenue, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $byMethod = Payment::forCurrentCompany()->where('status', 'completed')
            ->selectRaw('payment_method, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('payment_method')
            ->get()
            ->map(fn ($p) => ['method' => $p->payment_method, 'total' => (int) $p->total, 'count' => $p->count]);

        return response()->json(compact('daily', 'byMethod'));
    }
}
