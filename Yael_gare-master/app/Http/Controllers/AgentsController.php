<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\CallsFrontApi;
use App\Http\Requests\AgentsRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AgentsController extends Controller
{
    use CallsFrontApi;

    public function index()
    {
        try {
            $response = $this->api()->get($this->apiUrl('agents'));
            if ($response->successful()) {
                $agents = $response->json();
                return view('pages.agents', compact('agents'));
            }
            Log::error('Échec de la récupération des agents', ['status' => $response->status(), 'body' => $response->body()]);
            return view('pages.agents')->with('toast', [
                'type' => 'error',
                'title' => 'Erreur',
                'message' => 'Impossible de charger les agents.',
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la récupération des agents', ['error' => $e->getMessage()]);
            return view('pages.agents')->with('toast', [
                'type' => 'error',
                'title' => 'Erreur réseau',
                'message' => 'Impossible de contacter le serveur.',
            ]);
        }
    }

    public function store(AgentsRequest $request)
    {
        try {
            $payload = $request->validated();
            $response = $this->api()->post($this->apiUrl('agents'), $payload);
            
            if ($response->successful()) {
                return response()->json(['message' => 'Agent ajouté avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible d\'ajouter l\'agent.';
            Log::error('Échec de l\'ajout de l\'agent', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de l\'ajout de l\'agent', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }

    public function update(AgentsRequest $request, $id)
    {
        try {
            $payload = $request->validated();
            $response = $this->api()->put($this->apiUrl("agents/$id"), $payload);

            if ($response->successful()) {
                return response()->json(['message' => 'Agent modifié avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible de modifier l\'agent.';
            Log::error('Échec de la modification de l\'agent', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la modification de l\'agent', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $response = $this->api()->delete($this->apiUrl("agents/$id"));

            if ($response->successful()) {
                return response()->json(['message' => 'Agent supprimé avec succès.']);
            }

            $message = $response->json('error') ?? 'Impossible de supprimer l\'agent.';
            Log::error('Échec de la suppression de l\'agent', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['message' => $message], $response->status());
        } catch (\Exception $e) {
            Log::error('Erreur réseau lors de la suppression de l\'agent', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de contacter le serveur.'], 500);
        }
    }
}