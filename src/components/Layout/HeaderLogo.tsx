"use client";

import { InlineLogo3D } from "@/components/BuildingBlocks/Logo/LogoSingletonProvider";

export default function HeaderLogo({
  mobileClassName = "",
  className = "",
}: {
  mobileClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={`min-w-0 shrink-0 h-[var(--header-logo-height-mobile)] w-[var(--header-logo-width-mobile)] md:h-[var(--header-logo-height)] md:w-[var(--header-logo-width)] ${mobileClassName} ${className}`}
    >
      <InlineLogo3D className="block h-full w-full" />
    </div>
  );
}
