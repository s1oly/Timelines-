import { useEffect, useRef, useState } from 'react'

export default function Header({
  timeline,
  momentCount,
  onOpenSidebar,
  onAddMoment,
  onPresent,
  onExport,
  onExportVideo,
  onToggleSearch,
  searchActive,
  onSettings,
}) {
  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef(null)

  useEffect(() => {
    if (!exportOpen) return
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [exportOpen])

  return (
    <header className="flex items-center gap-3 border-b border-slate-200/80 bg-white/70 px-4 py-4 backdrop-blur-xl sm:px-8 dark:border-slate-800 dark:bg-slate-900/60">
      <button
        onClick={onOpenSidebar}
        className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label="Open timelines menu"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
          {timeline.name}
        </h2>
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
          {momentCount === 0
            ? 'No moments yet'
            : `${momentCount} moment${momentCount === 1 ? '' : 's'}`}
        </p>
      </div>

      <button
        onClick={onToggleSearch}
        title="Search & filter"
        aria-label="Search and filter"
        aria-pressed={searchActive}
        className={`flex shrink-0 items-center justify-center rounded-xl p-2.5 transition-colors ${
          searchActive
            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
            : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400'
        }`}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.2-5.2m1.7-4.05a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Z" />
        </svg>
      </button>

      <button
        onClick={onSettings}
        title="Timeline settings"
        aria-label="Timeline settings"
        className="flex shrink-0 items-center justify-center rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.59 3.94c.09-.54.56-.94 1.11-.94h2.6c.55 0 1.02.4 1.11.94l.21 1.28c.05.32.27.59.56.74.13.06.25.13.37.21.27.16.6.2.89.09l1.21-.49c.51-.2 1.09 0 1.36.48l1.3 2.25c.27.47.16 1.07-.26 1.41l-1.01.82c-.25.21-.38.53-.36.85a4.4 4.4 0 0 1 0 .42c-.02.32.11.64.36.85l1.01.82c.42.34.53.94.26 1.41l-1.3 2.25c-.27.48-.85.68-1.36.48l-1.21-.49c-.29-.11-.62-.07-.89.09-.12.08-.24.15-.37.21-.29.15-.51.42-.56.74l-.21 1.28c-.09.54-.56.94-1.11.94h-2.6c-.55 0-1.02-.4-1.11-.94l-.21-1.28a1 1 0 0 0-.56-.74 4.5 4.5 0 0 1-.37-.21c-.27-.16-.6-.2-.89-.09l-1.21.49c-.51.2-1.09 0-1.36-.48l-1.3-2.25a1.06 1.06 0 0 1 .26-1.41l1.01-.82c.25-.21.38-.53.36-.85a4.4 4.4 0 0 1 0-.42c.02-.32-.11-.64-.36-.85l-1.01-.82a1.06 1.06 0 0 1-.26-1.41l1.3-2.25c.27-.48.85-.68 1.36-.48l1.21.49c.29.11.62.07.89-.09.12-.08.24-.15.37-.21.29-.15.51-.42.56-.74l.21-1.28Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      {momentCount > 0 && (
        <>
          <button
            onClick={onPresent}
            title="Present timeline"
            aria-label="Present timeline"
            className="flex shrink-0 items-center justify-center rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.65c0-.86.96-1.37 1.67-.88l11.54 8.1a1 1 0 0 1 0 1.64l-11.54 8.1a1.07 1.07 0 0 1-1.67-.88V5.65Z" />
            </svg>
          </button>
          <div ref={exportRef} className="relative shrink-0">
            <button
              onClick={() => setExportOpen((v) => !v)}
              title="Download timeline"
              aria-label="Download timeline"
              aria-expanded={exportOpen}
              className={`flex items-center justify-center rounded-xl p-2.5 transition-colors ${
                exportOpen
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-6L12 15m0 0 4.5-4.5M12 15V3" />
              </svg>
            </button>

            {exportOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <button
                  onClick={() => { onExport(); setExportOpen(false) }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  Download as JSON
                </button>
                <div className="mx-4 h-px bg-slate-100 dark:bg-slate-800" />
                <button
                  onClick={() => { onExportVideo(); setExportOpen(false) }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  Download as Video
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <button
        onClick={onAddMoment}
        className="flex shrink-0 items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-500/30 active:translate-y-0"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <span className="hidden sm:inline">Add Moment</span>
        <span className="sm:hidden">Add</span>
      </button>
    </header>
  )
}
