// -- logique de la page login -- 

(function () {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const emailEl = document.getElementById('login-email');
  const passEl  = document.getElementById('login-password');
  const submit  = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = (emailEl?.value || '').trim();
    const password = passEl?.value || '';

    if (!email || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Champs manquants',
        text: 'Merci de renseigner email et mot de passe.',
        toast: true,
        position: 'top-end',
        timer: 2500,
        showConfirmButton: false,
      });
      return;
    }

    // petit “loading” sur le bouton
    const original = submit.innerHTML;
    submit.disabled = true;
    submit.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Connexion…`;

    try {
      // appel API
      const { token } = await window.http('/users/login', 'POST', { email, password });

      // persist session attendue par dashboard.js
      localStorage.setItem('yael_token', token);
      localStorage.setItem('yael_email', email);

      // toast succès
      await Swal.fire({
        icon: 'success',
        title: 'Connexion réussie',
        text: `Bienvenue, ${email}`,
        toast: true,
        position: 'top-end',
        timer: 1200,
        showConfirmButton: false,
      });

      // redirection
      window.location.href = 'pages/dashboard.html';
    } catch (err) {
      // message d’erreur lisible
      const msg =
        err?.error ||
        err?.message ||
        'Email ou mot de passe invalide.';

      Swal.fire({
        icon: 'error',
        title: 'Échec de connexion',
        text: msg,
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false,
      });
    } finally {
      submit.disabled = false;
      submit.innerHTML = original;
    }
  });
})();
