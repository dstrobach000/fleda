import React from "react";
import Header from "@/components/Layout/Header";
import Navigation from "@/components/Layout/Navigation";
import ProgramSection from "@/components/Content/Home/ProgramSection";
import { getProgramCalendarEvents } from "@/lib/programEvents";

export default async function ProgramPage() {
  const programEvents = await getProgramCalendarEvents();

  return (
    <main className="bg-gray-200 text-black font-sans min-h-screen">
      <div className="max-w-[1200px] mx-auto w-full">
        <Header />
        <div className="sm:sticky sm:top-0 z-50 bg-transparent">
          <div className="px-6 pt-0 pb-2 sm:pt-2">
            <Navigation />
          </div>
        </div>
        <section className="px-6 pt-6 pb-4 bg-gray-200">
          <ProgramSection programEvents={programEvents} headingHref="#program" />
        </section>
      </div>
    </main>
  );
}
