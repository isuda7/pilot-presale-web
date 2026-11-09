import { SITE } from './config.js'
import '../css/common.css'

// 공통 헤더/푸터 주입. 각 페이지는 <div id="site-header">, <div id="site-footer"> 만 둔다.
const path = location.pathname

const nav = SITE.menu.map((m) => `
  <li class="${path === m.href ? 'is-active' : ''}">
    <a href="${m.href}">${m.label}</a>
    ${m.sub.length ? `<ul class="sub">${m.sub.map((s) => `<li><a href="${m.href}#${encodeURIComponent(s)}">${s}</a></li>`).join('')}</ul>` : ''}
  </li>`).join('')

document.getElementById('site-header').innerHTML = `
  <header class="hd"><div class="inner">
    <a class="logo" href="/">${SITE.name}</a>
    <ul class="gnb">${nav}</ul>
    <a class="tel" href="tel:${SITE.phone}">${SITE.phone}</a>
  </div></header>`

document.getElementById('site-footer').innerHTML = `
  <footer class="ft"><div class="inner">
    <p>대표전화 ${SITE.phone}</p>
    <p>본 사이트의 이미지는 이해를 돕기 위한 것이며 실제와 다를 수 있습니다.</p>
    <p><a href="/pages/admin.html">관리자</a></p>
  </div></footer>`
