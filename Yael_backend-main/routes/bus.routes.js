// routes/bus.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bus.controller');
const authGaresMiddleware = require('../middleware/authGares');

// Toutes les routes protégées par le token gare
router.get('/', authGaresMiddleware, ctrl.getBus);
router.get('/:id', authGaresMiddleware, ctrl.getOneBus);
router.post('/', authGaresMiddleware, ctrl.createBus);
router.put('/:id', authGaresMiddleware, ctrl.updateBus);
router.delete('/:id', authGaresMiddleware, ctrl.deleteBus);

module.exports = router;