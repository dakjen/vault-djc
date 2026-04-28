import { createHmac } from 'crypto';
import { createToken } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { password } = req.body || {};
    const expected = process.env.APP_PASSWORD || 'changeme';

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password required' });
    }

    // Use HMAC comparison to avoid length-leak with timingSafeEqual
    const key = 'vault-auth';
    const a = createHmac('sha256', key).update(password).digest('hex');
    const b = createHmac('sha256', key).update(expected).digest('hex');

    if (a !== b) return res.status(401).json({ error: 'Invalid password' });

    return res.status(200).json({ token: createToken() });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
