// models/destinations.model.js
const db = require('../db');

module.exports = {
  getAll: async (gare_id) => {
    const res = await db.query('SELECT id, nom, gare_id FROM destinations WHERE gare_id = $1 ORDER BY id', [gare_id]);
    return res.rows;
  },

  getById: async (id, gare_id) => {
    const res = await db.query(
      'SELECT id, nom, gare_id FROM destinations WHERE id = $1 AND gare_id = $2',
      [id, gare_id]
    );
    return res.rows[0];
  },

  create: async (nom, gare_id) => {
    const res = await db.query(
      'INSERT INTO destinations (nom, gare_id) VALUES ($1, $2) RETURNING id, nom, gare_id',
      [nom, gare_id]
    );
    return res.rows[0];
  },

  update: async (id, nom, gare_id) => {
    const res = await db.query(
      'UPDATE destinations SET nom = $1 WHERE id = $2 AND gare_id = $3 RETURNING id, nom, gare_id',
      [nom, id, gare_id]
    );
    return res.rows[0];
  },

  remove: async (id, gare_id) => {
    const res = await db.query('DELETE FROM destinations WHERE id = $1 AND gare_id = $2', [id, gare_id]);
    return res.rowCount > 0;
  },
};
