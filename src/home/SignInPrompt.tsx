import Link from "next/link";
import { LogIn } from "lucide-react";

/** One prompt centred over both skeleton stat cards, rather than one per card. */
export function SignInPrompt() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
      <div className="pointer-events-auto flex max-w-sm flex-col items-center gap-3 rounded-lg border border-border bg-panel px-6 py-5 text-center shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold">Sign in to track your progress</p>
          <p className="text-xs leading-relaxed text-foreground/60">
            Chapters, checkpoints, streaks and recent activity sync to your account.
          </p>
        </div>
        <Link
          href={`/sign-in?redirect_url=${encodeURIComponent("/")}`}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-panel px-4 text-sm font-medium text-foreground/80 transition-colors duration-150 ease-out hover:border-foreground/25 hover:text-foreground"
        >
          <LogIn size={14} aria-hidden="true" />
          Sign in
        </Link>
      </div>
    </div>
  );
}
