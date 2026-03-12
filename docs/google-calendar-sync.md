# Google Calendar Sync

## Endpoint

- `GET /api/integrations/google-calendar/sync`
- `POST /api/integrations/google-calendar/sync`

Implementation lives in `src/app/api/integrations/google-calendar/sync/route.ts`.

The route runs on Node runtime and imports Google Calendar events into Sanity `event` drafts.

## Authentication

The request is authorized when any one of these matches `GOOGLE_CALENDAR_SYNC_SECRET`:

- `Authorization: Bearer <secret>`
- `x-sync-secret: <secret>`
- `?secret=<secret>`

If the secret is missing or does not match, the route returns `401 Unauthorized`.

## Calendar Sources

The route supports either:

- `GOOGLE_CALENDAR_ID`
- `GOOGLE_CALENDARS_JSON`

`GOOGLE_CALENDARS_JSON` takes precedence when present.

### Single Calendar

```bash
GOOGLE_CALENDAR_ID=calendar-id@group.calendar.google.com
```

### Multiple Calendars

```bash
GOOGLE_CALENDARS_JSON=[{"id":"fleda_calendar_id@group.calendar.google.com","venue":"fleda","label":"Fleda"},{"id":"fraktal_calendar_id@group.calendar.google.com","venue":"fraktal","label":"Fraktal"},{"id":"spektrum_bar_calendar_id@group.calendar.google.com","venue":"bar","label":"Spektrum bar"},{"id":"spektrum_galerie_calendar_id@group.calendar.google.com","venue":"galerie","label":"Spektrum galerie"}]
```

Behavior details:

- The JSON must be an array.
- Empty or invalid `id` values are dropped.
- `venue` is optional.
- Valid venue keys are `fleda`, `fraktal`, `bar`, `galerie`.
- Environment-variable references such as `$FLEDA` or `${FLEDA}` are expanded before JSON parsing.

## Google Authentication Modes

One of these must be configured:

- Public calendar access with `GOOGLE_CALENDAR_API_KEY`
- Service-account access with:
  - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
  - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

If no valid Google auth configuration is available, the route returns `500`.

## Sync Window

The route fetches events in a moving date range:

- `GOOGLE_CALENDAR_LOOKBACK_DAYS` default: `45`
- `GOOGLE_CALENDAR_FUTURE_DAYS` default: `400`

The response includes the computed `timeMin` and `timeMax` window used for the run.

## Event Filtering and Normalization

An event is considered importable when it has:

- a Google event `id`
- either a `summary`, `start.date`, or `start.dateTime`

Normalization rules:

- `summary` becomes `title`, defaulting to `Untitled event`
- `start.dateTime` is stored as `startDateTime`
- `start.dateTime` is also converted to `programDate` in `YYYY-MM-DD`
- Conversion uses timezone `Europe/Prague`
- All-day events use `start.date` as `programDate`
- `slug` is derived from `title-programDate`
- Slugs are normalized to ASCII, lowercased, and capped at 96 characters

## Venue Resolution

Venue precedence is:

1. Explicit `venue` on the `GOOGLE_CALENDARS_JSON` source entry
2. Text-based inference from the Google event `summary`, `location`, and `description`
3. Fallback to `fleda`

Text inference currently maps:

- `fraktal` -> `fraktal`
- `spektrum bar` or similar -> `bar`
- `spektrum galerie` / `spektrum gallery` or similar -> `galerie`
- `fleda` / `fleda club` -> `fleda`

When no explicit calendar venue is given and the text-based inference falls back, the route sets:

- `venue = "fleda"`
- `venueNeedsReview = true`

When the calendar source explicitly sets a venue, `venueNeedsReview` is forced to `false`.

## Sanity Write Behavior

Sanity writes use `src/lib/sanityApi.ts` and require `SANITY_API_WRITE_TOKEN`.

For each relevant Google event:

- a deterministic document id is derived from `calendarId:eventId`
- the published id is `event-gcal-<sha1-prefix>`
- the draft id is `drafts.event-gcal-<sha1-prefix>`

The route then:

- `createIfNotExists` for the draft document
- `patch` the draft with the latest Google-derived fields

Important fields written by sync:

- `title`
- `slug`
- `venue`
- `venueNeedsReview`
- `startDateTime`
- `programDate`
- `googleEventId`
- `googleCalendarId`
- `googleHtmlLink`
- `googleStatus`
- `source = "google"`
- `lastSyncedAt`

Default draft-only fields on first creation:

- `_type = "event"`
- `confirmed = false`
- `source = "google"`

The sync route does not publish documents.
The sync route does not set the manual `showStart` field; editors manage that in Studio.

## Website Visibility

Website program pages query only:

```groq
*[_type == "event" && confirmed == true ...]
```

That means:

- synced Google events appear in Studio immediately as drafts
- editors must review them
- editors must set `confirmed` before the website shows them

The website can optionally read draft content with:

- `SANITY_API_READ_TOKEN`
- `SANITY_INCLUDE_DRAFT_EVENTS=true`

That affects website read perspective only; it does not change the sync write model.

## Cron and Manual Operation

Scheduled sync is configured in `vercel.json`:

- path: `/api/integrations/google-calendar/sync`
- schedule: `0 8 * * *`

Vercel cron schedules are evaluated in UTC, so the current setting runs daily at 08:00 UTC.

Manual example:

```bash
curl -X POST "http://localhost:3000/api/integrations/google-calendar/sync" \
  -H "Authorization: Bearer $GOOGLE_CALENDAR_SYNC_SECRET"
```

## Response Shape

Successful responses include:

- `ok`
- `calendars`
- `imported`
- `mutations`
- `window`

Each calendar entry includes:

- `id`
- `label`
- `venue`
- `imported`

## Failure Modes

Common failures:

- missing or wrong sync secret -> `401`
- missing calendar configuration -> `500`
- invalid `GOOGLE_CALENDARS_JSON` -> `500`
- missing Google auth configuration -> `500`
- Google token exchange failure -> `500`
- Google Calendar events fetch failure -> `500`
- missing `SANITY_API_WRITE_TOKEN` -> `500`

The route returns JSON with `ok: false` and an error message when failures occur.

## Editorial Workflow

1. Sync imports or updates draft `event` documents.
2. Editors review events in the standard `Events` document list or the Studio calendar tool.
3. Editors fix any `venueNeedsReview` cases.
4. Editors add rich text, private notes, and ticket/embed links as needed.
5. Editors set `confirmed = true` when the event is ready for public display.

## Temporary Test-Key Note

The tracked `spektrum-galerie` and `spektrum-galerie.pub` files are currently a temporary test-calendar exception only. They are not acceptable for client handoff or production calendar infrastructure and must be replaced and removed before the site is handed over.
