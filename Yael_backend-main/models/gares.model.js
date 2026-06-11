// models/gares.model.js
const db = require('../db');

module.exports = {
  getAll: async () => {
    const res = await db.query('SELECT id, ville_id, nom, numero FROM gares ORDER BY id');
    return res.rows;
  },

  getById: async (id) => {
    const res = await db.query(
      'SELECT id, ville_id, nom, numero FROM gares WHERE id = $1',
      [id]
    );
    return res.rows[0];
  },

  getByNumero: async (numero) => {
    const res = await db.query(
      'SELECT * FROM gares WHERE numero = $1',
      [numero]
    );
    return res.rows[0];
  },

  create: async (ville_id, nom, numero, passwordHash) => {
    const res = await db.query(
      `INSERT INTO gares (ville_id, nom, numero, password)
       VALUES ($1, $2, $3, $4)
       RETURNING id, ville_id, nom, numero`,
      [ville_id, nom, numero, passwordHash]
    );
    return res.rows[0];
  },

  update: async (id, fields) => {
    const sets = [];
    const values = [];
    let idx = 1;

    for (const [key, val] of Object.entries(fields)) {
      sets.push(`${key} = $${idx++}`);
      values.push(val);
    }

    if (sets.length === 0) return null;

    values.push(id);
    const res = await db.query(
      `UPDATE gares SET ${sets.join(', ')} WHERE id = $${idx} RETURNING id, ville_id, nom, numero`,
      values
    );
    return res.rows[0];
  },

  remove: async (id) => {
    const res = await db.query('DELETE FROM gares WHERE id = $1', [id]);
    return res.rowCount > 0;
  },
};