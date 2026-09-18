# Detangle Website — Architecture

## 1. Overview

Detangle is a small marketing + booking website for Noopur Asthana's therapy/workshop practice. It lets visitors read about the practice, browse past workshops, view a photo gallery, and register for an upcoming workshop.

The project is two independent halves that talk over HTTP:

- **Frontend** — a React 19 + TypeScript single-page app, built with Vite. Lives at the repo root.
- **Backend** — a small Flask API (`backend/`) that writes workshop registrations to MongoDB.

There is no server-side rendering, no router library, and no shared code between the two halves — they are connected only by a REST call and a CORS policy.

## 2. Repository layout

```
Detangle_Website/
├── index.html              # Vite HTML entry point
├── package.json            # Frontend deps + scripts (dev/build/lint/preview)
├── vite.config.ts          # Vite config (React plugin only, no proxy/aliases)
├── tsconfig*.json          # TypeScript project config
├── eslint.config.js        # ESLint (standard Vite React+TS template rules)
├── .env.example            # Frontend env template (VITE_API_BASE_URL)
├── src/                    # Frontend source (see §3)
├── public/                 # Static files served as-is at "/" (see §4)
├── backend/                # Flask API (see §5)
│   ├── app.py
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
├── Docs/                   # Project docs (this file, Context.md, Tasks.md)
└── README.md                # Default Vite template README (not project-specific)
```

## 3. Frontend architecture

### 3.1 Bootstrapping

```
index.html → src/main.tsx → <AppRefactored />
```

`src/main.tsx` mounts `AppRefactored` (in `src/AppRefactored.tsx`) into `#root` inside `StrictMode`.

> **Dead code note:** `src/App.tsx` is an earlier, monolithic version of the whole app (same pages, same logic, inlined into one file). It is **not imported anywhere** — `main.tsx` only renders `AppRefactored`. It's effectively a leftover from before the app was split into `pages/`/`components/`. Safe to ignore when reading the app, and a candidate for deletion.

### 3.2 Routing model

There is no `react-router` or URL-based routing. `AppRefactored` holds a single piece of state:

```ts
type Page = 'home' | 'about' | 'register' | 'gallery'   // src/types.ts
```

Navigating just calls `setPage(...)`; the URL never changes. `Navbar` and in-page buttons/links call `onNavigate` to switch pages. `AppRefactored` also tracks whether the hero's own "Book a Session" button has scrolled out of view (via `scroll`/`resize` listeners) to decide whether to show a duplicate CTA in the navbar.

### 3.3 Component / page tree

```
AppRefactored
├── Navbar                       — logo, page nav buttons, conditional "Book a Session" CTA
└── <page content, one at a time>
    ├── Hero            (page === 'home')
    │   ├── LandingHero         — title/tagline + primary booking CTA (ref tracked for navbar CTA logic)
    │   ├── UpcomingEvent       — hardcoded promoted workshop card + poster image lightbox
    │   ├── WelcomeSection      — static welcome message/quote from Noopur
    │   ├── ServicesSection     — 4x ServiceCard grid, fades in via IntersectionObserver
    │   │   └── ServiceCard     — single service tile (title/description/variant)
    │   └── PastWorkshopsSection — auto-scrolling marquee of past-workshop photos, opens Gallery
    ├── About           (page === 'about')       — static bio, qualifications, stats, CTA
    ├── Gallery         (page === 'gallery')      — photo grid + click-to-open lightbox modal
    └── Registration    (page === 'register')     — workshop registration form (see §3.4)
```

All page components live in `src/pages/`, all reusable pieces in `src/components/`.

### 3.4 Data & data flow

- **Workshop list**: `src/data/workshops.ts` is a hardcoded array of `{ id, title, description, date }` (typed via `Workshop` in `src/types.ts`). It feeds the dropdown in `Registration.tsx`. There is no API call to fetch workshops — the list is static in source.
- **Registration submit**: `Registration.tsx` keeps form state (`full_name`, `email`, `phone`, `workshop_id`, `experience_level`, `notes`) and on submit does:
  ```ts
  fetch(`${apiBaseUrl}/api/registrations`, { method: 'POST', body: JSON.stringify(formData), ... })
  ```
  On success it shows a success message and resets the form; on failure it shows the error and points the user to a Google Form fallback link.
- **Booking CTAs are Google Forms, not the API.** Two *different* Google Form URLs are hardcoded in the source:
  - A general "booking session" URL (`https://forms.gle/6CcMTZwz3zCo6Nre8`), used by `Navbar`, `LandingHero`, and `About`.
  - A separate URL used only inside `UpcomingEvent.tsx` (`https://forms.gle/MUzD1EnHe2M9hGAK6`) for the specific promoted workshop.
  Only the in-site **Registration** page talks to the Flask backend; every other "book/register" button on the site links out to one of these two Google Forms.

### 3.5 Styling

Plain CSS, no framework (no Tailwind/CSS-in-JS). `src/index.css` holds global/base styles; `src/App.css` holds the bulk of component styling, keyed off the class names used throughout `pages/`/`components/` (e.g. `.landing-hero`, `.service-card--therapy`, `.gallery-lightbox`).

### 3.6 Config

- `import.meta.env.VITE_API_BASE_URL` — base URL for the backend API, read once via `useMemo` in `AppRefactored` and passed down to `Registration`. Falls back to `http://localhost:5000` if unset. Set via a `.env` file (see `.env.example`).
- `vite.config.ts` — minimal: just the `@vitejs/plugin-react` plugin, no dev-server proxy or path aliases.

## 4. Assets

There are **two** asset locations, and they mostly duplicate each other:

- **`public/assets/`** — served verbatim at `/assets/...` by Vite. This is the one actually referenced by the app: every `<img src="/assets/...">` in the codebase (logo, hero image, workshop/gallery photos, poster, favicon, icons.svg) points here.
- **`src/assets/`** — contains near-identical copies of the same photos/videos, plus the unused Vite/React template starter icons (`react.svg`, `vite.svg`). Nothing in `src/` currently `import`s from this folder — it looks like the pre-move originals (or a duplicate upload) rather than an actively used asset pipeline.
- Both folders also contain a few personal media files (`IMG_2868.HEIC`, WhatsApp-exported images/videos) that aren't referenced by any component — raw source material that hasn't been wired into any page.

Net effect: if you need to change an image the site displays, edit/replace it under **`public/assets/`** — that's the live copy.

## 5. Backend architecture

`backend/app.py` is a single-file Flask app using an app-factory pattern.

### 5.1 Setup on startup

- `load_dotenv()` reads `backend/.env`.
- CORS is enabled only for `/api/*`, restricted to the origin in `FRONTEND_ORIGIN` (defaults to `*` if unset).
- A MongoDB connection is opened via `pymongo.MongoClient`, targeting `MONGODB_DB_NAME` / `MONGODB_COLLECTION_NAME` (defaults: `detangle_db` / `registrations`) on `MONGODB_URI` (default `mongodb://localhost:27017`).

### 5.2 Endpoints

| Method | Path                 | Purpose                         | Notes |
|--------|----------------------|----------------------------------|-------|
| GET    | `/api/health`        | Liveness check                  | Returns `{"status": "ok"}` |
| POST   | `/api/registrations` | Create a workshop registration  | Validates required fields; returns `201` + inserted id, or `400` with a list of missing fields |

**Registration request body:**
```json
{
  "full_name": "string (required)",
  "email": "string (required)",
  "phone": "string (required)",
  "workshop_id": "string (required)",
  "experience_level": "string (optional, default 'beginner')",
  "notes": "string (optional)"
}
```

**Stored document shape** (in the `registrations` collection):
```json
{
  "full_name": "...",
  "email": "... (lowercased, trimmed)",
  "phone": "...",
  "workshop_id": "...",
  "experience_level": "beginner",
  "notes": "...",
  "status": "pending",
  "payment_status": "pending",
  "created_at": "UTC datetime"
}
```

There is no `GET` endpoint to list/read registrations, no authentication, and no rate limiting — the API is write-only from the frontend's perspective. Registrations are presumably reviewed directly in MongoDB.

### 5.3 Running it

`python app.py` starts Flask's dev server (`debug=True`) on `0.0.0.0:$PORT` (default `5000`). Dependencies (`backend/requirements.txt`): `Flask`, `flask-cors`, `pymongo`, `python-dotenv`.

### 5.4 Backend environment variables (`backend/.env.example`)

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5000` | Port the Flask dev server binds to |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Allowed CORS origin for `/api/*` |
| `MONGODB_URI` | `mongodb://localhost:27017` | Mongo connection string |
| `MONGODB_DB_NAME` | `detangle_db` | Database name |
| `MONGODB_COLLECTION_NAME` | `registrations` | Collection name |

## 6. Frontend ↔ Backend integration

- The frontend's `VITE_API_BASE_URL` and the backend's `FRONTEND_ORIGIN` must point at each other for local dev to work: frontend on `5173` (Vite default) calling backend on `5000`, and the backend's CORS allow-list must include `5173`.
- The only integration point is `POST /api/registrations`, called from `Registration.tsx`. There is no other traffic between the two apps (no auth handshake, no shared session, no websockets).
- If the API call fails (network error or non-2xx response), the Registration page shows the error inline and points the user at the general Google Form as a manual fallback — the site is designed to keep working for bookings even if the backend/DB is down.

## 7. Local development

**Frontend** (from repo root):
```bash
npm install
npm run dev        # Vite dev server, http://localhost:5173
npm run build       # tsc -b && vite build
npm run lint
npm run preview
```

**Backend** (from `backend/`):
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# copy .env.example to .env and adjust as needed
python app.py       # http://localhost:5000
```

Both need to be running simultaneously for the Registration form to work end-to-end; every other page works with the frontend alone.

## 8. Deployment

**Not yet set up.** There is no Dockerfile, CI workflow, `vercel.json`/`netlify.toml`, `Procfile`, or any other hosting/deploy configuration anywhere in the repository. Today the project only runs via the local dev commands in §7 (Vite dev server + Flask dev server + a local or self-hosted MongoDB). Choosing where/how to host the frontend, the Flask API, and MongoDB (e.g. a static host + a WSGI-capable host + MongoDB Atlas, or otherwise) is an open decision for later, not something reflected in the current codebase.

## 9. Known gaps / things to watch

- **Two different Google Form URLs** are hardcoded in different components (`AppRefactored`/`LandingHero`/`About` vs. `UpcomingEvent`) — easy to update one and forget the other.
- **`src/App.tsx` is dead code** — a full duplicate implementation of the app that isn't rendered; can be confusing to a new reader, or removed.
- **`src/assets/` duplicates `public/assets/`** and isn't actually used by the app; also contains unreferenced personal media files in both locations.
- **No auth or rate limiting** on `POST /api/registrations` — anyone who finds the endpoint can insert arbitrary registration documents.
- **No read/admin endpoint** for registrations — they can currently only be viewed by querying MongoDB directly.
- **Workshop data lives in two places conceptually**: the static `workshops.ts` list (used by the in-site form) and the separately-promoted event in `UpcomingEvent.tsx` (which isn't in `workshops.ts` and posts to Google Forms instead) — the site doesn't have one single source of truth for "what workshops exist."
