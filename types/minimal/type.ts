// 템플릿 `minimal` — 최소형. 꼭 필요한 정보만 · 간단한 헤더 · 낮은 배너 · 4개 섹션 + 상담 CTA
// 디자인 시스템은 1개(표준)이며, 이 유형은 레이아웃 변형 · 메뉴(모듈) 구성 · 메인 섹션 구성 · 콘텐츠로 차이를 둔다.
import { sampleSite, MINIMAL } from '../shared/virtual.js'

export default {
  label: '최소형',
  desc: '꼭 필요한 정보만 · 간단한 헤더 · 낮은 배너 · 4개 섹션 + 상담 CTA',
  site: {
    ...sampleSite(MINIMAL),
    layout: { header: 'simple', hero: 'banner', sub: 'none', sechead: 'left', heroPos: '50% 50%', imgPos: '50% 50%' },
    home: ['biz', 'location', 'premium', 'directions', 'cta'],
  },
  modules: { schedule: false, supply: false, notice: false, subscription: false, contract: false, design: false, community: false, plan: false, telecom: false, vr: false, unit: false, emodel: false, interior: false, system: false, video: false, event: false },
  form: { title: '관심고객등록' },
}
