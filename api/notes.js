import { getDb } from './_db.js';
import { requireAuth } from './_auth.js';

export default async function handler(req, res) {
  const authErr = requireAuth(req);
  if (authErr) return res.status(401).json({ error: 'Unauthorized' });

  const sql = getDb();
  const { method } = req;

  try {
    if (method === 'POST') {
      const { id, meeting_id, date, text } = req.body;
      if (!id || !meeting_id) return res.status(400).json({ error: 'id and meeting_id required' });
      await sql`INSERT INTO notes (id, meeting_id, date, text) VALUES (${id}, ${meeting_id}, ${date || null}, ${text || ''})`;
      return res.status(201).json({ ok: true });
    }

    if (method === 'PUT') {
      const { id, date, text } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      if (date !== undefined) await sql`UPDATE notes SET date = ${date} WHERE id = ${id}`;
      if (text !== undefined) await sql`UPDATE notes SET text = ${text} WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      await sql`DELETE FROM notes WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
