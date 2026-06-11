<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\CallsFrontApi;
use App\Http\Requests\HorairesRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HorairesController extends Controller
{
    use CallsFrontApi;

    public function index()
    {
        try {
            $response = $this->api()->get($this->apiUrl('horaires'));
            if ($response->successful()) {
                $horaires = $response->json();
                return view('pages.horaires', compact('horaires'));
            }
            Log::error('Échec de la récupération des horaires', ['status' => $response->status(), 'body' => $response->body()]);
            return view('pages.horaires')->with('toast', [
                'type' => 'error',
                'title' => 'Erreur',
                'message' => 'Impossible de charger les horaires.',
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la récupération des horaires', ['error' => $e->getMessage()]);
            return view('pages.horaires')->with('toast', [
                'type' => 'error',
                'title' => 'Erreur réseau',
                'message' => 'Impossible de contacter le serveur.',
            ]);
        }
    }

    public function store(HorairesRequest $request)
    {
        try {
            $payload = $request->validated();
            $response = $this->api()->post($this->apiUrl('horaires'), $payload);
            
            if ($response->successful()) {
                return response()->json(['message' => 'Horaire ajouté avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible d\'ajouter l\'horaire.';
            Log::error('Échec de l\'ajout de l\'horaire', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de l\'ajout de l\'horaire', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }

    public function update(HorairesRequest $request, $id)
    {
        try {
            $payload = $request->validated();
            $response = $this->api()->put($this->apiUrl("horaires/$id"), $payload);

            if ($response->successful()) {
                return response()->json(['message' => 'Horaire modifié avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible de modifier l\'horaire.';
            Log::error('Échec de la modification de l\'horaire', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la modification de l\'horaire', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $response = $this->api()->delete($this->apiUrl("horaires/$id"));

            if ($response->successful()) {
                return response()->json(['message' => 'Horaire supprimé avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible de supprimer l\'horaire.';
            Log::error('Échec de la suppression de l\'horaire', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la suppression de l\'horaire', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }
}