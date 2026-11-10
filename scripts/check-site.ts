// 현장 오픈 전 점검: 기계적으로 확인할 수 있는 것만 확인한다. (사람이 확인할 항목은 docs/05-operations.md 체크리스트)
// 사용: SITE_TYPE=<유형> npm run check:site -- [--base <upstream 태그/브랜치>] [--internal]
//   --base      : 이 ref 와 비교해 수정 금지 파일이 바뀌었는지 확인 (예: upstream/main, template-v0.1.0)
//   --internal  : 내부용 초안 점검 모드(현장 값 검사를 건너뜀)
import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { TYPES } from '../types/index.ts'
import { SITE } from '../config/base.ts'
import { SITE_OVERRIDE } from '../config/site.ts'
import { deepMerge } from '../config/merge.ts'

const args = process.argv.slice(2)
const arg = (k: string) => (args.includes(k) ? args[args.indexOf(k) + 1] : '')
const internal = args.includes('--internal')
const typeName = process.env.SITE_TYPE || ''
const out: { level: 'FAIL' | 'WARN' | 'OK'; msg: string }[] = []
const add = (level: 'FAIL' | 'WARN' | 'OK', msg: string) => out.push({ level, msg })

// 1) 유형
if (typeName && !TYPES[typeName]) add('FAIL', `SITE_TYPE="${typeName}" 유형이 types/index.ts 에 없음`)
const site: any = deepMerge(deepMerge(SITE, TYPES[typeName]?.site || {}), SITE_OVERRIDE)

// 2) 수정 금지 파일 변경 여부 (기준 ref 가 있을 때)
const base = arg('--base')
const FORBIDDEN = [/^api\//, /^server\//, /^vite\.config\.js$/, /^vercel\.json$/, /^src\/js\//, /^src\/css\/common\.css$/, /^config\/(base\.ts|merge\.ts|modules\.js|resolve-form\.ts)$/]
if (base) {
  try {
    const changed = execSync(`git diff --diff-filter=ACMR --name-only ${base} HEAD`, { encoding: 'utf8' }).split('\n').filter(Boolean)
    const bad = changed.filter((f) => FORBIDDEN.some((r) => r.test(f)))
    bad.length ? add('FAIL', `기준(${base}) 대비 수정 금지 파일이 바뀜: ${bad.join(', ')}`) : add('OK', `수정 금지 파일 변경 없음 (기준 ${base})`)
  } catch {
    add('WARN', `git diff ${base} 실패: 기준 ref 를 확인하세요`)
  }
} else {
  add('WARN', '--base 가 없어 수정 금지 파일 변경은 확인하지 않음')
}

// 3) 현장에 남으면 안 되는 파일
for (const f of ['guide', 'docs']) {
  if (existsSync(f)) internal ? add('OK', `(내부용) ${f} 있음`) : add('FAIL', `현장 저장소에 ${f} 가 남아 있음`)
}

// 3-1) 데모 스톡 사진(Pexels)이 현장 저장소에 남았는지
if (existsSync('src/assets/photos/CREDITS.md')) internal ? add('OK', '(내부용) 데모 사진 있음') : add('FAIL', '데모 스톡 사진(src/assets/photos, CREDITS.md)이 남아 있음 — 현장 사진으로 교체하고 데모 사진은 삭제하세요')

// 4) .gitignore
const gi = existsSync('.gitignore') ? readFileSync('.gitignore', 'utf8') : ''
for (const k of ['node_modules', 'dist', '.env.local', 'local.db']) if (!gi.includes(k)) add('FAIL', `.gitignore 에 ${k} 없음`)

if (!internal) {
  // 5) 현장 값
  site.sample ? add('FAIL', 'sample 이 true (샘플 띠가 표시됨)') : add('OK', 'sample 꺼짐')
  site.sampleForm ? add('FAIL', 'sampleForm 이 true (신청이 저장되지 않음)') : add('OK', 'sampleForm 꺼짐 (신청 저장됨)')
  const closed = !!site.formClosed
  closed ? add('WARN', 'formClosed 가 true (신청 마감 상태)') : add('OK', '신청 접수 중')
  // 샘플(데모) 템플릿의 값이 그대로 남았는지: 샘플 프로젝트의 이름·제목·본문과 비교한다.
  const samples = Object.values<any>(TYPES).map((t) => t.site).filter((x) => x?.sample)
  const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
  if (/파일럿/.test(site.name) || samples.some((x) => x.name === site.name)) add('FAIL', `현장명이 기본/샘플 값: "${site.name}"`)
  if (['1800-0000', '000-0000-0000'].includes(site.phone)) add('FAIL', `대표전화가 기본/가상 값: ${site.phone}`)
  if (/미정|확정 필요/.test(site.privacy.retention)) add('FAIL', `개인정보 보유기간 미확정: "${site.privacy.retention}"`)
  if (samples.some((x) => x.privacy?.purpose === site.privacy.purpose)) add('FAIL', '개인정보 수집 목적이 샘플 값 그대로임')
  if (samples.some((x) => same(x.notices, site.notices)) || (site.notices || []).some((n: string) => /샘플|가상|시연/.test(n))) add('FAIL', '푸터 고지에 샘플/시연 문구가 남음')
  if (samples.some((x) => x.hero?.title === site.hero.title) || /파일럿|샘플|가상/.test(JSON.stringify(site.hero))) add('FAIL', '메인 비주얼 문구가 샘플/기본 값임')
  if (samples.some((x) => same(x.hero?.facts, site.hero.facts))) add('FAIL', '메인 요약 수치(hero.facts)가 샘플 값 그대로임')
  if (site.address && samples.some((x) => x.address === site.address)) add('FAIL', '주소가 샘플 값 그대로임')
  const leftover = Object.keys(site.content || {}).filter((k) => samples.some((x) => same(x.content?.[k], site.content[k])))
  if (leftover.length) add('FAIL', `본문(content)에 샘플 데이터가 그대로인 모듈: ${leftover.join(', ')} — 현장 본문으로 덮어쓰거나 해당 모듈을 끄세요`)
  if (site.noindex) add('WARN', 'noindex 가 true (검색 노출 차단 중). 공개 현장이면 의도한 값인지 확인')
  if (!site.address) add('WARN', 'address 비어 있음 (오시는길)')
}

// 출력
const mark = { FAIL: '✗', WARN: '!', OK: '✓' }
for (const r of out) console.log(`${mark[r.level]} [${r.level}] ${r.msg}`)
const fails = out.filter((r) => r.level === 'FAIL').length
console.log(`\n유형: ${typeName || '(없음: 기본)'} / FAIL ${fails} / WARN ${out.filter((r) => r.level === 'WARN').length}`)
console.log('※ 환경변수(ADMIN_PASSWORD, TOKEN_SECRET 현장 전용 값), 고지문 확정, 공개 주소 신청 확인은 사람이 확인해야 한다.')
process.exit(fails ? 1 : 0)
