import type { Metadata } from "next";
import { Playfair_Display, Lora } from "next/font/google";
import "./globals.css";

// Display font - elegant serif for headlines
const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Accent font - italic serif for quotes and emphasis
const lora = Lora({
  variable: "--font-accent",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://habitflow.app'),
  title: {
    default: "HabitFlow - Grow Naturally, Live Intentionally",
    template: "%s | HabitFlow"
  },
  description: "Transform your life through mindful habit building. Track your daily rituals, celebrate growth, and cultivate lasting change - one intentional step at a time.",
  keywords: ["habit tracker", "mindfulness", "personal growth", "daily rituals", "self improvement", "habit formation", "wellness app", "intentional living"],
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
        className={`${playfairDisplay.variable} ${lora.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
