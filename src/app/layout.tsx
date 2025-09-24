import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatInterface from "@/components/ChatInterface";
// import AuthSessionProvider from "@/components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digimplant Solutions - Dijital Cerrahi Rehberleri",
  description: "Modern dental implantoloji için dijital cerrahi rehberleri, QR kodlu rapor sistemi ve AI destekli cerrahi asistan. Hekimler için profesyonel çözümler.",
  keywords: "dental implant, cerrahi rehber, dijital implantoloji, QR kod, AI asistan",
  authors: [{ name: "Digimplant Solutions" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <ChatInterface />
      </body>
    </html>
  );
}
