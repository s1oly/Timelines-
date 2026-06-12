# Timelines

A personal visual timeline app. Create multiple named timelines and fill them
with rich-media "moments" — titles, dates, descriptions, photos, and videos —
laid out on a smooth horizontal scrolling track.

## Features

- **Horizontal timeline** with a connector track, node indicators, and
  momentum scrolling (stacks vertically on mobile)
- **Moments** — cards with title, date, description, and image/video
  thumbnails; click to expand into a full detail view
- **Add / edit / delete** moments with inline media preview before saving
- **Multiple timelines** — create, rename, delete, and switch from the sidebar
- **Persistence** — metadata in `localStorage`, media blobs in IndexedDB;
  the last active timeline and scroll position are restored on load
- **Dark mode**, scroll-triggered entry animations, fully responsive

## Stack

React + Vite · Tailwind CSS v4 · Framer Motion · idb (IndexedDB)

Fully client-side — no backend required.

## Run

```sh
npm install
npm run dev
```

Build for production with `npm run build`.
