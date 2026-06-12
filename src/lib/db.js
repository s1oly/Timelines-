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
