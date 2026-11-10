// [가상 데이터] 데모 템플릿 전용. 실제 현장명·전화·주소·이미지를 쓰지 않는다(감시 B1).
// 템플릿마다 가상의 프로젝트(이름·콘셉트·카피·수치)를 따로 가진다. 이미지는 스킨별 일러스트(src/assets/art)를 쓴다.
// 이미지 값은 모티프 이름: hero·building·location·park·plan·interior·community·video

export type Card = { title: string; text: string }
export type Profile = {
  name: string; eyebrow: string; title: string; sub: string
  facts: [string, string][]
  bizLead: string; bizRows: [string, string][]
  locationLead: string; location: Card[]
  premium: Card[]
  community: Card[]
  units: Card[]
  designLead: string; interiorLead: string
  supply: [string, string][]
  schedule: [string, string][]
  extra?: Record<string, any> // 유형 고유 모듈(오피스텔·상가 등)
}

const ADDR = '가상시 중앙구 샘플로 100'
const addr2 = '가상시 중앙구 샘플로 200'

export const buildContent = (p: Profile) => ({
  biz: { image: 'building', lead: p.bizLead, table: p.bizRows },
  location: { image: 'location', lead: p.locationLead, cards: p.location },
  premium: { image: 'park', cards: p.premium },
  directions: { image: 'location', table: [['견본주택', `${addr2}`], ['대표전화', '000-0000-0000'], ['운영시간', '10:00 ~ 17:00 (연중무휴)'], ['대중교통', '가상역 1번 출구 도보 5분'], ['주차', '견본주택 전용 주차장 이용']] },
  schedule: { table: p.schedule },
  supply: { table: p.supply },
  notice: { lead: '입주자 모집공고문이 게시되는 영역입니다. 청약 전 반드시 공고문 전문을 확인하세요.', list: ['입주자 모집공고문 (PDF)', '모집공고 정정 안내', '공급대상 및 자격 안내'] },
  subscription: { lead: '청약 자격과 절차를 한눈에 확인하세요.', list: ['인터넷 청약 안내', '변경된 청약제도', '특별공급 안내', '일반공급 안내'] },
  'subscription.rule': { lead: '최근 변경된 청약제도의 주요 내용과 적용 시점을 안내합니다.' },
  'subscription.special': { lead: '신혼부부·생애최초·다자녀 등 특별공급 대상과 조건을 안내합니다.' },
  'subscription.general': { lead: '1순위·2순위 자격 요건과 가점제·추첨제 기준을 안내합니다.' },
  contract: { lead: '계약 시 필요한 서류와 절차를 미리 준비하세요.', list: ['계약체결 안내', '인지세 납부 안내', '주택자금조달 및 입주계획서 안내', '명의변경(권리의무승계) 안내', '구비서류 안내'] },
  design: { image: 'park', lead: p.designLead },
  community: { image: 'community', cards: p.community },
  plan: { image: 'plan', lead: '단지 배치도와 동·호수 배치도를 확인하세요. 자세한 내용은 견본주택에서 안내합니다.' },
  telecom: { lead: '이동통신설비 협의결과서가 게시되는 영역입니다.' },
  vr: { image: 'location', lead: '지역 조감 VR로 입지를 한눈에 둘러보세요.' },
  unit: { image: 'plan', cards: p.units },
  emodel: { image: 'interior', lead: 'E-모델하우스로 언제 어디서나 세대 내부를 확인하세요.' },
  interior: { image: 'interior', lead: p.interiorLead },
  system: { lead: '입주민의 편의를 높이는 세대 시스템을 소개합니다.', list: ['스마트 도어락 · 원격 제어', '전열교환 환기 시스템', '에너지 사용량 모니터링', '무인택배 · 방문자 영상 확인'] },
  press: { list: [`[보도] ${p.name} 분양 소식`, '[보도] 지역 개발 계획 발표', '[보도] 신규 교통망 확충 계획'] },
  video: { image: 'video' },
  event: { lead: '방문 고객을 위한 이벤트를 진행합니다.', list: ['방문 예약 고객 사은품 증정', '계약 고객 감사 이벤트'] },
  ...(p.extra || {}),
})

// 공통 샘플 설정 + 프로젝트별 히어로·본문
export const sampleSite = (p: Profile) => ({
  name: p.name,
  phone: '000-0000-0000',
  address: addr2,
  hours: '10:00 ~ 17:00 (연중무휴)',
  hero: { eyebrow: p.eyebrow, title: p.title, sub: p.sub, facts: p.facts, cta2: '사업개요 보기' },
  sample: true,
  sampleForm: false, // 신청 기능은 실제 현장과 동일하게 동작(저장·관리자 목록). 가상 정보만 입력하도록 안내한다.
  showAdminLink: true,
  company: [{ label: '시행', value: '○○개발(가상)' }, { label: '시공', value: '○○건설(가상)' }],
  notices: [
    '본 사이트는 구조 확인용 샘플이며 모든 정보는 가상입니다.',
    '이미지는 일러스트이며 실제 분양과 무관합니다.',
    '신청 기능은 시연용입니다. 실제 이름·연락처를 입력하지 마세요.',
  ],
  privacy: { purpose: '신청 기능 시연 (샘플)', retention: '시연 후 삭제 (가상 정보만 입력)' },
  content: buildContent(p),
})

// ───── 프로젝트 프로필 (가상) ─────
export const CLASSIC: Profile = {
  name: '더클래식 퍼스트시티',
  eyebrow: 'THE CLASSIC FIRST CITY',
  title: '도시의 품격, 대를 잇는 주거의 기준',
  sub: '도심 한가운데 완성되는 정통 프리미엄 레지던스',
  facts: [['총 세대', '1,248세대'], ['규모', '지하 3층 ~ 지상 29층'], ['전용면적', '59 · 74 · 84㎡'], ['입주 예정', '2029년 상반기']],
  bizLead: '검증된 입지 위에 세워지는 도심 신축. 한 번의 선택이 대를 잇는 가치가 되도록, 설계와 마감의 기준을 높였습니다.',
  bizRows: [['사업명', '더클래식 퍼스트시티'], ['위치', ADDR], ['대지면적', '52,840㎡'], ['건축규모', '지하 3층 ~ 지상 29층, 12개 동'], ['세대수', '총 1,248세대'], ['주차대수', '세대당 1.4대'], ['입주 예정', '2029년 상반기']],
  locationLead: '지하철 환승역과 도심 생활권이 만나는 곳. 이동과 일상이 모두 가까운 입지입니다.',
  location: [
    { title: '교통', text: '2개 노선 환승역 도보 5분, 광역버스 정류장 인접' },
    { title: '생활', text: '대형 백화점·종합병원이 반경 1km 이내' },
    { title: '교육', text: '초·중·고 도보 통학, 학원가 인접' },
    { title: '자연', text: '도심 공원과 하천 산책로가 가까운 입지' },
  ],
  premium: [
    { title: '전 세대 남향 중심 배치', text: '채광과 통풍을 우선한 단지 배치' },
    { title: '호텔식 커뮤니티', text: '스카이 라운지와 피트니스, 골프연습장' },
    { title: '중앙 정원 조경', text: '사계절 변화를 담은 특화 조경' },
    { title: '4Bay 판상형 평면', text: '넓은 거실과 효율적인 수납 구성' },
    { title: '스마트 홈 시스템', text: '원격 제어와 에너지 관리' },
    { title: '컨시어지 서비스', text: '입주민을 위한 생활 지원 서비스' },
  ],
  community: [
    { title: '스카이 라운지', text: '도시 전망을 담은 최상층 휴게 공간' },
    { title: '피트니스 · GX', text: '전문 장비와 그룹 운동 스튜디오' },
    { title: '골프연습장', text: '실내 스크린 골프와 퍼팅 연습' },
    { title: '키즈 라이브러리', text: '아이를 위한 독서·놀이 공간' },
  ],
  units: [
    { title: '59㎡ A', text: '실속형 3Bay 2룸 구성' },
    { title: '74㎡ A', text: '넉넉한 4Bay 3룸 구성' },
    { title: '84㎡ A', text: '4Bay 판상형 3룸 + 드레스룸' },
  ],
  designLead: '도시의 격에 어울리는 절제된 외관, 중앙 정원을 중심으로 한 단지 배치로 품격을 완성했습니다.',
  interiorLead: '차분한 톤의 마감과 고급 자재로 일상에 깊이를 더했습니다.',
  supply: [['59㎡', '420세대'], ['74㎡', '508세대'], ['84㎡', '320세대']],
  schedule: [['모집공고', '2027.03.15 (월)'], ['특별공급', '2027.03.22 (월)'], ['1순위 청약', '2027.03.23 (화)'], ['당첨자 발표', '2027.03.30 (화)'], ['정당계약', '2027.04.12 ~ 04.14']],
  extra: {
    officetel: { image: 'interior', lead: '역세권 업무지구에 가까운 스마트 오피스텔. 투자와 실거주 모두를 고려한 구성입니다.', table: [['규모', '총 320실'], ['타입', '24㎡ / 36㎡'], ['특징', '분리형 침실, 풀옵션 가전 제공'], ['위치', '단지 북측 동']] },
    retail: { image: 'building', lead: '단지 저층부에 조성되는 근린생활시설. 주거와 업무 수요를 함께 받는 상권입니다.', table: [['규모', '지하 1층 ~ 지상 3층'], ['업종', '카페·식음·생활 편의'], ['동선', '지하철역 연결 보행로']] },
  },
}

export const NATURE: Profile = {
  name: '숲결 그린파크',
  eyebrow: 'FOREST GREEN PARK',
  title: '숲의 호흡으로 채우는 매일',
  sub: '아이는 뛰놀고, 어른은 쉬어가는 숲세권 가족 주거',
  facts: [['총 세대', '860세대'], ['단지 녹지율', '38%'], ['전용면적', '59 · 74 · 84㎡'], ['입주 예정', '2029년 하반기']],
  bizLead: '숲과 공원이 이어진 단지에서 아이와 부모 모두가 편안한 일상을 보낼 수 있도록 설계했습니다.',
  bizRows: [['사업명', '숲결 그린파크'], ['위치', ADDR], ['대지면적', '41,200㎡'], ['건축규모', '지하 2층 ~ 지상 20층, 9개 동'], ['세대수', '총 860세대'], ['단지 녹지율', '38%'], ['입주 예정', '2029년 하반기']],
  locationLead: '걸어서 닿는 공원과 학교, 도심 접근성까지. 가족의 하루가 편안해지는 숲세권입니다.',
  location: [
    { title: '숲세권', text: '근린공원이 도보 3분, 단지와 산책로로 연결' },
    { title: '안심 통학', text: '초등학교가 단지 바로 앞, 차 없는 통학로' },
    { title: '생활 인프라', text: '마트·병원·도서관이 생활 반경 안에' },
    { title: '도심 접근', text: '간선도로와 역을 모두 이용하기 편한 위치' },
  ],
  premium: [
    { title: '숲 속 산책로', text: '단지를 한 바퀴 도는 1.2km 순환 산책로' },
    { title: '어린이 놀이 정원', text: '안전 바닥재와 모험 놀이 시설' },
    { title: '반려동물 케어', text: '전용 놀이터와 세족 공간' },
    { title: '공동 텃밭', text: '이웃과 함께 가꾸는 입주민 텃밭' },
    { title: '층간소음 저감', text: '고성능 완충재를 적용한 바닥 구조' },
    { title: '에너지 절약 설계', text: '고효율 창호와 단열로 관리비 부담 완화' },
  ],
  community: [
    { title: '가든 카페', text: '숲을 바라보는 입주민 휴게 공간' },
    { title: '키즈 스테이션', text: '아이들이 안전하게 노는 실내 놀이터' },
    { title: '실내 수영장', text: '온수 풀과 어린이 풀' },
    { title: '다목적 스튜디오', text: '요가·필라테스·문화 강좌' },
  ],
  units: [
    { title: '59㎡ A', text: '신혼·소가족을 위한 아담한 3Bay' },
    { title: '74㎡ A', text: '아이 방이 넉넉한 4Bay 3룸' },
    { title: '84㎡ A', text: '가족 공용공간이 넓은 4Bay 판상형' },
  ],
  designLead: '단지 중앙에 숲을 두고 동을 둘러 배치해, 어느 동에서도 초록이 보이도록 했습니다.',
  interiorLead: '따뜻한 우드 톤과 자연 소재로 편안한 집을 완성했습니다.',
  supply: [['59㎡', '260세대'], ['74㎡', '340세대'], ['84㎡', '260세대']],
  schedule: [['모집공고', '2027.05.10 (월)'], ['특별공급', '2027.05.17 (월)'], ['1순위 청약', '2027.05.18 (화)'], ['당첨자 발표', '2027.05.25 (화)'], ['정당계약', '2027.06.07 ~ 06.09']],
}

export const MINIMAL: Profile = {
  name: '리버라인 에디션',
  eyebrow: 'RIVERLINE EDITION',
  title: '강을 품은 단 한 번의 선택',
  sub: '수변 조망, 단 3개 동. 군더더기 없이 본질에 집중한 주거',
  facts: [['총 세대', '412세대'], ['동 수', '3개 동'], ['조망', '수변 100%'], ['입주 예정', '2028년 하반기']],
  bizLead: '강변을 따라 낮고 길게 선 3개 동. 조망과 프라이버시, 두 가지에 집중했습니다.',
  bizRows: [['사업명', '리버라인 에디션'], ['위치', ADDR], ['건축규모', '지하 2층 ~ 지상 18층, 3개 동'], ['세대수', '총 412세대'], ['입주 예정', '2028년 하반기']],
  locationLead: '강과 도심 사이, 가장 조용하고 가장 가까운 자리.',
  location: [
    { title: '수변', text: '강변 산책로가 단지 앞에' },
    { title: '교통', text: '가상역 도보 8분' },
    { title: '생활', text: '중심 상권 차량 5분' },
    { title: '교육', text: '초·중학교 도보권' },
  ],
  premium: [
    { title: '100% 수변 조망', text: '전 세대 강 조망 배치' },
    { title: '낮고 긴 3개 동', text: '개방감을 살린 저밀 설계' },
    { title: '프라이빗 라운지', text: '입주민 전용 수변 라운지' },
    { title: '미니멀 마감', text: '절제된 톤의 고급 마감' },
  ],
  community: [
    { title: '수변 라운지', text: '강을 마주한 휴게 공간' },
    { title: '피트니스', text: '개인 운동에 집중한 구성' },
  ],
  units: [
    { title: '74㎡', text: '조망형 3Bay 2룸' },
    { title: '84㎡', text: '4Bay 3룸' },
  ],
  designLead: '강의 흐름을 따라 낮게 배치한 단지, 비어 있는 공간이 곧 조망이 됩니다.',
  interiorLead: '장식을 덜어내고 재료의 질감으로 완성한 인테리어.',
  supply: [['74㎡', '182세대'], ['84㎡', '230세대']],
  schedule: [['모집공고', '2027.06.07 (월)'], ['1순위 청약', '2027.06.14 (월)'], ['당첨자 발표', '2027.06.21 (월)'], ['정당계약', '2027.07.05 ~ 07.07']],
}

export const URBAN: Profile = {
  name: '센트럴 하이브',
  eyebrow: 'CENTRAL HIVE',
  title: '믿을 수 있는 분양 정보, 한눈에',
  sub: '청약 일정, 공급 내역, 계약 절차를 쉽고 정확하게 안내합니다',
  facts: [['총 세대', '1,020세대'], ['청약 접수', '2027.07.13'], ['당첨자 발표', '2027.07.20'], ['정당계약', '2027.08.02']],
  bizLead: '역세권 입지에 들어서는 대단지 아파트. 청약부터 계약까지 필요한 정보를 한곳에 모았습니다.',
  bizRows: [['사업명', '센트럴 하이브'], ['위치', ADDR], ['대지면적', '34,600㎡'], ['건축규모', '지하 4층 ~ 지상 35층, 9개 동'], ['세대수', '총 1,020세대 (59 · 74 · 84㎡)'], ['입주 예정', '2029년 상반기']],
  locationLead: '역과 직결되는 동선, 업무지구와 상권이 함께하는 도심 한복판입니다.',
  location: [
    { title: '초역세권', text: '가상역 도보 3분, 환승 노선 2개' },
    { title: '업무지구', text: '주요 업무지구까지 대중교통 15분' },
    { title: '상권', text: '대형 쇼핑몰·병원·문화시설 인접' },
    { title: '광역 교통', text: '고속도로 IC와 광역버스 환승센터' },
  ],
  premium: [
    { title: '복합 개발 시너지', text: '주거·업무·상업이 한 블록에' },
    { title: '스카이 커뮤니티', text: '고층 라운지와 공유 오피스' },
    { title: '역 직결 동선', text: '비 오는 날에도 편한 보행 동선' },
    { title: '스마트 오피스텔', text: '소형 평형 맞춤 수납과 설비' },
    { title: '상업시설 인접', text: '단지 내 근린 상업시설' },
    { title: '24시간 보안', text: '출입 통제와 통합 관제' },
  ],
  community: [
    { title: '공유 오피스', text: '입주민 전용 업무 공간' },
    { title: '스카이 라운지', text: '야경을 바라보는 고층 휴게 공간' },
    { title: '피트니스 · 사우나', text: '24시간 이용 가능한 운동 시설' },
    { title: '게스트하우스', text: '방문객을 위한 숙박 공간' },
  ],
  units: [
    { title: '59㎡ A', text: '도심형 3Bay 2룸' },
    { title: '84㎡ A', text: '4Bay 3룸 + 서재형 공간' },
    { title: '오피스텔 36㎡', text: '분리형 침실 구조' },
  ],
  designLead: '밤에 더 빛나는 외관, 저층부 상업가로와 고층 주거동이 이어지는 입체 단지 구성.',
  interiorLead: '도시적인 톤의 마감과 간접 조명으로 완성한 세대 내부.',
  supply: [['59㎡', '380세대'], ['74㎡', '360세대'], ['84㎡', '280세대']],
  schedule: [['모집공고', '2027.07.05 (월)'], ['특별공급', '2027.07.12 (월)'], ['1순위 청약', '2027.07.13 (화)'], ['2순위 청약', '2027.07.14 (수)'], ['당첨자 발표', '2027.07.20 (화)'], ['정당계약', '2027.08.02 ~ 08.04']],
}
