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

/**
 * "View all activity" has no page of its own yet (Home derives its list from
 * current-state timestamps, not an event log - see home-data.ts). The
 * Building Blocks Learning Path is the closest real surface: it shows
 * per-chapter status for the whole course. Point this at a dedicated
 * /activity route once one exists.
 */
export const ALL_ACTIVITY_HREF = "/building-blocks";
