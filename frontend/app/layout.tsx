import type { Metadata } from "next";

import { AppShellHeader } from "@/components/app-shell-header";
import { ScrollIndicator } from "@/components/scroll-indicator";
import { ThemeProvider } from "@/components/theme-provider";

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
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="mx-auto min-h-screen max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
            <AppShellHeader />
            {children}
          </div>
          <ScrollIndicator />
        </ThemeProvider>
      </body>
    </html>
  );
}
