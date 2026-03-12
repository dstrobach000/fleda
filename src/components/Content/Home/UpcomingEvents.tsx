import React from "react";
import UpcomingEventCard, {
  type UpcomingEventCardItem,
} from "@/components/Content/Home/UpcomingEventCard";

export default function UpcomingEvents() {
  const items: UpcomingEventCardItem[] = [
    {
      isoDate: "2026-01-12",
      time: "20:00",
      performers: "SWANS, SUPPORT, SUPPORT",
      imageSrc: "/images/bands/swans.jpg",
    },
    {
      isoDate: "2026-01-14",
      time: "22:00",
      performers: "AUTECHRE, SUPPORT",
      imageSrc: "/images/bands/autechre.jpg",
    },
    {
      isoDate: "2026-01-13",
      time: "21:00",
      performers: "HEALTH, SUPPORT",
      imageSrc: "/images/bands/health.jpg",
    },
    {
      isoDate: "2026-01-15",
      time: "21:00",
      performers: "A PLACE TO BURY STRANGERS, SUPPORT, SUPPORT",
      imageSrc: "/images/bands/aptbs.jpg",
    },
  ];

  return (
    <section className="py-6 bg-gray-200" id="upcoming">
      <div className="px-6 mb-4">
        <h2 className="font-light text-xl sm:text-2xl text-black">
          <a href="#" className="inline-flex items-center gap-2">
            <span>Upcoming</span>
            <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-black">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14"></path>
                <path d="m13 5 7 7-7 7"></path>
              </svg>
            </span>
          </a>
        </h2>
      </div>

      <div className="px-6">
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {items.map((item) => (
            <UpcomingEventCard key={`${item.performers}-${item.isoDate}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
