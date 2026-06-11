@extends('layouts.app')
@section('title', 'Compagnie STAF – Gestion des Voyages')

@section('content')
@php
    Log::info('Valeurs dans la vue:', ['gare_id' => $gare_id, 'gare_nom' => $gare_nom, 'voyages_count' => count($voyages)]);
@endphp
<header class="main-header">
    <div class="header-left">
        <h1 id="welcome">Gestion des voyages</h1>
        <p>Vue d'ensemble de vos voyages</p>
    </div>
    <div class="header-right">
        <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" class="search-input" placeholder="Rechercher...">
        </div>
        <button class="btn export"><i class="fas fa-download"></i> Exporter</button>
        <button class="btn new-ride" id="open-modal-btn"><i class="fas fa-plus"></i> Nouveau voyage</button>
    </div>
</header>

<!-- Modal pour ajouter/modifier un voyage -->
<div class="modal-overlay" id="voyage-modal">
    <div class="modal-content">
        <div class="modal-header">
            <div class="modal-icon">
                <i class="fas fa-suitcase-rolling"></i>
            </div>
            <h2 class="modal-title" id="modal-title">Ajouter un nouveau voyage</h2>
            <button class="modal-close" id="modal-close-btn">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <form id="voyage-form">
                @csrf
                <input type="hidden" name="_method" id="form-method" value="POST">
                <input type="hidden" name="id" id="voyage-id">
                
                <div class="form-group">
                    <label for="trajet_id" class="form-label">Trajet</label>
                    <select class="form-select" name="trajet_id" id="trajet_id" required>
                        <option value="" disabled selected>Sélectionner un trajet</option>
                        @if (!is_array($trajets) || empty($trajets))
                            <option value="" disabled>Aucun trajet disponible</option>
                        @else
                            @foreach ($trajets as $trajet)
                                <option value="{{ !empty($trajet['id']) && is_numeric($trajet['id']) ? $trajet['id'] : '' }}">
                                    {{ !empty($trajet['nom']) && is_string($trajet['nom']) ? $trajet['nom'] : 'Inconnu' }}
                                </option>
                            @endforeach
                        @endif
                    </select>
                    <i class="fas fa-route form-icon"></i>
                    @error('trajet_id')
                        <span class="error">{{ $message }}</span>
                    @enderror
                </div>
                
                <div class="form-group">
                    <label for="bus_id" class="form-label">Bus</label>
                    <select class="form-select" name="bus_id" id="bus_id" required>
                        <option value="" disabled selected>Sélectionner un bus</option>
                        @if (!is_array($bus) || empty($bus))
                            <option value="" disabled>Aucun bus disponible</option>
                        @else
                            @foreach ($bus as $b)
                                <option value="{{ !empty($b['id']) && is_numeric($b['id']) ? $b['id'] : '' }}">
                                    {{ !empty($b['nom']) && is_string($b['nom']) ? $b['nom'] : 'Bus ' . $b['id'] }}
                                </option>
                            @endforeach
                        @endif
                    </select>
                    <i class="fas fa-bus form-icon"></i>
                    @error('bus_id')
                        <span class="error">{{ $message }}</span>
                    @enderror
                </div>
                
                <div class="form-group">
                    <label for="chauffeur_id" class="form-label">Chauffeur</label>
                    <select class="form-select" name="chauffeur_id" id="chauffeur_id" required>
                        <option value="" disabled selected>Sélectionner un chauffeur</option>
                        @if (!is_array($chauffeurs) || empty($chauffeurs))
                            <option value="" disabled>Aucun chauffeur disponible</option>
                        @else
                            @foreach ($chauffeurs as $chauffeur)
                                <option value="{{ !empty($chauffeur['id']) && is_numeric($chauffeur['id']) ? $chauffeur['id'] : '' }}">
                                    {{ !empty($chauffeur['nom']) && is_string($chauffeur['nom']) ? $chauffeur['nom'] : 'Chauffeur ' . $chauffeur['id'] }}
                                </option>
                            @endforeach
                        @endif
                    </select>
                    <i class="fas fa-user form-icon"></i>
                    @error('chauffeur_id')
                        <span class="error">{{ $message }}</span>
                    @enderror
                </div>
                
                <div class="form-group">
                    <label for="statut" class="form-label">Statut</label>
                    <select class="form-select" name="statut" id="statut" required>
                        <option value="" disabled selected>Sélectionner le statut</option>
                        <option value="attente">Attente</option>
                        <option value="depart">En cours</option>
                        <option value="arriver">Terminé</option>
                    </select>
                    <i class="fas fa-cog form-icon"></i>
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

<!-- Cartes de stats -->
<section class="stats-cards">
    <div class="card orange">
        <div class="card-value" id="total-voyages">{{ is_array($voyages) ? count($voyages) : 0 }}</div>
        <div class="card-label"><i class="fas fa-suitcase-rolling"></i> Total voyages</div>
    </div>
    <div class="card dark">
        <div class="card-value" id="voyages-attente">{{ is_array($voyages) ? count(array_filter($voyages, fn($v) => ($v['statut'] ?? '') === 'attente')) : 0 }}</div>
        <div class="card-label"><i class="fas fa-hourglass-start"></i> En attente</div>
    </div>
    <div class="card orange">
        <div class="card-value" id="voyages-encours">{{ is_array($voyages) ? count(array_filter($voyages, fn($v) => ($v['statut'] ?? '') === 'depart')) : 0 }}</div>
        <div class="card-label"><i class="fas fa-road"></i> En cours</div>
    </div>
    <div class="card dark">
        <div class="card-value" id="voyages-termine">{{ is_array($voyages) ? count(array_filter($voyages, fn($v) => ($v['statut'] ?? '') === 'arriver')) : 0 }}</div>
        <div class="card-label"><i class="fas fa-check-circle"></i> Terminés</div>
    </div>
</section>

<!-- Tableau des voyages -->
<section class="voyage-table">
    <table class="table">
        <thead>
            <tr>
                <th>Trajet</th>
                <th>Bus</th>
                <th>Chauffeur</th>
                <th>Statut</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody id="voyage-tbody">
            @if (!is_array($voyages) || empty($voyages))
                <tr>
                    <td colspan="5" style="text-align: center;">Aucun voyage disponible.</td>
                </tr>
            @else
                @foreach ($voyages as $voyage)
                    <tr data-id="{{ !empty($voyage['id']) && is_numeric($voyage['id']) ? $voyage['id'] : '' }}">
                        <td>
                            @if (isset($voyage['trajet_id']) && is_array($trajets) && is_numeric($voyage['trajet_id']))
                                {{ collect($trajets)->firstWhere('id', $voyage['trajet_id'])['nom'] ?? 'Inconnu' }}
                            @else
                                Inconnu
                            @endif
                        </td>
                        <td>
                            @if (isset($voyage['bus_id']) && is_array($bus) && is_numeric($voyage['bus_id']))
                                {{ collect($bus)->firstWhere('id', $voyage['bus_id'])['nom'] ?? 'Bus ' . $voyage['bus_id'] }}
                            @else
                                Inconnu
                            @endif
                        </td>
                        <td>
                            @if (isset($voyage['chauffeur_id']) && is_array($chauffeurs) && is_numeric($voyage['chauffeur_id']))
                                {{ collect($chauffeurs)->firstWhere('id', $voyage['chauffeur_id'])['nom'] ?? 'Chauffeur ' . $voyage['chauffeur_id'] }}
                            @else
                                Inconnu
                            @endif
                        </td>
                        <td>
                            <span class="status-badge {{ ($voyage['statut'] ?? '') === 'attente' ? 'status-attente' : (($voyage['statut'] ?? '') === 'depart' ? 'status-encours' : 'status-termine') }}">
                                {{ !empty($voyage['statut']) && is_string($voyage['statut']) ? ucfirst($voyage['statut']) : 'Inconnu' }}
                            </span>
                        </td>
                        <td>
                            <button class="action-btn edit-btn" onclick="editVoyage({{ json_encode($voyage) }})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteVoyage({{ is_numeric($voyage['id'] ?? '') ? $voyage['id'] : 0 }})">
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
    <link rel="stylesheet" href="{{ asset('assets/css/voyages.css') }}">
@endpush

@push('scripts')
    <script src="{{ asset('assets/js/voyages.js') }}"></script>
@endpush