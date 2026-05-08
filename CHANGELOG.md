# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
this project aims to follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- Repo restructured to a single Next.js app at the root. The legacy Vite +
  React 18 site moved to
  [zhenxiao-yu/m4rkyu-archive](https://github.com/zhenxiao-yu/m4rkyu-archive)
  and continues to deploy to a free `*.vercel.app` URL for rollback.
- `m4rkyu.com` and `www.m4rkyu.com` now serve from the Next.js app on the
  `m4rkyu-portfolio` Vercel project.
- `.gitignore`, release workflow, and project docs (`README.md`, `CLAUDE.md`,
  `AGENTS.md`, `SECURITY.md`) consolidated for a single-app layout.

### Removed

- Legacy Vite source (`src/`, `public/`, `index.html`, `vite.config.js`),
  legacy `package.json` / `package-lock.json`, monorepo `.vercelignore`,
  monorepo cutover docs (`MIGRATION.md`, `VERCEL_DASHBOARD_AUDIT.md`), and the
  dated `TESTING.md` and monorepo `CONTRIBUTING.md`.

## [0.1.1] - 2026-05-06

### Added

- Active Next.js remake workflow alongside the preserved legacy
  production-safe root app.

### Changed

- Migration documentation and repo structure guidance improved for safe
  cutover planning.
