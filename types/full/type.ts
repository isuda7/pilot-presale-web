// 템플릿 `full` — 풀옵션형. 모든 메뉴·섹션 · 전체 사진 히어로 + 요약 카드 · 서브 탭 · 오피스텔/상가 확장 메뉴
// 디자인 시스템은 1개(표준)이며, 이 유형은 레이아웃 변형 · 메뉴(모듈) 구성 · 메인 섹션 구성 · 콘텐츠로 차이를 둔다.
import { sampleSite, CLASSIC } from '../shared/virtual.js'

export default {
  label: '풀옵션형',
  desc: '모든 메뉴·섹션 · 전체 사진 히어로 + 요약 카드 · 서브 탭 · 오피스텔/상가 확장 메뉴',
  site: {
    ...sampleSite(CLASSIC),
    layout: { header: 'bar', hero: 'full', sub: 'tabs', sechead: 'left', heroPos: '50% 66%', imgPos: '50% 45%' },
    home: ['quick', 'biz', 'schedule', 'location', 'premium', 'unit', 'community', 'video', 'press', 'cta'],
    quick: ['biz', 'schedule', 'supply', 'unit', 'community', 'visit'],
  },
  // L3 모듈 추가 (이 유형에만 존재). 같은 L3가 2곳 이상 반복되면 L2 승격을 검토한다.
  addModules: [
    { key: 'officetel', group: '단지안내', label: '오피스텔', level: 'L3' },
    { key: 'retail', group: '단지안내', label: '근린생활시설', level: 'L3' },
  ],
  form: { title: '관심고객등록' },
}
