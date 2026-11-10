// 템플릿 `mid-a` — 중간형 A · 분양정보형. 청약 일정·공급·계약 중심 · 좌 글/우 사진 히어로 · 서브 좌측 메뉴 · 방문예약
// 디자인 시스템은 1개(표준)이며, 이 유형은 레이아웃 변형 · 메뉴(모듈) 구성 · 메인 섹션 구성 · 콘텐츠로 차이를 둔다.
import { sampleSite, URBAN } from '../shared/virtual.js'

export default {
  label: '중간형 A · 분양정보형',
  desc: '청약 일정·공급·계약 중심 · 좌 글/우 사진 히어로 · 서브 좌측 메뉴 · 방문예약',
  site: {
    ...sampleSite(URBAN),
    layout: { header: 'bar', hero: 'split', sub: 'side', sechead: 'left', heroPos: '50% 55%', imgPos: '50% 40%' },
    home: ['schedule', 'biz', 'supply', 'unit', 'location', 'cta'],
  },
  modules: { subscription: false, community: false, telecom: false, vr: false, emodel: false, interior: false, system: false, video: false, event: false },
  form: { title: '방문예약' },
}
