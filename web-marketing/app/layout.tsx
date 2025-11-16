import type { Metadata } from "next";
import { EB_Garamond, Source_Serif_4 } from "next/font/google";
import "./globals.css";

// Display font - elegant, timeless serif for headlines
const ebGaramond = EB_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Body font - readable serif optimized for screen reading
const sourceSerif = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://habitflow.app'),
  title: {
    default: "HabitFlow - Grow Naturally, Live Intentionally",
    template: "%s | HabitFlow"
  },
  description: "Build lasting habits naturally with HabitFlow. Science-backed habit tracking app designed for mindful growth. Track daily rituals, visualize progress, and transform your life one intentional step at a time. Start your journey today.",
  keywords: ["habit tracker app", "mindfulness app", "personal growth", "daily habit tracker", "self improvement app", "habit formation", "wellness app", "intentional living", "build better habits", "habit tracking", "morning routine", "productivity app", "goal tracking", "streak tracker"],
  authors: [{ name: "HabitFlow" }],
  creator: "HabitFlow",
  publisher: "HabitFlow",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://habitflow.app",
    title: "HabitFlow - Grow Naturally, Live Intentionally",
    description: "Transform your life through mindful habit building. Cultivate lasting change, one intentional step at a time.",
    siteName: "HabitFlow",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HabitFlow - Mindful Habit Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HabitFlow - Grow Naturally, Live Intentionally",
    description: "Transform your life through mindful habit building. Cultivate lasting change, one intentional step at a time.",
    images: ["/og-image.png"],
    creator: "@habitflow",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${ebGaramond.variable} ${sourceSerif.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
