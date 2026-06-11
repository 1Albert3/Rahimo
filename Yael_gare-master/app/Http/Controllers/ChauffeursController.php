<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\CallsFrontApi;
use App\Http\Requests\ChauffeursRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChauffeursController extends Controller
{
    use CallsFrontApi;

    public function index()
    {
        try {
            $response = $this->api()->get($this->apiUrl('chauffeurs'));
            if ($response->successful()) {
                $chauffeurs = $response->json();
                return view('pages.chauffeurs', compact('chauffeurs'));
            }
            Log::error('Échec de la récupération des chauffeurs', ['status' => $response->status(), 'body' => $response->body()]);
            return view('pages.chauffeurs')->with('toast', [
                'type' => 'error',
                'title' => 'Erreur',
                'message' => 'Impossible de charger les chauffeurs.',
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la récupération des chauffeurs', ['error' => $e->getMessage()]);
            return view('pages.chauffeurs')->with('toast', [
                'type' => 'error',
                'title' => 'Erreur réseau',
                'message' => 'Impossible de contacter le serveur.',
            ]);
        }
    }

    public function store(ChauffeursRequest $request)
    {
        try {
            $payload = $request->validated();
            $response = $this->api()->post($this->apiUrl('chauffeurs'), $payload);
            
            if ($response->successful()) {
                return response()->json(['message' => 'Chauffeur ajouté avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible d\'ajouter le chauffeur.';
            Log::error('Échec de l\'ajout du chauffeur', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de l\'ajout du chauffeur', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }

    public function update(ChauffeursRequest $request, $id)
    {
        try {
            $payload = $request->validated();
            $response = $this->api()->put($this->apiUrl("chauffeurs/$id"), $payload);

            if ($response->successful()) {
                return response()->json(['message' => 'Chauffeur modifié avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible de modifier le chauffeur.';
            Log::error('Échec de la modification du chauffeur', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la modification du chauffeur', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $response = $this->api()->delete($this->apiUrl("chauffeurs/$id"));

            if ($response->successful()) {
                return response()->json(['message' => 'Chauffeur supprimé avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible de supprimer le chauffeur.';
            Log::error('Échec de la suppression du chauffeur', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la suppression du chauffeur', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }
}