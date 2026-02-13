"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import EventTagButton from "@/components/BuildingBlocks/Buttons/EventTagButton";
import { formatCzWeekdayShort, formatProgramEventDate } from "@/utils/dateFormat";
import type { CalendarEvent, VenueKey } from "@/types/program";

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
const CALENDAR_WEEKDAYS = ["Po", "Ut", "St", "Ct", "Pa", "So", "Ne"] as const;
const VENUE_FILTER_OPTIONS: Array<{ value: "all" | VenueKey; label: string }> = [
  { value: "all", label: "Vše" },
  { value: "fleda", label: "Fleda" },
  { value: "bar", label: "Spektrum bar" },
  { value: "galerie", label: "Spektrum galerie" },
  { value: "fraktal", label: "Fraktal" },
];

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
      return { label: "FLEDA", glowColor: "bg-orange-500" };
  }
}

function calendarVenueClass(venue: VenueKey) {
  switch (venue) {
    case "galerie":
      return "bg-[#a3f730]/45 border-l-4 border-[#7ebf28]";
    case "bar":
      return "bg-[#ff9ff5]/45 border-l-4 border-[#f072e5]";
    case "fraktal":
      return "bg-[#2f5bff]/25 border-l-4 border-[#2f5bff]";
    case "fleda":
    default:
      return "bg-orange-300/55 border-l-4 border-orange-500";
  }
}

function monthLabelFromKey(key: string) {
  const [y, m] = key.split("-").map(Number);
  const monthIdx = (m ?? 1) - 1;
  const monthName = CZ_MONTHS[monthIdx] ?? key;
  return `${monthName} ${y}`;
}

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

type ProgramSectionProps = {
  programEvents?: CalendarEvent[];
  headingHref?: string;
  sectionId?: string;
};

export default function ProgramSection({
  programEvents = [],
  headingHref = "/program",
  sectionId = "program",
}: ProgramSectionProps) {
  const [activeView, setActiveView] = useState<"calendar" | "list" | "tiles">("list");
  const [activeVenueFilter, setActiveVenueFilter] = useState<"all" | VenueKey>("all");
  const currentMonthKey = useMemo(() => getCurrentMonthKey(), []);
  const months = useMemo(() => {
    const uniqueMonths = Array.from(
      new Set(
        programEvents
          .map((event) => event.date.slice(0, 7))
          .filter((monthKey) => /^\d{4}-\d{2}$/.test(monthKey))
      )
    ).sort();

    if (uniqueMonths.length === 0) {
      uniqueMonths.push(currentMonthKey);
    }

    return uniqueMonths;
  }, [programEvents, currentMonthKey]);

  const [activeMonth, setActiveMonth] = useState<string>(() =>
    months.includes(currentMonthKey) ? currentMonthKey : (months[0] ?? currentMonthKey)
  );

  useEffect(() => {
    if (!months.includes(activeMonth)) {
      setActiveMonth(months.includes(currentMonthKey) ? currentMonthKey : (months[0] ?? currentMonthKey));
    }
  }, [activeMonth, currentMonthKey, months]);

  const activeMonthIdx = months.indexOf(activeMonth);
  const events = useMemo(
    () =>
      programEvents
        .filter(
          (event) => event.date.startsWith(activeMonth) && (activeVenueFilter === "all" || event.venue === activeVenueFilter)
        )
        .slice()
        .sort((a, b) => {
          const aKey = `${a.date}T${a.time || "00:00"}`;
          const bKey = `${b.date}T${b.time || "00:00"}`;
          return aKey.localeCompare(bKey);
        }),
    [activeMonth, activeVenueFilter, programEvents]
  );

  const canPrev = activeMonthIdx > 0;
  const canNext = activeMonthIdx >= 0 && activeMonthIdx < months.length - 1;
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const byDate = map.get(event.date);
      if (byDate) {
        byDate.push(event);
      } else {
        map.set(event.date, [event]);
      }
    }
    return map;
  }, [events]);
  const calendarCells = useMemo(() => {
    const [yearRaw, monthRaw] = activeMonth.split("-").map(Number);
    const year = Number.isFinite(yearRaw) ? yearRaw : new Date().getFullYear();
    const month = Number.isFinite(monthRaw) ? monthRaw : 1;
    const firstDay = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstWeekdayIdx = (firstDay.getDay() + 6) % 7; // Monday first
    const todayKey = new Date().toISOString().slice(0, 10);
    const cells: Array<{ dateKey: string | null; day: number | null; events: CalendarEvent[]; isToday: boolean }> = [];

    for (let i = 0; i < firstWeekdayIdx; i += 1) {
      cells.push({ dateKey: null, day: null, events: [], isToday: false });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      cells.push({
        dateKey,
        day,
        events: eventsByDate.get(dateKey) ?? [],
        isToday: dateKey === todayKey,
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push({ dateKey: null, day: null, events: [], isToday: false });
    }

    return cells;
  }, [activeMonth, eventsByDate]);

  return (
    <div className="w-full" id={sectionId}>
      <h2 className="font-light text-xl sm:text-2xl text-black">
        <Link href={headingHref} className="inline-flex items-center gap-2">
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
        </Link>
      </h2>

      <div className="mt-4 w-full border border-black rounded-xl p-6 bg-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative inline-flex items-center">
              <label htmlFor="program-month" className="sr-only">
                Vyber měsíc
              </label>
              <select
                id="program-month"
                value={activeMonth}
                onChange={(e) => {
                  setActiveMonth(e.target.value);
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

            <div className="relative inline-flex items-center">
              <label htmlFor="program-venue-filter" className="sr-only">
                Filtr podle místa
              </label>
              <select
                id="program-venue-filter"
                value={activeVenueFilter}
                onChange={(e) => {
                  setActiveVenueFilter(e.target.value as "all" | VenueKey);
                }}
                className="appearance-none inline-flex items-center rounded-full border border-black px-4 py-1 pr-9 font-light text-sm sm:text-base bg-gray-200 focus:outline-none font-sans"
              >
                {VENUE_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 text-black/70">▾</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!canPrev) return;
                  const previousMonth = months[Math.max(0, activeMonthIdx - 1)];
                  if (previousMonth) setActiveMonth(previousMonth);
                }}
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
                onClick={() => {
                  if (!canNext) return;
                  const nextMonth = months[Math.min(months.length - 1, activeMonthIdx + 1)];
                  if (nextMonth) setActiveMonth(nextMonth);
                }}
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

          <div className="inline-flex items-center rounded-full border border-black overflow-hidden">
            <button
              type="button"
              onClick={() => {
                setActiveView("calendar");
              }}
              aria-pressed={activeView === "calendar"}
              className={`px-4 py-1.5 text-sm sm:text-base font-light transition-colors ${
                activeView === "calendar" ? "bg-black text-white" : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
            >
              Kalendář
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView("list");
              }}
              aria-pressed={activeView === "list"}
              className={`px-4 py-1.5 text-sm sm:text-base font-light border-l border-black transition-colors ${
                activeView === "list" ? "bg-black text-white" : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
            >
              Seznam
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView("tiles");
              }}
              aria-pressed={activeView === "tiles"}
              className={`px-4 py-1.5 text-sm sm:text-base font-light border-l border-black transition-colors ${
                activeView === "tiles" ? "bg-black text-white" : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
            >
              Dlaždice
            </button>
          </div>
        </div>

        {activeView === "calendar" ? (
          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[760px] rounded-lg overflow-hidden border border-black bg-black">
              <div className="grid grid-cols-7 gap-px bg-black">
                {CALENDAR_WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="bg-gray-300 px-2 py-2 text-center text-[11px] sm:text-xs font-light uppercase tracking-[0.04em] text-black/80"
                  >
                    {day}
                  </div>
                ))}

                {calendarCells.map((cell, idx) => (
                  <div key={`${cell.dateKey ?? "empty"}-${idx}`} className="min-h-[132px] bg-gray-200 p-2 flex flex-col">
                    {cell.day ? (
                      <>
                        <div className="flex justify-end">
                          <span
                            className={`text-xs font-light px-1.5 py-0.5 rounded ${
                              cell.isToday ? "bg-black text-white" : "text-black/80"
                            }`}
                          >
                            {cell.day}
                          </span>
                        </div>
                        <div className="mt-1 space-y-1 overflow-y-auto max-h-[96px] pr-1">
                          {cell.events.map((ev) => {
                            const eventHref = `/program/${encodeURIComponent(ev.slug)}`;
                            const tag = venueTag(ev.venue);
                            return (
                              <Link
                                key={`${ev.id}-${ev.slug}`}
                                href={eventHref}
                                className={`block rounded-md px-2 py-1 transition-colors hover:brightness-95 ${calendarVenueClass(
                                  ev.venue
                                )}`}
                              >
                                <div className="text-[10px] leading-tight text-black/70">{ev.time || "celý den"}</div>
                                <div className="text-[10px] leading-tight uppercase tracking-[0.04em]">{tag.label}</div>
                                <div className="mt-0.5 text-xs leading-tight break-words">{ev.title}</div>
                              </Link>
                            );
                          })}
                        </div>
                      </>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeView === "list" ? (
          <div className="mt-4 rounded-xl border border-black overflow-hidden bg-gray-300">
            <div className="max-h-[520px] overflow-y-auto px-4 sm:px-6 py-1">
              <div className="divide-y divide-black/20">
                {events.map((ev, idx) => {
                  const tag = venueTag(ev.venue);
                  const weekday = formatCzWeekdayShort(ev.date);
                  const timeLabel = ev.time || "celý den";
                  const eventHref = `/program/${encodeURIComponent(ev.slug)}`;
                  return (
                    <div key={`${ev.id}-${ev.date}-${ev.time}-${idx}`} className="py-4 flex items-center gap-4">
                      <div className="w-[110px] shrink-0 flex justify-start">
                        <EventTagButton glowColor={tag.glowColor}>{tag.label}</EventTagButton>
                      </div>

                      <div className="min-w-0 flex-1 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-black font-light text-sm sm:text-base">
                          <span className="whitespace-nowrap">{formatProgramEventDate(ev.date)}</span>
                          <span className="opacity-60">-</span>
                          <span className="whitespace-nowrap">{weekday}</span>
                          <span className="opacity-60">-</span>
                          <span className="whitespace-nowrap">{timeLabel}</span>
                        </div>
                        <div className="mt-1 font-light text-black text-base sm:text-lg leading-snug break-words">
                          {ev.title}
                        </div>
                      </div>

                      <div className="w-[110px] shrink-0 flex justify-end">
                        <EventTagButton href={eventHref} glowColor="bg-black/60" solidBlack>
                          Detail eventu
                        </EventTagButton>
                      </div>
                    </div>
                  );
                })}

                {events.length === 0 && (
                  <div className="py-6 text-sm font-light text-black/70">Na tento měsíc zatím nejsou žádné akce.</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            {events.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((ev, idx) => {
                  const tag = venueTag(ev.venue);
                  const weekday = formatCzWeekdayShort(ev.date);
                  const timeLabel = ev.time || "celý den";
                  const eventHref = `/program/${encodeURIComponent(ev.slug)}`;
                  return (
                    <article
                      key={`${ev.id}-${ev.date}-${ev.time}-${idx}`}
                      className="aspect-[3/4] bg-gray-400 p-4 sm:p-5 flex flex-col"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <EventTagButton glowColor={tag.glowColor}>{tag.label}</EventTagButton>
                        <span className="text-xs font-light text-black/70 whitespace-nowrap">{timeLabel}</span>
                      </div>

                      <div className="mt-4 font-light text-black text-base sm:text-lg leading-snug break-words">{ev.title}</div>

                      <div className="mt-2 text-sm font-light text-black/80 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="whitespace-nowrap">{formatProgramEventDate(ev.date)}</span>
                        <span className="opacity-60">-</span>
                        <span className="whitespace-nowrap">{weekday}</span>
                      </div>

                      <div className="mt-auto pt-1 flex justify-end">
                        <EventTagButton href={eventHref} glowColor="bg-black/60" solidBlack>
                          Detail eventu
                        </EventTagButton>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="py-2 text-sm font-light text-black/70">Na tento měsíc zatím nejsou žádné akce.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
