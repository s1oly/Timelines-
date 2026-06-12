const DATA_KEY = 'timelines:data'
const ACTIVE_KEY = 'timelines:active'
const THEME_KEY = 'timelines:theme'

const scrollKey = (timelineId) => `timelines:scroll:${timelineId}`

export function loadData() {
  try {
    const raw = localStorage.getItem(DATA_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && Array.isArray(parsed.timelines) && parsed.moments) {
        return parsed
      }
    }
  } catch {
    // corrupted data — start fresh
  }
  return { timelines: [], moments: {} }
}

export function saveData(data) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data))
}

export function loadActiveId() {
  return localStorage.getItem(ACTIVE_KEY)
}

export function saveActiveId(id) {
  if (id) localStorage.setItem(ACTIVE_KEY, id)
  else localStorage.removeItem(ACTIVE_KEY)
}

export function loadScroll(timelineId) {
  const v = localStorage.getItem(scrollKey(timelineId))
  return v ? Number(v) : 0
}

export function saveScroll(timelineId, left) {
  localStorage.setItem(scrollKey(timelineId), String(Math.round(left)))
}

export function clearScroll(timelineId) {
  localStorage.removeItem(scrollKey(timelineId))
}

export function loadTheme() {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme)
}

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
