import React from "react";
import HeaderTopControls from "@/components/Layout/HeaderTopControls";
import { getHeaderUpcomingEvent } from "@/lib/programEvents";

const Header = async () => {
  const upcomingEvent = await getHeaderUpcomingEvent();

  return (
    <section className="px-6 py-6 relative" id="header">
      <HeaderTopControls upcomingEvent={upcomingEvent ?? null} />
    </section>
  );
};

export default Header;
