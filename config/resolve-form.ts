// 서버용: 선택된 유형(SITE_TYPE)이 있으면 그 유형의 form 덮어쓰기를 적용한 신청 폼 정의를 돌려준다.
import { FORM } from './form.js'
import { TYPES } from '../types/index.js'
import { SITE } from './base.js'
import { SITE_OVERRIDE } from './site.js'
import { deepMerge } from './merge.js'

export function resolveForm(typeName?: string) {
  const t = typeName ? TYPES[typeName] : undefined
  return t?.form ? { ...FORM, ...t.form } : FORM
}

// 화면과 같은 병합 결과(기본 → 유형 → 현장 config/site.ts)로 판단한다.
// 화면과 서버가 어긋나면 "저장되는 줄 알았는데 저장되지 않는" 사고가 나므로 반드시 같은 규칙을 쓴다.
export function resolveSite(typeName?: string) {
  const t = typeName ? TYPES[typeName] : undefined
  return deepMerge(deepMerge(SITE, t?.site || {}), SITE_OVERRIDE)
}

export const isSampleForm = (typeName?: string) => !!resolveSite(typeName).sampleForm
export const formClosedInfo = (typeName?: string) => {
  const s = resolveSite(typeName)
  return s.formClosed ? s.formClosedMessage : ''
}
