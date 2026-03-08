import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "LaunchKit Bags",
  description: "Standalone Bags-native launch studio for turning outreach into approved launch kits.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
