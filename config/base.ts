// [기본값 / 템플릿 전용] 기본(base)의 완전한 설정. 현장은 이 파일을 고치지 않고 config/site.ts 에서 덮어쓴다.
// 적용 순서: 이 파일(기본) → types/<유형>/type.ts → config/site.ts(현장 데이터)
export const SITE = {
  name: '파일럿 분양 사이트',
  phone: '1800-0000',
  address: '',            // 견본주택/현장 주소 (오시는길에 사용)
  hours: '',              // 운영시간

  // 레이아웃 변형(일반적인 UI 패턴 중 선택). 템플릿(유형)마다 다르게 구성한다.
  //  header: 'bar'(로고+메뉴+전화) | 'center'(로고 중앙, 메뉴 아래) | 'simple'(드롭다운 없는 간단 메뉴)
  //  hero: 'full'(전체 사진+하단 요약 카드) | 'center'(가운데 정렬 사진) | 'split'(좌 글/우 사진) | 'banner'(낮은 배너)
  //  sub: 'none' | 'tabs'(서브 페이지 상단 탭) | 'side'(좌측 메뉴)
  //  sechead: 'left' | 'center' (섹션 제목 정렬)
  layout: { header: 'bar', hero: 'banner', sub: 'none', sechead: 'left', heroPos: '50% 50%', imgPos: '50% 50%' },

  // 메인 페이지 구성: 위에서 아래로 보여 줄 섹션 키(모듈 키 또는 quick·cta). 꺼진 모듈은 건너뛴다.
  home: ['biz', 'location', 'premium', 'directions', 'cta'],

  // 메인 비주얼
  hero: {
    title: '프리미엄 분양 파일럿',
    sub: '메인 비주얼/카피 영역 (준비중)',
  },

  // 검색 노출 차단. 내부용 초안은 true. 실제 공개하는 현장만 false.
  noindex: true,
  // 샘플(외부 공개용 템플릿) 모드. sample: 상단에 '샘플·가상 데이터' 안내 표시 / sampleForm: 신청을 저장하지 않음(화면·서버 모두)
  sample: false,
  sampleForm: false,

  // 신청 마감(현장 종료 시). true 면 화면은 안내문만 보이고 서버는 신청을 받지 않는다. 데이터 파기는 별도(사람이 수행).
  formClosed: false,
  formClosedMessage: '신청 접수가 종료되었습니다. 관심을 가져 주셔서 감사합니다.',

  // 페이지 본문 데이터 { 모듈키: { image, lead, table, cards, list } }. 없는 모듈은 '준비중' 자리표시자로 남는다.
  content: {},

  // 푸터의 관리자 링크 표시 여부
  showAdminLink: true,

  // 푸터 사업자 정보 (값이 있는 것만 표시)
  company: [
    { label: '시행', value: '' },
    { label: '시공', value: '' },
    { label: '분양대행', value: '' },
  ],

  // 푸터 고지 문구. ※ 확정은 사람이 한다(감시 B6). 아래는 초안.
  notices: [
    '본 사이트의 이미지는 이해를 돕기 위한 것이며 실제와 다를 수 있습니다.',
  ],

  // 개인정보 문구. ※ 확정은 사람이 한다(감시 B5). 수집 항목은 신청 폼 정의(config/form.ts)에서 자동 생성된다.
  privacy: {
    purpose: '분양 상담 및 방문예약 안내',
    retention: '미정 (확정 필요)',
  },

  // L2 켜고 끄기: { 모듈키: false }  — 키 목록은 config/modules.js 참고. L1은 끌 수 없다. 기본은 L2 전부 켜짐.
  modules: {},
}
