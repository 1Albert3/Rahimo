@extends('layouts.app')
@section('title', 'Compagnie STAF – Gestion des Trajets')

@section('content')
@php
    Log::info('Valeurs dans la vue:', ['gare_id' => $gare_id, 'gare_nom' => $gare_nom]);
@endphp
<header class="main-header">
    <div class="header-left">
        <h1 id="welcome">Gestion des trajets</h1>
        <p>Vue d'ensemble de vos trajets</p>
    </div>
    <div class="header-right">
        <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" class="search-input" placeholder="Rechercher...">
        </div>
        <button class="btn export"><i class="fas fa-download"></i> Exporter</button>
        <button class="btn new-ride" id="open-modal-btn"><i class="fas fa-plus"></i> Nouveau trajet</button>
    </div>
</header>

<!-- Modal pour ajouter/modifier un trajet -->
<div class="modal-overlay" id="trajet-modal">
    <div class="modal-content">
        <div class="modal-header">
            <div class="modal-icon">
                <i class="fas fa-route"></i>
            </div>
            <h2 class="modal-title" id="modal-title">Ajouter un nouveau trajet</h2>
            <button class="modal-close" id="modal-close-btn">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <form id="trajet-form">
                @csrf
                <input type="hidden" name="_method" id="form-method" value="POST">
                <input type="hidden" name="id" id="trajet-id">
                
                <div class="form-group">
                    <label for="nom" class="form-label">Nom du trajet</label>
                    <input type="text" class="form-input" name="nom" id="nom" placeholder="Nom (ex: Ouaga–Bobo)" required>
                    <i class="fas fa-route form-icon"></i>
                    @error('nom')
                        <span class="error">{{ $message }}</span>
                    @enderror
                </div>
                
                <div class="form-group">
                    <label for="depart_gare" class="form-label">Gare de départ</label>
                    <input type="text" class="form-input" id="depart_gare" value="{{ htmlspecialchars($gare_nom) }}" disabled>
                    <input type="hidden" name="depart_gare_id" id="depart_gare_id" value="{{ htmlspecialchars($gare_id) }}">
                    <i class="fas fa-map-marker-alt form-icon"></i>
                </div>
                
                <div class="form-group">
                    <label for="destination_id" class="form-label">Destination</label>
                    <select class="form-input" name="destination_id" id="destination_id" required>
                        <option value="" disabled selected>Choisir une destination</option>
                        @if (!is_array($destinations) || empty($destinations))
                            <option value="" disabled>Aucune destination disponible</option>
                        @else
                            @foreach ($destinations as $destination)
                                <option value="{{ !empty($destination['id']) && is_numeric($destination['id']) ? $destination['id'] : '' }}">{{ !empty($destination['nom']) && is_string($destination['nom']) ? $destination['nom'] : 'Inconnue' }}</option>
                            @endforeach
                        @endif
                    </select>
                    <i class="fas fa-map-marker-alt form-icon"></i>
                    @error('destination_id')
                        <span class="error">{{ $message }}</span>
                    @enderror
                </div>
                
                <div class="form-group">
                    <label for="duree" class="form-label">Durée du trajet</label>
                    <input type="time" class="form-input" name="duree" id="duree" placeholder="Durée (ex: 02:30)" required>
                    <i class="fas fa-clock form-icon"></i>
                    <small class="form-hint">Format: HH:MM (ex: 02:30 pour 2h30)</small>
                    @error('duree')
                        <span class="error">{{ $message }}</span>
                    @enderror
                </div>
                
                <div class="form-group">
                    <label for="horaire_id" class="form-label">Horaire de départ</label>
                    <select class="form-input" name="horaire_id" id="horaire_id" required>
                        <option value="" disabled selected>Choisir un horaire</option>
                        @if (!is_array($horaires) || empty($horaires))
                            <option value="" disabled>Aucun horaire disponible</option>
                        @else
                            @foreach ($horaires as $horaire)
                                <option value="{{ !empty($horaire['id']) && is_numeric($horaire['id']) ? $horaire['id'] : '' }}">{{ !empty($horaire['heure']) && is_string($horaire['heure']) ? $horaire['heure'] : 'Inconnu' }}</option>
                            @endforeach
                        @endif
                    </select>
                    <i class="fas fa-clock form-icon"></i>
                    @error('horaire_id')
                        <span class="error">{{ $message }}</span>
                    @enderror
                </div>
                
                <div class="form-group">
                    <label for="date" class="form-label">Date du trajet</label>
                    <input type="date" class="form-input" name="date" id="date" required>
                    <i class="fas fa-calendar-alt form-icon"></i>
                    @error('date')
                        <span class="error">{{ $message }}</span>
                    @enderror
                </div>
                
                <div class="form-group">
                    <label for="prix" class="form-label">Prix du trajet</label>
                    <input type="number" class="form-input" name="prix" id="prix" step="0.01" placeholder="Prix (ex: 15000.00)" required>
                    <i class="fas fa-money-bill form-icon"></i>
                    <small class="form-hint">Montant en FCFA (ex: 15000.00)</small>
                    @error('prix')
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
        <div class="card-value" id="total-trajets">{{ is_array($trajets) ? count($trajets) : 0 }}</div>
        <div class="card-label"><i class="fas fa-route"></i> Total trajets</div>
    </div>
</section>

<!-- Tableau des trajets -->
<section class="trajet-table">
    <table class="table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Gare de départ</th>
                <th>Destination</th>
                <th>Durée</th>
                <th>Horaire</th>
                <th>Date</th>
                <th>Prix</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody id="trajet-tbody">
            @if (!is_array($trajets) || empty($trajets))
                <tr>
                    <td colspan="9" style="text-align: center;">Aucun trajet disponible.</td>
                </tr>
            @else
                @foreach ($trajets as $trajet)
                    <tr data-id="{{ !empty($trajet['id']) && is_numeric($trajet['id']) ? $trajet['id'] : '' }}">
                        <td>#TR{{ str_pad(is_numeric($trajet['id'] ?? 0) ? $trajet['id'] : 0, 3, '0', STR_PAD_LEFT) }}</td>
                        <td>{{ !empty($trajet['nom']) && is_string($trajet['nom']) ? $trajet['nom'] : 'Inconnu' }}</td>
                        <td>{{ htmlspecialchars($gare_nom) }}</td>
                        <td>
                            @if (isset($trajet['destination_id']) && is_array($destinations) && is_numeric($trajet['destination_id']))
                                {{ collect($destinations)->firstWhere('id', $trajet['destination_id'])['nom'] ?? 'Inconnue' }}
                            @else
                                Inconnue
                            @endif
                        </td>
                        <td>{{ is_string($trajet['duree']) && !empty($trajet['duree']) ? $trajet['duree'] : 'Inconnue' }}</td>
                        <td>
                            @if (isset($trajet['horaire_id']) && is_array($horaires) && is_numeric($trajet['horaire_id']))
                                {{ collect($horaires)->firstWhere('id', $trajet['horaire_id'])['heure'] ?? 'Inconnu' }}
                            @else
                                Inconnu
                            @endif
                        </td>
                        <td>{{ !empty($trajet['date']) && is_string($trajet['date']) ? $trajet['date'] : 'Inconnue' }}</td>
                        <td>{{ isset($trajet['prix']) && is_numeric($trajet['prix']) ? number_format($trajet['prix'], 2) . ' FCFA' : 'Inconnu' }}</td>
                        <td>
                            <button class="action-btn edit-btn" onclick="editTrajet({{ json_encode($trajet) }})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteTrajet({{ is_numeric($trajet['id'] ?? '') ? $trajet['id'] : 0 }})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                @endforeach
            @endif
        </tbody>
    </table>
</section>
@endsection

@push('styles')
    <link rel="stylesheet" href="{{ asset('assets/css/trajets.css') }}">
@endpush

@push('scripts')
    <script src="{{ asset('assets/js/trajets.js') }}"></script>
@endpush