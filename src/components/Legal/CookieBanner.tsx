"use client";

import React, { useEffect, useState } from "react";
import GlowButton from "@/components/BuildingBlocks/Buttons/GlowButton";

const STORAGE_KEY = "cookie-info-v1";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY);
    if (!saved) setVisible(true);
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "ok");
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-4 z-40 px-4 sm:px-6 pointer-events-none"
      role="dialog"
      aria-live="polite"
      aria-label="Informace o cookies"
    >
      <div className="max-w-[1200px] mx-auto pointer-events-auto">
        <div className="border border-black rounded-xl bg-gray-200 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <p className="text-sm leading-snug font-light text-black">
              Tento web používá pouze nezbytné cookies k zajištění základních funkcí.
              Více informací bude doplněno.
            </p>
            <GlowButton
              onClick={accept}
              className="px-4 py-2 text-sm"
              glowColor="bg-orange-500"
              floating={false}
            >
              Rozumím
            </GlowButton>
          </div>
        </div>
      </div>
    </div>
  );
}
