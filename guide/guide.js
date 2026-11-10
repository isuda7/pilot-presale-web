import { marked } from 'marked'
import '../src/css/common.css'
import './guide.css'

// 내부용 가이드 매뉴얼 화면: docs/guide/*.md 를 읽어 보여준다. (공개 금지, 현장 복제본에는 포함하지 않는다)
const files = import.meta.glob('../docs/guide/*.md', { query: '?raw', import: 'default', eager: true })
const docs = Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, text]) => ({ id: path.split('/').pop().replace('.md', ''), title: (text.match(/^# (.+)$/m) || [, path])[1], text }))

const nav = document.getElementById('guide-nav')
const body = document.getElementById('guide-body')

function show(id) {
  const d = docs.find((x) => x.id === id) || docs[0]
  body.innerHTML = marked.parse(d.text)
  nav.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.id === d.id))
  window.scrollTo(0, 0)
}

nav.innerHTML = '<strong>가이드 매뉴얼</strong>' + docs.map((d) => `<a href="#${d.id}" data-id="${d.id}">${d.title}</a>`).join('')
window.addEventListener('hashchange', () => show(location.hash.slice(1)))
show(location.hash.slice(1))
