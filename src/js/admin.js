import { API_BASE } from './config.js'

const KEY = 'presale_admin_token'
const $ = (id) => document.getElementById(id)
const STATUS = { new: '신규', contacted: '연락완료', done: '처리완료' }
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

async function api(path, opts = {}) {
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

function logout() { sessionStorage.removeItem(KEY); show(false) }

async function load() {
  const json = await api('/api/admin/applications')
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

$('rows').addEventListener('change', async (e) => {
  if (e.target.classList.contains('st'))
    await api(`/api/admin/applications/${e.target.dataset.id}`, { method: 'PATCH', body: JSON.stringify({ status: e.target.value }) })
})
$('rows').addEventListener('click', async (e) => {
  if (!e.target.classList.contains('del') || !confirm('삭제하시겠습니까?')) return
  await api(`/api/admin/applications/${e.target.dataset.id}`, { method: 'DELETE' })
  load()
})

if (sessionStorage.getItem(KEY)) load()
