@extends('layouts.app')
@section('title', 'Compagnie STAF – Gestion des Destinations')

@section('content')
<header class="main-header">
  <div class="header-left">
    <h1 id="welcome">Gestion des destinations</h1>
    <p>Vue d'ensemble de vos destinations</p>
  </div>
  <div class="header-right">
    <div class="search-box">
      <i class="fas fa-search"></i>
      <input type="text" class="search-input" placeholder="Rechercher...">
    </div>
    <button class="btn export"><i class="fas fa-download"></i> Exporter</button>
    <button class="btn new-ride" id="open-modal-btn"><i class="fas fa-plus"></i> Nouvelle destination</button>
  </div>
</header>

<!-- Modal pour ajouter/modifier une destination -->
<div class="modal-overlay" id="destination-modal">
  <div class="modal-content">
    <div class="modal-header">
      <div class="modal-icon">
        <i class="fas fa-map-marker-alt"></i>
      </div>
      <h2 class="modal-title" id="modal-title">Ajouter une nouvelle destination</h2>
      <button class="modal-close" id="modal-close-btn">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body">
      <form id="destination-form">
        @csrf
        <input type="hidden" name="_method" id="form-method" value="POST">
        <input type="hidden" name="id" id="destination-id">
        <div class="form-group">
          <input type="text" class="form-input" name="nom" id="nom" placeholder="Nom (ex: Dori–Bobo)" required>
          <i class="fas fa-map-marker-alt form-icon"></i>
          @error('nom')
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
    <div class="card-value" id="total-destinations">0</div>
    <div class="card-label"><i class="fas fa-map-marker-alt"></i> Total destinations</div>
  </div>
</section>

<!-- Tableau des destinations -->
<section class="destination-table">
  <table class="table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Nom</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="destination-tbody">
      @foreach ($destinations ?? [] as $destination)
        <tr data-id="{{ $destination['id'] }}">
          <td>#DE{{ str_pad($destination['id'], 3, '0', STR_PAD_LEFT) }}</td>
          <td>{{ $destination['nom'] }}</td>
          <td>
            <button class="action-btn edit-btn" onclick="editDestination({{ json_encode($destination) }})">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete-btn" onclick="deleteDestination({{ $destination['id'] }})">
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
  <link rel="stylesheet" href="{{ asset('assets/css/destinations.css') }}">
@endpush

@push('scripts')
  <script src="{{ asset('assets/js/destinations.js') }}"></script>
@endpush