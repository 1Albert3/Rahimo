@extends('layouts.app')
@section('title', 'Compagnie STAF – Gestion des Agents')

@section('content')
<header class="main-header">
  <div class="header-left">
    <h1 id="welcome">Gestion des agents</h1>
    <p>Vue d'ensemble de vos agents</p>
  </div>
  <div class="header-right">
    <div class="search-box">
      <i class="fas fa-search"></i>
      <input type="text" class="search-input" placeholder="Rechercher...">
    </div>
    <button class="btn export"><i class="fas fa-download"></i> Exporter</button>
    <button class="btn new-ride" id="open-modal-btn"><i class="fas fa-plus"></i> Nouvel agent</button>
  </div>
</header>

<!-- Modal pour ajouter/modifier un agent -->
<div class="modal-overlay" id="agent-modal">
  <div class="modal-content">
    <div class="modal-header">
      <div class="modal-icon">
        <i class="fas fa-user-tie"></i>
      </div>
      <h2 class="modal-title" id="modal-title">Ajouter un nouvel agent</h2>
      <button class="modal-close" id="modal-close-btn">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body">
      <form id="agent-form">
        @csrf
        <input type="hidden" name="_method" id="form-method" value="POST">
        <input type="hidden" name="id" id="agent-id">
        <div class="form-group">
          <input type="text" class="form-input" name="nom" id="nom" placeholder="Nom" required>
          <i class="fas fa-user form-icon"></i>
          @error('nom')
            <span class="error">{{ $message }}</span>
          @enderror
        </div>
        <div class="form-group">
          <input type="text" class="form-input" name="prenom" id="prenom" placeholder="Prénom" required>
          <i class="fas fa-user form-icon"></i>
          @error('prenom')
            <span class="error">{{ $message }}</span>
          @enderror
        </div>
        <div class="form-group">
          <input type="tel" class="form-input" name="numero" id="numero" placeholder="Téléphone (ex: 70000041)" required>
          <i class="fas fa-phone form-icon"></i>
          @error('numero')
            <span class="error">{{ $message }}</span>
          @enderror
        </div>
        <div class="form-group">
          <input type="password" class="form-input" name="password" id="password" placeholder="Mot de passe">
          <i class="fas fa-lock form-icon"></i>
          @error('password')
            <span class="error">{{ $message }}</span>
          @enderror
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="modal-btn btn-cancel" id="cancel-btn">
        <i class="fas fa-ban"></i> Annuler
      </button>
      <button class="modal-btn btn-validate" id="submit-btn">
        <i class="fas fa-check"></i> <span id="btn-text">Ajouter</span>
        <span class="loader hidden" id="submit-loader"></span>
      </button>
    </div>
  </div>
</div>

<!-- Carte de stats -->
<section class="stats-cards">
  <div class="card orange">
    <div class="card-value" id="total-agents">0</div>
    <div class="card-label"><i class="fas fa-users"></i> Total agents</div>
  </div>
</section>

<!-- Tableau des agents -->
<section class="agent-table">
  <table class="table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Nom</th>
        <th>Prénom</th>
        <th>Téléphone</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="agent-tbody">
      @foreach ($agents ?? [] as $agent)
        <tr data-id="{{ $agent['id'] }}">
          <td>#AG{{ str_pad($agent['id'], 3, '0', STR_PAD_LEFT) }}</td>
          <td>{{ $agent['nom'] }}</td>
          <td>{{ $agent['prenom'] }}</td>
          <td>{{ $agent['numero'] }}</td>
          <td>
            <button class="action-btn edit-btn" onclick="editAgent({{ json_encode($agent) }})">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete-btn" onclick="deleteAgent({{ $agent['id'] }})">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      @endforeach
    </tbody>
  </table>
</section>
@endsection

@push('styles')
  <link rel="stylesheet" href="{{ asset('assets/css/agents.css') }}">
@endpush

@push('scripts')
  <script src="{{ asset('assets/js/agents.js') }}"></script>
@endpush