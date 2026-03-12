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
  const titleLabel = upcomingEvent ? upcomingEvent.title.toUpperCase() : "DO NOT MISS: NEXT CONFIRMED EVENT SOON";
  const baseTextClass = "text-[0.64em] font-light uppercase leading-none text-white sm:text-[0.72em]";

  return (
    <Link
      href={href}
      className="flex h-[calc(var(--header-control-size)*0.95)] w-full min-w-0 items-center rounded-full bg-black px-[1em] transition-colors hover:bg-[#111111]"
      aria-label={upcomingEvent ? `Nadcházející akce: ${upcomingEvent.title}` : "Program"}
    >
      {upcomingEvent ? (
        <div className={`grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-[0.9em] ${baseTextClass}`}>
          <span className="flex min-w-0 items-center gap-[0.65em] overflow-hidden whitespace-nowrap text-left">
            <span
              aria-hidden="true"
              className="h-[0.65em] w-[0.65em] shrink-0 rounded-full bg-[#ff6a00] shadow-[0_0_0.6em_0.16em_rgba(255,106,0,0.75)] animate-pulse"
            />
            <span className="shrink-0 whitespace-nowrap">DO NOT MISS:</span>
            <span className="min-w-0 truncate">{titleLabel}</span>
          </span>
          <span className="whitespace-nowrap text-center">
            {dateLabel}
          </span>
          <span className="min-w-0 whitespace-nowrap text-right">
            {dayLabelFull}
          </span>
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
