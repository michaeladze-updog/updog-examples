import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Updog Next.js Example",
  description: "Updog data importer in Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
