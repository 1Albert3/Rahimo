// assets/js/villes.js

// Vérification de l'authentification au chargement
document.addEventListener('DOMContentLoaded', async () => {
  if (!window.auth.isLoggedIn()) {
    window.location.href = '../index.html';
    return;
  }

  // Éléments DOM
  const villesTableBody = document.getElementById('villes-tbody');
  const searchInput = document.getElementById('searchInput');
  const addVillesBtn = document.getElementById('addvillesBtn');
  const villesModal = document.getElementById('villesModal');
  const villesForm = document.getElementById('villesForm');
  const villesIdInput = document.getElementById('villesId');
  const villesNameInput = document.getElementById('villesName');
  const modalTitle = villesModal.querySelector('h2');
  const submitBtn = villesForm.querySelector('.btn-add');
  const closeModalBtn = villesModal.querySelector('.modal-close');
  const cancelModalBtn = document.getElementById('cancelModalStop');
  const deleteModal = document.getElementById('deletevillesModal');
  const confirmDeleteBtn = document.getElementById('confirmDeletevillesBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeletevillesBtn');
  const deleteCloseBtn = deleteModal.querySelector('.modal-close');
  const logoutBtn = document.getElementById('nav-logout');

  let currentDeleteId = null;
  let villesData = []; // Stockage local pour recherche

  // Fonction pour charger les villes
  async function loadVilles() {
    try {
      const data = await window.http.get('/villes', { showLoader: true });
      villesData = data;
      renderVilles(data);
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

  // Rendu de la table des villes
  function renderVilles(villes) {
    villesTableBody.innerHTML = '';
    villes.forEach(ville => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${ville.id}</td>
        <td>${ville.nom}</td>
        <td>
          <button class="btn btn-edit edit-btn" data-id="${ville.id}">
            <i class="fas fa-edit"></i> Modifier
          </button>
          <button class="btn btn-delete delete-btn" data-id="${ville.id}">
            <i class="fas fa-trash"></i> Supprimer
          </button>
        </td>
      `;
      villesTableBody.appendChild(tr);
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
    const filtered = villesData.filter(ville => ville.nom.toLowerCase().includes(query));
    renderVilles(filtered);
  });

  // Ouvrir modal pour ajout
  addVillesBtn.addEventListener('click', () => {
    resetModal();
    villesModal.style.display = 'block';
  });

  // Reset modal pour ajout
  function resetModal() {
    villesIdInput.value = '';
    villesNameInput.value = '';
    modalTitle.innerHTML = '<i class="fa-solid fa-map-signs"></i> Nouvelle ville';
    submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Ajouter';
    submitBtn.classList.remove('btn-update');
    submitBtn.classList.add('btn-add');
  }

  // Fermer modal
  closeModalBtn.addEventListener('click', () => villesModal.style.display = 'none');
  cancelModalBtn.addEventListener('click', () => villesModal.style.display = 'none');
  window.addEventListener('click', (e) => {
    if (e.target === villesModal) villesModal.style.display = 'none';
    if (e.target === deleteModal) deleteModal.style.display = 'none';
  });

  // Soumission du formulaire (ajout ou update)
  villesForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = villesIdInput.value;
    const nom = villesNameInput.value.trim();

    if (!nom) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation',
        text: 'Le nom de la ville est requis.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }

    try {
      let response;
      if (id) {
        // Update
        response = await window.http.put(`/villes/${id}`, { nom }, { showLoader: true });
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Ville modifiée avec succès !',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      } else {
        // Ajout
        response = await window.http.post('/villes', { nom }, { showLoader: true });
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Ville ajoutée avec succès !',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
      villesModal.style.display = 'none';
      await loadVilles();
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
    const ville = villesData.find(v => v.id === parseInt(id));
    if (ville) {
      villesIdInput.value = ville.id;
      villesNameInput.value = ville.nom;
      modalTitle.innerHTML = '<i class="fa-solid fa-map-signs"></i> Modifier ville';
      submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Modifier';
      submitBtn.classList.remove('btn-add');
      submitBtn.classList.add('btn-update');
      villesModal.style.display = 'block';
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
        await window.http.delete(`/villes/${currentDeleteId}`, { showLoader: true });
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Ville supprimée avec succès !',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
        deleteModal.style.display = 'none';
        await loadVilles();
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
});