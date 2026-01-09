"use client";

import React from "react";
import GlowButton from "./GlowButton";

const MenuButton = ({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) => (
  <div className="fixed z-50" style={{ left: 'max(1rem, calc(50% - 448px - 4rem))', top: '4.5rem' }}>
    <GlowButton
      onClick={onClick}
      glowColor="bg-orange-500"
      className={`text-lg ${className}`}
      floating={true}
    >
      Menu
    </GlowButton>
  </div>
);

export default MenuButton;
