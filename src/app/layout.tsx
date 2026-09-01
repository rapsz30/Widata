import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WIDATA — Sistem Pencatatan Digital Widodomartani",
  description:
    "Sistem Pencatatan Data Digital Kalurahan Widodomartani, Ngemplak, Sleman",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
