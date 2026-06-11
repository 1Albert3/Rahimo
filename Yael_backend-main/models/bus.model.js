// models/bus.model.js
const db = require('../db');

module.exports = {
  getAll: async (gare_id) => {
    const res = await db.query(
      'SELECT * FROM bus WHERE gare_id = $1 ORDER BY id',
      [gare_id]
    );
    return res.rows;
  },

  getById: async (id, gare_id) => {
    const res = await db.query(
      'SELECT * FROM bus WHERE id = $1 AND gare_id = $2',
      [id, gare_id]
    );
    return res.rows[0];
  },

  getByMatricule: async (matricule, gare_id) => {
    const res = await db.query(
      'SELECT * FROM bus WHERE matricule = $1 AND gare_id = $2',
      [matricule, gare_id]
    );
    return res.rows[0];
  },

  create: async ({ nom, matricule, capacite, statut, gare_id }) => {
    const res = await db.query(
      `INSERT INTO bus (nom, matricule, capacite, statut, gare_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nom, matricule, capacite, statut, gare_id]
    );
    return res.rows[0];
  },

  update: async (id, fields, gare_id) => {
    const sets = [];
    const values = [];
    let idx = 1;
    for (const [key, val] of Object.entries(fields)) {
      sets.push(`${key} = $${idx++}`);
      values.push(val);
    }
    if (!sets.length) return null;
    values.push(id);
    values.push(gare_id);
    const res = await db.query(
      `UPDATE bus SET ${sets.join(', ')} WHERE id = $${idx} AND gare_id = $${idx + 1}
       RETURNING *`,
      values
    );
    return res.rows[0];
  },

  remove: async (id, gare_id) => {
    const res = await db.query(
      'DELETE FROM bus WHERE id = $1 AND gare_id = $2',
      [id, gare_id]
    );
    return res.rowCount > 0;
  },
};
