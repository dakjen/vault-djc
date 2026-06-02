import { neon } from '@neondatabase/serverless';

let sql;
export function getDb() {
  if (!sql) sql = neon(process.env.DATABASE_URL);
  return sql;
}

export async function initSchema() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      cadence TEXT DEFAULT '',
      attendees JSONB DEFAULT '[]',
      color TEXT DEFAULT '#C0737A',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS docs (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      label TEXT DEFAULT '',
      url TEXT DEFAULT '',
      size INTEGER DEFAULT 0,
      added_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
      date DATE,
      text TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#C0737A',
      position INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0`;
  await sql`
    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
      text TEXT NOT NULL,
      deadline DATE,
      done BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}
