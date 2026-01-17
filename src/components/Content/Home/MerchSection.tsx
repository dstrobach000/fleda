"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import GlowButton from "@/components/BuildingBlocks/Buttons/GlowButton";
import Section from "./Section";

const BG_COLORS = ["bg-[#a3f730]", "bg-[#ff9ff5]", "bg-[#2f5bff]", "bg-gray-300"] as const;

function pickRandomBg(prev?: (typeof BG_COLORS)[number]) {
  if (BG_COLORS.length <= 1) return BG_COLORS[0];
  let next = prev ?? BG_COLORS[0];
  // Ensure we don't repeat the same color back-to-back
  while (next === prev) {
    next = BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)]!;
  }
  return next;
}

export default function MerchSection() {
  const items = [
    { label: "T-shirt", src: "/images/merch/tshirt.png" },
    { label: "Kšiltovka", src: "/images/merch/cap.png" },
    { label: "Ponožky", src: "/images/merch/socks.png" },
    { label: "Zapalovač", src: "/images/merch/lighter.png" },
  ] as const;

  const [activeIdx, setActiveIdx] = useState(0);
  const [bgColor, setBgColor] = useState<(typeof BG_COLORS)[number]>(BG_COLORS[0]);
  const bgTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const t = window.setInterval(() => {
      setActiveIdx((i) => (i + 1) % items.length);

      // Offset the background color change by 1s so it doesn't change at the same time as the image.
      if (bgTimeoutRef.current) window.clearTimeout(bgTimeoutRef.current);
      bgTimeoutRef.current = window.setTimeout(() => {
        setBgColor((prev) => pickRandomBg(prev));
      }, 1000);
    }, 2000);
    return () => {
      window.clearInterval(t);
      if (bgTimeoutRef.current) window.clearTimeout(bgTimeoutRef.current);
    };
  }, [items.length]);

  const active = items[activeIdx] ?? items[0];

  return (
    <Section id="merch" title="Merch" bordered={false}>
      <div className="w-full">
        {/* Slideshow: square on mobile, fixed-height on desktop (avoid over-cropping) */}
        <div
          className={`relative w-full aspect-square md:aspect-auto md:h-[420px] lg:h-[480px] rounded-xl overflow-hidden ${bgColor}`}
        >
          <Image
            src={active.src}
            alt={active.label}
            fill
            sizes="(max-width: 768px) 100vw, 896px"
            className="object-cover md:object-contain"
            // Bypass Next image optimization to preserve alpha if optimization flattens it.
            unoptimized
          />

          {/* OBCHOD centered over the carousel */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="pointer-events-auto">
              <GlowButton link="#" glowColor="bg-orange-500" floating={false}>
                OBCHOD
              </GlowButton>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}


