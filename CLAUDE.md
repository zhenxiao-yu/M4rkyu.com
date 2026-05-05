# M4rkyu.com — Portfolio Website

Mark Yu's (ZhenXiao Yu) personal portfolio. React 18 SPA built with Vite 5, deployed to Vercel.

## Stack

- **Framework:** React 18 (JSX only — no TypeScript)
- **Build:** Vite 5 — dev server on port 3000 (`npm start`)
- **Routing:** React Router **v5** (`Switch`/`Route`, NOT v6 `Routes`)
- **Styling:** Styled Components v5 + CSS modules per page
- **Animation:** Framer Motion **v4** — use v4 API (`motion.div`, `AnimatePresence` from `framer-motion`)
- **Backend:** Firebase 10 (Firestore + Storage) — config via `VITE_FIREBASE_*` env vars
- **3D / Particles:** Three.js 0.153, tsparticles v3
- **Deployment:** Vercel (auto-deploy from `main` branch)

## Project Structure

```
src/
  assets/
    data/          ← Content lives here — edit these to update site content
      ProjectData.js   Projects array
      BlogData.js      Blog posts array
      GalleryData.js   Gallery images array
      SkillsData.jsx   Skills/tech stack array
    Images/        Static images referenced in data files
    audio/         Background music files
    svg/           SVG components
  components/      Shared UI components
  pages/           One folder per route
    Main/          Home page (interactive rotating logo)
    About/
    Skills/ → MySkillsPage
    Projects/ → ProjectPage
    Blog/ → BlogPage
    Gallery/ → GalleryPage
    Upload/ → UploadformPage (admin, Firebase upload)
    Error/ → NotFoundPage
    Intro/         Intro panel shown on logo click
  hooks/           Custom hooks (useFirebase, useStorage, useAssetPreloader, usePrefersReducedMotion)
  theme/           Themes.js (lightTheme), globalStyles.js, CSS files
  firebase/config.js  Firebase init — reads from VITE_ env vars
  Router.jsx       App router (React Router v5)
  index.jsx        Entry point
```

## Commands

| Command | Purpose |
|---|---|
| `npm start` | Dev server at http://localhost:3000 |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint on `src/` |

## Key Conventions

- **Styling:** Use Styled Components for component-level styles; global styles in `src/theme/`. Avoid raw inline styles.
- **Content updates:** All site content (projects, blog posts, gallery, skills) is in `src/assets/data/`. No CMS.
- **Images:** Project images are `project1.png` through `project9.png` in `src/assets/Images/`. `project_null.png` is the placeholder.
- **Framer Motion:** This project uses v4 — do NOT use v10/v11 APIs (`motion()` factory, etc.). Use `motion.div`, `AnimatePresence`, `useAnimation` from `framer-motion`.
- **React Router:** v5 — use `<Switch>`, `<Route>`, `useHistory`, `useLocation`, `NavLink`. Do NOT use v6 `<Routes>`, `useNavigate`.
- **No TypeScript:** All source is `.jsx` / `.js`. Do not create `.tsx` or `.ts` files.
- **No comments:** Follow the no-comment convention unless a behavior is non-obvious.
- **`dist/` is generated:** Never edit files in `dist/`.

## Environment Variables

Required in `.env` (copy from `.env.example`):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

## Routes

| Path | Component | Notes |
|---|---|---|
| `/` | Main | Home — rotating logo, video bg |
| `/about` | AboutPage | |
| `/skills` | MySkillsPage | |
| `/project` | ProjectPage | |
| `/post` | BlogPage | |
| `/gallery` | GalleryPage | Firebase Storage images |
| `/gallery/:section` | GalleryPage | |
| `/admin` | UploadformPage | Firebase upload form |

## Firebase Usage

- `useFirebase.js` — Firestore CRUD hook
- `useStorage.js` — Firebase Storage upload hook
- Gallery images are stored in Firebase Storage and loaded dynamically
- Gallery metadata stored in Firestore
