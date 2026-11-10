import { SITE } from './config.js'
import { consentItems } from './consent.js'

// 개인정보처리방침 초안. 문구 확정은 사람이 한다(감시 B5).
document.getElementById('privacy-body').textContent =
`1. 수집 항목: ${consentItems()}
2. 수집·이용 목적: ${SITE.privacy.purpose}
3. 보유 및 이용 기간: ${SITE.privacy.retention}
4. 동의를 거부할 수 있으며, 거부 시 상담 신청이 제한될 수 있습니다.

※ 이 문구는 초안이며 확정된 내용이 아닙니다.`
