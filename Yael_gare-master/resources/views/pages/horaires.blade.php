@extends('layouts.app')
@section('title', 'Compagnie STAF – Gestion des Horaires')

@section('content')
<header class="main-header">
  <div class="header-left">
    <h1 id="welcome">Gestion des horaires</h1>
    <p>Vue d'ensemble de vos horaires</p>
  </div>
  <div class="header-right">
    <div class="search-box">
      <i class="fas fa-search"></i>
      <input type="text" class="search-input" placeholder="Rechercher...">
    </div>
    <button class="btn export"><i class="fas fa-download"></i> Exporter</button>
    <button class="btn new-ride" id="open-modal-btn"><i class="fas fa-plus"></i> Nouvel horaire</button>
  </div>
</header>

<!-- Modal pour ajouter/modifier un horaire -->
<div class="modal-overlay" id="horaire-modal">
  <div class="modal-content">
    <div class="modal-header">
      <div class="modal-icon">
        <i class="fas fa-clock"></i>
      </div>
      <h2 class="modal-title" id="modal-title">Ajouter un nouvel horaire</h2>
      <button class="modal-close" id="modal-close-btn">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body">
      <form id="horaire-form">
        @csrf
        <input type="hidden" name="_method" id="form-method" value="POST">
        <input type="hidden" name="id" id="horaire-id">
        <div class="form-group">
          <input type="time" class="form-input" name="heure" id="heure" required>
          <i class="fas fa-clock form-icon"></i>
          @error('heure')
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
    <div class="card-value" id="total-horaires">0</div>
    <div class="card-label"><i class="fas fa-clock"></i> Total horaires</div>
  </div>
</section>

<!-- Tableau des horaires -->
<section class="horaire-table">
  <table class="table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Horaire</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="horaire-tbody">
      @foreach ($horaires ?? [] as $horaire)
        <tr data-id="{{ $horaire['id'] }}">
          <td>#HO{{ str_pad($horaire['id'], 3, '0', STR_PAD_LEFT) }}</td>
          <td>{{ $horaire['heure'] }}</td>
          <td>
            <button class="action-btn edit-btn" onclick="editHoraire({{ json_encode($horaire) }})">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete-btn" onclick="deleteHoraire({{ $horaire['id'] }})">
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
  <link rel="stylesheet" href="{{ asset('assets/css/horaires.css') }}">
@endpush

@push('scripts')
  <script src="{{ asset('assets/js/horaires.js') }}"></script>
@endpush