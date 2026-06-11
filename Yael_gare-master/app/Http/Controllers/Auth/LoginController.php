<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class LoginController extends Controller
{
    public function authenticate(LoginRequest $request): RedirectResponse
    {
        $payload = $request->validated();

        $base = rtrim(config('services.front.api_base_url'), '/'); // ex: http://localhost:5000/api
        $url  = $base . '/gares/login';

        try {
            $response = Http::asJson()
                ->acceptJson()
                ->timeout(10)
                ->post($url, [
                    'numero'   => $payload['numero'],
                    'password' => $payload['password'],
                ]);
        } catch (\Throwable $e) {
            Log::error('Erreur réseau lors de la connexion', ['error' => $e->getMessage()]);
            return back()
                ->withInput($request->only('numero'))
                ->with('toast', [
                    'type' => 'error',
                    'title' => 'Erreur réseau',
                    'message' => 'Impossible de joindre l\'API.',
                ]);
        }

        if ($response->status() === 429) {
            $msg = $response->json('error') ?? 'Trop de tentatives, réessayez dans une minute.';
            return back()
                ->withInput($request->only('numero'))
                ->with('toast', [
                    'type' => 'warning',
                    'title' => 'Trop de tentatives',
                    'message' => $msg,
                ]);
        }

        if ($response->unauthorized()) {
            return back()
                ->withInput($request->only('numero'))
                ->with('toast', [
                    'type' => 'error',
                    'title' => 'Identifiants invalides',
                    'message' => 'Téléphone ou mot de passe incorrect.',
                ]);
        }

        if ($response->failed()) {
            return back()
                ->withInput($request->only('numero'))
                ->with('toast', [
                    'type' => 'error',
                    'title' => 'Erreur',
                    'message' => 'Une erreur est survenue. Réessayez.',
                ]);
        }

        // Succès — on stocke token/infos utiles
        if ($response->successful()) {
            $data = $response->json();
            Log::info('Réponse API login:', ['data' => $data]);
            if (!isset($data['gare']['id']) || !is_numeric($data['gare']['id'])) {
                Log::error('ID de gare manquant ou invalide dans la réponse API', ['data' => $data]);
                return back()->with('toast', [
                    'type' => 'error',
                    'title' => 'Erreur',
                    'message' => 'ID de gare non trouvé. Contactez l\'administrateur.',
                ]);
            }
            Session::put('auth.token', $data['token'] ?? null);
            Session::put('auth.gare', $data['gare'] ?? null);
            Session::put('gare_id', $data['gare']['id']);
            Session::put('gare_nom', $data['gare']['nom'] ?? 'Gare par défaut');
            Session::migrate();

            return redirect()->route('dashboard')->with('toast', [
                'type' => 'success',
                'title' => 'Succès',
                'message' => 'Connexion réussie !',
            ]);
        }
    }

    public function logout(): RedirectResponse
    {
        Session::forget('auth');
        Session::forget('gare_id');
        Session::forget('gare_nom');
        Session::invalidate();
        Session::regenerateToken();

        return redirect()->route('login')->with('toast', [
            'type' => 'success',
            'title' => 'Déconnexion',
            'message' => 'À bientôt !',
        ]);
    }
}