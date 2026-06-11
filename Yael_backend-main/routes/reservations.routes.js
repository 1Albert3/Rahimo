// routes/reservations.routes.js
delete require.cache[require.resolve('../controllers/reservations.controller')]; // Vider le cache (peut être supprimé après résolution)
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reservations.controller');
const authGaresMiddleware = require('../middleware/authGares');

console.log('>>> [ROUTES] Chargement de reservations.routes.js depuis', __filename);

router.get('/', authGaresMiddleware, (req, res, next) => {
  console.log('>>> [ROUTES] Route GET /api/reservations atteinte avec gare_id:', req.gare_id);
  next();
}, ctrl.getReservations);

router.get('/:id', authGaresMiddleware, (req, res, next) => {
  console.log('>>> [ROUTES] Route GET /api/reservations/:id atteinte avec id:', req.params.id, 'gare_id:', req.gare_id);
  next();
}, ctrl.getReservation);

router.post('/', authGaresMiddleware, (req, res, next) => {
  console.log('>>> [ROUTES] Route POST /api/reservations atteinte avec body:', req.body, 'gare_id:', req.gare_id);
  next();
}, ctrl.createReservation);

router.put('/:id', authGaresMiddleware, (req, res, next) => {
  console.log('>>> [ROUTES] Route PUT /api/reservations/:id atteinte avec id:', req.params.id, 'gare_id:', req.gare_id);
  next();
}, ctrl.updateReservation);

router.delete('/:id', authGaresMiddleware, (req, res, next) => {
  console.log('>>> [ROUTES] Route DELETE /api/reservations/:id atteinte avec id:', req.params.id, 'gare_id:', req.gare_id);
  next();
}, ctrl.deleteReservation);

module.exports = router;