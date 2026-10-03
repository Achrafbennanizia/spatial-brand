# Dixor — Spatial Creative Agency

Interactive **3D agency world** inspired by the [Dixor creative digital agency template](https://21st.dev/@validtheme/templates/dixor-creative-digital-agency-react). Four rooms (Services, Work, Clients, Team) tell the studio story — scroll/swipe to travel, tilt on mobile.

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS v4
- React Three Fiber + Drei
- Motion for panel transitions

## Navigate
- Scroll / swipe between rooms
- Click a pad or bottom dock
- Tilt phone to look around (Enable on iOS)
- Keys `1–4`, arrows, `Esc` / `0` for studio hub

## Run

```bash
npm install
npm run dev
```

## Structure
- `src/lib/zones.ts` — room content + camera targets
- `src/components/canvas/` — 3D world + meaningful props (laptop, gallery, metrics, desk)
- `src/components/ZonePanel.tsx` — narrative overlay

## Design
Dark studio void, coral `#ff5c35` accent, Fraunces + DM Sans — Dixor-style creative agency energy in a spatial shell.
# spatial-brand
