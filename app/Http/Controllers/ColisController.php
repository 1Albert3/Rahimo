<?php

namespace App\Http\Controllers;

use App\Models\Colis;
use App\Models\Trip;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ColisController extends Controller
{
    public function index()
    {
        $colis = Colis::with('trip')->orderBy('created_at', 'desc')->get()->map(fn ($c) => $this->format($c));

        return Inertia::render('Admin/Colis', [
            'colis_list' => $colis,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'expediteur_name' => 'required|string|max:255',
            'expediteur_phone' => 'required|string|max:20',
            'destinataire_name' => 'required|string|max:255',
            'destinataire_phone' => 'required|string|max:20',
            'departure_city' => 'required|string|max:255',
            'arrival_city' => 'required|string|max:255',
            'destination_address' => 'nullable|string|max:500',
            'weight' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'type' => 'required|in:colis,bagage,marchandise,fragile',
            'price' => 'required|numeric|min:0',
            'payment_on_delivery' => 'boolean',
            'trip_id' => 'nullable|exists:trips,id',
            'notes' => 'nullable|string',
        ]);

        $validated['payment_on_delivery'] = $request->boolean('payment_on_delivery');
        if (Auth::check()) {
            $validated['user_id'] = Auth::id();
        }

        $colis = Colis::create($validated);

        $colis->addStatusEntry(Colis::STATUS_EN_ATTENTE, $colis->departure_city);

        app(NotificationService::class)->sendColisStatus(
            $colis->expediteur_phone,
            $colis->tracking_number,
            $colis->status
        );

        $redirectTo = $request->input('_redirect', back()->getTargetUrl());

        return redirect($redirectTo)->with('success', 'Colis enregistré. Numéro de suivi : ' . $colis->tracking_number);
    }

    public function sendForm()
    {
        $trips = Trip::where('departure_date', '>=', now()->toDateString())
            ->where('available_seats', '>', 0)
            ->orderBy('departure_date')
            ->orderBy('departure_time')
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'label' => "{$t->departure_city} → {$t->arrival_city} · {$t->departure_date} {$t->departure_time?->format('H:i')}",
                'departure_city' => $t->departure_city,
                'arrival_city' => $t->arrival_city,
                'price' => (int) $t->price,
            ]);

        return Inertia::render('Colis/Send', [
            'trips' => $trips,
        ]);
    }

    public function track(Request $request)
    {
        $colis = null;

        if ($request->has('tracking_number')) {
            $validated = $request->validate([
                'tracking_number' => 'required|string|max:30',
            ]);

            $colis = Colis::byTrackingNumber($validated['tracking_number'])->with('trip')->first();
        }

        return Inertia::render('Colis/Track', [
            'colis' => $colis ? $this->format($colis) : null,
        ]);
    }

    public function updateStatus(Request $request, Colis $colis)
    {
        $validated = $request->validate([
            'status' => 'required|in:en_attente,en_cours,en_transit,livre,retarde',
            'location' => 'nullable|string|max:255',
        ]);

        $colis->update(['status' => $validated['status']]);

        $colis->addStatusEntry($validated['status'], $validated['location'] ?? $colis->departure_city);

        if ($validated['status'] === Colis::STATUS_LIVRE) {
            $colis->update(['livraison_date' => now()]);
        }

        app(NotificationService::class)->sendColisStatus(
            $colis->expediteur_phone,
            $colis->tracking_number,
            $colis->status
        );

        return back()->with('success', 'Statut mis à jour.');
    }

    public function uploadPhoto(Request $request, Colis $colis)
    {
        $validated = $request->validate([
            'photo' => 'required|image|max:5120',
        ]);

        $path = $validated['photo']->store('colis-photos', 'public');

        $photos = $colis->photos ?? [];
        $photos[] = Storage::url($path);
        $colis->update(['photos' => $photos]);

        return back()->with('success', 'Photo ajoutée.');
    }

    private function format($colis): array
    {
        $timeline = [];
        $statusLabels = [
            'en_attente' => ['label' => 'Enregistré', 'icon' => 'Package'],
            'en_cours' => ['label' => 'Prise en charge', 'icon' => 'Truck'],
            'en_transit' => ['label' => 'En transit', 'icon' => 'Navigation'],
            'livre' => ['label' => 'Livré', 'icon' => 'CheckCircle'],
            'retarde' => ['label' => 'Retardé', 'icon' => 'AlertTriangle'],
        ];

        $history = $colis->getStatusTimeline();
        if (!empty($history)) {
            foreach ($history as $entry) {
                $s = $statusLabels[$entry['status']] ?? ['label' => $entry['status'], 'icon' => 'Circle'];
                $timeline[] = [
                    'status' => $entry['status'],
                    'label' => $s['label'],
                    'icon' => $s['icon'],
                    'date' => $entry['date'],
                    'location' => $entry['location'] ?? null,
                ];
            }
        } else {
            $timeline[] = [
                'status' => $colis->status,
                'label' => $statusLabels[$colis->status]['label'] ?? $colis->status,
                'icon' => $statusLabels[$colis->status]['icon'] ?? 'Circle',
                'date' => $colis->created_at?->toIso8601String(),
                'location' => $colis->departure_city,
            ];
        }

        return [
            'id' => $colis->id,
            'tracking_number' => $colis->tracking_number,
            'expediteur_name' => $colis->expediteur_name,
            'expediteur_phone' => $colis->expediteur_phone,
            'destinataire_name' => $colis->destinataire_name,
            'destinataire_phone' => $colis->destinataire_phone,
            'departure_city' => $colis->departure_city,
            'arrival_city' => $colis->arrival_city,
            'destination_address' => $colis->destination_address,
            'weight' => $colis->weight ? (float) $colis->weight : null,
            'description' => $colis->description,
            'type' => $colis->type,
            'status' => $colis->status,
            'payment_on_delivery' => $colis->payment_on_delivery,
            'photos' => $colis->photos ?? [],
            'price' => (float) $colis->price,
            'notes' => $colis->notes,
            'expedition_date' => $colis->expedition_date?->format('c'),
            'livraison_date' => $colis->livraison_date?->format('c'),
            'timeline' => $timeline,
        ];
    }
}