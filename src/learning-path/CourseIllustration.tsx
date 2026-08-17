import type { ComponentType } from "react";
import { BlueprintCube } from "./BlueprintCube";
import { BlueprintGlobe } from "./BlueprintGlobe";
import type { CourseId } from "@/curriculum/types";

/** One drawing per course, keyed by CourseId so adding a course is a type
 *  error here rather than a silently missing illustration. Building Blocks is
 *  the unit alone (isometric, on a grid); Real World Extraction is a panel
 *  lifted off a wireframe globe (orthographic, on a sphere). Same drafting
 *  conventions, deliberately different forms - see each file's own note. */
const BY_COURSE: Record<CourseId, ComponentType<{ className?: string }>> = {
  "building-blocks": BlueprintCube,
  "real-world-extraction": BlueprintGlobe,
};

export function CourseIllustration({ courseId, className }: { courseId: CourseId; className?: string }) {
  const Illustration = BY_COURSE[courseId];
  return <Illustration className={className} />;
}
