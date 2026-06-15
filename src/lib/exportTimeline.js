import { getMedia } from './db.js'
import { blobToDataUrl } from './media.js'
import { DEFAULT_ACCENT } from './accent.js'

const slugify = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'timeline'

// Bundle a timeline's metadata and all its moments (with media inlined as
// base64 data URLs) into a single self-contained JSON file following the
// Chronos Timeline Schema, then trigger a download. The output round-trips
// back through importTimeline.
export async function exportTimeline(timeline, moments) {
  const exportedMoments = await Promise.all(
    moments.map(async (m) => {
      let media = null
      if (m.mediaId) {
        const blob = await getMedia(m.mediaId)
        if (blob) media = await blobToDataUrl(blob)
      }
      return {
        title: m.title,
        date: m.date,
        description: m.description,
        tags: m.tags ?? [],
        isMilestone: Boolean(m.isMilestone),
        media,
      }
    })
  )

  let coverImage = null
  if (timeline.cover?.mediaId) {
    const blob = await getMedia(timeline.cover.mediaId)
    if (blob) coverImage = await blobToDataUrl(blob)
  }

  const payload = {
    format: 'chronos-timeline',
    version: 1,
    exportedAt: new Date().toISOString(),
    timelineName: timeline.name,
    subtitle: timeline.cover?.subtitle ?? '',
    accentColor: timeline.accentColor ?? DEFAULT_ACCENT,
    coverImage,
    moments: exportedMoments,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${slugify(timeline.name)}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
