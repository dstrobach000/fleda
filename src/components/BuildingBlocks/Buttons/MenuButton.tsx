"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import GlowButton from "./GlowButton";

const MENU_ORIGIN_KEY = "fleda-menu-origin";

export default function MenuButton({
  className = "",
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "header";
}) {
  const router = useRouter();
  const variantClassName =
    variant === "header"
      ? "!inline-flex !h-[var(--header-control-size)] items-center !px-[0.95em] !py-0 !font-light text-[1.08em] leading-none"
      : "px-6 py-2 text-lg";

  return (
    <GlowButton
      onClick={() => {
        sessionStorage.setItem(
          MENU_ORIGIN_KEY,
          `${window.location.pathname}${window.location.search}${window.location.hash}`
        );
        router.push("/menu", { scroll: false });
      }}
      glowColor="bg-orange-500"
      className={clsx(variantClassName, className)}
      floating={variant !== "header"}
    >
      Menu
    </GlowButton>
  );
}
