// routes/destinations.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/destinations.controller');
const authGaresMiddleware = require('../middleware/authGares');

// Toutes les routes protégées par le token gare
router.get('/', authGaresMiddleware, ctrl.getDestinations);
router.get('/:id', authGaresMiddleware, ctrl.getDestination);
router.post('/', authGaresMiddleware, ctrl.createDestination);
router.put('/:id', authGaresMiddleware, ctrl.updateDestination);
router.delete('/:id', authGaresMiddleware, ctrl.deleteDestination);

module.exports = router;