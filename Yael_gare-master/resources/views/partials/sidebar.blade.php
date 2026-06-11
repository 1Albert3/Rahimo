<!-- resources/views/partials/sidebar.blade.php -->
<aside class="sidebar">
  <div class="sidebar-header">
    <i class="fas fa-route"></i>
    <span>Compagnie STAF</span>
  </div>
  <nav class="sidebar-nav">
    <a href="{{ url('dashboard') }}" class="nav-item {{ request()->is('dashboard*') ? 'active' : '' }}"><i class="fas fa-home"></i><span>Tableau de bord</span></a>
    <a href="{{ url('chauffeurs') }}" class="nav-item {{ request()->is('chauffeurs*') ? 'active' : '' }}"><i class="fas fa-city"></i><span>Gestion des Chauffeurs</span></a>
    <a href="{{ url('agents') }}" class="nav-item {{ request()->is('agents*') ? 'active' : '' }}"><i class="fas fa-user"></i><span>Gestion des Agents</span></a>
    <a href="{{ url('bus') }}" class="nav-item {{ request()->is('bus*') ? 'active' : '' }}"><i class="fas fa-bus"></i><span>Gestion des Bus</span></a>
    <a href="{{ url('horaires') }}" class="nav-item {{ request()->is('horaires*') ? 'active' : '' }}"><i class="fas fa-clock"></i><span>Gestion des Horaires</span></a>
    <a href="{{ url('destinations') }}" class="nav-item {{ request()->is('destinations*') ? 'active' : '' }}"><i class="fas fa-map-marked-alt"></i><span>Gestion des Destinations</span></a>
    <a href="{{ url('trajets') }}" class="nav-item {{ request()->is('trajets*') ? 'active' : '' }}"><i class="fas fa-route"></i><span>Gestion des Trajets</span></a>
    <a href="{{ url('voyages') }}" class="nav-item {{ request()->is('voyages*') ? 'active' : '' }}"><i class="fas fa-suitcase-rolling"></i><span>Gestion des Voyages</span></a>
    <a href="{{ url('passagers') }}" class="nav-item {{ request()->is('passagers*') ? 'active' : '' }}"><i class="fas fa-users"></i><span>Gestion des Passagers</span></a>
    <a href="{{ url('reservations') }}" class="nav-item {{ request()->is('reservations*') ? 'active' : '' }}"><i class="fas fa-ticket-alt"></i><span>Gestion des Reservations</span></a>

    <a href="#" id="nav-logout" class="nav-item"><i class="fas fa-sign-out-alt"></i><span>Déconnexion</span></a>
  </nav>
</aside>
