<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use Illuminate\Http\Request;


class AlertController extends Controller
{
    public function index()
    {
        $actives = Alert::with('vehicle')
            ->where('traitee', false)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($a) => $this->format($a));

        $traitees = Alert::with('vehicle')
            ->where('traitee', true)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(fn ($a) => $this->format($a));

        $stats = [
            'critiques' => Alert::where('traitee', false)->where('type', 'danger')->count(),
            'avertissements' => Alert::where('traitee', false)->where('type', 'warning')->count(),
            'infos' => Alert::where('traitee', false)->where('type', 'info')->count(),
            'traitees' => Alert::where('traitee', true)->count(),
        ];

        return response()->json([
            'actives' => $actives,
            'traitees' => $traitees,
            'stats' => $stats,
        ]);
    }

    public function traiter(Alert $alert)
    {
        $alert->markAsTreated();
        return back()->with('success', 'Alerte marquée comme traitée.');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:danger,warning,info',
            'categorie' => 'required|string|max:50',
            'titre' => 'required|string|max:255',
            'description' => 'required|string',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'trip_id' => 'nullable|exists:trips,id',
            'lieu' => 'nullable|string|max:255',
        ]);

        Alert::create($validated + [
            'severity' => $validated['type'] === 'danger' ? 'critical' : ($validated['type'] === 'warning' ? 'high' : 'low'),
            'source' => 'manual',
        ]);

        return back()->with('success', 'Alerte créée.');
    }

    public function format($a): array
    {
        return [
            'id' => $a->id,
            'type' => $a->type,
            'categorie' => $a->categorie,
            'titre' => $a->titre,
            'description' => $a->description,
            'severity' => $a->severity,
            'bus' => $a->vehicle?->registration_number,
            'lieu' => $a->lieu,
            'temps' => $a->created_at->diffForHumans(),
            'traitee' => $a->traitee,
            'created_at' => $a->created_at->format('c'),
        ];
    }
}
