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

-- 웹에서 수정한 콘텐츠 (server/db.ts 가 자동 생성). scope = 유형 이름('' = 기본 사이트)
CREATE TABLE IF NOT EXISTS site_content (
    scope TEXT NOT NULL DEFAULT '',
    key TEXT NOT NULL,           -- 'site' 또는 'c:<콘텐츠키>'
    value TEXT NOT NULL,         -- JSON
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (scope, key)
);
CREATE TABLE IF NOT EXISTS site_content_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scope TEXT NOT NULL DEFAULT '',
    key TEXT NOT NULL,
    value TEXT,                  -- 수정 전 값(JSON)
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_hist_sk ON site_content_history (scope, key, id);
