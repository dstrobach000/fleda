import React from "react";
import Image from "next/image";
import GlowButton from "@/components/BuildingBlocks/Buttons/GlowButton";

type PhotoItem = {
  date: string;
  performers: string;
  imageSrc: string;
};

function truncateLabel(text: string, maxWords = 5) {
  if (!text) return text;
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}

export default function FotoreportySection() {
  const items: PhotoItem[] = [
    {
      date: "12. 01. 26",
      performers: "SWANS, SUPPORT, SUPPORT",
      imageSrc: "/images/photoreports/fotoreport1.jpg",
    },
    {
      date: "13. 01. 26",
      performers: "HEALTH, SUPPORT",
      imageSrc: "/images/photoreports/fotoreport2.jpg",
    },
  ];

  return (
    <section className="px-6 py-6 bg-gray-200" id="fotoreporty">
      <div className="w-full">
        <h2 className="font-light text-xl sm:text-2xl text-black">
          <a href="#" className="inline-flex items-center gap-2">
            <span>Fotoreporty</span>
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

        <div className="mt-4 flex flex-col gap-6">
          {items.map((item) => (
            <div key={`${item.date}-${item.imageSrc}`} className="relative w-full overflow-hidden">
              <div className="relative w-full aspect-[16/9]">
                <Image
                  src={item.imageSrc}
                  alt={item.performers}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <GlowButton link="#" glowColor="bg-orange-500" floating={false} className="text-base sm:text-lg">
                    <div className="flex flex-col items-center text-center leading-tight">
                      <div className="whitespace-nowrap">{item.date}</div>
                      <div className="whitespace-normal break-words">
                        {truncateLabel(item.performers)}
                      </div>
                    </div>
                  </GlowButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
