import { API_BASE, FORM, SITE } from './config.js'
import { consentLine } from './consent.js'
import { esc } from './content.js'

// 폼은 config/form.ts 정의로 생성한다.
const form = document.getElementById('apply-form')

// 상담 안내 카드(전화·운영시간·주소): 값이 있는 것만 표시
const info = [SITE.hours && ['운영시간', SITE.hours], SITE.address && ['견본주택', SITE.address]].filter(Boolean)
document.getElementById('visit-info').innerHTML = `<h3>상담 안내</h3><a class="visit-tel" href="tel:${esc(SITE.phone)}">${esc(SITE.phone)}</a>${info.map(([k, v]) => `<dl><dt>${k}</dt><dd>${esc(v)}</dd></dl>`).join('')}<p class="visit-note">신청 후 담당자가 순차적으로 연락드립니다.</p>`

// 신청 마감: 폼 대신 안내문만 보여 준다. (서버도 같은 설정으로 신청을 거부한다)
function setup() {
  const fieldHtml = (f) => {
    const attrs = `id="${f.name}" name="${f.name}" maxlength="${f.maxLength || ''}"${f.required ? ' required' : ''}${f.placeholder ? ` placeholder="${f.placeholder}"` : ''}`
    const control = f.type === 'textarea' ? `<textarea ${attrs}></textarea>` : `<input type="${f.type}" ${attrs} />`
    return `<label for="${f.name}">${f.label}${f.required ? '' : ' (선택)'}</label>${control}`
  }

  form.innerHTML = `
    ${FORM.fields.map(fieldHtml).join('')}
    <label class="agree"><input type="checkbox" id="agreed" required /> <span id="consent"></span></label>
    <button class="btn" type="submit">${FORM.submitLabel}</button>
    <p class="msg" id="msg" role="status"></p>`
  document.getElementById('consent').textContent = consentLine()
  const msg = document.getElementById('msg')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    msg.className = 'msg'
    msg.textContent = '전송 중...'
    try {
      if (SITE.sampleForm) {
        msg.className = 'msg ok'
        msg.textContent = '샘플 사이트이므로 신청 내용은 저장되지 않았습니다.'
        form.reset()
        return
      }
      const body = { agreed: form.agreed.checked }
      for (const f of FORM.fields) body[f.name] = form[f.name].value.trim()
      const res = await fetch(`${API_BASE}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      msg.className = 'msg ok'
      msg.textContent = FORM.successMessage
      form.reset()
    } catch (err) {
      msg.className = 'msg err'
      msg.textContent = err.message || '전송에 실패했습니다.'
    }
  })
}

if (SITE.formClosed) {
  form.innerHTML = `<p class="c-lead">${SITE.formClosedMessage}</p>`
} else {
  setup()
}
