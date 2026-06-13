import { getMedia } from './db.js'

// Read a Blob as a base64 data URL so media can be embedded inline in the
// exported JSON, making the file fully self-contained.
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

const slugify = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'timeline'

// Bundle a timeline's metadata and all its moments (with media inlined as
// base64) into a single JSON file and trigger a download.
export async function exportTimeline(timeline, moments) {
  const exportedMoments = await Promise.all(
    moments.map(async ({ mediaId, ...rest }) => {
      let media = null
      if (mediaId) {
        const blob = await getMedia(mediaId)
        if (blob) {
          media = { type: blob.type, dataUrl: await blobToDataUrl(blob) }
        }
      }
      return { ...rest, media }
    })
  )

  const payload = {
    format: 'timelines-export',
    version: 1,
    exportedAt: new Date().toISOString(),
    timeline: { name: timeline.name, createdAt: timeline.createdAt },
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
