"use client";

import React from "react";
import HomeProgramSection from "@/components/Content/Home/HomeProgramSection";
import type { CalendarEvent } from "@/types/program";

type ProgramPreviewSectionProps = {
  programEvents: CalendarEvent[];
};

export default function ProgramPreviewSection({ programEvents }: ProgramPreviewSectionProps) {
  return (
    <section className="px-6 pt-6 pb-4 bg-gray-200" id="program">
      <HomeProgramSection programEvents={programEvents} />
    </section>
  );
}
