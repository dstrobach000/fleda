import "./globals.css";
import type { ReactNode } from "react";
import CookieBanner from "@/components/Legal/CookieBanner";
import TitleSetter from "@/components/TitleSetter";
import { BlueprintSingletonProvider } from "@/components/BuildingBlocks/3D/BlueprintSingletonProvider";
import { LogoSingletonProvider } from "@/components/BuildingBlocks/Logo/LogoSingletonProvider";
import type { Metadata } from "next";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#e5e7eb",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://fleda.cz"),
  title: {
    default: "Fleda",
    template: "%s | Fleda",
  },
  description:
    "Fleda - experimentální prostor pro současné umění. Výstavy, akce, kontakty a tiskové materiály.",
  keywords: ["galerie", "současné umění", "výstavy", "umění", "Fleda"],
  authors: [{ name: "Fleda" }],
  icons: [
    { rel: "icon", url: "/favicon.png", sizes: "32x32" },
    { rel: "icon", url: "/favicon.ico", sizes: "16x16" },
  ],
  openGraph: {
    siteName: "Fleda",
    type: "website",
    locale: "cs_CZ",
    title: "Fleda",
    description:
      "Fleda - experimentální prostor pro současné umění. Výstavy, akce, kontakty a tiskové materiály.",
    url: "https://fleda.cz",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fleda",
    description:
      "Fleda - experimentální prostor pro současné umění. Výstavy, akce, kontakty a tiskové materiály.",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="cs" className="bg-gray-200">
      <head>
        <link
          rel="preload"
          href="/fonts/Replica-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Replica-Light.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Replica-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Replica-Heavy.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-gray-200">
        <BlueprintSingletonProvider>
          <LogoSingletonProvider>
            <TitleSetter />
            {children}
            <CookieBanner />
          </LogoSingletonProvider>
        </BlueprintSingletonProvider>
      </body>
    </html>
  );
}
