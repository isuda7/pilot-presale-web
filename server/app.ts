import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { db, ensureSchema } from './db.js'
import { resolveForm, isSampleForm, formClosedInfo } from '../config/resolve-form.js'
import { TYPES } from '../types/index.js'
import { cleanSite, cleanContent, CONTENT_KEY_RE } from '../config/content-schema.js'

const app = new Hono()

app.use('/api/*', cors())
app.use('/api/*', async (_c, next) => { await ensureSchema(); await next() })

const adminPassword = () => process.env.ADMIN_PASSWORD || ''
const tokenSecret = () => process.env.TOKEN_SECRET || ''

// ---------- 관리자 토큰 (HMAC 서명, 12시간 유효) ----------
const enc = new TextEncoder()
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000

async function sign(payload: string) {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(tokenSecret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

async function issueToken() {
  const exp = String(Date.now() + TOKEN_TTL_MS)
  return `${exp}.${await sign(exp)}`
}

async function verifyToken(token: string) {
  const [exp, sig] = token.split('.')
  if (!tokenSecret() || !exp || !sig || Number(exp) < Date.now()) return false
  return (await sign(exp)) === sig
}

const adminOnly = async (c: any, next: any) => {
  const token = (c.req.header('Authorization') || '').replace(/^Bearer /, '')
  if (!token || !(await verifyToken(token))) {
    return c.json({ success: false, error: '관리자 인증이 필요합니다.' }, 401)
  }
  await next()
}

// ---------- 공개 API: 신청 ----------
app.post('/api/applications', async (c) => {
  try {
    const closed = formClosedInfo(process.env.SITE_TYPE)
    if (closed) return c.json({ success: false, error: closed }, 403)
    const body = await c.req.json()
    const FORM = resolveForm(process.env.SITE_TYPE)
    // 검증 규칙은 config/form.ts(화면과 공유)에서 읽는다.
    const values: Record<string, string> = {}
    for (const f of FORM.fields) {
      const v = String(body[f.name] ?? '').trim()
      if (f.required && !v) return c.json({ success: false, error: `${f.label}은(는) 필수입니다.` }, 400)
      if (v && f.pattern && !new RegExp(f.pattern).test(v)) {
        return c.json({ success: false, error: f.patternMessage || `${f.label} 형식이 올바르지 않습니다.` }, 400)
      }
      values[f.name] = v.slice(0, f.maxLength || 2000)
    }
    if (!body.agreed) {
      return c.json({ success: false, error: '개인정보 수집에 동의해주세요.' }, 400)
    }
    if (isSampleForm(process.env.SITE_TYPE)) {
      return c.json({ success: true, message: '샘플 사이트이므로 저장되지 않았습니다.' }, 200)
    }
    const { name = '', phone = '', message = '' } = values
    await db().execute({
      sql: 'INSERT INTO applications (name, phone, message, agreed) VALUES (?, ?, ?, 1)',
      args: [name, phone, message],
    })
    return c.json({ success: true, message: '신청이 접수되었습니다.' }, 201)
  } catch {
    return c.json({ success: false, error: '서버 에러가 발생했습니다.' }, 500)
  }
})

// ---------- 관리자 API ----------
app.post('/api/admin/login', async (c) => {
  const { password } = await c.req.json().catch(() => ({}))
  if (!adminPassword() || !password || password !== adminPassword()) {
    return c.json({ success: false, error: '비밀번호가 일치하지 않습니다.' }, 401)
  }
  return c.json({ success: true, token: await issueToken() })
})

// 목록·CSV 공통 조회: q(성함/연락처/문의 포함), status, from/to(YYYY-MM-DD, 한국시간 기준 접수일)
// DB의 created_at 은 UTC 이므로 +9시간(한국시간)으로 변환해 비교·표시한다.
function buildListQuery(q: Record<string, string | undefined>) {
  const where = ['deleted_at IS NULL']
  const args: string[] = []
  const text = (q.q || '').trim().slice(0, 100)
  if (text) {
    const like = `%${text.replace(/[\\%_]/g, '\\$&')}%`
    where.push("(name LIKE ? ESCAPE '\\' OR phone LIKE ? ESCAPE '\\' OR message LIKE ? ESCAPE '\\')")
    args.push(like, like, like)
  }
  if (q.status && ['new', 'contacted', 'done'].includes(q.status)) { where.push('status = ?'); args.push(q.status) }
  const day = /^\d{4}-\d{2}-\d{2}$/
  if (q.from && day.test(q.from)) { where.push("date(created_at, '+9 hours') >= ?"); args.push(q.from) }
  if (q.to && day.test(q.to)) { where.push("date(created_at, '+9 hours') <= ?"); args.push(q.to) }
  return {
    sql: `SELECT id, name, phone, message, status, datetime(created_at, '+9 hours') AS created_at FROM applications WHERE ${where.join(' AND ')} ORDER BY created_at DESC, id DESC`,
    args,
  }
}

app.get('/api/admin/applications', adminOnly, async (c) => {
  try {
    const { rows } = await db().execute(buildListQuery(c.req.query()))
    return c.json({ success: true, data: rows })
  } catch {
    return c.json({ success: false, error: '목록을 불러오지 못했습니다.' }, 500)
  }
})

// CSV 다운로드 (엑셀 한글 깨짐 방지용 BOM, 수식 주입 방지: = + - @ 로 시작하는 값 앞에 ' 추가)
const STATUS_LABEL: Record<string, string> = { new: '신규', contacted: '연락완료', done: '처리완료' }
const csvCell = (v: unknown) => {
  let s = String(v ?? '')
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}
app.get('/api/admin/applications.csv', adminOnly, async (c) => {
  try {
    const { rows } = await db().execute(buildListQuery(c.req.query()))
    const head = ['번호', '성함', '연락처', '문의사항', '접수일시(KST)', '상태']
    const lines = rows.map((r: any) => [r.id, r.name, r.phone, r.message, r.created_at, STATUS_LABEL[r.status] || r.status].map(csvCell).join(','))
    const csv = '﻿' + [head.map(csvCell).join(','), ...lines].join('\r\n')
    return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="applications.csv"' } })
  } catch {
    return c.json({ success: false, error: 'CSV를 만들지 못했습니다.' }, 500)
  }
})

app.patch('/api/admin/applications/:id', adminOnly, async (c) => {
  const { status } = await c.req.json().catch(() => ({}))
  if (!['new', 'contacted', 'done'].includes(status)) {
    return c.json({ success: false, error: '잘못된 상태값입니다.' }, 400)
  }
  await db().execute({
    sql: 'UPDATE applications SET status = ? WHERE id = ? AND deleted_at IS NULL',
    args: [status, c.req.param('id')],
  })
  return c.json({ success: true })
})

app.delete('/api/admin/applications/:id', adminOnly, async (c) => {
  await db().execute({
    sql: 'UPDATE applications SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL',
    args: [c.req.param('id')],
  })
  return c.json({ success: true })
})

// ---------- 콘텐츠(웹 편집) ----------
// 파일 기본값 위에 마지막으로 얹히는 값. scope = 유형 이름('' = 기본 사이트). 현장 빌드(SITE_TYPE)는 자기 유형만 쓴다.
function checkScope(raw: unknown): string | null {
  const scope = String(raw ?? '')
  const fixed = process.env.SITE_TYPE || ''
  if (fixed) return scope === fixed ? scope : null
  return scope === '' || TYPES[scope] ? scope : null
}
const parseRow = (value: unknown) => { try { return JSON.parse(String(value)) } catch { return null } }

// 공개: 화면이 시작할 때 읽는다. 수정 즉시 반영되도록 캐시하지 않는다.
app.get('/api/content', async (c) => {
  const scope = checkScope(c.req.query('scope'))
  if (scope === null) return c.json({ success: false, error: '알 수 없는 유형입니다.' }, 400)
  try {
    const { rows } = await db().execute({ sql: 'SELECT key, value FROM site_content WHERE scope = ?', args: [scope] })
    const data: { site: any; content: Record<string, any> } = { site: {}, content: {} }
    for (const r of rows as any[]) {
      const v = parseRow(r.value)
      if (v == null) continue
      if (r.key === 'site') data.site = v
      else if (String(r.key).startsWith('c:')) data.content[String(r.key).slice(2)] = v
    }
    c.header('Cache-Control', 'no-store')
    return c.json({ success: true, data })
  } catch {
    return c.json({ success: false, error: '콘텐츠를 불러오지 못했습니다.' }, 500)
  }
})

// 관리자: 수정된 항목 목록(내보내기 겸용)
app.get('/api/admin/content', adminOnly, async (c) => {
  const scope = checkScope(c.req.query('scope'))
  if (scope === null) return c.json({ success: false, error: '알 수 없는 유형입니다.' }, 400)
  const { rows } = await db().execute({ sql: 'SELECT key, value, updated_at FROM site_content WHERE scope = ? ORDER BY key', args: [scope] })
  return c.json({ success: true, data: (rows as any[]).map((r) => ({ key: r.key, value: parseRow(r.value), updated_at: r.updated_at })) })
})

// 관리자: 저장 { scope, key: 'site' | 'c:<콘텐츠키>', value }. 수정 전 값은 이력에 보관한다.
app.put('/api/admin/content', adminOnly, async (c) => {
  const raw = await c.req.text()
  if (raw.length > 60000) return c.json({ success: false, error: '내용이 너무 깁니다.' }, 413)
  let body: any
  try { body = JSON.parse(raw) } catch { return c.json({ success: false, error: '요청 형식이 올바르지 않습니다.' }, 400) }
  const scope = checkScope(body.scope)
  if (scope === null) return c.json({ success: false, error: '알 수 없는 유형입니다.' }, 400)
  const key = String(body.key ?? '')
  try {
    let value: any
    if (key === 'site') value = cleanSite(body.value)
    else if (key.startsWith('c:') && CONTENT_KEY_RE.test(key.slice(2))) value = cleanContent(body.value)
    else return c.json({ success: false, error: '수정할 수 없는 항목입니다. (개인정보 문구·고지문·메뉴 구조는 웹에서 수정하지 않습니다)' }, 400)
    const old = await db().execute({ sql: 'SELECT value FROM site_content WHERE scope = ? AND key = ?', args: [scope, key] })
    if (old.rows.length) await pushHistory(scope, key, String((old.rows[0] as any).value))
    await db().execute({
      sql: "INSERT INTO site_content (scope, key, value, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(scope, key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP",
      args: [scope, key, JSON.stringify(value)],
    })
    return c.json({ success: true, data: value })
  } catch (e: any) {
    return c.json({ success: false, error: e?.message || '저장하지 못했습니다.' }, 400)
  }
})

// 관리자: 초기값으로 되돌리기(DB 수정값 삭제 → 파일 기본값으로 복귀). 삭제 전 값은 이력에 보관한다.
app.delete('/api/admin/content', adminOnly, async (c) => {
  const scope = checkScope(c.req.query('scope'))
  const key = c.req.query('key') || ''
  if (scope === null || !(key === 'site' || (key.startsWith('c:') && CONTENT_KEY_RE.test(key.slice(2))))) return c.json({ success: false, error: '잘못된 요청입니다.' }, 400)
  const old = await db().execute({ sql: 'SELECT value FROM site_content WHERE scope = ? AND key = ?', args: [scope, key] })
  if (old.rows.length) await pushHistory(scope, key, String((old.rows[0] as any).value))
  await db().execute({ sql: 'DELETE FROM site_content WHERE scope = ? AND key = ?', args: [scope, key] })
  return c.json({ success: true })
})

// 관리자: 항목별 이력(최근 20개, 수정 전 값)
app.get('/api/admin/content/history', adminOnly, async (c) => {
  const scope = checkScope(c.req.query('scope'))
  const key = c.req.query('key') || ''
  if (scope === null || !key) return c.json({ success: false, error: '잘못된 요청입니다.' }, 400)
  const { rows } = await db().execute({ sql: 'SELECT id, value, datetime(saved_at, \'+9 hours\') AS saved_at FROM site_content_history WHERE scope = ? AND key = ? ORDER BY id DESC LIMIT 20', args: [scope, key] })
  return c.json({ success: true, data: (rows as any[]).map((r) => ({ id: r.id, saved_at: r.saved_at, value: parseRow(r.value) })) })
})

async function pushHistory(scope: string, key: string, value: string) {
  await db().execute({ sql: 'INSERT INTO site_content_history (scope, key, value) VALUES (?, ?, ?)', args: [scope, key, value] })
  await db().execute({ sql: 'DELETE FROM site_content_history WHERE scope = ? AND key = ? AND id NOT IN (SELECT id FROM site_content_history WHERE scope = ? AND key = ? ORDER BY id DESC LIMIT 20)', args: [scope, key, scope, key] })
}

export default app
