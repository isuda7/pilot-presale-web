-- Turso (SQLite) 스키마. 서버가 최초 호출 시 자동 생성(server/db.ts)하므로 수동 실행은 선택.
CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT,
    agreed INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'new',  -- new | contacted | done
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS idx_app_created_at ON applications (created_at);
CREATE INDEX IF NOT EXISTS idx_app_deleted_at ON applications (deleted_at);
