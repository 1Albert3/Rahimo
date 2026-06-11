// models/villes.model.js
const db = require('../db');

module.exports = {
  getAll: async () => {
    const result = await db.query('SELECT * FROM villes ORDER BY id');
    return result.rows;
  },

  getById: async (id) => {
    const result = await db.query('SELECT * FROM villes WHERE id = $1', [id]);
    return result.rows[0];
  },

  create: async (nom) => {
    const result = await db.query(
      'INSERT INTO villes (nom) VALUES ($1) RETURNING *',
      [nom]
    );
    return result.rows[0];
  },

  update: async (id, nom) => {
    const result = await db.query(
      'UPDATE villes SET nom = $1 WHERE id = $2 RETURNING *',
      [nom, id]
    );
    return result.rows[0];
  },

  remove: async (id) => {
    const result = await db.query('DELETE FROM villes WHERE id = $1', [id]);
    return result.rowCount > 0; // Retourne true si une ligne a été supprimée
  },
};
