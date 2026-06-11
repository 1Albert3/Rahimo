// controllers/reservations.controller.js
delete require.cache[require.resolve('../models/reservations.model')]; // Vider le cache (peut être supprimé après résolution)
const model = require('../models/reservations.model');
const voyagesModel = require('../models/voyages.model');
console.log('>>> [CONTROLLER] Chargement de reservations.controller.js depuis', __filename);
console.log('>>> [CONTROLLER] Méthodes du modèle :', Object.keys(model));

exports.getReservations = async (req, res) => {
  console.log('>>> [CONTROLLER] Appel de getReservations avec gare_id:', req.gare_id);
  try {
    const list = await model.getAll(req.gare_id);
    res.json(list);
  } catch (err) {
    console.error('>>> [CONTROLLER] Erreur dans getReservations:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getReservation = async (req, res) => {
  console.log('>>> [CONTROLLER] Appel de getReservation avec id:', req.params.id, 'gare_id:', req.gare_id);
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    console.log('>>> [CONTROLLER] ID invalide:', req.params.id);
    return res.status(400).json({ error: 'ID invalide' });
  }
  try {
    const reservation = await model.getById(id, req.gare_id);
    if (!reservation) return res.status(404).json({ error: 'Réservation non trouvée ou non autorisée' });
    res.json(reservation);
  } catch (err) {
    console.error('>>> [CONTROLLER] Erreur dans getReservation:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.createReservation = async (req, res) => {
  console.log('>>> [CONTROLLER] Appel de createReservation avec body:', req.body, 'gare_id:', req.gare_id);
  const { nom, prenom, telephone, voyage_id } = req.body;
  if (!nom || !prenom || !telephone || !voyage_id) {
    return res.status(400).json({ error: 'Nom, prénom, téléphone et voyage_id sont requis' });
  }
  if (nom.trim().length === 0 || prenom.trim().length === 0 || telephone.trim().length === 0) {
    return res.status(400).json({ error: 'Nom, prénom et téléphone ne peuvent pas être vides' });
  }
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(telephone)) {
    return res.status(400).json({ error: 'Format de téléphone invalide' });
  }
  try {
    const voyage = await voyagesModel.getById(voyage_id, req.gare_id);
    if (!voyage) return res.status(400).json({ error: 'Voyage non trouvé ou non autorisé' });
    const existingReservation = await model.getByTelephone(telephone, req.gare_id);
    if (existingReservation) return res.status(400).json({ error: 'Numéro de téléphone déjà utilisé pour cette gare' });
    const newReservation = await model.create({
      nom: nom.trim(),
      prenom: prenom.trim(),
      telephone: telephone.trim(),
      voyage_id,
      gare_id: req.gare_id
    });
    console.log('>>> [CONTROLLER] Réservation créée avec id:', newReservation.id);
    res.status(201).json(newReservation);
  } catch (err) {
    console.error('>>> [CONTROLLER] Erreur dans createReservation:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.updateReservation = async (req, res) => {
  console.log('>>> [CONTROLLER] Appel de updateReservation avec id:', req.params.id, 'body:', req.body, 'gare_id:', req.gare_id);
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    console.log('>>> [CONTROLLER] ID invalide:', req.params.id);
    return res.status(400).json({ error: 'ID invalide' });
  }
  const { nom, prenom, telephone, voyage_id } = req.body;
  if (!nom && !prenom && !telephone && !voyage_id) {
    return res.status(400).json({ error: 'Au moins un champ est requis' });
  }
  try {
    const fields = {};
    if (nom) fields.nom = nom.trim();
    if (prenom) fields.prenom = prenom.trim();
    if (telephone) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(telephone)) {
        return res.status(400).json({ error: 'Format de téléphone invalide' });
      }
      const existingReservation = await model.getByTelephone(telephone, req.gare_id);
      if (existingReservation && existingReservation.id !== id) {
        return res.status(400).json({ error: 'Numéro de téléphone déjà utilisé pour cette gare' });
      }
      fields.telephone = telephone.trim();
    }
    if (voyage_id) {
      const voyage = await voyagesModel.getById(voyage_id, req.gare_id);
      if (!voyage) return res.status(400).json({ error: 'Voyage non trouvé ou non autorisé' });
      fields.voyage_id = voyage_id;
    }
    const updated = await model.update(id, fields, req.gare_id);
    if (!updated) return res.status(404).json({ error: 'Réservation non trouvée ou non autorisée' });
    res.json(updated);
  } catch (err) {
    console.error('>>> [CONTROLLER] Erreur dans updateReservation:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteReservation = async (req, res) => {
  console.log('>>> [CONTROLLER] Appel de deleteReservation avec id:', req.params.id, 'gare_id:', req.gare_id);
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    console.log('>>> [CONTROLLER] ID invalide:', req.params.id);
    return res.status(400).json({ error: 'ID invalide' });
  }
  try {
    const result = await model.remove(id, req.gare_id);
    console.log('>>> [CONTROLLER] Résultat de model.remove:', result);
    if (!result) {
      console.log('>>> [CONTROLLER] Aucune réservation trouvée pour id:', id, 'gare_id:', req.gare_id);
      return res.status(404).json({ error: 'Réservation non trouvée ou non autorisée' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('>>> [CONTROLLER] Erreur dans deleteReservation:', err.message);
    res.status(500).json({ error: err.message });
  }
};