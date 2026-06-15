// Shared helpers for moving media between Blobs (IndexedDB) and the base64
// data-URL strings used by the import/export JSON schema.

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

// Turn a "base64-or-url" string from an imported timeline into a Blob.
// Data URLs are decoded locally; remote URLs are fetched (best-effort — a
// CORS failure simply means the moment is imported without its media).
export async function mediaStringToBlob(value) {
  if (!value || typeof value !== 'string') return null
  try {
    const res = await fetch(value)
    return await res.blob()
  } catch {
    return null
  }
}
