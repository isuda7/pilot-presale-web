import { SITE, MODULES, FORM, BASE } from './config.js'
import { esc, image, tableHtml, cardsHtml, listHtml } from './content.js'

// 메인 페이지 구성(SITE.home)을 섹션으로 그린다. 섹션 키 = 모듈 키(content 가 있는 것) 또는 quick · cta.
// 꺼진 L2 모듈의 섹션은 건너뛴다. 섹션의 모양은 키마다 정해져 있고, 배치는 레이아웃 변형(html[data-*])이 바꾼다.
const href = (key) => `${BASE}pages/${key}.html`
const isOn = (m) => m.level === 'L1' || SITE.modules[m.key] !== false
const mod = (key) => MODULES.find((m) => m.key === key)

function head(m, desc) {
  return `<div class="sec-head">${m.en ? `<span class="sec-en">${m.en}</span>` : ''}<h2>${m.label}</h2>${desc ? `<p class="sec-desc">${esc(desc)}</p>` : ''}</div>`
}
const more = (m) => (m.group || m.key === 'visit' ? `<a class="more" href="${href(m.key)}">${m.label} 자세히 보기 →</a>` : '')

// 섹션 본문 모양
function body(key, c) {
  if (key === 'schedule' && c.table?.length) {
    return `<ol class="timeline">${c.table.map(([k, v]) => `<li><strong>${esc(k)}</strong><span>${esc(v)}</span></li>`).join('')}</ol>`
  }
  if ((key === 'biz' || key === 'directions' || key === 'officetel' || key === 'retail') && c.table?.length) {
    return `<div class="biz-grid">${c.image ? image(c.image) : ''}<div>${tableHtml(c.table)}</div></div>`
  }
  if (key === 'video') return image('video')
  return [c.image ? image(c.image) : '', c.table?.length ? tableHtml(c.table) : '', c.cards?.length ? cardsHtml(c.cards) : '', c.list?.length ? listHtml(c.list) : ''].join('')
}

function quick() {
  const keys = (SITE.quick || ['biz', 'schedule', 'supply', 'unit', 'community', 'visit']).filter((k) => mod(k) && isOn(mod(k)))
  const label = (m) => (m.key === 'visit' ? FORM.title : m.label)
  return `<section class="hsec"><div class="inner"><div class="quick-grid">${keys.map((k, i) => `<a href="${href(k)}"><i>${String(i + 1).padStart(2, '0')}</i>${label(mod(k))}</a>`).join('')}</div></div></section>`
}

function cta() {
  const m = mod('visit')
  return `<section class="cta-band"><div class="inner"><div><h2>${esc(SITE.name)}, 지금 상담해 보세요</h2><p>${SITE.hours ? `운영시간 ${esc(SITE.hours)} · ` : ''}신청하시면 담당자가 순차적으로 연락드립니다.</p></div><div class="cta-act"><a class="tel-big" href="tel:${esc(SITE.phone)}">${esc(SITE.phone)}</a><a class="btn" href="${href(m.key)}">${esc(FORM.title)}</a></div></div></section>`
}

export function renderHome() {
  const el = document.getElementById('home-main')
  if (!el) return
  let n = 0
  el.innerHTML = (SITE.home || []).map((key) => {
    if (key === 'quick') return quick()
    if (key === 'cta') return cta()
    const m = mod(key), c = SITE.content[key]
    if (!m || !isOn(m) || !c || !(c.image || c.lead || c.table?.length || c.cards?.length || c.list?.length)) return ''
    const alt = n++ % 2 === 1 ? ' alt' : ''
    return `<section class="hsec${alt}" id="${key}"><div class="inner">${head(m, c.lead)}${body(key, c)}${more(m)}</div></section>`
  }).join('')
}
