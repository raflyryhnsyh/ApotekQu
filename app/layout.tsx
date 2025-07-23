import type { Metadata } from "next";
import "./globals.css";
import NavbarPage from "@/components/navbar/navbar";

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
    <html lang="en">
      <body>
        <NavbarPage />
        <main className="mt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
