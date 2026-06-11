document.addEventListener('DOMContentLoaded', () => {
    console.log('voyages.js chargé');

    // Fonction pour ouvrir le modal
    function openModal() {
        console.log('Ouverture du modal');
        const modal = document.getElementById('voyage-modal');
        modal.classList.add('active');
        setTimeout(() => document.getElementById('trajet_id').focus(), 300);
    }

    // Fonction pour fermer le modal
    function closeModal() {
        console.log('Fermeture du modal');
        const modal = document.getElementById('voyage-modal');
        modal.classList.remove('active');
        setTimeout(() => {
            document.getElementById('voyage-form').reset();
            document.getElementById('voyage-id').value = '';
            document.getElementById('form-method').value = 'POST';
            document.getElementById('modal-title').textContent = 'Ajouter un nouveau voyage';
            document.getElementById('btn-text').textContent = 'Ajouter';
            document.querySelector('.modal-icon i').className = 'fas fa-suitcase-rolling';
        }, 300);
    }

    // Soumettre le formulaire
    document.getElementById('submit-btn').addEventListener('click', async () => {
        console.log('Soumission du formulaire');
        const form = document.getElementById('voyage-form');
        const submitBtn = document.getElementById('submit-btn');
        const loader = document.getElementById('submit-loader');
        const btnText = document.getElementById('btn-text');
        const method = document.getElementById('form-method').value;
        const id = document.getElementById('voyage-id').value;
        const url = method === 'POST' ? '/voyages' : `/voyages/${id}`;

        const formData = {
            trajet_id: parseInt(document.getElementById('trajet_id').value),
            bus_id: parseInt(document.getElementById('bus_id').value),
            chauffeur_id: parseInt(document.getElementById('chauffeur_id').value),
            statut: document.getElementById('statut').value,
            _method: method,
        };

        // Validation côté client
        if (!formData.trajet_id || isNaN(formData.trajet_id) || formData.trajet_id < 1) {
            Toast.show({ type: 'error', title: 'Erreur', message: 'Veuillez sélectionner un trajet valide.' });
            return;
        }
        if (!formData.bus_id || isNaN(formData.bus_id) || formData.bus_id < 1) {
            Toast.show({ type: 'error', title: 'Erreur', message: 'Veuillez sélectionner un bus valide.' });
            return;
        }
        if (!formData.chauffeur_id || isNaN(formData.chauffeur_id) || formData.chauffeur_id < 1) {
            Toast.show({ type: 'error', title: 'Erreur', message: 'Veuillez sélectionner un chauffeur valide.' });
            return;
        }
        if (!formData.statut || !['attente', 'depart', 'arriver'].includes(formData.statut)) {
            Toast.show({ type: 'error', title: 'Erreur', message: 'Veuillez sélectionner un statut valide.' });
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
                        message: data.message || 'Action non autorisée.',
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

    // Modifier un voyage
    window.editVoyage = function(voyage) {
        console.log('Modification du voyage:', voyage);
        document.getElementById('voyage-id').value = voyage.id || '';
        document.getElementById('trajet_id').value = voyage.trajet_id || '';
        document.getElementById('bus_id').value = voyage.bus_id || '';
        document.getElementById('chauffeur_id').value = voyage.chauffeur_id || '';
        document.getElementById('statut').value = voyage.statut || '';
        document.getElementById('form-method').value = 'PUT';
        document.getElementById('modal-title').textContent = 'Modifier le voyage';
        document.getElementById('btn-text').textContent = 'Modifier';
        document.querySelector('.modal-icon i').className = 'fas fa-edit';
        openModal();
    };

    // Supprimer un voyage
    window.deleteVoyage = async function(id) {
        console.log('Suppression du voyage ID:', id);
        Dialog.confirm({
            title: 'Confirmer la suppression',
            message: 'Voulez-vous vraiment supprimer ce voyage ?',
            confirmText: 'Supprimer',
            cancelText: 'Annuler'
        }).then(async (confirmed) => {
            if (confirmed) {
                try {
                    const response = await fetch(`/voyages/${id}`, {
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
                                message: data.message || 'Impossible de supprimer le voyage.',
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

    // Écouteurs d'événements
    document.getElementById('open-modal-btn').addEventListener('click', openModal);
    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    document.getElementById('cancel-btn').addEventListener('click', closeModal);

    document.getElementById('voyage-modal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('voyage-modal');
            if (modal.classList.contains('active')) closeModal();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const modal = document.getElementById('voyage-modal');
            if (modal.classList.contains('active')) document.getElementById('submit-btn').click();
        }
    });

    document.querySelectorAll('.form-input, .form-select').forEach(input => {
        input.addEventListener('input', function() {
            this.style.transform = this.value.length > 0 ? 'translateY(-1px)' : 'translateY(0)';
        });
    });
});