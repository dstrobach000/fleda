"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const slotFallback = () => (
  <div className="border border-black rounded-full overflow-hidden aspect-[3/1] w-full h-[150px] md:h-auto" />
);

const LogoSlot = dynamic(() => import("@/components/BuildingBlocks/Logo/LogoSlot"), {
  ssr: false,
  loading: slotFallback,
});

const BlueprintSlot = dynamic(() => import("@/components/BuildingBlocks/3D/BlueprintSlot"), {
  ssr: false,
  loading: slotFallback,
});

export default function BrandMediaRow({
  className = "",
  logoHref,
  showLogo = true,
}: {
  className?: string;
  logoHref?: string;
  showLogo?: boolean;
}) {
  if (!showLogo) {
    return (
      <div className={className}>
        <div className="mx-auto w-full max-w-[360px]">
          <BlueprintSlot />
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 items-start ${className}`}>
      <div className="relative">
        <LogoSlot />
        {logoHref ? (
          <Link
            href={logoHref}
            aria-label="Fleda domů"
            className="absolute inset-0 z-10 block"
          />
        ) : null}
      </div>
      <BlueprintSlot />
    </div>
  );
}
