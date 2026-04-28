import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = () => process.env.APP_PASSWORD || 'changeme';

export function createToken() {
  const ts = Date.now().toString();
  const sig = createHmac('sha256', SECRET()).update(ts).digest('hex');
  return `${ts}.${sig}`;
}

export function verifyToken(token) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [ts, sig] = parts;
  const age = Date.now() - parseInt(ts, 10);
  if (isNaN(age) || age > 7 * 24 * 60 * 60 * 1000) return false; // 7 day expiry
  const expected = createHmac('sha256', SECRET()).update(ts).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export function requireAuth(req) {
  const auth = req.headers.get?.('authorization') || req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '');
  if (!verifyToken(token)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}
