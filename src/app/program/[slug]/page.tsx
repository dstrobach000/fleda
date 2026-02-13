import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Layout/Header";
import Navigation from "@/components/Layout/Navigation";
import Footer from "@/components/Layout/Footer";
import GlowButton from "@/components/BuildingBlocks/Buttons/GlowButton";
import { getProgramEventBySlug } from "@/lib/programEvents";
import type { PortableTextBlock, VenueKey } from "@/types/program";
import { formatCzDateLong, formatCzWeekdayLong } from "@/utils/dateFormat";

type ProgramEventPageProps = {
  params: Promise<{ slug: string }>;
};

const VENUE_LABELS: Record<VenueKey, string> = {
  fleda: "Fleda",
  fraktal: "Fraktal",
  bar: "Spektrum bar",
  galerie: "Spektrum galerie",
};

const FACEBOOK_FALLBACK_URL = "https://facebook.com";

function formatDateTimeWithZone(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Prague",
  }).format(date);
}

function portableTextToParagraphs(blocks?: PortableTextBlock[]) {
  if (!Array.isArray(blocks)) return [];
  return blocks
    .filter((block) => block?._type === "block")
    .map((block) => (block.children ?? []).map((span) => span.text ?? "").join("").trim())
    .filter((text) => text.length > 0);
}

export async function generateMetadata({ params }: ProgramEventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getProgramEventBySlug(slug);

  if (!event) {
    return {
      title: "Akce nenalezena",
    };
  }

  const venueLabel = VENUE_LABELS[event.venue];
  const dateLabel = formatCzDateLong(event.date);
  const timeLabel = event.time || "celý den";

  return {
    title: event.title,
    description: `${dateLabel} - ${timeLabel} - ${venueLabel}`,
  };
}

export default async function ProgramEventPage({ params }: ProgramEventPageProps) {
  const { slug } = await params;
  const event = await getProgramEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const dateLabel = formatCzDateLong(event.date);
  const weekdayLabel = formatCzWeekdayLong(event.date);
  const venueLabel = VENUE_LABELS[event.venue];
  const startDateTimeLabel = formatDateTimeWithZone(event.startDateTime);
  const endDateTimeLabel = formatDateTimeWithZone(event.endDateTime);
  const startLabel = startDateTimeLabel ?? (event.time ? `${dateLabel} ${event.time}` : `${dateLabel} celý den`);
  const descriptionParagraphs = portableTextToParagraphs(event.description);
  const facebookEventHref = event.facebookEventLink || FACEBOOK_FALLBACK_URL;

  return (
    <main className="bg-gray-200 text-black font-sans flex flex-col min-h-screen">
      <div className="max-w-[1200px] mx-auto w-full flex-grow">
        <Header />
        <div className="sm:sticky sm:top-0 z-50 bg-transparent">
          <div className="px-6 pt-0 pb-2 sm:pt-2">
            <Navigation />
          </div>
        </div>

        <section className="px-6 pt-6 pb-8">
          <div className="w-full border border-black rounded-xl p-6 sm:p-8 bg-gray-200">
            <p className="font-light text-xs sm:text-sm uppercase tracking-[0.16em] text-black/70">
              Program / {venueLabel}
            </p>

            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <h1 className="font-light text-3xl sm:text-5xl leading-tight">{event.title}</h1>
              <div className="flex flex-wrap gap-3 sm:justify-end sm:shrink-0">
                <GlowButton link="/program" glowColor="bg-orange-500" floating={false}>
                  ZPĚT NA PROGRAM
                </GlowButton>
                <GlowButton link={facebookEventHref} glowColor="bg-[#2f5bff]" floating={false} forceNewTab>
                  FACEBOOK EVENT
                </GlowButton>
              </div>
            </div>

            <div className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-black bg-gray-300 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-black/60">Datum</p>
                  <p className="mt-2 text-lg font-light">{dateLabel}</p>
                  <p className="text-sm text-black/70">{weekdayLabel}</p>
                </div>

                <div className="rounded-xl border border-black bg-gray-300 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-black/60">Termín</p>
                  <div className="mt-2 space-y-1 text-sm font-light text-black/90">
                    <p>
                      <span className="text-black/65">Začátek:</span> {startLabel}
                    </p>
                    {endDateTimeLabel && (
                      <p>
                        <span className="text-black/65">Konec:</span> {endDateTimeLabel}
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-black bg-gray-300 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-black/60">Místo</p>
                  <p className="mt-2 text-lg font-light">{venueLabel}</p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-black bg-gray-300 p-5">
                <h2 className="text-lg sm:text-xl font-light">Popis akce</h2>
                {descriptionParagraphs.length > 0 ? (
                  <div className="mt-2 space-y-2 text-sm sm:text-base font-light text-black/80 leading-relaxed">
                    {descriptionParagraphs.map((paragraph, idx) => (
                      <p key={`${event.id}-description-${idx}`}>{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm sm:text-base font-light text-black/80 leading-relaxed">
                    Zatím bez popisu. Doplňte text do pole Popis akce v Sanity.
                  </p>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="rounded-xl border border-black bg-gray-300 p-4">
                  <p className="text-xs tracking-[0.14em] text-black/60">goout</p>
                  {event.gooutIframeUrl ? (
                    <iframe
                      src={event.gooutIframeUrl}
                      title="goout"
                      loading="lazy"
                      className="mt-3 w-full h-44 rounded-lg border border-black/20 bg-gray-200"
                    />
                  ) : (
                    <div className="mt-3 h-44 rounded-lg border border-black/20 bg-gray-200 flex items-center justify-center text-black/55 text-sm font-light">
                      goout
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-black bg-gray-300 p-4">
                  <p className="text-xs tracking-[0.14em] text-black/60">smsticket</p>
                  {event.smsticketIframeUrl ? (
                    <iframe
                      src={event.smsticketIframeUrl}
                      title="smsticket"
                      loading="lazy"
                      className="mt-3 w-full h-44 rounded-lg border border-black/20 bg-gray-200"
                    />
                  ) : (
                    <div className="mt-3 h-44 rounded-lg border border-black/20 bg-gray-200 flex items-center justify-center text-black/55 text-sm font-light">
                      smsticket
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-black bg-gray-300 p-4">
                  <p className="text-xs tracking-[0.14em] text-black/60">youtube video</p>
                  {event.youtubeEmbedUrl ? (
                    <iframe
                      src={event.youtubeEmbedUrl}
                      title="youtube video"
                      loading="lazy"
                      className="mt-3 w-full h-44 rounded-lg border border-black/20 bg-gray-200"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div className="mt-3 h-44 rounded-lg border border-black/20 bg-gray-200 flex items-center justify-center text-black/55 text-sm font-light">
                      youtube video
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-black bg-gray-300 p-4">
                  <p className="text-xs tracking-[0.14em] text-black/60">spotify</p>
                  {event.spotifyEmbedUrl ? (
                    <iframe
                      src={event.spotifyEmbedUrl}
                      title="spotify"
                      loading="lazy"
                      className="mt-3 w-full h-44 rounded-lg border border-black/20 bg-gray-200"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    />
                  ) : (
                    <div className="mt-3 h-44 rounded-lg border border-black/20 bg-gray-200 flex items-center justify-center text-black/55 text-sm font-light">
                      spotify
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-black bg-gray-300 p-4">
                  <p className="text-xs tracking-[0.14em] text-black/60">grafika</p>
                  <div className="mt-3 w-full aspect-square rounded-lg border border-black/20 bg-gray-200 flex items-center justify-center">
                    <span className="font-light text-sm uppercase tracking-[0.14em] text-black/65">GRAFIKA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
