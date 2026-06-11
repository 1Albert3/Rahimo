// routes/chauffeurs.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/chauffeurs.controller');
const authGaresMiddleware = require('../middleware/authGares');

// Toutes les routes protégées par le token gare
router.get('/', authGaresMiddleware, ctrl.getChauffeurs);
router.get('/:id', authGaresMiddleware, ctrl.getChauffeur);
router.post('/', authGaresMiddleware, ctrl.createChauffeur);
router.put('/:id', authGaresMiddleware, ctrl.updateChauffeur);
router.delete('/:id', authGaresMiddleware, ctrl.deleteChauffeur);

module.exports = router;