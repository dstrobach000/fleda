"use client";

import React, { useState } from "react";
import SearchOverlay from "@/components/BuildingBlocks/SearchOverlay";
import HeaderActionButton from "@/components/Layout/HeaderActionButton";
import HeaderLogo from "@/components/Layout/HeaderLogo";
import HeaderUpcomingBar from "@/components/Layout/HeaderUpcomingBar";
import type { CalendarEvent } from "@/types/program";

type HeaderTopControlsProps = {
  upcomingEvent?: CalendarEvent | null;
};

export default function HeaderTopControls({
  upcomingEvent = null,
}: HeaderTopControlsProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const layoutStyle = {
    fontSize: "clamp(0.82rem, 0.72rem + 0.5vw, 1.08rem)",
    ["--header-gap" as string]: "0.7em",
    ["--header-control-size" as string]: "2.8em",
    ["--header-logo-height" as string]: "calc(var(--header-control-size) * 3)",
    ["--header-logo-width" as string]: "calc(var(--header-logo-height) * 3)",
    ["--header-logo-height-mobile" as string]: "calc(var(--header-control-size) * 1.1)",
    ["--header-logo-width-mobile" as string]: "calc(var(--header-logo-height-mobile) * 3)",
  } as React.CSSProperties;

  const socialLinks = [
    { name: "Facebook", href: "https://www.facebook.com/fledaclub/", icon: "FB" },
    { name: "Instagram", href: "https://www.instagram.com/fledaclub", icon: "IG" },
    // Use an encoded URL to avoid issues with the "é" character across browsers.
    { name: "TikTok", href: "https://www.tiktok.com/tag/fl%C3%A9da", icon: "TT" },
  ];
  const renderSocialButtons = () =>
    socialLinks.map((social) => (
      <HeaderActionButton key={social.name} href={social.href} ariaLabel={social.name}>
        <span className="text-[0.58em] leading-none">{social.icon}</span>
      </HeaderActionButton>
    ));
  const renderSearchButton = () => (
    <HeaderActionButton ariaLabel="Vyhledávání" onClick={() => setIsSearchOpen(true)}>
      <svg
        style={{ width: "0.44em", height: "0.44em" }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
    </HeaderActionButton>
  );

  return (
    <>
      <div id="header-top-controls" className="relative z-20 w-full min-w-0" style={layoutStyle}>
        <div className="mb-[var(--header-gap)] min-w-0">
          <HeaderUpcomingBar upcomingEvent={upcomingEvent} />
        </div>

        <div className="grid min-w-0 grid-cols-[1fr_auto_1fr] items-start md:hidden">
          <div className="flex min-w-0 items-start gap-[calc(var(--header-gap)*0.5)] justify-self-start">
            {renderSocialButtons()}
          </div>
          <div className="justify-self-center">
            <HeaderLogo className="h-[calc(var(--header-control-size)*1.1)] w-[calc(var(--header-control-size)*3.1)]" />
          </div>
          <div className="justify-self-end">
            {renderSearchButton()}
          </div>
        </div>

        <div className="hidden min-w-0 grid-cols-[1fr_auto_1fr] items-start md:grid">
          <div className="flex min-w-0 items-start gap-[calc(var(--header-gap)*0.5)] justify-self-start">
            {renderSocialButtons()}
          </div>
          <div className="justify-self-center">
            <HeaderLogo />
          </div>
          <div className="justify-self-end">
            {renderSearchButton()}
          </div>
        </div>
      </div>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
