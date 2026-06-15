import { motion } from 'framer-motion'

const fieldClass =
  'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:focus:border-indigo-500'

export default function SearchBar({
  filters,
  onChange,
  availableTags,
  resultCount,
  totalCount,
  hasFilter,
  onClear,
}) {
  const toggleTag = (tag) => {
    const tags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag]
    onChange({ tags })
  }

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden border-b border-slate-200/80 bg-white/70 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/60"
    >
      <div className="flex flex-col gap-3 px-4 py-3 sm:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.2-5.2m1.7-4.05a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Z" />
            </svg>
            <input
              autoFocus
              value={filters.q}
              onChange={(e) => onChange({ q: e.target.value })}
              placeholder="Search title and description…"
              className={`${fieldClass} w-full pl-9`}
            />
          </div>

          <input
            type="date"
            value={filters.start}
            onChange={(e) => onChange({ start: e.target.value })}
            aria-label="From date"
            className={fieldClass}
          />
          <span className="text-sm text-slate-400">–</span>
          <input
            type="date"
            value={filters.end}
            onChange={(e) => onChange({ end: e.target.value })}
            aria-label="To date"
            className={fieldClass}
          />

          {/* Scope toggle */}
          <div className="flex overflow-hidden rounded-lg border border-slate-200 text-xs font-semibold dark:border-slate-700">
            {[
              ['active', 'This timeline'],
              ['all', 'All timelines'],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => onChange({ scope: value })}
                className={`px-3 py-2 transition-colors ${
                  filters.scope === value
                    ? 'bg-indigo-500 text-white'
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {availableTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {availableTags.map((tag) => {
              const active = filters.tags.includes(tag)
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  #{tag}
                </button>
              )
            })}
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {hasFilter
              ? `${resultCount} of ${totalCount} moment${totalCount === 1 ? '' : 's'}`
              : `${totalCount} moment${totalCount === 1 ? '' : 's'}`}
          </p>
          {hasFilter && (
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              Clear filters
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
