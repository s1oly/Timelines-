import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { parseTimelineFile } from '../lib/importTimeline.js'

export default function ImportModal({ onClose, onImport }) {
  const [parsing, setParsing] = useState(false)
  const [errors, setErrors] = useState([])
  const [timeline, setTimeline] = useState(null)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleFile = async (file) => {
    if (!file) return
    setParsing(true)
    setErrors([])
    setTimeline(null)
    const result = await parseTimelineFile(file)
    setParsing(false)
    if (result.errors.length) setErrors(result.errors)
    else setTimeline(result.timeline)
  }

  const confirm = async () => {
    if (!timeline) return
    setImporting(true)
    await onImport(timeline)
  }

  const reset = () => {
    setErrors([])
    setTimeline(null)
  }

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
        className="flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2 className="text-lg font-bold tracking-tight">Import timeline</h2>
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

        <div className="overflow-y-auto px-6 py-5">
          {/* Step 1: pick a file */}
          {!timeline && (
            <>
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-4 py-10 text-center transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:hover:border-indigo-700 dark:hover:bg-indigo-500/5">
                <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {parsing ? 'Reading file…' : 'Choose a .json timeline file'}
                </span>
                <input
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </label>

              {errors.length > 0 && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
                  <p className="mb-2 text-sm font-semibold text-red-600 dark:text-red-400">
                    This file can't be imported:
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-xs text-red-600/90 dark:text-red-400/90">
                    {errors.slice(0, 8).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {errors.length > 8 && <li>…and {errors.length - 8} more.</li>}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* Step 2: preview */}
          {timeline && (
            <div>
              <div className="flex items-center gap-3">
                <span
                  className="h-9 w-9 shrink-0 rounded-lg"
                  style={{ backgroundColor: timeline.accentColor }}
                />
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold">{timeline.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {timeline.moments.length} moment
                    {timeline.moments.length === 1 ? '' : 's'}
                    {timeline.coverImage ? ' · cover image' : ''}
                  </p>
                </div>
              </div>

              <div className="mt-4 max-h-64 space-y-1.5 overflow-y-auto rounded-xl border border-slate-100 p-2 dark:border-slate-800">
                {timeline.moments.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <span className="w-24 shrink-0 text-xs font-semibold text-slate-400">
                      {m.date}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {m.title}
                    </span>
                    {m.isMilestone && (
                      <svg className="h-3.5 w-3.5 shrink-0 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.48 3.5a.56.56 0 0 1 1.04 0l2.13 4.33 4.78.69c.46.07.64.63.31.95l-3.46 3.37.82 4.76c.08.46-.4.81-.81.59L12 16.95l-4.28 2.25c-.41.22-.89-.13-.81-.59l.82-4.76-3.46-3.37a.56.56 0 0 1 .31-.95l4.78-.69 2.12-4.34Z" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {timeline && (
          <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
            <button
              type="button"
              onClick={reset}
              disabled={importing}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Choose another
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={importing}
              className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all enabled:hover:-translate-y-0.5 enabled:hover:bg-indigo-600 disabled:opacity-40"
            >
              {importing ? 'Importing…' : 'Import timeline'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
