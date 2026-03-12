"use client";

import React from "react";
import { useRouter } from "next/navigation";
import GlowButton from "./GlowButton";
import useFloatingButtonPosition from "./useFloatingButtonPosition";

type Props = {
  label?: string;
  className?: string;
  onClick?: () => void; // optional override used by Modal
};

/**
 * Sticky close button. If no onClick is provided, it defaults to
 * navigating home using router.push("/").
 */
const StickyCloseButton = ({ label = "Zavřít", className = "", onClick }: Props) => {
  const router = useRouter();
  const { right, top } = useFloatingButtonPosition();

  const handleDefault = () => {
    router.push("/", { scroll: false });
  };

  return (
    <div
      className="fixed"
      style={{
        right: `${right}px`,
        top: `${top}px`,
        zIndex: 10000,
      }}
    >
      <GlowButton
        glowColor="bg-orange-500"
        onClick={onClick ?? handleDefault}
        className={`px-6 py-2 text-lg ${className}`}
        floating={true}
      >
        {label}
      </GlowButton>
    </div>
  );
};

export default StickyCloseButton;
