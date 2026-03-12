"use client";

import { useEffect, useState } from "react";

const FLOAT_OFFSET = 96;
const DEFAULT_TOP = 72;
const FLOAT_GAP = 16;

export default function useFloatingButtonPosition() {
  const [right, setRight] = useState(16);
  const [top, setTop] = useState(DEFAULT_TOP);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const updatePosition = () => {
      const header = document.getElementById("header");
      const headerBottom = header?.getBoundingClientRect().bottom ?? 0;
      setIsSticky(headerBottom <= 0);

      const shell = document.getElementById("main-shell");
      const fallbackHeader = document.getElementById("header");
      const rail = shell ?? fallbackHeader;

      if (!rail) {
        setRight(16);
      } else {
        const { right: railRight } = rail.getBoundingClientRect();
        setRight(Math.max(16, Math.round(window.innerWidth - railRight - FLOAT_OFFSET)));
      }

      const topControls = document.getElementById("header-top-controls");
      const upcomingBar = document.getElementById("header-upcoming-bar");
      const upcomingBarBottom = upcomingBar?.getBoundingClientRect().bottom ?? 0;
      const minTop = Math.max(FLOAT_GAP, Math.round(upcomingBarBottom + FLOAT_GAP));

      if (topControls) {
        const controlsBottom = topControls.getBoundingClientRect().bottom;
        setTop(Math.max(minTop, Math.round(controlsBottom + 8)));
      } else {
        setTop(Math.max(minTop, DEFAULT_TOP));
      }
    };

    updatePosition();
    const raf = requestAnimationFrame(updatePosition);
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, []);

  return { right, top, isSticky };
}
