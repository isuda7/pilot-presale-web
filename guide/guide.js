import { marked } from 'marked'
import '../src/css/common.css'
import './guide.css'

// 내부용 가이드 매뉴얼 화면: docs/guide/*.md 를 읽어 보여준다. (공개 금지, 현장 복제본에는 포함하지 않는다)
const files = import.meta.glob('../docs/guide/*.md', { query: '?raw', import: 'default', eager: true })
const docs = Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, text]) => ({ id: path.split('/').pop().replace('.md', ''), title: (text.match(/^# (.+)$/m) || [, path])[1], text }))

const nav = document.getElementById('guide-nav')
const body = document.getElementById('guide-body')

// 팝오버: 본문의 강조 문구(굵은 글씨)를 누르면 요약을 띄운다. 내용은 guide/popovers/*.md.
// 강조 문구 → 팝오버 파일 이름. 새 팝오버는 파일을 추가하고 여기에 문구를 등록한다.
const popFiles = import.meta.glob('./popovers/*.md', { query: '?raw', import: 'default', eager: true })
const POPS = { '상업적 사용 제한': 'commercial-use' }
const popText = (key) => popFiles[`./popovers/${key}.md`]
let pop = null, popBtn = null

// 팝오버 위치: 열 때뿐 아니라 스크롤·창 크기 변경 때마다 다시 계산해서 문구 위/아래 방향과 높이를 갱신한다.
// 기본은 문구 아래. 아래 공간이 모자라고 위쪽이 더 넓으면 위에 띄우고, 어느 쪽이든 높이를 남는 공간에 맞춘다(넘치면 팝오버 안에서 스크롤).
function placePop() {
  if (!pop || !popBtn) return
  const r = popBtn.getBoundingClientRect()
  const w = Math.min(560, window.innerWidth - 24)
  pop.style.width = `${w}px`
  pop.style.left = `${Math.max(12, Math.min(r.left + window.scrollX, window.scrollX + window.innerWidth - w - 12))}px`
  pop.style.maxHeight = '' // 내용의 원래 높이를 먼저 잰다
  const h = pop.offsetHeight
  const below = window.innerHeight - r.bottom - 16, upper = r.top - 16
  const above = h > below && upper > below
  pop.style.maxHeight = `${Math.max(220, Math.min(h, above ? upper : below))}px`
  const hh = pop.offsetHeight
  pop.style.top = `${(above ? r.top - hh - 8 : r.bottom + 8) + window.scrollY}px`
  pop.dataset.side = above ? 'above' : 'below'
}
let raf = 0
const schedulePlace = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; placePop() }) }

function closePop() {
  if (pop) { pop.remove(); pop = null }
  if (popBtn) { popBtn.setAttribute('aria-expanded', 'false'); popBtn = null }
  window.removeEventListener('scroll', schedulePlace)
  window.removeEventListener('resize', schedulePlace)
}
function openPop(btn) {
  closePop()
  pop = document.createElement('div')
  pop.className = 'pop'
  pop.setAttribute('role', 'dialog')
  pop.innerHTML = `<button type="button" class="pop-close" aria-label="닫기">✕</button>${marked.parse(popText(btn.dataset.pop))}`
  document.body.appendChild(pop)
  btn.setAttribute('aria-expanded', 'true')
  popBtn = btn
  placePop()
  window.addEventListener('scroll', schedulePlace, { passive: true })
  window.addEventListener('resize', schedulePlace)
  pop.querySelector('.pop-close').addEventListener('click', () => { closePop(); btn.focus() })
}
function attachPopovers() {
  body.querySelectorAll('strong').forEach((s) => {
    const key = POPS[s.textContent.trim()]
    if (!key || !popText(key)) return
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'pop-trigger'
    btn.dataset.pop = key
    btn.setAttribute('aria-haspopup', 'dialog')
    btn.setAttribute('aria-expanded', 'false')
    btn.innerHTML = `${s.innerHTML}<span aria-hidden="true">ⓘ</span>`
    s.replaceWith(btn)
  })
}
body.addEventListener('click', (e) => { const b = e.target.closest('.pop-trigger'); if (b) { e.stopPropagation(); popBtn === b ? closePop() : openPop(b) } })
document.addEventListener('click', (e) => { if (pop && !e.target.closest('.pop')) closePop() })
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && pop) { const b = popBtn; closePop(); b && b.focus() } })

function show(id) {
  closePop()
  const d = docs.find((x) => x.id === id) || docs[0]
  body.innerHTML = marked.parse(d.text)
  attachPopovers()
  nav.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.id === d.id))
  window.scrollTo(0, 0)
}

nav.innerHTML = '<strong>가이드 매뉴얼</strong>' + docs.map((d) => `<a href="#${d.id}" data-id="${d.id}">${d.title}</a>`).join('')
window.addEventListener('hashchange', () => show(location.hash.slice(1)))
show(location.hash.slice(1))
