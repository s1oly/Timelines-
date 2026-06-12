import { motion } from 'framer-motion'
import { useMediaUrl } from '../lib/useMediaUrl.js'

export default function MomentCard({ moment, index, scrollRef, onClick }) {
  const mediaUrl = useMediaUrl(moment.mediaId)

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ root: scrollRef, once: true, amount: 0.15 }}
      transition={{
        duration: 0.55,
        delay: Math.min(index * 0.06, 0.3),
        ease: [0.21, 0.55, 0.3, 1],
      }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group w-full cursor-pointer overflow-hidden rounded-2xl bg-white text-left shadow-md shadow-slate-200/80 ring-1 ring-slate-900/5 transition-shadow hover:shadow-xl hover:shadow-indigo-200/50 dark:bg-slate-900 dark:shadow-slate-950/60 dark:ring-white/10 dark:hover:shadow-indigo-950/60"
    >
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
        <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
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
      </div>
    </motion.button>
  )
}
