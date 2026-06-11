// controllers/chauffeurs.controller.js
const model = require('../models/chauffeurs.model');

exports.getChauffeurs = async (req, res) => {
  try {
    const list = await model.getAll(req.gare_id);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getChauffeur = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  try {
    const chauffeur = await model.getById(id, req.gare_id);
    if (!chauffeur) return res.status(404).json({ error: 'Chauffeur non trouvé ou non autorisé' });
    res.json(chauffeur);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createChauffeur = async (req, res) => {
  const { nom, prenom, telephone } = req.body;
  if (!nom || !prenom || !telephone) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  if (nom.trim().length === 0 || prenom.trim().length === 0 || telephone.trim().length === 0) {
    return res.status(400).json({ error: 'Nom, prénom et téléphone ne peuvent pas être vides' });
  }
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(telephone)) {
    return res.status(400).json({ error: 'Format de téléphone invalide' });
  }
  try {
    const newC = await model.create({ nom: nom.trim(), prenom: prenom.trim(), telephone: telephone.trim(), gare_id: req.gare_id });
    res.status(201).json(newC);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateChauffeur = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  const { nom, prenom, telephone } = req.body;
  if (!nom && !prenom && !telephone) {
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
    const updated = await model.update(id, fields, req.gare_id);
    if (!updated) return res.status(404).json({ error: 'Chauffeur non trouvé ou non autorisé' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteChauffeur = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  try {
    const result = await model.remove(id, req.gare_id);
    if (!result) return res.status(404).json({ error: 'Chauffeur non trouvé ou non autorisé' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
