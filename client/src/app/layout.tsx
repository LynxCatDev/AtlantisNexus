import type { Metadata } from "next";
import "./globals.scss";

import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Atlantis Nexus",
  description: "A premium media hub for gaming, AI, development, and tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
