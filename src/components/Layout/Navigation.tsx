"use client";

import MenuButton from "@/components/BuildingBlocks/Buttons/MenuButton";
import { usePathname } from "next/navigation";
import useFloatingButtonPosition from "@/components/BuildingBlocks/Buttons/useFloatingButtonPosition";

export default function Navigation() {
  const pathname = usePathname();
  const { right, top, isSticky } = useFloatingButtonPosition();

  if (!isSticky || pathname === "/menu") {
    return null;
  }

  return (
    <div
      className="fixed translate-y-[3.25rem] md:translate-y-0"
      style={{
        right: `${right}px`,
        top: `${top}px`,
        zIndex: 10001,
      }}
    >
      <MenuButton />
    </div>
  );
}
