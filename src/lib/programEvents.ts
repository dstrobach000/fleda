import type {CalendarEvent, PortableTextBlock, ProgramEventDetail, VenueKey} from "@/types/program";
import {sanityQuery} from "@/lib/sanityApi";

type RawCalendarEvent = {
  _id: string;
  slug?: string;
  title?: string;
  date?: string;
  venue?: VenueKey;
  startDateTime?: string;
  showStart?: string;
  confirmed?: boolean;
};

type RawProgramEventDetail = {
  _id: string;
  slug?: string;
  title?: string;
  date?: string;
  venue?: VenueKey;
  startDateTime?: string;
  showStart?: string;
  description?: PortableTextBlock[];
  facebookEventLink?: string;
  showTicketsButton?: boolean;
  ticketsUrl?: string;
  gooutIframeUrl?: string;
  smsticketIframeUrl?: string;
  youtubeEmbedUrl?: string;
  spotifyEmbedUrl?: string;
  googleHtmlLink?: string;
};

const ALLOWED_VENUES = new Set<VenueKey>(["fleda", "galerie", "bar", "fraktal"]);

function isValidDate(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function isValidSlug(value: string | undefined): value is string {
  return Boolean(value && value.trim());
}

function sanitizeShowStart(value: string | undefined): string {
  return value?.trim() || "";
}

function getReadOptions() {
  const readToken = process.env.SANITY_API_READ_TOKEN;
  const includeDrafts = process.env.SANITY_INCLUDE_DRAFT_EVENTS === "true" && Boolean(readToken);
  return {
    token: includeDrafts ? readToken : undefined,
    perspective: includeDrafts ? "previewDrafts" : "published",
    revalidate: 30,
  } as const;
}

function isValidCalendarEvent(item: RawCalendarEvent): item is RawCalendarEvent & {
  slug: string;
  title: string;
  date: string;
  venue: VenueKey;
} {
  return Boolean(
    isValidDate(item.date) &&
      isValidSlug(item.slug) &&
      item.title &&
      item.venue &&
      ALLOWED_VENUES.has(item.venue)
  );
}

function toCalendarEvent(item: RawCalendarEvent): CalendarEvent {
  return {
    id: item._id,
    slug: item.slug as string,
    date: item.date as string,
    time: sanitizeShowStart(item.showStart),
    title: item.title as string,
    venue: item.venue as VenueKey,
  };
}

export async function getProgramCalendarEvents(): Promise<CalendarEvent[]> {
  const query = `*[_type == "event" && confirmed == true && defined(programDate)] | order(programDate asc, startDateTime asc) {
    _id,
    "slug": slug.current,
    title,
    "date": programDate,
    venue,
    startDateTime,
    showStart
  }`;

  try {
    const result = await sanityQuery<RawCalendarEvent[]>(query, getReadOptions());

    return result
      .filter(isValidCalendarEvent)
      .map(toCalendarEvent);
  } catch (error) {
    console.error("Failed to fetch program events from Sanity:", error);
    return [];
  }
}

export async function getHeaderUpcomingEvent(): Promise<CalendarEvent | null> {
  const query = `*[_type == "upcoming" && _id == "upcoming"][0]{
    "event": event->{
      _id,
      "slug": slug.current,
      title,
      "date": programDate,
      venue,
      startDateTime,
      showStart,
      confirmed
    }
  }`;

  try {
    const result = await sanityQuery<{event?: RawCalendarEvent | null} | null>(query, getReadOptions());
    const selectedEvent = result?.event;

    if (selectedEvent?.confirmed && isValidCalendarEvent(selectedEvent)) {
      return toCalendarEvent(selectedEvent);
    }
  } catch (error) {
    console.error("Failed to fetch header upcoming event from Sanity:", error);
  }

  const [fallbackEvent] = await getProgramCalendarEvents();
  return fallbackEvent ?? null;
}

export async function getProgramEventBySlug(slug: string): Promise<ProgramEventDetail | null> {
  if (!isValidSlug(slug)) return null;

  const query = `*[_type == "event" && confirmed == true && slug.current == ${JSON.stringify(slug)}][0]{
    _id,
    "slug": slug.current,
    title,
    "date": programDate,
    venue,
    startDateTime,
    showStart,
    description,
    facebookEventLink,
    showTicketsButton,
    ticketsUrl,
    gooutIframeUrl,
    smsticketIframeUrl,
    youtubeEmbedUrl,
    spotifyEmbedUrl,
    googleHtmlLink
  }`;

  try {
    const result = await sanityQuery<RawProgramEventDetail | null>(query, getReadOptions());
    if (!result) return null;
    if (!isValidDate(result.date) || !isValidSlug(result.slug) || !result.title) return null;
    if (!result.venue || !ALLOWED_VENUES.has(result.venue)) return null;

    return {
      id: result._id,
      slug: result.slug,
      date: result.date,
      time: sanitizeShowStart(result.showStart),
      title: result.title,
      venue: result.venue,
      startDateTime: result.startDateTime,
      showStart: result.showStart,
      description: result.description,
      facebookEventLink: result.facebookEventLink,
      showTicketsButton: Boolean(result.showTicketsButton),
      ticketsUrl: result.ticketsUrl,
      gooutIframeUrl: result.gooutIframeUrl,
      smsticketIframeUrl: result.smsticketIframeUrl,
      youtubeEmbedUrl: result.youtubeEmbedUrl,
      spotifyEmbedUrl: result.spotifyEmbedUrl,
      googleHtmlLink: result.googleHtmlLink,
    };
  } catch (error) {
    console.error(`Failed to fetch program event "${slug}" from Sanity:`, error);
    return null;
  }
}
