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
 * renders as a flat list.
 */
export function ChapterList({ chapters, onSelect }: ChapterListProps) {
  const hasGroups = chapters.some((c) => c.group);

  if (!hasGroups) {
    return (
      <ul className="flex flex-col gap-1 p-3">
        {chapters.map((c) => (
          <ChapterRow key={c.id} chapter={c} onSelect={onSelect} />
        ))}
      </ul>
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
    </div>
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
        className="w-full rounded-md border border-transparent px-2.5 py-2 text-left text-sm hover:border-border hover:bg-border/40"
      >
        {chapter.title}
      </button>
    </li>
  );
}
