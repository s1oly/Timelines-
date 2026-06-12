import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import TimelineView from './components/TimelineView.jsx'
import MomentForm from './components/MomentForm.jsx'
import MomentDetail from './components/MomentDetail.jsx'
import WelcomeScreen from './components/WelcomeScreen.jsx'
import { deleteMedia, putMedia } from './lib/db.js'
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

  const moments = useMemo(() => {
    const list = data.moments[activeId] ?? []
    return [...list].sort((a, b) => a.date.localeCompare(b.date))
  }, [data.moments, activeId])

  const detailMoment = useMemo(
    () => moments.find((m) => m.id === detailId) ?? null,
    [moments, detailId]
  )

  const createTimeline = useCallback((name) => {
    const timeline = { id: uid(), name: name.trim(), createdAt: Date.now() }
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

  const deleteTimeline = useCallback(
    (id) => {
      const orphaned = (data.moments[id] ?? []).map((m) => m.mediaId)
      orphaned.forEach((mediaId) => deleteMedia(mediaId))
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

  const saveMoment = useCallback(
    async ({ id, title, date, description, mediaFile, removeMedia }) => {
      const existing = id
        ? (data.moments[activeId] ?? []).find((m) => m.id === id)
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
        mediaId,
        mediaType,
        createdAt: existing?.createdAt ?? Date.now(),
      }

      setData((d) => {
        const list = d.moments[activeId] ?? []
        const next = existing
          ? list.map((m) => (m.id === moment.id ? moment : m))
          : [...list, moment]
        return { ...d, moments: { ...d.moments, [activeId]: next } }
      })
      setFormState(null)
    },
    [data.moments, activeId]
  )

  const deleteMoment = useCallback(
    (id) => {
      const moment = (data.moments[activeId] ?? []).find((m) => m.id === id)
      if (moment?.mediaId) deleteMedia(moment.mediaId)
      setData((d) => ({
        ...d,
        moments: {
          ...d.moments,
          [activeId]: (d.moments[activeId] ?? []).filter((m) => m.id !== id),
        },
      }))
      setDetailId(null)
    },
    [data.moments, activeId]
  )

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
        onDelete={deleteTimeline}
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
            />
            <TimelineView
              key={activeTimeline.id}
              timelineId={activeTimeline.id}
              moments={moments}
              onOpenMoment={setDetailId}
              onAddMoment={() => setFormState({})}
            />
          </>
        ) : (
          <WelcomeScreen
            onCreate={createTimeline}
            onOpenSidebar={() => setSidebarOpen(true)}
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
            onEdit={() => {
              setFormState({ moment: detailMoment })
              setDetailId(null)
            }}
            onDelete={() => deleteMoment(detailMoment.id)}
            onClose={() => setDetailId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
