import { put } from '@vercel/blob';
import { requireAuth } from './_auth.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const authErr = requireAuth(req);
  if (authErr) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const filename = req.query.filename;
  if (!filename) return res.status(400).json({ error: 'filename required' });

  try {
    const blob = await put(filename, req, { access: 'public' });
    return res.status(200).json({ url: blob.url, size: blob.size });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
