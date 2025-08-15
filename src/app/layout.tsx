import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import SiteHeader from "@/components/SiteHeader";

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
      <body className="antialiased">
        <AuthProvider>
          <SiteHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
