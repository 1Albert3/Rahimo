<!-- resources/views/layouts/app.blade.php -->
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>@yield('title', 'Compagnie STAF – Tableau de bord')</title>

  {{-- Fonts / Icons / Bootstrap --}}
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

  {{-- Styles globaux (UI + dashboard) --}}
  <link rel="stylesheet" href="{{ asset('assets/css/ui.css') }}">
  <link rel="stylesheet" href="{{ asset('assets/css/dashboard.css') }}">

  {{-- Styles spécifiques pages (optionnel) --}}
  @stack('styles')
</head>
<body>

  {{-- (optionnel) conteneur toasts si tu veux le fixer dans le DOM ; sinon ui.js le crée tout seul --}}
  <div id="toast-container" class="toast-container"></div>

  {{-- Loader global app (si tu veux l’utiliser) --}}
  <div id="app-loader" class="loader-overlay hidden">
    <div class="loader-spinner"></div>
  </div>

  <div class="dashboard-container">
    {{-- Sidebar --}}
    @include('partials.sidebar')

    {{-- Contenu principal --}}
    <main class="main-content">
      @yield('content')
    </main>
  </div>

  {{-- Form caché: déconnexion en POST --}}
  <form id="logout-form" action="{{ route('logout') }}" method="POST" class="d-none">
    @csrf
  </form>

  {{-- JS: Bootstrap --}}
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

  {{-- JS UI (toasts cercle-check) --}}
  <script src="{{ asset('assets/js/ui.js') }}"></script>
  <script>
    // Toasters via messages flash Laravel
    @if (session('toast'))
      Toast.show(@json(session('toast')));
    @endif

    @if ($errors->any())
      Toast.show({ type:'error', title:'Validation', message:"{{ implode(' ', $errors->all()) }}" });
    @endif
  </script>

  {{-- JS global (déconnexion via POST, etc.) --}}
  <script src="{{ asset('assets/js/app.js') }}"></script>

  {{-- Scripts spécifiques pages --}}
  @stack('scripts')
</body>
</html>
