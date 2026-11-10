import { SITE } from './config.js'
import { artUrl } from './art.js'

// 본문 데이터(SITE.content)를 자리표시자(.placeholder)에 채운다. 데이터가 없는 모듈은 '준비중'으로 남는다.
// 형식: { image: '모티프 이름(hero·building·location·park·plan·interior·community·video) 또는 설명', lead: '문단', table: [['항목','값']], cards: [{title,text}], list: ['항목'] }
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

// 편집 표시: 화면 조각이 어느 데이터인지 알려 준다(인라인 편집 모드가 사용, 방문자에게는 영향 없음).
//   data-e = 저장 단위('site' | 'c:<콘텐츠키>'), data-f = 필드, data-block = 반복 블록(table|cards|list|facts), data-row = 반복 행
// 이미지: 모티프 이름이면 유형의 사진/CG, 아니면 설명 박스. 'video' 는 히어로 이미지에 재생 버튼을 얹는다.
let imageCount = 0 // 페이지의 첫 이미지는 즉시 로드(화면 상단), 나머지는 지연 로드
export function image(name, key = '') {
  const url = artUrl(name === 'video' ? 'hero' : name)
  if (!url) return `<div class="c-image c-image-empty">${esc(name)}</div>`
  const ed = key ? ` data-e="c:${key}" data-f="image" data-motif="${esc(name)}"` : ''
  return `<figure class="c-image${name === 'video' ? ' c-video' : ''}"${ed}><img src="${url}" alt="" loading="${imageCount++ === 0 ? 'eager' : 'lazy'}" decoding="async"></figure>`
}

const ek = (key) => (key ? ` data-e="c:${key}"` : '')
export const tableHtml = (rows, key = '') => `<table class="c-table"${ek(key)} data-block="table">${rows.map(([k, v]) => `<tr data-row><th data-f="c0">${esc(k)}</th><td data-f="c1">${esc(v)}</td></tr>`).join('')}</table>`
export const cardsHtml = (cards, key = '') => `<div class="c-cards"${ek(key)} data-block="cards">${cards.map((x) => `<div class="c-card" data-row><strong data-f="title">${esc(x.title)}</strong><p data-f="text">${esc(x.text)}</p></div>`).join('')}</div>`
export const listHtml = (items, key = '') => `<ul class="c-list"${ek(key)} data-block="list">${items.map((x) => `<li data-row><span data-f="item">${esc(x)}</span></li>`).join('')}</ul>`

export function renderContent(c, { lead = true, img = true, key = '' } = {}) {
  return [
    img && c.image ? image(c.image, key) : '',
    lead && c.lead ? `<p class="c-lead"${ek(key)} data-f="lead">${esc(c.lead)}</p>` : '',
    c.table?.length ? tableHtml(c.table, key) : '',
    c.cards?.length ? cardsHtml(c.cards, key) : '',
    c.list?.length ? listHtml(c.list, key) : '',
  ].join('')
}

export function fillContent(moduleKey) {
  document.querySelectorAll('.placeholder').forEach((el) => {
    const key = el.dataset.content || moduleKey
    const c = key && SITE.content[key]
    if (!c) return
    el.className = 'content'
    el.innerHTML = renderContent(c, { key })
  })
}
