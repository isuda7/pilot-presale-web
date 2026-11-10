// 설정 해석: 기본(config/base.ts) → 유형(types/<SITE_TYPE>/type.ts) → 현장(config/site.ts). 이 파일은 수정하지 않는다.
import { SITE as BASE_SITE } from '../../config/base.ts'
import { SITE_OVERRIDE } from '../../config/site.ts'
import { MODULES as BASE_MODULES, GROUPS } from '../../config/modules.js'
import { FORM as BASE_FORM } from '../../config/form.ts'
import { deepMerge } from '../../config/merge.ts'
import { TYPES } from '../../types/index.ts'
import { loadRemote } from './remote.js'

// 유형 결정: 현장 빌드는 환경변수 SITE_TYPE 로 고정. 그렇지 않으면 템플릿 미리보기 주소(/t/<유형>/)에서 정한다.
// 기본(내부용 초안)은 유형 없음. 한 서버·한 빌드에서 화면 이동만으로 여러 템플릿을 볼 수 있게 하기 위함.
const fromPath = (location.pathname.match(/^\/t\/([^/]+)\//) || [])[1]
const previewType = !import.meta.env.SITE_TYPE && TYPES[fromPath] ? fromPath : ''
export const TYPE_NAME = import.meta.env.SITE_TYPE || previewType
export const PREVIEW = !!previewType
// 링크의 기준 경로: 미리보기면 /t/<유형>/, 아니면 Vite base
export const BASE = PREVIEW ? `/t/${previewType}/` : import.meta.env.BASE_URL
const T = TYPES[TYPE_NAME] || {}
if (TYPE_NAME && !TYPES[TYPE_NAME]) console.warn(`알 수 없는 유형: ${TYPE_NAME}`)

// 적용 순서: 기본 → 유형 → 현장 파일(site.ts) → 웹에서 수정한 값(DB). 마지막 층은 유형 이름(scope)별로 따로 저장된다.
const remote = await loadRemote(TYPE_NAME)
const FILE_SITE = deepMerge(deepMerge(BASE_SITE, T.site || {}), deepMerge({ modules: T.modules || {} }, SITE_OVERRIDE))
export const SITE = deepMerge(FILE_SITE, { ...(remote.site || {}), content: remote.content || {} })
// 관리자 편집 화면이 "초기값(파일)"과 "수정됨"을 구분할 수 있도록 노출한다.
export const FILE_CONTENT = FILE_SITE.content || {}
export const EDITED = { site: !!(remote.site && Object.keys(remote.site).length), content: Object.keys(remote.content || {}) }
export const SCOPE = TYPE_NAME
export const MODULES = [...BASE_MODULES, ...(T.addModules || [])]
export const FORM = { ...BASE_FORM, ...(T.form || {}) }
export { GROUPS }

// 백엔드 API 베이스. 개발: vite 프록시(상대경로), 배포: VITE_API_BASE 환경변수
export const API_BASE = import.meta.env.VITE_API_BASE || ''
