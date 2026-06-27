# Timelines

A personal visual timeline app. Create multiple named timelines and fill them
with rich-media "moments": titles, dates, descriptions, photos, and videos —
laid out on a smooth horizontal scrolling track.

## Features

- **Horizontal timeline** with a connector track, node indicators, and
  momentum scrolling (stacks vertically on mobile)
- **Moments** — cards with title, date, description, tags, and image/video
  thumbnails; click to expand into a full detail view
- **Add / edit / delete** moments with tag input and inline media preview
- **Milestone markers** — flag key moments to render larger with a glowing
  accent border, badge, and bigger timeline node (and extra emphasis in
  Presentation Mode)
- **Search & filter** — filter by keyword, date range, and tags, scoped to the
  active timeline or across all timelines, with a live result count and
  non-matching cards dimmed
- **Multiple timelines** — create, rename, duplicate, delete, and switch from
  the sidebar
- **Per-timeline theming** — custom accent color and a cover screen (image +
  subtitle) that opens the track and the slideshow
- **JSON import / export** — portable Chronos Timeline Schema with validation
  and a pre-import preview; round-trips media inline as base64
- **Persistence** — metadata in `localStorage`, media blobs in IndexedDB;
  the last active timeline and scroll position are restored on load
- **Dark mode**, scroll-triggered entry animations, fully responsive
- **Presentation mode** — fullscreen slideshow starting from the cover, with
  keyboard, arrow, and swipe navigation


## Stack

React + Vite · Tailwind CSS v4 · Framer Motion · idb (IndexedDB)

Fully client-side — no backend required.

## Run

```sh
npm install
npm run dev
```

Build for production with `npm run build`.
