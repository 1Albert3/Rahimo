// models/reservations.model.js
const db = require('../db');
console.log('>>> [MODEL] Chargement de reservations.model.js depuis', __filename);
console.log('>>> [MODEL] Méthodes exportées :', Object.keys(module.exports));

module.exports = {
  getAll: async (gare_id) => {
    console.log('>>> [MODEL] Appel de getAll avec gare_id:', gare_id);
    try {
      const res = await db.query(
        'SELECT id, nom, prenom, telephone, voyage_id, created_at, gare_id FROM reservations WHERE gare_id = $1 ORDER BY created_at DESC',
        [gare_id]
      );
      console.log('>>> [MODEL] Résultat de getAll:', res.rows);
      return res.rows;
    } catch (err) {
      console.error('>>> [MODEL] Erreur dans getAll:', err.message);
      throw err;
    }
  },

  getById: async (id, gare_id) => {
    console.log('>>> [MODEL] Appel de getById avec id:', id, 'gare_id:', gare_id);
    try {
      const res = await db.query(
        'SELECT id, nom, prenom, telephone, voyage_id, created_at, gare_id FROM reservations WHERE id = $1 AND gare_id = $2',
        [id, gare_id]
      );
      console.log('>>> [MODEL] Résultat de getById:', res.rows[0]);
      return res.rows[0];
    } catch (err) {
      console.error('>>> [MODEL] Erreur dans getById:', err.message);
      throw err;
    }
  },

  getByTelephone: async (telephone, gare_id) => {
    console.log('>>> [MODEL] Appel de getByTelephone avec telephone:', telephone, 'gare_id:', gare_id);
    try {
      const res = await db.query(
        'SELECT id, nom, prenom, telephone, voyage_id, created_at, gare_id FROM reservations WHERE telephone = $1 AND gare_id = $2',
        [telephone, gare_id]
      );
      console.log('>>> [MODEL] Résultat de getByTelephone:', res.rows[0]);
      return res.rows[0];
    } catch (err) {
      console.error('>>> [MODEL] Erreur dans getByTelephone:', err.message);
      throw err;
    }
  },

  create: async ({ nom, prenom, telephone, voyage_id, gare_id }) => {
    console.log('>>> [MODEL] Appel de create avec:', { nom, prenom, telephone, voyage_id, gare_id });
    try {
      const res = await db.query(
        `INSERT INTO reservations
           (nom, prenom, telephone, voyage_id, gare_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, nom, prenom, telephone, voyage_id, created_at, gare_id`,
        [nom, prenom, telephone, voyage_id, gare_id]
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
        `UPDATE reservations
         SET ${sets.join(', ')}
         WHERE id = $${idx} AND gare_id = $${idx + 1}
         RETURNING id, nom, prenom, telephone, voyage_id, created_at, gare_id`,
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
        'DELETE FROM reservations WHERE id = $1 AND gare_id = $2 RETURNING id, nom, prenom, telephone, voyage_id, created_at, gare_id',
        [id, gare_id]
      );
      console.log('>>> [MODEL] Résultat de DELETE:', res.rows);
      return res.rows[0];
    } catch (err) {
      console.error('>>> [MODEL] Erreur dans remove:', err.message);
      throw err;
    }
  },
};

console.log('>>> [MODEL] Module exporté avec succès');