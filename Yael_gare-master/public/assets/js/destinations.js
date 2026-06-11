document.addEventListener('DOMContentLoaded', () => {
  console.log('destinations.js chargé');
  updateStats();

  // Ouvrir le modal
  function openModal() {
    console.log('Ouverture du modal');
    const modal = document.getElementById('destination-modal');
    modal.classList.add('active');
    setTimeout(() => document.getElementById('nom').focus(), 300);
  }

  // Fermer le modal
  function closeModal() {
    console.log('Fermeture du modal');
    const modal = document.getElementById('destination-modal');
    modal.classList.remove('active');
    setTimeout(() => {
      document.getElementById('destination-form').reset();
      document.getElementById('destination-id').value = '';
      document.getElementById('form-method').value = 'POST';
      document.getElementById('modal-title').textContent = 'Ajouter une nouvelle destination';
      document.getElementById('btn-text').textContent = 'Ajouter';
      document.querySelector('.modal-icon i').className = 'fas fa-map-marker-alt';
    }, 300);
  }

  // Soumettre le formulaire
  document.getElementById('submit-btn').addEventListener('click', async () => {
    console.log('Soumission du formulaire');
    const form = document.getElementById('destination-form');
    const submitBtn = document.getElementById('submit-btn');
    const loader = document.getElementById('submit-loader');
    const btnText = document.getElementById('btn-text');
    const method = document.getElementById('form-method').value;
    const id = document.getElementById('destination-id').value;
    const url = method === 'POST' ? '/destinations' : `/destinations/${id}`;

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
          nom: document.getElementById('nom').value,
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

  // Modifier une destination
  window.editDestination = function(destination) {
    console.log('Modification de la destination:', destination);
    document.getElementById('destination-id').value = destination.id;
    document.getElementById('nom').value = destination.nom;
    document.getElementById('form-method').value = 'PUT';
    document.getElementById('modal-title').textContent = 'Modifier la destination';
    document.getElementById('btn-text').textContent = 'Modifier';
    document.querySelector('.modal-icon i').className = 'fas fa-edit';
    openModal();
  };

  // Supprimer une destination
  window.deleteDestination = async function(id) {
    console.log('Suppression de la destination ID:', id);
    Dialog.confirm({
      title: 'Confirmer la suppression',
      message: 'Voulez-vous vraiment supprimer cette destination ?',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    }).then(async (confirmed) => {
      if (confirmed) {
        try {
          const response = await fetch(`/destinations/${id}`, {
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
            Toast.show({ type: 'error', title: 'Erreur', message: data.message || 'Impossible de supprimer la destination.' });
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
    const tbody = document.getElementById('destination-tbody');
    const totalDestinations = tbody.children.length;
    document.getElementById('total-destinations').textContent = totalDestinations;
  }

  // Écouteurs d'événements
  document.getElementById('open-modal-btn').addEventListener('click', openModal);
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('cancel-btn').addEventListener('click', closeModal);

  document.getElementById('destination-modal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const modal = document.getElementById('destination-modal');
      if (modal.classList.contains('active')) closeModal();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      const modal = document.getElementById('destination-modal');
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