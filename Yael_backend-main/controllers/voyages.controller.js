// controllers/voyages.controller.js
const model = require('../models/voyages.model');
const trajetsModel = require('../models/trajets.model');
const busModel = require('../models/bus.model');
const chauffeursModel = require('../models/chauffeurs.model');

exports.getVoyages = async (req, res) => {
  try {
    const list = await model.getAll(req.gare_id);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVoyage = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  try {
    const voyage = await model.getById(id, req.gare_id);
    if (!voyage) return res.status(404).json({ error: 'Voyage non trouvé ou non autorisé' });
    res.json(voyage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createVoyage = async (req, res) => {
  const { trajet_id, bus_id, chauffeur_id, statut } = req.body;
  if (!trajet_id || !bus_id || !chauffeur_id || !statut) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  if (!['attente', 'depart', 'arriver'].includes(statut)) {
    return res.status(400).json({ error: 'Statut doit être attente, depart ou arriver' });
  }
  try {
    const trajet = await trajetsModel.getById(trajet_id, req.gare_id);
    if (!trajet) return res.status(400).json({ error: 'Trajet invalide ou non autorisé' });
    const bus = await busModel.getById(bus_id, req.gare_id);
    if (!bus) return res.status(400).json({ error: 'Bus invalide ou non autorisé' });
    const chauffeur = await chauffeursModel.getById(chauffeur_id, req.gare_id);
    if (!chauffeur) return res.status(400).json({ error: 'Chauffeur invalide ou non autorisé' });
    const newVoyage = await model.create({ trajet_id, bus_id, chauffeur_id, statut, gare_id: req.gare_id });
    res.status(201).json(newVoyage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateVoyage = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  const { trajet_id, bus_id, chauffeur_id, statut } = req.body;
  if (!trajet_id && !bus_id && !chauffeur_id && !statut) {
    return res.status(400).json({ error: 'Au moins un champ est requis' });
  }
  try {
    const fields = {};
    if (trajet_id) {
      const trajet = await trajetsModel.getById(trajet_id, req.gare_id);
      if (!trajet) return res.status(400).json({ error: 'Trajet invalide ou non autorisé' });
      fields.trajet_id = trajet_id;
    }
    if (bus_id) {
      const bus = await busModel.getById(bus_id, req.gare_id);
      if (!bus) return res.status(400).json({ error: 'Bus invalide ou non autorisé' });
      fields.bus_id = bus_id;
    }
    if (chauffeur_id) {
      const chauffeur = await chauffeursModel.getById(chauffeur_id, req.gare_id);
      if (!chauffeur) return res.status(400).json({ error: 'Chauffeur invalide ou non autorisé' });
      fields.chauffeur_id = chauffeur_id;
    }
    if (statut) {
      if (!['attente', 'depart', 'arriver'].includes(statut)) {
        return res.status(400).json({ error: 'Statut doit être attente, depart ou arriver' });
      }
      fields.statut = statut;
    }
    const updated = await model.update(id, fields, req.gare_id);
    if (!updated) return res.status(404).json({ error: 'Voyage non trouvé ou non autorisé' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteVoyage = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  try {
    const result = await model.remove(id, req.gare_id);
    if (!result) return res.status(404).json({ error: 'Voyage non trouvé ou non autorisé' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
