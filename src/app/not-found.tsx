import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="font-mono text-sm text-foreground/50">404</p>
      <h1 className="text-lg font-semibold text-foreground">This page doesn&apos;t exist</h1>
      <p className="max-w-sm text-sm text-foreground/70">
        The page you&apos;re looking for was moved, renamed, or never existed.
      </p>
      <Link
        href="/"
        className="mt-2 flex items-center gap-1.5 rounded-md border border-border bg-panel px-3 py-1.5 text-sm font-medium text-foreground/70 hover:text-foreground"
      >
        <Compass className="h-3.5 w-3.5" />
        Back to Home
      </Link>
    </main>
  );
}
