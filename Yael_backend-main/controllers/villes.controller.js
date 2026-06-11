// controllers/villes.controller.js
const model = require('../models/villes.model');

exports.getVilles = async (req, res) => {
  try {
    const villes = await model.getAll();
    res.json(villes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVille = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  try {
    const ville = await model.getById(id);
    if (!ville) return res.status(404).json({ error: 'Ville non trouvée' });
    res.json(ville);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createVille = async (req, res) => {
  const { nom } = req.body;
  if (!nom || nom.trim().length === 0) {
    return res.status(400).json({ error: 'Le champ nom est requis et ne peut pas être vide' });
  }
  if (nom.length > 100) {
    return res.status(400).json({ error: 'Le nom ne peut pas dépasser 100 caractères' });
  }
  try {
    const newVille = await model.create(nom.trim());
    res.status(201).json(newVille);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateVille = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { nom } = req.body;
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  if (!nom || nom.trim().length === 0) {
    return res.status(400).json({ error: 'Le champ nom est requis et ne peut pas être vide' });
  }
  if (nom.length > 100) {
    return res.status(400).json({ error: 'Le nom ne peut pas dépasser 100 caractères' });
  }
  try {
    const updated = await model.update(id, nom.trim());
    if (!updated) return res.status(404).json({ error: 'Ville non trouvée' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteVille = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  try {
    const result = await model.remove(id);
    if (!result) return res.status(404).json({ error: 'Ville non trouvée' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};