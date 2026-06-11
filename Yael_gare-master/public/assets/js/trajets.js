document.addEventListener('DOMContentLoaded', () => {
  console.log('trajets.js chargé');
  updateStats();

  // Ouvrir le modal
  function openModal() {
    console.log('Ouverture du modal');
    const modal = document.getElementById('trajet-modal');
    modal.classList.add('active');
    setTimeout(() => document.getElementById('nom').focus(), 300);
  }

  // Fermer le modal
  function closeModal() {
    console.log('Fermeture du modal');
    const modal = document.getElementById('trajet-modal');
    modal.classList.remove('active');
    setTimeout(() => {
      document.getElementById('trajet-form').reset();
      document.getElementById('trajet-id').value = '';
      document.getElementById('form-method').value = 'POST';
      document.getElementById('modal-title').textContent = 'Ajouter un nouveau trajet';
      document.getElementById('btn-text').textContent = 'Ajouter';
      document.querySelector('.modal-icon i').className = 'fas fa-route';
    }, 300);
  }

  // Soumettre le formulaire
  document.getElementById('submit-btn').addEventListener('click', async () => {
    console.log('Soumission du formulaire');
    const form = document.getElementById('trajet-form');
    const submitBtn = document.getElementById('submit-btn');
    const loader = document.getElementById('submit-loader');
    const btnText = document.getElementById('btn-text');
    const method = document.getElementById('form-method').value;
    const id = document.getElementById('trajet-id').value;
    const url = method === 'POST' ? '/trajets' : `/trajets/${id}`;
    const departGareId = parseInt(document.getElementById('depart_gare_id').value, 10);
    console.log('depart_gare_id:', departGareId);
    if (isNaN(departGareId) || departGareId <= 0) {
        Toast.show({ type: 'error', title: 'Erreur', message: 'ID de gare invalide.' });
        return;
    }

    const formData = {
      nom: document.getElementById('nom').value.trim(),
      depart_gare_id: departGareId,
      destination_id: parseInt(document.getElementById('destination_id').value),
      duree: document.getElementById('duree').value.trim(),
      horaire_id: parseInt(document.getElementById('horaire_id').value),
      date: document.getElementById('date').value.trim(),
      prix: parseFloat(document.getElementById('prix').value) || 0,
      _method: method,
    };

    // Validation côté client
    if (!formData.nom) {
      Toast.show({ type: 'error', title: 'Erreur', message: 'Le nom du trajet est requis.' });
      return;
    }
    if (!formData.depart_gare_id || isNaN(formData.depart_gare_id)) {
      Toast.show({ type: 'error', title: 'Erreur', message: 'ID de gare de départ invalide.' });
      return;
    }
    if (!formData.destination_id || formData.destination_id === 0) {
      Toast.show({ type: 'error', title: 'Erreur', message: 'Veuillez sélectionner une destination.' });
      return;
    }
    if (!formData.duree || !/^([0-9][0-9]):[0-5][0-9]$/.test(formData.duree)) {
      Toast.show({ type: 'error', title: 'Erreur', message: 'Format de durée invalide (HH:MM).' });
      return;
    }
    if (!formData.horaire_id || formData.horaire_id === 0) {
      Toast.show({ type: 'error', title: 'Erreur', message: 'Veuillez sélectionner un horaire.' });
      return;
    }
    if (!formData.date) {
      Toast.show({ type: 'error', title: 'Erreur', message: 'La date est requise.' });
      return;
    }
    if (formData.prix <= 0) {
      Toast.show({ type: 'error', title: 'Erreur', message: 'Le prix doit être supérieur à 0.' });
      return;
    }

    console.log('Données envoyées:', formData);

    submitBtn.disabled = true;
    loader.classList.remove('hidden');
    btnText.classList.add('hidden');

    try {
      const response = await fetch(url, {
        method: 'POST', // Toujours POST, Laravel gère _method
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Réponse serveur:', data);

      if (response.ok) {
        Toast.show({ type: 'success', title: 'Succès', message: data.message });
        closeModal();
        setTimeout(() => window.location.reload(), 1000);
      } else {
        if (response.status === 401) {
          Toast.show({
            type: 'error',
            title: 'Session expirée',
            message: 'Veuillez vous reconnecter.',
          });
          setTimeout(() => window.location.href = '/login', 2000);
        } else if (response.status === 422) {
          const errors = data.errors || {};
          const firstError = Object.values(errors)[0];
          Toast.show({
            type: 'error',
            title: 'Erreur de validation',
            message: Array.isArray(firstError) ? firstError[0] : (data.message || 'Données invalides.'),
          });
        } else if (response.status === 403) {
          Toast.show({
            type: 'error',
            title: 'Accès refusé',
            message: data.message || 'Vous ne pouvez créer un trajet que pour votre gare.',
          });
        } else {
          Toast.show({
            type: 'error',
            title: 'Erreur',
            message: data.message || 'Une erreur est survenue.',
          });
        }
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

  // Modifier un trajet
  window.editTrajet = function(trajet) {
    console.log('Modification du trajet:', trajet);
    
    const currentGareId = document.getElementById('depart_gare_id').value;
    console.log('ID gare courante:', currentGareId);
    
    document.getElementById('trajet-id').value = trajet.id || '';
    document.getElementById('nom').value = trajet.nom || '';
    document.getElementById('destination_id').value = trajet.destination_id || '';
    
    // Convertir duree en HH:MM
    let duree = trajet.duree || '';
    if (typeof duree === 'object' && duree !== null) {
        const hours = String(duree.hours || 0).padStart(2, '0');
        const minutes = String(duree.minutes || 0).padStart(2, '0');
        duree = `${hours}:${minutes}`;
    }
    document.getElementById('duree').value = duree;
    
    document.getElementById('horaire_id').value = trajet.horaire_id || '';
    document.getElementById('date').value = trajet.date ? trajet.date.split('T')[0] : '';
    document.getElementById('prix').value = trajet.prix || '';
    document.getElementById('form-method').value = 'PUT';
    document.getElementById('modal-title').textContent = 'Modifier le trajet';
    document.getElementById('btn-text').textContent = 'Modifier';
    document.querySelector('.modal-icon i').className = 'fas fa-edit';
    openModal();
  };

  // Supprimer un trajet
  window.deleteTrajet = async function(id) {
    console.log('Suppression du trajet ID:', id);
    Dialog.confirm({
      title: 'Confirmer la suppression',
      message: 'Voulez-vous vraiment supprimer ce trajet ?',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    }).then(async (confirmed) => {
      if (confirmed) {
        try {
          const response = await fetch(`/trajets/${id}`, {
            method: 'DELETE',
            headers: {
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
              'Accept': 'application/json',
            },
          });

          const data = await response.json();

          if (response.ok) {
            Toast.show({ type: 'success', title: 'Succès', message: data.message });
            setTimeout(() => window.location.reload(), 1000);
          } else {
            if (response.status === 401) {
              Toast.show({
                type: 'error',
                title: 'Session expirée',
                message: 'Veuillez vous reconnecter.',
              });
              setTimeout(() => window.location.href = '/login', 2000);
            } else {
              Toast.show({
                type: 'error',
                title: 'Erreur',
                message: data.message || 'Impossible de supprimer le trajet.',
              });
            }
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
    const tbody = document.getElementById('trajet-tbody');
    const totalTrajets = tbody.children.length;
    document.getElementById('total-trajets').textContent = totalTrajets;
  }

  // Écouteurs d'événements
  document.getElementById('open-modal-btn').addEventListener('click', openModal);
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('cancel-btn').addEventListener('click', closeModal);

  document.getElementById('trajet-modal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const modal = document.getElementById('trajet-modal');
      if (modal.classList.contains('active')) closeModal();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      const modal = document.getElementById('trajet-modal');
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