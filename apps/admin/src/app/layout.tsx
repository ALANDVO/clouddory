import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CloudDory Admin",
  description: "CloudDory Super Admin Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#050816]">
        {children}
      </body>
    </html>
  );
}
