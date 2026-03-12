import React from "react";
import Header from "@/components/Layout/Header";
import Navigation from "@/components/Layout/Navigation";
import Footer from "@/components/Layout/Footer";
import ProgramSection from "@/components/Content/Home/ProgramSection";
import { getProgramCalendarEvents } from "@/lib/programEvents";

export default async function ProgramPage() {
  const programEvents = await getProgramCalendarEvents();

  return (
    <main className="bg-gray-200 text-black font-sans min-h-screen">
      <div id="main-shell" className="max-w-[1200px] mx-auto w-full">
        <Header />
        <Navigation />
        <section className="px-6 pt-6 pb-4 bg-gray-200">
          <ProgramSection programEvents={programEvents} headingHref="#program" />
        </section>
      </div>
      <Footer />
    </main>
  );
}
