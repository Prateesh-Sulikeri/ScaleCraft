"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Check, Loader2 } from "lucide-react";
import { CenteredModal } from "@/app/CenteredModal";
import { BugDetailsView } from "./BugDetailsView";
import { BugEmptyState } from "./BugEmptyState";
import { BugForm } from "./BugForm";
import { BugList } from "./BugList";
import { fetchBugs } from "./client";
import { loadBugDraft } from "./draft-storage";
import { setUnreadBugCount } from "./unread-badge-store";
import type { BugSummary } from "./types";

/** Which of the modal's views is showing. The list is not a view of its own -
 *  it is `browsing` plus whether `bugs` is empty, so the empty state and the
 *  list can never disagree about what the user has. */
type View = { kind: "browsing" } | { kind: "form" } | { kind: "details"; id: string };

type LoadState = { kind: "loading" } | { kind: "ready" } | { kind: "error"; message: string };

/**
 * The whole Report a Bug experience behind one trigger. Every placement
 * renders this same component, so opening it from the Design Editor and from
 * the Learning Path are the same modal in the same state machine.
 *
 * Opening asks whether the user has reported anything - "do I have bugs?" is
 * the question the initial view answers, and only then does it branch to the
 * empty state or the list. The one exception is an unsent draft, which opens
 * straight back into the form.
 */
export function ReportBugModal({ onClose }: { onClose: () => void }) {
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();

  // An unsent report outranks the list on open: someone who closed the modal
  // mid-report (to go take the screenshot) came back to finish it, not to
  // browse. Read lazily, once - the form itself restores the values.
  const [view, setView] = useState<View>(() =>
    loadBugDraft() ? { kind: "form" } : { kind: "browsing" },
  );
  const [bugs, setBugs] = useState<BugSummary[]>([]);
  const [load, setLoad] = useState<LoadState>({ kind: "loading" });
  // Cleared on the next navigation within the modal - it confirms the submit
  // that just happened, and stops being true once the user moves on.
  const [justSubmitted, setJustSubmitted] = useState(false);

  // Two things keep the mount effect below from being a cascading render:
  // this never sets `loading` itself (`load` already starts there, and the
  // retry handler sets it explicitly - that is an event, not an effect), and
  // every setState lands in a promise callback rather than the body.
  const loadBugs = useCallback(
    (signal?: AbortSignal) =>
      fetchBugs(signal)
        .then((next) => {
          if (signal?.aborted) return;
          setBugs(next);
          setLoad({ kind: "ready" });
          // The list is a fresher source of the badge number than the button's
          // own poll, so opening the modal also corrects it - including
          // downward, when another device already read the update.
          setUnreadBugCount(next.filter((b) => b.unread).length);
        })
        .catch((err: unknown) => {
          if (signal?.aborted) return;
          setLoad({ kind: "error", message: err instanceof Error ? err.message : "Could not load your reports." });
        }),
    [],
  );

  const retry = () => {
    setLoad({ kind: "loading" });
    void loadBugs();
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const controller = new AbortController();
    void loadBugs(controller.signal);
    return () => controller.abort();
  }, [isLoaded, isSignedIn, loadBugs]);

  const handleSubmitted = (bug: BugSummary) => {
    // Prepended locally rather than refetched: the create response carries the
    // full summary, so the new report is on screen the instant the request
    // returns, with no second round-trip and no page refresh.
    setBugs((current) => [bug, ...current]);
    setLoad({ kind: "ready" });
    setJustSubmitted(true);
    setView({ kind: "browsing" });
  };

  // Stable: BugDetailsView keeps it in an effect dependency list, and a fresh
  // identity every render would refetch the report on every keystroke-driven
  // re-render of this modal.
  const handleSeen = useCallback((id: string) => {
    setBugs((current) => current.map((b) => (b.id === id ? { ...b, unread: false } : b)));
  }, []);

  const goTo = (next: View) => {
    setJustSubmitted(false);
    setView(next);
  };

  const body = () => {
    if (!isLoaded) {
      return <LoadingRow label="Loading…" />;
    }

    // Bugs are per-account, so there is nothing to show without one. An
    // invitation to sign in, not a wall - same posture as AppUserButton.
    if (!isSignedIn) {
      return (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">Sign in to report a bug</p>
          <p className="max-w-xs text-sm leading-relaxed text-foreground/55">
            Reports are tied to your account so you can follow what happened to them.
          </p>
          <Link
            href={`/sign-in?redirect_url=${encodeURIComponent(pathname)}`}
            className="mt-1 rounded-md border border-border bg-panel px-3 py-1.5 text-sm font-medium text-foreground/80 transition-colors duration-150 ease-out hover:border-foreground/25 hover:text-foreground"
          >
            Sign in
          </Link>
        </div>
      );
    }

    if (view.kind === "form") {
      return <BugForm onSubmitted={handleSubmitted} onCancel={() => goTo({ kind: "browsing" })} />;
    }

    if (view.kind === "details") {
      return (
        <BugDetailsView
          key={view.id}
          bugId={view.id}
          onBack={() => goTo({ kind: "browsing" })}
          onSeen={handleSeen}
        />
      );
    }

    if (load.kind === "loading") {
      return <LoadingRow label="Loading your reports…" />;
    }

    if (load.kind === "error") {
      return (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <p className="text-sm text-state-error">{load.message}</p>
          <button
            type="button"
            onClick={retry}
            className="rounded-md border border-border bg-panel px-3 py-1.5 text-sm font-medium text-foreground/80 transition-colors duration-150 ease-out hover:border-foreground/25 hover:text-foreground"
          >
            Try again
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {justSubmitted && (
          <p
            role="status"
            className="flex items-center gap-2 rounded-md border border-state-valid/40 bg-state-valid/5 px-3 py-2 text-sm text-state-valid"
          >
            <Check size={14} aria-hidden="true" />
            Report submitted. Thanks - it is on the list below.
          </p>
        )}
        {bugs.length === 0 ? (
          <BugEmptyState onReportNew={() => goTo({ kind: "form" })} />
        ) : (
          <BugList
            bugs={bugs}
            onSelect={(id) => goTo({ kind: "details", id })}
            onReportNew={() => goTo({ kind: "form" })}
          />
        )}
      </div>
    );
  };

  const title = view.kind === "form" ? "Report a bug" : view.kind === "details" ? "Bug report" : "Reported bugs";

  return (
    <CenteredModal title={title} onClose={onClose}>
      {body()}
    </CenteredModal>
  );
}

function LoadingRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-foreground/60">
      <Loader2 size={15} className="animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}
