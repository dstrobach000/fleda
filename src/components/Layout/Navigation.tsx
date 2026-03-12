"use client";

import MenuButton from "@/components/BuildingBlocks/Buttons/MenuButton";
import useFloatingButtonPosition from "@/components/BuildingBlocks/Buttons/useFloatingButtonPosition";

export default function Navigation() {
  const { right, top } = useFloatingButtonPosition();

  return (
    <div
      className="fixed z-50"
      style={{
        right: `${right}px`,
        top: `${top}px`,
      }}
    >
      <MenuButton />
    </div>
  );
}
