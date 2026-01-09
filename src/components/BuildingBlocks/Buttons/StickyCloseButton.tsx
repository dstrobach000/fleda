"use client";

import React from "react";
import { useRouter } from "next/navigation";
import GlowButton from "./GlowButton";

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

  const handleDefault = () => {
    router.push("/", { scroll: false });
  };

  return (
    <div className="fixed" style={{ left: 'max(1rem, calc(50% - 448px - 4rem))', top: '4.5rem', zIndex: 10000 }}>
      <GlowButton
        glowColor="bg-orange-500"
        onClick={onClick ?? handleDefault}
        className={`text-lg ${className}`}
        floating={true}
      >
        {label}
      </GlowButton>
    </div>
  );
};

export default StickyCloseButton;
