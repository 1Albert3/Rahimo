// models/chauffeurs.model.js
const db = require('../db');

module.exports = {
  getAll: async (gare_id) => {
    const res = await db.query('SELECT id, nom, prenom, telephone, gare_id FROM chauffeurs WHERE gare_id = $1 ORDER BY id', [gare_id]);
    return res.rows;
  },

  getById: async (id, gare_id) => {
    const res = await db.query(
      'SELECT id, nom, prenom, telephone, gare_id FROM chauffeurs WHERE id = $1 AND gare_id = $2',
      [id, gare_id]
    );
    return res.rows[0];
  },

  create: async ({ nom, prenom, telephone, gare_id }) => {
    const res = await db.query(
      `INSERT INTO chauffeurs (nom, prenom, telephone, gare_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nom, prenom, telephone, gare_id`,
      [nom, prenom, telephone, gare_id]
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
      `UPDATE chauffeurs
       SET ${sets.join(', ')}
       WHERE id = $${idx} AND gare_id = $${idx + 1}
       RETURNING id, nom, prenom, telephone, gare_id`,
      values
    );
    return res.rows[0];
  },

  remove: async (id, gare_id) => {
    const res = await db.query('DELETE FROM chauffeurs WHERE id = $1 AND gare_id = $2', [id, gare_id]);
    return res.rowCount > 0;
  },
};
