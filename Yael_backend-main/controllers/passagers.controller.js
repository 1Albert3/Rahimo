// controllers/passagers.controller.js
delete require.cache[require.resolve('../models/passagers.model')]; // Vider le cache (peut être supprimé après résolution)
const model = require('../models/passagers.model');
console.log('>>> [CONTROLLER] Chargement de passagers.controller.js depuis', __filename);
console.log('>>> [CONTROLLER] Méthodes du modèle :', Object.keys(model));

exports.getPassagers = async (req, res) => {
  console.log('>>> [CONTROLLER] Appel de getPassagers avec gare_id:', req.gare_id);
  try {
    const list = await model.getAll(req.gare_id);
    res.json(list);
  } catch (err) {
    console.error('>>> [CONTROLLER] Erreur dans getPassagers:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getPassager = async (req, res) => {
  console.log('>>> [CONTROLLER] Appel de getPassager avec id:', req.params.id, 'gare_id:', req.gare_id);
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    console.log('>>> [CONTROLLER] ID invalide:', req.params.id);
    return res.status(400).json({ error: 'ID invalide' });
  }
  try {
    const passager = await model.getById(id, req.gare_id);
    if (!passager) return res.status(404).json({ error: 'Passager non trouvé ou non autorisé' });
    res.json(passager);
  } catch (err) {
    console.error('>>> [CONTROLLER] Erreur dans getPassager:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.createPassager = async (req, res) => {
  console.log('>>> [CONTROLLER] Appel de createPassager avec body:', req.body, 'gare_id:', req.gare_id);
  const { nom, prenom, telephone, numerocnib, date_etablissement, date_expiration, trajet_id, codeqr } = req.body;
  if (!nom || !prenom || !telephone || !numerocnib || !date_etablissement || !date_expiration || !trajet_id) {
    return res.status(400).json({ error: 'Nom, prénom, téléphone, numerocnib, date_etablissement, date_expiration et trajet_id sont requis' });
  }
  if (nom.trim().length === 0 || prenom.trim().length === 0 || telephone.trim().length === 0 || numerocnib.trim().length === 0) {
    return res.status(400).json({ error: 'Nom, prénom, téléphone, numerocnib ne peuvent pas être vides' });
  }
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(telephone)) {
    return res.status(400).json({ error: 'Format de téléphone invalide' });
  }
  const cnibRegex = /^[A-Za-z0-9]{6,20}$/;
  if (!cnibRegex.test(numerocnib)) {
    return res.status(400).json({ error: 'Format de numéro CNIB invalide (6-20 caractères alphanumériques)' });
  }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date_etablissement) || !dateRegex.test(date_expiration)) {
    return res.status(400).json({ error: 'Format de date invalide (YYYY-MM-DD requis)' });
  }
  if (new Date(date_expiration) <= new Date(date_etablissement)) {
    return res.status(400).json({ error: "La date d'expiration doit être postérieure à la date d'établissement" });
  }
  try {
    console.log('>>> [CONTROLLER] Vérification de numerocnib:', numerocnib, 'gare_id:', req.gare_id);
    const existingPassager = await model.getByNumerocnib(numerocnib, req.gare_id);
    console.log('>>> [CONTROLLER] Résultat de getByNumerocnib:', existingPassager);
    if (existingPassager) return res.status(400).json({ error: 'Numéro CNIB déjà utilisé pour cette gare' });
    const newPassager = await model.create({
      nom: nom.trim(),
      prenom: prenom.trim(),
      telephone: telephone.trim(),
      numerocnib: numerocnib.trim(),
      date_etablissement,
      date_expiration,
      trajet_id,
      codeqr: codeqr ? codeqr.trim() : null,
      gare_id: req.gare_id
    });
    res.status(201).json(newPassager);
  } catch (err) {
    console.error('>>> [CONTROLLER] Erreur dans createPassager:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.updatePassager = async (req, res) => {
  console.log('>>> [CONTROLLER] Appel de updatePassager avec id:', req.params.id, 'body:', req.body, 'gare_id:', req.gare_id);
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    console.log('>>> [CONTROLLER] ID invalide:', req.params.id);
    return res.status(400).json({ error: 'ID invalide' });
  }
  const { nom, prenom, telephone, numerocnib, date_etablissement, date_expiration, codeqr } = req.body;
  if (!nom && !prenom && !telephone && !numerocnib && !date_etablissement && !date_expiration && !codeqr) {
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
      fields.telephone = telephone.trim();
    }
    if (numerocnib) {
      const cnibRegex = /^[A-Za-z0-9]{6,20}$/;
      if (!cnibRegex.test(numerocnib)) {
        return res.status(400).json({ error: 'Format de numéro CNIB invalide (6-20 caractères alphanumériques)' });
      }
      const existingPassager = await model.getByNumerocnib(numerocnib, req.gare_id);
      if (existingPassager && existingPassager.id !== id) {
        return res.status(400).json({ error: 'Numéro CNIB déjà utilisé pour cette gare' });
      }
      fields.numerocnib = numerocnib.trim();
    }
    if (date_etablissement) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date_etablissement)) {
        return res.status(400).json({ error: 'Format de date d\'établissement invalide (YYYY-MM-DD requis)' });
      }
      fields.date_etablissement = date_etablissement;
    }
    if (date_expiration) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date_expiration)) {
        return res.status(400).json({ error: 'Format de date d\'expiration invalide (YYYY-MM-DD requis)' });
      }
      fields.date_expiration = date_expiration;
    }
    if (codeqr) fields.codeqr = codeqr.trim();
    const updated = await model.update(id, fields, req.gare_id);
    if (!updated) return res.status(404).json({ error: 'Passager non trouvé ou non autorisé' });
    res.json(updated);
  } catch (err) {
    console.error('>>> [CONTROLLER] Erreur dans updatePassager:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.deletePassager = async (req, res) => {
  console.log('>>> [CONTROLLER] Appel de deletePassager avec id:', req.params.id, 'gare_id:', req.gare_id);
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    console.log('>>> [CONTROLLER] ID invalide:', req.params.id);
    return res.status(400).json({ error: 'ID invalide' });
  }
  try {
    const result = await model.remove(id, req.gare_id);
    console.log('>>> [CONTROLLER] Résultat de model.remove:', result);
    if (!result) {
      console.log('>>> [CONTROLLER] Aucun passager trouvé pour id:', id, 'gare_id:', req.gare_id);
      return res.status(404).json({ error: 'Passager non trouvé ou non autorisé' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('>>> [CONTROLLER] Erreur dans deletePassager:', err.message);
    res.status(500).json({ error: err.message });
  }
};