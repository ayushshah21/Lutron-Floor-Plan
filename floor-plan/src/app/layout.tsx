"use client";
import { Inter } from "next/font/google";

// Apply the Inter font
const inter = Inter({ subsets: ["latin"] });

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        {/* You can add a common header or navigation bar here */}
        <main>{children}</main>{" "}
        {/* This will render the content of your pages */}
        {/* Common footer can go here */}
      </body>
    </html>
  );
}
