// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db');   // ← notre fichier de config PG

const app = express();
//--------------cors-------------------
//app.use(cors()); // autorise toutes les origines, pas de cookies
// app.use(cors({
//   origin: ['http://127.0.0.1:8000', 'http://localhost:8000'],
//   // origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
//   credentials: false
// }));
const allowedOrigins = [
  'http://127.0.0.1:8000',
  'http://localhost:8000',
  'http://127.0.0.1:5500',
  'http://localhost:5500'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origin not allowed by CORS'));
    }
  },
  credentials: true
}));

//--------------endors------------------------------------------
app.use(express.json());

app.use('/api/users', require('./routes/users.routes'));
// → Ajoute cette ligne :
app.use('/api/villes', require('./routes/villes.routes'));
// → Ajoute cette ligne pour les gares :
app.use('/api/gares', require('./routes/gares.routes'));
// … autres routes
app.use('/api/agents', require('./routes/agents.routes'));
// … autres routes
app.use('/api/bus', require('./routes/bus.routes'));
// … routes précédentes …
app.use('/api/chauffeurs', require('./routes/chauffeurs.routes'));
// … autres routes …
app.use('/api/horaires', require('./routes/horaires.routes'));
// … autres routes …
app.use('/api/destinations', require('./routes/destinations.routes'));
// … autres routes …
app.use('/api/trajets', require('./routes/trajets.routes'));
// … autres routes …
app.use('/api/voyages', require('./routes/voyages.routes'));
//
app.use('/api/passagers', require('./routes/passagers.routes'));
//
app.use('/api/reservations', require('./routes/reservations.routes'));


// Test rapide de la connexion
pool
  .query('SELECT NOW()')
  .then(res => console.log('✅ PG connecté à :', res.rows[0].now))
  .catch(err => console.error('❌ Erreur PG :', err));

// Route de test
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
