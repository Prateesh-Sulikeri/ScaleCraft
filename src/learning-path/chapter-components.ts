import { chapterRegistry } from "@/content/chapters";
import { getComponent } from "@/content/components/registry";
import type { ComponentDefinition } from "@/content/components/types";
import { allEntries, getCourse } from "@/curriculum";
import type { CourseId } from "@/curriculum/types";

/**
 * Components to show on each chapter row, by slug: the entry's authored
 * `focusComponentIds` when set, otherwise a derived fallback.
 *
 * Building Blocks palettes are cumulative (each chapter's required list
 * repeats everything before it), so a row shows only what that chapter adds
 * for the first time, in curriculum order. RWE briefs are standalone, so a row
 * shows everything the brief requires. Chapters with nothing (lesson-only, or
 * not yet authored) are absent.
 */
function build(courseId: CourseId): ReadonlyMap<string, readonly ComponentDefinition[]> {
  const required = new Map(chapterRegistry.map((c) => [c.id, c.requiredComponentIds]));
  const seen = new Set<string>();
  const out = new Map<string, ComponentDefinition[]>();

  for (const entry of allEntries(getCourse(courseId))) {
    const ids = entry.chapterDefinitionId ? (required.get(entry.chapterDefinitionId) ?? []) : [];
    const derived = courseId === "building-blocks" ? ids.filter((id) => !seen.has(id)) : ids;
    const shown = entry.focusComponentIds ?? derived;
    ids.forEach((id) => seen.add(id));
    const defs = shown.map(getComponent).filter((d): d is ComponentDefinition => d !== undefined);
    if (defs.length > 0) out.set(entry.slug, defs);
  }
  return out;
}

const byCourse: Partial<Record<CourseId, ReadonlyMap<string, readonly ComponentDefinition[]>>> = {};

export function chapterComponents(courseId: CourseId, slug: string): readonly ComponentDefinition[] {
  byCourse[courseId] ??= build(courseId);
  return byCourse[courseId].get(slug) ?? [];
}
