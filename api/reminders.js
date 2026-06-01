import { getDb } from './_db.js';
import { requireAuth } from './_auth.js';

export default async function handler(req, res) {
  const authErr = requireAuth(req);
  if (authErr) return res.status(401).json({ error: 'Unauthorized' });

  const sql = getDb();
  const { method } = req;

  try {
    if (method === 'GET') {
      const rows = await sql`SELECT * FROM reminders ORDER BY created_at DESC`;
      return res.status(200).json(rows);
    }

    if (method === 'POST') {
      const { id, category_id, text, deadline } = req.body;
      if (!id || !text) return res.status(400).json({ error: 'id and text required' });
      await sql`INSERT INTO reminders (id, category_id, text, deadline) VALUES (${id}, ${category_id || null}, ${text}, ${deadline || null})`;
      return res.status(201).json({ ok: true });
    }

    if (method === 'PUT') {
      const { id, text, deadline, done, category_id } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      if (text !== undefined) await sql`UPDATE reminders SET text = ${text} WHERE id = ${id}`;
      if (deadline !== undefined) await sql`UPDATE reminders SET deadline = ${deadline || null} WHERE id = ${id}`;
      if (done !== undefined) await sql`UPDATE reminders SET done = ${done} WHERE id = ${id}`;
      if (category_id !== undefined) await sql`UPDATE reminders SET category_id = ${category_id || null} WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      await sql`DELETE FROM reminders WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
