import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@xyflow/react/dist/style.css";
import "./globals.css";
import { ThemeProvider } from "./theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ScaleCraft",
  description: "An interactive system architecture laboratory.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* h-full (a hard cap), not min-h-full (a floor): this is a fixed-
       * viewport app shell, not a scrolling document — every mode page's
       * flex-1/overflow-hidden/overflow-y-auto region below body only ever
       * gets a truly bounded height to clip or scroll against if body
       * itself is capped at the viewport instead of growing past it when
       * content wants to be taller. min-h-full let body (and everything
       * under it) balloon to content size with nothing ever engaging
       * overflow, so the whole document scrolled instead of, e.g., the
       * component palette scrolling internally. overflow-hidden is the
       * backstop: nothing under body should ever produce a page-level
       * scrollbar. */}
      <body className="flex h-full flex-col overflow-hidden">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} themes={["dark", "light"]}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
