// 유형별 "교체한 파일 / 추가한 페이지" 목록을 types/<이름>/REPLACED.md 로 만든다. (감시 A3: 파일 교체는 목록에 기록)
import { readdirSync, existsSync, writeFileSync, statSync } from 'fs'

for (const t of readdirSync('types')) {
  if (!statSync(`types/${t}`).isDirectory() || !existsSync(`types/${t}/type.ts`)) continue
  const dir = `types/${t}/pages`
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.html')) : []
  const base = (f) => (f === 'index.html' ? 'index.html' : `pages/${f}`)
  const replaced = files.filter((f) => existsSync(base(f)))
  const added = files.filter((f) => !existsSync(base(f)))
  writeFileSync(`types/${t}/REPLACED.md`,
`# ${t} — 기본과 연결이 끊기는 파일 (자동 생성: npm run type:report)

## 교체한 파일 (기본이 개선돼도 따라오지 않음)
${replaced.length ? replaced.map((f) => `- ${base(f)}`).join('\n') : '- 없음'}

## 추가한 페이지 (L3)
${added.length ? added.map((f) => `- pages/${f}`).join('\n') : '- 없음'}
`)
  console.log(t, 'replaced:', replaced.join(',') || '-', '/ added:', added.join(',') || '-')
}
