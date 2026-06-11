document.addEventListener('DOMContentLoaded', async () => {
  if (!window.auth.isLoggedIn()) {
    window.location.href = '../index.html';
    return;
  }

  // Éléments DOM
  const garesTableBody = document.getElementById('gares-tbody');
  const searchInput = document.getElementById('searchInput');
  const addGaresBtn = document.getElementById('addGaresBtn');
  const garesModal = document.getElementById('garesModal');
  const garesForm = document.getElementById('garesForm');
  const garesIdInput = document.getElementById('garesId');
  const garesNameInput = document.getElementById('garesName');
  const villeIdSelect = document.getElementById('villeId');
  const garesNumeroInput = document.getElementById('garesNumero');
  const garesPasswordInput = document.getElementById('garesPassword');
  const modalTitle = garesModal.querySelector('h2');
  const submitBtn = garesForm.querySelector('.btn-add');
  const closeModalBtn = garesModal.querySelector('.modal-close');
  const cancelModalBtn = document.getElementById('cancelModalGare');
  const deleteModal = document.getElementById('deleteGaresModal');
  const confirmDeleteBtn = document.getElementById('confirmDeleteGaresBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteGaresBtn');
  const deleteCloseBtn = deleteModal.querySelector('.modal-close');
  const logoutBtn = document.getElementById('nav-logout');

  let currentDeleteId = null;
  let garesData = [];
  let villesData = [];

  // Charger les villes pour le select
  async function loadVilles() {
    try {
      const data = await window.http.get('/villes', { showLoader: true });
      villesData = data;
      villeIdSelect.innerHTML = '<option value="" disabled selected>Sélectionner une ville</option>';
      data.forEach(ville => {
        const option = document.createElement('option');
        option.value = ville.id;
        option.textContent = ville.nom;
        villeIdSelect.appendChild(option);
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.message || 'Impossible de charger les villes.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  }

  // Charger les gares
  async function loadGares() {
    try {
      const data = await window.http.get('/gares', { showLoader: true });
      garesData = data;
      renderGares(data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.message || 'Impossible de charger les gares.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  }

  // Rendu de la table des gares
  function renderGares(gares) {
    garesTableBody.innerHTML = '';
    gares.forEach(gare => {
      const ville = villesData.find(v => v.id === gare.ville_id) || { nom: 'Inconnu' };
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${gare.id}</td>
        <td>${gare.nom}</td>
        <td>${ville.nom}</td>
        <td>${gare.numero}</td>
        <td>
          <button class="btn btn-edit edit-btn" data-id="${gare.id}">
            <i class="fas fa-edit"></i> Modifier
          </button>
          <button class="btn btn-delete delete-btn" data-id="${gare.id}">
            <i class="fas fa-trash"></i> Supprimer
          </button>
        </td>
      `;
      garesTableBody.appendChild(tr);
    });

    // Ajout des listeners pour edit et delete
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', handleEdit);
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', handleDeleteOpen);
    });
  }

  // Recherche en temps réel
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filtered = garesData.filter(gare => 
      gare.nom.toLowerCase().includes(query) || 
      gare.numero.toLowerCase().includes(query) ||
      (villesData.find(v => v.id === gare.ville_id)?.nom || '').toLowerCase().includes(query)
    );
    renderGares(filtered);
  });

  // Ouvrir modal pour ajout
  addGaresBtn.addEventListener('click', () => {
    resetModal();
    garesModal.style.display = 'block';
  });

  // Reset modal pour ajout
  function resetModal() {
    garesIdInput.value = '';
    garesNameInput.value = '';
    villeIdSelect.value = '';
    garesNumeroInput.value = '';
    garesPasswordInput.value = '';
    modalTitle.innerHTML = '<i class="fa-solid fa-briefcase"></i> Nouvelle gare';
    submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Ajouter';
    submitBtn.classList.remove('btn-update');
    submitBtn.classList.add('btn-add');
  }

  // Fermer modal
  closeModalBtn.addEventListener('click', () => garesModal.style.display = 'none');
  cancelModalBtn.addEventListener('click', () => garesModal.style.display = 'none');
  window.addEventListener('click', (e) => {
    if (e.target === garesModal) garesModal.style.display = 'none';
    if (e.target === deleteModal) deleteModal.style.display = 'none';
  });

  // Soumission du formulaire (ajout ou update)
  garesForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = garesIdInput.value;
    const nom = garesNameInput.value.trim();
    const ville_id = parseInt(villeIdSelect.value);
    const numero = garesNumeroInput.value.trim();
    const password = garesPasswordInput.value;

    if (!nom || !ville_id || !numero || (!id && !password)) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation',
        text: 'Tous les champs sont requis.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }

    try {
      let response;
      const payload = { nom, ville_id, numero };
      if (!id) payload.password = password; // Password seulement pour ajout

      if (id) {
        // Update
        response = await window.http.put(`/gares/${id}`, payload, { showLoader: true });
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Gare modifiée avec succès !',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      } else {
        // Ajout
        response = await window.http.post('/gares', payload, { showLoader: true });
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Gare ajoutée avec succès !',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
      garesModal.style.display = 'none';
      await loadGares();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.message || 'Opération échouée.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  });

  // Handle edit
  function handleEdit(e) {
    const id = e.target.dataset.id;
    const gare = garesData.find(g => g.id === parseInt(id));
    if (gare) {
      garesIdInput.value = gare.id;
      garesNameInput.value = gare.nom;
      villeIdSelect.value = gare.ville_id;
      garesNumeroInput.value = gare.numero;
      garesPasswordInput.value = ''; // Ne pas pré-remplir le mot de passe
      modalTitle.innerHTML = '<i class="fa-solid fa-briefcase"></i> Modifier gare';
      submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Modifier';
      submitBtn.classList.remove('btn-add');
      submitBtn.classList.add('btn-update');
      garesModal.style.display = 'block';
    }
  }

  // Ouvrir modal delete
  function handleDeleteOpen(e) {
    currentDeleteId = e.target.dataset.id;
    deleteModal.style.display = 'block';
  }

  // Confirmer delete
  confirmDeleteBtn.addEventListener('click', async () => {
    if (currentDeleteId) {
      try {
        await window.http.delete(`/gares/${currentDeleteId}`, { showLoader: true });
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Gare supprimée avec succès !',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
        deleteModal.style.display = 'none';
        await loadGares();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.message || 'Suppression échouée.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    }
  });

  // Fermer delete modal
  cancelDeleteBtn.addEventListener('click', () => deleteModal.style.display = 'none');
  deleteCloseBtn.addEventListener('click', () => deleteModal.style.display = 'none');

  // Logout
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.auth.logout();
  });

  // Chargement initial
  await loadVilles();
  await loadGares();
});