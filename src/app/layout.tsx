import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Operator Training",
  description: "AI Native Operator coaching platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
