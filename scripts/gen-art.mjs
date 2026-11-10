// 기본 이미지(SVG)를 코드로 생성한다. 사진이 없는 곳(지도·평면도·미리보기 기본)에 쓴다. 건축 CG 렌더링 느낌(대기감·빛·유리 반사·필름 그레인)을 내는 벡터 이미지.
// 외부 이미지·저작권 이슈 없음. 실제 사진이 있으면 src/assets/photos/<유형>/<모티프>.jpg|webp 가 우선한다(art.js).
// 사용: node scripts/gen-art.mjs  → src/assets/art/default/<모티프>.svg
// 모티프: hero(스카이라인) building(타워) location(지도) park(조경) plan(평면) interior(실내) community(수영장) video(영상)
import { mkdirSync, writeFileSync } from 'node:fs'

const rng = (seed) => { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296 }
const f = (n) => +n.toFixed(1)
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('') }

// 이미지 세트 팔레트. default = 중립 블루그레이(기본·내부용 초안), 나머지는 템플릿(유형)별 이미지 세트다.
// 디자인 시스템(스킨)은 1개로 통일했지만 이미지는 유형마다 다른 분위기를 유지한다. 사진이 있으면 사진이 우선한다(art.js).
const SKINS = {
  default: { sky: ['#9db4cf', '#d3deea', '#f3efe6'], sun: '#fff4dc', glow: '#ffe7bd', haze: '#e6edf4', far: '#98aec6', mid: '#5f7b9c', near: '#2a4466', win: '#fff0cf', accent: '#c8963e', ground: '#17263a', land: '#eef1f5', water: '#b9cfe3', road: '#ffffff', green: '#b7cfb0', furn: '#c8963e', ink: '#1f3350', paper: '#f7f8fa', tree: '#3d6b52', tree2: '#5b8c6e' },
  // full(풀옵션형): 웜 브라운 골든아워
  full: { sky: ['#241712', '#7a5440', '#eab887'], sun: '#ffe1b0', glow: '#ffb470', haze: '#d39a6c', far: '#7d5846', mid: '#523829', near: '#2a1b14', win: '#ffdca8', accent: '#b69d80', ground: '#150d09', land: '#efe7da', water: '#c9b7a3', road: '#ffffff', green: '#b9b08f', furn: '#b69d80', ink: '#2b1c16', paper: '#f5f3ee', tree: '#4a4a2f', tree2: '#6b6a43' },
  // mid-b(중간형 B · 상품/입지 비주얼형): 이른 아침 티얼
  'mid-b': { sky: ['#8fb7b8', '#d3e4de', '#f6ecd8'], sun: '#fff5dc', glow: '#ffeac4', haze: '#e9f0ea', far: '#98b8b4', mid: '#5f8f8c', near: '#1e5b5c', win: '#fff3d6', accent: '#c7a786', ground: '#0d3b3c', land: '#eef0e6', water: '#b7d3d1', road: '#ffffff', green: '#a9c9a2', furn: '#c7a786', ink: '#0b4a4b', paper: '#f1eee7', tree: '#2f6b57', tree2: '#4f8f73' },
  // minimal(최소형): 블루아워 네이비
  minimal: { sky: ['#071f52', '#4672b6', '#f3a780'], sun: '#ffd8b0', glow: '#ff915e', haze: '#a4bde3', far: '#6385bd', mid: '#315798', near: '#0a2a68', win: '#ffe4bd', accent: '#be2009', ground: '#061a44', land: '#eef3fa', water: '#7fa5d8', road: '#ffffff', green: '#bcd5c3', furn: '#be2009', ink: '#0a2a68', paper: '#ffffff', tree: '#1f4d3a', tree2: '#336b55' },
  // mid-a(중간형 A · 분양·계약 정보형): 석양 슬레이트
  'mid-a': { sky: ['#1b262c', '#59595f', '#eaa68b'], sun: '#ffd3bb', glow: '#ff9f80', haze: '#cc8c7c', far: '#5a6c77', mid: '#38484f', near: '#1b2a31', win: '#ffdcb4', accent: '#d88a70', ground: '#10181c', land: '#ecebe6', water: '#9fb5bc', road: '#ffffff', green: '#a9c2a0', furn: '#d88a70', ink: '#1c2a31', paper: '#f4f2ee', tree: '#3a5a45', tree2: '#5a8a62' },
}

const wrap = (w, h, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">${inner}</svg>\n`
const grain = (w, h, a = 0.09) => `<filter id="n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${a} 0"/></filter><rect width="${w}" height="${h}" filter="url(#n)"/>`
const vignette = (w, h, a = 0.35) => `<defs><radialGradient id="vg" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${a}"/></radialGradient></defs><rect width="${w}" height="${h}" fill="url(#vg)"/>`

// 하늘: 3단 그라데이션 + 태양 글로우 + 흐린 구름
function sky(p, w, h, r, sunX = 0.7, sunY = 0.62) {
  let s = `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset=".55" stop-color="${p.sky[1]}"/><stop offset="1" stop-color="${p.sky[2]}"/></linearGradient>
<radialGradient id="sg" cx="${sunX}" cy="${sunY}" r=".55"><stop offset="0" stop-color="${p.glow}" stop-opacity=".95"/><stop offset=".35" stop-color="${p.glow}" stop-opacity=".35"/><stop offset="1" stop-color="${p.glow}" stop-opacity="0"/></radialGradient>
<filter id="bl"><feGaussianBlur stdDeviation="14"/></filter></defs><rect width="${w}" height="${h}" fill="url(#sk)"/><rect width="${w}" height="${h}" fill="url(#sg)"/>`
  s += `<circle cx="${w * sunX}" cy="${h * sunY}" r="${h * 0.05}" fill="${p.sun}" opacity=".95"/>`
  for (let i = 0; i < 6; i++) s += `<ellipse cx="${f(r() * w)}" cy="${f(h * (0.12 + r() * 0.35))}" rx="${f(120 + r() * 220)}" ry="${f(12 + r() * 22)}" fill="#fff" opacity="${f(0.1 + r() * 0.14)}" filter="url(#bl)"/>`
  return s
}

// 건물 한 겹: 세로 그라데이션(위가 밝음) + 어두운 측면 + 멀리언 + 창
function bldLayer(p, r, o, id) {
  const { w, base, minH, maxH, minW = 40, maxW = 90, gap = 4, color, lit = 0.35, hazeTop = 0.18 } = o
  let x = -10, out = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(color, '#ffffff', hazeTop + 0.1)}"/><stop offset="1" stop-color="${color}"/></linearGradient></defs>`
  let body = '', side = '', mull = '', wins = ''
  while (x < w + 10) {
    const bw = minW + r() * (maxW - minW), bh = minH + r() * (maxH - minH), y = base - bh
    body += `<rect x="${f(x)}" y="${f(y)}" width="${f(bw)}" height="${f(bh)}" fill="url(#${id})"/>`
    side += `<rect x="${f(x + bw * 0.78)}" y="${f(y)}" width="${f(bw * 0.22)}" height="${f(bh)}" fill="#000" opacity=".22"/>`
    for (let i = 1; i < Math.floor(bw / 12); i++) mull += `M${f(x + i * 12)} ${f(y)}v${f(bh)}`
    const cols = Math.floor((bw * 0.78 - 8) / 12), rows = Math.floor((bh - 14) / 15)
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) if (r() < lit) wins += `M${f(x + 5 + i * 12)} ${f(y + 8 + j * 15)}h6v8h-6z`
    x += bw + gap * r()
  }
  out += body + side + `<path d="${mull}" stroke="#fff" stroke-opacity=".07" stroke-width="1" fill="none"/>`
  out += `<path d="${wins}" fill="${p.win}" opacity=".85"/>`
  return out
}
const haze = (p, w, y0, y1, a = 0.35, id = 'hz') => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.haze}" stop-opacity="0"/><stop offset="1" stop-color="${p.haze}" stop-opacity="${a}"/></linearGradient></defs><rect y="${y0}" width="${w}" height="${y1 - y0}" fill="url(#${id})"/>`
const treeBlob = (p, x, y, s, r) => `<ellipse cx="${x}" cy="${f(y - 22 * s)}" rx="${f(22 * s)}" ry="${f(26 * s)}" fill="${p.tree}"/><ellipse cx="${f(x - 8 * s)}" cy="${f(y - 30 * s)}" rx="${f(14 * s)}" ry="${f(16 * s)}" fill="${p.tree2}" opacity=".8"/><rect x="${f(x - 1.5 * s)}" y="${f(y - 8 * s)}" width="${f(3 * s)}" height="${f(10 * s)}" fill="#000" opacity=".5"/>`

// ───── 모티프 ─────
function hero(p, w = 1600, h = 800) {
  const r = rng(11)
  let s = sky(p, w, h, r, 0.72, 0.58)
  // 먼 산(대기 원근)
  let d = `M0 ${h * 0.62}`
  for (let x = 0; x <= w; x += 80) d += ` L${x} ${f(h * 0.6 - 50 * (0.5 + 0.5 * Math.sin(x / 260 + 1)) - r() * 18)}`
  s += `<path d="${d} L${w} ${h} L0 ${h} Z" fill="${mix(p.far, p.haze, 0.45)}" opacity=".7"/>`
  s += bldLayer(p, r, { w, base: h * 0.84, minH: 90, maxH: 250, color: p.far, lit: 0.12, hazeTop: 0.3 }, 'bf')
  s += haze(p, w, h * 0.55, h * 0.84, 0.4, 'hz1')
  s += bldLayer(p, r, { w, base: h * 0.9, minH: 130, maxH: 330, minW: 46, maxW: 84, color: p.mid, lit: 0.28, hazeTop: 0.18 }, 'bm')
  s += haze(p, w, h * 0.65, h * 0.9, 0.28, 'hz2')
  // 주인공 타워 군(가운데 좌측): 유리 반사 + 가장자리 빛
  const tw = [[w * 0.34, 96, 520], [w * 0.34 + 106, 78, 430], [w * 0.34 - 86, 70, 360]]
  let near = bldLayer(p, r, { w, base: h * 0.95, minH: 110, maxH: 270, minW: 54, maxW: 100, color: p.near, lit: 0.4, hazeTop: 0.05 }, 'bn')
  for (const [x, bw, bh] of tw) {
    const y = h * 0.95 - bh
    near += `<defs><linearGradient id="t${x | 0}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mix(p.near, '#ffffff', 0.32)}"/><stop offset=".5" stop-color="${p.near}"/><stop offset="1" stop-color="${mix(p.near, '#000', 0.25)}"/></linearGradient></defs><rect x="${f(x)}" y="${f(y)}" width="${bw}" height="${bh}" fill="url(#t${x | 0})"/><rect x="${f(x)}" y="${f(y)}" width="3" height="${bh}" fill="${p.glow}" opacity=".5"/><rect x="${f(x)}" y="${f(y)}" width="${bw}" height="3" fill="${p.accent}" opacity=".9"/>`
    let ws = ''
    for (let i = 0; i < Math.floor((bw - 8) / 11); i++) for (let j = 0; j < Math.floor((bh - 12) / 14); j++) if (r() < 0.55) ws += `M${f(x + 5 + i * 11)} ${f(y + 8 + j * 14)}h6v8h-6z`
    near += `<path d="${ws}" fill="${p.win}" opacity=".92"/>`
  }
  s += near
  // 전경: 어두운 지면 + 나무 + 반사
  s += `<defs><linearGradient id="gd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(p.ground, '#fff', 0.08)}"/><stop offset="1" stop-color="${p.ground}"/></linearGradient></defs><rect y="${h * 0.95}" width="${w}" height="${h * 0.05 + 1}" fill="url(#gd)"/>`
  for (let x = 10; x < w; x += 40 + r() * 70) s += treeBlob(p, f(x), f(h * 0.97 + r() * 8), 0.8 + r() * 0.9, r)
  s += vignette(w, h, 0.4) + grain(w, h, 0.08)
  return wrap(w, h, s)
}

const building = (p) => {
  const w = 1000, h = 640, r = rng(21)
  let s = sky(p, w, h, r, 0.2, 0.3)
  s += bldLayer(p, r, { w, base: h, minH: 220, maxH: 400, minW: 90, maxW: 140, color: p.far, lit: 0.1, hazeTop: 0.3 }, 'bf')
  s += haze(p, w, h * 0.3, h, 0.35, 'hz1')
  let near = ''
  for (const [x, bw, bh, id] of [[230, 190, 600, 'a'], [430, 150, 500, 'b'], [60, 150, 420, 'c']]) {
    const y = h - bh
    near += `<defs><linearGradient id="q${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mix(p.near, '#ffffff', 0.4)}"/><stop offset=".45" stop-color="${p.near}"/><stop offset="1" stop-color="${mix(p.near, '#000', 0.3)}"/></linearGradient></defs><rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="url(#q${id})"/><rect x="${x}" y="${y}" width="4" height="${bh}" fill="${p.glow}" opacity=".45"/>`
    let ws = '', ml = ''
    for (let i = 1; i < bw / 14; i++) ml += `M${f(x + i * 14)} ${y}v${bh}`
    for (let i = 0; i < Math.floor((bw - 10) / 14); i++) for (let j = 0; j < Math.floor((bh - 14) / 18); j++) if (r() < 0.5) ws += `M${f(x + 6 + i * 14)} ${f(y + 10 + j * 18)}h7v10h-7z`
    near += `<path d="${ml}" stroke="#fff" stroke-opacity=".08" fill="none"/><path d="${ws}" fill="${p.win}" opacity=".9"/><rect x="${x}" y="${y}" width="${bw}" height="4" fill="${p.accent}"/>`
  }
  s += near + vignette(w, h, 0.35) + grain(w, h, 0.08)
  return wrap(w, h, s)
}

const landscape = (p, w, h, seed, forest = true) => {
  const r = rng(seed)
  let s = sky(p, w, h, r, 0.7, 0.45)
  let d = `M0 ${h * 0.58}`
  for (let x = 0; x <= w; x += 70) d += ` L${x} ${f(h * 0.54 - 40 * (0.5 + 0.5 * Math.sin(x / 200)) - r() * 14)}`
  s += `<path d="${d} L${w} ${h} L0 ${h} Z" fill="${mix(p.far, p.haze, 0.4)}"/>`
  s += `<path d="M0 ${h * 0.66} C ${w * 0.3} ${h * 0.58} ${w * 0.6} ${h * 0.7} ${w} ${h * 0.6} L${w} ${h} L0 ${h} Z" fill="${mix(p.tree, p.haze, 0.25)}"/>`
  s += `<path d="M0 ${h * 0.78} C ${w * 0.35} ${h * 0.7} ${w * 0.65} ${h * 0.84} ${w} ${h * 0.74} L${w} ${h} L0 ${h} Z" fill="${p.tree}"/>`
  s += `<path d="M${w * 0.4} ${h} C ${w * 0.45} ${h * 0.86} ${w * 0.58} ${h * 0.84} ${w * 0.52} ${h * 0.76} S ${w * 0.5} ${h * 0.72} ${w * 0.56} ${h * 0.72}" fill="none" stroke="${mix(p.paper, p.haze, 0.2)}" stroke-width="${h * 0.05}" stroke-linecap="round" opacity=".85"/>`
  for (let i = 0; i < 26; i++) s += treeBlob(p, f(r() * w), f(h * (0.78 + r() * 0.2)), 0.9 + r() * 1.4, r)
  return s + vignette(w, h, 0.33) + grain(w, h, 0.08)
}
const park = (p) => wrap(1000, 640, landscape(p, 1000, 640, 41))

const location = (p) => { // 지도 (부드러운 도시 지도 스타일)
  const w = 1000, h = 640, r = rng(31)
  let s = `<rect width="${w}" height="${h}" fill="${p.land}"/>`
  s += `<path d="M-20 400 C 200 310 330 500 520 420 S 880 320 1020 380 L1020 470 C 880 410 700 520 520 500 S 180 390 -20 490 Z" fill="${p.water}"/>`
  const road = (d, wd, c = p.road) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${wd}" stroke-linecap="round"/>`
  for (let i = 0; i < 6; i++) s += road(`M${f(r() * 200 - 20)} ${i * 115} L${f(750 + r() * 280)} ${f(i * 115 + r() * 70 - 35)}`, 9 + r() * 7)
  for (let i = 0; i < 8; i++) s += road(`M${i * 130 + f(r() * 40)} -10 L${i * 130 + f(r() * 130 - 40)} 650`, 8 + r() * 6)
  for (let i = 0; i < 12; i++) { const bx = r() * 880, by = r() * 480; s += `<rect x="${f(bx)}" y="${f(by)}" width="${f(46 + r() * 60)}" height="${f(30 + r() * 46)}" fill="${p.green}" opacity=".55" rx="8"/>` }
  for (let i = 0; i < 26; i++) s += `<rect x="${f(r() * 940)}" y="${f(r() * 560)}" width="${f(16 + r() * 22)}" height="${f(12 + r() * 20)}" fill="${p.ink}" opacity=".08" rx="2"/>`
  const px = 520, py = 270
  s += `<circle cx="${px}" cy="${py}" r="80" fill="${p.accent}" opacity=".18"/><circle cx="${px}" cy="${py}" r="38" fill="${p.accent}" opacity=".3"/><path d="M${px} ${py + 44} C ${px - 44} ${py} ${px - 34} ${py - 52} ${px} ${py - 52} S ${px + 44} ${py} ${px} ${py + 44} Z" fill="${p.accent}"/><circle cx="${px}" cy="${py - 14}" r="11" fill="${p.paper}"/>`
  for (const [x, y] of [[210, 150], [800, 190], [310, 520], [760, 540]]) s += `<circle cx="${x}" cy="${y}" r="9" fill="${p.paper}" stroke="${p.ink}" stroke-width="3" opacity=".85"/>`
  return wrap(w, h, s + grain(w, h, 0.05))
}

const plan = (p) => { // 평면도
  const w = 1000, h = 640
  let s = `<rect width="${w}" height="${h}" fill="${p.paper}"/>`
  for (let x = 0; x <= w; x += 40) s += `<path d="M${x} 0V${h}" stroke="${p.ink}" stroke-opacity=".05"/>`
  const wall = (wd) => `stroke="${p.ink}" stroke-width="${wd}" fill="none"`
  s += `<rect x="110" y="80" width="780" height="480" ${wall(8)}/><path d="M410 80V320 M410 320H110 M410 380V560 M660 80V270 M660 270H890 M660 360V560 M660 360H890" ${wall(5)}/>`
  const door = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0h52" stroke="${p.ink}" stroke-width="2"/><path d="M0 0A52 52 0 0 1 52 52" fill="none" stroke="${p.ink}" stroke-width="1.5" stroke-dasharray="4 3"/></g>`
  s += door(410, 322, 90) + door(660, 272, 90) + door(300, 320, 0)
  const fur = (x, y, w2, h2, rx = 8) => `<rect x="${x}" y="${y}" width="${w2}" height="${h2}" rx="${rx}" fill="${p.furn}" opacity=".85" stroke="${p.ink}" stroke-width="2"/>`
  s += fur(160, 120, 160, 100) + fur(160, 420, 190, 80) + fur(470, 120, 150, 110) + fur(710, 410, 130, 110) + fur(700, 110, 140, 110, 50) + fur(135, 250, 44, 44, 22)
  return wrap(w, h, s)
}

const interior = (p) => { // 실내 (거실, 창밖 스카이라인)
  const w = 1000, h = 640, r = rng(5)
  let s = `<defs><linearGradient id="wl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${mix(p.paper, p.haze, 0.15)}"/><stop offset="1" stop-color="${mix(p.paper, p.far, 0.25)}"/></linearGradient><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(p.land, p.ink, 0.1)}"/><stop offset="1" stop-color="${mix(p.land, p.ink, 0.35)}"/></linearGradient></defs>`
  s += `<rect width="${w}" height="${h}" fill="url(#wl)"/><rect y="430" width="${w}" height="210" fill="url(#fl)"/>`
  s += `<rect x="560" y="80" width="340" height="280" fill="${p.ink}" opacity=".9"/>`
  const sw = sky(p, 330, 270, r, 0.7, 0.7).replace(/id="(sk|sg|bl)"/g, 'id="w$1"').replace(/url\(#(sk|sg|bl)\)/g, 'url(#w$1)')
  s += `<svg x="565" y="85" width="330" height="270" viewBox="0 0 330 270" preserveAspectRatio="xMidYMid slice">${sw}${bldLayer(p, r, { w: 330, base: 270, minH: 50, maxH: 130, minW: 24, maxW: 48, color: p.mid, lit: 0.3 }, 'wb')}</svg>`
  s += `<path d="M730 80V360M560 220H900" stroke="${mix(p.paper, '#000', 0.2)}" stroke-width="6"/><rect x="560" y="80" width="340" height="280" fill="none" stroke="${mix(p.paper, '#000', 0.25)}" stroke-width="8"/>`
  s += `<ellipse cx="330" cy="560" rx="260" ry="34" fill="${mix(p.land, p.ink, 0.25)}" opacity=".8"/>`
  s += `<rect x="130" y="340" width="400" height="140" rx="26" fill="${p.accent}"/><rect x="110" y="380" width="54" height="120" rx="20" fill="${mix(p.accent, '#000', 0.12)}"/><rect x="496" y="380" width="54" height="120" rx="20" fill="${mix(p.accent, '#000', 0.12)}"/><rect x="150" y="320" width="150" height="56" rx="18" fill="${mix(p.accent, '#fff', 0.25)}"/><rect x="310" y="320" width="150" height="56" rx="18" fill="${mix(p.accent, '#fff', 0.2)}"/>`
  s += `<path d="M700 440V510" stroke="${p.ink}" stroke-width="5"/><circle cx="700" cy="426" r="40" fill="${p.sun}" opacity=".95"/><circle cx="700" cy="426" r="70" fill="${p.glow}" opacity=".18"/>`
  s += `<rect x="90" y="90" width="120" height="160" fill="${mix(p.paper, p.far, 0.4)}"/><rect x="230" y="120" width="90" height="120" fill="${p.accent}" opacity=".7"/>`
  s += `<path d="M830 440c0-40 26-66 26-110M856 440c0-34 32-58 40-96M842 440c-14-32-40-54-46-84" stroke="${p.tree}" stroke-width="6" fill="none"/><rect x="812" y="440" width="58" height="66" rx="8" fill="${p.accent}"/>`
  return wrap(w, h, s + vignette(w, h, 0.28) + grain(w, h, 0.06))
}

const community = (p) => { // 수영장 조감
  const w = 1000, h = 640
  let s = `<rect width="${w}" height="${h}" fill="${mix(p.land, p.ink, 0.04)}"/><defs><linearGradient id="pw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mix(p.water, '#fff', 0.25)}"/><stop offset="1" stop-color="${mix(p.water, '#000', 0.12)}"/></linearGradient></defs>`
  s += `<rect x="150" y="130" width="700" height="320" rx="34" fill="url(#pw)" stroke="${p.paper}" stroke-width="14"/>`
  for (let i = 1; i < 6; i++) s += `<path d="M150 ${130 + i * 53}H850" stroke="#fff" stroke-width="2.5" stroke-dasharray="16 11" opacity=".7"/>`
  for (let i = 0; i < 10; i++) s += `<path d="M${190 + i * 66} ${160 + (i % 4) * 70} q 14 -11 28 0 t 28 0" fill="none" stroke="#fff" stroke-width="2.4" opacity=".55"/>`
  for (let i = 0; i < 6; i++) s += `<rect x="${170 + i * 108}" y="500" width="72" height="26" rx="10" fill="${p.furn}" opacity=".9"/>`
  s += treeBlob(p, 80, 160, 1.3, 0) + treeBlob(p, 930, 170, 1.3, 0) + treeBlob(p, 90, 540, 1.1, 0)
  return wrap(w, h, s + vignette(w, h, 0.22) + grain(w, h, 0.05))
}

const video = (p) => hero(p, 1000, 640)

const MOTIFS = { hero: (p) => hero(p), building, location, park, plan, interior, community, video }
for (const [skin, p] of Object.entries(SKINS)) {
  const dir = `src/assets/art/${skin}`
  mkdirSync(dir, { recursive: true })
  for (const [name, fn] of Object.entries(MOTIFS)) writeFileSync(`${dir}/${name}.svg`, fn(p))
}
console.log('생성 완료:', Object.keys(SKINS).join(', '))
