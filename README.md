# Mark Yu / ZhenXiao Yu — Portfolio

A personal portfolio for ZhenXiao (Mark) Yu that blends interactive visuals with engineering case studies. The site is built with Vite and React, styled with a mix of custom CSS and third-party animation libraries, and deployed to Vercel for fast global delivery.

## Live Site
- **Production:** [https://www.m4rkyu.com](https://www.m4rkyu.com)

## Project Overview
- Showcases projects in software engineering, game development, and digital art with responsive layouts and motion.
- Highlights multilingual and multicultural experience (English/Mandarin, Chinese Canadian background) and academic ties to Western University.
- Includes gallery, blog, and resume sections powered by reusable components.

## Key Features
- **Single-page React experience:** Smooth navigation managed through React Router with animated transitions.
- **SEO-ready metadata:** Optimized HTML head tags, canonical URL, and Schema.org structured data for the "ZhenXiao Yu" / "Mark Yu" identity.
- **Interactive visuals:** Framer Motion, tsParticles, and three.js integrations add depth without sacrificing performance.
- **Responsive design:** Custom breakpoints and utility classes ensure accessibility on mobile, tablet, and desktop.
- **Analytics:** Vercel Analytics and Speed Insights are available for production deployments.

## Tech Stack
- **Core:** Vite, React 18, React Router
- **Styling & Motion:** styled-components, animate.css, Framer Motion, hover effects
- **3D/Canvas:** three.js, tsParticles
- **Utilities:** clsx, react-icons, react-scroll, react-simple-typewriter
- **Deployment:** Vercel (see `vercel.json` for configuration)

## Requirements
- Node.js 18+ and npm

## Getting Started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Run the dev server**
   ```bash
   npm start
   ```
   Visit `http://localhost:5173` (default Vite port) in your browser.

## Available Scripts
- `npm start` — Launch the Vite development server.
- `npm run build` — Create an optimized production build in `dist/`.
- `npm run preview` — Preview the production build locally.

## Project Structure
- `src/index.jsx` — App entry that mounts the React tree.
- `src/Router.jsx` — Route definitions for top-level sections (Intro, About, Projects, Gallery, Blog, etc.).
- `src/pages/` — Page-level components grouped by feature area.
- `src/components/` — Shared UI pieces (navigation, cards, loaders, tooltips).
- `src/assets/` — Static assets such as images and icons.
- `public/` — Public files served at the site root (favicons, manifest).

## Deployment
1. Build the site with `npm run build`.
2. Deploy the generated `dist/` directory to Vercel or your preferred static host. The included `vercel.json` is ready for Vercel deployments.

## Contributing
Contributions are welcome! Please open an issue to discuss changes, then submit a pull request from a feature branch.

## Contact
- **Website:** [m4rkyu.com](https://www.m4rkyu.com)
- **Email:** [markyu0615@gmail.com](mailto:markyu0615@gmail.com)
- **GitHub:** [@zhenxiao-yu](https://github.com/zhenxiao-yu)
