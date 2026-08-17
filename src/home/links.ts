/**
 * Every destination Home's header and footer point at, in one place - so an
 * area that is still upcoming is declared once rather than re-decided per
 * call site, and flipping it live is a one-line change here.
 *
 * `upcoming: true` renders as a visibly unavailable product area (a "Soon"
 * chip, not a link) instead of a link that 404s.
 */
export type HomeNavItem = {
  label: string;
  /** Omitted while `upcoming` - there is nothing to navigate to yet. */
  href?: string;
  upcoming?: true;
};

/** No "Home" entry: the brand lockup immediately to its left is already the
 *  link home, so a Home tab beside it was two controls for one destination. */
export const HOME_NAV: readonly HomeNavItem[] = [
  { label: "ScaleDocs", upcoming: true },
  { label: "Roadmap", upcoming: true },
];

/** Bug reporting is its own flow, not the footer's general feedback survey -
 *  a report needs reproduction steps, the board that broke, and a version, and
 *  none of that belongs in a four-question survey. Declared upcoming until
 *  that flow exists, rather than pointing the header at the survey and calling
 *  it done. */
export const REPORT_A_BUG: HomeNavItem = { label: "Report a Bug", upcoming: true };

/* No ALL_ACTIVITY_HREF here anymore: "View all activity" used to point at the
 * Building Blocks Learning Path, which answered a different question than the
 * label asked. It now opens AllActivityModal.tsx instead - the list is derived
 * client-side, so there is nothing for a route to serve. */
