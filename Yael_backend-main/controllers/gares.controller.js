// controllers/gares.controller.js
const model = require('../models/gares.model');
const villesModel = require('../models/villes.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.getGares = async (req, res) => {
  try {
    const gares = await model.getAll();
    res.json(gares);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGare = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  try {
    const gare = await model.getById(id);
    if (!gare) return res.status(404).json({ error: 'Gare non trouvée' });
    res.json(gare);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createGare = async (req, res) => {
  const { ville_id, nom, numero, password } = req.body;
  if (!ville_id || !nom || !numero || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  if (nom.trim().length === 0 || numero.trim().length === 0 || password.length < 6) {
    return res.status(400).json({ error: 'Nom, numéro non vides et mot de passe ≥ 6 caractères requis' });
  }
  try {
    // Vérifier si ville_id existe
    const ville = await villesModel.getById(ville_id);
    if (!ville) return res.status(400).json({ error: 'Ville non trouvée' });
    
    // Vérifier si numero est unique
    const existingGare = await model.getByNumero(numero.trim());
    if (existingGare) return res.status(400).json({ error: 'Numéro déjà utilisé' });
    
    const hash = await bcrypt.hash(password, 10);
    const newGare = await model.create(ville_id, nom.trim(), numero.trim(), hash);
    res.status(201).json(newGare);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateGare = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { ville_id, nom, numero, password } = req.body;
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  if (!ville_id && !nom && !numero && !password) {
    return res.status(400).json({ error: 'Au moins un champ est requis' });
  }
  try {
    // Vérifier si ville_id existe (si fourni)
    if (ville_id) {
      const ville = await villesModel.getById(ville_id);
      if (!ville) return res.status(400).json({ error: 'Ville non trouvée' });
    }
    
    // Vérifier si numero est unique (si fourni)
    if (numero) {
      const existingGare = await model.getByNumero(numero.trim());
      if (existingGare && existingGare.id !== id) {
        return res.status(400).json({ error: 'Numéro déjà utilisé' });
      }
    }
    
    // Créer l'objet fields avec les champs non-null
    const fields = {};
    if (ville_id != null) fields.ville_id = ville_id;
    if (nom) fields.nom = nom.trim();
    if (numero) fields.numero = numero.trim();
    if (password) fields.password = await bcrypt.hash(password, 10);
    
    const updated = await model.update(id, fields);
    if (!updated) return res.status(404).json({ error: 'Gare non trouvée' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteGare = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  try {
    const result = await model.remove(id);
    if (!result) return res.status(404).json({ error: 'Gare non trouvée' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginGare = async (req, res) => {
  const { numero, password } = req.body;
  if (!numero || !password) {
    return res.status(400).json({ error: 'Numéro et mot de passe requis' });
  }
  try {
    const gare = await model.getByNumero(numero.trim());
    if (!gare) return res.status(401).json({ error: 'Identifiants invalides' });

    const valid = await bcrypt.compare(password, gare.password);
    if (!valid) return res.status(401).json({ error: 'Identifiants invalides' });

    const token = jwt.sign(
      { id: gare.id, ville_id: gare.ville_id, role: 'gare' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({
      token,
      gare: { id: gare.id, nom: gare.nom, numero: gare.numero, ville_id: gare.ville_id }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

