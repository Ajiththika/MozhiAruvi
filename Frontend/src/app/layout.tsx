import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MozhiAruvi - Learn Tamil Language & Culture",
  description: "A modern platform for learning Tamil language and culture with interactive lessons and expert teachers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${inter.variable} font-sans antialiased`}
      >
        <Providers>
        {children}
        </Providers>
      </body>
    </html>
  );
}
















