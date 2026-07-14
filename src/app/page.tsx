import { ThemeToggle } from "@/app/ThemeToggle";
import { HomeCanvas } from "@/app/HomeCanvas";

// The mode-select landing page (milestone 4, .claude/docs/MILESTONES.md).
// The ScaleCraft mark + "choose a mode" heading live inside HomeCanvas's own
// node list (see HomeTitleNode.tsx) rather than as HTML overlaid on top of
// it — that's what keeps the heading and the mode row centered together as
// one composition under fitView, instead of two independently-positioned
// things. Ships as a skeleton on purpose: Sandbox is the only real
// destination until Building Blocks/RWE (7, 8) exist, and status badges are
// static placeholders until persistence (9) makes them reflect real
// per-chapter progress.
export default function RootPage() {
  return (
    <main className="relative min-h-0 flex-1 overflow-hidden">
      <div className="absolute inset-0">
        <HomeCanvas />
      </div>

      <div className="absolute right-6 top-6 z-10">
        <ThemeToggle />
      </div>
    </main>
  );
}
