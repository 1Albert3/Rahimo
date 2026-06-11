<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\FrontAuthenticate;
use Illuminate\Routing\Middleware\ThrottleRequests;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'front.auth' => FrontAuthenticate::class,
            'throttle'   => ThrottleRequests::class, // pratique pour limiter certaines routes web
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
