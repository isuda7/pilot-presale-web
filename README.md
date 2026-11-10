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
2. Environment Variables 등록: `ADMIN_PASSWORD`, `TOKEN_SECRET`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (`.env.example` 참고. 유형을 쓰면 `SITE_TYPE`도 등록)
3. Deploy. 이후 push 마다 자동 빌드·배포

## 페이지
`/` 메인 · `/pages/<모듈키>.html` 안내 페이지(`config/modules.js` 참고) · `/pages/visit.html` 신청 · `/pages/admin.html` 관리자 목록 · `/guide/` 가이드 매뉴얼(내부용, `guide/` 폴더)

## 문서
`docs/01-master-plan.md`(기획) · `02-implementation-scope.md`(단계) · `03-prompts.md`(프롬프트) · `04-site-edit-guide.md`(수정 범위) · `benchmark.md` · `guide/`(가이드 매뉴얼) · 가이드 4장 `docs/guide/04-updates.md`(버전별 진행 내역)

## API
`POST /api/applications` · `POST /api/admin/login` · `GET|PATCH|DELETE /api/admin/applications[/:id]` (Bearer)

## 템플릿 미리보기 (사진 교체는 `src/assets/photos/README.md`)
`npm run dev` 한 서버에서 `/`(기본), `/t/`(템플릿 선택), `/t/<유형>/`(각 템플릿)을 화면 이동으로 본다. 배포용은 `npm run build:demo`. 자세한 내용은 `docs/04-site-edit-guide.md`.

## 콘텐츠 웹 편집
사이트 화면에서 바로 수정(관리자 로그인 후 `?edit=1` 또는 관리자 화면의 "사이트에서 직접 편집") 또는 관리자 → 콘텐츠 편집 탭에서 문구·수치·본문을 수정(DB 저장, 파일 기본값 위에 적용). 개발자용 파일↔DB 동기화는 `npm run content -- export|import` (`docs/04-site-edit-guide.md`).
