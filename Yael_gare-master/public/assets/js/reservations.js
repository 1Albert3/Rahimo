let currentEditId = null;

// Fonction pour afficher/masquer le loader
function toggleLoader(show) {
  const validateBtn = document.getElementById('btn-validate');
  const btnText = document.getElementById('btn-text');
  const loader = document.getElementById('btn-loader');
  validateBtn.disabled = show;
  btnText.style.display = show ? 'none' : 'inline';
  loader.classList.toggle('hidden', !show);
}

// Fonction pour ouvrir le modal
function openModal() {
  const modal = document.getElementById('reservation-modal');
  modal.classList.add('active');
  
  // Focus sur le premier champ
  setTimeout(() => {
    document.getElementById('nom').focus();
  }, 300);
}

// Fonction pour fermer le modal
function closeModal() {
  const modal = document.getElementById('reservation-modal');
  modal.classList.remove('active');
  
  // Reset des champs et état
  setTimeout(() => {
    document.getElementById('nom').value = '';
    document.getElementById('prenom').value = '';
    document.getElementById('telephone').value = '';
    document.getElementById('voyage_id').value = '';
    currentEditId = null;
    document.getElementById('modal-title').textContent = 'Ajouter une nouvelle réservation';
    document.getElementById('btn-text').textContent = 'Ajouter';
    document.querySelector('.modal-icon i').className = 'fas fa-ticket-alt';
  }, 300);
}

// Fonction pour charger les réservations
async function loadReservations() {
  try {
    const response = await fetch('/api/reservations', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${document.querySelector('meta[name="auth-token"]').content}`,
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }
    const reservations = await response.json();
    console.log('Réservations récupérées:', reservations);
    
    const tbody = document.getElementById('reservation-tbody');
    tbody.innerHTML = '';
    
    reservations.forEach(reservation => {
      const row = document.createElement('tr');
      row.dataset.id = reservation.id;
      const formattedDate = new Date(reservation.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      row.innerHTML = `
        <td>#RES${String(reservation.id).padStart(3, '0')}</td>
        <td>${reservation.nom}</td>
        <td>${reservation.prenom}</td>
        <td>${reservation.telephone}</td>
        <td>Voyage ${reservation.voyage_id}</td>
        <td>${formattedDate}</td>
        <td><span class="status-badge status-confirmed">Confirmée</span></td>
        <td>
          <button class="action-btn edit-btn" onclick="editReservation(${reservation.id}, '${reservation.nom.replace(/'/g, "\\'")}', '${reservation.prenom.replace(/'/g, "\\'")}', '${reservation.telephone}', ${reservation.voyage_id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn" onclick="deleteReservation(${reservation.id})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });

    updateStats(reservations);
  } catch (error) {
    console.error('Erreur lors du chargement des réservations:', error);
    Toast.show({ type: 'error', title: 'Erreur', message: error.message || 'Impossible de charger les réservations.' });
  }
}

// Fonction pour charger les voyages dans le menu déroulant
async function loadVoyages() {
  try {
    const response = await fetch('/api/voyages', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${document.querySelector('meta[name="auth-token"]').content}`,
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }
    const voyages = await response.json();
    console.log('Voyages récupérés:', voyages);
    
    const voyageSelect = document.getElementById('voyage_id');
    voyageSelect.innerHTML = '<option value="">Sélectionner un voyage</option>';
    
    voyages.forEach(voyage => {
      const option = document.createElement('option');
      option.value = voyage.id;
      option.textContent = `Voyage ${voyage.id} - ${voyage.nom || 'Sans nom'}`;
      voyageSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Erreur lors du chargement des voyages:', error);
    Toast.show({ type: 'error', title: 'Erreur', message: error.message || 'Impossible de charger les voyages.' });
  }
}

// Fonction pour valider le formulaire
async function validateForm() {
  const nom = document.getElementById('nom').value.trim();
  const prenom = document.getElementById('prenom').value.trim();
  const telephone = document.getElementById('telephone').value.trim();
  const voyage_id = parseInt(document.getElementById('voyage_id').value);

  // Validation des champs obligatoires
  if (!nom || !prenom || !telephone || isNaN(voyage_id)) {
    Toast.show({ type: 'error', title: 'Erreur', message: 'Veuillez remplir tous les champs.' });
    return;
  }

  // Validation du téléphone
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(telephone)) {
    Toast.show({ type: 'error', title: 'Erreur', message: 'Le numéro de téléphone doit être valide (ex: +1234567890 ou 70123456).' });
    return;
  }

  // Validation du voyage_id
  if (voyage_id < 1) {
    Toast.show({ type: 'error', title: 'Erreur', message: 'L\'ID du voyage doit être supérieur ou égal à 1.' });
    return;
  }

  toggleLoader(true);
  try {
    const payload = { nom, prenom, telephone, voyage_id };
    const url = currentEditId ? `/api/reservations/${currentEditId}` : '/api/reservations';
    const method = currentEditId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${document.querySelector('meta[name="auth-token"]').content}`,
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Erreur serveur');

    Toast.show({ type: 'success', title: 'Succès', message: result.message });
    closeModal();
    loadReservations();
  } catch (error) {
    console.error('Erreur lors de la soumission:', error);
    Toast.show({ type: 'error', title: 'Erreur', message: error.message || 'Impossible de soumettre la réservation.' });
  } finally {
    toggleLoader(false);
  }
}

// Fonction pour modifier une réservation
function editReservation(id, nom, prenom, telephone, voyage_id) {
  currentEditId = id;
  document.getElementById('nom').value = nom;
  document.getElementById('prenom').value = prenom;
  document.getElementById('telephone').value = telephone;
  document.getElementById('voyage_id').value = voyage_id;
  document.getElementById('modal-title').textContent = 'Modifier la réservation';
  document.getElementById('btn-text').textContent = 'Modifier';
  document.querySelector('.modal-icon i').className = 'fas fa-edit';
  
  openModal();
}

// Fonction pour supprimer une réservation
async function deleteReservation(id) {
  Dialog.confirm({
    title: 'Confirmer la suppression',
    message: 'Voulez-vous vraiment supprimer cette réservation ?',
    confirmText: 'Supprimer',
    cancelText: 'Annuler'
  }).then(async confirmed => {
    if (confirmed) {
      try {
        const response = await fetch(`/api/reservations/${id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${document.querySelector('meta[name="auth-token"]').content}`,
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
          }
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Erreur serveur');

        Toast.show({ type: 'success', title: 'Succès', message: result.message });
        loadReservations();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        Toast.show({ type: 'error', title: 'Erreur', message: error.message || 'Impossible de supprimer la réservation.' });
      }
    }
  });
}

// Fonction pour mettre à jour les statistiques
function updateStats(reservations) {
  const totalReservations = reservations.length;
  // Puisque 'statut' n'existe pas dans les données, on suppose toutes les réservations comme confirmées
  const reservationsConfirmees = reservations.length;
  const reservationsEnAttente = 0;
  const reservationsAnnulees = 0;

  document.getElementById('total-reservations').textContent = totalReservations;
  document.getElementById('reservations-confirmees').textContent = reservationsConfirmees;
  document.getElementById('reservations-en-attente').textContent = reservationsEnAttente;
  document.getElementById('reservations-annulees').textContent = reservationsAnnulees;
}

// Event listeners
document.getElementById('open-modal-btn').addEventListener('click', () => {
  openModal();
  loadVoyages();
});

// Fermer le modal en cliquant à l'extérieur
document.getElementById('reservation-modal').addEventListener('click', function(e) {
  if (e.target === this) {
    closeModal();
  }
});

// Fermer le modal avec la touche Échap
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const modal = document.getElementById('reservation-modal');
    if (modal.classList.contains('active')) {
      closeModal();
    }
  }
});

// Soumission avec Entrée
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    const modal = document.getElementById('reservation-modal');
    if (modal.classList.contains('active')) {
      validateForm();
    }
  }
});

// Animation sur les champs de saisie
document.querySelectorAll('.form-input, .form-select').forEach(input => {
  input.addEventListener('input', function() {
    if (this.value.length > 0) {
      this.style.transform = 'translateY(-1px)';
    } else {
      this.style.transform = 'translateY(0)';
    }
  });
});

// Charger les données au démarrage
document.addEventListener('DOMContentLoaded', () => {
  loadReservations();
  loadVoyages();
});