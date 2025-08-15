import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import SiteHeader from "@/components/SiteHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CHILL & TUNE — Hip-Hop & R&B Radio",
  description: "Non-stop Hip-Hop & R&B.",
  openGraph: {
    title: "CHILL & TUNE — Hip-Hop & R&B Radio",
    description: "Non-stop Hip-Hop & R&B.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CHILL & TUNE — Hip-Hop & R&B Radio",
    description: "Non-stop Hip-Hop & R&B.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <SiteHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
