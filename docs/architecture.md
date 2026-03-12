# Architecture

## Overview

This repo contains:

- A public Next.js website in the repo root
- A Sanity Studio app in `studio/`
- A Google Calendar to Sanity sync route exposed from the website app

The two apps share a single Sanity project and dataset. Sanity is the content source for website program data and general editorial content.

## Directory Structure

- `src/app`
  - App Router entrypoints
  - `layout.tsx` defines metadata, preloads local Replica fonts, and wraps global providers
  - `program/page.tsx` renders the program listing
  - `program/[slug]/page.tsx` renders event detail pages
  - `api/integrations/google-calendar/sync/route.ts` syncs Google Calendar events into Sanity drafts
- `src/components`
  - `Layout/`: shell components such as header and footer
  - `Content/`: homepage and program sections
  - `BuildingBlocks/`: reusable UI, 3D, modal, text, and button primitives
- `src/lib`
  - `sanityApi.ts`: low-level Sanity query/mutate helpers using environment-backed credentials
  - `programEvents.ts`: website-side event fetching, filtering, and draft-read gating
- `src/store`
  - client-side Zustand store for 3D state
- `src/types`
  - shared types for venues and event/program payloads
- `studio/schemaTypes`
  - document schemas for `siteSettings`, `upcoming`, `page`, and `event`
- `studio/tools`
  - custom Studio calendar tool for reviewing scheduled events

## Content Model

Sanity documents currently used by the repo:

- `siteSettings`
  - global site title, description, and SEO image
- `upcoming`
  - singleton document pointing at the confirmed event shown in the header upcoming bar
- `page`
  - generic titled pages with a slug and rich-text body
- `event`
  - program/event content used by the website and Google sync flow

Important `event` fields:

- `title`
- `slug`
- `venue`
- `confirmed`
- `programDate`
- `startDateTime`
- `showStart`
- `description`
- `privateNotes`
- `facebookEventLink`
- `showTicketsButton`
- `ticketsUrl`
- `gooutIframeUrl`
- `smsticketIframeUrl`
- `youtubeEmbedUrl`
- `spotifyEmbedUrl`
- `source`
- `googleEventId`
- `googleCalendarId`
- `googleHtmlLink`
- `googleStatus`
- `venueNeedsReview`
- `lastSyncedAt`

## Runtime Boundaries

### Website

- The website renders from Sanity data through `src/lib/programEvents.ts`.
- `src/components/Layout/Header.tsx` renders a scale-driven header whose composition lives in `HeaderTopControls`.
- The header uses dedicated `HeaderActionButton`, `HeaderLogo`, and `HeaderUpcomingBar` primitives so socials, search, menu, and the upcoming rail share one sizing contract.
- The header no longer renders the homepage 3D blueprint block; that larger logo + blueprint composition remains available inside the route-driven menu overlay.
- The upcoming bar is rendered as a fixed top rail, while the rest of the header remains in normal document flow with top padding that clears the rail.
- `/menu` exists both as a direct route and an intercepted modal route through `src/app/menu/page.tsx` and `src/app/@modal/(.)menu/page.tsx`.
- While the header is visible, `HeaderTopControls` renders the compact inline `Menu` button. `src/components/Layout/Navigation.tsx` only renders the floating sticky `Menu` button after the header scrolls out of view.
- Opening the menu records the current route in `sessionStorage` so closing the menu can return to the origin page.
- `src/components/Content/MenuContent.tsx` owns the menu CTA list, including the internal anchor links and external venue links.
- The homepage route in `src/app/page.tsx` composes its sections directly instead of routing through a shared homepage wrapper.
- Homepage sections are split into individual components:
  - `src/components/Content/Home/UpcomingEvents.tsx`
  - `src/components/Content/Home/ProgramPreviewSection.tsx`
  - `src/components/Content/Home/NovinkySection.tsx`
  - `src/components/Content/Home/FotoreportySection.tsx`
  - `src/components/Content/Home/MerchSection.tsx`
- The homepage uses two section rows at the `md` breakpoint and above:
  - first row: `upcoming` on the left and `program` on the right
  - second row: `novinky` on the left and `fotoreporty` on the right
- Below `md`, those sections stack in a single column, and `merch` remains a full-width section below them.
- The compact upcoming event pill now lives in the header; the homepage `upcoming` section keeps only its title/link plus the promo image and CTA.
- Header upcoming data comes from `getHeaderUpcomingEvent()`, which first reads the `upcoming` singleton and then falls back to the first confirmed program event.
- `src/components/BuildingBlocks/Buttons/PillDropdown.tsx` is the shared interactive dropdown used by both homepage program previews and the full `/program` page filters.
- Program pages only show `event` documents where `confirmed == true`.
- If `SANITY_API_READ_TOKEN` and `SANITY_INCLUDE_DRAFT_EVENTS=true` are set, website reads can include confirmed drafts through Sanity `previewDrafts`.

### Studio

- The Studio defines the document schemas and editor workflow.
- `studio/structure.ts` customizes the desk structure and exposes the `Upcoming` singleton ahead of the event list.
- `studio/tools/EventCalendarTool.tsx` gives editors a calendar-oriented view over event documents, preferring the draft when both draft and published versions exist.
- The `upcoming` singleton only allows references to confirmed events that already have `programDate`.
- Event editors manage a manual `showStart` label, optional private notes, and optional external ticket CTA fields alongside the synced Google metadata.

### Sync Route

- The sync route runs inside the website app on Node runtime.
- It fetches Google Calendar events, normalizes dates/times into Europe/Prague presentation fields, derives or accepts venue mapping, and writes draft `event` documents into Sanity.
- The detailed contract is documented in `docs/google-calendar-sync.md`.

## Data Flows

### Website Read Flow

1. Route component calls helpers in `src/lib/programEvents.ts`.
2. `programEvents.ts` queries Sanity through `src/lib/sanityApi.ts`.
3. Results are filtered to valid dates/slugs/venues and mapped into website-safe types.
4. Pages render only confirmed events.

### Calendar Import Flow

1. Vercel cron or a manual caller hits `/api/integrations/google-calendar/sync`.
2. The route authenticates with `GOOGLE_CALENDAR_SYNC_SECRET`.
3. The route fetches events from one calendar or many calendars.
4. Each event is transformed into `programDate`, `startDateTime`, and venue metadata.
5. Editors set the manual `showStart` field for the public-facing start label shown on the website.
6. Sanity draft `event` documents are created or patched.
7. Editors optionally add private notes and ticket CTA fields in Studio.
8. Editors review drafts in Studio and toggle `confirmed` when ready for public display.
9. Editors can pin one confirmed event into the header by updating the `upcoming` singleton.

## Operational Notes

- The repo uses separate npm installs and lockfiles for root and `studio/`.
- Root validation is `lint`, `typecheck`, and `build`, plus aggregate `check`.
- `.github/workflows/ci.yml` runs `npm run check` for pushes and pull requests.
- Generated folders `.next/`, `studio/dist/`, and `studio/.sanity/` are expected local outputs and should not be committed.
- The top-level `spektrum-galerie` keypair is a temporary test-only exception and must be replaced/removed before client handoff or production calendar connection.
