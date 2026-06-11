// routes/passagers.routes.js
delete require.cache[require.resolve('../controllers/passagers.controller')]; // Vider le cache (peut être supprimé après résolution)
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/passagers.controller');
const authGaresMiddleware = require('../middleware/authGares');

console.log('>>> [ROUTES] Chargement de passagers.routes.js depuis', __filename);

router.get('/', authGaresMiddleware, (req, res, next) => {
  console.log('>>> [ROUTES] Route GET /api/passagers atteinte avec gare_id:', req.gare_id);
  next();
}, ctrl.getPassagers);

router.get('/:id', authGaresMiddleware, (req, res, next) => {
  console.log('>>> [ROUTES] Route GET /api/passagers/:id atteinte avec id:', req.params.id, 'gare_id:', req.gare_id);
  next();
}, ctrl.getPassager);

router.post('/', authGaresMiddleware, (req, res, next) => {
  console.log('>>> [ROUTES] Route POST /api/passagers atteinte avec body:', req.body, 'gare_id:', req.gare_id);
  next();
}, ctrl.createPassager);

router.put('/:id', authGaresMiddleware, (req, res, next) => {
  console.log('>>> [ROUTES] Route PUT /api/passagers/:id atteinte avec id:', req.params.id, 'gare_id:', req.gare_id);
  next();
}, ctrl.updatePassager);

router.delete('/:id', authGaresMiddleware, (req, res, next) => {
  console.log('>>> [ROUTES] Route DELETE /api/passagers/:id atteinte avec id:', req.params.id, 'gare_id:', req.gare_id);
  next();
}, ctrl.deletePassager);

module.exports = router;