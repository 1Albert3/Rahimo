document.addEventListener('DOMContentLoaded', () => {
  console.log('horaires.js chargé');
  updateStats();

  // Ouvrir le modal
  function openModal() {
    console.log('Ouverture du modal');
    const modal = document.getElementById('horaire-modal');
    modal.classList.add('active');
    setTimeout(() => document.getElementById('heure').focus(), 300);
  }

  // Fermer le modal
  function closeModal() {
    console.log('Fermeture du modal');
    const modal = document.getElementById('horaire-modal');
    modal.classList.remove('active');
    setTimeout(() => {
      document.getElementById('horaire-form').reset();
      document.getElementById('horaire-id').value = '';
      document.getElementById('form-method').value = 'POST';
      document.getElementById('modal-title').textContent = 'Ajouter un nouvel horaire';
      document.getElementById('btn-text').textContent = 'Ajouter';
      document.querySelector('.modal-icon i').className = 'fas fa-clock';
    }, 300);
  }

  // Soumettre le formulaire
  document.getElementById('submit-btn').addEventListener('click', async () => {
    console.log('Soumission du formulaire');
    const form = document.getElementById('horaire-form');
    const submitBtn = document.getElementById('submit-btn');
    const loader = document.getElementById('submit-loader');
    const btnText = document.getElementById('btn-text');
    const method = document.getElementById('form-method').value;
    const id = document.getElementById('horaire-id').value;
    const url = method === 'POST' ? '/horaires' : `/horaires/${id}`;

    submitBtn.disabled = true;
    loader.classList.remove('hidden');
    btnText.classList.add('hidden');

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          heure: document.getElementById('heure').value,
          _method: method,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Toast.show({ type: 'success', title: 'Succès', message: data.message });
        window.location.reload();
      } else {
        Toast.show({ type: 'error', title: 'Erreur', message: data.message || 'Une erreur est survenue.' });
      }
    } catch (error) {
      console.error('Erreur AJAX:', error);
      Toast.show({ type: 'error', title: 'Erreur réseau', message: 'Impossible de contacter le serveur.' });
    } finally {
      submitBtn.disabled = false;
      loader.classList.add('hidden');
      btnText.classList.remove('hidden');
    }
  });

  // Modifier un horaire
  window.editHoraire = function(horaire) {
    console.log('Modification de l\'horaire:', horaire);
    document.getElementById('horaire-id').value = horaire.id;
    document.getElementById('heure').value = horaire.heure;
    document.getElementById('form-method').value = 'PUT';
    document.getElementById('modal-title').textContent = 'Modifier l\'horaire';
    document.getElementById('btn-text').textContent = 'Modifier';
    document.querySelector('.modal-icon i').className = 'fas fa-edit';
    openModal();
  };

  // Supprimer un horaire
  window.deleteHoraire = async function(id) {
    console.log('Suppression de l\'horaire ID:', id);
    Dialog.confirm({
      title: 'Confirmer la suppression',
      message: 'Voulez-vous vraiment supprimer cet horaire ?',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    }).then(async (confirmed) => {
      if (confirmed) {
        try {
          const response = await fetch(`/horaires/${id}`, {
            method: 'DELETE',
            headers: {
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
              'Accept': 'application/json',
            },
          });

          const data = await response.json();

          if (response.ok) {
            Toast.show({ type: 'success', title: 'Succès', message: data.message });
            window.location.reload();
          } else {
            Toast.show({ type: 'error', title: 'Erreur', message: data.message || 'Impossible de supprimer l\'horaire.' });
          }
        } catch (error) {
          console.error('Erreur AJAX suppression:', error);
          Toast.show({ type: 'error', title: 'Erreur réseau', message: 'Impossible de contacter le serveur.' });
        }
      }
    });
  };

  // Mettre à jour les statistiques
  function updateStats() {
    const tbody = document.getElementById('horaire-tbody');
    const totalHoraires = tbody.children.length;
    document.getElementById('total-horaires').textContent = totalHoraires;
  }

  // Écouteurs d'événements
  document.getElementById('open-modal-btn').addEventListener('click', openModal);
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('cancel-btn').addEventListener('click', closeModal);

  document.getElementById('horaire-modal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const modal = document.getElementById('horaire-modal');
      if (modal.classList.contains('active')) closeModal();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      const modal = document.getElementById('horaire-modal');
      if (modal.classList.contains('active')) {
        document.getElementById('submit-btn').click();
      }
    }
  });

  document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('input', function() {
      this.style.transform = this.value.length > 0 ? 'translateY(-1px)' : 'translateY(0)';
    });
  });
});