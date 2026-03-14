import Link from "next/link";
import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Sentinel Fraud Console",
  description:
    "Real-time fraud intelligence combining live streaming detection, behavioral identity, and network risk.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto min-h-screen max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
          <header className="mb-6 flex flex-col gap-4 rounded-[26px] border border-line/55 bg-surface/88 px-5 py-4 shadow-frame backdrop-blur lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">
                Fraud analyst workspace
              </p>
              <Link href="/" className="mt-2 block font-serif text-[2.2rem] text-ink">
                Sentinel
              </Link>
            </div>
            <nav className="flex flex-wrap items-center gap-3 text-sm text-muted">
              <Link
                className="rounded-full border border-line bg-canvas/70 px-4 py-2 hover:bg-paper"
                href="/"
              >
                Queue
              </Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
