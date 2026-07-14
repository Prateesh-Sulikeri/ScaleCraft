import { redirect } from "next/navigation";

// No mode-select Home page yet (milestone 4, .claude/docs/MILESTONES.md) —
// Sandbox is the only real destination today, so / forwards there instead of
// duplicating the canvas experience at two routes.
export default function RootPage() {
  redirect("/sandbox");
}
