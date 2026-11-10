// [L1/L2 모듈 목록] 기본(base)이 구현한 페이지 전체. 레벨 근거는 docs/benchmark.md.
// - L1: 항상 켜짐. L2: 기본 켜짐, config/site.ts 의 modules 로 끈다.
// - 새 페이지를 추가하면 `npm run gen:pages` 로 pages/<key>.html 을 만든다.
// - group 이 null 이면 상단 메뉴가 아닌 단독 항목, menu:false 면 메뉴에 표시하지 않는다.
export const GROUPS = ['사업안내', '분양안내', '계약안내', '단지안내', '세대안내', '홍보센터']

// 모듈의 `en`은 섹션·페이지의 영문 소제목(eyebrow)에 쓴다. GROUP_EN 은 영문 메뉴가 필요할 때를 위해 남겨 둔다(현재 미사용).
export const GROUP_EN = { 사업안내: 'OVERVIEW', 분양안내: 'SALES', 계약안내: 'CONTRACT GUIDE', 단지안내: 'COMPLEX PLAN', 세대안내: 'UNIT PLAN', 홍보센터: 'PR CENTER' }

export const MODULES = [
  // 사업안내 (L1)
  { key: 'biz', en: 'OVERVIEW', group: '사업안내', label: '사업개요', level: 'L1' },
  { key: 'location', en: 'LOCATION', group: '사업안내', label: '입지환경', level: 'L1' },
  { key: 'premium', en: 'PREMIUM', group: '사업안내', label: '프리미엄', level: 'L1' },
  { key: 'directions', en: 'CONTACT', group: '사업안내', label: '오시는길', level: 'L1' },

  // 분양안내 (L2)
  { key: 'schedule', en: 'SCHEDULE', group: '분양안내', label: '분양일정', level: 'L2' },
  { key: 'supply', en: 'SUPPLY', group: '분양안내', label: '공급안내', level: 'L2' },
  { key: 'notice', en: 'NOTICE', group: '분양안내', label: '입주자 모집공고', level: 'L2' },
  { key: 'subscription', en: 'SUBSCRIPTION', group: '분양안내', label: '청약안내', level: 'L2', note: 'L3에서 승격 (8, 10번)' },

  // 계약안내 (L2) — 인지세·자금조달·명의변경 등은 이 페이지 안의 목록(L4 값)
  { key: 'contract', en: 'CONTRACT', group: '계약안내', label: '계약안내', level: 'L2' },

  // 단지안내 (L2)
  { key: 'design', en: 'COMPLEX', group: '단지안내', label: '단지설계', level: 'L2' },
  { key: 'community', en: 'COMMUNITY', group: '단지안내', label: '커뮤니티', level: 'L2' },
  { key: 'plan', en: 'SITE PLAN', group: '단지안내', label: '단지·동호수 배치도', level: 'L2' },
  { key: 'telecom', en: 'TELECOM', group: '단지안내', label: '이동통신설비 협의결과서', level: 'L2' },
  { key: 'vr', en: 'AERIAL VR', group: '단지안내', label: '지역조감VR', level: 'L2', note: 'L3에서 승격 (7, 8번)' },

  // 세대안내 (L2) — 마감재 리스트는 세대안내 안의 목록
  { key: 'unit', en: 'UNIT PLAN', group: '세대안내', label: '평면안내', level: 'L2' },
  { key: 'emodel', en: 'E-MODEL', group: '세대안내', label: 'E-모델하우스', level: 'L2' },
  { key: 'interior', en: 'INTERIOR', group: '세대안내', label: '인테리어', level: 'L2' },
  { key: 'system', en: 'SYSTEM', group: '세대안내', label: '시스템', level: 'L2' },

  // 홍보센터
  { key: 'press', en: 'PRESS', group: '홍보센터', label: '언론보도', level: 'L1' },
  { key: 'video', en: 'VIDEO', group: '홍보센터', label: '홍보영상', level: 'L2' },
  { key: 'event', en: 'EVENT', group: '홍보센터', label: '이벤트', level: 'L2' },

  // 신청 (L1). 방문예약형/관심고객등록형은 config/form.ts 의 title 로 구분한다.
  { key: 'visit', en: 'CUSTOMER', group: null, label: '관심고객등록', level: 'L1', page: 'custom' },
  // 개인정보처리방침 (L1, 푸터 링크)
  { key: 'privacy', en: 'PRIVACY', group: null, label: '개인정보처리방침', level: 'L1', page: 'custom', menu: false },
]
