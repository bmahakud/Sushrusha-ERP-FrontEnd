import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Sushrusha — Pharmacy Management Platform",
    default: "Sushrusha — Smarter Pharmacy Management",
  },
  description:
    "All-in-one pharmacy management platform with POS, inventory tracking, multi-branch support, and an integrated online store. Trusted by 500+ pharmacies.",
  keywords: ["pharmacy management", "pharmacy POS", "inventory tracking", "multi-branch pharmacy", "pharmacy SaaS"],
  authors: [{ name: "Sushrusha" }],
  creator: "Sushrusha",
  metadataBase: new URL("https://sushrusha.com"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Sushrusha",
    title: "Sushrusha — Smarter Pharmacy Management",
    description:
      "All-in-one pharmacy management platform with POS, inventory tracking, and multi-branch support.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sushrusha — Smarter Pharmacy Management",
    description: "All-in-one pharmacy management platform trusted by 500+ pharmacies.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F766E",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
