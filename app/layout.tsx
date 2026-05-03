import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import AppClientWrapper from "../components/AppClientWrapper";
import Providers from "../components/Providers";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "EstateFlow",
  description: "EstateFlow A produt by VertexNirvana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable}`}
    >
      <body className="antialiased">
        <Providers>
          <AppClientWrapper>{children}</AppClientWrapper>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}