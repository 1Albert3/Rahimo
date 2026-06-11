// routes/agents.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/agents.controller');
const authGaresMiddleware = require('../middleware/authGares');

// Toutes les routes protégées par le token gare
router.post('/login', ctrl.loginAgent); // Protégé
router.get('/', authGaresMiddleware, ctrl.getAgents);
router.get('/:id', authGaresMiddleware, ctrl.getAgent);
router.post('/', authGaresMiddleware, ctrl.createAgent);
router.put('/:id', authGaresMiddleware, ctrl.updateAgent);
router.delete('/:id', authGaresMiddleware, ctrl.deleteAgent);

module.exports = router;