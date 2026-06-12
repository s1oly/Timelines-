import { useEffect, useRef, useState } from 'react'
import MomentCard from './MomentCard.jsx'
import { loadScroll, saveScroll } from '../lib/store.js'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia('(max-width: 767px)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const onChange = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return isMobile
}

function EmptyTimeline({ onAddMoment }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10">
        <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" d="M2 12h20" />
          <circle cx="8" cy="12" r="2.5" fill="currentColor" stroke="none" />
          <circle cx="16" cy="12" r="2.5" fill="currentColor" stroke="none" opacity="0.5" />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-bold">This timeline is empty</h3>
        <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Capture your first moment — a memory, a milestone, or anything worth
          remembering.
        </p>
      </div>
      <button
        onClick={onAddMoment}
        className="mt-2 flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 hover:bg-indigo-600"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add your first moment
      </button>
    </div>
  )
}

export default function TimelineView({
  timelineId,
  moments,
  onOpenMoment,
  onAddMoment,
}) {
  const isMobile = useIsMobile()
  const scrollRef = useRef(null)
  const restoredRef = useRef(false)

  // Restore the saved scroll position once the moments are rendered.
  useEffect(() => {
    const el = scrollRef.current
    if (!el || restoredRef.current || moments.length === 0) return
    restoredRef.current = true
    const saved = loadScroll(timelineId)
    if (saved > 0) {
      requestAnimationFrame(() => {
        el.scrollTo({
          left: isMobile ? 0 : saved,
          top: isMobile ? saved : 0,
          behavior: 'instant',
        })
      })
    }
  }, [timelineId, moments.length, isMobile])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let frame = null
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = null
        saveScroll(timelineId, isMobile ? el.scrollTop : el.scrollLeft)
      })
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [timelineId, isMobile])

  if (moments.length === 0) {
    return <EmptyTimeline onAddMoment={onAddMoment} />
  }

  if (isMobile) {
    return (
      <div ref={scrollRef} className="timeline-scroll flex-1 overflow-y-auto">
        <div className="relative mx-auto max-w-lg px-5 py-10">
          {/* Vertical track */}
          <div className="absolute bottom-10 left-[29px] top-10 w-0.5 rounded-full bg-gradient-to-b from-indigo-200 via-indigo-300 to-indigo-200 dark:from-indigo-900 dark:via-indigo-700 dark:to-indigo-900" />
          <div className="space-y-8">
            {moments.map((moment, i) => (
              <div key={moment.id} className="relative pl-12">
                {/* Node */}
                <div className="absolute left-[3px] top-6 h-4 w-4 rounded-full border-[3px] border-indigo-500 bg-white shadow-md shadow-indigo-500/30 dark:bg-slate-950" />
                <MomentCard
                  moment={moment}
                  index={i}
                  scrollRef={scrollRef}
                  onClick={() => onOpenMoment(moment.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      className="timeline-scroll flex flex-1 items-center overflow-x-auto overflow-y-hidden"
    >
      <div className="relative flex min-w-max items-end gap-0 px-16 py-12">
        {/* Horizontal track — sits at the node row (date label 20px + 12px gap + half node 10px) */}
        <div className="absolute bottom-[60px] left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-transparent via-indigo-300 to-transparent dark:via-indigo-700" />
        {moments.map((moment, i) => (
          <div
            key={moment.id}
            className="flex w-[340px] shrink-0 flex-col items-center px-4"
          >
            <MomentCard
              moment={moment}
              index={i}
              scrollRef={scrollRef}
              onClick={() => onOpenMoment(moment.id)}
            />
            {/* Stem connecting card to track */}
            <div className="h-7 w-0.5 bg-gradient-to-b from-transparent to-indigo-300 dark:to-indigo-700" />
            {/* Node on the track */}
            <div className="z-10 h-5 w-5 rounded-full border-[3.5px] border-indigo-500 bg-white shadow-lg shadow-indigo-500/40 transition-transform hover:scale-125 dark:bg-slate-950" />
            <p className="mt-3 h-5 text-xs font-semibold tracking-wide text-slate-400 dark:text-slate-500">
              {new Date(moment.date + 'T00:00:00').toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
