document.addEventListener('DOMContentLoaded', () => {
  console.log('bus.js chargé');
  updateStats();

  // Ouvrir le modal
  function openModal() {
    console.log('Ouverture du modal');
    const modal = document.getElementById('bus-modal');
    modal.classList.add('active');
    setTimeout(() => document.getElementById('nom').focus(), 300);
  }

  // Fermer le modal
  function closeModal() {
    console.log('Fermeture du modal');
    const modal = document.getElementById('bus-modal');
    modal.classList.remove('active');
    setTimeout(() => {
      document.getElementById('bus-form').reset();
      document.getElementById('bus-id').value = '';
      document.getElementById('form-method').value = 'POST';
      document.getElementById('modal-title').textContent = 'Ajouter un nouveau bus';
      document.getElementById('btn-text').textContent = 'Ajouter';
      document.querySelector('.modal-icon i').className = 'fas fa-bus';
    }, 300);
  }

  // Soumettre le formulaire
  document.getElementById('submit-btn').addEventListener('click', async () => {
    console.log('Soumission du formulaire');
    const form = document.getElementById('bus-form');
    const submitBtn = document.getElementById('submit-btn');
    const loader = document.getElementById('submit-loader');
    const btnText = document.getElementById('btn-text');
    const method = document.getElementById('form-method').value;
    const id = document.getElementById('bus-id').value;
    const url = method === 'POST' ? '/bus' : `/bus/${id}`;

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
          matricule: document.getElementById('matricule').value,
          capacite: parseInt(document.getElementById('capacite').value),
          statut: document.getElementById('statut').value,
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

  // Modifier un bus
  window.editBus = function(bus) {
    console.log('Modification du bus:', bus);
    document.getElementById('bus-id').value = bus.id;
    document.getElementById('nom').value = bus.nom;
    document.getElementById('matricule').value = bus.matricule;
    document.getElementById('capacite').value = bus.capacite;
    document.getElementById('statut').value = bus.statut;
    document.getElementById('form-method').value = 'PUT';
    document.getElementById('modal-title').textContent = 'Modifier le bus';
    document.getElementById('btn-text').textContent = 'Modifier';
    document.querySelector('.modal-icon i').className = 'fas fa-edit';
    openModal();
  };

  // Supprimer un bus
  window.deleteBus = async function(id) {
    console.log('Suppression du bus ID:', id);
    Dialog.confirm({
      title: 'Confirmer la suppression',
      message: 'Voulez-vous vraiment supprimer ce bus ?',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    }).then(async (confirmed) => {
      if (confirmed) {
        try {
          const response = await fetch(`/bus/${id}`, {
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
            Toast.show({ type: 'error', title: 'Erreur', message: data.message || 'Impossible de supprimer le bus.' });
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
    const tbody = document.getElementById('bus-tbody');
    const totalBus = tbody.children.length;
    document.getElementById('total-bus').textContent = totalBus;
  }

  // Écouteurs d'événements
  document.getElementById('open-modal-btn').addEventListener('click', openModal);
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('cancel-btn').addEventListener('click', closeModal);

  document.getElementById('bus-modal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const modal = document.getElementById('bus-modal');
      if (modal.classList.contains('active')) closeModal();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      const modal = document.getElementById('bus-modal');
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