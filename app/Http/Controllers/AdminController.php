<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Expense;
use App\Models\Trip;
use App\Models\User;
use App\Models\Vehicle;
use App\Services\NotificationService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        $today = Carbon::today();
        $todayTrips = Trip::forCurrentCompany()->whereDate('departure_date', $today)->count();
        $todayBookings = Booking::forCurrentCompany()->whereDate('created_at', $today)->count();
        $totalRevenue = Booking::forCurrentCompany()->where('payment_status', 'paid')
            ->whereDate('created_at', $today)
            ->sum('total_price');
        $activeVehicles = Vehicle::forCurrentCompany()->where('status', 'active')->count();
        $activeDrivers = User::forCurrentCompany()->where('role', 'chauffeur')->where('is_active', true)->count();
        $pendingBookings = Booking::forCurrentCompany()->where('status', 'pending')->count();

        // Tendances revenus 30 jours
        $revenusTendances = collect(range(29, 0))->map(fn ($d) => [
            'date' => Carbon::now()->subDays($d)->format('Y-m-d'),
            'jour' => Carbon::now()->subDays($d)->format('d M'),
            'recettes' => (float) Booking::forCurrentCompany()->where('payment_status', 'paid')
                ->whereDate('created_at', Carbon::now()->subDays($d))
                ->sum('total_price'),
        ]);

        // Top 5 routes par revenu
        $topRoutes = Trip::forCurrentCompany()->selectRaw('
                CONCAT(departure_city, " → ", arrival_city) as route,
                COUNT(DISTINCT bookings.id) as total_reservations,
                SUM(bookings.seats_count) as total_passagers,
                SUM(bookings.total_price) as total_revenu
            ')
            ->join('bookings', 'trips.id', '=', 'bookings.trip_id')
            ->where('bookings.payment_status', 'paid')
            ->where('bookings.created_at', '>=', Carbon::now()->subMonth())
            ->groupBy(DB::raw('CONCAT(departure_city, " → ", arrival_city)'))
            ->orderByDesc('total_revenu')
            ->take(5)
            ->get()
            ->map(fn ($r) => [
                'route' => $r->route,
                'reservations' => $r->total_reservations,
                'passagers' => $r->total_passagers,
                'revenu' => (float) $r->total_revenu,
            ]);

        // Revenus par service
        $revenusServices = [
            'billets' => (float) Booking::forCurrentCompany()->where('payment_status', 'paid')
                ->whereDate('created_at', '>=', Carbon::now()->startOfMonth())
                ->sum('total_price'),
            'parking' => (float) \App\Models\Parking::where('status', 'termine')
                ->whereDate('updated_at', '>=', Carbon::now()->startOfMonth())
                ->sum('amount'),
            'location' => (float) \App\Models\Rental::where('status', 'termine')
                ->whereDate('updated_at', '>=', Carbon::now()->startOfMonth())
                ->sum('total_amount'),
            'hebergement' => (float) \App\Models\Accommodation::where('status', 'termine')
                ->whereDate('updated_at', '>=', Carbon::now()->startOfMonth())
                ->sum('total_amount'),
            'moto' => (float) \App\Models\MotoTransport::where('status', 'livre')
                ->whereDate('updated_at', '>=', Carbon::now()->startOfMonth())
                ->sum('amount'),
        ];

        // Tendance occupation 7 derniers jours
        $occupationTendances = collect(range(6, 0))->map(function ($d) {
            $day = Carbon::now()->subDays($d);
            $totalCapacity = Trip::forCurrentCompany()->whereDate('departure_date', $day)
                ->with('vehicle')
                ->get()
                ->sum(fn ($t) => $t->vehicle?->capacity ?? 50);
            $totalBooked = Booking::forCurrentCompany()->whereHas('trip', fn ($q) => $q->whereDate('departure_date', $day))
                ->where('status', 'confirmed')
                ->sum('seats_count');
            return [
                'date' => $day->format('d M'),
                'taux' => $totalCapacity > 0 ? round(($totalBooked / $totalCapacity) * 100) : 0,
            ];
        });

        // Départs du jour (pour le tableau)
        $departs = Trip::forCurrentCompany()->with('vehicle')
            ->whereDate('departure_date', $today)
            ->orderBy('departure_time')
            ->take(6)
            ->get()
            ->map(fn ($t) => [
                'bus_id' => $t->vehicle?->registration_number ?? 'N/A',
                'destination' => "{$t->departure_city} → {$t->arrival_city}",
                'heure' => $t->departure_time?->format('H:i'),
                'passagers' => $t->bookings()->where('status', 'confirmed')->sum('seats_count') . '/' . ($t->vehicle?->capacity ?? '?'),
                'statut' => $t->status,
                'recette' => (float) $t->bookings()->where('payment_status', 'paid')->sum('total_price'),
            ]);

        // Alertes récentes
        $alertes = \App\Models\Alert::latest()->take(5)->get()->map(fn ($a) => [
            'id' => $a->id,
            'type' => $a->type,
            'severite' => $a->severite,
            'message' => $a->message,
            'created_at' => $a->created_at?->diffForHumans(),
        ]);

        return Inertia::render('Admin/Dashboard', [
            'kpis' => [
                'trajets_aujourdhui' => $todayTrips,
                'reservations_aujourdhui' => $todayBookings,
                'revenus_aujourdhui' => (float) $totalRevenue,
                'vehicules_actifs' => $activeVehicles,
                'chauffeurs_actifs' => $activeDrivers,
                'reservations_en_attente' => $pendingBookings,
            ],
            'revenus_tendances' => $revenusTendances,
            'top_routes' => $topRoutes,
            'revenus_par_service' => $revenusServices,
            'occupation_tendances' => $occupationTendances,
            'departs' => $departs,
            'alertes' => $alertes,
        ]);
    }

    public function manifeste()
    {
        $today = Carbon::today();
        $departs = Trip::forCurrentCompany()->with('vehicle', 'driver', 'bookings')
            ->whereDate('departure_date', $today)
            ->orderBy('departure_time')
            ->get()
            ->map(function ($trip) {
                $confirmedBookings = $trip->bookings->where('status', 'confirmed');
                return [
                    'id' => $trip->id,
                    'trip_number' => $trip->trip_number,
                    'departure_time' => $trip->departure_time,
                    'arrival_time' => $trip->arrival_time,
                    'departure_city' => $trip->departure_city,
                    'arrival_city' => $trip->arrival_city,
                    'vehicle' => $trip->vehicle,
                    'driver' => $trip->driver,
                    'total_seats' => $trip->vehicle->capacity,
                    'booked_seats' => $confirmedBookings->sum('seats_count'),
                    'fill_rate' => $trip->vehicle->capacity > 0
                        ? round(($confirmedBookings->sum('seats_count') / $trip->vehicle->capacity) * 100)
                        : 0,
                    'status' => $trip->status,
                    'passagers' => $confirmedBookings->map(function ($booking) {
                        return [
                            'nom' => $booking->passenger_name,
                            'telephone' => $booking->passenger_phone,
                            'sieges' => $booking->seat_numbers,
                            'statut' => $booking->payment_status,
                        ];
                    }),
                ];
            });

        return Inertia::render('Admin/Manifeste', [
            'departs' => $departs,
        ]);
    }

    public function rapports()
    {
        $last7Days = collect(range(6, 0))->map(function ($day) {
            $date = Carbon::now()->subDays($day);
            return [
                'date' => $date->format('Y-m-d'),
                'recettes' => Booking::forCurrentCompany()->where('payment_status', 'paid')
                    ->whereDate('created_at', $date)
                    ->sum('total_price'),
                'reservations' => Booking::forCurrentCompany()->whereDate('created_at', $date)->count(),
            ];
        });

        $topRoutes = Trip::forCurrentCompany()->selectRaw('CONCAT(departure_city, " → ", arrival_city) as route, SUM(bookings.seats_count) as total_passagers')
            ->join('bookings', 'trips.id', '=', 'bookings.trip_id')
            ->where('bookings.status', 'confirmed')
            ->groupBy(DB::raw('CONCAT(departure_city, " → ", arrival_city)'))
            ->orderByDesc('total_passagers')
            ->take(5)
            ->get();

        $occupationMensuelle = Trip::forCurrentCompany()->whereMonth('departure_date', Carbon::now()->month)
            ->selectRaw('
                SUM(available_seats + COALESCE((SELECT SUM(seats_count) FROM bookings WHERE trips.id = bookings.trip_id AND bookings.status = "confirmed"), 0)) as total_capacity,
                SUM(COALESCE((SELECT SUM(seats_count) FROM bookings WHERE trips.id = bookings.trip_id AND bookings.status = "confirmed"), 0)) as total_booked
            ')
            ->first();

        $tauxOccupation = $occupationMensuelle && $occupationMensuelle->total_capacity > 0
            ? round(($occupationMensuelle->total_booked / $occupationMensuelle->total_capacity) * 100)
            : 0;

        $recettesMensuelles = Booking::forCurrentCompany()->where('payment_status', 'paid')
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->sum('total_price');

        $totalVoyageurs = Booking::forCurrentCompany()->where('status', 'confirmed')
            ->whereMonth('created_at', Carbon::now()->month)
            ->sum('seats_count');

        $reclamationsMois = \App\Models\Reclamation::whereMonth('created_at', Carbon::now()->month)->count();

        $revenusParService = [
            'parking' => (float) \App\Models\Parking::where('status', 'termine')->whereMonth('updated_at', Carbon::now()->month)->sum('amount'),
            'location' => (float) \App\Models\Rental::where('status', 'termine')->whereMonth('updated_at', Carbon::now()->month)->sum('total_amount'),
            'hebergement' => (float) \App\Models\Accommodation::where('status', 'termine')->whereMonth('updated_at', Carbon::now()->month)->sum('total_amount'),
            'moto_transport' => (float) \App\Models\MotoTransport::where('status', 'livre')->whereMonth('updated_at', Carbon::now()->month)->sum('amount'),
        ];

        return Inertia::render('Admin/Rapports', [
            'chiffre_affaires' => $last7Days,
            'top_routes' => $topRoutes,
            'taux_occupation' => $tauxOccupation,
            'recettes_mensuelles' => $recettesMensuelles,
            'total_voyageurs' => $totalVoyageurs,
            'reclamations_mois' => $reclamationsMois,
            'revenus_par_service' => $revenusParService,
        ]);
    }

    public function exportRapports(Request $request)
    {
        $type = $request->input('type', 'csv');
        $periode = $request->input('periode', 'mensuel');

        $bookings = Booking::forCurrentCompany()->with('trip')
            ->where('status', 'confirmed')
            ->when($periode === 'mensuel', fn ($q) => $q->whereMonth('created_at', Carbon::now()->month))
            ->when($periode === 'trimestriel', fn ($q) => $q->where('created_at', '>=', Carbon::now()->subMonths(3)))
            ->when($periode === 'annuel', fn ($q) => $q->whereYear('created_at', Carbon::now()->year))
            ->get();

        $rows = $bookings->map(fn ($b) => [
            $b->booking_number,
            $b->passenger_name,
            $b->passenger_phone,
            $b->trip?->departure_city . ' → ' . $b->trip?->arrival_city,
            $b->seats_count,
            (float) $b->total_price,
            $b->payment_method,
            $b->created_at->format('Y-m-d'),
        ]);

        $headers = ['N° Réservation', 'Client', 'Téléphone', 'Trajet', 'Places', 'Montant', 'Paiement', 'Date'];

        if ($type === 'csv') {
            $output = fopen('php://temp', 'r+');
            fputcsv($output, $headers);
            foreach ($rows as $row) {
                fputcsv($output, $row);
            }
            rewind($output);
            $content = stream_get_contents($output);
            fclose($output);

            return response($content, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="rapport_rahimo_' . $periode . '.csv"',
            ]);
        }

        if ($type === 'pdf') {
            $recettes = (float) $bookings->sum('total_price');
            $totalVoyageurs = (int) $bookings->sum('seats_count');
            $depenses = (float) Expense::where('status', 'approved')
                ->when($periode === 'mensuel', fn ($q) => $q->whereMonth('expense_date', Carbon::now()->month))
                ->when($periode === 'trimestriel', fn ($q) => $q->where('expense_date', '>=', Carbon::now()->subMonths(3)))
                ->when($periode === 'annuel', fn ($q) => $q->whereYear('expense_date', Carbon::now()->year))
                ->sum('amount');

            $pdf = Pdf::loadView('exports.rapport-pdf', [
                'rows' => $rows,
                'headers' => $headers,
                'periode' => $periode,
                'recettes' => $recettes,
                'depenses' => $depenses,
                'totalVoyageurs' => $totalVoyageurs,
                'dateGeneration' => Carbon::now()->format('d/m/Y H:i'),
            ]);

            return $pdf->download('rapport_rahimo_' . $periode . '.pdf');
        }

        return redirect()->back()->with('success', 'Export généré');
    }

    public function notifications()
    {
        return Inertia::render('Admin/Notifications');
    }

    public function sendNotification(Request $request)
    {
        $validated = $request->validate([
            'canal' => 'required|in:sms,email,whatsapp',
            'message' => 'required|string|max:500',
            'cible' => 'required|in:tous_clients,clients_actifs,clients_inactifs',
        ]);

        $query = User::forCurrentCompany()->where('role', 'client');
        if ($validated['cible'] === 'clients_actifs') {
            $query->whereNotNull('email_verified_at');
        } elseif ($validated['cible'] === 'clients_inactifs') {
            $query->whereNull('email_verified_at');
        }

        $users = $query->get();
        $count = 0;

        foreach ($users as $user) {
            $phone = $user->phone;
            if (!$phone) continue;

            app(NotificationService::class)->sendSms($phone, $validated['message']);
            $count++;
        }

        \App\Models\ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'notification_masse',
            'description' => "Notification {$validated['canal']} envoyée à {$count} clients via {$validated['cible']}",
        ]);

        return redirect()->route('admin.notifications')
            ->with('success', "Notification envoyée à {$count} clients.");
    }
}
