<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\CallsFrontApi;
use App\Http\Requests\DestinationsRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DestinationsController extends Controller
{
    use CallsFrontApi;

    public function index()
    {
        try {
            $response = $this->api()->get($this->apiUrl('destinations'));
            if ($response->successful()) {
                $destinations = $response->json();
                return view('pages.destinations', compact('destinations'));
            }
            Log::error('Échec de la récupération des destinations', ['status' => $response->status(), 'body' => $response->body()]);
            return view('pages.destinations')->with('toast', [
                'type' => 'error',
                'title' => 'Erreur',
                'message' => 'Impossible de charger les destinations.',
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la récupération des destinations', ['error' => $e->getMessage()]);
            return view('pages.destinations')->with('toast', [
                'type' => 'error',
                'title' => 'Erreur réseau',
                'message' => 'Impossible de contacter le serveur.',
            ]);
        }
    }

    public function store(DestinationsRequest $request)
    {
        try {
            $payload = $request->validated();
            $response = $this->api()->post($this->apiUrl('destinations'), $payload);
            
            if ($response->successful()) {
                return response()->json(['message' => 'Destination ajoutée avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible d\'ajouter la destination.';
            Log::error('Échec de l\'ajout de la destination', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de l\'ajout de la destination', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }

    public function update(DestinationsRequest $request, $id)
    {
        try {
            $payload = $request->validated();
            $response = $this->api()->put($this->apiUrl("destinations/$id"), $payload);

            if ($response->successful()) {
                return response()->json(['message' => 'Destination modifiée avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible de modifier la destination.';
            Log::error('Échec de la modification de la destination', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la modification de la destination', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $response = $this->api()->delete($this->apiUrl("destinations/$id"));

            if ($response->successful()) {
                return response()->json(['message' => 'Destination supprimée avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible de supprimer la destination.';
            Log::error('Échec de la suppression de la destination', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la suppression de la destination', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }
}