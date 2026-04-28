import { getDb } from './_db.js';
import { requireAuth } from './_auth.js';

export default async function handler(req, res) {
  const authErr = requireAuth(req);
  if (authErr) return res.status(401).json({ error: 'Unauthorized' });

  const sql = getDb();
  const { method } = req;

  try {
    if (method === 'GET') {
      const rows = await sql`
        SELECT m.*,
          COALESCE((SELECT json_agg(json_build_object('id',d.id,'type',d.type,'label',d.label,'url',d.url,'size',d.size,'added_at',d.added_at) ORDER BY d.added_at) FROM docs d WHERE d.meeting_id=m.id),'[]') AS docs,
          COALESCE((SELECT json_agg(json_build_object('id',n.id,'date',n.date,'text',n.text,'created_at',n.created_at) ORDER BY n.created_at DESC) FROM notes n WHERE n.meeting_id=m.id),'[]') AS notes
        FROM meetings m ORDER BY m.created_at DESC
      `;
      return res.status(200).json(rows);
    }

    if (method === 'POST') {
      const { id, name, cadence, attendees, color } = req.body;
      if (!id || !name) return res.status(400).json({ error: 'id and name required' });
      await sql`INSERT INTO meetings (id, name, cadence, attendees, color) VALUES (${id}, ${name}, ${cadence || ''}, ${JSON.stringify(attendees || [])}, ${color || '#C0737A'})`;
      return res.status(201).json({ ok: true });
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      await sql`DELETE FROM meetings WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
