// auth.js
(function () {
  const form = document.getElementById('loginForm');
  const btn  = document.getElementById('submitButton');
  const btnText = document.getElementById('buttonText');

  if (!form) return;

  // IMPORTANT: on NE PREND PAS la main sur la requête => pas de preventDefault
  form.addEventListener('submit', function () {
    // Validation simple côté client
    const tel = document.getElementById('login-telephone').value.trim();
    const pass = document.getElementById('login-password').value.trim();
    if (!tel || !pass) {
      // On laisse quand même Laravel valider, mais on peut prévenir visuellement
      Toast.show({ type:'warning', title:'Champs requis', message:'Téléphone et mot de passe sont requis.' });
      // on laisse le formulaire partir
    }

    // Affiche le loader sur le bouton
    btn.classList.add('loading');
    btn.disabled = true;
    btnText.dataset.old = btnText.textContent;
    btnText.textContent = 'En cours...';
  });

  // Si la page se recharge avec un message (succès/erreur), ui.js l'affiche via session('toast') dans le layout.
  // On retire le loader si on revient sur le formulaire suite à une erreur.
  window.addEventListener('pageshow', function(){
    if (btn) {
      btn.classList.remove('loading');
      btn.disabled = false;
      if (btnText && btnText.dataset.old) btnText.textContent = btnText.dataset.old;
    }
  });
})();
