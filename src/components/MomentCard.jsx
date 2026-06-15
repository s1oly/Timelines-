import { motion } from 'framer-motion'
import { useMediaUrl } from '../lib/useMediaUrl.js'
import { DEFAULT_ACCENT, accentAlpha } from '../lib/accent.js'

export default function MomentCard({
  moment,
  index,
  scrollRef,
  onClick,
  accent = DEFAULT_ACCENT,
  dimmed = false,
}) {
  const mediaUrl = useMediaUrl(moment.mediaId)
  const milestone = Boolean(moment.isMilestone)

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: dimmed ? 0.25 : 1, y: 0 }}
      viewport={{ root: scrollRef, once: true, amount: 0.15 }}
      animate={{ opacity: dimmed ? 0.25 : 1 }}
      transition={{
        duration: 0.55,
        delay: Math.min(index * 0.06, 0.3),
        ease: [0.21, 0.55, 0.3, 1],
      }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      style={
        milestone
          ? {
              borderColor: accent,
              boxShadow: `0 0 0 1px ${accent}, 0 18px 40px -12px ${accentAlpha(accent, 55)}`,
            }
          : undefined
      }
      className={`group relative w-full cursor-pointer overflow-hidden rounded-2xl text-left transition-shadow ${
        milestone
          ? 'border-2 bg-white dark:bg-slate-900'
          : 'bg-white shadow-md shadow-slate-200/80 ring-1 ring-slate-900/5 hover:shadow-xl hover:shadow-indigo-200/50 dark:bg-slate-900 dark:shadow-slate-950/60 dark:ring-white/10 dark:hover:shadow-indigo-950/60'
      }`}
    >
      {milestone && (
        <div
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-lg"
          style={{ backgroundColor: accent }}
          title="Milestone"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.48 3.5a.56.56 0 0 1 1.04 0l2.13 4.33 4.78.69c.46.07.64.63.31.95l-3.46 3.37.82 4.76c.08.46-.4.81-.81.59L12 16.95l-4.28 2.25c-.41.22-.89-.13-.81-.59l.82-4.76-3.46-3.37a.56.56 0 0 1 .31-.95l4.78-.69 2.12-4.34Z" />
          </svg>
        </div>
      )}

      {moment.mediaId && (
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          {mediaUrl ? (
            moment.mediaType === 'video' ? (
              <>
                <video
                  src={mediaUrl}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85 shadow-lg backdrop-blur transition-transform group-hover:scale-110">
                    <svg className="ml-0.5 h-4 w-4 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5.14v13.72c0 .9.98 1.45 1.74.98l10.4-6.86a1.15 1.15 0 0 0 0-1.96L9.74 4.16A1.15 1.15 0 0 0 8 5.14Z" />
                    </svg>
                  </div>
                </div>
              </>
            ) : (
              <img
                src={mediaUrl}
                alt={moment.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            )
          ) : (
            <div className="h-full w-full animate-pulse bg-slate-200 dark:bg-slate-800" />
          )}
        </div>
      )}

      <div className="p-5">
        <p
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: accent }}
        >
          {new Date(moment.date + 'T00:00:00').toLocaleDateString(undefined, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
        <h3 className="mt-1.5 line-clamp-2 text-base font-bold leading-snug tracking-tight">
          {moment.title}
        </h3>
        {moment.description && (
          <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {moment.description}
          </p>
        )}
        {moment.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {moment.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                style={{ backgroundColor: accentAlpha(accent, 12), color: accent }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.button>
  )
}
