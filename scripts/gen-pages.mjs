// config/modules.js 의 모듈마다 pages/<key>.html 을 만든다. 이미 있는 파일은 건드리지 않는다.
import { writeFileSync, existsSync } from 'fs'
import { MODULES } from '../config/modules.js'

for (const m of MODULES) {
  if (m.page === 'custom') continue
  const file = `pages/${m.key}.html`
  if (existsSync(file)) { console.log('skip', file); continue }
  writeFileSync(file, `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${m.label}</title>
</head>
<body>
  <div id="site-header"></div>
  <main class="inner" data-module="${m.key}">
    <section class="section"><div class="placeholder">${m.label} 콘텐츠 영역 (준비중)</div></section>
  </main>
  <div id="site-footer"></div>
  <script type="module" src="/src/js/layout.js"></script>
</body>
</html>
`)
  console.log('create', file)
}
