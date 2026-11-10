// [유형 등록부] types/<이름>/type.ts 를 추가하면 여기에 등록한다. 선택은 환경변수 SITE_TYPE(없으면 기본).
// 유형 정의 형식: { label, desc, site?: 값 덮어쓰기(layout·home 포함), modules?: 켜고 끄기, addModules?: L3 모듈 추가, form?: 신청 폼 덮어쓰기 }
// 파일 교체: types/<이름>/pages/<파일>.html (기본에 같은 이름이 있으면 교체, 없으면 추가). 이미지: src/assets/photos/<이름>/ , src/assets/art/<이름>/
import minimal from './minimal/type.js'
import full from './full/type.js'
import midA from './mid-a/type.js'
import midB from './mid-b/type.js'

export const TYPES: Record<string, any> = { minimal, full, 'mid-a': midA, 'mid-b': midB }
