<?php

namespace App\Http\Controllers;

use App\Models\Accommodation;
use App\Models\LostItem;
use App\Models\MotoTransport;
use App\Models\Parking;
use App\Models\Reclamation;
use App\Models\Rental;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServicesController extends Controller
{
    public function parking()
    {
        $parkings = Parking::with('user')
            ->latest()
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'vehicle_registration' => $p->vehicle_registration,
                'driver_name' => $p->driver_name,
                'driver_phone' => $p->driver_phone,
                'entry_date' => $p->entry_date?->format('Y-m-d H:i'),
                'exit_date' => $p->exit_date?->format('Y-m-d H:i'),
                'amount' => (float) $p->amount,
                'amount_paid' => (float) $p->amount_paid,
                'solde' => (float) $p->solde,
                'status' => $p->status,
                'notes' => $p->notes,
            ]);

        $stats = [
            'en_cours' => Parking::where('status', 'en_cours')->count(),
            'termine' => Parking::where('status', 'termine')->count(),
            'revenu' => (float) Parking::where('status', 'termine')->sum('amount'),
        ];

        return Inertia::render('Admin/Services/Parking', compact('parkings', 'stats'));
    }

    public function parkingStore(Request $request)
    {
        $validated = $request->validate([
            'vehicle_registration' => 'required|string|max:30',
            'driver_name' => 'required|string|max:255',
            'driver_phone' => 'required|string|max:20',
            'entry_date' => 'required|date',
            'exit_date' => 'nullable|date|after:entry_date',
            'amount' => 'required|numeric|min:0',
            'amount_paid' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['status'] = 'en_cours';

        Parking::create($validated);

        return redirect()->back()->with('success', 'Stationnement enregistré');
    }

    public function parkingSortir(Parking $parking)
    {
        $parking->update([
            'status' => 'termine',
            'exit_date' => now(),
        ]);

        return redirect()->back()->with('success', 'Sortie enregistrée');
    }

    public function location()
    {
        $rentals = Rental::with('user')
            ->latest()
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'type' => $r->type,
                'brand' => $r->brand,
                'model' => $r->model,
                'registration_number' => $r->registration_number,
                'rental_start' => $r->rental_start?->format('Y-m-d H:i'),
                'rental_end' => $r->rental_end?->format('Y-m-d H:i'),
                'amount_per_day' => (float) $r->amount_per_day,
                'total_amount' => (float) $r->total_amount,
                'deposit' => (float) $r->deposit,
                'status' => $r->status,
                'notes' => $r->notes,
            ]);

        $stats = [
            'en_cours' => Rental::where('status', 'en_cours')->count(),
            'termine' => Rental::where('status', 'termine')->count(),
            'revenu' => (float) Rental::where('status', 'termine')->sum('total_amount'),
        ];

        return Inertia::render('Admin/Services/Location', compact('rentals', 'stats'));
    }

    public function locationStore(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:voiture,moto',
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'registration_number' => 'nullable|string|max:30',
            'rental_start' => 'required|date',
            'rental_end' => 'nullable|date|after:rental_start',
            'amount_per_day' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'deposit' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['status'] = 'en_cours';

        Rental::create($validated);

        return redirect()->back()->with('success', 'Location enregistrée');
    }

    public function locationTerminer(Rental $rental)
    {
        $rental->update([
            'status' => 'termine',
            'rental_end' => now(),
        ]);

        return redirect()->back()->with('success', 'Location terminée');
    }

    public function hebergement()
    {
        $accommodations = Accommodation::with('user')
            ->latest()
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'guest_name' => $a->guest_name,
                'guest_phone' => $a->guest_phone,
                'check_in' => $a->check_in?->format('Y-m-d H:i'),
                'check_out' => $a->check_out?->format('Y-m-d H:i'),
                'room_type' => $a->room_type,
                'room_number' => $a->room_number,
                'amount_per_night' => (float) $a->amount_per_night,
                'total_amount' => (float) $a->total_amount,
                'status' => $a->status,
                'notes' => $a->notes,
            ]);

        $stats = [
            'en_cours' => Accommodation::where('status', 'en_cours')->count(),
            'reserve' => Accommodation::where('status', 'reserve')->count(),
            'termine' => Accommodation::where('status', 'termine')->count(),
            'revenu' => (float) Accommodation::where('status', 'termine')->sum('total_amount'),
        ];

        return Inertia::render('Admin/Services/Hebergement', compact('accommodations', 'stats'));
    }

    public function hebergementStore(Request $request)
    {
        $validated = $request->validate([
            'guest_name' => 'required|string|max:255',
            'guest_phone' => 'required|string|max:20',
            'check_in' => 'required|date',
            'check_out' => 'nullable|date|after:check_in',
            'room_type' => 'required|in:standard,vip,suite',
            'room_number' => 'nullable|string|max:10',
            'amount_per_night' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['status'] = 'reserve';

        Accommodation::create($validated);

        return redirect()->back()->with('success', 'Réservation enregistrée');
    }

    public function hebergementCheckin(Accommodation $accommodation)
    {
        $accommodation->update(['status' => 'en_cours']);

        return redirect()->back()->with('success', 'Check-in confirmé');
    }

    public function hebergementCheckout(Accommodation $accommodation)
    {
        $accommodation->update([
            'status' => 'termine',
            'check_out' => now(),
        ]);

        return redirect()->back()->with('success', 'Check-out effectué');
    }

    public function motoTransport()
    {
        $transports = MotoTransport::with('user')
            ->latest()
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'sender_name' => $m->sender_name,
                'sender_phone' => $m->sender_phone,
                'recipient_name' => $m->recipient_name,
                'recipient_phone' => $m->recipient_phone,
                'origin_city' => $m->origin_city,
                'destination_city' => $m->destination_city,
                'moto_brand' => $m->moto_brand,
                'moto_model' => $m->moto_model,
                'moto_registration' => $m->moto_registration,
                'amount' => (float) $m->amount,
                'status' => $m->status,
                'notes' => $m->notes,
            ]);

        $stats = [
            'en_attente' => MotoTransport::where('status', 'en_attente')->count(),
            'en_cours' => MotoTransport::where('status', 'en_cours')->count(),
            'livre' => MotoTransport::where('status', 'livre')->count(),
            'revenu' => (float) MotoTransport::where('status', 'livre')->sum('amount'),
        ];

        return Inertia::render('Admin/Services/MotoTransport', compact('transports', 'stats'));
    }

    public function motoTransportStore(Request $request)
    {
        $validated = $request->validate([
            'sender_name' => 'required|string|max:255',
            'sender_phone' => 'required|string|max:20',
            'recipient_name' => 'required|string|max:255',
            'recipient_phone' => 'required|string|max:20',
            'origin_city' => 'required|string|max:255',
            'destination_city' => 'required|string|max:255',
            'moto_brand' => 'required|string|max:255',
            'moto_model' => 'required|string|max:255',
            'moto_registration' => 'nullable|string|max:30',
            'amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['status'] = 'en_attente';

        MotoTransport::create($validated);

        return redirect()->back()->with('success', 'Transport moto enregistré');
    }

    public function motoTransportUpdateStatus(MotoTransport $motoTransport, Request $request)
    {
        $validated = $request->validate(['status' => 'required|in:en_attente,en_cours,livre,annule']);
        $motoTransport->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', 'Statut mis à jour');
    }

    // ─── Pages Publiques (LOT 2.4) ───────────────────────────────────────────

    public function publicIndex()
    {
        return Inertia::render('Services/Index');
    }

    public function publicParking()
    {
        return Inertia::render('Services/Parking');
    }

    public function publicParkingStore(Request $request)
    {
        $validated = $request->validate([
            'vehicle_registration' => 'required|string|max:30',
            'driver_name' => 'required|string|max:255',
            'driver_phone' => 'required|string|max:20',
        ]);

        $validated['user_id'] = $request->user()?->id;
        $validated['entry_date'] = now();
        $validated['status'] = 'en_cours';
        $validated['amount'] = 0;
        $validated['amount_paid'] = 0;

        Parking::create($validated);

        return redirect()->route('services.public.parking')->with('success', 'Stationnement enregistré. Veuillez vous présenter à l\'accueil.');
    }

    public function publicLocation()
    {
        $types = [
            ['key' => 'voiture', 'label' => 'Voiture', 'icon' => 'Car', 'desc' => 'Berlines, 4x4, minibus'],
            ['key' => 'moto', 'label' => 'Moto', 'icon' => 'Bike', 'desc' => 'Motos et scooters'],
        ];
        return Inertia::render('Services/Location', compact('types'));
    }

    public function publicLocationStore(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:voiture,moto',
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'registration_number' => 'nullable|string|max:30',
            'rental_start' => 'required|date',
            'rental_end' => 'nullable|date|after:rental_start',
            'amount_per_day' => 'required|numeric|min:0',
            'deposit' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()?->id;
        $validated['status'] = 'en_cours';
        $validated['total_amount'] = (float) $validated['amount_per_day'];

        Rental::create($validated);

        return redirect()->route('services.public.location')->with('success', 'Demande de location envoyée. Nous vous contacterons sous 24h.');
    }

    public function publicHebergement()
    {
        return Inertia::render('Services/Hebergement');
    }

    public function publicHebergementStore(Request $request)
    {
        $validated = $request->validate([
            'guest_name' => 'required|string|max:255',
            'guest_phone' => 'required|string|max:20',
            'check_in' => 'required|date',
            'check_out' => 'nullable|date|after:check_in',
            'room_type' => 'required|in:standard,vip,suite',
            'amount_per_night' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()?->id;
        $validated['status'] = 'reserve';
        $validated['total_amount'] = (float) $validated['amount_per_night'];

        Accommodation::create($validated);

        return redirect()->route('services.public.hebergement')->with('success', 'Réservation effectuée. Un agent vous contactera pour confirmation.');
    }

    public function publicMoto()
    {
        return Inertia::render('Services/MotoTransport');
    }

    public function publicMotoStore(Request $request)
    {
        $validated = $request->validate([
            'sender_name' => 'required|string|max:255',
            'sender_phone' => 'required|string|max:20',
            'recipient_name' => 'required|string|max:255',
            'recipient_phone' => 'required|string|max:20',
            'origin_city' => 'required|string|max:255',
            'destination_city' => 'required|string|max:255',
            'moto_brand' => 'required|string|max:255',
            'moto_model' => 'required|string|max:255',
            'moto_registration' => 'nullable|string|max:30',
            'notes' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()?->id;
        $validated['status'] = 'en_attente';
        $validated['amount'] = 0;

        MotoTransport::create($validated);

        return redirect()->route('services.public.moto')->with('success', 'Demande de transport moto enregistrée. Estimation envoyée sous 24h.');
    }

    // ─── Réclamations Publiques ──────────────────────────────────────────────

    public function publicReclamations(Request $request)
    {
        $myReclamations = [];
        if ($phone = $request->query('phone')) {
            $myReclamations = Reclamation::where('client_phone', $phone)
                ->latest()
                ->get()
                ->map(fn ($r) => [
                    'id' => $r->id,
                    'code' => $r->code,
                    'type' => $r->type,
                    'description' => $r->description,
                    'statut' => $r->statut,
                    'response' => $r->response,
                    'created_at' => $r->created_at?->format('Y-m-d H:i'),
                    'treated_at' => $r->treated_at?->format('Y-m-d H:i'),
                ]);
        }

        return Inertia::render('Services/Reclamations', [
            'myReclamations' => $myReclamations,
        ]);
    }

    public function publicReclamationsStore(Request $request)
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'client_phone' => 'required|string|max:20',
            'type' => 'required|string|max:50',
            'description' => 'required|string',
        ]);

        $last = Reclamation::latest()->first();
        $num = $last ? ((int) substr($last->code, -4)) + 1 : 1;
        $code = 'REC-' . date('Y') . '-' . str_pad($num, 4, '0', STR_PAD_LEFT);

        Reclamation::create([
            'code' => $code,
            'client_name' => $validated['client_name'],
            'client_phone' => $validated['client_phone'],
            'type' => $validated['type'],
            'description' => $validated['description'],
            'priorite' => Reclamation::PRIORITE_MOYENNE,
            'statut' => Reclamation::STATUT_EN_ATTENTE,
        ]);

        return redirect()->route('services.public.reclamations', ['phone' => $validated['client_phone']])
            ->with('success', "Réclamation enregistrée. Votre code : {$code}");
    }

    // ─── Objets Trouvés ──────────────────────────────────────────────────────

    public function publicLostAndFound()
    {
        $foundItems = LostItem::whereIn('status', [LostItem::STATUS_RETROUVE])
            ->latest()
            ->get()
            ->map(fn ($i) => [
                'id' => $i->id,
                'type' => $i->type,
                'description' => $i->description,
                'trip_info' => $i->trip_info,
                'photo_url' => $i->photo_url,
                'created_at' => $i->created_at?->format('Y-m-d'),
            ]);

        return Inertia::render('Services/LostAndFound', [
            'foundItems' => $foundItems,
        ]);
    }

    public function publicLostAndFoundStore(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|max:50',
            'reported_by_name' => 'required|string|max:255',
            'reported_by_phone' => 'required|string|max:20',
            'trip_info' => 'nullable|string|max:255',
            'description' => 'required|string',
        ]);

        $validated['status'] = LostItem::STATUS_PERDU;

        LostItem::create($validated);

        return redirect()->route('services.public.lost-and-found')
            ->with('success', 'Objet signalé. Nous vous contacterons si nous retrouvons votre bien.');
    }

    // ─── Admin Objets Trouvés ────────────────────────────────────────────────

    public function adminLostItems()
    {
        $items = LostItem::latest()->get()->map(fn ($i) => [
            'id' => $i->id,
            'type' => $i->type,
            'reported_by_name' => $i->reported_by_name,
            'reported_by_phone' => $i->reported_by_phone,
            'trip_info' => $i->trip_info,
            'description' => $i->description,
            'status' => $i->status,
            'photo_url' => $i->photo_url,
            'admin_notes' => $i->admin_notes,
            'created_at' => $i->created_at?->format('Y-m-d H:i'),
        ]);

        return Inertia::render('Admin/LostItems', [
            'items' => $items,
        ]);
    }

    public function adminLostItemUpdate(Request $request, LostItem $lostItem)
    {
        $validated = $request->validate([
            'status' => 'required|in:perdu,retrouve,rendu',
            'admin_notes' => 'nullable|string',
        ]);

        $lostItem->update($validated);

        return back()->with('success', 'Objet mis à jour.');
    }

    public function adminLostItemPhoto(Request $request, LostItem $lostItem)
    {
        $validated = $request->validate([
            'photo' => 'required|image|max:5120',
        ]);

        $path = $validated['photo']->store('lost-items', 'public');
        $lostItem->update(['photo_url' => \Illuminate\Support\Facades\Storage::url($path)]);

        return back()->with('success', 'Photo ajoutée.');
    }
}
