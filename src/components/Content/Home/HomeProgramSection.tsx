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

type HomeProgramSectionProps = {
  programEvents?: CalendarEvent[];
};

export default function HomeProgramSection({ programEvents = [] }: HomeProgramSectionProps) {
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
        .filter((event) => event.date.startsWith(activeMonth))
        .slice()
        .sort((a, b) => {
          const aKey = `${a.date}T${a.time || "00:00"}`;
          const bKey = `${b.date}T${b.time || "00:00"}`;
          return aKey.localeCompare(bKey);
        }),
    [activeMonth, programEvents]
  );

  const canPrev = activeMonthIdx > 0;
  const canNext = activeMonthIdx >= 0 && activeMonthIdx < months.length - 1;

  return (
    <div className="w-full">
      <h2 className="font-light text-xl sm:text-2xl text-black">
        <Link href="/program" className="inline-flex items-center gap-2">
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
        <div className="flex items-center justify-between gap-4">
          <div className="relative inline-flex items-center">
            <label htmlFor="home-program-month" className="sr-only">
              Vyber měsíc
            </label>
            <select
              id="home-program-month"
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

        <div className="mt-4 rounded-xl border border-black overflow-hidden bg-gray-300">
          <div className="max-h-[520px] overflow-y-auto px-4 sm:px-6 py-1">
            <div className="divide-y divide-black/20">
              {events.map((ev, idx) => {
                const tag = venueTag(ev.venue);
                const weekday = formatCzWeekdayShort(ev.date);
                const timeLabel = ev.time || "celý den";
                const eventHref = `/program/${encodeURIComponent(ev.slug)}`;
                return (
                  <div key={`${ev.id}-${ev.date}-${ev.time}-${idx}`} className="py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-black font-light text-sm sm:text-base">
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

                    <div className="shrink-0 self-center flex flex-col items-end gap-2">
                      <EventTagButton glowColor={tag.glowColor}>{tag.label}</EventTagButton>
                      <EventTagButton href={eventHref} glowColor="bg-black/60" solidBlack>
                        Detail
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
      </div>
    </div>
  );
}
