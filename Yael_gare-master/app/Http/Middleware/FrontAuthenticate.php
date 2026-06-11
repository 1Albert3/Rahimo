<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class FrontAuthenticate
{
    public function handle(Request $request, Closure $next)
    {
        if (! Session::get('auth.token')) {
            return redirect()->route('login')->with('toast', [
                'type' => 'warning',
                'title' => 'Session requise',
                'message' => 'Veuillez vous connecter.',
            ]);
        }

        return $next($request);
    }
}
