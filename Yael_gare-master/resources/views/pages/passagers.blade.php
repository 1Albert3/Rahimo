@extends('layouts.app')
@section('title', 'Compagnie STAF – Gestion des Passagers')

@section('content')
@php
    Log::info('Valeurs dans la vue:', ['gare_id' => $gare_id, 'gare_nom' => $gare_nom, 'passagers_count' => count($passagers)]);
@endphp
<header class="main-header">
    <div class="header-left">
        <h1 id="welcome">Gestion des passagers</h1>
        <p>Vue d'ensemble de vos passagers</p>
    </div>
    <div class="header-right">
        <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" class="search-input" placeholder="Rechercher...">
        </div>
        <button class="btn export"><i class="fas fa-download"></i> Exporter</button>
        <button class="btn new-ride" id="open-modal-btn"><i class="fas fa-plus"></i> Nouveau passager</button>
    </div>
</header>

<!-- Modal pour ajouter/modifier un passager -->
<div class="modal-overlay" id="passager-modal">
    <div class="modal-content">
        <div class="modal-header">
            <div class="modal-icon">
                <i class="fas fa-users"></i>
            </div>
            <h2 class="modal-title" id="modal-title">Ajouter un nouveau passager</h2>
            <button class="modal-close" id="modal-close-btn">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <form id="passager-form">
                @csrf
                <input type="hidden" name="_method" id="form-method" value="POST">
                <input type="hidden" name="id" id="passager-id">

                <div class="form-group">
                    <label for="nom" class="form-label">Nom</label>
                    <input type="text" class="form-input" name="nom" id="nom" placeholder="Nom" required>
                    <i class="fas fa-user form-icon"></i>
                    @error('nom')
                        <span class="error">{{ $message }}</span>
                    @enderror
                </div>
                <div class="form-group">
                    <label for="prenom" class="form-label">Prénom</label>
                    <input type="text" class="form-input" name="prenom" id="prenom" placeholder="Prénom" required>
                    <i class="fas fa-user form-icon"></i>
                    @error('prenom')
                        <span class="error">{{ $message }}</span>
                    @enderror
                </div>
                <div class="form-group">
                    <label for="telephone" class="form-label">Téléphone</label>
                    <input type="tel" class="form-input" name="telephone" id="telephone" placeholder="Téléphone (ex: 70123456)" required>
                    <i class="fas fa-phone form-icon"></i>
                    @error('telephone')
                        <span class="error">{{ $message }}</span>
                    @enderror
                </div>
                <div class="form-group">
                    <label for="numerocnib" class="form-label">Numéro CNIB</label>
                    <input type="text" class="form-input" name="numerocnib" id="numerocnib" placeholder="Numéro CNIB (ex: B1234567)" required>
                    <i class="fas fa-id-card form-icon"></i>
                    @error('numerocnib')
                        <span class="error">{{ $message }}</span>
                    @enderror
                </div>
                <div class="form-group">
                    <label for="date_etablissement" class="form-label">Date d'établissement</label>
                    <input type="date" class="form-input" name="date_etablissement" id="date_etablissement" required>
                    <i class="fas fa-calendar-alt form-icon"></i>
                    @error('date_etablissement')
                        <span class="error">{{ $message }}</span>
                    @enderror
                </div>
                <div class="form-group">
                    <label for="date_expiration" class="form-label">Date d'expiration</label>
                    <input type="date" class="form-input" name="date_expiration" id="date_expiration" required>
                    <i class="fas fa-calendar-times form-icon"></i>
                    @error('date_expiration')
                        <span class="error">{{ $message }}</span>
                    @enderror
                </div>
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
                    <label for="codeqr" class="form-label">Code QR</label>
                    <input type="text" class="form-input" name="codeqr" id="codeqr" placeholder="Code QR (ex: QR123456)" required>
                    <i class="fas fa-qrcode form-icon"></i>
                    @error('codeqr')
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
        <div class="card-value" id="total-passagers">{{ is_array($passagers) ? count($passagers) : 0 }}</div>
        <div class="card-label"><i class="fas fa-users"></i> Total passagers</div>
    </div>
    <div class="card dark">
        <div class="card-value" id="cnib-valide">{{ is_array($passagers) ? count(array_filter($passagers, fn($p) => ($p['date_expiration'] ?? '') >= now()->toDateString())) : 0 }}</div>
        <div class="card-label"><i class="fas fa-id-card"></i> CNIB valide</div>
    </div>
    <div class="card orange">
        <div class="card-value" id="passagers-trajet">{{ is_array($passagers) ? count(array_filter($passagers, fn($p) => ($p['trajet_id'] ?? 0) == 3)) : 0 }}</div>
        <div class="card-label"><i class="fas fa-route"></i> Passagers trajet 3</div>
    </div>
</section>

<!-- Tableau des passagers -->
<section class="passager-table">
    <table class="table">
        <thead>
            <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Téléphone</th>
                <th>Numéro CNIB</th>
                <th>Date établissement</th>
                <th>Date expiration</th>
                <th>Trajet</th>
                <th>Code QR</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody id="passager-tbody">
            @if (!is_array($passagers) || empty($passagers))
                <tr>
                    <td colspan="9" style="text-align: center;">Aucun passager disponible.</td>
                </tr>
            @else
                @foreach ($passagers as $passager)
                    <tr data-id="{{ !empty($passager['id']) && is_numeric($passager['id']) ? $passager['id'] : '' }}">
                        <td>{{ !empty($passager['nom']) && is_string($passager['nom']) ? $passager['nom'] : 'Inconnu' }}</td>
                        <td>{{ !empty($passager['prenom']) && is_string($passager['prenom']) ? $passager['prenom'] : 'Inconnu' }}</td>
                        <td>{{ !empty($passager['telephone']) && is_string($passager['telephone']) ? $passager['telephone'] : 'Inconnu' }}</td>
                        <td>{{ !empty($passager['numerocnib']) && is_string($passager['numerocnib']) ? $passager['numerocnib'] : 'Inconnu' }}</td>
                        <td>{{ !empty($passager['date_etablissement']) && is_string($passager['date_etablissement']) ? \Carbon\Carbon::parse($passager['date_etablissement'])->format('d/m/Y') : 'Inconnu' }}</td>
                        <td>{{ !empty($passager['date_expiration']) && is_string($passager['date_expiration']) ? \Carbon\Carbon::parse($passager['date_expiration'])->format('d/m/Y') : 'Inconnu' }}</td>
                        <td>
                            @if (isset($passager['trajet_id']) && is_array($trajets) && is_numeric($passager['trajet_id']))
                                {{ collect($trajets)->firstWhere('id', $passager['trajet_id'])['nom'] ?? 'Inconnu' }}
                            @else
                                Inconnu
                            @endif
                        </td>
                        <td>{{ !empty($passager['codeqr']) && is_string($passager['codeqr']) ? $passager['codeqr'] : 'Inconnu' }}</td>
                        <td>
                            <button class="action-btn edit-btn" onclick="editPassager({{ json_encode($passager) }})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="deletePassager({{ json_encode($passager) }})">
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
    <link rel="stylesheet" href="{{ asset('assets/css/passagers.css') }}">
@endpush

@push('scripts')
    <script src="{{ asset('assets/js/passagers.js') }}"></script>
@endpush