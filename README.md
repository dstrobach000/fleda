# Fleda Web + Sanity Studio

This repository contains two connected applications:

- The public website in the repo root, built with Next.js 16, React 19, Tailwind 4, and local assets under `src/` and `public/`.
- The editorial CMS in `studio/`, built with Sanity Studio 5 and sharing the same Sanity dataset as the website.

The app intentionally lives under `src/app`. The site also intentionally preloads local Replica font files from `public/fonts` in `src/app/layout.tsx`.

## Repo Layout

- `src/app`: App Router routes and layout for the public site
- `src/components`: UI and content components, including the homepage/program presentation
- `src/lib`: Sanity API client code and website-side program queries
- `src/types`: shared program and content types
- `src/utils`: utility helpers
- `studio/`: Sanity Studio app, schemas, desk structure, and custom calendar tool
- `docs/architecture.md`: current architecture and data flow notes
- `docs/google-calendar-sync.md`: Google Calendar to Sanity sync behavior and operations
- `AGENTS.md`: repo operating guide for AI agents

## Requirements

- Node.js `22.17.1`
- npm `10+`

The Node version is pinned with Volta in `package.json`.

## Local Development

Install dependencies in both apps:

```bash
npm install
npm --prefix studio install
```

Run the public site:

```bash
npm run dev
```

Run the Sanity Studio:

```bash
npm --prefix studio run dev
```

## Validation

Root site:

```bash
npm run lint
npm run typecheck
npm run build
```

Studio:

```bash
npm --prefix studio run lint
npm --prefix studio run typecheck
npm --prefix studio run build
```

Full repo validation:

```bash
npm run check
```

CI runs the same validation in `.github/workflows/ci.yml`.

## Environment Variables

Website and sync route:

- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_API_WRITE_TOKEN`
- `SANITY_API_READ_TOKEN`
- `SANITY_INCLUDE_DRAFT_EVENTS`
- `GOOGLE_CALENDAR_SYNC_SECRET`
- `GOOGLE_CALENDAR_ID`
- `GOOGLE_CALENDARS_JSON`
- `GOOGLE_CALENDAR_API_KEY`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_CALENDAR_LOOKBACK_DAYS`
- `GOOGLE_CALENDAR_FUTURE_DAYS`
- `ANALYZE`

Behavior summary:

- The website reads Sanity event documents through `src/lib/programEvents.ts`.
- The sync route writes draft `event` documents into Sanity through `src/app/api/integrations/google-calendar/sync/route.ts`.
- Published website program pages only show events where `confirmed == true`.
- Draft reads can be enabled for the website with `SANITY_API_READ_TOKEN` and `SANITY_INCLUDE_DRAFT_EVENTS=true`.

Detailed sync configuration examples live in `docs/google-calendar-sync.md`.

## Deployment and Scheduling

- The public site is configured for Vercel.
- Vercel cron invokes `/api/integrations/google-calendar/sync` daily via `vercel.json`.
- The Sanity Studio is a separate app under `studio/` and can be built/deployed independently.

## Navigation Architecture

- Public navigation is route-driven through `/menu`, not a shared horizontal header nav.
- `src/app/layout.tsx` renders a `modal` slot, and `src/app/@modal/(.)menu/page.tsx` intercepts `/menu` so the menu opens as an overlay on top of `/`, `/program`, and `/program/[slug]`.
- The public header is scale-driven from a header-local `font-size` and uses `em`-based sizing for the shared control height, logo size, and spacing.
- `src/components/Layout/Header.tsx` now renders the upcoming-event bar as its own fixed top rail, with `HeaderTopControls` sitting below it inside the page flow.
- While `#header` is visible, `HeaderTopControls` renders the compact inline `Menu` button alongside socials, the compact 3D logo, and search. Once the header scrolls out of view, `src/components/Layout/Navigation.tsx` takes over and renders the sticky floating `Menu` button instead.
- `HeaderTopControls` composes dedicated header primitives for circular action buttons, the inline 3D logo pill, and the header rail spacing contract.
- `src/components/Layout/Navigation.tsx` uses `src/components/BuildingBlocks/Buttons/useFloatingButtonPosition.ts` to align the sticky `Menu` button to the right edge of the main shell and just below the fixed upcoming rail.
- `src/components/BuildingBlocks/Buttons/useFloatingButtonPosition.ts` is also the shared right-edge positioning contract for the modal `Zavřít` button. Keep those two controls aligned.
- The menu trigger stores the current route in `sessionStorage` so closing `/menu` can return the visitor to the page they opened it from.
- The large logo + blueprint 3D treatment now lives in the menu overlay via `src/components/Layout/BrandMediaRow.tsx`, not in the page header.
- Menu anchor links depend on the existing section IDs `header`, `novinky`, `fotoreporty`, and `merch`.
- `HeaderTopControls` remains the mobile-safe container for socials, the compact logo, search, and the inline menu trigger.

## Editorial Model Changes

- The Studio now defines an `upcoming` singleton document that lets editors choose which confirmed event appears in the website header upcoming bar.
- Website header data is resolved by `getHeaderUpcomingEvent()` in `src/lib/programEvents.ts`; it prefers the `upcoming` singleton selection and falls back to the first confirmed program event.
- Synced Google events no longer populate a public `programTime` field. Editors instead manage the public-facing `showStart` label manually in Sanity.
- Event documents now include `privateNotes`, `showTicketsButton`, and `ticketsUrl` so editors can manage internal notes and optional external ticket CTAs without code changes.
- Program month and venue filters now use the shared `PillDropdown` component instead of native `<select>` controls so the homepage and `/program` keep one pill-style interaction pattern.

## Dependency Notes

- Packages were refreshed to current versions where upstream support allowed it.
- `eslint` is intentionally pinned to the latest `9.x` release instead of `10.x` because the current Next.js ESLint stack and `@sanity/eslint-config-studio` do not yet support ESLint 10 cleanly.

## Operational Notes

- `studio/tools/EventCalendarTool.tsx` provides an editor-facing calendar view inside Sanity Studio.
- Generated folders such as `.next/`, `studio/dist/`, and `studio/.sanity/` should stay untracked.
- `src/app/.DS_Store` was tracked accidentally and has been removed.
- The top-level `spektrum-galerie` / `spektrum-galerie.pub` keypair is a temporary non-client test-calendar exception. It must be replaced and removed from the repo before client handoff or connection to production calendar infrastructure.

## Further Reading

- `AGENTS.md`
- `docs/architecture.md`
- `docs/google-calendar-sync.md`
