import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMediaUrl } from '../lib/useMediaUrl.js'
import TimelineCover from './TimelineCover.jsx'
import { DEFAULT_ACCENT } from '../lib/accent.js'

// Slide + crossfade transition. `direction` is +1 when advancing, -1 when
// going back, so a slide enters from the side it's travelling toward.
const slideVariants = {
  enter: (dir) => ({ x: dir >= 0 ? 64 : -64, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir >= 0 ? -64 : 64, opacity: 0 }),
}

// Milestone moments zoom in for a more dramatic reveal.
const milestoneVariants = {
  enter: { scale: 0.8, opacity: 0 },
  center: { scale: 1, opacity: 1 },
  exit: { scale: 1.08, opacity: 0 },
}

function SlideMedia({ moment }) {
  const url = useMediaUrl(moment.mediaId)
  if (!moment.mediaId) return null

  if (!url) {
    return <div className="h-full w-full animate-pulse rounded-2xl bg-white/5" />
  }

  return moment.mediaType === 'video' ? (
    <video
      key={moment.id}
      src={url}
      controls
      autoPlay
      playsInline
      className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl shadow-black/50"
    />
  ) : (
    <img
      src={url}
      alt={moment.title}
      className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl shadow-black/50"
    />
  )
}

function MomentSlide({ moment, direction, accent }) {
  const milestone = Boolean(moment.isMilestone)
  return (
    <motion.div
      key={moment.id}
      custom={direction}
      variants={milestone ? milestoneVariants : slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        duration: milestone ? 0.6 : 0.5,
        ease: [0.22, 0.61, 0.36, 1],
      }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 pb-28 pt-16 sm:px-16"
    >
      {moment.mediaId && (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <SlideMedia moment={moment} />
        </div>
      )}

      <div
        className={`w-full max-w-3xl text-center ${
          moment.mediaId ? 'shrink-0' : 'flex flex-1 flex-col justify-center'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>
            {new Date(moment.date + 'T00:00:00').toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          {milestone && (
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
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {moment.title}
        </h2>
        {moment.description && (
          <p className="mx-auto mt-4 max-w-2xl whitespace-pre-wrap text-base leading-relaxed text-slate-300 sm:text-lg">
            {moment.description}
          </p>
        )}
        {moment.tags?.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {moment.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function CoverSlide({ timeline, moments }) {
  return (
    <motion.div
      key="cover"
      initial={{ opacity: 0, scale: 1.06 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
      className="absolute inset-0"
    >
      <TimelineCover timeline={timeline} moments={moments} variant="slide" />
    </motion.div>
  )
}

function HelpOverlay({ onClose }) {
  const rows = [
    ['→  ↓  Space', 'Next'],
    ['←  ↑', 'Previous'],
    ['Swipe', 'Navigate (mobile)'],
    ['?', 'Toggle this help'],
    ['Esc', 'Exit presentation'],
  ]
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-slate-900 p-6 ring-1 ring-white/10"
      >
        <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-indigo-400">
          Keyboard & gestures
        </h3>
        <dl className="space-y-3">
          {rows.map(([key, label]) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <dt className="rounded-lg bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200">
                {key}
              </dt>
              <dd className="text-sm text-slate-400">{label}</dd>
            </div>
          ))}
        </dl>
      </motion.div>
    </motion.div>
  )
}

export default function PresentationMode({ timeline, moments, onClose }) {
  const accent = timeline?.accentColor ?? DEFAULT_ACCENT
  // Slide 0 is always the cover; moments follow.
  const total = moments.length + 1
  const [[index, direction], setState] = useState([0, 0])
  const [showHelp, setShowHelp] = useState(false)
  const containerRef = useRef(null)
  const touchStartX = useRef(null)

  const paginate = useCallback(
    (dir) => {
      setState(([i]) => {
        const next = i + dir
        if (next < 0 || next >= total) return [i, 0]
        return [next, dir]
      })
    },
    [total]
  )

  useEffect(() => {
    const el = containerRef.current
    el?.requestFullscreen?.().catch(() => {})

    const onFsChange = () => {
      if (!document.fullscreenElement) onClose()
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange)
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
    }
  }, [onClose])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        paginate(1)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        paginate(-1)
      } else if (e.key === '?') {
        setShowHelp((h) => !h)
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [paginate, onClose])

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) paginate(dx < 0 ? 1 : -1)
    touchStartX.current = null
  }

  const atStart = index === 0
  const atEnd = index === total - 1
  const moment = index > 0 ? moments[index - 1] : null

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="fixed inset-0 z-[60] select-none overflow-hidden bg-slate-950"
    >
      {/* Top progress bar */}
      <div className="absolute inset-x-0 top-0 z-20 h-1 bg-white/5">
        <motion.div
          className="h-full"
          style={{ backgroundColor: accent }}
          initial={false}
          animate={{ width: `${((index + 1) / total) * 100}%` }}
          transition={{ ease: 'easeOut', duration: 0.4 }}
        />
      </div>

      {/* Top controls */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
        <span className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold tabular-nums text-slate-300">
          {index + 1} / {total}
        </span>
        <button
          onClick={() => setShowHelp((h) => !h)}
          aria-label="Keyboard shortcuts"
          className="rounded-lg bg-white/5 p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 9a2.25 2.25 0 1 1 3.4 1.93c-.7.43-1.28 1.1-1.28 1.92v.4m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </button>
        <button
          onClick={onClose}
          aria-label="Exit presentation"
          className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
          Exit
        </button>
      </div>

      {/* Slides */}
      <AnimatePresence custom={direction} mode="popLayout">
        {moment ? (
          <MomentSlide key={moment.id} moment={moment} direction={direction} accent={accent} />
        ) : (
          <CoverSlide key="cover" timeline={timeline} moments={moments} />
        )}
      </AnimatePresence>

      {/* Side navigation arrows (desktop) */}
      <button
        onClick={() => paginate(-1)}
        disabled={atStart}
        aria-label="Previous"
        className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/5 p-3 text-white transition-all hover:bg-white/10 disabled:pointer-events-none disabled:opacity-0 sm:block"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        onClick={() => paginate(1)}
        disabled={atEnd}
        aria-label="Next"
        className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/5 p-3 text-white transition-all hover:bg-white/10 disabled:pointer-events-none disabled:opacity-0 sm:block"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Progress dots */}
      <div className="absolute inset-x-0 bottom-6 z-20 flex items-center justify-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => setState(([cur]) => [i, i > cur ? 1 : -1])}
            aria-label={`Go to slide ${i + 1}`}
            className="h-2 rounded-full transition-all"
            style={
              i === index
                ? { width: 24, backgroundColor: accent }
                : { width: 8, backgroundColor: 'rgb(255 255 255 / 0.25)' }
            }
          />
        ))}
      </div>

      <AnimatePresence>
        {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}
