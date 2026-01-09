"use client";

import React from "react";
import GlowButton from "../Buttons/GlowButton";
import FormattedText from "../Text/FormattedText";

interface UpcomingProps {
  artist: string;
  exhibition: string;
  date: string;
  vernissage: string;
  link?: string;
}

const Upcoming: React.FC<UpcomingProps> = ({ artist, exhibition, date, vernissage, link }) => {
  return (
    <>
      <section className="py-6 px-6">
        <div className="w-full">
          <GlowButton
            className="w-full py-4 text-xl font-light"
            glowColor="bg-orange-500"
            link={link}
          >
          <div className="w-full px-2 md:px-6">
            <FormattedText
              leftContent={`Připravujeme: ${artist}, ${exhibition}`}
              rightContent={`${date}, ${vernissage}`}
            />
          </div>
        </GlowButton>
        </div>
      </section>

    </>
  );
};

export default Upcoming;
