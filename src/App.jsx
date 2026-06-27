import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import TimelineView from './components/TimelineView.jsx'
import MomentForm from './components/MomentForm.jsx'
import MomentDetail from './components/MomentDetail.jsx'
import WelcomeScreen from './components/WelcomeScreen.jsx'
import PresentationMode from './components/PresentationMode.jsx'
import SearchBar from './components/SearchBar.jsx'
import TimelineSettings from './components/TimelineSettings.jsx'
import ImportModal from './components/ImportModal.jsx'
import { copyMedia, deleteMedia, putMedia } from './lib/db.js'
import { mediaStringToBlob } from './lib/media.js'
import { exportTimeline } from './lib/exportTimeline.js'
import { exportVideo } from './lib/exportVideo.js'
import { DEFAULT_ACCENT } from './lib/accent.js'
import {
  clearScroll,
  loadActiveId,
  loadData,
  loadTheme,
  saveActiveId,
  saveData,
  saveTheme,
  uid,
} from './lib/store.js'

const EMPTY_FILTERS = { q: '', start: '', end: '', tags: [], scope: 'active' }

export default function App() {
  const [data, setData] = useState(loadData)
  const [activeId, setActiveId] = useState(() => {
    const stored = loadActiveId()
    const { timelines } = loadData()
    if (stored && timelines.some((t) => t.id === stored)) return stored
    return timelines[0]?.id ?? null
  })
  const [theme, setTheme] = useState(loadTheme)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [formState, setFormState] = useState(null) // { moment? } — open when truthy
  const [detailId, setDetailId] = useState(null)
  const [presenting, setPresenting] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [videoProgress, setVideoProgress] = useState(null)

  useEffect(() => saveData(data), [data])
  useEffect(() => saveActiveId(activeId), [activeId])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    saveTheme(theme)
  }, [theme])

  const activeTimeline = useMemo(
    () => data.timelines.find((t) => t.id === activeId) ?? null,
    [data.timelines, activeId]
  )

  // Active-timeline moments (sorted) — used for present/export.
  const moments = useMemo(() => {
    const list = data.moments[activeId] ?? []
    return [...list].sort((a, b) => a.date.localeCompare(b.date))
  }, [data.moments, activeId])

  // The set of moments the timeline view renders, depending on filter scope.
  // In "all" scope every moment is annotated with its owning timeline.
  const scopeMoments = useMemo(() => {
    if (filters.scope === 'all') {
      const all = []
      data.timelines.forEach((t) => {
        ;(data.moments[t.id] ?? []).forEach((m) =>
          all.push({
            ...m,
            timelineId: t.id,
            timelineName: t.name,
            accentColor: t.accentColor ?? DEFAULT_ACCENT,
          })
        )
      })
      return all.sort((a, b) => a.date.localeCompare(b.date))
    }
    return (data.moments[activeId] ?? [])
      .map((m) => ({ ...m, timelineId: activeId }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [data, activeId, filters.scope])

  const availableTags = useMemo(() => {
    const set = new Set()
    scopeMoments.forEach((m) => (m.tags ?? []).forEach((t) => set.add(t)))
    return [...set].sort()
  }, [scopeMoments])

  const hasFilter = Boolean(
    filters.q || filters.start || filters.end || filters.tags.length
  )

  const matchIds = useMemo(() => {
    if (!hasFilter) return null
    const q = filters.q.trim().toLowerCase()
    const ids = new Set()
    scopeMoments.forEach((m) => {
      if (q && !`${m.title} ${m.description}`.toLowerCase().includes(q)) return
      if (filters.start && m.date < filters.start) return
      if (filters.end && m.date > filters.end) return
      if (
        filters.tags.length &&
        !filters.tags.some((t) => (m.tags ?? []).includes(t))
      )
        return
      ids.add(m.id)
    })
    return ids
  }, [scopeMoments, filters, hasFilter])

  // Resolve any moment id to its owning timeline (needed when editing in
  // cross-timeline "all" scope).
  const findOwner = useCallback(
    (id) => {
      for (const t of data.timelines) {
        if ((data.moments[t.id] ?? []).some((m) => m.id === id)) return t.id
      }
      return null
    },
    [data]
  )

  const detailMoment = useMemo(() => {
    if (!detailId) return null
    for (const t of data.timelines) {
      const found = (data.moments[t.id] ?? []).find((m) => m.id === detailId)
      if (found)
        return { ...found, accentColor: t.accentColor ?? DEFAULT_ACCENT }
    }
    return null
  }, [data, detailId])

  const createTimeline = useCallback((name) => {
    const timeline = {
      id: uid(),
      name: name.trim(),
      createdAt: Date.now(),
      accentColor: DEFAULT_ACCENT,
      cover: { subtitle: '', mediaId: null },
    }
    setData((d) => ({
      timelines: [...d.timelines, timeline],
      moments: { ...d.moments, [timeline.id]: [] },
    }))
    setActiveId(timeline.id)
    setSidebarOpen(false)
    return timeline
  }, [])

  const renameTimeline = useCallback((id, name) => {
    setData((d) => ({
      ...d,
      timelines: d.timelines.map((t) =>
        t.id === id ? { ...t, name: name.trim() } : t
      ),
    }))
  }, [])

  const duplicateTimeline = useCallback(
    async (id) => {
      const source = data.timelines.find((t) => t.id === id)
      if (!source) return
      const sourceMoments = data.moments[id] ?? []

      const newCoverId = source.cover?.mediaId
        ? await copyMedia(source.cover.mediaId, uid())
        : null

      const newMoments = await Promise.all(
        sourceMoments.map(async (m) => ({
          ...m,
          id: uid(),
          mediaId: m.mediaId ? await copyMedia(m.mediaId, uid()) : null,
        }))
      )

      const copy = {
        id: uid(),
        name: `${source.name} copy`,
        createdAt: Date.now(),
        accentColor: source.accentColor ?? DEFAULT_ACCENT,
        cover: { subtitle: source.cover?.subtitle ?? '', mediaId: newCoverId },
      }

      setData((d) => ({
        timelines: [...d.timelines, copy],
        moments: { ...d.moments, [copy.id]: newMoments },
      }))
      setActiveId(copy.id)
    },
    [data]
  )

  const deleteTimeline = useCallback(
    (id) => {
      const timeline = data.timelines.find((t) => t.id === id)
      ;(data.moments[id] ?? []).forEach((m) => deleteMedia(m.mediaId))
      if (timeline?.cover?.mediaId) deleteMedia(timeline.cover.mediaId)
      clearScroll(id)
      setData((d) => {
        const moments = { ...d.moments }
        delete moments[id]
        return {
          timelines: d.timelines.filter((t) => t.id !== id),
          moments,
        }
      })
      if (activeId === id) {
        const remaining = data.timelines.filter((t) => t.id !== id)
        setActiveId(remaining[0]?.id ?? null)
      }
    },
    [data, activeId]
  )

  const saveTimelineSettings = useCallback(
    async ({ name, accentColor, subtitle, coverFile, removeCover }) => {
      const current = data.timelines.find((t) => t.id === activeId)
      let mediaId = current?.cover?.mediaId ?? null

      if (coverFile) {
        if (mediaId) await deleteMedia(mediaId)
        mediaId = uid()
        await putMedia(mediaId, coverFile)
      } else if (removeCover && mediaId) {
        await deleteMedia(mediaId)
        mediaId = null
      }

      setData((d) => ({
        ...d,
        timelines: d.timelines.map((t) =>
          t.id === activeId
            ? {
                ...t,
                name: name.trim(),
                accentColor,
                cover: { subtitle: subtitle.trim(), mediaId },
              }
            : t
        ),
      }))
      setSettingsOpen(false)
    },
    [data, activeId]
  )

  const saveMoment = useCallback(
    async ({ id, title, date, description, tags, isMilestone, mediaFile, removeMedia }) => {
      const owner = id ? (findOwner(id) ?? activeId) : activeId
      const existing = id
        ? (data.moments[owner] ?? []).find((m) => m.id === id)
        : null

      let mediaId = existing?.mediaId ?? null
      let mediaType = existing?.mediaType ?? null

      if (mediaFile) {
        if (existing?.mediaId) await deleteMedia(existing.mediaId)
        mediaId = uid()
        mediaType = mediaFile.type.startsWith('video/') ? 'video' : 'image'
        await putMedia(mediaId, mediaFile)
      } else if (removeMedia && existing?.mediaId) {
        await deleteMedia(existing.mediaId)
        mediaId = null
        mediaType = null
      }

      const moment = {
        id: id ?? uid(),
        title: title.trim(),
        date,
        description: description.trim(),
        tags: tags ?? [],
        isMilestone: Boolean(isMilestone),
        mediaId,
        mediaType,
        createdAt: existing?.createdAt ?? Date.now(),
      }

      setData((d) => {
        const list = d.moments[owner] ?? []
        const next = existing
          ? list.map((m) => (m.id === moment.id ? moment : m))
          : [...list, moment]
        return { ...d, moments: { ...d.moments, [owner]: next } }
      })
      setFormState(null)
    },
    [data.moments, activeId, findOwner]
  )

  const deleteMoment = useCallback(
    (id) => {
      const owner = findOwner(id) ?? activeId
      const moment = (data.moments[owner] ?? []).find((m) => m.id === id)
      if (moment?.mediaId) deleteMedia(moment.mediaId)
      setData((d) => ({
        ...d,
        moments: {
          ...d.moments,
          [owner]: (d.moments[owner] ?? []).filter((m) => m.id !== id),
        },
      }))
      setDetailId(null)
    },
    [data.moments, activeId, findOwner]
  )

  const importTimeline = useCallback(async (parsed) => {
    const timelineId = uid()

    let coverMediaId = null
    if (parsed.coverImage) {
      const blob = await mediaStringToBlob(parsed.coverImage)
      if (blob) {
        coverMediaId = uid()
        await putMedia(coverMediaId, blob)
      }
    }

    const newMoments = await Promise.all(
      parsed.moments.map(async (m) => {
        let mediaId = null
        let mediaType = null
        if (m.media) {
          const blob = await mediaStringToBlob(m.media)
          if (blob) {
            mediaId = uid()
            mediaType = blob.type.startsWith('video/') ? 'video' : 'image'
            await putMedia(mediaId, blob)
          }
        }
        return {
          id: uid(),
          title: m.title,
          date: m.date,
          description: m.description,
          tags: m.tags ?? [],
          isMilestone: Boolean(m.isMilestone),
          mediaId,
          mediaType,
          createdAt: Date.now(),
        }
      })
    )

    const timeline = {
      id: timelineId,
      name: parsed.name,
      createdAt: Date.now(),
      accentColor: parsed.accentColor ?? DEFAULT_ACCENT,
      cover: { subtitle: parsed.subtitle ?? '', mediaId: coverMediaId },
    }

    setData((d) => ({
      timelines: [...d.timelines, timeline],
      moments: { ...d.moments, [timelineId]: newMoments },
    }))
    setActiveId(timelineId)
    setImporting(false)
    setSidebarOpen(false)
  }, [])

  const exportActiveTimeline = useCallback(() => {
    if (activeTimeline) exportTimeline(activeTimeline, moments)
  }, [activeTimeline, moments])

  const exportActiveTimelineAsVideo = useCallback(async () => {
    if (!activeTimeline || videoProgress !== null) return
    setVideoProgress(0)
    try {
      await exportVideo(activeTimeline, moments, setVideoProgress)
    } finally {
      setVideoProgress(null)
    }
  }, [activeTimeline, moments, videoProgress])

  const patchFilters = useCallback(
    (patch) => setFilters((f) => ({ ...f, ...patch })),
    []
  )
  const clearFilters = useCallback(
    () => setFilters((f) => ({ ...EMPTY_FILTERS, scope: f.scope })),
    []
  )

  const accent = activeTimeline?.accentColor ?? DEFAULT_ACCENT

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar
        timelines={data.timelines}
        activeId={activeId}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={(id) => {
          setActiveId(id)
          setSidebarOpen(false)
        }}
        onCreate={createTimeline}
        onRename={renameTimeline}
        onDuplicate={duplicateTimeline}
        onDelete={deleteTimeline}
        onImport={() => {
          setImporting(true)
          setSidebarOpen(false)
        }}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {activeTimeline ? (
          <>
            <Header
              timeline={activeTimeline}
              momentCount={moments.length}
              onOpenSidebar={() => setSidebarOpen(true)}
              onAddMoment={() => setFormState({})}
              onPresent={() => setPresenting(true)}
              onExport={exportActiveTimeline}
              onExportVideo={exportActiveTimelineAsVideo}
              onToggleSearch={() => setSearchOpen((v) => !v)}
              searchActive={searchOpen}
              onSettings={() => setSettingsOpen(true)}
            />

            <AnimatePresence>
              {searchOpen && (
                <SearchBar
                  filters={filters}
                  onChange={patchFilters}
                  availableTags={availableTags}
                  resultCount={matchIds ? matchIds.size : scopeMoments.length}
                  totalCount={scopeMoments.length}
                  hasFilter={hasFilter}
                  onClear={clearFilters}
                />
              )}
            </AnimatePresence>

            <TimelineView
              key={activeTimeline.id + filters.scope}
              timeline={activeTimeline}
              timelineId={activeTimeline.id}
              moments={scopeMoments}
              matchIds={matchIds}
              hasFilter={hasFilter}
              showCover={filters.scope === 'active'}
              onOpenMoment={setDetailId}
              onAddMoment={() => setFormState({})}
            />
          </>
        ) : (
          <WelcomeScreen
            onCreate={createTimeline}
            onOpenSidebar={() => setSidebarOpen(true)}
            onImport={() => setImporting(true)}
          />
        )}
      </div>

      <AnimatePresence>
        {formState && (
          <MomentForm
            key="form"
            moment={formState.moment ?? null}
            onSave={saveMoment}
            onClose={() => setFormState(null)}
          />
        )}
        {detailMoment && (
          <MomentDetail
            key="detail"
            moment={detailMoment}
            accent={detailMoment.accentColor}
            onEdit={() => {
              setFormState({ moment: detailMoment })
              setDetailId(null)
            }}
            onDelete={() => deleteMoment(detailMoment.id)}
            onClose={() => setDetailId(null)}
          />
        )}
        {settingsOpen && activeTimeline && (
          <TimelineSettings
            key="settings"
            timeline={activeTimeline}
            onSave={saveTimelineSettings}
            onClose={() => setSettingsOpen(false)}
          />
        )}
        {importing && (
          <ImportModal
            key="import"
            onClose={() => setImporting(false)}
            onImport={importTimeline}
          />
        )}
        {presenting && moments.length > 0 && (
          <PresentationMode
            key="present"
            timeline={activeTimeline}
            moments={moments}
            onClose={() => setPresenting(false)}
          />
        )}
        {videoProgress !== null && (
          <motion.div
            key="video-export"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm"
          >
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
            <p className="mt-5 text-lg font-semibold text-white">Generating video…</p>
            <div className="mt-4 h-2 w-64 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-200"
                style={{ width: `${Math.round(videoProgress * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-sm tabular-nums text-slate-400">{Math.round(videoProgress * 100)}%</p>
            <p className="mt-5 text-xs text-slate-500">Keep this tab active during export</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
