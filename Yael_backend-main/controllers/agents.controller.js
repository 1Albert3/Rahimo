// controllers/agents.controller.js
const model = require('../models/agents.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.getAgents = async (req, res) => {
  try {
    const agents = await model.getAll(req.gare_id); // Utilise req.gare_id
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAgent = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  try {
    const agent = await model.getById(id, req.gare_id);
    if (!agent) return res.status(404).json({ error: 'Agent non trouvé ou non autorisé' });
    res.json(agent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAgent = async (req, res) => {
  const { nom, prenom, numero, password } = req.body;
  if (!nom || !prenom || !numero || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  if (nom.trim().length === 0 || prenom.trim().length === 0 || numero.trim().length === 0 || password.length < 6) {
    return res.status(400).json({ error: 'Nom, prénom, numéro non vides et mot de passe ≥ 6 caractères requis' });
  }
  try {
    const existingAgent = await model.getByNumero(numero, req.gare_id);
    if (existingAgent) return res.status(400).json({ error: 'Numéro déjà utilisé pour cette gare' });
    const hash = await bcrypt.hash(password, 10);
    const newAgent = await model.create(nom.trim(), prenom.trim(), numero.trim(), hash, req.gare_id);
    res.status(201).json(newAgent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAgent = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  const { nom, prenom, numero, password } = req.body;
  if (!nom && !prenom && !numero && !password) {
    return res.status(400).json({ error: 'Au moins un champ est requis' });
  }
  try {
    const fields = {};
    if (nom) fields.nom = nom.trim();
    if (prenom) fields.prenom = prenom.trim();
    if (numero) {
      const existingAgent = await model.getByNumero(numero, req.gare_id);
      if (existingAgent && existingAgent.id !== id) {
        return res.status(400).json({ error: 'Numéro déjà utilisé pour cette gare' });
      }
      fields.numero = numero.trim();
    }
    if (password) fields.password = await bcrypt.hash(password, 10);
    const updated = await model.update(id, fields, req.gare_id);
    if (!updated) return res.status(404).json({ error: 'Agent non trouvé ou non autorisé' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAgent = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
  try {
    const result = await model.remove(id, req.gare_id);
    if (!result) return res.status(404).json({ error: 'Agent non trouvé ou non autorisé' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginAgent = async (req, res) => {
  const { numero, password } = req.body;
  if (!numero || !password) {
    return res.status(400).json({ error: 'Numéro et mot de passe requis' });
  }
  try {
    const agent = await model.getByNumero(numero, req.gare_id);
    if (!agent) return res.status(401).json({ error: 'Identifiants invalides ou agent non lié à cette gare' });
    const valid = await bcrypt.compare(password, agent.password);
    if (!valid) return res.status(401).json({ error: 'Identifiants invalides' });
    const token = jwt.sign(
      { id: agent.id, gare_id: agent.gare_id, role: 'agent' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({
      token,
      agent: { id: agent.id, nom: agent.nom, prenom: agent.prenom, numero: agent.numero, gare_id: agent.gare_id }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
