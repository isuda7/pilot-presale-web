// 콘텐츠 파일 ↔ DB 동기화 (개발자용). 파일(JSON)을 원본으로 검토(git)한 뒤 DB 에 반영하거나, 웹에서 수정된 DB 값을 파일로 내보낸다.
//   내보내기: npm run content -- export [--scope <유형>] [--out content.json]
//   가져오기: npm run content -- import content.json [--scope <유형>] [--replace --yes]
// - scope 를 생략하면 기본 사이트(''), 유형 이름을 주면 그 템플릿의 콘텐츠다.
// - 가져오기는 항목마다 형식을 검증하고, 덮어쓰는 값은 이력(site_content_history)에 보관한다.
// - --replace 는 파일에 없는 DB 항목을 모두 지운다(되돌릴 수 있도록 이력에는 남는다). 파괴적이므로 --yes 가 있어야 실행한다.
// - 접속 대상은 환경변수 TURSO_DATABASE_URL / TURSO_AUTH_TOKEN (없으면 로컬 local.db). 운영 DB 에 쓰기 전에 반드시 export 로 백업한다.
import { readFileSync, writeFileSync } from 'node:fs'
import { db, ensureSchema } from '../server/db.ts'
import { TYPES } from '../types/index.ts'
import { cleanSite, cleanContent, CONTENT_KEY_RE } from '../config/content-schema.ts'

try { process.loadEnvFile('.env.local') } catch {}

const args = process.argv.slice(2)
const cmd = args[0]
const opt = (k: string) => (args.includes(k) ? args[args.indexOf(k) + 1] : '')
const scope = opt('--scope')
if (scope && !TYPES[scope]) { console.error(`알 수 없는 유형: ${scope} (가능: ${Object.keys(TYPES).join(', ')})`); process.exit(1) }

await ensureSchema()

if (cmd === 'export') {
  const { rows } = await db().execute({ sql: 'SELECT key, value FROM site_content WHERE scope = ? ORDER BY key', args: [scope] })
  const items: Record<string, unknown> = {}
  for (const r of rows as any[]) items[r.key] = JSON.parse(String(r.value))
  const out = JSON.stringify({ scope, exported_at: new Date().toISOString(), items }, null, 2) + '\n'
  const file = opt('--out')
  if (file) { writeFileSync(file, out); console.log(`내보냄: ${file} (${rows.length}개 항목, scope="${scope}")`) } else process.stdout.write(out)
} else if (cmd === 'import' && args[1]) {
  const doc = JSON.parse(readFileSync(args[1], 'utf8'))
  if ((doc.scope ?? '') !== scope) { console.error(`파일의 scope("${doc.scope ?? ''}")와 --scope("${scope}")가 다릅니다.`); process.exit(1) }
  const items: Record<string, any> = doc.items || {}
  const clean: Record<string, any> = {}
  for (const [key, v] of Object.entries(items)) {
    if (key === 'site') clean[key] = cleanSite(v)
    else if (key.startsWith('c:') && CONTENT_KEY_RE.test(key.slice(2))) clean[key] = cleanContent(v)
    else { console.error(`가져올 수 없는 항목: ${key}`); process.exit(1) }
  }
  const existing = new Map<string, string>()
  for (const r of (await db().execute({ sql: 'SELECT key, value FROM site_content WHERE scope = ?', args: [scope] })).rows as any[]) existing.set(r.key, String(r.value))
  const remove = args.includes('--replace') ? [...existing.keys()].filter((k) => !(k in clean)) : []
  if (remove.length && !args.includes('--yes')) { console.error(`--replace 는 DB 의 ${remove.length}개 항목(${remove.join(', ')})을 지웁니다. 진행하려면 --yes 를 붙이세요.`); process.exit(1) }
  const hist = async (key: string, value: string) => db().execute({ sql: 'INSERT INTO site_content_history (scope, key, value) VALUES (?, ?, ?)', args: [scope, key, value] })
  for (const [key, value] of Object.entries(clean)) {
    if (existing.has(key)) await hist(key, existing.get(key)!)
    await db().execute({ sql: 'INSERT INTO site_content (scope, key, value, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(scope, key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP', args: [scope, key, JSON.stringify(value)] })
  }
  for (const key of remove) { await hist(key, existing.get(key)!); await db().execute({ sql: 'DELETE FROM site_content WHERE scope = ? AND key = ?', args: [scope, key] }) }
  console.log(`반영: ${Object.keys(clean).length}개 항목 저장, ${remove.length}개 삭제 (scope="${scope}")`)
} else {
  console.log('사용법:\n  npm run content -- export [--scope <유형>] [--out content.json]\n  npm run content -- import <파일> [--scope <유형>] [--replace --yes]')
  process.exit(cmd ? 1 : 0)
}
