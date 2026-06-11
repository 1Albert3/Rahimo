//middleware/authGares.js
const jwt = require('jsonwebtoken');
const authGaresMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requis' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token mal formé' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'gare') {
      return res.status(403).json({ error: 'Accès réservé aux gares' });
    }
    req.gare_id = decoded.id; // Stocke l'ID de la gare depuis le token
    req.gare = decoded; // Stocke toutes les infos du token si besoin
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token invalide ou expiré' });
  }
};

module.exports = authGaresMiddleware;
