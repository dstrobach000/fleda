import {createHash, createSign} from "node:crypto";
import {NextRequest, NextResponse} from "next/server";
import {sanityMutate} from "@/lib/sanityApi";
import type {VenueKey} from "@/types/program";

export const runtime = "nodejs";

type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  status?: string;
  start?: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  end?: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
};

type GoogleEventsResponse = {
  items?: GoogleCalendarEvent[];
  nextPageToken?: string;
};

type CalendarSourceConfig = {
  id: string;
  venue?: VenueKey;
  label?: string;
};

function toBase64Url(input: Buffer | string): string {
  const source = typeof input === "string" ? Buffer.from(input) : input;
  return source
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function getServiceAccountAccessToken(): Promise<string> {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!serviceAccountEmail || !rawPrivateKey) {
    throw new Error(
      "Missing Google auth configuration. Set GOOGLE_CALENDAR_API_KEY or service account env vars."
    );
  }

  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;

  const header = toBase64Url(JSON.stringify({alg: "RS256", typ: "JWT"}));
  const payload = toBase64Url(
    JSON.stringify({
      iss: serviceAccountEmail,
      scope: "https://www.googleapis.com/auth/calendar.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat,
      exp,
    })
  );

  const signingInput = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  const signature = toBase64Url(signer.sign(privateKey));
  const assertion = `${signingInput}.${signature}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to obtain Google access token (${response.status}): ${body}`);
  }

  const payloadResponse = (await response.json()) as {access_token?: string};
  if (!payloadResponse.access_token) {
    throw new Error("Google token response did not include access_token.");
  }

  return payloadResponse.access_token;
}

async function fetchGoogleEvents(calendarId: string, timeMin: string, timeMax: string): Promise<GoogleCalendarEvent[]> {
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
  const authToken = apiKey ? undefined : await getServiceAccountAccessToken();
  const allItems: GoogleCalendarEvent[] = [];

  let nextPageToken: string | undefined;
  do {
    const params = new URLSearchParams({
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "2500",
      timeMin,
      timeMax,
      showDeleted: "false",
    });

    if (nextPageToken) {
      params.set("pageToken", nextPageToken);
    }

    if (apiKey) {
      params.set("key", apiKey);
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
      {
        method: "GET",
        headers: authToken ? {Authorization: `Bearer ${authToken}`} : undefined,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Google Calendar events fetch failed (${response.status}): ${body}`);
    }

    const payload = (await response.json()) as GoogleEventsResponse;
    if (payload.items?.length) {
      allItems.push(...payload.items);
    }

    nextPageToken = payload.nextPageToken;
  } while (nextPageToken);

  return allItems;
}

function normalizeForMatch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function mapVenue(event: GoogleCalendarEvent): {venue: VenueKey; venueNeedsReview: boolean} {
  const source = normalizeForMatch(`${event.summary ?? ""} ${event.location ?? ""} ${event.description ?? ""}`);

  if (source.includes("fraktal")) {
    return {venue: "fraktal", venueNeedsReview: false};
  }

  if (
    source.includes("spektrum bar") ||
    source.includes("spectrum bar") ||
    (source.includes("spektrum") && source.includes("bar"))
  ) {
    return {venue: "bar", venueNeedsReview: false};
  }

  if (
    source.includes("spektrum galerie") ||
    source.includes("spektrum gallery") ||
    (source.includes("spektrum") && (source.includes("galerie") || source.includes("gallery")))
  ) {
    return {venue: "galerie", venueNeedsReview: false};
  }

  if (source.includes("fleda") || source.includes("fleda club")) {
    return {venue: "fleda", venueNeedsReview: false};
  }

  return {venue: "fleda", venueNeedsReview: true};
}

function toPragueDateParts(dateTimeIso: string): {date: string; time: string} {
  const date = new Date(dateTimeIso);
  const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Prague",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return {
    date: dateFormatter.format(date),
    time: timeFormatter.format(date),
  };
}

function slugify(input: string): string {
  const normalized = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 96);

  return normalized || "event";
}

function createDocId(googleEventId: string): string {
  const hash = createHash("sha1").update(googleEventId).digest("hex").slice(0, 24);
  return `event-gcal-${hash}`;
}

function chunk<T>(input: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < input.length; i += size) {
    chunks.push(input.slice(i, i + size));
  }
  return chunks;
}

function pickDefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
}

function getRangeDates() {
  const lookbackDays = Number(process.env.GOOGLE_CALENDAR_LOOKBACK_DAYS ?? 45);
  const futureDays = Number(process.env.GOOGLE_CALENDAR_FUTURE_DAYS ?? 400);

  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - lookbackDays);

  const to = new Date(now);
  to.setDate(to.getDate() + futureDays);

  return {
    timeMin: from.toISOString(),
    timeMax: to.toISOString(),
  };
}

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.GOOGLE_CALENDAR_SYNC_SECRET;
  if (!secret) {
    return false;
  }

  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const syncHeader = req.headers.get("x-sync-secret");
  const querySecret = req.nextUrl.searchParams.get("secret");

  return bearer === secret || syncHeader === secret || querySecret === secret;
}

function isVenueKey(value: string): value is VenueKey {
  return value === "fleda" || value === "fraktal" || value === "bar" || value === "galerie";
}

function expandEnvReferences(input: string): string {
  return input.replace(/\$\{?([A-Z0-9_]+)\}?/g, (fullMatch, key: string) => {
    const value = process.env[key];
    return typeof value === "string" ? value : fullMatch;
  });
}

function getCalendarSources(): CalendarSourceConfig[] {
  const jsonConfig = process.env.GOOGLE_CALENDARS_JSON;
  if (jsonConfig) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(expandEnvReferences(jsonConfig));
    } catch (error) {
      throw new Error(
        `Invalid GOOGLE_CALENDARS_JSON. Expected JSON array. ${
          error instanceof Error ? error.message : ""
        }`
      );
    }

    if (!Array.isArray(parsed)) {
      throw new Error("Invalid GOOGLE_CALENDARS_JSON. Expected a JSON array.");
    }

    const entries = parsed
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
      .map((item) => {
        const id = typeof item.id === "string" ? item.id.trim() : "";
        const venue = typeof item.venue === "string" ? item.venue.trim() : undefined;
        const label = typeof item.label === "string" ? item.label.trim() : undefined;
        return {id, venue, label};
      })
      .filter((item) => item.id.length > 0)
      .map((item) => ({
        id: item.id,
        venue: item.venue && isVenueKey(item.venue) ? item.venue : undefined,
        label: item.label,
      }));

    if (entries.length === 0) {
      throw new Error("GOOGLE_CALENDARS_JSON is set but contains no valid calendar IDs.");
    }

    return entries;
  }

  const singleCalendarId = process.env.GOOGLE_CALENDAR_ID;
  if (singleCalendarId) {
    return [{id: singleCalendarId}];
  }

  return [];
}

async function runSync(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ok: false, error: "Unauthorized"}, {status: 401});
  }

  const calendarSources = getCalendarSources();
  if (calendarSources.length === 0) {
    return NextResponse.json(
      {ok: false, error: "Missing GOOGLE_CALENDAR_ID or GOOGLE_CALENDARS_JSON"},
      {status: 500}
    );
  }

  try {
    const {timeMin, timeMax} = getRangeDates();
    const eventsByCalendar = await Promise.all(
      calendarSources.map(async (calendarSource) => {
        const googleEvents = await fetchGoogleEvents(calendarSource.id, timeMin, timeMax);
        return {
          calendarSource,
          events: googleEvents.filter(
            (event) => event.id && (event.summary || event.start?.date || event.start?.dateTime)
          ),
        };
      })
    );

    const relevantEvents = eventsByCalendar.flatMap((entry) =>
      entry.events.map((event) => ({calendarSource: entry.calendarSource, event}))
    );
    const nowIso = new Date().toISOString();

    const mutations = relevantEvents.flatMap(({calendarSource, event}) => {
      const title = (event.summary || "Untitled event").trim();
      const startDateTime = event.start?.dateTime;
      const startDate = event.start?.date;
      const endDateTime = event.end?.dateTime;
      const mappedVenue = mapVenue(event);
      const venue = calendarSource.venue || mappedVenue.venue;
      const venueNeedsReview = calendarSource.venue ? false : mappedVenue.venueNeedsReview;

      const dateParts = startDateTime ? toPragueDateParts(startDateTime) : undefined;
      const programDate = startDate || dateParts?.date;
      const programTime = dateParts?.time || "";

      if (!programDate) {
        return [];
      }

      const publishedId = createDocId(`${calendarSource.id}:${event.id}`);
      const draftId = `drafts.${publishedId}`;
      const slug = slugify(`${title}-${programDate}`);

      const setPayload = pickDefined({
        title,
        slug: {_type: "slug", current: slug},
        venue,
        venueNeedsReview,
        startDateTime,
        endDateTime,
        programDate,
        programTime,
        googleEventId: event.id,
        googleCalendarId: calendarSource.id,
        googleHtmlLink: event.htmlLink,
        googleStatus: event.status,
        source: "google",
        lastSyncedAt: nowIso,
      });

      return [
        {
          createIfNotExists: {
            _id: draftId,
            _type: "event",
            title,
            slug: {_type: "slug", current: slug},
            venue,
            programDate,
            programTime,
            googleEventId: event.id,
            googleCalendarId: calendarSource.id,
            source: "google",
            confirmed: false,
            lastSyncedAt: nowIso,
          },
        },
        {
          patch: {
            id: draftId,
            set: setPayload,
            setIfMissing: {
              confirmed: false,
              source: "google",
            },
          },
        },
      ];
    });

    for (const batch of chunk(mutations, 150)) {
      await sanityMutate(batch);
    }

    return NextResponse.json({
      ok: true,
      calendars: eventsByCalendar.map((entry) => ({
        id: entry.calendarSource.id,
        label: entry.calendarSource.label || null,
        venue: entry.calendarSource.venue || null,
        imported: entry.events.length,
      })),
      imported: relevantEvents.length,
      mutations: mutations.length,
      window: {timeMin, timeMax},
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ok: false, error: message}, {status: 500});
  }
}

export async function POST(req: NextRequest) {
  return runSync(req);
}

export async function GET(req: NextRequest) {
  return runSync(req);
}
