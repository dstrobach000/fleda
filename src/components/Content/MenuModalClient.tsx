"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Modal from "@/components/BuildingBlocks/Modal/Modal";
import MenuContent from "@/components/Content/MenuContent";

const MENU_ORIGIN_KEY = "fleda-menu-origin";

export default function MenuModalClient() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuRoute, setIsMenuRoute] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setIsMenuRoute(pathname === "/menu");
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCanGoBack(Boolean(sessionStorage.getItem(MENU_ORIGIN_KEY)));
  }, []);

  useEffect(() => {
    if (!isMenuRoute) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleMenuClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuRoute, canGoBack]);

  const handleMenuClose = () => {
    sessionStorage.removeItem(MENU_ORIGIN_KEY);

    if (canGoBack) {
      router.back();
      return;
    }

    router.push("/", { scroll: false });
  };

  return (
    <Modal
      isOpen={isMenuRoute}
      onClose={handleMenuClose}
      closeOnBackdropClick={false}
    >
      <MenuContent onClose={handleMenuClose} />
    </Modal>
  );
}
