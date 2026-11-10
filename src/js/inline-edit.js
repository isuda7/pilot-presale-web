import { SITE, SCOPE, BASE } from './config.js'
import { artUrl } from './art.js'
import { IMAGE_MOTIFS, MOTIF_LABEL } from '../../config/content-schema.ts'

// 인라인 편집: 사용자 화면 위에서 문구·행·이미지를 바로 고치고 저장한다. 관리자 토큰이 있을 때만 layout.js 가 불러온다.
// 화면 조각의 데이터 위치는 렌더링이 붙여 둔 표시(data-e 저장 단위 / data-f 필드 / data-block 반복 블록 / data-row 반복 행)로 안다.
// 저장은 관리자 편집 화면과 같은 API·검증·이력을 쓴다. 개인정보·고지문·메뉴 구조 같은 잠금 항목에는 표시가 없어 편집되지 않는다.
const TOKEN_KEY = 'presale_admin_token'
const API = import.meta.env.VITE_API_BASE || ''
const MAX = { table: 30, cards: 12, list: 30, facts: 6 }
const HOLD = { c0: '새 항목', c1: '내용', title: '제목', text: '설명', item: '새 항목' }

const call = async (path, opts = {}) => {
  try {
    const res = await fetch(API + path, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionStorage.getItem(TOKEN_KEY) || ''}` } })
    const json = await res.json()
    json.status = res.status
    return json
  } catch { return { success: false, error: '서버에 연결하지 못했습니다.' } }
}
const txt = (el) => { const c = el.cloneNode(true); c.querySelectorAll('.ie-ui').forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, ' ').trim() }

let bar, editing = false
const dirtyKeys = new Set(), dirtySite = new Set()
const $ = (s) => bar.querySelector(s)

function mark(el) {
  const holder = el.closest('[data-e]')
  if (!holder) return
  if (holder.dataset.e === 'site') dirtySite.add(holder.dataset.block === 'facts' ? 'facts' : holder.dataset.f)
  else dirtyKeys.add(holder.dataset.e)
  refresh()
}
function refresh() {
  const n = dirtyKeys.size + dirtySite.size
  $('.ie-state').textContent = n ? `수정한 항목 ${n}곳 (저장 전)` : editing ? '수정 사항 없음' : ''
  $('.ie-save').disabled = !n
  $('.ie-cancel').disabled = !n
}
const say = (text, ok) => { const m = $('.ie-msg'); m.textContent = text; m.className = `ie-msg ie-ui ${ok ? 'ok' : 'err'}` }

// ---- 편집 모드 켜기/끄기 ----
function ctl(cls, label, extra = '') { return `<button type="button" class="ie-ui ${cls}" contenteditable="false" ${extra}>${label}</button>` }

function enable() {
  editing = true
  document.documentElement.classList.add('ie-on')
  $('.ie-toggle').textContent = '✓ 편집 모드 끄기'
  document.querySelectorAll('[data-f]').forEach((el) => { if (el.tagName !== 'FIGURE') { el.setAttribute('contenteditable', 'true'); el.setAttribute('spellcheck', 'false') } })
  document.querySelectorAll('[data-block]').forEach((box) => {
    const first = box.querySelector('[data-row]')
    if (first && !box._tmpl) box._tmpl = first.cloneNode(true)
    box.querySelectorAll('[data-row]').forEach(addDelete)
    const type = box.dataset.block
    if (box.tagName === 'UL' || box.tagName === 'OL') box.insertAdjacentHTML('beforeend', `<li class="ie-ui ie-add-li" contenteditable="false">${ctl('ie-add', '+ 추가')}</li>`)
    else box.insertAdjacentHTML(type === 'cards' ? 'beforeend' : 'afterend', `<div class="ie-ui ie-add-wrap" contenteditable="false">${ctl('ie-add', '+ 추가')}</div>`)
    const btn = (box.tagName === 'UL' || box.tagName === 'OL' ? box.lastElementChild : type === 'cards' ? box.lastElementChild : box.nextElementSibling).querySelector('.ie-add')
    btn._box = box
  })
  document.querySelectorAll('figure[data-f="image"]').forEach((fig) => fig.insertAdjacentHTML('beforeend', ctl('ie-img', '🖼 이미지 변경')))
  refresh()
}
function disable() {
  editing = false
  document.documentElement.classList.remove('ie-on')
  $('.ie-toggle').textContent = '✎ 편집 모드'
  document.querySelectorAll('[contenteditable]').forEach((el) => { el.removeAttribute('contenteditable'); el.removeAttribute('spellcheck') })
  document.querySelectorAll('.ie-ui:not(.ie-bar):not(.ie-bar *)').forEach((x) => x.remove())
  refresh()
}
function addDelete(row) {
  if (row.tagName === 'TR') row.insertAdjacentHTML('beforeend', `<td class="ie-ui ie-cell" contenteditable="false">${ctl('ie-del', '✕', 'title="이 행 삭제"')}</td>`)
  else row.insertAdjacentHTML('beforeend', ctl('ie-del', '✕', 'title="삭제"'))
}

function addRow(btn) {
  const box = btn._box
  const rows = box.querySelectorAll('[data-row]')
  if (rows.length >= MAX[box.dataset.block]) return say(`최대 ${MAX[box.dataset.block]}개까지 추가할 수 있습니다.`, false)
  if (!box._tmpl) return say('추가할 수 없는 영역입니다.', false)
  const row = box._tmpl.cloneNode(true)
  row.querySelectorAll('.ie-ui').forEach((x) => x.remove())
  row.querySelectorAll('[data-f]').forEach((l) => { l.textContent = HOLD[l.dataset.f] || '새 항목'; l.setAttribute('contenteditable', 'true'); l.setAttribute('spellcheck', 'false') })
  addDelete(row)
  const last = rows[rows.length - 1]
  const host = box.tagName === 'TABLE' ? (box.tBodies[0] || box) : box
  if (last) last.after(row)
  else if (box.tagName === 'UL' || box.tagName === 'OL') host.insertBefore(row, box.querySelector('.ie-add-li'))
  else if (box.dataset.block === 'cards') host.insertBefore(row, box.querySelector('.ie-add-wrap'))
  else host.appendChild(row)
  mark(box)
  row.querySelector('[data-f]')?.focus()
}

// ---- 이벤트 ----
function bind() {
  document.addEventListener('input', (e) => {
    if (!editing) return
    const el = e.target.closest('[data-f]')
    if (!el) return
    mark(el)
    const h = el.closest('[data-e="site"]')
    if (h && h.dataset.f) document.querySelectorAll(`[data-e="site"][data-f="${h.dataset.f}"]`).forEach((o) => { if (o !== h && o.textContent !== h.textContent) o.textContent = h.textContent })
  })
  document.addEventListener('keydown', (e) => { if (editing && e.key === 'Enter' && e.target.closest('[data-f]')) e.preventDefault() })
  document.addEventListener('paste', (e) => {
    if (!editing || !e.target.closest('[data-f]')) return
    e.preventDefault()
    document.execCommand('insertText', false, (e.clipboardData.getData('text/plain') || '').replace(/\s+/g, ' '))
  })
  document.addEventListener('click', (e) => {
    if (!editing) return
    const t = e.target
    if (t.closest('.ie-bar')) return
    const del = t.closest('.ie-del'), add = t.closest('.ie-add'), img = t.closest('.ie-img')
    if (del) { e.preventDefault(); const row = del.closest('[data-row]'); const box = row.closest('[data-block]'); row.remove(); mark(box) }
    else if (add) { e.preventDefault(); addRow(add) }
    else if (img) { e.preventDefault(); pickImage(img.closest('figure')) }
    else if (t.closest('a')) e.preventDefault() // 편집 중에는 링크 이동을 막는다
  }, true)
  window.addEventListener('beforeunload', (e) => { if (dirtyKeys.size + dirtySite.size) { e.preventDefault(); e.returnValue = '' } })
}

function pickImage(fig) {
  if (fig.querySelector('.ie-sel')) return
  const cur = fig.dataset.motif
  fig.insertAdjacentHTML('beforeend', `<select class="ie-ui ie-sel" contenteditable="false">${IMAGE_MOTIFS.map((m) => `<option value="${m}" ${m === cur ? 'selected' : ''}>${MOTIF_LABEL[m]}</option>`).join('')}</select>`)
  const sel = fig.querySelector('.ie-sel')
  sel.focus()
  sel.addEventListener('change', () => {
    fig.dataset.motif = sel.value
    const url = artUrl(sel.value === 'video' ? 'hero' : sel.value)
    if (url) fig.querySelector('img').src = url
    fig.classList.toggle('c-video', sel.value === 'video')
    sel.remove(); mark(fig)
  })
  sel.addEventListener('blur', () => setTimeout(() => sel.remove(), 150))
}

// ---- 저장 ----
const cell = (r, f) => { const n = r.querySelector(`[data-f="${f}"]`); return n ? txt(n) : '' }
const rowsOf = (box) => [...box.querySelectorAll('[data-row]')]
const readBlock = (box) => {
  const t = box.dataset.block, rows = rowsOf(box)
  if (t === 'table' || t === 'facts') return rows.map((r) => [cell(r, 'c0'), cell(r, 'c1')])
  if (t === 'cards') return rows.map((r) => ({ title: cell(r, 'title'), text: cell(r, 'text') }))
  return rows.map((r) => cell(r, 'item'))
}

function buildContent(key) {
  const base = SITE.content[key.slice(2)] || {}
  const out = { image: base.image || '', lead: base.lead || '', table: base.table || [], cards: base.cards || [], list: base.list || [] }
  document.querySelectorAll(`[data-e="${key}"]`).forEach((el) => {
    if (el.dataset.f === 'lead') out.lead = txt(el)
    else if (el.dataset.f === 'image') out.image = el.dataset.motif
    else if (el.dataset.block) out[el.dataset.block] = readBlock(el)
  })
  return out
}

async function buildSite() {
  const fresh = await fetch(`${API}/api/content?scope=${encodeURIComponent(SCOPE)}`, { cache: 'no-store' }).then((r) => r.json()).catch(() => null)
  const site = JSON.parse(JSON.stringify((fresh && fresh.data && fresh.data.site) || {}))
  site.hero = site.hero || {}
  for (const f of dirtySite) {
    if (f === 'facts') site.hero.facts = readBlock(document.querySelector('[data-e="site"][data-block="facts"]'))
    else {
      const el = document.querySelector(`[data-e="site"][data-f="${f}"]`)
      if (!el) continue
      if (f.startsWith('hero.')) site.hero[f.slice(5)] = txt(el)
      else site[f] = txt(el)
    }
  }
  if (!Object.keys(site.hero).length) delete site.hero
  return site
}

async function save() {
  $('.ie-save').disabled = true
  say('저장 중...', true)
  const jobs = [...dirtyKeys].map((k) => ({ k, get: () => buildContent(k) }))
  if (dirtySite.size) jobs.push({ k: 'site', get: buildSite })
  let failed = 0
  for (const j of jobs) {
    const value = await j.get()
    const res = await call('/api/admin/content', { method: 'PUT', body: JSON.stringify({ scope: SCOPE, key: j.k, value }) })
    if (res.success) {
      if (j.k === 'site') dirtySite.clear(); else { dirtyKeys.delete(j.k); SITE.content[j.k.slice(2)] = res.data }
    } else { failed++; say(res.error || '저장하지 못했습니다.', false); if (res.status === 401) { sessionStorage.removeItem(TOKEN_KEY); say('로그인이 만료되었습니다. 관리자 화면에서 다시 로그인하세요.', false) } break }
  }
  refresh()
  if (!failed) say('저장되었습니다. 사이트에 바로 반영됩니다.', true)
}

export async function initInlineEdit({ start }) {
  const check = await call(`/api/admin/content?scope=${encodeURIComponent(SCOPE)}`)
  if (!check.success) { if (check.status === 401) sessionStorage.removeItem(TOKEN_KEY); return }
  document.body.insertAdjacentHTML('beforeend', `
    <div class="ie-bar ie-ui" contenteditable="false">
      <button type="button" class="ie-toggle">✎ 편집 모드</button>
      <span class="ie-state"></span><span class="ie-msg ie-ui"></span>
      <button type="button" class="ie-save" disabled>저장</button>
      <button type="button" class="ie-cancel" disabled>변경 취소</button>
      <a class="ie-link" href="${BASE}pages/admin.html#editor">관리자 화면 ↗</a>
      <span class="ie-hint">점선 영역을 눌러 바로 수정 · 🔒 개인정보·고지문·메뉴는 수정할 수 없습니다</span>
    </div>`)
  bar = document.querySelector('.ie-bar')
  bind()
  $('.ie-toggle').addEventListener('click', () => {
    if (editing && dirtyKeys.size + dirtySite.size && !confirm('저장하지 않은 수정이 있습니다. 편집 모드를 끄면 화면의 수정 내용이 사라집니다. 계속할까요?')) return
    if (editing) location.reload(); else enable()
  })
  $('.ie-save').addEventListener('click', save)
  $('.ie-cancel').addEventListener('click', () => { if (confirm('저장하지 않은 수정을 모두 취소하고 새로고침합니다.')) { dirtyKeys.clear(); dirtySite.clear(); location.reload() } })
  if (start) enable()
}
