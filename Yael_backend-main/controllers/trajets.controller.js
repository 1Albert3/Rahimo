// controllers/trajets.controller.js
const model = require('../models/trajets.model');
const destinationsModel = require('../models/destinations.model');
const horairesModel = require('../models/horaires.model');

exports.getTrajets = async (req, res) => {
  try {
    const list = await model.getAll(req.gare_id);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTrajet = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  try {
    const trajet = await model.getById(id, req.gare_id);
    if (!trajet) return res.status(404).json({ error: 'Trajet non trouvé ou non autorisé' });
    res.json(trajet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTrajet = async (req, res) => {
  const { nom, depart_gare_id, destination_id, duree, horaire_id, date, prix } = req.body;
  if (!nom || !depart_gare_id || !destination_id || !duree || !horaire_id || !date || prix == null) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  if (nom.trim().length === 0) {
    return res.status(400).json({ error: 'Le nom ne peut pas être vide' });
  }
  if (parseInt(depart_gare_id) !== parseInt(req.gare_id)) {
    return res.status(403).json({ error: 'Vous ne pouvez créer un trajet que pour votre gare' });
  }
  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!timeRegex.test(duree)) {
    return res.status(400).json({ error: 'Format de durée invalide (HH:MM requis)' });
  }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({ error: 'Format de date invalide (YYYY-MM-DD requis)' });
  }
  if (!Number.isFinite(prix) || prix <= 0) {
    return res.status(400).json({ error: 'Le prix doit être un nombre positif' });
  }
  try {
    const destination = await destinationsModel.getById(destination_id, req.gare_id);
    if (!destination) return res.status(400).json({ error: 'Destination non trouvée ou non autorisée' });
    const horaire = await horairesModel.getById(horaire_id, req.gare_id);
    if (!horaire) return res.status(400).json({ error: 'Horaire non trouvé ou non autorisé' });
    const newTrajet = await model.create({ nom: nom.trim(), depart_gare_id, destination_id, duree, horaire_id, date, prix, gare_id: req.gare_id });
    res.status(201).json(newTrajet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTrajet = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  const { nom, depart_gare_id, destination_id, duree, horaire_id, date, prix } = req.body;
  if (!nom && !depart_gare_id && !destination_id && !duree && !horaire_id && !date && prix == null) {
    return res.status(400).json({ error: 'Au moins un champ est requis' });
  }
  try {
    const fields = {};
    if (nom) fields.nom = nom.trim();
    if (depart_gare_id) {
      if (parseInt(depart_gare_id) !== parseInt(req.gare_id)) {
        return res.status(403).json({ error: 'Vous ne pouvez modifier le trajet que pour votre gare' });
      }
      fields.depart_gare_id = depart_gare_id;
    }
    if (destination_id) {
      const destination = await destinationsModel.getById(destination_id, req.gare_id);
      if (!destination) return res.status(400).json({ error: 'Destination non trouvée ou non autorisée' });
      fields.destination_id = destination_id;
    }
    if (duree) {
      const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
      if (!timeRegex.test(duree)) {
        return res.status(400).json({ error: 'Format de durée invalide (HH:MM requis)' });
      }
      fields.duree = duree;
    }
    if (horaire_id) {
      const horaire = await horairesModel.getById(horaire_id, req.gare_id);
      if (!horaire) return res.status(400).json({ error: 'Horaire non trouvé ou non autorisé' });
      fields.horaire_id = horaire_id;
    }
    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({ error: 'Format de date invalide (YYYY-MM-DD requis)' });
      }
      fields.date = date;
    }
    if (prix != null) {
      if (!Number.isFinite(prix) || prix <= 0) {
        return res.status(400).json({ error: 'Le prix doit être un nombre positif' });
      }
      fields.prix = prix;
    }
    const updated = await model.update(id, fields, req.gare_id);
    if (!updated) return res.status(404).json({ error: 'Trajet non trouvé ou non autorisé' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTrajet = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  try {
    const result = await model.remove(id, req.gare_id);
    if (!result) return res.status(404).json({ error: 'Trajet non trouvé ou non autorisé' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
