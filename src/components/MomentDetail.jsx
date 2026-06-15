import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useMediaUrl } from '../lib/useMediaUrl.js'
import { DEFAULT_ACCENT, accentAlpha } from '../lib/accent.js'

export default function MomentDetail({
  moment,
  onEdit,
  onDelete,
  onClose,
  accent = DEFAULT_ACCENT,
}) {
  const mediaUrl = useMediaUrl(moment.mediaId)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:p-8"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
      >
        {moment.mediaId && mediaUrl && (
          <div className="max-h-[55vh] shrink-0 overflow-hidden bg-slate-950">
            {moment.mediaType === 'video' ? (
              <video
                src={mediaUrl}
                controls
                autoPlay
                playsInline
                className="mx-auto max-h-[55vh] w-full object-contain"
              />
            ) : (
              <img
                src={mediaUrl}
                alt={moment.title}
                className="mx-auto max-h-[55vh] w-full object-contain"
              />
            )}
          </div>
        )}

        <div className="overflow-y-auto p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>
                  {new Date(moment.date + 'T00:00:00').toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                {moment.isMilestone && (
                  <span
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                    style={{ backgroundColor: accent }}
                  >
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.48 3.5a.56.56 0 0 1 1.04 0l2.13 4.33 4.78.69c.46.07.64.63.31.95l-3.46 3.37.82 4.76c.08.46-.4.81-.81.59L12 16.95l-4.28 2.25c-.41.22-.89-.13-.81-.59l.82-4.76-3.46-3.37a.56.56 0 0 1 .31-.95l4.78-.69 2.12-4.34Z" />
                    </svg>
                    Milestone
                  </span>
                )}
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                {moment.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {moment.description && (
            <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
              {moment.description}
            </p>
          )}

          {moment.tags?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {moment.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: accentAlpha(accent, 12), color: accent }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8 flex items-center gap-3">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:bg-indigo-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.86 4.49 1.69-1.69a1.88 1.88 0 1 1 2.65 2.65L7.83 18.83a4.5 4.5 0 0 1-1.9 1.13L3 20.75l.79-2.93a4.5 4.5 0 0 1 1.13-1.9L16.86 4.49Z" />
              </svg>
              Edit
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Delete "${moment.title}"?`)) onDelete()
              }}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.35 9m-4.78 0L9.26 9m9.97-3.21c.34.05.68.11 1.02.17m-1.02-.17-1.06 13.74a2.25 2.25 0 0 1-2.24 2.08H8.33a2.25 2.25 0 0 1-2.24-2.08L5.03 5.79m14.2 0a48.1 48.1 0 0 0-3.48-.4m-12.56.57c.34-.06.68-.12 1.02-.17m0 0a48.1 48.1 0 0 1 3.48-.4m7.5 0v-.92c0-1.18-.91-2.16-2.09-2.2a51.96 51.96 0 0 0-3.32 0c-1.18.04-2.09 1.02-2.09 2.2v.92m7.5 0a48.66 48.66 0 0 0-7.5 0" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
