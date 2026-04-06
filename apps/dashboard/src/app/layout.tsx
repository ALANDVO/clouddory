import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CloudDory Dashboard",
  description: "Find what your cloud is hiding — AI-powered cloud cost optimization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-navy-950">
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}
