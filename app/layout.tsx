import type { Metadata } from "next";
import "./globals.css";
import { ConditionalNavbar } from "@/components/navbar/conditional-navbar";

export const metadata: Metadata = {
  title: "Apotek-Qu - Sistem Manajemen Apotek",
  description: "Sistem manajemen apotek digital yang modern dan efisien",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ConditionalNavbar />
        <main className="mt-16 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}