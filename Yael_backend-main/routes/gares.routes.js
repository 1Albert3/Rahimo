// routes/gares.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/gares.controller');
const rateLimit = require('express-rate-limit');
const authUsersMiddleware = require('../middleware/authUsers');

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 tentatives par IP
  message: { error: 'Trop de tentatives, réessayez dans une minute' }
});

// Route de login pour les gares (pas de protection nécessaire)
router.post('/login', loginLimiter, ctrl.loginGare);

// Routes CRUD pour les gares (réservées aux users/responsables de compagnie)
router.get('/', authUsersMiddleware, ctrl.getGares);
router.get('/:id', authUsersMiddleware, ctrl.getGare);
router.post('/', authUsersMiddleware, ctrl.createGare);
router.put('/:id', authUsersMiddleware, ctrl.updateGare);
router.delete('/:id', authUsersMiddleware, ctrl.deleteGare);

module.exports = router;