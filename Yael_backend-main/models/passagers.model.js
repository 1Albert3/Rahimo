// models/passagers.model.js
const db = require('../db');
console.log('>>> [MODEL] Chargement de passagers.model.js depuis', __filename);
console.log('>>> [MODEL] Méthodes exportées :', Object.keys(module.exports));

module.exports = {
  getAll: async (gare_id) => {
    console.log('>>> [MODEL] Appel de getAll avec gare_id:', gare_id);
    const res = await db.query(`
      SELECT p.*, t.nom AS trajet
      FROM passagers p
      JOIN trajets t ON p.trajet_id = t.id
      WHERE p.gare_id = $1
      ORDER BY p.created_at DESC
    `, [gare_id]);
    return res.rows;
  },

  getById: async (id, gare_id) => {
    console.log('>>> [MODEL] Appel de getById avec id:', id, 'gare_id:', gare_id);
    const res = await db.query(`
      SELECT p.*, t.nom AS trajet
      FROM passagers p
      JOIN trajets t ON p.trajet_id = t.id
      WHERE p.id = $1 AND p.gare_id = $2
    `, [id, gare_id]);
    return res.rows[0];
  },

  getByNumerocnib: async (numerocnib, gare_id) => {
    console.log('>>> [MODEL] Appel de getByNumerocnib avec numerocnib:', numerocnib, 'gare_id:', gare_id);
    const res = await db.query(`
      SELECT p.*, t.nom AS trajet
      FROM passagers p
      JOIN trajets t ON p.trajet_id = t.id
      WHERE p.numerocnib = $1 AND p.gare_id = $2
    `, [numerocnib, gare_id]);
    return res.rows[0];
  },

  create: async ({ nom, prenom, telephone, numerocnib, date_etablissement, date_expiration, trajet_id, codeqr, gare_id }) => {
    console.log('>>> [MODEL] Appel de create avec:', { nom, prenom, telephone, numerocnib, date_etablissement, date_expiration, trajet_id, codeqr, gare_id });
    try {
      const res = await db.query(
        `INSERT INTO passagers
           (nom, prenom, telephone, numerocnib, date_etablissement, date_expiration, trajet_id, codeqr, gare_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [nom, prenom, telephone, numerocnib, date_etablissement, date_expiration, trajet_id, codeqr, gare_id]
      );
      console.log('>>> [MODEL] Résultat de create:', res.rows[0]);
      return res.rows[0];
    } catch (err) {
      console.error('>>> [MODEL] Erreur dans create:', err.message);
      throw err;
    }
  },

  update: async (id, fields, gare_id) => {
    console.log('>>> [MODEL] Appel de update avec id:', id, 'fields:', fields, 'gare_id:', gare_id);
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
    try {
      const res = await db.query(
        `UPDATE passagers
         SET ${sets.join(', ')}
         WHERE id = $${idx} AND gare_id = $${idx + 1}
         RETURNING *`,
        values
      );
      console.log('>>> [MODEL] Résultat de update:', res.rows[0]);
      return res.rows[0];
    } catch (err) {
      console.error('>>> [MODEL] Erreur dans update:', err.message);
      throw err;
    }
  },

  remove: async (id, gare_id) => {
    console.log('>>> [MODEL] Appel de remove avec id:', id, 'gare_id:', gare_id);
    try {
      const res = await db.query(
        'DELETE FROM passagers WHERE id = $1 AND gare_id = $2 RETURNING *',
        [id, gare_id]
      );
      console.log('>>> [MODEL] Résultat de DELETE:', res.rows);
      return res.rows[0]; // Retourne la ligne supprimée ou undefined si aucune
    } catch (err) {
      console.error('>>> [MODEL] Erreur dans remove:', err.message);
      throw err;
    }
  },
};

console.log('>>> [MODEL] Module exporté avec succès');