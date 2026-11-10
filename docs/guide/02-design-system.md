# 2. 디자인 시스템 규칙

## 1. 디자인 시스템은 1개, 차이는 구성으로
- 디자인 시스템(색·타이포·버튼·카드·표·폼)은 **표준 하나**다(`src/css/tokens.css`, `common.css`). 튀거나 개성이 강한 스킨·테마는 쓰지 않는다. 안정감 있는 블루 + 중립 그레이.
- 템플릿(유형)의 차이는 **일반적으로 쓰는 UI 패턴 안에서** 이렇게 둔다.

| 차이를 두는 곳 | 선택지 | 설정 |
|---|---|---|
| 헤더 | `bar`(로고+메뉴+전화) / `center`(로고 중앙) / `simple`(드롭다운 없음) | `SITE.layout.header` |
| 히어로 | `full` / `center` / `split` / `banner` | `SITE.layout.hero` |
| 서브 페이지 이동 | 없음 / 상단 탭 / 좌측 메뉴 | `SITE.layout.sub` |
| 섹션 제목 정렬 | `left` / `center` | `SITE.layout.sechead` |
| 메뉴 구성 | L2 켜고 끄기, L3 추가 | `modules`, `addModules` |
| 메인 섹션 구성 | 섹션 키 배열 | `SITE.home` |
| 콘텐츠 양·문구 | 프로필(항목 수, 문구) | `types/shared/virtual.ts` |

- 새로운 패턴이 필요하면 `common.css`에 변형을 추가한다(템플릿에서). **현장에서는 변형을 고르기만 하고 CSS를 고치지 않는다.**
- 구조 유형(최소·풀옵션·중간 A·중간 B)은 위 선택지의 조합이다. 후보 분석(`docs/benchmark.md`)의 L1/L2/L3 판정이 메뉴 구성의 근거다.

## 2. 공통 범위
### 공통(건드리지 않는 것) — 구조 코드
- `src/css/common.css`(표준 디자인 시스템과 레이아웃 변형), `src/js/*`, `api/`, `server/`, `vite.config.js`, `vercel.json`
- 페이지의 뼈대 (`<div id="site-header">`, `<main data-module>`, `<div id="site-footer">`)

### 값으로 바꿔도 되는 것 — 디자인 토큰 (`src/css/tokens.css`)
| 토큰 | 용도 |
|---|---|
| `--c-main`, `--c-main-d`, `--c-main-l` | 주 색상, hover, 연한 배경 |
| `--c-accent` | 소제목·강조선 포인트 색 |
| `--c-page`, `--c-bg`, `--c-line` | 페이지 바탕, 보조 바탕, 선 |
| `--c-text`, `--c-sub`, `--c-muted` | 본문·보조 글자 |
| `--c-footer-bg`, `--c-footer-text` | 푸터 |
| `--font-base`, `--radius`, `--max-width`, `--header-h` | 글꼴, 모서리, 콘텐츠 폭, 헤더 높이 |

- 현장은 브랜드 색을 맞출 때 `tokens.css`의 값만 바꾼다. 새 색이 필요하면 `common.css`에 값을 직접 쓰지 말고 토큰을 먼저 추가한다(템플릿에서).

## 3. 덮어쓰기 우선순위
| 순위 | 방법 | 예 | 위험 |
|---|---|---|---|
| 1 | 값 덮어쓰기 | `type.ts`의 `site`, 디자인 토큰, 신청 폼 `form` | 낮음. 기본이 바뀌어도 충돌 없음 |
| 2 | 켜고 끄기 | `modules: { community: false }` | 낮음 |
| 3 | 파일 교체 | `types/<이름>/pages/subscription.html` | **높음. 기본과 연결이 끊긴다** |

- 1→2→3 순으로 시도하고, 3은 마지막 수단이다.
- 파일 교체를 했으면 `npm run type:report`로 `types/<이름>/REPLACED.md`를 갱신한다. 이 목록이 "기본이 개선되어도 따라오지 않는 파일"이다.
- 유형 폴더에 기본과 **같은 내용을 복사해 두지 않는다**. 다른 것만 둔다.
- 적용 순서: 기본(`config/base.ts`) → 유형 → 현장(`config/site.ts`). 객체는 항목 단위 병합, 배열은 통째로 교체.

## 4. 새로 만들 때
**새 템플릿(유형)**
1. `types/<이름>/type.ts` 작성, `types/index.ts`에 등록 (`site.layout`, `site.home`, `modules`, 콘텐츠 프로필)
2. 먼저 `layout` 변형과 `modules`(켜고 끄기), `home`(섹션 구성)만으로 가능한지 본다
3. 안 되면 L3: `addModules` + `types/<이름>/pages/`에 페이지 추가
4. 그래도 안 되면 파일 교체 + 교체 목록 갱신
5. 이미지는 `src/assets/photos/<이름>/`(사진) 또는 `src/assets/art/<이름>/`(CG)에 모티프 이름으로 둔다

**새 레이아웃 변형(템플릿 쪽)**: `common.css`에 `html[data-<속성>="값"]` 규칙 추가 → `layout.js`가 속성을 지정한다. 모바일(960px 이하)에서 깨지지 않는지 확인한다.

**새 L2/L3 페이지(템플릿 쪽)**
1. `config/modules.js`에 추가 → `npm run gen:pages`
2. 가상 데이터는 `types/shared/virtual.ts`에 같은 키로 추가

## 5. 규칙 요약
- 디자인 시스템은 하나다. 템플릿은 레이아웃 변형·메뉴 구성·메인 섹션 구성·콘텐츠로 차이를 둔다(일반적인 패턴 안에서).
- 구조 코드는 현장에서 고치지 않는다. 고칠 일이 생기면 템플릿에서 고치고 전파한다.
- 같은 L3가 2곳 이상 반복되면 L2로 승격할지 검토한다. 레벨 변경은 `config/modules.js`의 `note`와 `docs/benchmark.md`에 기록한다.
- 샘플(외부 공개) 템플릿은 가상 데이터만 쓴다. 신청 기능은 현장과 동일하게 동작하므로 가상 정보로만 테스트하도록 안내한다.
- 기존 브랜드 디자인(브랜드 가이드)이 있으면 `tokens.css`의 값으로 가져온다.
