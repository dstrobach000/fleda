"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import GlowButton from "@/components/BuildingBlocks/Buttons/GlowButton";
import { formatCzWeekdayShort, formatProgramEventDate } from "@/utils/dateFormat";

const BlueprintSlot = dynamic(() => import("@/components/BuildingBlocks/3D/BlueprintSlot"), {
  ssr: false,
  loading: () => <div className="w-full h-[180px] bg-gray-100 animate-pulse rounded-xl border border-black" />,
});

type MonthKey = "2025-12" | "2026-01" | "2026-02";

type VenueKey = "fleda" | "galerie" | "bar" | "fraktal";

type CalendarEvent = {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  title: string;
  venue: VenueKey;
};

const CZ_MONTHS: Record<number, string> = {
  0: "Leden",
  1: "Únor",
  2: "Březen",
  3: "Duben",
  4: "Květen",
  5: "Červen",
  6: "Červenec",
  7: "Srpen",
  8: "Září",
  9: "Říjen",
  10: "Listopad",
  11: "Prosinec",
};

function venueTag(venue: VenueKey): { label: string; glowColor: string } {
  switch (venue) {
    case "galerie":
      return { label: "GALERIE", glowColor: "bg-[#a3f730]" };
    case "bar":
      return { label: "BAR", glowColor: "bg-[#ff9ff5]" };
    case "fraktal":
      return { label: "FRAKTAL", glowColor: "bg-[#2f5bff]" };
    case "fleda":
    default:
      return { label: "FLÉDA", glowColor: "bg-orange-500" };
  }
}

function monthLabelFromKey(key: MonthKey) {
  const [y, m] = key.split("-").map(Number);
  const monthIdx = (m ?? 1) - 1;
  const monthName = CZ_MONTHS[monthIdx] ?? key;
  return `${monthName} ${y}`;
}

export default function ProgramAndNewsSection() {
  const months: MonthKey[] = ["2025-12", "2026-01", "2026-02"];

  const eventsByMonth = useMemo<Record<MonthKey, CalendarEvent[]>>(
    () => ({
      "2025-12": [
        // Galerie (1× / month)
        { date: "2025-12-05", time: "19:00", title: "Vernisáž Tone-Deaf", venue: "galerie" },

        // Bar (2× weekly: Thu + Sat)
        { date: "2025-12-04", time: "20:00", title: "Listening session w/ Lower Education", venue: "bar" },
        { date: "2025-12-06", time: "20:00", title: "Listening session w/ Máúcta", venue: "bar" },
        { date: "2025-12-11", time: "20:00", title: "Listening session w/ Adamovia", venue: "bar" },
        { date: "2025-12-13", time: "20:00", title: "Listening session w/ Hnát", venue: "bar" },
        { date: "2025-12-18", time: "20:00", title: "Listening session w/ Lower Education", venue: "bar" },
        { date: "2025-12-20", time: "20:00", title: "Listening session w/ Máúcta", venue: "bar" },
        { date: "2025-12-25", time: "20:00", title: "Listening session w/ Adamovia", venue: "bar" },
        { date: "2025-12-27", time: "20:00", title: "Listening session w/ Hnát", venue: "bar" },

        // Fraktal (Fri/Sat + STITCH sometimes)
        { date: "2025-12-12", time: "20:00", title: "URNA", venue: "fraktal" },
        { date: "2025-12-19", time: "20:00", title: "Tales from the Hole", venue: "fraktal" },
        { date: "2025-12-26", time: "20:00", title: "Melehale", venue: "fraktal" },
        { date: "2025-12-29", time: "20:00", title: "STITCH", venue: "fraktal" },

        // Fléda (bands, keep SUPPORT etc.)
        { date: "2025-12-03", time: "20:00", title: "SWANS, SUPPORT, SUPPORT", venue: "fleda" },
        { date: "2025-12-10", time: "20:00", title: "SUNN O))), SUPPORT", venue: "fleda" },
        { date: "2025-12-21", time: "20:00", title: "The Ecstasy of Saint Theresa, SUPPORT", venue: "fleda" },
      ],
      "2026-01": [
        // Galerie (1× / month)
        { date: "2026-01-09", time: "19:00", title: "Vernisáž Weary Shout", venue: "galerie" },

        // Bar (2× weekly: Thu + Sat)
        { date: "2026-01-01", time: "20:00", title: "Listening session w/ Lower Education", venue: "bar" },
        { date: "2026-01-03", time: "20:00", title: "Listening session w/ Máúcta", venue: "bar" },
        { date: "2026-01-08", time: "20:00", title: "Listening session w/ Adamovia", venue: "bar" },
        { date: "2026-01-10", time: "20:00", title: "Listening session w/ Hnát", venue: "bar" },
        { date: "2026-01-15", time: "20:00", title: "Listening session w/ Lower Education", venue: "bar" },
        { date: "2026-01-17", time: "20:00", title: "Listening session w/ Máúcta", venue: "bar" },
        { date: "2026-01-22", time: "20:00", title: "Listening session w/ Adamovia", venue: "bar" },
        { date: "2026-01-24", time: "20:00", title: "Listening session w/ Hnát", venue: "bar" },
        { date: "2026-01-29", time: "20:00", title: "Listening session w/ Lower Education", venue: "bar" },
        { date: "2026-01-31", time: "20:00", title: "Listening session w/ Máúcta", venue: "bar" },

        // Fraktal
        { date: "2026-01-16", time: "20:00", title: "Tales from the Hole", venue: "fraktal" },
        { date: "2026-01-27", time: "20:00", title: "STITCH", venue: "fraktal" },

        // Fléda
        { date: "2026-01-10", time: "20:00", title: "SWANS, SUPPORT, SUPPORT", venue: "fleda" },
        { date: "2026-01-17", time: "20:00", title: "SUNN O))), SUPPORT", venue: "fleda" },
      ],
      "2026-02": [
        // Galerie (1× / month)
        { date: "2026-02-06", time: "19:00", title: "Vernisáž Atlas neznámých květin", venue: "galerie" },

        // Bar (2× weekly: Thu + Sat)
        { date: "2026-02-05", time: "20:00", title: "Listening session w/ Lower Education", venue: "bar" },
        { date: "2026-02-07", time: "20:00", title: "Listening session w/ Máúcta", venue: "bar" },
        { date: "2026-02-12", time: "20:00", title: "Listening session w/ Adamovia", venue: "bar" },
        { date: "2026-02-14", time: "20:00", title: "Listening session w/ Hnát", venue: "bar" },
        { date: "2026-02-19", time: "20:00", title: "Listening session w/ Lower Education", venue: "bar" },
        { date: "2026-02-21", time: "20:00", title: "Listening session w/ Máúcta", venue: "bar" },
        { date: "2026-02-26", time: "20:00", title: "Listening session w/ Adamovia", venue: "bar" },
        { date: "2026-02-28", time: "20:00", title: "Listening session w/ Hnát", venue: "bar" },

        // Fraktal
        { date: "2026-02-03", time: "20:00", title: "STITCH", venue: "fraktal" },
        { date: "2026-02-13", time: "20:00", title: "URNA", venue: "fraktal" },
        { date: "2026-02-20", time: "20:00", title: "Melehale", venue: "fraktal" },
        { date: "2026-02-27", time: "20:00", title: "Tales from the Hole", venue: "fraktal" },

        // Fléda
        { date: "2026-02-08", time: "20:00", title: "HEALTH, SUPPORT", venue: "fleda" },
        { date: "2026-02-15", time: "20:00", title: "AUTECHRE, SUPPORT", venue: "fleda" },
        { date: "2026-02-22", time: "20:00", title: "The Ecstasy of Saint Theresa, SUPPORT", venue: "fleda" },
      ],
    }),
    []
  );

  const [activeMonthIdx, setActiveMonthIdx] = useState(1); // default: Jan 2026
  const activeMonth = months[activeMonthIdx] ?? "2026-01";
  const events = (eventsByMonth[activeMonth] ?? []).slice().sort((a, b) => {
    const aKey = `${a.date}T${a.time}`;
    const bKey = `${b.date}T${b.time}`;
    return aKey.localeCompare(bKey);
  });

  const canPrev = activeMonthIdx > 0;
  const canNext = activeMonthIdx < months.length - 1;

  return (
    <section className="px-6 pt-6 pb-4 bg-gray-200" id="program">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PROGRAM */}
        <div className="w-full">
          <h2 className="font-light text-xl sm:text-2xl text-black">
            <a href="#" className="inline-flex items-center gap-2">
              <span>Program</span>
              <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-black">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14"></path>
                  <path d="m13 5 7 7-7 7"></path>
                </svg>
              </span>
            </a>
          </h2>

          <div className="mt-4 w-full border border-black rounded-xl p-6 bg-gray-200">
            <div className="flex items-center justify-between gap-4">
            <div className="relative inline-flex items-center">
              <label htmlFor="program-month" className="sr-only">
                Vyber měsíc
              </label>
              <select
                id="program-month"
                value={activeMonth}
                onChange={(e) => {
                  const idx = months.indexOf(e.target.value as MonthKey);
                  if (idx >= 0) setActiveMonthIdx(idx);
                }}
                className="appearance-none inline-flex items-center rounded-full border border-black px-4 py-1 pr-9 font-light text-base sm:text-lg bg-gray-200 focus:outline-none font-sans"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {monthLabelFromKey(m)}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 text-black/70">▾</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => canPrev && setActiveMonthIdx((i) => Math.max(0, i - 1))}
                disabled={!canPrev}
                aria-label="Předchozí měsíc"
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full font-light text-black border border-black bg-transparent transition-colors flex items-center justify-center ${
                  canPrev ? "hover:bg-gray-300" : "opacity-40 cursor-not-allowed"
                }`}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => canNext && setActiveMonthIdx((i) => Math.min(months.length - 1, i + 1))}
                disabled={!canNext}
                aria-label="Další měsíc"
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full font-light text-black border border-black bg-transparent transition-colors flex items-center justify-center ${
                  canNext ? "hover:bg-gray-300" : "opacity-40 cursor-not-allowed"
                }`}
              >
                ›
              </button>
            </div>
          </div>

            <div className="mt-4 rounded-xl border border-black overflow-hidden bg-gray-300">
              <div className="max-h-[520px] overflow-y-auto px-4 sm:px-6 py-1">
                <div className="divide-y divide-black/20">
                  {events.map((ev, idx) => {
                    const tag = venueTag(ev.venue);
                    const weekday = formatCzWeekdayShort(ev.date);
                    return (
                      <div
                        key={`${ev.date}-${ev.time}-${idx}`}
                        className="py-4 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-black font-light text-sm sm:text-base">
                            <span className="whitespace-nowrap">{formatProgramEventDate(ev.date)}</span>
                            <span className="opacity-60">-</span>
                            <span className="whitespace-nowrap">{weekday}</span>
                            <span className="opacity-60">-</span>
                            <span className="whitespace-nowrap">{ev.time}</span>
                          </div>
                          <div className="mt-1 font-light text-black text-base sm:text-lg leading-snug break-words">
                            {ev.title}
                          </div>
                        </div>

                        <div className="shrink-0 self-center">
                          <GlowButton
                            link="#"
                            glowColor={tag.glowColor}
                            floating={false}
                            className="!px-2.5 !py-1 text-[11px] sm:text-xs whitespace-nowrap"
                          >
                            {tag.label}
                          </GlowButton>
                        </div>
                      </div>
                    );
                  })}

                  {events.length === 0 && (
                    <div className="py-6 text-sm font-light text-black/70">
                      Na tento měsíc zatím nejsou žádné akce.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right column stack: mobile shows Brick before Novinky; desktop shows Novinky then Brick */}
        <div className="w-full flex flex-col gap-6">
          {/* Brick */}
          <div className="order-1 lg:order-2 w-full">
            <BlueprintSlot containerClassName="w-full h-[190px] sm:h-[220px] lg:h-[240px]" />
          </div>

          {/* NOVINKY */}
          <div className="order-2 lg:order-1 w-full" id="novinky">
            <h2 className="font-light text-xl sm:text-2xl text-black">
              <a href="#" className="inline-flex items-center gap-2">
                <span>Novinky</span>
                <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-black">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m13 5 7 7-7 7"></path>
                  </svg>
                </span>
              </a>
            </h2>

            <div className="mt-4 w-full border border-black rounded-xl p-6 bg-gray-200">
              <div className="grid grid-cols-1 gap-6">
                <div className="border border-black rounded-xl p-6 bg-gray-300">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-light text-black/70 mb-3">
                    <span className="whitespace-nowrap">12. 01. 26</span>
                    <span className="opacity-60"> - </span>
                    <span className="whitespace-nowrap">Fléda</span>
                    <span className="opacity-60"> - </span>
                    <span className="whitespace-nowrap">Novinka</span>
                  </div>
                  <p className="font-light text-black leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque finibus, nibh at tincidunt
                    tincidunt, magna sem suscipit libero, vel tincidunt arcu erat sed massa.
                  </p>
                </div>
                <div className="border border-black rounded-xl p-6 bg-gray-300">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-light text-black/70 mb-3">
                    <span className="whitespace-nowrap">05. 01. 26</span>
                    <span className="opacity-60"> - </span>
                    <span className="whitespace-nowrap">Fléda</span>
                    <span className="opacity-60"> - </span>
                    <span className="whitespace-nowrap">Oznámení</span>
                  </div>
                  <p className="font-light text-black leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean posuere, justo at molestie dignissim,
                    tortor risus tempus ex, eu scelerisque ipsum tortor sed lectus.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <GlowButton link="#" glowColor="bg-orange-500" floating={false}>
                  ARCHIV
                </GlowButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

