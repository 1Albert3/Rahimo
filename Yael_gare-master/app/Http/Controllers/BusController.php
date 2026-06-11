<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\CallsFrontApi;
use App\Http\Requests\BusRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BusController extends Controller
{
    use CallsFrontApi;

    public function index()
    {
        try {
            $response = $this->api()->get($this->apiUrl('bus'));
            if ($response->successful()) {
                $bus = $response->json();
                return view('pages.bus', compact('bus'));
            }
            Log::error('Échec de la récupération des bus', ['status' => $response->status(), 'body' => $response->body()]);
            return view('pages.bus')->with('toast', [
                'type' => 'error',
                'title' => 'Erreur',
                'message' => 'Impossible de charger les bus.',
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la récupération des bus', ['error' => $e->getMessage()]);
            return view('pages.bus')->with('toast', [
                'type' => 'error',
                'title' => 'Erreur réseau',
                'message' => 'Impossible de contacter le serveur.',
            ]);
        }
    }

    public function store(BusRequest $request)
    {
        try {
            $payload = $request->validated();
            $response = $this->api()->post($this->apiUrl('bus'), $payload);
            
            if ($response->successful()) {
                return response()->json(['message' => 'Bus ajouté avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible d\'ajouter le bus.';
            Log::error('Échec de l\'ajout du bus', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de l\'ajout du bus', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }

    public function update(BusRequest $request, $id)
    {
        try {
            $payload = $request->validated();
            $response = $this->api()->put($this->apiUrl("bus/$id"), $payload);

            if ($response->successful()) {
                return response()->json(['message' => 'Bus modifié avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible de modifier le bus.';
            Log::error('Échec de la modification du bus', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la modification du bus', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $response = $this->api()->delete($this->apiUrl("bus/$id"));

            if ($response->successful()) {
                return response()->json(['message' => 'Bus supprimé avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible de supprimer le bus.';
            Log::error('Échec de la suppression du bus', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la suppression du bus', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }
}