# Release notes authoring contract

The shape every entry in `src/content/release-notes.ts` follows. Written so a
release note can be produced the same way every time, by anyone, without
re-deciding the format - and so a future session adding a release has a
pattern to copy rather than eighteen prior entries to reverse-engineer.

**The mechanical half of this document is enforced by
`src/content/release-notes.test.ts`.** An entry that breaks a length, count,
casing, or ordering rule fails CI. The judgement half (what earns a highlight,
what a title should say) is not enforceable and is on the author.

Read this before writing an entry. Do not improvise a new field, a new
section, or a longer format for a release that "needs" it - if the format is
genuinely wrong, change this document and the test in their own commit first,
per CLAUDE.md's rule about never authoring around a framework silently.

---

## 1. The shape

```ts
{
  version: "7.0.0-alpha",
  date: "2026-08-17",
  title: "Home knows where you left off.",
  highlights: [
    { title: "Home is a dashboard now", body: "One sentence.", icon: "progress" },
  ],
  qualityOfLife: ["A short clause"],   // optional
}
```

Entries are newest first. `releaseNotes[0]` is the current release - Home's
"New" marker and the About dialog's version badge both read it (see
`src/home/release-info.ts`).

## 2. Field rules

| Field | Rule |
| --- | --- |
| `version` | `MAJOR.MINOR.PATCH-alpha`. Matches `VERSION` / `package.json` for that release. Unique across the list. |
| `date` | `YYYY-MM-DD`, the ship date. Never newer than the entry above it. |
| `title` | 1 line, <= 60 chars, sentence case, ends with a period. |
| `highlights` | 1-4 items, most significant first. |
| `highlights[].title` | <= 42 chars, sentence case, **no** trailing period. |
| `highlights[].body` | One or two sentences, <= 180 chars, ends with a period. |
| `highlights[].icon` | One `ReleaseIconName` (section 5). |
| `qualityOfLife` | Optional. 1-4 items. Omit the field entirely when there are none - never an empty array. |
| `qualityOfLife[]` | One clause, <= 70 chars, sentence case, **no** trailing period. |

## 3. What goes where

Three buckets, and every change lands in exactly one:

- **Title** - the release in one line, from the reader's side. Name what is
  now true for them, not the work that made it true.
  - Good: `"Home knows where you left off."` / `"Validate checks. Submit grades."`
  - Bad: `"Dashboard refactor and progress store migration."` (internal),
    `"Various improvements."` (says nothing).

- **Highlight** - a change that alters what the reader can *do*, or that fixes
  something they would have hit and been blocked by. Four is the ceiling; if a
  release seems to have six, two of them are quality-of-life lines.

- **Quality of life** - everything real but small: a fix they would shrug at,
  a nicety, an internal change with a visible edge. One clause, no build-up.

A change appears in exactly one bucket. Never restate a highlight as a
quality-of-life line.

## 4. Voice

- Second person. "Your progress syncs", not "user progress is synced".
- Present tense for what is now true; past tense only for what was broken.
- Say the outcome before the mechanism. "Chapters open without a blank flash"
  beats "lesson content is now prefetched on hover".
- No release version numbers, file paths, internal component names, or PR
  references in copy. Chapter numbers are fine - they are how a reader finds
  the chapter ("3.4 Load Balancer", "1.1 through 1.6").
- Percentages and counts are welcome when they are real and measured
  ("40-50% faster canvas renders", "1,443 tests across 178 files").
- **Hyphens, never em dashes** (house style, CLAUDE.md). The test checks this.
- No exclamation marks, no "we're excited to", no feature-launch register.
  This is a changelog in a learning tool, not a product announcement.

## 5. Icons

`ReleaseIconName` in `release-notes.ts`; the glyph mapping lives in
`ReleaseNotesModal.tsx`'s `HIGHLIGHT_ICON`. Pick by the area touched:

| Key | Use for |
| --- | --- |
| `ai` | Deep Check and anything model-backed |
| `auth` | Sign-in, accounts, gating |
| `canvas` | The diagram surface, nodes, edges, pan/zoom |
| `component` | The component registry, a new component, cross-cutting product changes |
| `content` | Chapters, lessons, curriculum |
| `docs` | Reference material, glossary, shortcuts, docs panel |
| `fix` | A defect fix that has no better home |
| `hint` | Hints, guided tours, walkthroughs |
| `navigation` | Routing, Learning Path browsing, next/previous |
| `performance` | Speed, bundle size, build time |
| `polish` | Testing, tidying, scope corrections |
| `progress` | Completion tracking, streaks, dashboards |
| `quiz` | Knowledge checks, exams, design exercises |
| `sync` | Cross-device sync, persistence, storage |
| `validation` | The validation engine, Validate/Submit |

Add a key only when nothing above fits - a new key means a new glyph in
`HIGHLIGHT_ICON` and a line in this table, in the same commit.

## 6. Worked example

```ts
{
  version: "6.1.0-alpha",
  date: "2026-08-16",
  title: "Read without an account. Sync across devices.",
  highlights: [
    {
      title: "Reading is public",
      body: "Browse the Learning Path and any lesson signed out. An account is only needed to save progress, take quizzes, or open Sandbox.",
      icon: "auth",
    },
    {
      title: "Progress follows you",
      body: "Progress and custom components sync automatically, and refresh when you switch back to an already-open tab.",
      icon: "sync",
    },
  ],
  qualityOfLife: [
    "Signing out clears progress from the screen immediately",
    "Eleven old chapter links redirect instead of 404ing",
  ],
}
```

## 7. Checklist before committing an entry

1. `version` matches `VERSION`, and the entry is at the top of the array.
2. Title reads as a claim about the reader's experience, under 60 chars.
3. At most four highlights, ordered by significance.
4. Every body is one or two sentences and says the outcome first.
5. Small stuff moved to `qualityOfLife`; nothing appears twice.
6. No em dashes anywhere in the entry.
7. `npx vitest run src/content/release-notes.test.ts` passes.

## 8. What this format deliberately does not have

No per-release artwork. The release dialog draws one summit blueprint for
every version (`src/app/ReleaseIllustration.tsx`) - a bespoke drawing per
release was tried and dropped, because it made every future release owe an
illustration before it could ship.

No categories, tags, or severity labels. Two buckets (highlight,
quality-of-life) carry all the weight a changelog this size needs.
