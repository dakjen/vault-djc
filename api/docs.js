import { getDb } from './_db.js';
import { requireAuth } from './_auth.js';
import { del } from '@vercel/blob';

export default async function handler(req, res) {
  const authErr = requireAuth(req);
  if (authErr) return res.status(401).json({ error: 'Unauthorized' });

  const sql = getDb();
  const { method } = req;

  try {
    if (method === 'POST') {
      const { id, meeting_id, type, label, url, size } = req.body;
      if (!id || !meeting_id) return res.status(400).json({ error: 'id and meeting_id required' });
      await sql`INSERT INTO docs (id, meeting_id, type, label, url, size) VALUES (${id}, ${meeting_id}, ${type}, ${label || ''}, ${url || ''}, ${size || 0})`;
      return res.status(201).json({ ok: true });
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      const rows = await sql`SELECT type, url FROM docs WHERE id = ${id}`;
      if (rows.length && rows[0].type === 'file' && rows[0].url) {
        try { await del(rows[0].url); } catch {}
      }
      await sql`DELETE FROM docs WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
