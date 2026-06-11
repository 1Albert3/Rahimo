// controllers/destinations.controller.js
const model = require('../models/destinations.model');

exports.getDestinations = async (req, res) => {
  try {
    const list = await model.getAll(req.gare_id);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDestination = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  try {
    const dest = await model.getById(id, req.gare_id);
    if (!dest) return res.status(404).json({ error: 'Destination non trouvée ou non autorisée' });
    res.json(dest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createDestination = async (req, res) => {
  const { nom } = req.body;
  if (!nom || nom.trim().length === 0) {
    return res.status(400).json({ error: 'Le champ nom est requis et ne peut pas être vide' });
  }
  if (nom.length > 100) {
    return res.status(400).json({ error: 'Le nom ne peut pas dépasser 100 caractères' });
  }
  try {
    const newDest = await model.create(nom.trim(), req.gare_id);
    res.status(201).json(newDest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDestination = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  const { nom } = req.body;
  if (!nom || nom.trim().length === 0) {
    return res.status(400).json({ error: 'Le champ nom est requis et ne peut pas être vide' });
  }
  if (nom.length > 100) {
    return res.status(400).json({ error: 'Le nom ne peut pas dépasser 100 caractères' });
  }
  try {
    const updated = await model.update(id, nom.trim(), req.gare_id);
    if (!updated) return res.status(404).json({ error: 'Destination non trouvée ou non autorisée' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteDestination = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  try {
    const result = await model.remove(id, req.gare_id);
    if (!result) return res.status(404).json({ error: 'Destination non trouvée ou non autorisée' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};