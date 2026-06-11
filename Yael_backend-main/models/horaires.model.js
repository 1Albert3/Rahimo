// models/horaires.model.js
const db = require('../db');

module.exports = {
  getAll: async (gare_id) => {
    const res = await db.query('SELECT id, heure, gare_id FROM horaires WHERE gare_id = $1 ORDER BY id', [gare_id]);
    return res.rows;
  },

  getById: async (id, gare_id) => {
    const res = await db.query(
      'SELECT id, heure, gare_id FROM horaires WHERE id = $1 AND gare_id = $2',
      [id, gare_id]
    );
    return res.rows[0];
  },

  create: async (heure, gare_id) => {
    const res = await db.query(
      'INSERT INTO horaires (heure, gare_id) VALUES ($1, $2) RETURNING id, heure, gare_id',
      [heure, gare_id]
    );
    return res.rows[0];
  },

  update: async (id, heure, gare_id) => {
    const res = await db.query(
      'UPDATE horaires SET heure = $1 WHERE id = $2 AND gare_id = $3 RETURNING id, heure, gare_id',
      [heure, id, gare_id]
    );
    return res.rows[0];
  },

  remove: async (id, gare_id) => {
    const res = await db.query('DELETE FROM horaires WHERE id = $1 AND gare_id = $2', [id, gare_id]);
    return res.rowCount > 0;
  },
};
