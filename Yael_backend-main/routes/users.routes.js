// routes/users.routes.js
const express = require('express');
const { login } = require('../controllers/users.controller');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 tentatives par IP
  message: { error: 'Trop de tentatives, réessayez dans une minute' }
});

router.post('/login', loginLimiter, login);

module.exports = router;