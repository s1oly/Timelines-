import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

function TimelineItem({ timeline, active, onSelect, onRename, onDuplicate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(timeline.name)

  const commit = () => {
    if (name.trim()) onRename(timeline.id, name)
    else setName(timeline.name)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="px-2 py-1">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') {
              setName(timeline.name)
              setEditing(false)
            }
          }}
          className="w-full rounded-lg border border-indigo-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none ring-2 ring-indigo-500/20 dark:border-indigo-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>
    )
  }

  return (
    <div
      className={`group flex items-center gap-1 rounded-xl px-2 py-1 transition-colors ${
        active
          ? 'bg-indigo-50 dark:bg-indigo-500/10'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
      }`}
    >
      <button
        onClick={() => onSelect(timeline.id)}
        className={`flex-1 truncate rounded-lg px-2 py-2 text-left text-sm font-medium transition-colors ${
          active
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-slate-600 dark:text-slate-300'
        }`}
      >
        <span
          className={`mr-2.5 inline-block h-2 w-2 rounded-full align-middle ${
            active
              ? 'bg-indigo-500'
              : 'bg-slate-300 dark:bg-slate-600'
          }`}
        />
        {timeline.name}
      </button>
      <button
        onClick={() => setEditing(true)}
        title="Rename timeline"
        className="rounded-lg p-1.5 text-slate-400 opacity-0 transition-all hover:bg-slate-200 hover:text-slate-600 group-hover:opacity-100 dark:hover:bg-slate-700 dark:hover:text-slate-200"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.86 4.49 1.69-1.69a1.88 1.88 0 1 1 2.65 2.65L7.83 18.83a4.5 4.5 0 0 1-1.9 1.13L3 20.75l.79-2.93a4.5 4.5 0 0 1 1.13-1.9L16.86 4.49Z" />
        </svg>
      </button>
      <button
        onClick={() => onDuplicate(timeline.id)}
        title="Duplicate timeline"
        className="rounded-lg p-1.5 text-slate-400 opacity-0 transition-all hover:bg-slate-200 hover:text-slate-600 group-hover:opacity-100 dark:hover:bg-slate-700 dark:hover:text-slate-200"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3a1.5 1.5 0 0 1-1.5 1.5h-9a1.5 1.5 0 0 1-1.5-1.5v-9a1.5 1.5 0 0 1 1.5-1.5h3m1.5-4.5h7.5a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5h-7.5a1.5 1.5 0 0 1-1.5-1.5v-7.5a1.5 1.5 0 0 1 1.5-1.5Z" />
        </svg>
      </button>
      <button
        onClick={() => {
          if (window.confirm(`Delete "${timeline.name}" and all its moments?`))
            onDelete(timeline.id)
        }}
        title="Delete timeline"
        className="rounded-lg p-1.5 text-slate-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-500/10"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.35 9m-4.78 0L9.26 9m9.97-3.21c.34.05.68.11 1.02.17m-1.02-.17-1.06 13.74a2.25 2.25 0 0 1-2.24 2.08H8.33a2.25 2.25 0 0 1-2.24-2.08L5.03 5.79m14.2 0a48.1 48.1 0 0 0-3.48-.4m-12.56.57c.34-.06.68-.12 1.02-.17m0 0a48.1 48.1 0 0 1 3.48-.4m7.5 0v-.92c0-1.18-.91-2.16-2.09-2.2a51.96 51.96 0 0 0-3.32 0c-1.18.04-2.09 1.02-2.09 2.2v.92m7.5 0a48.66 48.66 0 0 0-7.5 0" />
        </svg>
      </button>
    </div>
  )
}

function SidebarContent({
  timelines,
  activeId,
  onSelect,
  onCreate,
  onRename,
  onDuplicate,
  onDelete,
  onImport,
  theme,
  onToggleTheme,
}) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  const commitCreate = () => {
    if (newName.trim()) onCreate(newName)
    setNewName('')
    setCreating(false)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 pb-2 pt-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 shadow-lg shadow-indigo-500/30">
          <svg className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" d="M2 12h20" />
            <circle cx="8" cy="12" r="2.5" fill="currentColor" stroke="none" />
            <circle cx="16" cy="12" r="2.5" fill="currentColor" stroke="none" opacity="0.6" />
          </svg>
        </div>
        <h1 className="text-lg font-bold tracking-tight">Timelines</h1>
      </div>

      <p className="px-5 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        Your timelines
      </p>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {timelines.map((t) => (
          <TimelineItem
            key={t.id}
            timeline={t}
            active={t.id === activeId}
            onSelect={onSelect}
            onRename={onRename}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        ))}

        {creating ? (
          <div className="px-2 py-1">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={commitCreate}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitCreate()
                if (e.key === 'Escape') {
                  setNewName('')
                  setCreating(false)
                }
              }}
              placeholder="Timeline name…"
              className="w-full rounded-lg border border-indigo-300 bg-white px-3 py-2 text-sm font-medium outline-none ring-2 ring-indigo-500/20 placeholder:text-slate-400 dark:border-indigo-700 dark:bg-slate-900"
            />
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-indigo-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New timeline
          </button>
        )}

        <button
          onClick={onImport}
          className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-indigo-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
          Import timeline
        </button>
      </nav>

      <div className="border-t border-slate-200/80 p-3 dark:border-slate-800">
        <button
          onClick={onToggleTheme}
          className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
        >
          {theme === 'dark' ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.36.39-1.59 1.59M21 12h-2.25m-.39 6.36-1.59-1.59M12 18.75V21m-4.77-4.23-1.59 1.59M5.25 12H3m4.23-4.77-1.59-1.59M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 15.05A9.72 9.72 0 0 1 18 15.75 9.75 9.75 0 0 1 8.25 6c0-1.33.27-2.6.75-3.75a9.75 9.75 0 1 0 12.75 12.8Z" />
            </svg>
          )}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
    </div>
  )
}

export default function Sidebar(props) {
  const { open, onClose } = props

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-72 shrink-0 border-r border-slate-200/80 bg-white/70 backdrop-blur-xl md:block dark:border-slate-800 dark:bg-slate-900/60">
        <SidebarContent {...props} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl md:hidden dark:bg-slate-900"
            >
              <SidebarContent {...props} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
