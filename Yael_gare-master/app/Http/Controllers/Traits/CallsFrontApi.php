<?php

namespace App\Http\Controllers\Traits;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Session;

trait CallsFrontApi
{
    protected function apiBase(): string
    {
        return rtrim(config('services.front.api_base_url'), '/');
    }

    protected function api(): PendingRequest
    {
        $req = Http::asJson()->acceptJson()->timeout(15);
        if ($token = Session::get('auth.token')) {
            $req = $req->withToken($token);
        }
        return $req;
    }

    protected function apiUrl(string $path): string
    {
        return $this->apiBase() . '/' . ltrim($path, '/');
    }
}
