import { useEffect, useState } from 'react'
import { getMedia } from './db'

// Resolves a media id stored in IndexedDB to an object URL, revoking it on
// cleanup so blobs don't leak as cards mount/unmount.
export function useMediaUrl(mediaId) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!mediaId) {
      setUrl(null)
      return
    }
    let objectUrl = null
    let cancelled = false

    getMedia(mediaId).then((blob) => {
      if (cancelled || !blob) return
      objectUrl = URL.createObjectURL(blob)
      setUrl(objectUrl)
    })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [mediaId])

  return url
}
