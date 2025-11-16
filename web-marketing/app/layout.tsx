import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Display font - bold, expressive headlines
const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Body font - clean, readable
const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

// Mono font - code and special elements
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://habitflow.app'),
  title: {
    default: "HabitFlow - Build Better Habits, One Day at a Time",
    template: "%s | HabitFlow"
  },
  description: "The habit tracker that celebrates your wins. Build streaks, track progress, and transform your life with AI-powered insights. Start building better habits today.",
  keywords: ["habit tracker", "habits", "productivity", "streaks", "self improvement", "goal tracking", "daily habits", "routine tracker"],
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
    title: "HabitFlow - Build Better Habits, One Day at a Time",
    description: "The habit tracker that celebrates your wins. Build streaks, track progress, and transform your life.",
    siteName: "HabitFlow",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HabitFlow - Habit Tracker App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HabitFlow - Build Better Habits, One Day at a Time",
    description: "The habit tracker that celebrates your wins. Build streaks, track progress, and transform your life.",
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
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetBrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
