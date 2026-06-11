<?php
namespace App\Http\Controllers\Api;

use App\Models\Colis;
use App\Http\Controllers\ColisController as WebController;
use Illuminate\Http\Request;

class ColisController extends WebController
{
    public function track(Request $request)
    {
        $colis = Colis::where('tracking_number', $request->tracking_number)->with('trip')->first();
        if (!$colis) return response()->json(['message' => 'Colis introuvable.'], 404);
        return response()->json(['colis' => (new WebController)->format($colis)]);
    }

    public function store(Request $request)
    {
        $r = parent::store($request);
        return request()->expectsJson()
            ? response()->json(['message' => 'Colis enregistré.'], 201)
            : $r;
    }

    public function adminIndex()
    {
        $colis = \App\Models\Colis::with('trip')->orderBy('created_at', 'desc')->get()->map(fn ($c) => $this->format($c));
        return response()->json(['colis' => $colis]);
    }

    public function adminStore(Request $request)
    {
        return $this->store($request);
    }

    public function updateStatus(Request $request, Colis $colis)
    {
        $r = parent::updateStatus($request, $colis);
        return request()->expectsJson()
            ? response()->json(['message' => 'Statut mis à jour.'])
            : $r;
    }
}
