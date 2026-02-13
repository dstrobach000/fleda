"use client";

import React from "react";
import GlowButton from "@/components/BuildingBlocks/Buttons/GlowButton";
import Section from "./Section";

export default function NovinkySection() {
  return (
    <Section id="novinky" title="Novinky">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-black rounded-xl p-6 bg-gray-200">
          <div className="flex flex-wrap items-center gap-2 text-xs font-light text-black/70 mb-3">
            <span className="whitespace-nowrap">12. 01. 26</span>
            <span className="opacity-60"> - </span>
            <span className="whitespace-nowrap">Fleda</span>
            <span className="opacity-60"> - </span>
            <span className="whitespace-nowrap">Novinka</span>
          </div>
          <p className="font-light text-black leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque finibus, nibh at
            tincidunt tincidunt, magna sem suscipit libero, vel tincidunt arcu erat sed massa.
            Integer a lectus sed neque consequat malesuada. Curabitur at lacus a augue tincidunt
            convallis. Sed euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, vitae
            iaculis lorem justo vitae augue.
          </p>
        </div>
        <div className="border border-black rounded-xl p-6 bg-gray-200">
          <div className="flex flex-wrap items-center gap-2 text-xs font-light text-black/70 mb-3">
            <span className="whitespace-nowrap">05. 01. 26</span>
            <span className="opacity-60"> - </span>
            <span className="whitespace-nowrap">Fleda</span>
            <span className="opacity-60"> - </span>
            <span className="whitespace-nowrap">Oznámení</span>
          </div>
          <p className="font-light text-black leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean posuere, justo at
            molestie dignissim, tortor risus tempus ex, eu scelerisque ipsum tortor sed lectus.
            Morbi venenatis, mi sed dignissim pulvinar, velit urna iaculis nulla, sit amet
            ultricies nisl velit sed lorem. Donec sit amet erat non magna suscipit faucibus.
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <GlowButton link="#" glowColor="bg-orange-500" floating={false}>
          ARCHIV
        </GlowButton>
      </div>
    </Section>
  );
}


