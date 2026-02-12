export type VenueKey = "fleda" | "galerie" | "bar" | "fraktal";

export type PortableTextSpan = {
  _type: "span";
  text?: string;
};

export type PortableTextBlock = {
  _type: "block";
  children?: PortableTextSpan[];
};

export type CalendarEvent = {
  id: string;
  slug: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm, may be empty for all-day events
  title: string;
  venue: VenueKey;
};

export type ProgramEventDetail = {
  id: string;
  slug: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm, may be empty for all-day events
  title: string;
  venue: VenueKey;
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
