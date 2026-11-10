import { SITE, FORM } from './config.js'

// 수집 항목은 신청 폼 정의에서 자동 생성한다(폼과 동의문이 어긋나지 않게).
export function consentItems() {
  return FORM.fields.map((f) => f.label).join(', ')
}

export function consentLine() {
  return `개인정보 수집 및 이용에 동의합니다. (수집 항목: ${consentItems()} / 목적: ${SITE.privacy.purpose} / 보유기간: ${SITE.privacy.retention})`
}
