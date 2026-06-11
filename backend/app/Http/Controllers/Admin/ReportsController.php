<?php

namespace App\Http\Controllers\Admin;

use App\Exports\FinancialReportExport;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Expense;
use App\Models\MaintenanceRecord;
use App\Models\Payment;
use App\Models\Trip;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Http\Request;

use Maatwebsite\Excel\Facades\Excel;

class ReportsController extends Controller
{
    public function index(Request $request)
    {
        $dateFrom = Carbon::parse($request->get('from', now()->startOfMonth()));
        $dateTo = Carbon::parse($request->get('to', now()->endOfMonth()));

        $revenueByDay = Booking::forCurrentCompany()->whereBetween('created_at', [$dateFrom, $dateTo])
            ->where('status', 'confirmed')
            ->selectRaw('DATE(created_at) as date, SUM(total_price) as revenue, COUNT(*) as bookings')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $byRoute = Trip::forCurrentCompany()->whereBetween('departure_date', [$dateFrom, $dateTo])
            ->withCount('bookings')
            ->get()
            ->groupBy('route')
            ->map(fn ($trips) => [
                'route' => $trips->first()->route,
                'trips' => $trips->count(),
                'passengers' => $trips->sum('bookings_count'),
                'revenue' => $trips->flatMap->bookings->where('status', 'confirmed')->sum('total_price'),
            ])
            ->sortByDesc('revenue')
            ->values();

        $revenueByService = collect([
            'Tickets' => Booking::whereBetween('created_at', [$dateFrom, $dateTo])
                ->where('status', 'confirmed')->sum('total_price'),
            'Colis' => Payment::forCurrentCompany()->whereBetween('created_at', [$dateFrom, $dateTo])
                ->where('payment_method', 'mobile_money')->sum('amount'),
            'Parking' => 0,
            'Location' => 0,
            'Hébergement' => 0,
            'Moto' => 0,
        ]);

        $totalRevenue = $revenueByService->sum();
        $totalExpenses = Expense::whereBetween('created_at', [$dateFrom, $dateTo])
            ->where('status', 'approved')->sum('amount');
        $netResult = $totalRevenue - $totalExpenses;

        // YoY comparison
        $lastYearFrom = (clone $dateFrom)->subYear();
        $lastYearTo = (clone $dateTo)->subYear();

        $yoyRevenue = Booking::forCurrentCompany()->whereBetween('created_at', [$lastYearFrom, $lastYearTo])
            ->where('status', 'confirmed')->sum('total_price');

        $occupancy = $this->occupancyRate($dateFrom, $dateTo);

        $fleetCosts = Vehicle::forCurrentCompany()->with('maintenanceRecords')
            ->get()
            ->map(fn ($v) => [
                'vehicle' => $v->registration_number,
                'cost' => (int) $v->maintenanceRecords()
                    ->whereBetween('maintenance_date', [$dateFrom, $dateTo])
                    ->sum('cost'),
                'count' => $v->maintenanceRecords()
                    ->whereBetween('maintenance_date', [$dateFrom, $dateTo])
                    ->count(),
            ])
            ->filter(fn ($v) => $v['cost'] > 0)
            ->sortByDesc('cost')
            ->values();

        return response()->json([
            'filters' => ['from' => $dateFrom->format('Y-m-d'), 'to' => $dateTo->format('Y-m-d')],
            'reports' => [
                'revenue_by_day' => $revenueByDay,
                'by_route' => $byRoute,
                'by_service' => $revenueByService->map(fn ($v, $k) => ['service' => $k, 'amount' => (int) $v])->values(),
                'total_revenue' => (int) $totalRevenue,
                'total_expenses' => (int) $totalExpenses,
                'net_result' => (int) $netResult,
                'yoy_revenue' => (int) $yoyRevenue,
                'occupancy' => $occupancy,
                'fleet_costs' => $fleetCosts,
            ],
        ]);
    }

    public function exportExcel(Request $request)
    {
        $dateFrom = Carbon::parse($request->get('from', now()->startOfMonth()));
        $dateTo = Carbon::parse($request->get('to', now()->endOfMonth()));

        $export = new FinancialReportExport($dateFrom, $dateTo);
        $filename = "rapport_financier_{$dateFrom->format('Ymd')}_{$dateTo->format('Ymd')}.xlsx";

        return Excel::download($export, $filename);
    }

    public function exportCsv(Request $request)
    {
        $dateFrom = Carbon::parse($request->get('from', now()->startOfMonth()));
        $dateTo = Carbon::parse($request->get('to', now()->endOfMonth()));

        $bookings = Booking::forCurrentCompany()->with('trip', 'user')
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->where('status', 'confirmed')
            ->get();

        $filename = "reservations_{$dateFrom->format('Ymd')}_{$dateTo->format('Ymd')}.csv";

        $headers = ['Content-Type' => 'text/csv', 'Content-Disposition' => "attachment; filename={$filename}"];
        $callback = function () use ($bookings) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['N°', 'Client', 'Téléphone', 'Trajet', 'Date', 'Places', 'Montant', 'Paiement']);
            foreach ($bookings as $b) {
                fputcsv($handle, [
                    $b->reference_number ?? $b->id,
                    $b->user?->name,
                    $b->user?->phone,
                    $b->trip?->route,
                    $b->trip?->departure_date?->format('d/m/Y'),
                    $b->seats,
                    $b->total_price,
                    $b->payment_status,
                ]);
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function occupancyRate(Carbon $from, Carbon $to): array
    {
        $trips = Trip::forCurrentCompany()->withCount('bookings')
            ->whereBetween('departure_date', [$from, $to])
            ->get();

        $totalSeats = $trips->sum(fn ($t) => $t->vehicle?->capacity ?? 50);
        $totalPassengers = $trips->sum('bookings_count');

        return [
            'rate' => $totalSeats > 0 ? round(($totalPassengers / $totalSeats) * 100, 1) : 0,
            'passengers' => $totalPassengers,
            'capacity' => $totalSeats,
        ];
    }
}
