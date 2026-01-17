"use client";

import React, { useState } from "react";
import SearchOverlay from "@/components/BuildingBlocks/SearchOverlay";

export default function HeaderTopControls() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const socialLinks = [
    { name: "Facebook", href: "https://www.facebook.com/fledaclub/", icon: "FB" },
    { name: "Instagram", href: "https://www.instagram.com/fledaclub", icon: "IG" },
    // Use an encoded URL to avoid issues with the "é" character across browsers.
    { name: "TikTok", href: "https://www.tiktok.com/tag/fl%C3%A9da", icon: "TT" },
  ];

  return (
    <>
      <div className="hidden sm:flex justify-between items-center mb-0 flex-wrap gap-2 w-full min-w-0">
        <div className="flex gap-2 flex-shrink-0">
          {socialLinks.map((social) => (
            <div key={social.name} className="p-1 flex-shrink-0">
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full font-light text-black border border-black bg-transparent hover:bg-gray-300 transition-colors flex items-center justify-center"
                style={{ aspectRatio: "1/1" }}
                aria-label={social.name}
              >
                <span className="text-xs sm:text-sm">{social.icon}</span>
              </a>
            </div>
          ))}
        </div>

        <div className="p-1 flex-shrink-0 ml-auto">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full font-light text-black border border-black bg-transparent hover:bg-gray-300 transition-colors flex items-center justify-center"
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

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

