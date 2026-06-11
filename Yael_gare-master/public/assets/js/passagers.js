document.addEventListener('DOMContentLoaded', () => {
    console.log('passagers.js chargé');

    // Fonction pour ouvrir le modal
    function openModal() {
        console.log('Ouverture du modal');
        const modal = document.getElementById('passager-modal');
        modal.classList.add('active');
        setTimeout(() => document.getElementById('nom').focus(), 300);
    }

    // Fonction pour fermer le modal
    function closeModal() {
        console.log('Fermeture du modal');
        const modal = document.getElementById('passager-modal');
        modal.classList.remove('active');
        setTimeout(() => {
            document.getElementById('passager-form').reset();
            document.getElementById('passager-id').value = '';
            document.getElementById('form-method').value = 'POST';
            document.getElementById('modal-title').textContent = 'Ajouter un nouveau passager';
            document.getElementById('btn-text').textContent = 'Ajouter';
            document.querySelector('.modal-icon i').className = 'fas fa-users';
        }, 300);
    }

    // Soumettre le formulaire
    document.getElementById('submit-btn').addEventListener('click', async () => {
        console.log('Soumission du formulaire');
        const form = document.getElementById('passager-form');
        const submitBtn = document.getElementById('submit-btn');
        const loader = document.getElementById('submit-loader');
        const btnText = document.getElementById('btn-text');
        const method = document.getElementById('form-method').value;
        const id = document.getElementById('passager-id').value;
        const url = method === 'POST' ? '/passagers' : `/passagers/${id}`;

        const formData = {
            nom: document.getElementById('nom').value.trim(),
            prenom: document.getElementById('prenom').value.trim(),
            telephone: document.getElementById('telephone').value.trim(),
            numerocnib: document.getElementById('numerocnib').value.trim(),
            date_etablissement: document.getElementById('date_etablissement').value,
            date_expiration: document.getElementById('date_expiration').value,
            trajet_id: parseInt(document.getElementById('trajet_id').value),
            codeqr: document.getElementById('codeqr').value.trim(),
            _method: method,
        };

        // Validation côté client
        if (!formData.nom) {
            Toast.show({ type: 'error', title: 'Erreur', message: 'Veuillez entrer un nom.' });
            return;
        }
        if (!formData.prenom) {
            Toast.show({ type: 'error', title: 'Erreur', message: 'Veuillez entrer un prénom.' });
            return;
        }
        if (!/^\d{8}$/.test(formData.telephone)) {
            Toast.show({ type: 'error', title: 'Erreur', message: 'Le numéro de téléphone doit contenir exactement 8 chiffres.' });
            return;
        }
        if (!/^B\d{8}$/.test(formData.numerocnib)) {
            Toast.show({ type: 'error', title: 'Erreur', message: 'Le numéro CNIB doit être au format B12345678 (B suivi de 8 chiffres).' });
            return;
        }
        const today = new Date().toISOString().split('T')[0];
        if (!formData.date_etablissement || formData.date_etablissement > today) {
            Toast.show({ type: 'error', title: 'Erreur', message: 'La date d\'établissement ne peut pas être future.' });
            return;
        }
        if (!formData.date_expiration || formData.date_expiration <= formData.date_etablissement) {
            Toast.show({ type: 'error', title: 'Erreur', message: 'La date d\'expiration doit être postérieure à la date d\'établissement.' });
            return;
        }
        if (!formData.trajet_id || isNaN(formData.trajet_id) || formData.trajet_id < 1) {
            Toast.show({ type: 'error', title: 'Erreur', message: 'Veuillez sélectionner un trajet valide.' });
            return;
        }
        if (!formData.codeqr) {
            Toast.show({ type: 'error', title: 'Erreur', message: 'Veuillez entrer un code QR.' });
            return;
        }

        console.log('Données envoyées:', formData);

        submitBtn.disabled = true;
        loader.classList.remove('hidden');
        btnText.classList.add('hidden');

        try {
            const response = await fetch(url, {
                method: 'POST', // Always POST, Laravel handles _method
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

    // Modifier un passager
    window.editPassager = function(passager) {
        console.log('Modification du passager:', passager);
        document.getElementById('passager-id').value = passager.id || '';
        document.getElementById('nom').value = passager.nom || '';
        document.getElementById('prenom').value = passager.prenom || '';
        document.getElementById('telephone').value = passager.telephone || '';
        document.getElementById('numerocnib').value = passager.numerocnib || '';
        document.getElementById('date_etablissement').value = passager.date_etablissement || '';
        document.getElementById('date_expiration').value = passager.date_expiration || '';
        document.getElementById('trajet_id').value = passager.trajet_id || '';
        document.getElementById('codeqr').value = passager.codeqr || '';
        document.getElementById('form-method').value = 'PUT';
        document.getElementById('modal-title').textContent = 'Modifier le passager';
        document.getElementById('btn-text').textContent = 'Modifier';
        document.querySelector('.modal-icon i').className = 'fas fa-edit';
        openModal();
    };

    // Supprimer un passager
    window.deletePassager = async function(passager) {
        const id = passager.id;
        console.log('Tentative de suppression passager ID:', id);
        if (!id || isNaN(id) || id <= 0) {
            Toast.show({ type: 'error', title: 'Erreur', message: 'ID du passager invalide.' });
            return;
        }
        Dialog.confirm({
            title: 'Confirmer la suppression',
            message: 'Voulez-vous vraiment supprimer ce passager ?',
            confirmText: 'Supprimer',
            cancelText: 'Annuler'
        }).then(async (confirmed) => {
            if (confirmed) {
                try {
                    const response = await fetch(`/passagers/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                            'Accept': 'application/json',
                        },
                    });

                    const data = await response.json();
                    console.log('Réponse serveur pour suppression:', data);

                    if (response.ok || (response.status === 404 && data.message.includes('supprimé'))) {
                        Toast.show({ type: 'success', title: 'Succès', message: 'Passager supprimé avec succès.' });
                        setTimeout(() => window.location.reload(), 1000);
                    } else {
                        if (response.status === 401) {
                            Toast.show({
                                type: 'error',
                                title: 'Session expirée',
                                message: 'Veuillez vous reconnecter.',
                            });
                            setTimeout(() => window.location.href = '/login', 2000);
                        } else if (response.status === 404) {
                            Toast.show({
                                type: 'error',
                                title: 'Erreur',
                                message: data.message || 'Passager non trouvé.',
                            });
                        } else {
                            Toast.show({
                                type: 'error',
                                title: 'Erreur',
                                message: data.message || 'Impossible de supprimer le passager.',
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

    document.getElementById('passager-modal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('passager-modal');
            if (modal.classList.contains('active')) closeModal();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const modal = document.getElementById('passager-modal');
            if (modal.classList.contains('active')) document.getElementById('submit-btn').click();
        }
    });

    document.querySelectorAll('.form-input, .form-select').forEach(input => {
        input.addEventListener('input', function() {
            this.style.transform = this.value.length > 0 ? 'translateY(-1px)' : 'translateY(0)';
        });
    });
});