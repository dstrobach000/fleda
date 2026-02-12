export type VenueKey = "fleda" | "galerie" | "bar" | "fraktal";

export type CalendarEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm, may be empty for all-day events
  title: string;
  venue: VenueKey;
};
