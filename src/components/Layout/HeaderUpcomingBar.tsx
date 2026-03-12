"use client";

import Link from "next/link";
import type { CalendarEvent } from "@/types/program";
import {
  formatCzWeekdayLong,
  formatProgramEventDate,
} from "@/utils/dateFormat";

type HeaderUpcomingBarProps = {
  upcomingEvent?: CalendarEvent | null;
};

export default function HeaderUpcomingBar({
  upcomingEvent = null,
}: HeaderUpcomingBarProps) {
  const href = upcomingEvent ? `/program/${upcomingEvent.slug}` : "/program";
  const dateLabel = upcomingEvent ? formatProgramEventDate(upcomingEvent.date).toUpperCase() : "";
  const dayLabelFull = upcomingEvent ? formatCzWeekdayLong(upcomingEvent.date).toUpperCase() : "";
  const titleLabel = upcomingEvent ? upcomingEvent.title.toUpperCase() : "NEXT CONFIRMED EVENT SOON";
  const baseTextClass =
    "text-[0.64em] font-light uppercase leading-none tracking-[0.01em] text-white sm:text-[0.72em]";

  return (
    <Link
      href={href}
      className="flex min-h-[2.85rem] w-full items-center bg-black px-4 py-3 transition-colors hover:bg-[#111111] sm:min-h-[3.1rem] sm:px-6"
      aria-label={upcomingEvent ? `Nadcházející akce: ${upcomingEvent.title}` : "Program"}
    >
      {upcomingEvent ? (
        <div className={`flex w-full min-w-0 flex-wrap items-center justify-center gap-x-[1.15em] gap-y-[0.45em] text-center ${baseTextClass}`}>
          <span className="flex min-w-0 items-center justify-center gap-[0.65em] whitespace-nowrap">
            <span
              aria-hidden="true"
              className="h-[0.65em] w-[0.65em] shrink-0 rounded-full bg-[#ff6a00] shadow-[0_0_0.6em_0.16em_rgba(255,106,0,0.75)] animate-pulse"
            />
            <span className="shrink-0 whitespace-nowrap">DO NOT MISS:</span>
            <span className="whitespace-nowrap">{titleLabel}</span>
          </span>
          <span className="whitespace-nowrap">{dateLabel}</span>
          <span className="whitespace-nowrap">{dayLabelFull}</span>
        </div>
      ) : (
        <div className={`flex w-full items-center justify-center gap-[0.65em] ${baseTextClass}`}>
          <span
            aria-hidden="true"
            className="h-[0.65em] w-[0.65em] shrink-0 rounded-full bg-[#ff6a00] shadow-[0_0_0.6em_0.16em_rgba(255,106,0,0.75)] animate-pulse"
          />
          <span className="truncate text-center">{titleLabel}</span>
        </div>
      )}
    </Link>
  );
}
