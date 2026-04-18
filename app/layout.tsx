import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeModeScript } from "@/components/theme/theme-mode-script";
import { ThemeModeSync } from "@/components/theme/theme-mode-sync";
import { PwaRegister } from "./pwa-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MongCount · 쉼일지",
  description: "멍때리기는 뇌를 위한 운동이에요. 하루 몇 분, 기록하면 달라져요.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      data-theme="light"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground font-sans transition-colors duration-1000">
        <ThemeModeScript />
        <ThemeModeSync />
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
