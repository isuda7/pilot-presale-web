// [L4 현장 데이터] 이 현장에서 기본(config/base.ts)·유형과 "다른 값만" 적는다. 객체는 항목 단위로 병합되고, 배열은 통째로 교체된다.
// 기획 자료에 없는 값은 적지 않는다(임의로 채우지 않는다). 키 구조는 config/base.ts 를 보고 따른다.
// 예)
//   name: '○○ 푸르지오', phone: '1566-0000', address: '...',
//   noindex: false,   // 실제 공개하는 현장만
//   modules: { community: false },   // L2 끄기
export const SITE_OVERRIDE = {}
