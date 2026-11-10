// 객체는 재귀 병합, 배열·원시값은 교체. (기본 → 유형 → 현장 병합에 사용)
const isObj = (v: any) => v && typeof v === 'object' && !Array.isArray(v)

export function deepMerge(base: any, over: any): any {
  if (!isObj(base) || !isObj(over)) return over === undefined ? base : over
  const out: any = { ...base }
  for (const k of Object.keys(over)) out[k] = k in base ? deepMerge(base[k], over[k]) : over[k]
  return out
}
