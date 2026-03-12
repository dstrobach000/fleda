import React from "react";
import Navigation from "@/components/Layout/Navigation";
import Header from "@/components/Layout/Header";
import HomeClient from "@/components/Content/HomeClient";
import UpcomingEvents from "@/components/Content/Home/UpcomingEvents";
import ProgramPreviewSection from "@/components/Content/Home/ProgramPreviewSection";
import NovinkySection from "@/components/Content/Home/NovinkySection";
import FotoreportySection from "@/components/Content/Home/FotoreportySection";
import MerchSection from "@/components/Content/Home/MerchSection";
import { getProgramCalendarEvents } from "@/lib/programEvents";

export default async function Home() {
  const programEvents = await getProgramCalendarEvents();

  return (
    <main className="bg-gray-200 text-black font-sans flex flex-col min-h-screen relative">
      <div id="main-shell" className="max-w-[1200px] mx-auto w-full">
        <div className="flex-grow">
          <Header />
          <Navigation />
          <div className="grid grid-cols-1 md:grid-cols-2 md:items-start">
            <UpcomingEvents />
            <ProgramPreviewSection programEvents={programEvents} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 md:items-start">
            <NovinkySection />
            <FotoreportySection />
          </div>
          <MerchSection />
        </div>
      </div>

      <HomeClient />
    </main>
  );
}
