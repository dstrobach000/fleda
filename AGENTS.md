# Agent Guide

This repository has two apps:

- `.`: Next.js website
- `studio/`: Sanity Studio

Use the root app for website changes and `studio/` for schema/editorial tooling changes. Do not move the site out of `src/app`, and do not replace the local Replica font preload setup in `src/app/layout.tsx` unless the task explicitly requires it.

## Commands

Install:

```bash
npm install
npm --prefix studio install
```

Validate the website:

```bash
npm run lint
npm run typecheck
npm run build
```

Validate the studio:

```bash
npm --prefix studio run lint
npm --prefix studio run typecheck
npm --prefix studio run build
```

Validate the full repo:

```bash
npm run check
```

Run locally:

```bash
npm run dev
npm --prefix studio run dev
```

## Repo Map

- `src/app`: routes, metadata, layout, and the Google Calendar sync API route
- `src/components`: UI, layout, and program rendering
- `src/lib/sanityApi.ts`: low-level Sanity query/mutation client
- `src/lib/programEvents.ts`: website-side event queries and filtering
- `studio/schemaTypes/`: Sanity document schemas
- `studio/tools/EventCalendarTool.tsx`: Studio calendar view for editors
- `docs/architecture.md`: current architecture and content model
- `docs/google-calendar-sync.md`: source of truth for sync behavior and env vars

## Change Boundaries

- Public navigation is the route-driven `/menu` overlay pattern. Do not reintroduce the old horizontal shared nav unless the task explicitly requires it.
- Preserve both `src/app/menu/page.tsx` and the intercepted `src/app/@modal/(.)menu/page.tsx` route so the menu works both directly and as an overlay.
- Keep the desktop public header ordered socials > compact 3D Fleda logo > upcoming bar > `Menu` > search unless a task explicitly changes that structure.
- Keep header sizing scale-driven from a header-local `font-size`, with `em`-based dimensions and matching control heights across socials, search, menu, and the upcoming bar.
- Preserve the two-state menu trigger behavior: inline compact `Menu` button while `#header` is visible, sticky right-edge floating `Menu` button after the header scrolls out of view.
- Treat `src/components/BuildingBlocks/Buttons/useFloatingButtonPosition.ts` as the shared positioning contract for the sticky `Menu` button and the modal `Zavřít` button. If one moves, the other should move with it.
- Keep `HeaderTopControls` available on mobile; social/search access should not depend on a separate mobile nav row.
- Treat `header`, `novinky`, `fotoreporty`, and `merch` section IDs as navigation dependencies.

- Website program visibility is gated by `confirmed == true`; keep that contract unless the task explicitly changes publishing policy.
- Google Calendar sync writes draft `event` documents only. Editors review and confirm them in Sanity before they appear on the website.
- `event` fields such as `programDate`, `programTime`, `googleEventId`, `googleCalendarId`, `googleHtmlLink`, `venue`, and `confirmed` are shared operational contracts between the sync route, studio schema, and website queries.
- Venue keys are fixed: `fleda`, `fraktal`, `bar`, `galerie`.

## Lint and Tooling Notes

- `eslint` is pinned to `9.x` intentionally. Do not bump to `10.x` without revalidating both `eslint-config-next` and `@sanity/eslint-config-studio`.
- Root lint uses direct ESLint flat config, not `next lint`.
- Studio lint includes small Node-script exceptions for `list-assets.js` and `query-assets.js`.

## Before Changing Program or Calendar Behavior

Read these files first:

- `src/app/api/integrations/google-calendar/sync/route.ts`
- `src/lib/programEvents.ts`
- `studio/schemaTypes/event.ts`
- `studio/tools/EventCalendarTool.tsx`
- `docs/google-calendar-sync.md`

## Operational Cautions

- Generated folders `.next/`, `studio/dist/`, and `studio/.sanity/` must stay untracked.
- There is a temporary tracked SSH keypair at `spektrum-galerie` and `spektrum-galerie.pub` for a non-client test calendar. Leave it unchanged unless the task is explicitly about replacing/removing it, and document any related changes carefully.
