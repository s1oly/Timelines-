Project: Chronos – A Personal Visual Timeline App
Build a modern, visually polished web application called Chronos that lets users create and manage multiple personal timelines, each populated with rich media entries.
Core Features
Timeline View
The primary UI is a horizontal scrolling timeline — entries are laid out left to right in chronological order
Scrolling must feel smooth and momentum-based (use scroll-behavior: smooth, overflow-x: scroll with -webkit-overflow-scrolling: touch, or a library like Framer Motion / Swiper.js)
Each timeline entry ("moment") displays as a card containing: a title, date, short description, and an optional photo or video thumbnail
Clicking a card opens an expanded detail view (modal or side panel) showing the full description and full-size media
Adding Entries
A prominent "+ Add Moment" button opens a creation form
Form fields: Title (text), Date (date picker), Description (textarea), Media Upload (image or video file)
Uploaded media should display an inline preview before saving
Multiple Timelines
Each user can create and switch between multiple named timelines (e.g., "My Life", "Work Journey", "Travel")
A sidebar or top navigation lists all timelines with options to create, rename, or delete them
The active timeline is clearly highlighted
Persistence
Use localStorage to persist all timeline data (titles, descriptions, dates, timeline names) between sessions
Media files (images/videos) should be stored as Base64 strings in localStorage or via the IndexedDB API (preferred for larger files) so they survive page refreshes without a backend
On load, the app should restore the user's last active timeline and scroll position
Design & Aesthetic
Modern, minimal design — clean white or dark-mode-ready background, generous whitespace, subtle shadows
Font: Use Inter or Plus Jakarta Sans from Google Fonts — both are modern and highly readable
Color palette: Neutral base (white/slate) with a single bold accent color (e.g., indigo, violet, or electric blue) for CTAs and active states
Cards: Rounded corners (border-radius: 16px), soft drop shadows, smooth hover transitions (transform: translateY(-4px))
Timeline connector: A horizontal line or track running through the center of the cards with dot/node indicators at each entry point
Animations: Entry cards should fade + slide in on scroll using Intersection Observer or a scroll animation library
Fully responsive — works on desktop and tablet; on mobile, the timeline stacks vertically
Tech Stack Suggestions
React (with Vite) or Next.js for the frontend
Tailwind CSS for styling
Framer Motion for animations and smooth transitions
IndexedDB (via the idb library) for media storage; localStorage for metadata
No backend required — fully client-side
User Flow
User lands on the app → sees their timelines list (or a prompt to create the first one)
User selects a timeline → horizontal scroll view loads with all moments
User clicks "+ Add Moment" → fills out form, uploads a photo → saves
New card appears on the timeline with a smooth insertion animation
User can click any card to view full details, or delete/edit it
All data persists on refresh via IndexedDB/localStorage
Prioritize the visual polish and animation quality — this should feel like a premium consumer app, not a utility tool.


