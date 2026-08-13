import type { Metadata } from "next";
import { Archivo, Imbue, Victor_Mono } from "next/font/google";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./site";

// Brand display face. hhgoa.com loads Imbue at 400 only — it is a high-contrast
// condensed Didone whose weight comes from the design, not the weight axis.
// Asking for 700/900 makes the browser synthesize and it looks wrong.
const imbue = Imbue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

// Brand body face. The site is monospace-first: Victor Mono is its
// --default-font-family, not just a code font.
const victorMono = Victor_Mono({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// Canvas-only. The card is rendered with --font-card and is explicitly out of
// scope for this pass, so Archivo stays until the card itself is restyled.
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-card",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "HH Goa 2026",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${imbue.variable} ${victorMono.variable} ${archivo.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
