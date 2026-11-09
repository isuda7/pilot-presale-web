// 사이트 공통 설정: 메뉴/상호/전화번호는 여기서만 수정
export const SITE = {
  name: '파일럿 분양 사이트',
  phone: '1800-0000',
  menu: [
    { label: '사업안내', href: '/pages/biz.html', sub: ['사업개요', '브랜드', '입지환경', '프리미엄'] },
    { label: '단지안내', href: '/pages/complex.html', sub: ['단지설계', '단지조경', '커뮤니티', '단지배치도'] },
    { label: '세대안내', href: '/pages/unit.html', sub: ['평면정보', '인테리어'] },
    { label: '방문예약', href: '/pages/visit.html', sub: [] },
  ],
}

// 백엔드 API 베이스. 개발: vite 프록시(상대경로), 배포: VITE_API_BASE 환경변수
export const API_BASE = import.meta.env.VITE_API_BASE || ''
