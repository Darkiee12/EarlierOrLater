import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/utils/Provider";
import ThemeProvider from "@/components/theme/ThemeProvider";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import Navbar from "@/components/general/Navbar";
import Footer from "@/components/general/footer";
import { SITE_URL, BRAND_NAME, DEFAULT_TITLE, DEFAULT_DESCRIPTION } from "@/common/constants";

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  keywords: ["history game", "historical events", "trivia", "educational game", "timeline game", "history quiz", "history timeline", "daily history", "wikipedia events", "on this day"],
  authors: [{ name: BRAND_NAME }],
  creator: BRAND_NAME,
  publisher: BRAND_NAME,
  
  alternates: {
    canonical: '/',
  },
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    siteName: BRAND_NAME,
  
  },
  
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
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
          <Providers>
            <div className="font-sans flex flex-col h-screen max-h-screen overflow-hidden">
              <header className="flex-shrink-0 flex-grow-0">
                <Navbar />
              </header>
              {children}
              <footer className="flex-shrink-0 flex-grow-0 flex flex-wrap items-center justify-center py-2 text-sm">
                <Footer />
              </footer>
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
