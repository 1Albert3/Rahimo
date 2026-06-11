<!-- resources/views/pages/dashboard.blade.php -->
@extends('layouts.app')
@section('title','Compagnie STAF – Tableau de bord')

@section('content')
<header class="main-header">
  <div class="header-left">
    <h1 id="welcome">Bienvenue …</h1>
    <p>Vue d'ensemble de votre activité transport</p>
  </div>
  <div class="header-right">
    <i class="fas fa-building"></i><span>-</span>
    <button class="btn export"><i class="fas fa-download"></i> Exporter</button>
    <button class="btn new-ride"><i class="fas fa-plus"></i> Nouveau trajet</button>
  </div>
</header>

<section class="stats-cards">
  <div class="card orange"><div class="card-value">0</div><div class="card-label"><i class="fas fa-money-bill-wave"></i> Revenus du jour</div></div>
  <div class="card dark"><div class="card-value">0</div><div class="card-label"><i class="fas fa-users"></i> Passagers aujourd'hui</div></div>
  <div class="card orange"><div class="card-value">0</div><div class="card-label"><i class="fas fa-bus"></i> Véhicules en service</div></div>
  <div class="card dark"><div class="card-value">0</div><div class="card-label"><i class="fas fa-clock"></i> Ponctualité (%)</div></div>
</section>

<section class="charts">
  <div class="chart-card"><h2>Évolution des revenus</h2><div class="chart-placeholder"></div></div>
  <div class="chart-card"><h2>Fréquentation par ligne</h2><div class="chart-placeholder"></div></div>
</section>

<section class="tables">
  <div class="table-card">
    <h2>Transactions récentes</h2>
    <table class="table">
      <thead><tr><th>ID Transaction</th><th>Ligne</th><th>Montant</th><th>Heure</th><th>Statut</th></tr></thead>
      <tbody><tr><td colspan="5" class="empty">Aucune donnée</td></tr></tbody>
    </table>
  </div>
  <div class="table-card">
    <h2>Véhicules en temps réel</h2>
    <table class="table">
      <thead><tr><th>Véhicule</th><th>Ligne</th><th>Statut</th><th>Passagers</th><th>Position</th></tr></thead>
      <tbody><tr><td colspan="5" class="empty">Aucune donnée</td></tr></tbody>
    </table>
  </div>
</section>
@endsection

@push('scripts')
  <script src="{{ asset('assets/js/dashboard.js') }}"></script>
@endpush
