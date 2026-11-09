# Pilot Presale (분양 파일럿) — Vercel 단일 프로젝트

- 프론트: Vite 멀티페이지 (HTML/CSS/JS) → `dist/`
- 백엔드: Hono (`server/app.ts`) → Vercel Function (`api/index.ts`)
- DB: Turso(libSQL). 로컬은 `local.db` 파일 자동 사용. 테이블은 최초 호출 시 자동 생성

## 로컬 실행
```bash
npm install
npm run dev   # 웹 http://localhost:5180 , API http://localhost:8790
```
로컬 환경변수는 `.env.local` (관리자 비밀번호 임시값 포함, 커밋 제외).

## Vercel 배포
1. GitHub 저장소로 push → Vercel에서 Import (Framework: Vite 자동 인식, Root: 저장소 루트)
2. Environment Variables 등록: `ADMIN_PASSWORD`, `TOKEN_SECRET`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (`.env.example` 참고)
3. Deploy. 이후 push 마다 자동 빌드·배포

## 페이지
`/` 메인 · `/pages/biz|complex|unit.html` 안내(빈 영역) · `/pages/visit.html` 신청 · `/pages/admin.html` 관리자 목록

## API
`POST /api/applications` · `POST /api/admin/login` · `GET|PATCH|DELETE /api/admin/applications[/:id]` (Bearer)
