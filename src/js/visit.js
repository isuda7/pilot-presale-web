import { API_BASE } from './config.js'

const form = document.getElementById('apply-form')
const msg = document.getElementById('msg')

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  msg.className = 'msg'
  msg.textContent = '전송 중...'
  try {
    const res = await fetch(`${API_BASE}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        message: form.message.value.trim(),
        agreed: form.agreed.checked,
      }),
    })
    const json = await res.json()
    if (!json.success) throw new Error(json.error)
    msg.className = 'msg ok'
    msg.textContent = '신청이 접수되었습니다. 곧 연락드리겠습니다.'
    form.reset()
  } catch (err) {
    msg.className = 'msg err'
    msg.textContent = err.message || '전송에 실패했습니다.'
  }
})
