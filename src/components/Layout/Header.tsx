"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import HeaderTopControls from "@/components/Layout/HeaderTopControls";

const BlueprintSlot = dynamic(() => import("@/components/BuildingBlocks/3D/BlueprintSlot"), {
  ssr: false,
  loading: () => (
    <div className="border border-black rounded-full overflow-hidden aspect-[3/1] w-full h-[150px] md:h-auto" />
  ),
});

const LogoSlot = dynamic(() => import("@/components/BuildingBlocks/Logo/LogoSlot"), {
  ssr: false,
  loading: () => (
    <div className="border border-black rounded-full overflow-hidden aspect-[3/1] w-full h-[150px] md:h-auto" />
  ),
});

const Header = () => {
  return (
    <section className="px-6 py-6 relative" id="header">
      <HeaderTopControls />
      <div className="grid gap-6">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 items-start">
          <div className="order-1 md:order-1 relative">
            <LogoSlot />
            <Link
              href="/"
              aria-label="Fleda domů"
              className="absolute inset-0 z-10 block"
            />
          </div>
          <div className="order-2 md:order-2">
            <BlueprintSlot />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Header;
