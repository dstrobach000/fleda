import React from "react";
import Link from "next/link";

type EventTagButtonProps = {
  href?: string;
  children: React.ReactNode;
  glowColor: string;
  className?: string;
  solidBlack?: boolean;
};

export default function EventTagButton({
  href,
  children,
  glowColor,
  className = "",
  solidBlack = false,
}: EventTagButtonProps) {
  const baseClass = "!px-2.5 !py-1 text-[11px] sm:text-xs whitespace-nowrap";
  const blackVariantClass = solidBlack ? "!bg-black !text-white uppercase tracking-[0.04em]" : "";
  const tagClassName =
    `relative inline-block rounded-full px-3 sm:px-6 py-2 font-light text-black bg-transparent isolate ${baseClass} ${blackVariantClass} ${className}`.trim();
  const inner = (
    <>
      <span
        className={`absolute inset-0 -m-2 rounded-full blur-md pointer-events-none ${glowColor}`}
        style={{ willChange: "transform, filter", transform: "translateZ(0)" }}
      />
      <span className="relative z-10">{children}</span>
    </>
  );

  if (href) {
    const isAnchor = href.startsWith("#");
    const isInternalPath =
      href.startsWith("/") || href.startsWith("./") || href.startsWith("../");

    if (isInternalPath && !isAnchor) {
      return (
        <Link href={href} className={tagClassName} style={{ textDecoration: "none" }}>
          {inner}
        </Link>
      );
    }

    return (
      <a href={href} className={tagClassName} style={{ textDecoration: "none" }}>
        {inner}
      </a>
    );
  }

  return <span className={tagClassName}>{inner}</span>;
}
