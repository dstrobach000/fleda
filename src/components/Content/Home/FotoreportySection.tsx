"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import GlowButton from "@/components/BuildingBlocks/Buttons/GlowButton";

type PhotoItem = {
  date: string;
  performers: string;
  imageSrc: string;
};

const TICK_MS = 5000;

export default function FotoreportySection() {
  const items: PhotoItem[] = useMemo(
    () => [
      {
        date: "12. 01. 26",
        performers: "SWANS, SUPPORT, SUPPORT",
        imageSrc: "/images/photoreports/fotoreport1.jpg",
      },
      {
        date: "13. 01. 26",
        performers: "HEALTH, SUPPORT",
        imageSrc: "/images/photoreports/fotoreport2.jpg",
      },
      {
        date: "14. 01. 26",
        performers: "AUTECHRE, SUPPORT",
        imageSrc: "/images/photoreports/fotoreport3.jpg",
      },
      {
        date: "15. 01. 26",
        performers: "A PLACE TO BURY STRANGERS, SUPPORT, SUPPORT",
        imageSrc: "/images/photoreports/fotoreport4.jpg",
      },
    ],
    []
  );

  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setActiveIdx((i) => (i + 1) % items.length), TICK_MS);
    return () => window.clearInterval(t);
  }, [items.length]);

  const active = items[activeIdx];

  return (
    <section className="px-6 pt-4 pb-6 bg-gray-200" id="fotoreporty">
      <div className="w-full">
        <h2 className="font-light text-xl sm:text-2xl text-black">Fotoreporty</h2>

        <div className="mt-4 relative w-full overflow-hidden rounded-xl">
          <div className="relative w-full aspect-[16/9]">
            <Image
              key={active.imageSrc}
              src={active.imageSrc}
              alt={active.performers}
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <GlowButton link="#" glowColor="bg-orange-500" floating={false} className="text-base sm:text-lg">
                <div className="flex flex-col items-center text-center leading-tight">
                  <div className="whitespace-nowrap">{active.date}</div>
                  <div className="whitespace-normal break-words">{active.performers}</div>
                </div>
              </GlowButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


