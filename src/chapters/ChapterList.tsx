"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ChapterDefinition } from "@/content/chapters/types";

type ChapterListProps = {
  chapters: ChapterDefinition[];
  onSelect: (id: string) => void;
};

/**
 * View 1 of ChapterSidebar. Chapters sharing a `group` render under one
 * expandable/collapsible section; with no `group` declared anywhere in
 * `chapters` (today's dummy content, see src/content/chapters/index.ts),
 * renders as a flat list. Placeholder chapters (ChapterDefinition.placeholder)
 * render muted with a "Draft" badge, and a caption below the whole list
 * flags that more real content is coming — without this, a single dummy
 * entry reads as finished curriculum, indistinguishable from a bug (see the
 * 2026-07-24 critique's P1 finding).
 */
export function ChapterList({ chapters, onSelect }: ChapterListProps) {
  const hasGroups = chapters.some((c) => c.group);
  const hasPlaceholder = chapters.some((c) => c.placeholder);

  if (!hasGroups) {
    return (
      <div className="flex flex-col gap-1 p-3">
        <ul className="flex flex-col gap-1">
          {chapters.map((c) => (
            <ChapterRow key={c.id} chapter={c} onSelect={onSelect} />
          ))}
        </ul>
        {hasPlaceholder && <PlaceholderCaption />}
      </div>
    );
  }

  const groupOrder: string[] = [];
  const byGroup = new Map<string, ChapterDefinition[]>();
  for (const c of chapters) {
    const key = c.group ?? "";
    if (!byGroup.has(key)) {
      byGroup.set(key, []);
      groupOrder.push(key);
    }
    byGroup.get(key)?.push(c);
  }

  return (
    <div className="flex flex-col gap-1 p-3">
      {groupOrder.map((group) => (
        <ChapterGroupSection
          key={group || "ungrouped"}
          label={group || "Ungrouped"}
          chapters={byGroup.get(group) ?? []}
          onSelect={onSelect}
        />
      ))}
      {hasPlaceholder && <PlaceholderCaption />}
    </div>
  );
}

function PlaceholderCaption() {
  return (
    <p className="px-2.5 pt-2 text-xs text-foreground/50">
      Placeholder content — real chapters are coming soon.
    </p>
  );
}

function ChapterGroupSection({
  label,
  chapters,
  onSelect,
}: {
  label: string;
  chapters: ChapterDefinition[];
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-xs font-semibold tracking-wide text-foreground/60 uppercase hover:bg-border/60"
      >
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {label}
      </button>
      {expanded && (
        <ul className="flex flex-col gap-1 py-1 pl-2">
          {chapters.map((c) => (
            <ChapterRow key={c.id} chapter={c} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ChapterRow({ chapter, onSelect }: { chapter: ChapterDefinition; onSelect: (id: string) => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(chapter.id)}
        className={`flex w-full items-center gap-2 rounded-md border border-transparent px-2.5 py-2 text-left text-sm hover:border-border hover:bg-border/40 ${
          chapter.placeholder ? "text-foreground/60" : ""
        }`}
      >
        <span className="truncate">{chapter.title}</span>
        {chapter.placeholder && (
          <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-foreground/50 uppercase">
            Draft
          </span>
        )}
      </button>
    </li>
  );
}
