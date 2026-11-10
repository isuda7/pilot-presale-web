import { SITE, MODULES, SCOPE, EDITED, BASE } from './config.js'
import { api } from './admin.js'
import { esc } from './content.js'
import { IMAGE_MOTIFS, MOTIF_LABEL } from '../../config/content-schema.ts'

// 관리자 콘텐츠 편집 화면. 모든 템플릿이 같은 화면을 쓰고, 폼은 블록 종류(이미지·문단·표·카드·목록)로 자동 구성한다.
// 저장하면 DB 에 쓰이고 사이트에 즉시 반영된다. 초기값은 파일(유형·현장 설정)이며 "초기값으로 되돌리기"로 복귀한다.
const isOn = (m) => m.level === 'L1' || SITE.modules[m.key] !== false
const editable = MODULES.filter((m) => m.key !== 'visit' && m.key !== 'privacy')
const edited = new Set(EDITED.content.map((k) => `c:${k}`))
if (EDITED.site) edited.add('site')

let root, current = 'site'
const $ = (sel) => root.querySelector(sel)

const rowIn = (cols, vals = []) => `<div class="ed-row">${cols.map((c, i) => `<input type="text" data-col="${i}" placeholder="${c.ph}" maxlength="${c.max}" value="${esc(vals[i] ?? '')}" style="${c.w ? `flex:${c.w}` : ''}" />`).join('')}<button type="button" class="btn sm danger ed-del" aria-label="행 삭제">삭제</button></div>`
const rowsBlock = (id, title, hint, cols, rows, max) => `
  <div class="ed-block" data-block="${id}" data-max="${max}">
    <h4>${title}${hint ? ` <small>${hint}</small>` : ''}</h4>
    <div class="ed-rows">${rows.map((r) => rowIn(cols, r)).join('')}</div>
    <button type="button" class="btn sm ed-add">+ 행 추가</button>
  </div>`

function listHtml() {
  const on = editable.filter(isOn), off = editable.filter((m) => !isOn(m))
  const item = (key, label, on) => `<button type="button" class="ed-item ${current === key ? 'on' : ''}" data-key="${key}">${esc(label)}${edited.has(key) ? '<i class="chip">수정됨</i>' : ''}${on === false ? '<i class="chip off">꺼짐</i>' : ''}</button>`
  return `${item('site', '기본 정보 · 메인 문구', true)}
    <h4 class="ed-sub">본문 항목</h4>${on.map((m) => item(`c:${m.key}`, m.label, true)).join('')}
    ${off.length ? `<h4 class="ed-sub">꺼진 메뉴 (메뉴를 켜면 표시됨)</h4>${off.map((m) => item(`c:${m.key}`, m.label, false)).join('')}` : ''}`
}

function siteForm() {
  const h = SITE.hero || {}
  const f = (id, label, val, max, hint = '') => `<label>${label}${hint ? ` <small>${hint}</small>` : ''}<input type="text" id="s-${id}" maxlength="${max}" value="${esc(val ?? '')}" /></label>`
  return `
    <h3>기본 정보 · 메인 문구</h3>
    <div class="ed-grid">${f('name', '현장명', SITE.name, 60)}${f('phone', '대표전화', SITE.phone, 30)}${f('address', '주소', SITE.address, 120, '(오시는길·푸터)')}${f('hours', '운영시간', SITE.hours, 60)}</div>
    <h4>메인 상단 문구</h4>
    <div class="ed-grid">${f('eyebrow', '소제목', h.eyebrow, 80)}${f('title', '제목', h.title, 80)}${f('sub', '설명', h.sub, 200)}${f('cta2', '보조 버튼 문구', h.cta2, 30)}</div>
    ${rowsBlock('facts', '요약 수치', '(메인 상단 요약 카드, 최대 6개)', [{ ph: '이름 (예: 총 세대)', max: 20 }, { ph: '값 (예: 1,248세대)', max: 40 }], h.facts || [], 6)}
    <p class="ed-locked">🔒 <b>개인정보 문구·보유기간, 푸터 고지 문구, 메뉴·레이아웃 구조, 신청 폼 항목</b>은 사람이 확정하는 항목이라 웹에서 수정하지 않습니다. (담당 개발자가 저장소의 설정 파일에서 수정)</p>`
}

function contentForm(key) {
  const c = SITE.content[key] || {}
  const m = MODULES.find((x) => x.key === key)
  return `
    <h3>${esc(m?.label || key)}${isOn(m) ? '' : ' <i class="chip off">메뉴 꺼짐</i>'}</h3>
    <div class="ed-block"><h4>이미지</h4>
      <select id="c-image"><option value="">이미지 없음</option>${IMAGE_MOTIFS.map((x) => `<option value="${x}" ${c.image === x ? 'selected' : ''}>${MOTIF_LABEL[x]}</option>`).join('')}</select>
      <small>이 현장 유형의 사진/이미지 세트에서 선택합니다. (사진 업로드는 지원하지 않습니다)</small></div>
    <div class="ed-block"><h4>소개 문단</h4><textarea id="c-lead" maxlength="1000" rows="3">${esc(c.lead || '')}</textarea></div>
    ${rowsBlock('table', '표', '(항목 / 내용, 최대 30행)', [{ ph: '항목', max: 60, w: 1 }, { ph: '내용', max: 200, w: 3 }], c.table || [], 30)}
    ${rowsBlock('cards', '카드', '(제목 / 설명, 최대 12개)', [{ ph: '제목', max: 60, w: 1 }, { ph: '설명', max: 300, w: 3 }], (c.cards || []).map((x) => [x.title, x.text]), 12)}
    ${rowsBlock('list', '목록', '(최대 30개)', [{ ph: '항목', max: 200 }], (c.list || []).map((x) => [x]), 30)}`
}

function render() {
  $('.ed-list').innerHTML = listHtml()
  $('.ed-form').innerHTML = (current === 'site' ? siteForm() : contentForm(current.slice(2))) + `
    <div class="ed-actions">
      <button type="button" class="btn" id="ed-save">저장</button>
      <button type="button" class="btn sm ghost-dark" id="ed-reset">초기값으로 되돌리기</button>
      <button type="button" class="btn sm ghost-dark" id="ed-hist">이력 보기</button>
      ${current !== 'site' ? `<a class="btn sm ghost-dark" target="_blank" href="${BASE}pages/${current.slice(2)}.html">사이트에서 보기 ↗</a>` : `<a class="btn sm ghost-dark" target="_blank" href="${BASE}">사이트에서 보기 ↗</a>`}
    </div>
    <p class="msg" id="ed-msg" role="status"></p><div id="ed-history"></div>`
}

const readRows = (id) => [...($(`[data-block="${id}"]`)?.querySelectorAll('.ed-row') || [])].map((r) => [...r.querySelectorAll('input')].map((i) => i.value.trim()))
function collect() {
  if (current === 'site') {
    const v = (id) => $(`#s-${id}`).value.trim()
    return { name: v('name'), phone: v('phone'), address: v('address'), hours: v('hours'), hero: { eyebrow: v('eyebrow'), title: v('title'), sub: v('sub'), cta2: v('cta2'), facts: readRows('facts') } }
  }
  return { image: $('#c-image').value, lead: $('#c-lead').value.trim(), table: readRows('table'), cards: readRows('cards').map(([title, text]) => ({ title, text })), list: readRows('list').map((r) => r[0]) }
}
const say = (text, ok) => { const m = $('#ed-msg'); m.className = `msg ${ok ? 'ok' : 'err'}`; m.textContent = text }
const reopen = () => { location.hash = `editor=${current}`; location.reload() }

async function save() {
  say('저장 중...', true)
  const json = await api('/api/admin/content', { method: 'PUT', body: JSON.stringify({ scope: SCOPE, key: current, value: collect() }) })
  if (!json.success) return say(json.error || '저장하지 못했습니다.', false)
  edited.add(current)
  say('저장되었습니다. 사이트에 바로 반영됩니다. (이 화면은 새로고침하면 최신 값으로 보입니다)', true)
  $('.ed-list').innerHTML = listHtml()
}

async function reset() {
  if (!confirm('웹에서 수정한 값을 지우고 초기값(파일 기본값)으로 되돌립니다. 이전 값은 이력에 보관됩니다. 계속할까요?')) return
  const json = await api(`/api/admin/content?scope=${encodeURIComponent(SCOPE)}&key=${encodeURIComponent(current)}`, { method: 'DELETE' })
  json.success ? reopen() : say(json.error || '되돌리지 못했습니다.', false)
}

async function history() {
  const box = $('#ed-history')
  box.innerHTML = '<p class="msg">불러오는 중...</p>'
  const json = await api(`/api/admin/content/history?scope=${encodeURIComponent(SCOPE)}&key=${encodeURIComponent(current)}`)
  if (!json.success) { box.innerHTML = ''; return say(json.error || '이력을 불러오지 못했습니다.', false) }
  window.__hist = json.data
  box.innerHTML = json.data.length
    ? `<h4>이력 (수정 전 값, 최근 ${json.data.length}개)</h4><ul class="ed-hist">${json.data.map((h, i) => `<li><span>${esc(h.saved_at)}</span><code>${esc(JSON.stringify(h.value)).slice(0, 90)}…</code><button type="button" class="btn sm" data-restore="${i}">이 값으로 복원</button></li>`).join('')}</ul>`
    : '<p class="msg">보관된 이력이 없습니다.</p>'
}

async function restore(i) {
  const h = window.__hist[i]
  if (!h || !confirm('이 값으로 복원합니다. 현재 값은 이력에 보관됩니다. 계속할까요?')) return
  const json = await api('/api/admin/content', { method: 'PUT', body: JSON.stringify({ scope: SCOPE, key: current, value: h.value }) })
  json.success ? reopen() : say(json.error || '복원하지 못했습니다.', false)
}

export function initEditor(el) {
  root = el
  const want = (location.hash.match(/^#editor=(.+)$/) || [])[1]
  if (want && (want === 'site' || editable.some((m) => `c:${m.key}` === want))) current = want
  root.innerHTML = `
    <p class="ed-scope">편집 대상: <b>${SCOPE ? `템플릿 "${esc(SCOPE)}"` : '기본 사이트'}</b> · 저장한 값은 파일 기본값 위에 적용됩니다.</p>
    <div class="ed"><aside class="ed-list"></aside><section class="ed-form"></section></div>`
  render()
  root.addEventListener('click', (e) => {
    const t = e.target
    if (t.closest('.ed-item')) { current = t.closest('.ed-item').dataset.key; render() }
    else if (t.classList.contains('ed-add')) {
      const b = t.closest('.ed-block'), rows = b.querySelector('.ed-rows')
      if (rows.children.length >= Number(b.dataset.max)) return say(`최대 ${b.dataset.max}개까지 입력할 수 있습니다.`, false)
      const tmpl = document.createElement('div'); tmpl.innerHTML = rowIn(BLOCK_COLS[b.dataset.block])
      rows.appendChild(tmpl.firstElementChild)
    }
    else if (t.classList.contains('ed-del')) t.closest('.ed-row').remove()
    else if (t.id === 'ed-save') save()
    else if (t.id === 'ed-reset') reset()
    else if (t.id === 'ed-hist') history()
    else if (t.dataset.restore !== undefined) restore(Number(t.dataset.restore))
  })
}

const BLOCK_COLS = {
  facts: [{ ph: '이름 (예: 총 세대)', max: 20 }, { ph: '값 (예: 1,248세대)', max: 40 }],
  table: [{ ph: '항목', max: 60, w: 1 }, { ph: '내용', max: 200, w: 3 }],
  cards: [{ ph: '제목', max: 60, w: 1 }, { ph: '설명', max: 300, w: 3 }],
  list: [{ ph: '항목', max: 200 }],
}
