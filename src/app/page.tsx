import React from "react";
import Navigation from "@/components/Layout/Navigation";
import Header from "@/components/Layout/Header";
import HomeClient from "@/components/Content/HomeClient";
import HomeSections from "@/components/Content/HomeSections";

export default function Home() {
  return (
    <main className="bg-gray-200 text-black font-sans flex flex-col min-h-screen relative">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex-grow">
          <Header />
          <div className="sticky top-0 z-50 bg-transparent">
            <div className="px-6 pt-2 pb-2">
              <Navigation />
            </div>
          </div>
          <HomeSections />
        </div>
      </div>
      
      {/* Full-width border */}
      <div className="border-t border-black w-full"></div>
      
      <HomeClient />
    </main>
  );
}
