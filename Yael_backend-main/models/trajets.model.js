// models/trajets.model.js
const db = require('../db');

module.exports = {
  getAll: async (gare_id) => {
    const res = await db.query(`
      SELECT t.*, 
             g.nom AS gare_depart, 
             d.nom AS destination,
             h.heure AS horaire
      FROM trajets t
      JOIN gares g ON t.depart_gare_id = g.id
      JOIN destinations d ON t.destination_id = d.id
      JOIN horaires h ON t.horaire_id = h.id
      WHERE t.gare_id = $1
      ORDER BY t.date, t.horaire_id
    `, [gare_id]);
    return res.rows;
  },

  getById: async (id, gare_id) => {
    const res = await db.query(`
      SELECT t.*, 
             g.nom AS gare_depart, 
             d.nom AS destination,
             h.heure AS horaire
      FROM trajets t
      JOIN gares g ON t.depart_gare_id = g.id
      JOIN destinations d ON t.destination_id = d.id
      JOIN horaires h ON t.horaire_id = h.id
      WHERE t.id = $1 AND t.gare_id = $2
    `, [id, gare_id]);
    return res.rows[0];
  },

  create: async ({ nom, depart_gare_id, destination_id, duree, horaire_id, date, prix, gare_id }) => {
    const res = await db.query(
      `INSERT INTO trajets 
         (nom, depart_gare_id, destination_id, duree, horaire_id, date, prix, gare_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, nom, depart_gare_id, destination_id, duree, horaire_id, date, prix, gare_id`,
      [nom, depart_gare_id, destination_id, duree, horaire_id, date, prix, gare_id]
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
      `UPDATE trajets
       SET ${sets.join(', ')}
       WHERE id = $${idx} AND gare_id = $${idx + 1}
       RETURNING id, nom, depart_gare_id, destination_id, duree, horaire_id, date, prix, gare_id`,
      values
    );
    return res.rows[0];
  },

  remove: async (id, gare_id) => {
    const res = await db.query('DELETE FROM trajets WHERE id = $1 AND gare_id = $2', [id, gare_id]);
    return res.rowCount > 0;
  },
};
