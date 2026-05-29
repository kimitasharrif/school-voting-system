import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "School Voting System",
  description: "Secure online school voting system",
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