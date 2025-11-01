import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AnalyticsProvider } from "@/components/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smakowało - Zdrowe zestawy posiłków dla zapracowanych",
  description:
    "Zdrowe jedzenie, twój sposób. Zestawy posiłków dla zapracowanych z 8 opcjami diet do wyboru każdego tygodnia. Wysokiej jakości, świeże składniki, łatwe przygotowanie. Keto, wegańskie, wegetariańskie i więcej.",
  keywords: [
    "zdrowe jedzenie",
    "catering dietetyczny",
    "zestawy posiłków",
    "dieta pudełkowa",
    "zdrowa dieta",
    "posiłki dla zapracowanych",
    "meal prep",
    "keto",
    "wegetariańskie",
    "wegańskie",
    "dostawa jedzenia",
    "świeże składniki"
  ],
  authors: [{ name: "Smakowało" }],
  creator: "Smakowało",
  publisher: "Smakowało",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: (() => {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://smakowalo.pl'
      // Validate URL before creating
      if (siteUrl && (siteUrl.startsWith('http://') || siteUrl.startsWith('https://'))) {
        return new URL(siteUrl)
      }
      return new URL('https://smakowalo.pl')
    } catch (error) {
      console.warn('Failed to create metadataBase URL, using fallback:', error)
      return new URL('https://smakowalo.pl')
    }
  })(),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Smakowało - Zdrowe zestawy posiłków dla zapracowanych",
    description: "Zdrowe jedzenie, twój sposób. Zestawy posiłków z 8 opcjami diet. Świeże składniki prosto pod Twoje drzwi.",
    url: '/',
    siteName: 'Smakowało',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Smakowało - Zdrowe zestawy posiłków',
      },
    ],
    locale: 'pl_PL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smakowało - Zdrowe zestawy posiłków',
    description: 'Zdrowe jedzenie, twój sposób. Zestawy posiłków z 8 opcjami diet.',
    images: ['/og-image.jpg'],
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        />
      </head>
      <body
        suppressHydrationWarning
        className="antialiased"
        style={{
          "--smakowalo-green-primary": "#74a53d",
          "--smakowalo-green-dark": "#34483c",
          "--smakowalo-green-light": "#e8f0df",
          "--smakowalo-cream": "#f8f6f0",
          "--smakowalo-brown": "#8c6e4a",
          "--smakowalo-brown-dark": "#6d5639",
          "--smakowalo-brown-light": "#f2eee6",
        } as React.CSSProperties}
      >
        <AnalyticsProvider>
          <ErrorBoundary>
            <ClientBody>{children}</ClientBody>
          </ErrorBoundary>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
