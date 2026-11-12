import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "HardWareTrack — Hardware Inventory & POS System",
  description: "Role-based hardware inventory management and point-of-sale system.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
