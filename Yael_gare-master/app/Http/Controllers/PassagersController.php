<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\CallsFrontApi;
use App\Http\Requests\PassagersRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\View\View;
use Illuminate\Http\JsonResponse;

class PassagersController extends Controller
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

            $passagersResponse = $this->api()->get($this->apiUrl('passagers'));
            $trajetsResponse = $this->api()->get($this->apiUrl('trajets'));

            if ($passagersResponse->successful() && $trajetsResponse->successful()) {
                $passagers = $passagersResponse->json();
                $trajets = $trajetsResponse->json();

                // Handle nested data
                $passagers = isset($passagers['data']) ? $passagers['data'] : (is_array($passagers) ? $passagers : []);
                $trajets = isset($trajets['data']) ? $trajets['data'] : (is_array($trajets) ? $trajets : []);

                Log::info('Données récupérées:', [
                    'passagers' => $passagers,
                    'trajets' => $trajets,
                ]);

                return view('pages.passagers', compact('passagers', 'trajets', 'gare_id', 'gare_nom'));
            }

            Log::error('Échec de la récupération des données', [
                'passagers_status' => $passagersResponse->status(),
                'trajets_status' => $trajetsResponse->status(),
                'passagers_body' => $passagersResponse->body(),
                'trajets_body' => $trajetsResponse->body(),
            ]);

            return view('pages.passagers')->with('toast', [
                'type' => 'error',
                'title' => 'Erreur',
                'message' => 'Impossible de charger les passagers ou les trajets.',
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la récupération des passagers', ['error' => $e->getMessage()]);
            return view('pages.passagers')->with('toast', [
                'type' => 'error',
                'title' => 'Erreur réseau',
                'message' => 'Impossible de contacter le serveur.',
            ]);
        }
    }

    public function store(PassagersRequest $request): JsonResponse
    {
        try {
            $payload = $request->validated();
            Log::info('Payload envoyé (store):', $payload);
            $response = $this->api()->post($this->apiUrl('passagers'), $payload);

            if ($response->successful()) {
                return response()->json(['message' => 'Passager ajouté avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible d\'ajouter le passager.';
            Log::error('Échec de l\'ajout du passager', [
                'status' => $response->status(),
                'body' => $response->body(),
                'payload_sent' => $payload
            ]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de l\'ajout du passager', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }

    public function update(PassagersRequest $request, $id): JsonResponse
    {
        try {
            $payload = $request->validated();
            Log::info('Payload envoyé (update):', $payload);
            $response = $this->api()->put($this->apiUrl("passagers/$id"), $payload);

            if ($response->successful()) {
                return response()->json(['message' => 'Passager modifié avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible de modifier le passager.';
            Log::error('Échec de la modification du passager', [
                'status' => $response->status(),
                'body' => $response->body(),
                'payload_sent' => $payload
            ]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la modification du passager', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            Log::info('Tentative de suppression passager:', ['id' => $id, 'gare_id' => Session::get('gare_id')]);
            $response = $this->api()->delete($this->apiUrl("passagers/$id"));

            if ($response->successful()) {
                return response()->json(['message' => 'Passager supprimé avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible de supprimer le passager.';
            Log::error('Échec de la suppression du passager', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la suppression du passager', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }
}