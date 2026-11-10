// [콘텐츠 스키마] 웹(관리자 편집)에서 수정할 수 있는 값의 형식·한도·검증. 서버(저장 전 검증)와 화면(편집 폼)이 함께 읽는다.
// 원칙: 데이터는 의미 단위 하나로 공통이고, 템플릿마다 그리는 컴포넌트만 다르다.
// 웹에서 수정할 수 없는 항목(사람이 확정): 개인정보 문구·보유기간(privacy), 푸터 고지(notices), 메뉴·레이아웃 구조, 신청 폼 정의.

export const IMAGE_MOTIFS = ['hero', 'building', 'location', 'park', 'plan', 'interior', 'community', 'video']
export const MOTIF_LABEL: Record<string, string> = { hero: '대표(스카이라인)', building: '건물', location: '지도', park: '조경', plan: '평면도', interior: '실내', community: '커뮤니티', video: '영상(재생 버튼)' }
export const CONTENT_KEY_RE = /^[a-z][a-z0-9.\-]{0,30}$/

const CTRL = /[\u0000-\u001f\u007f]/g
function str(v: unknown, max: number, label: string, required = false): string {
  const s = String(v ?? '').replace(CTRL, ' ').trim()
  if (s.length > max) throw new Error(`${label}은(는) ${max}자 이하여야 합니다.`)
  if (required && !s) throw new Error(`${label}은(는) 비워 둘 수 없습니다.`)
  return s
}
const arr = (v: unknown, max: number, label: string): any[] => {
  if (v == null || v === '') return []
  if (!Array.isArray(v)) throw new Error(`${label} 형식이 올바르지 않습니다.`)
  if (v.length > max) throw new Error(`${label}은(는) 최대 ${max}개까지 입력할 수 있습니다.`)
  return v
}

// 사이트 기본 정보(웹 수정 가능 필드만). 일부 필드만 보내도 된다.
export function cleanSite(v: any) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('기본 정보 형식이 올바르지 않습니다.')
  const out: any = {}
  if ('name' in v) out.name = str(v.name, 60, '현장명', true)
  if ('phone' in v) {
    const p = str(v.phone, 30, '대표전화', true)
    if (!/^[0-9\-+\s().]{4,30}$/.test(p)) throw new Error('대표전화 형식이 올바르지 않습니다.')
    out.phone = p
  }
  if ('address' in v) out.address = str(v.address, 120, '주소')
  if ('hours' in v) out.hours = str(v.hours, 60, '운영시간')
  if (v.hero && typeof v.hero === 'object') {
    const h: any = {}
    const src = v.hero
    if ('eyebrow' in src) h.eyebrow = str(src.eyebrow, 80, '히어로 소제목')
    if ('title' in src) h.title = str(src.title, 80, '히어로 제목', true)
    if ('sub' in src) h.sub = str(src.sub, 200, '히어로 설명')
    if ('cta2' in src) h.cta2 = str(src.cta2, 30, '보조 버튼 문구')
    if ('facts' in src) {
      h.facts = arr(src.facts, 6, '요약 수치').map((r, i) => {
        if (!Array.isArray(r)) throw new Error(`요약 수치 ${i + 1}번 형식이 올바르지 않습니다.`)
        return [str(r[0], 20, '요약 수치 이름'), str(r[1], 40, '요약 수치 값')]
      }).filter((r) => r[0] || r[1])
    }
    out.hero = h
  }
  return out
}

// 본문 블록: { image, lead, table, cards, list }. 저장 시 다섯 블록을 모두 내려 보내 "비움"도 덮어쓸 수 있게 한다.
export function cleanContent(v: any) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('본문 형식이 올바르지 않습니다.')
  const image = String(v.image ?? '').trim()
  if (image && !IMAGE_MOTIFS.includes(image)) throw new Error('이미지는 목록에서 선택해야 합니다.')
  return {
    image,
    lead: str(v.lead, 1000, '소개 문단'),
    table: arr(v.table, 30, '표').map((r, i) => {
      if (!Array.isArray(r)) throw new Error(`표 ${i + 1}행 형식이 올바르지 않습니다.`)
      return [str(r[0], 60, '표 항목'), str(r[1], 200, '표 내용')]
    }).filter((r) => r[0] || r[1]),
    cards: arr(v.cards, 12, '카드').map((c, i) => {
      if (!c || typeof c !== 'object') throw new Error(`카드 ${i + 1}번 형식이 올바르지 않습니다.`)
      return { title: str(c.title, 60, '카드 제목'), text: str(c.text, 300, '카드 설명') }
    }).filter((c) => c.title || c.text),
    list: arr(v.list, 30, '목록').map((x) => str(x, 200, '목록 항목')).filter(Boolean),
  }
}
