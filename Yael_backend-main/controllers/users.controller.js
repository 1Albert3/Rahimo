// controllers/users.controller.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { findByEmail } = require('../models/users.model');

const JWT_SECRET = process.env.JWT_SECRET;

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    // Validation simple du format d'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Format d\'email invalide.' });
    }

    const user = await findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe invalide.' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Email ou mot de passe invalide.' });
    }

    const token = jwt.sign({ sub: user.id, role: 'user' }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

module.exports = { login };