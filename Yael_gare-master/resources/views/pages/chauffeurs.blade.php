@extends('layouts.app')
@section('title', 'Compagnie STAF – Gestion des Chauffeurs')

@section('content')
<header class="main-header">
  <div class="header-left">
    <h1 id="welcome">Gestion des chauffeurs</h1>
    <p>Vue d'ensemble de vos chauffeurs</p>
  </div>
  <div class="header-right">
    <div class="search-box">
      <i class="fas fa-search"></i>
      <input type="text" class="search-input" placeholder="Rechercher...">
    </div>
    <button class="btn export"><i class="fas fa-download"></i> Exporter</button>
    <button class="btn new-ride" id="open-modal-btn"><i class="fas fa-plus"></i> Nouveau chauffeur</button>
  </div>
</header>

<!-- Modal pour ajouter/modifier un chauffeur -->
<div class="modal-overlay" id="chauffeur-modal">
  <div class="modal-content">
    <div class="modal-header">
      <div class="modal-icon">
        <i class="fas fa-user"></i>
      </div>
      <h2 class="modal-title" id="modal-title">Ajouter un nouveau chauffeur</h2>
      <button class="modal-close" id="modal-close-btn">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body">
      <form id="chauffeur-form">
        @csrf
        <input type="hidden" name="_method" id="form-method" value="POST">
        <input type="hidden" name="id" id="chauffeur-id">
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
          <input type="tel" class="form-input" name="telephone" id="telephone" placeholder="Téléphone (ex: 70000041)" required>
          <i class="fas fa-phone form-icon"></i>
          @error('telephone')
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
    <div class="card-value" id="total-chauffeurs">0</div>
    <div class="card-label"><i class="fas fa-users"></i> Total chauffeurs</div>
  </div>
</section>

<!-- Tableau des chauffeurs -->
<section class="chauffeur-table">
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
    <tbody id="chauffeur-tbody">
      @foreach ($chauffeurs ?? [] as $chauffeur)
        <tr data-id="{{ $chauffeur['id'] }}">
          <td>#CH{{ str_pad($chauffeur['id'], 3, '0', STR_PAD_LEFT) }}</td>
          <td>{{ $chauffeur['nom'] }}</td>
          <td>{{ $chauffeur['prenom'] }}</td>
          <td>{{ $chauffeur['telephone'] }}</td>
          <td>
            <button class="action-btn edit-btn" onclick="editChauffeur({{ json_encode($chauffeur) }})">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete-btn" onclick="deleteChauffeur({{ $chauffeur['id'] }})">
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
  <link rel="stylesheet" href="{{ asset('assets/css/chauffeurs.css') }}">
@endpush

@push('scripts')
  <script src="{{ asset('assets/js/chauffeurs.js') }}"></script>
@endpush