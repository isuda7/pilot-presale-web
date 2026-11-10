import { SITE, MODULES as BASE_MODULES, GROUPS, FORM, TYPE_NAME, BASE, PREVIEW } from './config.js'
import { fillContent, esc } from './content.js'
import { fillArt } from './art.js'
import { renderHome } from './home.js'
import '../css/common.css'

// 레이아웃 변형은 html 속성으로 선택한다(common.css 의 html[data-header|data-hero|data-sub|data-sechead]).
const L = SITE.layout
const root = document.documentElement
root.dataset.header = L.header
root.dataset.hero = L.hero
root.dataset.sub = L.sub
root.dataset.sechead = L.sechead
root.style.setProperty('--hero-pos', L.heroPos)
root.style.setProperty('--img-pos', L.imgPos)

// 유형 고유 토큰(types/<이름>/tokens.css)이 있으면 로드 (브랜드 색 조정용, 선택)
const typeTokens = import.meta.glob('../../types/*/tokens.css')
const loadTokens = typeTokens[`../../types/${TYPE_NAME}/tokens.css`]
if (loadTokens) loadTokens()

// 공통 헤더/푸터 주입. 각 페이지는 <div id="site-header">, <main data-module="키">, <div id="site-footer"> 를 둔다.
// 신청 페이지 이름은 신청 폼 정의(config/form.ts)의 title 을 따른다.
const MODULES = BASE_MODULES.map((m) => (m.key === 'visit' ? { ...m, label: FORM.title } : m))
const href = (m) => `${BASE}pages/${m.key}.html`

// L1은 항상 켜짐, L2는 config/site.ts 의 modules 로 끈다.
const isOn = (m) => m.level === 'L1' || SITE.modules[m.key] !== false
const active = MODULES.filter(isOn)

const main = document.querySelector('main[data-module]')
const current = main ? MODULES.find((m) => m.key === main.dataset.module) : null

// 꺼진 모듈 페이지로 직접 들어오면 메인으로 보낸다.
if (current && !isOn(current)) location.replace(BASE)

if (SITE.noindex) {
  const meta = document.createElement('meta')
  meta.name = 'robots'
  meta.content = 'noindex'
  document.head.appendChild(meta)
}

// ---- 서브 페이지: 머리말 + (유형에 따라) 탭/좌측 메뉴 ----
if (current) {
  document.title = `${current.label} | ${SITE.name}`
  const siblings = current.group ? active.filter((m) => m.group === current.group) : []
  if (!main.querySelector('h1')) {
    const crumb = `<span class="crumb">홈${current.group ? ` › ${current.group}` : ''}</span>`
    const en = current.en ? `<span class="page-en">${current.en}</span>` : ''
    main.insertAdjacentHTML('beforebegin', `<div class="page-head"><div class="inner">${crumb}${en}<h1 class="page-title">${current.label}</h1></div></div>`)
  }
  if (L.sub === 'tabs' && siblings.length > 1) {
    main.insertAdjacentHTML('beforebegin', `<nav class="subtabs" aria-label="${current.group}"><div class="inner">${siblings.map((m) => `<a href="${href(m)}" class="${m === current ? 'on' : ''}">${m.label}</a>`).join('')}</div></nav>`)
  }
  if (L.sub === 'side' && siblings.length > 0) {
    const body = document.createElement('div')
    while (main.firstChild) body.appendChild(main.firstChild)
    main.classList.add('sub-layout')
    main.insertAdjacentHTML('beforeend', `<aside class="lnb"><h3>${current.group}</h3>${siblings.map((m) => `<a href="${href(m)}" class="${m === current ? 'on' : ''}">${m.label}</a>`).join('')}</aside>`)
    main.appendChild(body)
  }
}

// ---- 헤더 ----
const groups = GROUPS.map((g) => {
  const items = active.filter((m) => m.group === g)
  return items.length ? { label: g, items } : null
}).filter(Boolean)
const nav = groups.map((g) => `
  <li class="${current && g.items.includes(current) ? 'is-active' : ''}">
    <a href="${href(g.items[0])}">${g.label}</a>
    <ul class="sub">${g.items.map((m) => `<li><a href="${href(m)}">${m.label}</a></li>`).join('')}</ul>
  </li>`).join('')
const apply = MODULES.find((m) => m.key === 'visit')
const applyNav = `<li class="${current === apply ? 'is-active' : ''}"><a href="${href(apply)}">${apply.label}</a></li>`

const demoBack = PREVIEW ? ' <a href="/t/">← 템플릿 목록</a>' : ''
if (SITE.sample) document.body.insertAdjacentHTML('afterbegin', `<div class="sample-bar">${SITE.sampleForm ? '샘플 사이트입니다. 모든 정보는 가상이며 신청 내용은 저장되지 않습니다.' : '샘플 사이트입니다. 모든 정보는 가상이며, 신청 기능은 실제로 동작하니 가상 정보로만 테스트하세요.'}${demoBack}</div>`)

document.getElementById('site-header').innerHTML = `
  <header class="hd"><div class="inner hd-in">
    <a class="logo" href="${BASE}"><span data-e="site" data-f="name">${esc(SITE.name)}</span></a>
    <nav class="gnb-wrap"><ul class="gnb">${nav}${L.header === 'simple' ? '' : applyNav}</ul></nav>
    <div class="hd-side"><a class="tel" href="tel:${esc(SITE.phone)}"><span data-e="site" data-f="phone">${esc(SITE.phone)}</span></a>${current === apply ? '' : `<a class="btn sm hd-cta" href="${href(apply)}">${apply.label}</a>`}</div>
  </div></header>`

// ---- 푸터 ----
const company = esc(SITE.company.filter((c) => c.value).map((c) => `${c.label} ${c.value}`).join(' · '))
document.getElementById('site-footer').innerHTML = `
  <footer class="ft"><div class="inner">
    <div class="ft-top"><strong data-e="site" data-f="name">${esc(SITE.name)}</strong><span data-e="site" data-f="phone">${esc(SITE.phone)}</span></div>
    ${company ? `<p class="ft-co">${company}</p>` : ''}
    ${SITE.address ? `<p><span data-e="site" data-f="address">${esc(SITE.address)}</span>${SITE.hours ? ` · 운영시간 <span data-e="site" data-f="hours">${esc(SITE.hours)}</span>` : ''}</p>` : ''}
    ${SITE.notices.map((n) => `<p>${esc(n)}</p>`).join('')}
    <p><a href="${href(MODULES.find((m) => m.key === 'privacy'))}">개인정보처리방침</a>${SITE.showAdminLink ? ` · <a href="${BASE}pages/admin.html">관리자</a>` : ''}${!import.meta.env.SITE_TYPE && !PREVIEW ? ' · <a href="/t/">템플릿 목록</a>' : ''}</p>
  </div></footer>`

// ---- 메인 히어로 문구 + 메인 섹션 ----
const facts = (SITE.hero.facts || []).map(([k, v]) => `<li data-row><span data-f="c0">${esc(k)}</span><strong data-f="c1">${esc(v)}</strong></li>`).join('')
document.querySelectorAll('[data-site]').forEach((el) => {
  const k = el.dataset.site
  const v = { 'hero-title': SITE.hero.title, 'hero-sub': SITE.hero.sub, 'hero-eyebrow': SITE.hero.eyebrow || '' }[k]
  if (k === 'facts') { el.innerHTML = facts; el.classList.toggle('hidden', !facts); el.dataset.e = 'site'; el.dataset.block = 'facts' } else if (v !== undefined) { el.textContent = v; if (!v) el.classList.add('hidden'); el.dataset.e = 'site'; el.dataset.f = { 'hero-title': 'hero.title', 'hero-sub': 'hero.sub', 'hero-eyebrow': 'hero.eyebrow' }[k] }
})
const cta = document.querySelector('[data-site-cta]')
if (cta) { cta.textContent = FORM.title; cta.href = href(apply) }
const cta2 = document.querySelector('[data-site-cta2]')
if (cta2) { cta2.href = href(MODULES.find((m) => m.key === 'biz')); cta2.textContent = SITE.hero.cta2 || '사업개요 보기'; cta2.dataset.e = 'site'; cta2.dataset.f = 'hero.cta2' }
if (document.querySelector('.hero')) document.title = SITE.name

renderHome()
fillContent(current && current.key)
fillArt()

// ---- 인라인 편집(관리자 로그인 상태에서만) ----
// 방문자에게는 아무것도 로드되지 않는다. 관리자 토큰이 있으면 편집 바를 불러온다. ?edit=1 로 열면 바로 편집 모드.
const hasToken = !!sessionStorage.getItem('presale_admin_token')
if (new URLSearchParams(location.search).get('edit') === '1' && !hasToken) location.replace(`${BASE}pages/admin.html`)
else if (hasToken && document.querySelector('[data-e]') && !document.getElementById('admin-panel')) import('./inline-edit.js').then((m) => m.initInlineEdit({ start: new URLSearchParams(location.search).get('edit') === '1' }))
