import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/utils/Provider";
import ThemeProvider from "@/components/theme/ThemeProvider";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://earlierorlater.netlify.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Earlier or Later - Test Your History Knowledge | Timeline Game",
  description: "Challenge yourself with our daily history timeline game! Guess which historical events, births, or deaths happened earlier. Learn history while having fun with events from Wikipedia.",
  keywords: ["history game", "historical events", "trivia", "educational game", "timeline game", "history quiz", "history timeline", "daily history", "wikipedia events", "on this day"],
  authors: [{ name: "Earlier or Later" }],
  creator: "Earlier or Later",
  publisher: "Earlier or Later",
  
  alternates: {
    canonical: '/',
  },
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Earlier or Later - Test Your History Knowledge | Timeline Game",
    description: "Challenge yourself with our daily history timeline game! Guess which historical events, births, or deaths happened earlier.",
    siteName: "Earlier or Later",
  
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Earlier or Later - Test Your History Knowledge",
    description: "Challenge yourself with our daily history timeline game! Guess which historical events happened earlier.",
    creator: "@earlierorlater",
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen overflow-hidden`}
      >
        <GoogleAnalytics />
        <ThemeProvider>
          <Providers>{children}</Providers>
          <ThemeSwitcher />
        </ThemeProvider>
      </body>
    </html>
  );
}
