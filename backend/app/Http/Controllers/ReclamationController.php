<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Reclamation;
use Illuminate\Http\Request;


class ReclamationController extends Controller
{
    protected function generateCode(): string
    {
        $last = Reclamation::latest()->first();
        $num = $last ? ((int) substr($last->code, -4)) + 1 : 1;
        return 'REC-' . date('Y') . '-' . str_pad($num, 4, '0', STR_PAD_LEFT);
    }

    public function index()
    {
        $reclamations = Reclamation::with('treatedBy')
            ->latest()
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'code' => $r->code,
                'client_name' => $r->client_name,
                'client_phone' => $r->client_phone,
                'type' => $r->type,
                'description' => $r->description,
                'priorite' => $r->priorite,
                'statut' => $r->statut,
                'response' => $r->response,
                'created_at' => $r->created_at?->format('Y-m-d H:i'),
                'treated_at' => $r->treated_at?->format('Y-m-d H:i'),
                'treated_by_name' => $r->treatedBy?->name,
            ]);

        $stats = [
            'en_attente' => Reclamation::where('statut', 'en_attente')->count(),
            'en_cours' => Reclamation::where('statut', 'en_cours')->count(),
            'resolue' => Reclamation::where('statut', 'resolue')->count(),
            'total' => Reclamation::count(),
        ];

        $__data = compact('reclamations', 'stats');
        if (request()->expectsJson()) return response()->json($__data);
        return response()->json($__data);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'client_phone' => 'required|string|max:20',
            'type' => 'required|string|max:50',
            'description' => 'required|string',
            'priorite' => 'required|in:haute,moyenne,basse',
        ]);

        $validated['code'] = $this->generateCode();
        $validated['user_id'] = $request->user()->id;
        $validated['statut'] = 'en_attente';

        Reclamation::create($validated);

        return redirect()->back()->with('success', 'Réclamation enregistrée');
    }

    public function updateStatus(Request $request, Reclamation $reclamation)
    {
        $validated = $request->validate([
            'statut' => 'required|in:en_attente,en_cours,resolue,fermee',
            'response' => 'nullable|string',
        ]);

        $reclamation->update([
            'statut' => $validated['statut'],
            'response' => $validated['response'] ?? $reclamation->response,
            'treated_by' => in_array($validated['statut'], ['resolue', 'fermee']) ? $request->user()->id : $reclamation->treated_by,
            'treated_at' => in_array($validated['statut'], ['resolue', 'fermee']) ? now() : $reclamation->treated_at,
        ]);

        return redirect()->back()->with('success', 'Réclamation mise à jour');
    }
}
