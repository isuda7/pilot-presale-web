(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))l(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const n of t.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&l(n)}).observe(document,{childList:!0,subtree:!0});function i(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function l(e){if(e.ep)return;e.ep=!0;const t=i(e);fetch(e.href,t)}})();const o={name:"파일럿 분양 사이트",phone:"1800-0000",menu:[{label:"사업안내",href:"/pages/biz.html",sub:["사업개요","브랜드","입지환경","프리미엄"]},{label:"단지안내",href:"/pages/complex.html",sub:["단지설계","단지조경","커뮤니티","단지배치도"]},{label:"세대안내",href:"/pages/unit.html",sub:["평면정보","인테리어"]},{label:"방문예약",href:"/pages/visit.html",sub:[]}]},u="",a=location.pathname,c=o.menu.map(r=>`
  <li class="${a===r.href?"is-active":""}">
    <a href="${r.href}">${r.label}</a>
    ${r.sub.length?`<ul class="sub">${r.sub.map(s=>`<li><a href="${r.href}#${encodeURIComponent(s)}">${s}</a></li>`).join("")}</ul>`:""}
  </li>`).join("");document.getElementById("site-header").innerHTML=`
  <header class="hd"><div class="inner">
    <a class="logo" href="/">${o.name}</a>
    <ul class="gnb">${c}</ul>
    <a class="tel" href="tel:${o.phone}">${o.phone}</a>
  </div></header>`;document.getElementById("site-footer").innerHTML=`
  <footer class="ft"><div class="inner">
    <p>대표전화 ${o.phone}</p>
    <p>본 사이트의 이미지는 이해를 돕기 위한 것이며 실제와 다를 수 있습니다.</p>
    <p><a href="/pages/admin.html">관리자</a></p>
  </div></footer>`;export{u as A};
