import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NextStepDoctor AI — Medical Research Assistant",
  description:
    "Transparent, explainable AI-powered medical research platform with multi-source retrieval, clinical trials, and analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#0b0f1a] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
