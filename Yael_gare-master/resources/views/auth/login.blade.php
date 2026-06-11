<!-- resources/views/auth/login.blade.php -->
@extends('layouts.auth')
@section('title','Yael - Connexion')

@section('content')
  <div class="auth-container">
    <!-- Section gauche avec image -->
    <div class="auth-left">
      <div class="auth-image-placeholder">
        <i class="fas fa-sign-in-alt fa-4x"></i>
        <h2>Bienvenue !</h2>
        <p>Connectez-vous à votre espace d'administration pour gérer efficacement votre gare</p>
      </div>
    </div>

    <!-- Section droite avec formulaire -->
    <div class="auth-right">
      <div class="auth-form">
        <div class="auth-header">
          <h1 class="auth-title">
            <i class="fas fa-route" style="color: var(--primary-red);"></i>
            Yael
          </h1>
          <h2 class="auth-title">Connexion</h2>
          <p class="auth-subtitle">Accédez à votre tableau de bord</p>
        </div>

        <form id="loginForm" method="POST" action="{{ route('login.perform') }}">
          @csrf
          <div class="form-group">
            <i class="fas fa-phone form-icon"></i>
            <input
              type="tel"
              name="numero"
              id="login-telephone"
              class="form-control"
              placeholder=" "
              value="{{ old('numero') }}"
              required>
            <label class="form-label" for="login-telephone">Téléphone</label>
          </div>

          <div class="form-group">
            <i class="fas fa-lock form-icon"></i>
            <input
              type="password"
              name="password"
              id="login-password"
              class="form-control"
              placeholder=" "
              required>
            <label class="form-label" for="login-password">Mot de passe</label>
          </div>

          <div class="d-flex justify-content-between align-items-center mb-4">
            <label class="d-flex align-items-center">
              <input type="checkbox" name="remember" class="form-check-input me-2">
              <span style="font-size: 14px; color: var(--dark-gray);">Se souvenir de moi</span>
            </label>
            <a href="#" class="auth-link" style="font-size: 14px;">Mot de passe oublié ?</a>
          </div>

          <button type="submit" class="btn btn-primary btn-lg w-100 mb-4" id="submitButton">
            <i class="fas fa-sign-in-alt me-2"></i>
            <span id="buttonText">Se connecter</span>
          </button>
        </form>
      </div>
    </div>
  </div>
@endsection
