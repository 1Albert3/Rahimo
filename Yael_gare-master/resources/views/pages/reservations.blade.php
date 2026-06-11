@extends('layouts.app')
@section('title', 'Compagnie STAF – Gestion des Réservations')

@section('head')
  <meta name="auth-token" content="{{ Session::get('auth.token') }}">
  <meta name="csrf-token" content="{{ csrf_token() }}">
@endsection

@section('content')
<header class="main-header">
  <div class="header-left">
    <h1 id="welcome">Gestion des réservations</h1>
    <p>Vue d'ensemble de vos réservations ({{ $gare_nom }})</p>
  </div>
  <div class="header-right">
    <div class="search-box">
      <i class="fas fa-search"></i>
      <input type="text" class="search-input" placeholder="Rechercher...">
    </div>
    <button class="btn export"><i class="fas fa-download"></i> Exporter</button>
    <button class="btn new-ride" id="open-modal-btn"><i class="fas fa-plus"></i> Nouvelle réservation</button>
  </div>
</header>

<!-- Modal pour ajouter/modifier une réservation -->
<div class="modal-overlay" id="reservation-modal">
  <div class="modal-content">
    <div class="modal-header">
      <div class="modal-icon">
        <i class="fas fa-ticket-alt"></i>
      </div>
      <h2 class="modal-title" id="modal-title">Ajouter une nouvelle réservation</h2>
      <button class="modal-close" onclick="closeModal()">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <input type="text" class="form-input" placeholder="Nom" id="nom" required>
        <i class="fas fa-user form-icon"></i>
      </div>
      <div class="form-group">
        <input type="text" class="form-input" placeholder="Prénom" id="prenom" required>
        <i class="fas fa-user form-icon"></i>
      </div>
      <div class="form-group">
        <input type="tel" class="form-input" placeholder="Téléphone (ex: 70123456)" id="telephone" required>
        <i class="fas fa-phone form-icon"></i>
      </div>
      <div class="form-group">
        <select class="form-select" id="voyage_id" required>
          <option value="">Sélectionner un voyage</option>
        </select>
        <i class="fas fa-route form-icon"></i>
      </div>
    </div>
    <div class="modal-footer">
      <button class="modal-btn btn-cancel" onclick="closeModal()">
        <i class="fas fa-ban"></i> Annuler
      </button>
      <button class="modal-btn btn-validate" id="btn-validate" onclick="validateForm()">
        <i class="fas fa-check"></i>
        <span id="btn-text">Ajouter</span>
        <span class="loader hidden" id="btn-loader"></span>
      </button>
    </div>
  </div>
</div>

<!-- Cartes de stats -->
<section class="stats-cards">
  <div class="card orange">
    <div class="card-value" id="total-reservations">0</div>
    <div class="card-label"><i class="fas fa-ticket-alt"></i> Total réservations</div>
  </div>
  <div class="card dark">
    <div class="card-value" id="reservations-confirmees">0</div>
    <div class="card-label"><i class="fas fa-check-circle"></i> Confirmées</div>
  </div>
  <div class="card orange">
    <div class="card-value" id="reservations-en-attente">0</div>
    <div class="card-label"><i class="fas fa-clock"></i> En attente</div>
  </div>
  <div class="card red">
    <div class="card-value" id="reservations-annulees">0</div>
    <div class="card-label"><i class="fas fa-times-circle"></i> Annulées</div>
  </div>
</section>

<!-- Tableau des réservations -->
<section class="reservation-table">
  <table class="table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Nom</th>
        <th>Prénom</th>
        <th>Téléphone</th>
        <th>Voyage</th>
        <th>Date réservation</th>
        <th>Statut</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="reservation-tbody"></tbody>
  </table>
</section>
@endsection

@push('styles')
  <link rel="stylesheet" href="{{ asset('assets/css/reservations.css') }}">
@endpush

@push('scripts')
  <script src="{{ asset('assets/js/reservations.js') }}"></script>
@endpush