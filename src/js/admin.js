import { API_BASE, BASE } from './config.js'
import { initEditor } from './admin-editor.js'

const KEY = 'presale_admin_token'
const $ = (id) => document.getElementById(id)
const STATUS = { new: '신규', contacted: '연락완료', done: '처리완료' }
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export async function api(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionStorage.getItem(KEY) || ''}` },
  })
  const json = await res.json()
  if (res.status === 401 && path !== '/api/admin/login') { logout(); }
  return json
}

function show(loggedIn) {
  $('login-form').classList.toggle('hidden', loggedIn)
  $('admin-panel').classList.toggle('hidden', !loggedIn)
}

// 로그아웃: 토큰을 지우고, 열려 있는 사이트 화면(인라인 편집 바)에도 알려 바로 닫히게 한다.
function logout() {
  sessionStorage.removeItem(KEY)
  try { const ch = new BroadcastChannel('presale-auth'); ch.postMessage('logout'); ch.close() } catch {}
  try { localStorage.setItem('presale-logout', String(Date.now())) } catch {} // BroadcastChannel 미지원 브라우저용 (storage 이벤트로 다른 탭에 전달)
  window.dispatchEvent(new Event('presale-logout')) // 같은 화면
  show(false)
}

// 현재 조회 조건(검색어·상태·기간)을 쿼리 문자열로
function filterQuery() {
  const p = new URLSearchParams()
  for (const [k, id] of [['q', 'f-q'], ['status', 'f-status'], ['from', 'f-from'], ['to', 'f-to']]) {
    if ($(id).value) p.set(k, $(id).value)
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

async function load() {
  const json = await api(`/api/admin/applications${filterQuery()}`)
  if (!json.success) return
  show(true)
  $('count').textContent = `(${json.data.length}건)`
  $('rows').innerHTML = json.data.map((r) => `
    <tr>
      <td>${r.id}</td><td>${esc(r.name)}</td><td>${esc(r.phone)}</td>
      <td>${esc(r.message)}</td><td>${esc(r.created_at)}</td>
      <td><select data-id="${r.id}" class="st">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${k === r.status ? 'selected' : ''}>${v}</option>`).join('')}</select></td>
      <td><button class="btn sm danger del" data-id="${r.id}">삭제</button></td>
    </tr>`).join('') || '<tr><td colspan="7">접수된 신청이 없습니다.</td></tr>'
}

$('login-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const json = await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ password: $('pw').value }) })
  if (!json.success) { $('login-msg').textContent = json.error; return }
  sessionStorage.setItem(KEY, json.token)
  $('pw').value = ''; $('login-msg').textContent = ''
  load()
})

$('logout').addEventListener('click', logout)
$('go-edit').href = `${BASE}?edit=1`

$('rows').addEventListener('change', async (e) => {
  if (e.target.classList.contains('st'))
    await api(`/api/admin/applications/${e.target.dataset.id}`, { method: 'PATCH', body: JSON.stringify({ status: e.target.value }) })
})
$('rows').addEventListener('click', async (e) => {
  if (!e.target.classList.contains('del') || !confirm('삭제하시겠습니까?')) return
  await api(`/api/admin/applications/${e.target.dataset.id}`, { method: 'DELETE' })
  load()
})

$('filters').addEventListener('submit', (e) => { e.preventDefault(); load() })
$('f-reset').addEventListener('click', () => { $('filters').reset(); load() })

// CSV: 인증 헤더가 필요하므로 fetch 로 받아 파일로 저장한다. 현재 조회 조건이 그대로 적용된다.
$('csv').addEventListener('click', async () => {
  const res = await fetch(`${API_BASE}/api/admin/applications.csv${filterQuery()}`, { headers: { Authorization: `Bearer ${sessionStorage.getItem(KEY) || ''}` } })
  if (res.status === 401) { logout(); return }
  if (!res.ok) { alert('CSV를 만들지 못했습니다.'); return }
  const url = URL.createObjectURL(await res.blob())
  const a = Object.assign(document.createElement('a'), { href: url, download: 'applications.csv' })
  a.click()
  URL.revokeObjectURL(url)
})

// 탭: 신청 목록 / 콘텐츠 편집
let editorReady = false
function openTab(name) {
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('on', b.dataset.tab === name))
  $('tab-apps').classList.toggle('hidden', name !== 'apps')
  $('tab-editor').classList.toggle('hidden', name !== 'editor')
  if (name === 'editor' && !editorReady) { editorReady = true; initEditor($('tab-editor')) }
}
document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => openTab(b.dataset.tab)))
if (location.hash.startsWith('#editor')) openTab('editor')

if (sessionStorage.getItem(KEY)) load()
