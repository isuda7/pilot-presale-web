// 템플릿 `mid-b` — 중간형 B · 상품·입지 비주얼형. 프리미엄·커뮤니티·평면·영상 중심 · 로고 중앙 헤더 · 가운데 정렬 히어로 · 갤러리형
// 디자인 시스템은 1개(표준)이며, 이 유형은 레이아웃 변형 · 메뉴(모듈) 구성 · 메인 섹션 구성 · 콘텐츠로 차이를 둔다.
import { sampleSite, NATURE } from '../shared/virtual.js'

export default {
  label: '중간형 B · 상품·입지 비주얼형',
  desc: '프리미엄·커뮤니티·평면·영상 중심 · 로고 중앙 헤더 · 가운데 정렬 히어로 · 갤러리형',
  site: {
    ...sampleSite(NATURE),
    layout: { header: 'center', hero: 'center', sub: 'none', sechead: 'center', heroPos: '50% 50%', imgPos: '50% 50%' },
    home: ['premium', 'location', 'community', 'unit', 'video', 'cta'],
  },
  modules: { schedule: false, supply: false, notice: false, subscription: false, contract: false, telecom: false, vr: false, system: false },
  form: { title: '관심고객등록' },
}
