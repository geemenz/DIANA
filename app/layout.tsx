import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tally Form Builder MVP",
  description: "Empty state and new form screen prototype",
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
