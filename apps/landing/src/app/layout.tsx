import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CloudDory — Find What Your Cloud Is Hiding",
  description: "CloudDory uses AI to surface hidden costs, wasteful spend, and optimization opportunities across AWS, GCP, and Azure.",
  keywords: ["cloud cost optimization", "FinOps", "AWS", "GCP", "Azure", "cost management"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}
