"use client";

import React, { useEffect, useState } from "react";
import GlowButton from "@/components/BuildingBlocks/Buttons/GlowButton";

export default function FooterClient() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<null | { type: "ok" | "err"; text: string }>(null);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch (input value + messages).
  useEffect(() => setMounted(true), []);

  // Auto-dismiss feedback after 10s
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => setMessage(null), 10_000);
    return () => window.clearTimeout(t);
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const trimmed = email.trim();
    const emailOK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!emailOK) {
      setMessage({ type: "err", text: "Zadejte platný e-mail." });
      return;
    }

    // Dummy signup: behave like a successful submit without calling any backend.
    setMessage({ type: "ok", text: "Díky! E-mail je uložen (demo, zatím bez napojení)." });
    setEmail("");
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 text-center w-full">
      {/* Kontakty */}
      <div className="border border-black rounded-xl p-4 flex flex-col items-center justify-center flex-1">
        <GlowButton
          link="mailto:info@fleda.cz"
          className="px-4 py-2 text-base md:text-lg self-center"
          glowColor="bg-orange-500"
          floating={false}
        >
          Kontakty
        </GlowButton>
      </div>

      {/* Newsletter (dummy, not connected) */}
      <div className="border border-black rounded-xl p-4 flex flex-col items-center justify-center flex-1">
        {mounted ? (
          <form onSubmit={handleSubmit} className="space-y-3 w-full flex flex-col items-center">
            <input
              type="email"
              placeholder="Zadejte svůj e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="px-4 py-2 border border-black rounded-full w-full focus:outline-none font-light text-center bg-gray-300"
              autoComplete="email"
              name="newsletter-email"
            />

            <GlowButton
              className="px-4 py-2 text-base md:text-lg self-center"
              type="submit"
              glowColor="bg-orange-500"
              floating={false}
            >
              Odebírat newsletter
            </GlowButton>

            {message && (
              <p className="text-xs font-light text-black">
                {message.text}
              </p>
            )}
          </form>
        ) : (
          <div className="space-y-3 w-full flex flex-col items-center">
            <div className="px-4 py-2 border border-black rounded-full w-full h-10 bg-gray-300 animate-pulse"></div>
            <div className="px-4 py-2 text-base md:text-lg self-center bg-gray-300 animate-pulse rounded-full h-10 w-48"></div>
          </div>
        )}
      </div>

      {/* Venues */}
      <div className="border border-black rounded-xl p-4 flex flex-col items-center justify-center flex-1">
        <div className="flex flex-col items-center justify-center gap-3">
          <GlowButton
            link="https://www.spektrumgalerie.cz"
            className="px-4 py-2 text-base md:text-lg self-center"
            glowColor="bg-[#a3f730]"
            floating={false}
          >
            Spektrum galerie
          </GlowButton>
          <GlowButton
            link="https://spektrumbar.cz"
            className="px-4 py-2 text-base md:text-lg self-center"
            glowColor="bg-[#ff9ff5]"
            floating={false}
          >
            Spektrum bar
          </GlowButton>
          <GlowButton
            link="https://instagram.com/fraktal_noise"
            className="px-4 py-2 text-base md:text-lg self-center"
            glowColor="bg-[#2f5bff]"
            floating={false}
          >
            Fraktal
          </GlowButton>
        </div>
      </div>
    </div>
  );
}