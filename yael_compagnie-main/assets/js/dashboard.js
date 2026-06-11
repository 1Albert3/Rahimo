//-- logique de la page dashboard  --
(async function () {
  const loader    = document.getElementById('app-loader');
  const welcomeEl = document.getElementById('welcome');
  const btnLogout = document.getElementById('btn-logout');
  const navLogout = document.getElementById('nav-logout'); // optionnel

  function showLoader(show) {
    if (loader) loader.classList.toggle('hidden', !show);
  }

  // Si pas connecté, on renvoie vers la page de login
  if (!window.auth.isLoggedIn()) {
    window.location.href = '/index.html';
    return;
  }

  // Affiche "Bienvenue, email" si l'élément existe
  const email = window.auth.getEmail();
  if (welcomeEl && email) {
    welcomeEl.textContent = `Bienvenue, ${email}`;
  }

  // Branche le logout sur le bouton ET le lien de la sidebar
  const doLogout = (e) => {
    if (e) e.preventDefault();
    window.auth.logout();
  };

  if (btnLogout) btnLogout.addEventListener('click', doLogout);
  if (navLogout) navLogout.addEventListener('click', doLogout);

  // --- exemple de chargement de données protégées ---
  // showLoader(true);
  // try {
  //   const data = await window.http('/trajets');
  //   // ...
  // } catch (err) {
  //   console.error(err);
  // } finally {
  //   showLoader(false);
  // }
})();
