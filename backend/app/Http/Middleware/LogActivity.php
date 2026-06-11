<?php

namespace App\Http\Middleware;

use App\Services\ActivityLogger;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->user() && $request->method() !== 'GET') {
            $action = $request->method() . ' ' . $request->path();
            $description = $request->method() . ' sur ' . $request->path();

            if ($request->route() && $request->route()->getName()) {
                $action = str_replace('admin.', '', $request->route()->getName());
                $description = 'Action: ' . $action;
            }

            ActivityLogger::log($action, $description);
        }

        return $response;
    }
}
