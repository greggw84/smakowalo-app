import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smakowało - Zdrowe zestawy posiłków",
  description:
    "Zestawy posiłków dla zapracowanych z 8 opcjami diet do wyboru każdego tygodnia. Świeże składniki prosto pod Twoje drzwi.",
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
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
