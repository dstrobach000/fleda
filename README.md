This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Google Calendar -> Sanity (Program Sync)

This project now includes a sync endpoint:

- `GET/POST /api/integrations/google-calendar/sync`

It imports Google Calendar events into Sanity `event` documents as drafts, with `confirmed` defaulting to `false`.
Website program lists only `confirmed` events from Sanity.

### Required env vars

- `SANITY_PROJECT_ID` (defaults to `rw346rj2` if omitted)
- `SANITY_DATASET` (defaults to `production` if omitted)
- `SANITY_API_WRITE_TOKEN` (required for sync mutations)
- `GOOGLE_CALENDAR_SYNC_SECRET`
- `GOOGLE_CALENDAR_ID` or `GOOGLE_CALENDARS_JSON`

Google auth options:

- Public calendar: `GOOGLE_CALENDAR_API_KEY`
- Private shared calendar: `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

Optional:

- `SANITY_API_READ_TOKEN` + `SANITY_INCLUDE_DRAFT_EVENTS=true` to include confirmed draft events in website query
- `GOOGLE_CALENDAR_LOOKBACK_DAYS` (default `45`)
- `GOOGLE_CALENDAR_FUTURE_DAYS` (default `400`)

### Multiple calendars (recommended for Fléda/Fraktal/Spektrum)

Use one env var with explicit venue mapping:

```bash
GOOGLE_CALENDARS_JSON=[{"id":"fleda_calendar_id@group.calendar.google.com","venue":"fleda","label":"Fléda"},{"id":"fraktal_calendar_id@group.calendar.google.com","venue":"fraktal","label":"Fraktal"},{"id":"spektrum_bar_calendar_id@group.calendar.google.com","venue":"bar","label":"Spektrum bar"},{"id":"spektrum_galerie_calendar_id@group.calendar.google.com","venue":"galerie","label":"Spektrum galerie"}]
```

Accepted `venue` values are exactly: `fleda`, `fraktal`, `bar`, `galerie`.

You can also keep IDs in separate env vars and reference them:

```bash
FLEDA=fledatest@gmail.com
FRAKTAL=abc123@group.calendar.google.com
SBAR=def456@group.calendar.google.com
SGALERIE=ghi789@group.calendar.google.com

GOOGLE_CALENDARS_JSON=[{"id":"$FLEDA","venue":"fleda","label":"Fléda"},{"id":"$FRAKTAL","venue":"fraktal","label":"Fraktal"},{"id":"$SBAR","venue":"bar","label":"Spektrum bar"},{"id":"$SGALERIE","venue":"galerie","label":"Spektrum galerie"}]
```

### Trigger sync manually

```bash
curl -X POST "http://localhost:3000/api/integrations/google-calendar/sync" \
  -H "Authorization: Bearer $GOOGLE_CALENDAR_SYNC_SECRET"
```
