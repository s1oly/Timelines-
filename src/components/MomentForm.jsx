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
  const [tags, setTags] = useState(moment?.tags ?? [])
  const [tagDraft, setTagDraft] = useState('')
  const [isMilestone, setIsMilestone] = useState(moment?.isMilestone ?? false)
  const [mediaFile, setMediaFile] = useState(null)
  const [removeMedia, setRemoveMedia] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [saving, setSaving] = useState(false)

  const addTag = (value) => {
    const clean = value.trim().toLowerCase()
    if (clean && !tags.includes(clean)) setTags((t) => [...t, clean])
    setTagDraft('')
  }
  const removeTag = (tag) => setTags((t) => t.filter((x) => x !== tag))

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
      tags,
      isMilestone,
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
              Tags
            </label>
            {tags.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-indigo-50 py-1 pl-3 pr-1.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove ${tag}`}
                      className="rounded-full p-0.5 transition-colors hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault()
                  addTag(tagDraft)
                } else if (e.key === 'Backspace' && !tagDraft && tags.length) {
                  removeTag(tags[tags.length - 1])
                }
              }}
              onBlur={() => tagDraft && addTag(tagDraft)}
              placeholder="Add a tag, press Enter"
              className={inputClass}
            />
          </div>

          <button
            type="button"
            onClick={() => setIsMilestone((v) => !v)}
            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
              isMilestone
                ? 'border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10'
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
            }`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                isMilestone
                  ? 'bg-amber-400 text-white'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
              }`}
            >
              <svg className="h-5 w-5" fill={isMilestone ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.5a.56.56 0 0 1 1.04 0l2.13 4.33 4.78.69c.46.07.64.63.31.95l-3.46 3.37.82 4.76c.08.46-.4.81-.81.59L12 16.95l-4.28 2.25c-.41.22-.89-.13-.81-.59l.82-4.76-3.46-3.37a.56.56 0 0 1 .31-.95l4.78-.69 2.12-4.34Z" />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">Mark as milestone</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                Milestones stand out larger on the timeline
              </span>
            </span>
            <span
              className={`ml-auto flex h-6 w-10 shrink-0 items-center rounded-full px-0.5 transition-colors ${
                isMilestone ? 'bg-amber-400' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  isMilestone ? 'translate-x-4' : ''
                }`}
              />
            </span>
          </button>

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
