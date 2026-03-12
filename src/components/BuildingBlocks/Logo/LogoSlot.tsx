"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import { useLogoHost } from "./LogoSingletonProvider";

let hostCounter = 0;

type LogoSlotProps = {
  className?: string;
};

export default function LogoSlot({ className = "" }: LogoSlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hostIdRef = useRef<string>(`logo-host-${hostCounter++}`);
  const { registerHost, unregisterHost } = useLogoHost();

  useEffect(() => {
    if (ref.current) registerHost(hostIdRef.current, ref.current);
    return () => unregisterHost(hostIdRef.current);
  }, [registerHost, unregisterHost]);

  return (
    <div
      ref={ref}
      className={clsx("relative rounded-full overflow-hidden", className || "aspect-[3/1] w-full h-[150px] md:h-auto")}
    >
      <div className="w-full h-full" />
    </div>
  );
}
