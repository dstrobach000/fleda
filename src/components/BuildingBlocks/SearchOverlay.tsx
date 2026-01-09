"use client";

import { useEffect } from "react";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-200/95"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          placeholder="Hledat..."
          autoFocus
          className="w-full px-6 py-4 text-2xl border-2 border-black rounded-full focus:outline-none focus:border-orange-500 bg-gray-200"
        />
        <button
          onClick={onClose}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-gray-600 text-xl"
          aria-label="Zavřít vyhledávání"
        >
          ×
        </button>
      </div>
    </div>
  );
}

