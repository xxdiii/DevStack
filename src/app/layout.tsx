import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
import { cn } from "@/lib/utils";
import Header from "./components/Header";
export const metadata: Metadata = {
  title: "RiverFlow",
  description: "Created by Aadithya Suresh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "min-h-screen bg-linear-to-br from-black via-gray-900 to-white text-white")}>
        <Header />
        {children}</body>
    </html>
  );
}