import { useMediaUrl } from '../lib/useMediaUrl.js'
import { DEFAULT_ACCENT, accentAlpha } from '../lib/accent.js'

// Format the span of a timeline (earliest → latest moment) for the cover.
function formatRange(moments) {
  if (!moments.length) return null
  const dates = moments.map((m) => m.date).sort()
  const fmt = (d) =>
    new Date(d + 'T00:00:00').toLocaleDateString(undefined, {
      month: 'short',
      year: 'numeric',
    })
  const start = fmt(dates[0])
  const end = fmt(dates[dates.length - 1])
  return start === end ? start : `${start} – ${end}`
}

// The timeline's hero cover. Rendered as a tall intro card at the head of the
// track (variant="card") and as the opening slide in Presentation Mode
// (variant="slide").
export default function TimelineCover({ timeline, moments, variant = 'card' }) {
  const accent = timeline.accentColor ?? DEFAULT_ACCENT
  const coverUrl = useMediaUrl(timeline.cover?.mediaId)
  const subtitle = timeline.cover?.subtitle
  const range = formatRange(moments)
  const slide = variant === 'slide'

  return (
    <div
      className={
        slide
          ? 'relative flex h-full w-full items-center justify-center overflow-hidden'
          : 'relative flex h-[440px] w-[360px] shrink-0 flex-col justify-end overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-900/10 dark:ring-white/10'
      }
      style={{
        backgroundColor: coverUrl ? '#0f172a' : accentAlpha(accent, 18),
      }}
    >
      {coverUrl ? (
        <img
          src={coverUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(150deg, ${accentAlpha(accent, 35)}, transparent 60%)`,
          }}
        />
      )}

      {/* Gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

      <div
        className={`relative ${slide ? 'mx-auto max-w-3xl px-8 text-center' : 'p-7'}`}
      >
        <span
          className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white ${slide ? 'mb-5' : 'mb-3'}`}
          style={{ backgroundColor: accent }}
        >
          Timeline
        </span>
        <h1
          className={`font-extrabold tracking-tight text-white ${
            slide ? 'text-5xl sm:text-7xl' : 'text-3xl leading-tight'
          }`}
        >
          {timeline.name}
        </h1>
        {subtitle && (
          <p
            className={`mt-3 text-slate-200 ${slide ? 'mx-auto max-w-xl text-lg sm:text-xl' : 'text-sm'}`}
          >
            {subtitle}
          </p>
        )}
        {range && (
          <p
            className={`mt-3 font-semibold uppercase tracking-widest text-white/70 ${slide ? 'text-sm' : 'text-xs'}`}
          >
            {range} · {moments.length} moment{moments.length === 1 ? '' : 's'}
          </p>
        )}
      </div>
    </div>
  )
}
