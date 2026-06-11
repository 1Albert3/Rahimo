<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\CallsFrontApi;
use App\Http\Requests\ReservationsRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\View\View;
use Illuminate\Http\JsonResponse;

class ReservationsController extends Controller
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

            $reservationsResponse = $this->api()->get($this->apiUrl('reservations'));
            $voyagesResponse = $this->api()->get($this->apiUrl('voyages'));

            if ($reservationsResponse->successful() && $voyagesResponse->successful()) {
                $reservations = $reservationsResponse->json();
                $voyages = $voyagesResponse->json();

                // Vérifier si les données sont imbriquées
                $reservations = isset($reservations['data']) ? $reservations['data'] : (is_array($reservations) ? $reservations : []);
                $voyages = isset($voyages['data']) ? $voyages['data'] : (is_array($voyages) ? $voyages : []);

                Log::info('Données récupérées:', [
                    'reservations' => $reservations,
                    'voyages' => $voyages,
                    'gare_id' => $gare_id,
                    'gare_nom' => $gare_nom,
                ]);

                return view('pages.reservations', compact('reservations', 'voyages', 'gare_id', 'gare_nom'));
            }

            Log::error('Échec de la récupération des données', [
                'reservations_status' => $reservationsResponse->status(),
                'voyages_status' => $voyagesResponse->status(),
                'reservations_body' => $reservationsResponse->body(),
                'voyages_body' => $voyagesResponse->body(),
            ]);

            return view('pages.reservations')->with('toast', [
                'type' => 'error',
                'title' => 'Erreur',
                'message' => 'Impossible de charger les réservations ou les voyages.',
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la récupération des réservations', ['error' => $e->getMessage()]);
            return view('pages.reservations')->with('toast', [
                'type' => 'error',
                'title' => 'Erreur réseau',
                'message' => 'Impossible de contacter le serveur.',
            ]);
        }
    }

    public function store(ReservationsRequest $request): JsonResponse
    {
        try {
            $payload = $request->validated();
            Log::info('Payload envoyé (store):', $payload);
            $response = $this->api()->post($this->apiUrl('reservations'), $payload);

            if ($response->successful()) {
                return response()->json(['message' => 'Réservation ajoutée avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible d\'ajouter la réservation.';
            Log::error('Échec de l\'ajout de la réservation', [
                'status' => $response->status(),
                'body' => $response->body(),
                'payload_sent' => $payload
            ]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de l\'ajout de la réservation', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }

    public function update(ReservationsRequest $request, $id): JsonResponse
    {
        try {
            $payload = $request->validated();
            Log::info('Payload envoyé (update):', $payload);
            $response = $this->api()->put($this->apiUrl("reservations/$id"), $payload);

            if ($response->successful()) {
                return response()->json(['message' => 'Réservation modifiée avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible de modifier la réservation.';
            Log::error('Échec de la modification de la réservation', [
                'status' => $response->status(),
                'body' => $response->body(),
                'payload_sent' => $payload
            ]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la modification de la réservation', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            $response = $this->api()->delete($this->apiUrl("reservations/$id"));

            if ($response->successful()) {
                return response()->json(['message' => 'Réservation supprimée avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible de supprimer la réservation.';
            Log::error('Échec de la suppression de la réservation', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la suppression de la réservation', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }
}