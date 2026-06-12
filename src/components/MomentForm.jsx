import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useMediaUrl } from '../lib/useMediaUrl.js'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:focus:border-indigo-500'

export default function MomentForm({ moment, onSave, onClose }) {
  const editing = Boolean(moment)
  const [title, setTitle] = useState(moment?.title ?? '')
  const [date, setDate] = useState(
    moment?.date ?? new Date().toISOString().slice(0, 10)
  )
  const [description, setDescription] = useState(moment?.description ?? '')
  const [mediaFile, setMediaFile] = useState(null)
  const [removeMedia, setRemoveMedia] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [saving, setSaving] = useState(false)

  const existingUrl = useMediaUrl(removeMedia || mediaFile ? null : moment?.mediaId)

  // Preview for a freshly selected file
  useEffect(() => {
    if (!mediaFile) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(mediaFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [mediaFile])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const shownUrl = previewUrl ?? existingUrl
  const shownType = mediaFile
    ? mediaFile.type.startsWith('video/')
      ? 'video'
      : 'image'
    : moment?.mediaType

  const canSave = title.trim() && date && !saving

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    await onSave({
      id: moment?.id,
      title,
      date,
      description,
      mediaFile,
      removeMedia,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:p-8"
    >
      <motion.form
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2 className="text-lg font-bold tracking-tight">
            {editing ? 'Edit Moment' : 'New Moment'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Title
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What happened?"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the story…"
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Photo or video
            </label>

            {shownUrl ? (
              <div className="relative overflow-hidden rounded-xl ring-1 ring-slate-900/10 dark:ring-white/10">
                {shownType === 'video' ? (
                  <video src={shownUrl} controls playsInline className="max-h-56 w-full bg-slate-950 object-contain" />
                ) : (
                  <img src={shownUrl} alt="Preview" className="max-h-56 w-full bg-slate-100 object-contain dark:bg-slate-800" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMediaFile(null)
                    if (moment?.mediaId) setRemoveMedia(true)
                  }}
                  className="absolute right-2 top-2 rounded-lg bg-slate-900/70 p-1.5 text-white backdrop-blur transition-colors hover:bg-red-500"
                  aria-label="Remove media"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-4 py-8 text-center transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:hover:border-indigo-700 dark:hover:bg-indigo-500/5">
                <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.16-5.16a2.25 2.25 0 0 1 3.18 0l5.16 5.16m-1.5-1.5 1.41-1.41a2.25 2.25 0 0 1 3.18 0l2.91 2.91M3.75 19.5h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.01v.01h-.01v-.01Z" />
                </svg>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Click to upload an image or video
                </span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setMediaFile(file)
                      setRemoveMedia(false)
                    }
                  }}
                />
              </label>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all enabled:hover:-translate-y-0.5 enabled:hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Moment'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  )
}
