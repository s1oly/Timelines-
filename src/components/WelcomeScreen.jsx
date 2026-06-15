import { useState } from 'react'
import { motion } from 'framer-motion'

export default function WelcomeScreen({ onCreate, onOpenSidebar, onImport }) {
  const [name, setName] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (name.trim()) onCreate(name)
  }

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center p-6">
      <button
        onClick={onOpenSidebar}
        className="absolute left-4 top-4 rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label="Open timelines menu"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.21, 0.55, 0.3, 1] }}
        className="w-full max-w-md text-center"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500 shadow-xl shadow-indigo-500/30">
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" d="M2 12h20" />
            <circle cx="8" cy="12" r="2.5" fill="currentColor" stroke="none" />
            <circle cx="16" cy="12" r="2.5" fill="currentColor" stroke="none" opacity="0.6" />
          </svg>
        </div>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
          Welcome to Timelines
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-slate-500 dark:text-slate-400">
          Capture life's moments and arrange them into beautiful visual
          timelines. Create your first one to get started.
        </p>

        <form onSubmit={submit} className="mt-8 flex gap-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g. "My Life", "Travel", "Work Journey"'
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="shrink-0 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all enabled:hover:-translate-y-0.5 enabled:hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Create
          </button>
        </form>

        <button
          onClick={onImport}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
          or import a timeline from JSON
        </button>
      </motion.div>
    </div>
  )
}
