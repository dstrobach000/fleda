import type {CalendarEvent, VenueKey} from "@/types/program";
import {sanityQuery} from "@/lib/sanityApi";

type RawCalendarEvent = {
  _id: string;
  title?: string;
  date?: string;
  time?: string;
  venue?: VenueKey;
};

const ALLOWED_VENUES = new Set<VenueKey>(["fleda", "galerie", "bar", "fraktal"]);

function isValidDate(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function sanitizeTime(value: string | undefined): string {
  if (!value) return "";
  if (/^\d{2}:\d{2}$/.test(value)) return value;
  return "";
}

export async function getProgramCalendarEvents(): Promise<CalendarEvent[]> {
  const readToken = process.env.SANITY_API_READ_TOKEN;
  const includeDrafts = process.env.SANITY_INCLUDE_DRAFT_EVENTS === "true" && Boolean(readToken);

  const query = `*[_type == "event" && confirmed == true && defined(programDate)] | order(programDate asc, programTime asc) {
    _id,
    title,
    "date": programDate,
    "time": programTime,
    venue
  }`;

  try {
    const result = await sanityQuery<RawCalendarEvent[]>(query, {
      token: includeDrafts ? readToken : undefined,
      perspective: includeDrafts ? "previewDrafts" : "published",
      revalidate: 30,
    });

    return result
      .filter((item) => isValidDate(item.date) && item.title && item.venue && ALLOWED_VENUES.has(item.venue))
      .map((item) => ({
        id: item._id,
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
