<!-- resources/views/layouts/auth.blade.php -->
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>@yield('title','Yael - Connexion')</title>

  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

  <link rel="stylesheet" href="{{ asset('assets/css/ui.css') }}">
  <link rel="stylesheet" href="{{ asset('assets/css/auth.css') }}">
  @stack('styles')
</head>
<body>
  {{-- conteneur toasts custom --}}
  <div id="toast-container" class="toast-container"></div>

  @yield('content')

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="{{ asset('assets/js/ui.js') }}"></script>
  <script>
    // Affiche un toast s'il vient de la session (flash Laravel)
    @if (session('toast'))
      Toast.show(@json(session('toast')));
    @endif
    // Affiche les erreurs de validation sous forme de toast (optionnel)
    @if ($errors->any())
      Toast.show({ type:'error', title:'Validation', message:"{{ implode(' ', $errors->all()) }}" });
    @endif
  </script>
  <script src="{{ asset('assets/js/auth.js') }}"></script>
  @stack('scripts')
</body>
</html>
