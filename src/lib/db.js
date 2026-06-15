import { openDB } from 'idb'

// Media blobs (images/videos) live in IndexedDB so large files survive
// refreshes without blowing past localStorage quotas.
const dbPromise = openDB('timelines-media', 1, {
  upgrade(db) {
    db.createObjectStore('media')
  },
})

export async function putMedia(id, blob) {
  const db = await dbPromise
  await db.put('media', blob, id)
}

export async function getMedia(id) {
  const db = await dbPromise
  return db.get('media', id)
}

export async function deleteMedia(id) {
  if (!id) return
  const db = await dbPromise
  await db.delete('media', id)
}

// Copy an existing media blob to a fresh id (used when duplicating a
// timeline). Returns the new id, or null when there is nothing to copy.
export async function copyMedia(srcId, newId) {
  if (!srcId) return null
  const db = await dbPromise
  const blob = await db.get('media', srcId)
  if (!blob) return null
  await db.put('media', blob, newId)
  return newId
}
