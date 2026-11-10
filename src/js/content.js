import { SITE } from './config.js'
import { artUrl } from './art.js'

// 본문 데이터(SITE.content)를 자리표시자(.placeholder)에 채운다. 데이터가 없는 모듈은 '준비중'으로 남는다.
// 형식: { image: '모티프 이름(hero·building·location·park·plan·interior·community·video) 또는 설명', lead: '문단', table: [['항목','값']], cards: [{title,text}], list: ['항목'] }
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

// 이미지: 모티프 이름이면 유형의 사진/CG, 아니면 설명 박스. 'video' 는 히어로 이미지에 재생 버튼을 얹는다.
let imageCount = 0 // 페이지의 첫 이미지는 즉시 로드(화면 상단), 나머지는 지연 로드
export function image(name) {
  const url = artUrl(name === 'video' ? 'hero' : name)
  if (!url) return `<div class="c-image c-image-empty">${esc(name)}</div>`
  return `<figure class="c-image${name === 'video' ? ' c-video' : ''}"><img src="${url}" alt="" loading="${imageCount++ === 0 ? 'eager' : 'lazy'}" decoding="async"></figure>`
}

export const tableHtml = (rows) => `<table class="c-table">${rows.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>`
export const cardsHtml = (cards) => `<div class="c-cards">${cards.map((x) => `<div class="c-card"><strong>${esc(x.title)}</strong><p>${esc(x.text)}</p></div>`).join('')}</div>`
export const listHtml = (items) => `<ul class="c-list">${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`

export function renderContent(c, { lead = true, img = true } = {}) {
  return [
    img && c.image ? image(c.image) : '',
    lead && c.lead ? `<p class="c-lead">${esc(c.lead)}</p>` : '',
    c.table?.length ? tableHtml(c.table) : '',
    c.cards?.length ? cardsHtml(c.cards) : '',
    c.list?.length ? listHtml(c.list) : '',
  ].join('')
}

export function fillContent(moduleKey) {
  document.querySelectorAll('.placeholder').forEach((el) => {
    const key = el.dataset.content || moduleKey
    const c = key && SITE.content[key]
    if (!c) return
    el.className = 'content'
    el.innerHTML = renderContent(c)
  })
}
