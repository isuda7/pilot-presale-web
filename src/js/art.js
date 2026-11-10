import { TYPE_NAME } from './config.js'

// 이미지 해석 순서: ① 유형별 실제 사진 src/assets/photos/<유형>/<모티프>.(webp|jpg|jpeg|png)
//                  ② 유형별 CG 이미지 src/assets/art/<유형>/<모티프>.svg  ③ 기본 CG src/assets/art/default/<모티프>.svg
// 같은 이름의 사진을 폴더에 넣으면 코드 수정 없이 자동으로 우선한다. 사진은 라이선스가 확인된 것만 쓴다.
const photos = import.meta.glob('../assets/photos/*/*.{jpg,jpeg,webp,png}', { query: '?url', import: 'default', eager: true })
const arts = import.meta.glob('../assets/art/*/*.svg', { query: '?url', import: 'default', eager: true })
export const artUrl = (motif) => {
  for (const ext of ['webp', 'jpg', 'jpeg', 'png']) { const u = photos[`../assets/photos/${TYPE_NAME}/${motif}.${ext}`]; if (u) return u }
  return arts[`../assets/art/${TYPE_NAME}/${motif}.svg`] || arts[`../assets/art/default/${motif}.svg`] || ''
}

// [data-art="모티프"] 자리에 이미지를 채운다.
export function fillArt() {
  document.querySelectorAll('[data-art]').forEach((el) => {
    const u = artUrl(el.dataset.art)
    if (u) el.innerHTML = `<img src="${u}" alt="" decoding="async">`
  })
}
