import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SDLCFlow — AI-Powered Software Development Life Cycle",
  description:
    "Give us your requirement document, and our AI walks you through every phase of the SDLC with your approval at each step.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
