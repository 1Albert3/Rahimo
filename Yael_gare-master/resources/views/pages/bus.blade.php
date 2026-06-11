@extends('layouts.app')
@section('title', 'Compagnie STAF – Gestion des Bus')

@section('content')
<header class="main-header">
  <div class="header-left">
    <h1 id="welcome">Gestion des bus</h1>
    <p>Vue d'ensemble de vos bus</p>
  </div>
  <div class="header-right">
    <div class="search-box">
      <i class="fas fa-search"></i>
      <input type="text" class="search-input" placeholder="Rechercher...">
    </div>
    <button class="btn export"><i class="fas fa-download"></i> Exporter</button>
    <button class="btn new-ride" id="open-modal-btn"><i class="fas fa-plus"></i> Nouveau bus</button>
  </div>
</header>

<!-- Modal pour ajouter/modifier un bus -->
<div class="modal-overlay" id="bus-modal">
  <div class="modal-content">
    <div class="modal-header">
      <div class="modal-icon">
        <i class="fas fa-bus"></i>
      </div>
      <h2 class="modal-title" id="modal-title">Ajouter un nouveau bus</h2>
      <button class="modal-close" id="modal-close-btn">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body">
      <form id="bus-form">
        @csrf
        <input type="hidden" name="_method" id="form-method" value="POST">
        <input type="hidden" name="id" id="bus-id">
        <div class="form-group">
          <input type="text" class="form-input" name="nom" id="nom" placeholder="Nom (ex: Bus A)" required>
          <i class="fas fa-bus form-icon"></i>
          @error('nom')
            <span class="error">{{ $message }}</span>
          @enderror
        </div>
        <div class="form-group">
          <input type="text" class="form-input" name="matricule" id="matricule" placeholder="Matricule (ex: MAT-123456)" required>
          <i class="fas fa-id-card form-icon"></i>
          @error('matricule')
            <span class="error">{{ $message }}</span>
          @enderror
        </div>
        <div class="form-group">
          <input type="number" class="form-input" name="capacite" id="capacite" placeholder="Capacité (ex: 50)" required>
          <i class="fas fa-users form-icon"></i>
          @error('capacite')
            <span class="error">{{ $message }}</span>
          @enderror
        </div>
        <div class="form-group">
          <select class="form-input" name="statut" id="statut" required>
            <option value="" disabled selected>Choisir un statut</option>
            <option value="service">Service</option>
            <option value="hors service">Hors service</option>
            <option value="en_maintenance">En maintenance</option>
          </select>
          <i class="fas fa-info-circle form-icon"></i>
          @error('statut')
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
    <div class="card-value" id="total-bus">0</div>
    <div class="card-label"><i class="fas fa-bus"></i> Total bus</div>
  </div>
</section>

<!-- Tableau des bus -->
<section class="bus-table">
  <table class="table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Nom</th>
        <th>Matricule</th>
        <th>Capacité</th>
        <th>Statut</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="bus-tbody">
      @foreach ($bus ?? [] as $bus)
        <tr data-id="{{ $bus['id'] }}">
          <td>#BU{{ str_pad($bus['id'], 3, '0', STR_PAD_LEFT) }}</td>
          <td>{{ $bus['nom'] }}</td>
          <td>{{ $bus['matricule'] }}</td>
          <td>{{ $bus['capacite'] }}</td>
          <td>{{ ucfirst(str_replace('_', ' ', $bus['statut'])) }}</td>
          <td>
            <button class="action-btn edit-btn" onclick="editBus({{ json_encode($bus) }})">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete-btn" onclick="deleteBus({{ $bus['id'] }})">
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
  <link rel="stylesheet" href="{{ asset('assets/css/bus.css') }}">
@endpush

@push('scripts')
  <script src="{{ asset('assets/js/bus.js') }}"></script>
@endpush