import { getDb } from './_db.js';
import { requireAuth } from './_auth.js';

export default async function handler(req, res) {
  const authErr = requireAuth(req);
  if (authErr) return res.status(401).json({ error: 'Unauthorized' });

  const sql = getDb();
  const { method } = req;

  try {
    if (method === 'GET') {
      const rows = await sql`SELECT * FROM categories ORDER BY created_at`;
      return res.status(200).json(rows);
    }

    if (method === 'POST') {
      const { id, name, color } = req.body;
      if (!id || !name) return res.status(400).json({ error: 'id and name required' });
      await sql`INSERT INTO categories (id, name, color) VALUES (${id}, ${name}, ${color || '#C0737A'})`;
      return res.status(201).json({ ok: true });
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      await sql`DELETE FROM categories WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
