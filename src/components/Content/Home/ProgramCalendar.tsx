"use client";

import React from "react";
import Section from "./Section";

export default function ProgramCalendar() {
  const days = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];
  const dateCells = Array.from({ length: 35 }, (_, i) => i - 2); // placeholder grid

  return (
    <Section id="program" title="Program">
      <div className="flex items-center justify-between gap-4">
        <div className="font-light text-base sm:text-lg">Leden 2026</div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full border border-black bg-gray-200 font-light">
            ‹
          </button>
          <button className="w-10 h-10 rounded-full border border-black bg-gray-200 font-light">
            ›
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2 text-sm">
        {days.map((d) => (
          <div key={d} className="text-center font-light text-black opacity-70">
            {d}
          </div>
        ))}
        {dateCells.map((n, idx) => {
          const inMonth = n >= 1 && n <= 31;
          const isEvent = n === 12 || n === 13 || n === 14 || n === 15;
          return (
            <div
              key={idx}
              className={`aspect-square rounded-xl border border-black flex items-center justify-center font-light ${
                inMonth ? "text-black" : "text-black/30"
              }`}
            >
              <div className="flex flex-col items-center justify-center leading-none">
                <span className="text-sm">{inMonth ? n : ""}</span>
                {isEvent && <span className="mt-1 w-2 h-2 rounded-full bg-orange-500" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-light text-black">
        <div className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500 border border-black" />
          <span>Fléda</span>
        </div>
        <div className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#a3f730] border border-black" />
          <span>Spektrum galerie</span>
        </div>
        <div className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff9ff5] border border-black" />
          <span>Spektrum bar</span>
        </div>
        <div className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#2f5bff] border border-black" />
          <span>Fraktal</span>
        </div>
      </div>
    </Section>
  );
}


