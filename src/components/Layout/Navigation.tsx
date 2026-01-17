"use client";

import { useEffect, useRef, useState } from "react";
import GlowButton from "@/components/BuildingBlocks/Buttons/GlowButton";
import SearchOverlay from "@/components/BuildingBlocks/SearchOverlay";

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const menuButtonRef = useRef<HTMLDivElement | null>(null);
  const menuPopoverRef = useRef<HTMLDivElement | null>(null);

  const menuItems = [
    { label: "Upcoming", href: "#upcoming" },
    { label: "Program", href: "#program" },
    { label: "Novinky", href: "#novinky" },
    { label: "Fotoreporty", href: "#fotoreporty" },
    { label: "Merch", href: "#merch" },
    { label: "Footer", href: "#footer" },
  ];

  const socialLinks = [
    { name: "Facebook", href: "https://www.facebook.com/fledaclub/", icon: "FB" },
    { name: "Instagram", href: "https://www.instagram.com/fledaclub", icon: "IG" },
    // Use an encoded URL to avoid issues with the "é" character across browsers.
    { name: "TikTok", href: "https://www.tiktok.com/tag/fl%C3%A9da", icon: "TT" },
  ];

  useEffect(() => {
    if (!mobileOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuPopoverRef.current?.contains(target)) return;
      if (menuButtonRef.current?.contains(target)) return;
      setMobileOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onScroll = () => {
      setShowMobileNav(window.scrollY > 120);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const MobileNavRow = ({ floating }: { floating: boolean }) => (
    <div
      className={
        floating
          ? "fixed left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] pointer-events-none"
          : "w-full"
      }
      style={
        floating
          ? { top: "calc(1rem + env(safe-area-inset-top))" }
          : undefined
      }
    >
      <div className={`flex items-center gap-2 w-full ${floating ? "pointer-events-auto" : ""}`}>
        <div className="flex-1">
          <GlowButton
            link="#program"
            glowColor="bg-orange-500"
            floating={false}
            className="w-full text-center"
            glowStyle={{ filter: "blur(6px)", margin: "-4px" }}
          >
            Program
          </GlowButton>
        </div>

        <div ref={menuButtonRef} className="relative flex-1">
          <GlowButton
            onClick={() => setMobileOpen((prev) => !prev)}
            glowColor="bg-orange-500"
            floating={false}
            className="w-full text-center"
            glowStyle={{ filter: "blur(6px)", margin: "-4px" }}
          >
            Menu
          </GlowButton>
          {mobileOpen && (
            <div
              ref={menuPopoverRef}
              className="absolute left-0 mt-3 w-56 rounded-2xl border border-black bg-gray-200 p-3 shadow-sm z-50"
              role="menu"
              aria-label="Hlavní navigace"
            >
              <div className="flex flex-col gap-2">
                {menuItems.map((item) => (
                  <GlowButton
                    key={item.label}
                    link={item.href}
                    glowColor="bg-orange-500"
                    floating={false}
                    className="w-full text-center"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </GlowButton>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full font-light text-black border border-black bg-transparent hover:bg-gray-300 transition-colors flex items-center justify-center"
              style={{ aspectRatio: "1/1" }}
              aria-label={social.name}
            >
              <span className="text-xs">{social.icon}</span>
            </a>
          ))}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-10 h-10 rounded-full font-light text-black border border-black bg-transparent hover:bg-gray-300 transition-colors flex items-center justify-center"
            style={{ aspectRatio: "1/1" }}
            aria-label="Vyhledávání"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  const NavigationContent = () => (
    <div className="w-full min-w-0 max-w-full relative">
      {/* Mobile: header row first, then floating bottom on scroll */}
      <div className="sm:hidden">
        {!showMobileNav && <MobileNavRow floating={false} />}
        {showMobileNav && <MobileNavRow floating={true} />}
      </div>

      {/* Desktop: all buttons inline */}
      <div className="hidden sm:flex flex-wrap items-center justify-start gap-2 sm:gap-3 md:gap-4 w-full min-w-0 max-w-full">
        {menuItems.map((item) => (
          <div key={item.label} className="p-2 shrink">
            <GlowButton link={item.href} glowColor="bg-orange-500" floating={false}>
              {item.label}
            </GlowButton>
          </div>
        ))}
      </div>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );

  return (
    <NavigationContent />
  );
}

