// routes/voyages.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/voyages.controller');
const authGaresMiddleware = require('../middleware/authGares');

// Toutes les routes protégées par le token gare
router.get('/', authGaresMiddleware, ctrl.getVoyages);
router.get('/:id', authGaresMiddleware, ctrl.getVoyage);
router.post('/', authGaresMiddleware, ctrl.createVoyage);
router.put('/:id', authGaresMiddleware, ctrl.updateVoyage);
router.delete('/:id', authGaresMiddleware, ctrl.deleteVoyage);

module.exports = router;