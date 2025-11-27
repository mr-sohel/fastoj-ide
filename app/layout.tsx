import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FastOJ IDE - Fast C++ Online Judge IDE",
  description: "A fast, lightweight C++ IDE for competitive programming and online judging. Built with Next.js and Monaco Editor.",
  keywords: ["C++", "IDE", "competitive programming", "online judge", "Monaco editor", "coding"],
  authors: [{ name: "FastOJ Team" }],
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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
