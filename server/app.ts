import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { db, ensureSchema } from './db'

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
    const { name, phone, message, agreed } = await c.req.json()
    if (!name || !phone) {
      return c.json({ success: false, error: '성함과 연락처는 필수입니다.' }, 400)
    }
    if (!agreed) {
      return c.json({ success: false, error: '개인정보 수집에 동의해주세요.' }, 400)
    }
    if (!/^[0-9\-+\s]{8,20}$/.test(String(phone))) {
      return c.json({ success: false, error: '연락처 형식이 올바르지 않습니다.' }, 400)
    }
    await db().execute({
      sql: 'INSERT INTO applications (name, phone, message, agreed) VALUES (?, ?, ?, 1)',
      args: [String(name).slice(0, 50), String(phone), String(message || '').slice(0, 2000)],
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

app.get('/api/admin/applications', adminOnly, async (c) => {
  try {
    const { rows } = await db().execute(
      'SELECT id, name, phone, message, status, created_at FROM applications WHERE deleted_at IS NULL ORDER BY created_at DESC, id DESC'
    )
    return c.json({ success: true, data: rows })
  } catch {
    return c.json({ success: false, error: '목록을 불러오지 못했습니다.' }, 500)
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

export default app
