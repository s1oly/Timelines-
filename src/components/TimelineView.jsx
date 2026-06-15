import { useEffect, useRef, useState } from 'react'
import MomentCard from './MomentCard.jsx'
import TimelineCover from './TimelineCover.jsx'
import { loadScroll, saveScroll } from '../lib/store.js'
import { DEFAULT_ACCENT, accentAlpha } from '../lib/accent.js'

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

function NoResults() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <svg className="h-10 w-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.2-5.2m1.7-4.05a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Z" />
      </svg>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        No moments match your filters.
      </p>
    </div>
  )
}

export default function TimelineView({
  timeline,
  timelineId,
  moments,
  matchIds,
  hasFilter = false,
  showCover = true,
  onOpenMoment,
  onAddMoment,
}) {
  const isMobile = useIsMobile()
  const scrollRef = useRef(null)
  const restoredRef = useRef(false)
  const accent = timeline?.accentColor ?? DEFAULT_ACCENT

  const isDimmed = (m) => hasFilter && matchIds && !matchIds.has(m.id)
  const allDimmed = hasFilter && moments.every(isDimmed)

  const coverConfigured =
    showCover && (timeline?.cover?.mediaId || timeline?.cover?.subtitle)

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

  if (allDimmed) {
    return <NoResults />
  }

  if (isMobile) {
    return (
      <div ref={scrollRef} className="timeline-scroll flex-1 overflow-y-auto">
        <div className="relative mx-auto max-w-lg px-5 py-10">
          {coverConfigured && (
            <div className="mb-8">
              <TimelineCover timeline={timeline} moments={moments} variant="card" />
            </div>
          )}
          {/* Vertical track */}
          <div
            className="absolute bottom-10 left-[29px] w-0.5 rounded-full"
            style={{
              top: coverConfigured ? 488 : 40,
              background: `linear-gradient(to bottom, ${accentAlpha(accent, 35)}, ${accent}, ${accentAlpha(accent, 35)})`,
            }}
          />
          <div className="space-y-8">
            {moments.map((moment, i) => {
              const a = moment.accentColor ?? accent
              const milestone = Boolean(moment.isMilestone)
              return (
                <div key={moment.id} className="relative pl-12">
                  {/* Node */}
                  <div
                    className="absolute top-6 rounded-full border-[3px] bg-white shadow-md dark:bg-slate-950"
                    style={{
                      left: milestone ? '-1px' : '3px',
                      height: milestone ? 22 : 16,
                      width: milestone ? 22 : 16,
                      borderColor: a,
                      boxShadow: `0 4px 10px -2px ${accentAlpha(a, 50)}`,
                    }}
                  />
                  <MomentCard
                    moment={moment}
                    index={i}
                    scrollRef={scrollRef}
                    accent={a}
                    dimmed={isDimmed(moment)}
                    onClick={() => onOpenMoment(moment.id)}
                  />
                </div>
              )
            })}
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
        {/* Horizontal track */}
        <div
          className="absolute bottom-[60px] left-0 right-0 h-0.5 rounded-full"
          style={{
            background: `linear-gradient(to right, transparent, ${accentAlpha(accent, 60)}, transparent)`,
          }}
        />

        {coverConfigured && (
          <div className="mr-4 flex flex-col items-center self-center pb-[76px]">
            <TimelineCover timeline={timeline} moments={moments} variant="card" />
          </div>
        )}

        {moments.map((moment, i) => {
          const a = moment.accentColor ?? accent
          const milestone = Boolean(moment.isMilestone)
          return (
            <div
              key={moment.id}
              className={`flex shrink-0 flex-col items-center px-4 ${
                milestone ? 'w-[380px]' : 'w-[340px]'
              }`}
              style={milestone ? { marginBottom: 24 } : undefined}
            >
              <MomentCard
                moment={moment}
                index={i}
                scrollRef={scrollRef}
                accent={a}
                dimmed={isDimmed(moment)}
                onClick={() => onOpenMoment(moment.id)}
              />
              {/* Stem connecting card to track */}
              <div
                className="w-0.5"
                style={{
                  height: milestone ? 52 : 28,
                  background: `linear-gradient(to bottom, transparent, ${accentAlpha(a, 60)})`,
                }}
              />
              {/* Node on the track */}
              <div
                className="z-10 rounded-full border-[3.5px] bg-white transition-transform hover:scale-125 dark:bg-slate-950"
                style={{
                  height: milestone ? 24 : 20,
                  width: milestone ? 24 : 20,
                  borderColor: a,
                  boxShadow: `0 6px 14px -2px ${accentAlpha(a, 55)}`,
                }}
              />
              <p className="mt-3 h-5 text-xs font-semibold tracking-wide text-slate-400 dark:text-slate-500">
                {new Date(moment.date + 'T00:00:00').toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
