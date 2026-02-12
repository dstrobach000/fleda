"use client";

import React from "react";
import UpcomingEvents from "@/components/Content/Home/UpcomingEvents";
import ProgramAndNewsSection from "@/components/Content/Home/ProgramAndNewsSection";
import FotoreportySection from "@/components/Content/Home/FotoreportySection";
import MerchSection from "@/components/Content/Home/MerchSection";
import type { CalendarEvent } from "@/types/program";

type HomeSectionsProps = {
  programEvents: CalendarEvent[];
};

export default function HomeSections({ programEvents }: HomeSectionsProps) {
  return (
    <>
      <UpcomingEvents />
      <ProgramAndNewsSection programEvents={programEvents} />
      <FotoreportySection />
      <MerchSection />
    </>
  );
}

