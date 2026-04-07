import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POS Inventario",
  description: "Sistema POS con inventario en Supabase",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
