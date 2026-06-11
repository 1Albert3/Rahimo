// app.js
// Déconnexion via form POST
document.addEventListener('click', function (e) {
  const link = e.target.closest('#nav-logout');
  if (!link) return;

  e.preventDefault();
  const form = document.getElementById('logout-form');
  if (form) form.submit();
});
