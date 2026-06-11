// controllers/bus.controller.js
const model = require('../models/bus.model');

exports.getBus = async (req, res) => {
  try {
    const list = await model.getAll(req.gare_id);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOneBus = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  try {
    const bus = await model.getById(id, req.gare_id);
    if (!bus) return res.status(404).json({ error: 'Bus non trouvé ou non autorisé' });
    res.json(bus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createBus = async (req, res) => {
  const { nom, matricule, capacite, statut } = req.body;
  if (!nom || !matricule || capacite == null || !statut) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  if (nom.trim().length === 0 || matricule.trim().length === 0) {
    return res.status(400).json({ error: 'Nom et matricule ne peuvent pas être vides' });
  }
  if (!Number.isInteger(capacite) || capacite <= 0) {
    return res.status(400).json({ error: 'Capacité doit être un entier positif' });
  }
  if (!['service', 'hors service', 'en_maintenance'].includes(statut)) {
    return res.status(400).json({ error: 'Statut doit être service, hors service ou en_maintenance' });
  }
  try {
    const existingBus = await model.getByMatricule(matricule, req.gare_id);
    if (existingBus) return res.status(400).json({ error: 'Matricule déjà utilisé pour cette gare' });
    const newBus = await model.create({ nom: nom.trim(), matricule: matricule.trim(), capacite, statut, gare_id: req.gare_id });
    res.status(201).json(newBus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBus = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  const { nom, matricule, capacite, statut } = req.body;
  if (!nom && !matricule && capacite == null && !statut) {
    return res.status(400).json({ error: 'Au moins un champ est requis' });
  }
  try {
    const fields = {};
    if (nom) fields.nom = nom.trim();
    if (matricule) {
      const existingBus = await model.getByMatricule(matricule, req.gare_id);
      if (existingBus && existingBus.id !== id) {
        return res.status(400).json({ error: 'Matricule déjà utilisé pour cette gare' });
      }
      fields.matricule = matricule.trim();
    }
    if (capacite != null) {
      if (!Number.isInteger(capacite) || capacite <= 0) {
        return res.status(400).json({ error: 'Capacité doit être un entier positif' });
      }
      fields.capacite = capacite;
    }
    if (statut) {
      if (!['service', 'hors service', 'en_maintenance'].includes(statut)) {
        return res.status(400).json({ error: 'Statut doit être service, hors service ou en_maintenance' });
      }
      fields.statut = statut;
    }
    const updated = await model.update(id, fields, req.gare_id);
    if (!updated) return res.status(404).json({ error: 'Bus non trouvé ou non autorisé' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBus = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  try {
    const result = await model.remove(id, req.gare_id);
    if (!result) return res.status(404).json({ error: 'Bus non trouvé ou non autorisé' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
