// 웹(관리자)에서 수정한 콘텐츠를 불러온다. 파일 기본값 위에 마지막으로 얹히는 층이다.
// API 가 없거나 느리면(정적 호스팅, 오프라인) 조용히 건너뛰고 파일 기본값으로 동작한다.
const API = import.meta.env.VITE_API_BASE || ''

export async function loadRemote(scope) {
  try {
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), 3000)
    const res = await fetch(`${API}/api/content?scope=${encodeURIComponent(scope)}`, { signal: ctl.signal, cache: 'no-store' })
    clearTimeout(timer)
    if (!res.ok) return {}
    const json = await res.json()
    return json && json.success ? json.data : {}
  } catch {
    return {}
  }
}
