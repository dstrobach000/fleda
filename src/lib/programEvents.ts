import type {CalendarEvent, PortableTextBlock, ProgramEventDetail, VenueKey} from "@/types/program";
import {sanityQuery} from "@/lib/sanityApi";

type RawCalendarEvent = {
  _id: string;
  slug?: string;
  title?: string;
  date?: string;
  time?: string;
  venue?: VenueKey;
};

type RawProgramEventDetail = {
  _id: string;
  slug?: string;
  title?: string;
  date?: string;
  time?: string;
  venue?: VenueKey;
  startDateTime?: string;
  endDateTime?: string;
  description?: PortableTextBlock[];
  facebookEventLink?: string;
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

function sanitizeTime(value: string | undefined): string {
  if (!value) return "";
  if (/^\d{2}:\d{2}$/.test(value)) return value;
  return "";
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

export async function getProgramCalendarEvents(): Promise<CalendarEvent[]> {
  const query = `*[_type == "event" && confirmed == true && defined(programDate)] | order(programDate asc, programTime asc) {
    _id,
    "slug": slug.current,
    title,
    "date": programDate,
    "time": programTime,
    venue
  }`;

  try {
    const result = await sanityQuery<RawCalendarEvent[]>(query, getReadOptions());

    return result
      .filter(
        (item) =>
          isValidDate(item.date) &&
          isValidSlug(item.slug) &&
          item.title &&
          item.venue &&
          ALLOWED_VENUES.has(item.venue)
      )
      .map((item) => ({
        id: item._id,
        slug: item.slug as string,
        date: item.date as string,
        time: sanitizeTime(item.time),
        title: item.title as string,
        venue: item.venue as VenueKey,
      }));
  } catch (error) {
    console.error("Failed to fetch program events from Sanity:", error);
    return [];
  }
}

export async function getProgramEventBySlug(slug: string): Promise<ProgramEventDetail | null> {
  if (!isValidSlug(slug)) return null;

  const query = `*[_type == "event" && confirmed == true && slug.current == ${JSON.stringify(slug)}][0]{
    _id,
    "slug": slug.current,
    title,
    "date": programDate,
    "time": programTime,
    venue,
    startDateTime,
    endDateTime,
    description,
    facebookEventLink,
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
      time: sanitizeTime(result.time),
      title: result.title,
      venue: result.venue,
      startDateTime: result.startDateTime,
      endDateTime: result.endDateTime,
      description: result.description,
      facebookEventLink: result.facebookEventLink,
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
