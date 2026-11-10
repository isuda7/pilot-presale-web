import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import { readdirSync, readFileSync, existsSync } from 'fs'
import { TYPES } from './types/index.ts'

// 멀티 페이지(MPA). pages/*.html 을 자동으로 입력에 포함한다(페이지 추가 시 이 파일을 고치지 않는다).
//
// 세 가지 실행 형태
//  1) 개발/기본 빌드 (SITE_TYPE 없음): '/' = 기본(내부용 초안), '/t/<유형>/' = 템플릿 미리보기, '/t/' = 템플릿 선택 페이지.
//     한 서버(한 포트)에서 화면 이동만으로 기본과 모든 템플릿을 볼 수 있다. 유형은 주소(/t/<유형>/)를 보고 화면에서 정한다.
//  2) 데모 빌드 (vite build --mode demo): 위 '/t/…'만 빌드해 한 번에 배포한다. 선택 페이지가 '/' 가 된다.
//  3) 현장 빌드 (SITE_TYPE=<유형>): 해당 유형 하나만 '/' 에 고정한다. 유형의 pages/*.html 은 기본 페이지를 교체하거나 추가된다.
// 개발 시 /api 는 로컬 API 서버(8790)로 프록시. 운영은 Vercel 이 같은 도메인에서 처리.
export default defineConfig(({ mode }) => {
  const root = __dirname
  const typeName = loadEnv(mode, root, 'SITE_').SITE_TYPE || ''
  const demo = mode === 'demo'
  if (typeName && !existsSync(resolve(root, 'types', typeName, 'type.ts'))) {
    throw new Error(`SITE_TYPE="${typeName}" 에 해당하는 types/${typeName}/type.ts 가 없습니다.`)
  }

  const pagesDir = resolve(root, 'pages')
  const basePages = readdirSync(pagesDir).filter((f) => f.endsWith('.html'))
  const typePageFiles = (t) => {
    const d = resolve(root, 'types', t, 'pages')
    return existsSync(d) ? readdirSync(d).filter((f) => f.endsWith('.html')) : []
  }
  // 유형 t 의 페이지(rest: 'index.html' | 'pages/<파일>') 원본 경로. 유형 폴더에 있으면 교체/추가, 없으면 기본.
  const sourceFor = (t, rest) => {
    const f = rest === 'index.html' ? 'index.html' : rest.slice('pages/'.length)
    const over = resolve(root, 'types', t, 'pages', f)
    if (existsSync(over)) return over
    const base = rest === 'index.html' ? resolve(root, 'index.html') : resolve(pagesDir, f)
    return existsSync(base) ? base : null
  }
  const typeKeys = Object.keys(TYPES)

  // ---- 입력 구성 ----
  const input = {}
  const virtual = new Map() // 가상 경로(/t/<유형>/…) → 실제 원본 파일 (데모 빌드용)
  if (demo) {
    for (const t of typeKeys) {
      const rests = new Set(['index.html', ...basePages.map((f) => `pages/${f}`)])
      typePageFiles(t).forEach((f) => rests.add(f === 'index.html' ? 'index.html' : `pages/${f}`))
      for (const rest of rests) {
        const id = resolve(root, 't', t, rest)
        virtual.set(id, sourceFor(t, rest))
        input[`${t}__${rest.replace(/[/.]/g, '_')}`] = id
      }
    }
  } else {
    input.index = resolve(root, 'index.html')
    for (const f of basePages) input[f.replace('.html', '')] = resolve(pagesDir, f)
    // 내부용 가이드 매뉴얼(guide/)은 유형(템플릿·현장)을 지정한 빌드와 데모 빌드에서는 넣지 않는다. (공개 배포에 포함되지 않게)
    if (!typeName) input.guide = resolve(root, 'guide/index.html')
  }
  // 현장 빌드(SITE_TYPE): 유형 페이지가 기본 경로를 교체하거나 새로 추가된다
  const overrides = new Map()
  if (typeName) {
    for (const f of typePageFiles(typeName)) {
      const target = f === 'index.html' ? resolve(root, 'index.html') : resolve(pagesDir, f)
      overrides.set(target, resolve(root, 'types', typeName, 'pages', f))
      input[f.replace('.html', '')] = target
    }
  }

  // ---- 템플릿 선택 페이지 ----
  // 카드 썸네일은 유형의 히어로 사진(src/assets/photos/<유형>/hero.*)을 쓴다. 데모 빌드에서는 t/_thumb/<유형>.jpg 로 내보낸다.
  const heroFile = (k) => ['jpg', 'jpeg', 'webp', 'png'].map((e) => resolve(root, 'src/assets/photos', k, `hero.${e}`)).find((f) => existsSync(f))
  const pickerHtml = () => `<!doctype html>
<html lang="ko"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex, nofollow" /><title>분양 사이트 템플릿 미리보기</title>
<style>
*{box-sizing:border-box}body{margin:0;font-family:-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;background:#f4f6f9;color:#1f2733;word-break:keep-all}
main{max-width:1080px;margin:0 auto;padding:56px 20px 72px}h1{font-size:30px;margin:0 0 10px;letter-spacing:-.02em}.lead{color:#5b6475;margin:0 0 32px;line-height:1.7}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px}
.card{display:flex;flex-direction:column;background:#fff;border-radius:12px;overflow:hidden;text-decoration:none;color:inherit;border:1px solid #e1e5eb;transition:transform .2s,box-shadow .2s}
.card:hover{transform:translateY(-3px);box-shadow:0 14px 30px rgba(20,32,50,.12)}
.card img{width:100%;aspect-ratio:16/10;object-fit:cover;display:block;background:#dde3ea}
.card .b{padding:18px 18px 20px;display:flex;flex-direction:column;gap:6px}.card strong{font-size:18px}.card em{font-style:normal;font-size:13px;color:#1d4a85;font-weight:700}.card p{margin:4px 0 0;font-size:14px;color:#4a5568;line-height:1.55}
.card .go{margin-top:10px;font-size:13px;font-weight:700}
.foot{margin-top:30px;font-size:14px;color:#5b6475}.foot a{color:#1f2733;font-weight:700}
</style></head><body><main>
<h1>분양 사이트 템플릿 미리보기</h1>
<p class="lead">같은 표준 디자인 위에서 <b>메뉴 구성·메인 섹션·레이아웃 패턴·콘텐츠 양</b>이 다른 4가지 유형입니다. 모든 정보와 이미지는 가상이며, 신청 기능은 실제로 동작하니 가상 정보로만 테스트하세요.</p>
<div class="grid">${typeKeys.map((k) => `<a class="card" href="/t/${k}/"><img alt="" src="/t/_thumb/${k}.jpg" /><div class="b"><em>${TYPES[k].label}</em><strong>${TYPES[k].site?.name ?? k}</strong><p>${TYPES[k].desc ?? ''}</p><span class="go">열어보기 →</span></div></a>`).join('')}</div>
<p class="foot"><a href="/t/${typeKeys[0]}/pages/admin.html">신청 관리자 화면 →</a></p>
</main></body></html>
`

  const typePlugin = {
    name: 'site-type-pages',
    enforce: 'pre',
    resolveId(source) {
      if (virtual.has(source) || overrides.has(source)) return source
    },
    load(id) {
      if (virtual.has(id)) return readFileSync(virtual.get(id), 'utf8')
      if (overrides.has(id)) return readFileSync(overrides.get(id), 'utf8')
    },
    // 데모 빌드: 선택 페이지를 '/' 와 '/t/' 에 만든다
    generateBundle() {
      if (!demo) return
      for (const fileName of ['index.html', 't/index.html']) this.emitFile({ type: 'asset', fileName, source: pickerHtml() })
      for (const k of typeKeys) { const f = heroFile(k); if (f) this.emitFile({ type: 'asset', fileName: `t/_thumb/${k}.jpg`, source: readFileSync(f) }) }
    },
    configureServer(server) {
      const serve = async (res, url, html) => {
        res.setHeader('Content-Type', 'text/html')
        res.end(await server.transformIndexHtml(url, html))
      }
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || '').split('?')[0]
        // 현장 모드(SITE_TYPE): 유형 페이지가 기본 경로를 교체
        for (const [target, file] of overrides) {
          const u = target === resolve(root, 'index.html') ? '/' : `/pages/${target.split('/').pop()}`
          if (url === u || (u === '/' && url === '/index.html')) return serve(res, url, readFileSync(file, 'utf8'))
        }
        // 미리보기 모드: /t/ 선택 페이지, /t/<유형>/… 템플릿
        if (!typeName && url.startsWith('/t')) {
          if (url === '/t' || url === '/t/') return serve(res, '/t/', pickerHtml())
          const th = url.match(/^\/t\/_thumb\/([^/]+)\.jpg$/)
          if (th && TYPES[th[1]] && heroFile(th[1])) { res.setHeader('Content-Type', 'image/jpeg'); return res.end(readFileSync(heroFile(th[1]))) }
          const m = url.match(/^\/t\/([^/]+)(\/.*)?$/)
          if (m && TYPES[m[1]]) {
            if (!m[2]) { res.statusCode = 302; res.setHeader('Location', `/t/${m[1]}/`); return res.end() }
            const rest = m[2] === '/' || m[2] === '/index.html' ? 'index.html' : m[2].slice(1)
            if ((rest === 'index.html' || /^pages\/[^/]+\.html$/.test(rest))) {
              const src = sourceFor(m[1], rest)
              if (src) return serve(res, url, readFileSync(src, 'utf8'))
            }
          }
          if (/\.html$|\/$/.test(url)) { res.statusCode = 404; return res.end('Not found') }
        }
        next()
      })
    },
  }

  return {
    plugins: [typePlugin],
    envPrefix: ['VITE_', 'SITE_'],
    server: { port: 5180, strictPort: true, proxy: { '/api': 'http://localhost:8790' } },
    build: { rollupOptions: { input } },
  }
})
