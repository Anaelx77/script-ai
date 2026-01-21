import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Script AI",
  description: "Gere roteiros e imagens com IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" />
        <link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" />
        <title>Script AI</title>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="app-header">
          <div className="brand">
            <i className="bx bx-movie-play logo" aria-hidden style={{ fontSize: '1.95rem' }} />
            <div>
              <div>Script AI</div>
              <div className="muted" style={{ fontSize: '0.90rem' }}>Roteiros & Imagens</div>
            </div>
          </div>
        </header>

        <main className="container" style={{ paddingTop: 24 }}>
          {children}
        </main>

        <footer className="app-footer">
          <div className="container muted">🎬  — Script AI • {new Date().getFullYear()}</div>
        </footer>
      </body>
    </html>
  );
}
