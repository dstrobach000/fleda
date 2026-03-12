"use client";

import React from "react";
import clsx from "clsx";

type HeaderActionButtonProps = {
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
};

const baseClassName =
  "inline-flex shrink-0 items-center justify-center rounded-full border border-black bg-transparent font-light text-black transition-colors hover:bg-gray-300";

const baseStyle: React.CSSProperties = {
  width: "var(--header-control-size)",
  height: "var(--header-control-size)",
};

export default function HeaderActionButton({
  ariaLabel,
  children,
  className = "",
  href,
  onClick,
}: HeaderActionButtonProps) {
  const resolvedClassName = clsx(baseClassName, className);

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={resolvedClassName}
        style={baseStyle}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={resolvedClassName}
      style={baseStyle}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
