import { createClient, type Client } from '@libsql/client'

// 운영: Turso (TURSO_DATABASE_URL / TURSO_AUTH_TOKEN). 로컬: 파일 DB.
let client: Client | null = null
let ready: Promise<unknown> | null = null

export function db(): Client {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL || 'file:local.db',
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  }
  return client
}

// 최초 호출 시 테이블 자동 생성 (db/schema.sql 과 동일)
export function ensureSchema() {
  if (!ready) {
    ready = db().batch([
      `CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        message TEXT,
        agreed INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'new',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME DEFAULT NULL
      )`,
      'CREATE INDEX IF NOT EXISTS idx_app_created_at ON applications (created_at)',
      'CREATE INDEX IF NOT EXISTS idx_app_deleted_at ON applications (deleted_at)',
    ]).catch((e) => { ready = null; throw e })
  }
  return ready
}
