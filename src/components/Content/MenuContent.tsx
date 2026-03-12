"use client";

import { useRouter } from "next/navigation";
import GlowButton from "@/components/BuildingBlocks/Buttons/GlowButton";
import BrandMediaRow from "@/components/Layout/BrandMediaRow";

const MENU_ORIGIN_KEY = "fleda-menu-origin";
const menuItems = [
  { label: "Program", href: "/program", glowColor: "bg-orange-500" },
  { label: "Novinky", href: "#novinky", glowColor: "bg-orange-500" },
  { label: "Fotoreporty", href: "#fotoreporty", glowColor: "bg-orange-500" },
  { label: "Merch", href: "#merch", glowColor: "bg-orange-500" },
  { label: "→ Spektrum bar", href: "https://spektrumbar.cz", glowColor: "bg-[#ff9ff5]", external: true },
  { label: "→ Spektrum galerie", href: "https://www.spektrumgalerie.cz", glowColor: "bg-[#a3f730]", external: true },
  { label: "→ Fraktal", href: "https://instagram.com/fraktal_noise", glowColor: "bg-[#2f5bff]", external: true },
];

type MenuContentProps = {
  onClose?: () => void;
};

export default function MenuContent({ onClose }: MenuContentProps) {
  const router = useRouter();

  const handleClick = (href: string) => {
    sessionStorage.removeItem(MENU_ORIGIN_KEY);

    if (href.startsWith("#")) {
      const target = document.getElementById(href.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
        onClose?.();
        return;
      }

      router.push(`/${href}`, { scroll: false });
      return;
    }

    router.push(href, { scroll: false });
  };

  return (
    <div className="w-full relative">
      <div className="relative max-w-[1200px] mx-auto mb-6">
        <BrandMediaRow className="mb-6" showLogo={false} />
        <div className="flex flex-col gap-4 items-center pb-6">
          {menuItems.map((item) => (
            <div
              key={item.label}
              className="inline-flex p-2 bg-gray-200"
              style={{ willChange: "transform", transform: "translateZ(0)" }}
            >
              {item.external ? (
                <GlowButton
                  className="px-6 py-2 text-black text-4xl sm:text-5xl"
                  glowColor={item.glowColor}
                  floating={false}
                  link={item.href}
                >
                  {item.label}
                </GlowButton>
              ) : (
                <GlowButton
                  className="px-6 py-2 text-black text-4xl sm:text-5xl"
                  glowColor={item.glowColor}
                  floating={false}
                  onClick={() => handleClick(item.href)}
                >
                  {item.label}
                </GlowButton>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
