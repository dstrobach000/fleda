import React from "react";
import Navigation from "@/components/Layout/Navigation";
import Header from "@/components/Layout/Header";
import HomeClient from "@/components/Content/HomeClient";
import HomeSections from "@/components/Content/HomeSections";
import { getProgramCalendarEvents } from "@/lib/programEvents";

export default async function Home() {
  const programEvents = await getProgramCalendarEvents();

  return (
    <main className="bg-gray-200 text-black font-sans flex flex-col min-h-screen relative">
      <div className="max-w-[1200px] mx-auto w-full">
        <div className="flex-grow">
          <Header />
          <div className="sm:sticky sm:top-0 z-50 bg-transparent">
            <div className="px-6 pt-0 pb-2 sm:pt-2">
              <Navigation />
            </div>
          </div>
          <HomeSections programEvents={programEvents} />
        </div>
      </div>

      <HomeClient />
    </main>
  );
}
