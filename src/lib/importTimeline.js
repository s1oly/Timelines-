import { DEFAULT_ACCENT } from './accent.js'

const isDateString = (v) =>
  typeof v === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  !Number.isNaN(new Date(v + 'T00:00:00').getTime())

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

// Media can arrive as a plain "base64-or-url" string or as an object like
// { type, dataUrl } produced by older exports. Normalize to a string.
const normalizeMedia = (media) => {
  if (!media) return null
  if (typeof media === 'string') return media
  if (typeof media === 'object') return media.dataUrl ?? media.url ?? null
  return null
}

// Parse and validate a user-supplied .json file against the Chronos Timeline
// Schema. Resolves to { errors, timeline } — `timeline` is a normalized,
// ready-to-preview object, or null when there are blocking errors.
export function parseTimelineFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onerror = () =>
      resolve({ errors: ['Could not read the selected file.'], timeline: null })
    reader.onload = () => {
      let raw
      try {
        raw = JSON.parse(reader.result)
      } catch {
        resolve({ errors: ['File is not valid JSON.'], timeline: null })
        return
      }
      resolve(validate(raw))
    }
    reader.readAsText(file)
  })
}

function validate(raw) {
  const errors = []

  if (!raw || typeof raw !== 'object') {
    return { errors: ['File does not contain a timeline object.'], timeline: null }
  }

  const name =
    raw.timelineName ?? raw.name ?? raw.timeline?.name ?? ''
  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Missing "timelineName".')
  }

  const rawMoments = raw.moments
  if (!Array.isArray(rawMoments)) {
    errors.push('Missing "moments" array.')
  }

  const accentColor =
    typeof raw.accentColor === 'string' && HEX.test(raw.accentColor)
      ? raw.accentColor
      : DEFAULT_ACCENT

  const moments = []
  if (Array.isArray(rawMoments)) {
    rawMoments.forEach((m, i) => {
      const label = `Moment ${i + 1}`
      if (!m || typeof m !== 'object') {
        errors.push(`${label}: not a valid object.`)
        return
      }
      if (!m.title || typeof m.title !== 'string' || !m.title.trim()) {
        errors.push(`${label}: missing title.`)
      }
      if (!isDateString(m.date)) {
        errors.push(`${label}: invalid or missing date (expected YYYY-MM-DD).`)
      }
      moments.push({
        title: typeof m.title === 'string' ? m.title.trim() : '',
        date: m.date,
        description:
          typeof m.description === 'string' ? m.description.trim() : '',
        tags: Array.isArray(m.tags)
          ? m.tags.filter((t) => typeof t === 'string' && t.trim()).map((t) => t.trim())
          : [],
        isMilestone: Boolean(m.isMilestone),
        media: normalizeMedia(m.media),
      })
    })
  }

  if (errors.length) return { errors, timeline: null }

  return {
    errors: [],
    timeline: {
      name: name.trim(),
      subtitle:
        typeof raw.subtitle === 'string'
          ? raw.subtitle.trim()
          : typeof raw.timeline?.subtitle === 'string'
            ? raw.timeline.subtitle.trim()
            : '',
      accentColor,
      coverImage: normalizeMedia(raw.coverImage ?? raw.cover?.image),
      moments,
    },
  }
}
