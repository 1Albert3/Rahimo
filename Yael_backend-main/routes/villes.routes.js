// routes/villes.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/villes.controller');
const authUsersMiddleware = require('../middleware/authUsers');

router.get('/', authUsersMiddleware, ctrl.getVilles);
router.get('/:id', authUsersMiddleware, ctrl.getVille);
router.post('/', authUsersMiddleware, ctrl.createVille);
router.put('/:id', authUsersMiddleware, ctrl.updateVille);
router.delete('/:id', authUsersMiddleware, ctrl.deleteVille);

module.exports = router;