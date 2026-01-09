"use client";

import React from "react";
import UpcomingEvents from "@/components/Content/Home/UpcomingEvents";
import ProgramAndNewsSection from "@/components/Content/Home/ProgramAndNewsSection";
import FotoreportySection from "@/components/Content/Home/FotoreportySection";
import MerchSection from "@/components/Content/Home/MerchSection";

export default function HomeSections() {
  return (
    <>
      <UpcomingEvents />
      <ProgramAndNewsSection />
      <FotoreportySection />
      <MerchSection />
    </>
  );
}


