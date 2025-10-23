import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/app/components/Provider";
import ThemeProvider from "@/app/components/ThemeProvider";
import ThemeSwitcher from "@/app/components/ThemeSwitcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Earlier or Later - Historical Events Game",
  description: "Test your knowledge of history! Guess which historical event, birth, or death happened earlier in this fun and educational game.",
  keywords: ["history game", "historical events", "trivia", "educational game", "timeline game", "history quiz"],
  authors: [{ name: "Earlier or Later" }],
  creator: "Earlier or Later",
  publisher: "Earlier or Later",
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Earlier or Later - Historical Events Game",
    description: "Test your knowledge of history! Guess which historical event, birth, or death happened earlier.",
    siteName: "Earlier or Later",
  
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Earlier or Later - Historical Events Game",
    description: "Test your knowledge of history! Guess which historical event happened earlier.",
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
  
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
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
        <ThemeProvider>
          <Providers>{children}</Providers>
          <ThemeSwitcher />
        </ThemeProvider>
      </body>
    </html>
  );
}
