"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@clerk/nextjs";
import { Bug } from "lucide-react";
import { Tooltip } from "@/app/Tooltip";
import { fetchUnreadBugCount } from "./client";
import { setUnreadBugCount, useUnreadBugCount } from "./unread-badge-store";

// The modal pulls in the form, the list, and the details view - none of which
// matter until someone clicks. Loaded on open, the same posture as the
// Chapter Reader's renderers.
const ReportBugModal = dynamic(() => import("./ReportBugModal").then((m) => m.ReportBugModal));

/** Two digits is the whole budget in a 8x8 control - past that the badge
 *  stops being a number and starts being "a lot", which is all a reporter
 *  needs to decide to open the modal. */
const BADGE_MAX = 9;

/**
 * The one Report a Bug trigger, placed in each page's own header rather than
 * mounted globally - every host already has a control strip with its own
 * spacing, and a floating widget would read as bolted on.
 *
 * Icon-only with a hover tooltip, matching ThemeToggle/ShortcutsButton and
 * every other 8x8 header control. It sits next to the primary learning and
 * design controls, so it stays at `text-foreground/70` and never competes
 * with them.
 *
 * The red badge is the one exception to "motion and color communicate state
 * only, never reward": it is not a score, it is unread mail - a status change
 * the author made to a report this user filed, which they would otherwise
 * only find by opening the modal on the off chance.
 */
export function ReportBugButton() {
  const { isLoaded, isSignedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const unread = useUnreadBugCount();

  // Fetched once per mount, not polled: the author answers a report in hours
  // or days, so a live subscription would be a websocket for something a page
  // load already catches. Opening the modal refreshes it from the list.
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const controller = new AbortController();
    fetchUnreadBugCount(controller.signal)
      .then(setUnreadBugCount)
      // Silent: the badge is an extra, and an error toast about failing to
      // check for bug updates is noise on every page the check runs on.
      .catch(() => {});
    return () => controller.abort();
  }, [isLoaded, isSignedIn]);

  const badge = unread && unread > 0 ? unread : null;
  const label = badge ? `Report a bug (${badge} update${badge === 1 ? "" : "s"})` : "Report a bug";

  return (
    <>
      <Tooltip label={label}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={label}
          aria-haspopup="dialog"
          className="relative flex h-8 w-8 items-center justify-center rounded-md border border-border bg-panel text-foreground/70 transition-colors duration-150 ease-out hover:text-foreground"
        >
          <Bug size={16} />
          {badge && (
            // Overlaps the button's own border rather than sitting inside it -
            // the icon owns the 8x8 box, and shrinking it to make room would
            // put this control out of step with the rest of the header strip.
            <span
              aria-hidden="true"
              className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-state-error px-1 text-[10px] leading-none font-semibold text-white"
            >
              {badge > BADGE_MAX ? `${BADGE_MAX}+` : badge}
            </span>
          )}
        </button>
      </Tooltip>
      {open && <ReportBugModal onClose={() => setOpen(false)} />}
    </>
  );
}
