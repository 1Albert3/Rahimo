// routes/trajets.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/trajets.controller');
const authGaresMiddleware = require('../middleware/authGares');

// Toutes les routes protégées par le token gare
router.get('/', authGaresMiddleware, ctrl.getTrajets);
router.get('/:id', authGaresMiddleware, ctrl.getTrajet);
router.post('/', authGaresMiddleware, ctrl.createTrajet);
router.put('/:id', authGaresMiddleware, ctrl.updateTrajet);
router.delete('/:id', authGaresMiddleware, ctrl.deleteTrajet);

module.exports = router;