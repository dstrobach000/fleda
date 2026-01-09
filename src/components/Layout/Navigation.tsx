"use client";

import GlowButton from "@/components/BuildingBlocks/Buttons/GlowButton";

export default function Navigation() {
  const menuItems = [
    { label: "Upcoming", href: "#upcoming" },
    { label: "Program", href: "#program" },
    { label: "Novinky", href: "#novinky" },
    { label: "Fotoreporty", href: "#fotoreporty" },
    { label: "Merch", href: "#merch" },
    { label: "Footer", href: "#footer" },
  ];

  const NavigationContent = () => (
    <div className="w-full min-w-0 max-w-full">
        {/* Navigation buttons - must wrap to show all buttons */}
        <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-3 md:gap-4 w-full min-w-0 max-w-full">
          {menuItems.map((item) => (
            <div key={item.label} className="p-2 shrink">
              <GlowButton
                link={item.href}
                glowColor="bg-orange-500"
                floating={false}
              >
                {item.label}
              </GlowButton>
            </div>
          ))}
        </div>
      </div>
  );

  return (
    <NavigationContent />
  );
}

