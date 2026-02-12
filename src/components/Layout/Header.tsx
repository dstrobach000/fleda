"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import HeaderTopControls from "@/components/Layout/HeaderTopControls";

const LogoSlot = dynamic(() => import("@/components/BuildingBlocks/Logo/LogoSlot"), {
  ssr: false,
  loading: () => (
    <div className="aspect-[3/1] w-full h-[150px] md:h-auto bg-gray-200" />
  ),
});

const Header = () => {
  return (
    <section className="px-6 pt-1 pb-0 relative" id="header">
      <HeaderTopControls />
      {/* Logo full width */}
      <div className="w-full max-w-[920px] mx-auto min-w-0 bg-gray-200">
        <Link href="/" aria-label="Fléda domů" className="block">
          <LogoSlot />
        </Link>
      </div>
    </section>
  );
};

export default Header;
