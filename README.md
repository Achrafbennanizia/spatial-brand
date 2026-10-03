# Dixor — Spatial Creative Agency

Interactive **3D agency world** inspired by the [Dixor creative digital agency template](https://21st.dev/@validtheme/templates/dixor-creative-digital-agency-react). Four rooms (Services, Work, Clients, Team) tell the studio story — scroll/swipe to travel, tilt on mobile.

**Live:** [https://achrafbennanizia.github.io/spatial-brand/](https://achrafbennanizia.github.io/spatial-brand/)

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS v4
- React Three Fiber + Drei
- Motion for panel transitions
- GitHub Actions → GitHub Pages (static export)

## Navigate
- Scroll / swipe between rooms
- Click a pad or bottom dock
- Tilt phone to look around (Enable on iOS)
- Keys `1–4`, arrows, `Esc` / `0` for studio hub

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
# Local static export (no basePath)
npm run build

# GitHub Pages export (basePath /spatial-brand)
npm run build:pages
```

Output lands in `out/`.

## CI/CD
Every push to `main` runs lint → static build → deploy to GitHub Pages (`.github/workflows/deploy.yml`). You can also trigger **Actions → Deploy to GitHub Pages → Run workflow**.

## Structure
- `src/lib/zones.ts` — room content + camera targets
- `src/components/canvas/` — 3D world + zone props
- `src/components/ZonePanel.tsx` — narrative overlay

## Design
Dark studio void, coral `#ff5c35` accent, Fraunces + DM Sans — Dixor-style creative agency energy in a spatial shell.
