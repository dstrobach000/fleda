import React from "react";

interface GlowBoxProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

const GlowBox = ({
  children,
  className = "",
  glowColor = "bg-orange-500",
}: GlowBoxProps) => (
  <div
    className={`relative inline-block rounded-full px-6 py-2 text-lg font-light text-black isolate ${className}`}
    tabIndex={-1}
    aria-hidden="true"
  >
    <span
      className={`absolute inset-0 -m-2 rounded-full blur-md pointer-events-none ${glowColor}`}
      style={{
        willChange: "transform, filter",
        transform: "translateZ(0)", // forces GPU layer
      }}
    ></span>
    <span className="relative z-10">{children}</span>
  </div>
);

export default GlowBox;
