<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\CallsFrontApi;
use App\Http\Requests\VoyagesRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\View\View;
use Illuminate\Http\JsonResponse;

class VoyagesController extends Controller
{
    use CallsFrontApi;

    public function index(): View
    {
        try {
            $gare_id = Session::get('gare_id');
            $gare_nom = Session::get('gare_nom', 'Gare par défaut');
            if (!$gare_id || !is_numeric($gare_id)) {
                Log::error('gare_id non défini ou invalide dans la session', ['gare_id' => $gare_id]);
                return redirect()->route('login')->with('toast', [
                    'type' => 'error',
                    'title' => 'Erreur',
                    'message' => 'Session invalide. Veuillez vous reconnecter.',
                ]);
            }
            if (!is_string($gare_nom)) {
                Log::warning('gare_nom n\'est pas une chaîne', ['gare_nom' => $gare_nom]);
                $gare_nom = 'Gare par défaut';
            }

            $voyagesResponse = $this->api()->get($this->apiUrl('voyages'));
            $trajetsResponse = $this->api()->get($this->apiUrl('trajets'));
            $busResponse = $this->api()->get($this->apiUrl('bus'));
            $chauffeursResponse = $this->api()->get($this->apiUrl('chauffeurs'));

            if ($voyagesResponse->successful() && $trajetsResponse->successful() && $busResponse->successful() && $chauffeursResponse->successful()) {
                $voyages = $voyagesResponse->json();
                $trajets = $trajetsResponse->json();
                $bus = $busResponse->json();
                $chauffeurs = $chauffeursResponse->json();

                // Vérifier si les données sont imbriquées
                $voyages = isset($voyages['data']) ? $voyages['data'] : (is_array($voyages) ? $voyages : []);
                $trajets = isset($trajets['data']) ? $trajets['data'] : (is_array($trajets) ? $trajets : []);
                $bus = isset($bus['data']) ? $bus['data'] : (is_array($bus) ? $bus : []);
                $chauffeurs = isset($chauffeurs['data']) ? $chauffeurs['data'] : (is_array($chauffeurs) ? $chauffeurs : []);

                Log::info('Données récupérées:', [
                    'voyages' => $voyages,
                    'trajets' => $trajets,
                    'bus' => $bus,
                    'chauffeurs' => $chauffeurs,
                ]);

                return view('pages.voyages', compact('voyages', 'trajets', 'bus', 'chauffeurs', 'gare_id', 'gare_nom'));
            }

            Log::error('Échec de la récupération des données', [
                'voyages_status' => $voyagesResponse->status(),
                'trajets_status' => $trajetsResponse->status(),
                'bus_status' => $busResponse->status(),
                'chauffeurs_status' => $chauffeursResponse->status(),
                'voyages_body' => $voyagesResponse->body(),
                'trajets_body' => $trajetsResponse->body(),
                'bus_body' => $busResponse->body(),
                'chauffeurs_body' => $chauffeursResponse->body(),
            ]);

            return view('pages.voyages')->with('toast', [
                'type' => 'error',
                'title' => 'Erreur',
                'message' => 'Impossible de charger les voyages ou les données associées.',
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la récupération des voyages', ['error' => $e->getMessage()]);
            return view('pages.voyages')->with('toast', [
                'type' => 'error',
                'title' => 'Erreur réseau',
                'message' => 'Impossible de contacter le serveur.',
            ]);
        }
    }

    public function store(VoyagesRequest $request): JsonResponse
    {
        try {
            $payload = $request->validated();
            Log::info('Payload envoyé (store):', $payload);
            $response = $this->api()->post($this->apiUrl('voyages'), $payload);

            if ($response->successful()) {
                return response()->json(['message' => 'Voyage ajouté avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible d\'ajouter le voyage.';
            Log::error('Échec de l\'ajout du voyage', [
                'status' => $response->status(),
                'body' => $response->body(),
                'payload_sent' => $payload
            ]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de l\'ajout du voyage', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }

    public function update(VoyagesRequest $request, $id): JsonResponse
    {
        try {
            $payload = $request->validated();
            Log::info('Payload envoyé (update):', $payload);
            $response = $this->api()->put($this->apiUrl("voyages/$id"), $payload);

            if ($response->successful()) {
                return response()->json(['message' => 'Voyage modifié avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible de modifier le voyage.';
            Log::error('Échec de la modification du voyage', [
                'status' => $response->status(),
                'body' => $response->body(),
                'payload_sent' => $payload
            ]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la modification du voyage', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            $response = $this->api()->delete($this->apiUrl("voyages/$id"));

            if ($response->successful()) {
                return response()->json(['message' => 'Voyage supprimé avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible de supprimer le voyage.';
            Log::error('Échec de la suppression du voyage', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la suppression du voyage', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }
}