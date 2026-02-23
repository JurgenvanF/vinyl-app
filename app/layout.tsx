"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider } from "../lib/LanguageContext";
import TopNav from "./components/topnav/TopNav";
import { usePathname } from "next/navigation";
import "./styles/main.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideTopNav = pathname === "/";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          {!hideTopNav && <TopNav />}
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
