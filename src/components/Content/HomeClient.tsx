"use client";

import React, { useRef, useEffect, useState } from "react";
import GlowButton from "@/components/BuildingBlocks/Buttons/GlowButton";
import Footer from "@/components/Layout/Footer";

export default function HomeClient() {

  const footerRef = useRef<HTMLElement | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  useEffect(() => {
    const isSmallScreen = () => window.innerWidth <= 900;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (isSmallScreen()) setShowScrollButton(entry.isIntersecting);
        else setShowScrollButton(false);
      },
      { threshold: 0.1 }
    );
    const footerElement = footerRef.current;
    if (footerElement) observer.observe(footerElement);
    return () => {
      if (footerElement) observer.unobserve(footerElement);
    };
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      {showScrollButton && (
        <div className="fixed bottom-4 right-4 z-50 lg:hidden">
          <GlowButton
            onClick={scrollToTop}
            className="p-3 text-xl"
            glowColor="bg-orange-500"
            floating
          >
            ^
          </GlowButton>
        </div>
      )}

      {/* Footer with ref for scroll-to-top button */}
      <div className="max-w-4xl mx-auto w-full">
        <Footer ref={footerRef} />
      </div>
    </>
  );
}
