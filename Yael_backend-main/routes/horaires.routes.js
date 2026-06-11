// routes/horaires.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/horaires.controller');
const authGaresMiddleware = require('../middleware/authGares');

// Toutes les routes protégées par le token gare
router.get('/', authGaresMiddleware, ctrl.getHoraires);
router.get('/:id', authGaresMiddleware, ctrl.getHoraire);
router.post('/', authGaresMiddleware, ctrl.createHoraire);
router.put('/:id', authGaresMiddleware, ctrl.updateHoraire);
router.delete('/:id', authGaresMiddleware, ctrl.deleteHoraire);

module.exports = router;