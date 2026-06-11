// models/agents.model.js
const db = require('../db');

module.exports = {
  getAll: async (gare_id) => {
    const res = await db.query('SELECT id, nom, prenom, numero, gare_id FROM agents WHERE gare_id = $1 ORDER BY id', [gare_id]);
    return res.rows;
  },

  getById: async (id, gare_id) => {
    const res = await db.query('SELECT id, nom, prenom, numero, gare_id FROM agents WHERE id = $1 AND gare_id = $2', [id, gare_id]);
    return res.rows[0];
  },

  getByNumero: async (numero, gare_id) => {
    const res = await db.query('SELECT * FROM agents WHERE numero = $1 AND gare_id = $2', [numero, gare_id]);
    return res.rows[0];
  },

  create: async (nom, prenom, numero, password, gare_id) => {
    const res = await db.query(
      'INSERT INTO agents (nom, prenom, numero, password, gare_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, nom, prenom, numero, gare_id',
      [nom, prenom, numero, password, gare_id]
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
      `UPDATE agents SET ${sets.join(', ')} WHERE id = $${idx} AND gare_id = $${idx + 1} RETURNING id, nom, prenom, numero, gare_id`,
      values
    );
    return res.rows[0];
  },

  remove: async (id, gare_id) => {
    const res = await db.query('DELETE FROM agents WHERE id = $1 AND gare_id = $2', [id, gare_id]);
    return res.rowCount > 0;
  },
};
