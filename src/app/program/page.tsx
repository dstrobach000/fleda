import React from "react";
import Header from "@/components/Layout/Header";
import Navigation from "@/components/Layout/Navigation";
import ProgramAndNewsSection from "@/components/Content/Home/ProgramAndNewsSection";
import { getProgramCalendarEvents } from "@/lib/programEvents";

export default async function ProgramPage() {
  const programEvents = await getProgramCalendarEvents();

  return (
    <main className="bg-gray-200 text-black font-sans min-h-screen">
      <div className="max-w-4xl mx-auto w-full">
        <Header />
        <div className="sm:sticky sm:top-0 z-50 bg-transparent">
          <div className="px-6 pt-0 pb-2 sm:pt-2">
            <Navigation />
          </div>
        </div>
        <ProgramAndNewsSection showNovinky={false} programEvents={programEvents} />
      </div>
    </main>
  );
}
