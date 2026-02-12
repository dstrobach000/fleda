"use client";

import React from "react";
import dynamic from "next/dynamic";
import GlowButton from "@/components/BuildingBlocks/Buttons/GlowButton";
import HomeProgramSection from "@/components/Content/Home/HomeProgramSection";
import type { CalendarEvent } from "@/types/program";

const BlueprintSlot = dynamic(() => import("@/components/BuildingBlocks/3D/BlueprintSlot"), {
  ssr: false,
  loading: () => <div className="w-full h-[180px] bg-gray-100 animate-pulse rounded-xl border border-black" />,
});

type ProgramAndNewsSectionProps = {
  showNovinky?: boolean;
  programEvents?: CalendarEvent[];
};

export default function ProgramAndNewsSection({
  showNovinky = true,
  programEvents = [],
}: ProgramAndNewsSectionProps) {
  if (!showNovinky) {
    return (
      <section className="px-6 pt-6 pb-4 bg-gray-200" id="program">
        <HomeProgramSection programEvents={programEvents} />
      </section>
    );
  }

  return (
    <section className="px-6 pt-6 pb-4 bg-gray-200" id="program">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HomeProgramSection programEvents={programEvents} />

        <div className="w-full flex flex-col gap-6">
          <div className="order-1 lg:order-2 w-full">
            <BlueprintSlot containerClassName="w-full h-[190px] sm:h-[220px] lg:h-[240px]" />
          </div>

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
