import React from "react";
import Link from "next/link";

interface GlowButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  glowClassName?: string;
  glowStyle?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
  link?: string;
  floating?: boolean;
  forceNewTab?: boolean;
}

const GlowButton = ({
  onClick,
  children,
  className = "",
  glowColor = "bg-orange-500",
  glowClassName = "",
  glowStyle,
  type = "button",
  link,
  floating = true,
  forceNewTab = false,
}: GlowButtonProps) => {
  const animationClass = floating ? "animate-float-pulse" : "";
  const commonProps = {
    className: `relative inline-block rounded-full px-3 sm:px-6 py-2 font-light text-black bg-transparent isolate ${animationClass} ${className}`,
    tabIndex: 0,
  };

  const inner = (
    <>
      <span
        className={`glow-span absolute inset-0 -m-2 rounded-full blur-md pointer-events-none ${glowColor} ${glowClassName}`}
        style={{
          willChange: "transform, filter",
          transform: "translateZ(0)",
          ...glowStyle,
        }}
      ></span>
      <span className="relative z-10">{children}</span>
    </>
  );

  if (onClick) {
    return (
      <button type={type} onClick={onClick} {...commonProps}>
        {inner}
      </button>
    );
  }

  if (link) {
    const isAnchor = link.startsWith("#");
    const isInternalPath =
      link.startsWith("/") || link.startsWith("./") || link.startsWith("../");
    const openInNewTab = forceNewTab || (!isAnchor && !isInternalPath);

    if (isInternalPath && !openInNewTab) {
      return (
        <Link
          href={link}
          className={commonProps.className}
          tabIndex={commonProps.tabIndex}
          style={{ textDecoration: "none" }}
        >
          {inner}
        </Link>
      );
    }

    return (
      <a
        href={link}
        {...commonProps}
        {...(openInNewTab && { target: "_blank", rel: "noopener noreferrer" })}
        style={{ textDecoration: "none" }}
      >
        {inner}
      </a>
    );
  }

  return (
    <button type={type} {...commonProps}>
      {inner}
    </button>
  );
};

export default GlowButton;
