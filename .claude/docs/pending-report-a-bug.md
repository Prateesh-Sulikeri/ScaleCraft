# Report a Bug (RAB)

Status: **Built on `feature/report-a-bug` (cut from
`release/v7.1.0-progress-reset`), 2026-08-19. Uncommitted.** Migrations
`0005_rainy_franklin_richards` and `0006_serious_jocasta` (closing notes +
unread tracking) are both applied to Neon. CI green except one
pre-existing failure (`src/content/chapters/index.test.ts`, from the
uncommitted `bb-2-1` chapter in the same tree - unrelated).

## Data model

Two tables in `src/db/schema.ts`, cloud-only - deliberately **not** Dexie
mirrors like everything else there. A bug report is a message to the author,
not learner state: nothing to work offline, nothing to reconcile.

- `bug_reports` - category, title, description, priority, status, `imageRef`,
  plus `pagePath`/`appVersion` captured at submit, `closingNotes`, and
  `seenStatus`.
- `bug_report_images` - the current image backing store, separate so a list
  query physically cannot drag image bytes along.

`category`/`priority`/`status` are **plain text**, validated by zod enums in
`src/bugs/types.ts`. Adding a category is a one-line TS edit, no migration.
That is the whole extensibility mechanism - don't convert them to pg enums.

## Closing notes and the unread badge (migration 0006)

Both features exist to answer "what happened to my report?" without the
reporter having to go looking.

- `closingNotes` is author-written prose, null until triage. The details view
  renders the whole block only when it is set - an empty "Closing notes"
  heading poses the question without answering it. It sits **above** the
  description: it is the new information, and the reporter already knows what
  they typed.
- `seenStatus` is the status the reporter last looked at. Unread is
  `seenStatus <> status`, **not** a timestamp comparison, and that is the
  point: triage stays a plain `UPDATE bug_reports SET status = ...,
  closing_notes = ...` with no bookkeeping column an author has to remember
  to touch for the badge to light up. New reports insert `seenStatus = 'open'`,
  so a bug is never an unread update about itself.

`GET /api/bugs/unread-count` is the badge number and nothing else - every
mounted button hits it on page load, where the full list would be an unused
payload. `POST /api/bugs/[id]/seen` copies `status` into `seenStatus` and
returns the remaining count, so the client never decrements locally and drifts.
It is a POST because a GET must stay safe for a prefetch or a re-render to
repeat. It deliberately does not bump `updatedAt` - the reporter looking is not
the report changing.

`src/bugs/unread-badge-store.ts` is a module-level `useSyncExternalStore`, not
a context: the buttons sit in five unrelated page headers whose only common
ancestor is the root layout, and a provider there would re-render the app on a
count change. It also lets the modal's list (a fresher source) correct the
badge, including downward when another device already read the update.

## Two dots, two jobs

The list row leads with a **StatusDot** - the identifier: yellow
(`state-warning`) while a report is in any state but closed, gray once it is
closed. Two colors rather than four; the status chip already spells out which
of the four states it is in, and the dot answers the coarser scanning question.
Yellow rather than green-for-active because an open report is outstanding work
and green would read as "done" on exactly the reports that are not.

The row **trails** with an UnreadDot, in the same `state-error` red as the
button badge, only when that report's status moved since it was last opened.
Opposite ends on purpose: one describes the report, the other is a call to
action. The red badge is the deliberate exception to "no scoring theatrics" -
it is unread mail, not a reward.

## Image storage seam

`src/bugs/image-storage.ts` is the **only** module that reads or writes
`imageRef`. Nothing else parses it. Today a ref is `db:<uuid>` into
`bug_report_images`; swapping to Vercel Blob means minting `blob:<url>` refs in
`putBugImage` and teaching `getBugImage` the prefix. No route contract, no
client code, and no bug record changes. Keep it that way.

## API

`GET/POST /api/bugs`, `GET /api/bugs/[id]`, `GET /api/bugs/[id]/image`,
`GET /api/bugs/unread-count`, `POST /api/bugs/[id]/seen`. Uses the
existing `requireUserId` + zod convention (not `/api/sync/*` - no Dexie table,
no merge semantics). **Ownership is in the `WHERE` clause**, never a post-fetch
check, so another user's id returns a plain 404 rather than confirming the row
exists. `userId` and `status` are absent from the create schema by design.

## Frontend

One `ReportBugButton` (icon-only, tooltip, modal lazy-loaded on click). Placed
**left of the theme toggle**: Home header, Chapter Reader, exam shell, Design
Editor header, focus-mode bar. Learning Path puts it next to Reset progress.
`ReportBugModal` owns the whole state machine (loading / empty / list / details
/ form / submitting / success / error / signed-out).

Submit prepends the created bug from the POST response - no refetch, no refresh.
A failed submit never unmounts the form, so nothing typed is lost.

## Two app-wide changes this pulled in

**1. `CenteredModal` now portals to `document.body`.** `position: fixed`
resolves against the nearest ancestor with a transform/filter/backdrop-filter,
not the viewport - and two of those are everywhere here: `HomeHeader`'s
`backdrop-blur` bar and `PageEnter`'s `page-enter` animation, whose `both` fill
leaves a transform applied permanently. A modal opened from the Home header
centred itself in a ~50px strip with its backdrop trapped there too, leaving
nothing to click to dismiss. Portaling fixes the class of bug for all seven
consumers. It also gained `role="dialog"`/`aria-modal`, which it lacked.

**2. Escape closes every modal**, via `src/lib/use-escape-key.ts`. Wired into
`CenteredModal` (covers all seven) plus the four hand-rolled dialogs:
`CreateComponentModal`, `DeepCheckPanel`, `AuthPromptDialog`,
`ExamConfirmSubmitDialog`. Two non-obvious properties, both pinned by tests:

- It keeps a **stack** - only the topmost surface closes. The exam shell and its
  confirm-submit dialog both listened on `window`, so one press would have
  dismissed the confirmation *and* exited the exam.
- Registration is **once per mount, off a ref**. Callers pass inline arrows;
  re-registering per render would push a parent's handler above an already-open
  child's and silently invert the stack.

## Draft persistence

Closing the modal mid-report no longer costs the report. `draft-storage.ts`
mirrors category/title/description/priority into `localStorage` under
`sc-bug-draft` on every keystroke, `BugForm` restores it as the fields'
**initial state** (a `useState` initializer, not an effect - an effect paints
an empty form for a frame and races a fast typist), and `ReportBugModal` opens
straight into the form when a draft exists rather than the list.

The trigger for this was the obvious one: you close the modal to go take the
screenshot the report is about. That is the normal way to write one of these,
not an edge case.

- localStorage, not sessionStorage: "step away" can include closing the tab.
- The attached image is **not** persisted - a `File` is not serialisable, and
  it is the part the user usually left to go fetch anyway.
- Clearing is explicit only: submit, Cancel (the deliberate "not filing
  this"), or the Discard button on the restored-draft notice. Closing,
  Escape, and the backdrop all keep it.
- A draft with no title *and* no description is not a draft - otherwise every
  form that was opened and closed leaves one behind and hijacks the next open.
- Unknown category/priority values decode to the defaults, so a draft written
  before a category was renamed cannot put an unselectable value in a
  `<select>`.

## Screenshot input

`src/bugs/image-input.ts` holds the accept rules as pure functions, shared by
all three entry points (picker, drop, paste). `ImageAttachField` wires them up.

- **Paste listens on `window`**, not the field - a snip is followed by Ctrl+V,
  not by clicking into a box first. A clipboard with no image is left untouched
  so text pastes still land normally.
- Drag highlight is **depth-counted**, not a boolean: dragging over a child
  fires `dragleave` on the parent and would flicker the highlight off.
- A window-level `dragover`/`drop` swallower runs for the life of the form.
  Without it, missing the zone drops the file on the page and the browser
  navigates the tab to it, discarding a half-written report.

## Not built

No admin/triage UI - `status` and `closingNotes` are both moved by hand
(`UPDATE bug_reports SET status = 'resolved', closing_notes = '...' WHERE
id = ...`), which the `seenStatus` design makes sufficient: that one statement
is also what raises the reporter's badge. No edit or delete of a submitted
report. The badge is fetched once per mount rather than polled or pushed - the
author answers in hours or days, so a page load catches it.
