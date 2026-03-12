import React from "react";
import HeaderTopControls from "@/components/Layout/HeaderTopControls";
import HeaderUpcomingBar from "@/components/Layout/HeaderUpcomingBar";
import { getHeaderUpcomingEvent } from "@/lib/programEvents";

const Header = async () => {
  const upcomingEvent = await getHeaderUpcomingEvent();

  return (
    <>
      <div id="header-upcoming-bar" className="fixed inset-x-0 top-0 z-[60]">
        <HeaderUpcomingBar upcomingEvent={upcomingEvent ?? null} />
      </div>
      <section className="relative px-6 pb-6 pt-[calc(env(safe-area-inset-top)+4.9rem)] md:pt-[calc(env(safe-area-inset-top)+5.3rem)]" id="header">
        <HeaderTopControls />
      </section>
    </>
  );
};

export default Header;
