// controllers/horaires.controller.js
const model = require('../models/horaires.model');

exports.getHoraires = async (req, res) => {
  try {
    const list = await model.getAll(req.gare_id);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getHoraire = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  try {
    const horaire = await model.getById(id, req.gare_id);
    if (!horaire) return res.status(404).json({ error: 'Horaire non trouvé ou non autorisé' });
    res.json(horaire);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createHoraire = async (req, res) => {
  const { heure } = req.body;
  if (!heure) return res.status(400).json({ error: 'Le champ heure est requis' });
  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!timeRegex.test(heure)) {
    return res.status(400).json({ error: 'Format d\'heure invalide (HH:MM requis)' });
  }
  try {
    const newH = await model.create(heure, req.gare_id);
    res.status(201).json(newH);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateHoraire = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  const { heure } = req.body;
  if (!heure) return res.status(400).json({ error: 'Le champ heure est requis' });
  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!timeRegex.test(heure)) {
    return res.status(400).json({ error: 'Format d\'heure invalide (HH:MM requis)' });
  }
  try {
    const updated = await model.update(id, heure, req.gare_id);
    if (!updated) return res.status(404).json({ error: 'Horaire non trouvé ou non autorisé' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteHoraire = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  try {
    const result = await model.remove(id, req.gare_id);
    if (!result) return res.status(404).json({ error: 'Horaire non trouvé ou non autorisé' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
