<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title inertia>{{ config('app.name', 'Rahimo Transport') }}</title>

        <!-- Fonts — Kinetic Horizon: Inter + JetBrains Mono -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
        <style>.material-symbols-outlined{font-variation-settings:"FILL" 0,"wght" 400,"GRAD" 0,"opsz" 24}</style>

        <!-- Scripts -->
        @routes

        @php
            $manifestPath = public_path('build/manifest.json');
            $manifest = file_exists($manifestPath) ? json_decode(file_get_contents($manifestPath), true) : null;
            $entry = null;
            if ($manifest) {
                // prefer the src/main.tsx entry if present
                if (isset($manifest['src/main.tsx'])) {
                    $entry = $manifest['src/main.tsx'];
                } elseif (isset($manifest['resources/js/app.tsx'])) {
                    $entry = $manifest['resources/js/app.tsx'];
                }
            }
        @endphp

        @if ($entry)
            @if (isset($entry['css']))
                @foreach ($entry['css'] as $css)
                    <link rel="stylesheet" href="{{ asset('build/'.$css) }}">
                @endforeach
            @endif

            <script type="module" src="{{ asset('build/'.$entry['file']) }}"></script>
        @else
            @if (app()->environment('local'))
                {{-- Dev: load Vite dev server client and module if manifest not present --}}
                <script type="module" src="http://127.0.0.1:5173/@vite/client"></script>
                <script type="module">import RefreshRuntime from 'http://127.0.0.1:5173/@react-refresh'
                    // fallback import for app
                </script>
                <script type="module" src="http://127.0.0.1:5173/resources/js/app.tsx"></script>
            @endif
        @endif

        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-background text-on-background">
        @inertia
    </body>
</html>
