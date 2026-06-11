<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\CallsFrontApi;
use App\Http\Requests\TrajetsRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class TrajetsController extends Controller
{
    use CallsFrontApi;

    public function index()
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

            $trajetsResponse = $this->api()->get($this->apiUrl('trajets'));
            $destinationsResponse = $this->api()->get($this->apiUrl('destinations'));
            $horairesResponse = $this->api()->get($this->apiUrl('horaires'));

            if ($trajetsResponse->successful() && $destinationsResponse->successful() && $horairesResponse->successful()) {
                $trajets = $trajetsResponse->json();
                $destinations = $destinationsResponse->json();
                $horaires = $horairesResponse->json();

                // Vérifier si les données sont imbriquées
                $trajets = isset($trajets['data']) ? $trajets['data'] : (is_array($trajets) ? $trajets : []);
                $destinations = isset($destinations['data']) ? $destinations['data'] : (is_array($destinations) ? $destinations : []);
                $horaires = isset($horaires['data']) ? $horaires['data'] : (is_array($horaires) ? $horaires : []);

                // Convertir duree en format HH:MM
                foreach ($trajets as &$trajet) {
                    if (isset($trajet['duree']) && is_array($trajet['duree'])) {
                        $hours = isset($trajet['duree']['hours']) ? str_pad($trajet['duree']['hours'], 2, '0', STR_PAD_LEFT) : '00';
                        $minutes = isset($trajet['duree']['minutes']) ? str_pad($trajet['duree']['minutes'], 2, '0', STR_PAD_LEFT) : '00';
                        $trajet['duree'] = "$hours:$minutes";
                    } else {
                        $trajet['duree'] = $trajet['duree'] ?? 'Inconnue';
                    }
                }
                unset($trajet);

                Log::info('Trajets après conversion:', ['trajets' => $trajets]);
                Log::info('Destinations:', ['destinations' => $destinations]);
                Log::info('Horaires:', ['horaires' => $horaires]);

                return view('pages.trajets', compact('trajets', 'destinations', 'horaires', 'gare_nom', 'gare_id'));
            }

            Log::error('Échec de la récupération des données', [
                'trajets_status' => $trajetsResponse->status(),
                'destinations_status' => $destinationsResponse->status(),
                'horaires_status' => $horairesResponse->status(),
                'trajets_body' => $trajetsResponse->body(),
                'destinations_body' => $destinationsResponse->body(),
                'horaires_body' => $horairesResponse->body(),
            ]);

            return view('pages.trajets')->with('toast', [
                'type' => 'error',
                'title' => 'Erreur',
                'message' => 'Impossible de charger les trajets ou les données associées.',
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la récupération des trajets', ['error' => $e->getMessage()]);
            return view('pages.trajets')->with('toast', [
                'type' => 'error',
                'title' => 'Erreur réseau',
                'message' => 'Impossible de contacter le serveur.',
            ]);
        }
    }

    public function store(TrajetsRequest $request)
    {
        try {
            $payload = $request->validated();
            $payload['depart_gare_id'] = Session::get('gare_id'); // Forcer l'ID de la gare de la session
            Log::info('Payload envoyé (store):', $payload);
            $response = $this->api()->post($this->apiUrl('trajets'), $payload);

            if ($response->successful()) {
                return response()->json(['message' => 'Trajet ajouté avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible d\'ajouter le trajet.';
            Log::error('Échec de l\'ajout du trajet', [
                'status' => $response->status(),
                'body' => $response->body(),
                'payload_sent' => $payload
            ]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de l\'ajout du trajet', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }

    public function update(TrajetsRequest $request, $id)
    {
        try {
            $payload = $request->validated();
            $payload['depart_gare_id'] = Session::get('gare_id'); // Forcer l'ID de la gare de la session
            Log::info('Payload envoyé (update):', $payload);
            $response = $this->api()->put($this->apiUrl("trajets/$id"), $payload);

            if ($response->successful()) {
                return response()->json(['message' => 'Trajet modifié avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible de modifier le trajet.';
            Log::error('Échec de la modification du trajet', [
                'status' => $response->status(),
                'body' => $response->body(),
                'payload_sent' => $payload
            ]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la modification du trajet', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $response = $this->api()->delete($this->apiUrl("trajets/$id"));

            if ($response->successful()) {
                return response()->json(['message' => 'Trajet supprimé avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible de supprimer le trajet.';
            Log::error('Échec de la suppression du trajet', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la suppression du trajet', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }
}