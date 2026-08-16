import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@xyflow/react/dist/style.css";
import "./globals.css";
import { ThemeProvider } from "./theme-provider";
import { ScreenSizeGate } from "./ScreenSizeGate";
import { LocalStateGate } from "@/persistence/LocalStateGate";
import { FlushDirtyRows } from "@/persistence/FlushDirtyRows";
import { RefreshFromCloud } from "@/persistence/RefreshFromCloud";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Not auth.protect() — root wraps every route, public and gated alike
  // (release 6.1.0-alpha Phase 11, pending-6.1.0-poa.md). A null userId is
  // the normal signed-out case, not an error to redirect on.
  const { userId } = await auth();
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
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} themes={["dark", "light"]}>
          <ScreenSizeGate>
            <LocalStateGate userId={userId} />
            <FlushDirtyRows />
            <RefreshFromCloud />
            {children}
          </ScreenSizeGate>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}