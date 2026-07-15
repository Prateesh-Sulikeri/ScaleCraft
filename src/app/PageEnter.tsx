/**
 * Wraps a mode page's root so it fades/slides smoothly into place on mount
 * instead of popping into view — the visible seam right after the Home ->
 * mode loading transition (see ModeNode.tsx / LoadingTransition.tsx)
 * otherwise ends with the whole page just appearing at once.
 *
 * Shared across every mode page rather than built into Sandbox specifically
 * — Building Blocks and Real World Extraction reuse this exact wrapper once
 * they exist, so nothing here is Sandbox-flavored.
 *
 * Pure CSS animation (`page-enter`, globals.css), not a JS-driven class
 * flip: it plays automatically on initial paint, so it can't pause or get
 * stuck if the tab isn't focused the moment the route swaps in — a
 * `useEffect`-gated reveal is exactly the pattern that risks that.
 */
export function PageEnter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col motion-safe:animate-[page-enter_450ms_cubic-bezier(0.16,1,0.3,1)_both] motion-reduce:opacity-100">
      {children}
    </div>
  );
}
