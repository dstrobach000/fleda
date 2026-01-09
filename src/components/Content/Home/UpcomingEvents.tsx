"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import GlowButton from "@/components/BuildingBlocks/Buttons/GlowButton";
import { formatCzDateLong, formatCzWeekdayLong } from "@/utils/dateFormat";

type UpcomingItem = {
  isoDate: string; // YYYY-MM-DD
  endIsoDate?: string; // YYYY-MM-DD (optional range end)
  time: string;
  performers: string;
  imageSrc: string;
};

const TICK_MS = 5000;

export default function UpcomingEvents() {
  const items: UpcomingItem[] = useMemo(
    () => [
      {
        isoDate: "2026-01-12",
        endIsoDate: "2026-01-12",
        time: "20:00",
        performers: "SWANS, SUPPORT, SUPPORT",
        imageSrc: "/images/bands/swans.jpg",
      },
      {
        isoDate: "2026-01-13",
        endIsoDate: "2026-01-13",
        time: "21:00",
        performers: "HEALTH, SUPPORT",
        imageSrc: "/images/bands/health.jpg",
      },
      {
        isoDate: "2026-01-14",
        endIsoDate: "2026-01-14",
        time: "22:00",
        performers: "AUTECHRE, SUPPORT",
        imageSrc: "/images/bands/autechre.jpg",
      },
      {
        isoDate: "2026-01-15",
        endIsoDate: "2026-01-15",
        time: "21:00",
        performers: "A PLACE TO BURY STRANGERS, SUPPORT, SUPPORT",
        imageSrc: "/images/bands/aptbs.jpg",
      },
    ],
    []
  );

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => {
      setActiveIdx((i) => (i + 1) % items.length);
    }, TICK_MS);
    return () => window.clearInterval(t);
  }, [items.length]);

  const active = items[activeIdx];
  if (!active) return null;
  const startLong = formatCzDateLong(active.isoDate);
  const endLong = formatCzDateLong(active.endIsoDate ?? active.isoDate);
  const dateText =
    active.endIsoDate && active.endIsoDate !== active.isoDate ? `${startLong} – ${endLong}` : startLong;
  const weekday = formatCzWeekdayLong(active.isoDate);

  return (
    <section className="py-6 bg-gray-200" id="upcoming">
      <div className="px-6 mb-4">
        <h2 className="font-light text-xl sm:text-2xl text-black">Upcoming</h2>
      </div>

      {/* Above-image compact label (no animation, single line) */}
      <div className="px-6 mb-4">
        <div className="rounded-full border border-black bg-gray-200 px-4 py-2">
          {/* Mobile: 2 stacked lines (center). Desktop+: 2 columns (center/right). */}
          <div className="text-base font-light text-black sm:text-lg uppercase">
            <div className="flex flex-col items-center text-center gap-1 sm:hidden">
              <div className="whitespace-nowrap text-center">
                {dateText} - {weekday} - {active.time}
              </div>
              <div className="break-words text-center">{active.performers}</div>
            </div>

            <div className="hidden sm:grid sm:grid-cols-2 sm:items-center sm:gap-3">
              <div className="text-left whitespace-nowrap overflow-hidden text-ellipsis">
                {dateText} - {weekday} - {active.time}
              </div>
              <div className="text-right whitespace-nowrap overflow-hidden text-ellipsis">
                {active.performers}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="relative w-full overflow-hidden rounded-xl">
          <div className="relative w-full aspect-[21/9] sm:aspect-[16/7]">
          <Image
            key={active.imageSrc}
            src={active.imageSrc}
            alt={active.performers}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />

          {/* PŘEDPRODEJ stays centered */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="pointer-events-auto">
              <GlowButton
                link="#"
                glowColor="bg-orange-500"
                floating={false}
                className="!px-4 !py-2 text-sm sm:text-base whitespace-nowrap"
              >
                PŘEDPRODEJ
              </GlowButton>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}


